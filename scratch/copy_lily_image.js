const fs = require('fs');
const path = require('path');

const src = 'C:/Users/Arathy tp/.gemini/antigravity/brain/64729f3c-9787-4f53-9bd8-53ed9004eb89/.user_uploaded/media_1793603496685_c45d3253.jpg';
const destPng = path.join(process.cwd(), 'public', 'images', 'oriental-lily.png');
const destJpg = path.join(process.cwd(), 'public', 'images', 'oriental-lily.jpg');

fs.copyFileSync(src, destPng);
fs.copyFileSync(src, destJpg);

console.log('Copied to:', destPng, '(' + fs.statSync(destPng).size + ' bytes)');
console.log('Copied to:', destJpg, '(' + fs.statSync(destJpg).size + ' bytes)');

