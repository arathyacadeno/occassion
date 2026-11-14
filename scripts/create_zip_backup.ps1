$imagesPath = Join-Path (Get-Location) "public\images"
$backupDir = Join-Path (Get-Location) "data\backups"
$zipPath = Join-Path $backupDir "occasions_images_backup_2026.zip"

if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
}

if (Test-Path $zipPath) {
    Write-Error "Backup zip already exists at $zipPath"
    exit 1
}

Write-Host "Creating ZIP archive from: $imagesPath"
Write-Host "Destination: $zipPath"

Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($imagesPath, $zipPath, [System.IO.Compression.CompressionLevel]::Optimal, $false)

Write-Host "ZIP created successfully."
$zipItem = Get-Item $zipPath
Write-Host ("Size: {0:N2} MB" -f ($zipItem.Length / 1MB))
