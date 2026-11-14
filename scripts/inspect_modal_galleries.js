const fs = require('fs');

['CarDecorModal.tsx', 'StageDecorModal.tsx', 'ChurchDecorModal.tsx', 'GarlandsModal.tsx'].forEach(f => {
  const content = fs.readFileSync('src/components/' + f, 'utf8');
  const matches = content.match(/src:\s*"([^"]+)"/g) || [];
  console.log(f, matches.length, 'images');
});
