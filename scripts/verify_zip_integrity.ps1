$backupDir = Join-Path (Get-Location) "data\backups"
$zipPath = Join-Path $backupDir "occasions_images_backup_2026.zip"

Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)

$fileEntries = $zip.Entries | Where-Object { -not $_.FullName.EndsWith("/") -and -not $_.FullName.EndsWith("\") }
$totalEntries = $fileEntries.Count
$totalUncompressed = ($fileEntries | Measure-Object -Property Length -Sum).Sum

Write-Host "ZIP Verification:"
Write-Host "Total file entries in ZIP: $totalEntries"
Write-Host ("Uncompressed size in ZIP: {0:N2} MB" -f ($totalUncompressed / 1MB))

# Test extracting 5 files to a temporary folder to verify readability
$tempTestDir = Join-Path ([System.IO.Path]::GetTempPath()) ("zip_test_" + [System.Guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $tempTestDir -Force | Out-Null

$sampleEntries = $fileEntries | Select-Object -First 5
$extractedCount = 0
foreach ($entry in $sampleEntries) {
    $dest = Join-Path $tempTestDir $entry.Name
    [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $dest, $true)
    if (Test-Path $dest) {
        $extractedCount++
    }
}
Write-Host "Successfully test-extracted sample files: $extractedCount / 5"

Remove-Item -Path $tempTestDir -Recurse -Force -ErrorAction SilentlyContinue

$zip.Dispose()

if ($totalEntries -eq 686 -and $extractedCount -eq 5) {
    Write-Host "VERIFICATION SUCCESS: Exactly 686 valid files present in archive."
    exit 0
} else {
    Write-Error "VERIFICATION FAILED: Expected 686 files, found $totalEntries"
    exit 1
}
