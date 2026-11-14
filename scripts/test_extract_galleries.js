const fs = require('fs');

// Extract CAR_DECOR_GALLERY
const carContent = fs.readFileSync('src/components/CarDecorModal.tsx', 'utf8');
const stageContent = fs.readFileSync('src/components/StageDecorModal.tsx', 'utf8');
const churchContent = fs.readFileSync('src/components/ChurchDecorModal.tsx', 'utf8');
const garlandsContent = fs.readFileSync('src/components/GarlandsModal.tsx', 'utf8');

function extractItems(content, varName) {
  const startIdx = content.indexOf(`export const ${varName}`);
  if (startIdx === -1) return [];
  const bracketStart = content.indexOf('[', startIdx);
  const semiIdx = content.indexOf('];', bracketStart);
  const arrStr = content.substring(bracketStart, semiIdx + 1);
  return eval(arrStr);
}

const carItems = extractItems(carContent, 'CAR_DECOR_GALLERY');
const stageItems = extractItems(stageContent, 'STAGE_DECOR_GALLERY');
const churchItems = extractItems(churchContent, 'CHURCH_DECOR_GALLERY');
const garlandsItems = extractItems(garlandsContent, 'GARLANDS_GALLERY');

console.log('Extracted counts:', {
  car: carItems.length,
  stage: stageItems.length,
  church: churchItems.length,
  garlands: garlandsItems.length,
});
console.log('Car item sample:', carItems[0]);
console.log('Stage item sample:', stageItems[0]);
console.log('Church item sample:', churchItems[0]);
console.log('Garlands item sample:', garlandsItems[0]);
