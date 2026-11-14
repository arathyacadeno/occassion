const fs = require('fs');
const path = require('path');

function getFiles(dir) {
  let res = [];
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) res = res.concat(getFiles(full));
    else if (['.ts', '.tsx', '.js', '.jsx', '.json', '.css'].includes(path.extname(f.name))) res.push(full);
  }
  return res;
}

const manifest = JSON.parse(fs.readFileSync('scratch/cloudinary_upload_manifest.json', 'utf8'));
const srcFiles = getFiles(path.join(process.cwd(), 'src'));

const pathUsages = new Map(); // imagePath -> array of { file, line, lineText }

for (const file of srcFiles) {
  const relFile = path.relative(process.cwd(), file).replace(/\\/g, '/');
  const lines = fs.readFileSync(file, 'utf8').split('\n');

  lines.forEach((lineText, idx) => {
    const matches = lineText.match(/["'`](\/images\/[^"'`]+)["'`]/g);
    if (matches) {
      for (const m of matches) {
        const cleanPath = m.slice(1, -1);
        if (!pathUsages.has(cleanPath)) {
          pathUsages.set(cleanPath, []);
        }
        pathUsages.get(cleanPath).push({
          file: relFile,
          line: idx + 1,
          lineText: lineText.trim(),
        });
      }
    }
  });
}

console.log('Total unique /images/ paths referenced in src/:', pathUsages.size);

const results = [];
for (const [imgPath, occurrences] of pathUsages.entries()) {
  const cldEntry = manifest[imgPath] || manifest[decodeURIComponent(imgPath)];
  results.push({
    path: imgPath,
    hasCloudinary: !!cldEntry,
    cloudinaryUrl: cldEntry ? cldEntry.secure_url : null,
    occurrencesCount: occurrences.length,
    files: [...new Set(occurrences.map((o) => o.file))],
  });
}

results.sort((a, b) => b.occurrencesCount - a.occurrencesCount);

fs.writeFileSync('scratch/codebase_image_dependencies.json', JSON.stringify(results, null, 2));

console.log('Categorization:');
const withCld = results.filter((r) => r.hasCloudinary);
const withoutCld = results.filter((r) => !r.hasCloudinary);
console.log(`- Referenced paths with uploaded Cloudinary replacement: ${withCld.length}`);
console.log(`- Referenced paths without Cloudinary replacement: ${withoutCld.length}`);

if (withoutCld.length > 0) {
  console.log('Sample without Cloudinary:', withoutCld.slice(0, 10));
}
