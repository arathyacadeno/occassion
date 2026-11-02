const fs = require('fs');
const path = require('path');

function searchAll(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (f === 'node_modules' || f === '.next' || f === '.git' || f === 'scratch') continue;
    if (fs.statSync(full).isDirectory()) searchAll(full);
    else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
      const c = fs.readFileSync(full, 'utf-8');
      const lines = c.split('\n');
      lines.forEach((l, idx) => {
        if (l.includes('"customize"') || l.includes("'customize'") || l.includes('Customize') || l.includes('/customize/')) {
          console.log(`${full}:${idx + 1} -> ${l.trim()}`);
        }
      });
    }
  }
}

searchAll('src');

