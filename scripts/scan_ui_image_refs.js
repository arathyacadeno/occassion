const fs = require('fs');
const path = require('path');

function getFiles(dir) {
  let res = [];
  if (!fs.existsSync(dir)) return res;
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) res = res.concat(getFiles(full));
    else if (['.ts', '.tsx', '.js', '.jsx', '.css'].includes(path.extname(f.name))) res.push(full);
  }
  return res;
}

const files = [
  ...getFiles(path.join(process.cwd(), 'src', 'app')),
  ...getFiles(path.join(process.cwd(), 'src', 'components')),
  ...getFiles(path.join(process.cwd(), 'src', 'context')),
];

const usages = [];
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  const relFile = path.relative(process.cwd(), file).replace(/\\/g, '/');

  lines.forEach((line, idx) => {
    const matches = line.match(/["'`](\/images\/[^"'`]+)["'`]/g);
    if (matches) {
      for (const m of matches) {
        usages.push({
          file: relFile,
          line: idx + 1,
          path: m.slice(1, -1),
        });
      }
    }
  });
}

console.log(`Found ${usages.length} references across active UI & API components.`);
const byPath = {};
for (const u of usages) {
  if (!byPath[u.path]) byPath[u.path] = [];
  byPath[u.path].push(`${u.file}:${u.line}`);
}

for (const [p, refs] of Object.entries(byPath)) {
  console.log(p.padEnd(45), `${refs.length} refs:`, refs.slice(0, 3).join(', '));
}
