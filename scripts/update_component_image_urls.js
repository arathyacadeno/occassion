const fs = require('fs');
const path = require('path');

const manifest = JSON.parse(fs.readFileSync('scratch/cloudinary_upload_manifest.json', 'utf8'));

// Build lookup map for both encoded and decoded paths
const urlMap = new Map();
for (const [k, v] of Object.entries(manifest)) {
  if (v.secure_url) {
    urlMap.set(k, v.secure_url);
    urlMap.set(decodeURIComponent(k), v.secure_url);
  }
}

// Target UI files to update
const targetFiles = [
  'src/components/CarDecorModal.tsx',
  'src/components/GarlandsModal.tsx',
  'src/components/StageDecorModal.tsx',
  'src/components/ChurchDecorModal.tsx',
  'src/components/HighlightSection.tsx',
  'src/app/about/AboutClient.tsx',
  'src/components/JoyfulGiftsBanner.tsx',
  'src/components/ShopByCategory.tsx',
  'src/components/ShopByOccasion.tsx',
  'src/components/ShopByFlowers.tsx',
  'src/components/StorySection.tsx',
  'src/components/ArtisanStory.tsx',
  'src/app/layout.tsx',
];

let totalReplacements = 0;

for (const relPath of targetFiles) {
  const fullPath = path.join(process.cwd(), relPath);
  if (!fs.existsSync(fullPath)) continue;

  let content = fs.readFileSync(fullPath, 'utf8');
  let fileReplacements = 0;

  for (const [localPath, cldUrl] of urlMap.entries()) {
    if (content.includes(localPath)) {
      // Replace with global regex
      const escaped = localPath.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`(["'\`])${escaped}(["'\`])`, 'g');
      const newContent = content.replace(regex, `$1${cldUrl}$2`);
      if (newContent !== content) {
        content = newContent;
        fileReplacements++;
        totalReplacements++;
      }
    }
  }

  if (fileReplacements > 0) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated "${relPath}": ${fileReplacements} image path(s) replaced with Cloudinary URLs.`);
  }
}

console.log(`\nTotal component replacements made: ${totalReplacements}`);
