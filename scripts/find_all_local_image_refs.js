const fs = require('fs');
const path = require('path');

function getFiles(dir) {
  let res = [];
  if (!fs.existsSync(dir)) return res;
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) res = res.concat(getFiles(full));
    else if (['.ts', '.tsx', '.js', '.jsx', '.json', '.css'].includes(path.extname(f.name))) res.push(full);
  }
  return res;
}

const manifest = JSON.parse(fs.readFileSync('scratch/cloudinary_upload_manifest.json', 'utf8'));

// Build lookup map for both encoded and decoded paths
const urlMap = new Map();
for (const [k, v] of Object.entries(manifest)) {
  if (v.secure_url) {
    urlMap.set(k, v.secure_url);
    urlMap.set(decodeURIComponent(k), v.secure_url);
  }
}

const allFiles = getFiles(path.join(process.cwd(), 'src'));
const remainingRefs = [];

for (const f of allFiles) {
  const rel = path.relative(process.cwd(), f).replace(/\\/g, '/');
  const lines = fs.readFileSync(f, 'utf8').split('\n');

  lines.forEach((line, idx) => {
    const matches = line.match(/["'`](\/images\/[^"'`]+)["'`]/g);
    if (matches) {
      for (const m of matches) {
        const cleanPath = m.slice(1, -1);
        const cld = urlMap.get(cleanPath) || urlMap.get(decodeURIComponent(cleanPath));
        remainingRefs.push({
          file: rel,
          line: idx + 1,
          path: cleanPath,
          hasCloudinary: !!cld,
          cloudinaryUrl: cld || null,
        });
      }
    }
  });
}

console.log(`Total remaining local image references in src/: ${remainingRefs.length}`);

// Group by file
const byFile = new Map();
for (const r of remainingRefs) {
  if (!byFile.has(r.file)) byFile.set(r.file, []);
  byFile.get(r.file).push(r);
}

for (const [file, refs] of byFile.entries()) {
  console.log(`${file}: ${refs.length} references`);
}

fs.writeFileSync('scratch/remaining_src_image_refs.json', JSON.stringify(remainingRefs, null, 2));
