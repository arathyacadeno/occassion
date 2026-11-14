const fs = require('fs');
const path = require('path');

const BACKUP_ZIP = path.join(process.cwd(), 'data', 'backups', 'occasions_images_backup_2026.zip');
const PUBLIC_IMAGES_DIR = path.join(process.cwd(), 'public', 'images');

// STRICT SAFETY CHECK: Verify backup exists and is valid
if (!fs.existsSync(BACKUP_ZIP)) {
  console.error('FATAL: Backup ZIP not found! Aborting cleanup.');
  process.exit(1);
}

const backupStat = fs.statSync(BACKUP_ZIP);
if (backupStat.size < 500 * 1024 * 1024) {
  console.error(`FATAL: Backup ZIP size (${(backupStat.size / 1024 / 1024).toFixed(2)} MB) is suspiciously small. Aborting.`);
  process.exit(1);
}

console.log(`Verified Backup ZIP: ${(backupStat.size / 1024 / 1024).toFixed(2)} MB`);

// 1. Folders to remove (all assets exist in Cloudinary and in the ZIP backup)
const FOLDERS_TO_REMOVE = [
  'about',
  'addons',
  'banners',
  'cakes',
  'car decor',
  'categories',
  'flower-basket',
  'flower-bouquet',
  'garlands',
  'highlights',
  'stage decor',
  'table decor',
  'uploads',
  'wreath',
];

// 2. Essential files to PRESERVE in public/images/
const PRESERVE_ROOT_FILES = new Set([
  'call.svg',
  'email.svg',
  'Container (6).svg',
  'Img (2).svg',
  'Vector (4).svg',
  'Vector (4) copy.svg',
  'Vector (5).svg',
  'Vector (5) copy.svg',
  'Vector (6).svg',
  'Vector (7).svg',
  'empty-cart-box.png',
  'empty-wishlist-bag.png',
  'empty-wishlist-bag-trans.png',
  'no-orders.png',
  'quote-mark.png',
  'footer.jpeg',
  'gpay.png',
  'phonepe.png',
  'paytm.png',
  'logo.png',
  'logo.jpeg',
  'occasions-logo.png',
]);

function getFolderFiles(dir) {
  let res = [];
  if (!fs.existsSync(dir)) return res;
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) res = res.concat(getFolderFiles(full));
    else {
      res.push({
        path: full,
        size: fs.statSync(full).size,
      });
    }
  }
  return res;
}

let removedCount = 0;
let bytesFreed = 0;

// Remove subdirectories
for (const folder of FOLDERS_TO_REMOVE) {
  const folderPath = path.join(PUBLIC_IMAGES_DIR, folder);
  if (fs.existsSync(folderPath)) {
    const files = getFolderFiles(folderPath);
    for (const f of files) {
      bytesFreed += f.size;
      removedCount++;
    }
    fs.rmSync(folderPath, { recursive: true, force: true });
    console.log(`  - Removed folder "${folder}/" (${files.length} files)`);
  }
}

// Remove migrated flower & occasion photos in root, keeping essential UI files
const rootItems = fs.readdirSync(PUBLIC_IMAGES_DIR, { withFileTypes: true });
for (const item of rootItems) {
  if (!item.isDirectory()) {
    if (!PRESERVE_ROOT_FILES.has(item.name)) {
      const fullPath = path.join(PUBLIC_IMAGES_DIR, item.name);
      const sz = fs.statSync(fullPath).size;
      bytesFreed += sz;
      removedCount++;
      fs.unlinkSync(fullPath);
      console.log(`  - Removed root photo: "${item.name}"`);
    } else {
      console.log(`  + Preserved essential UI asset: "${item.name}"`);
    }
  }
}

const remainingItems = fs.readdirSync(PUBLIC_IMAGES_DIR);

console.log('\n====================================================');
console.log('SAFE CLEANUP SUMMARY:');
console.log(`- Files removed: ${removedCount}`);
console.log(`- Disk space freed: ${(bytesFreed / (1024 * 1024)).toFixed(2)} MB`);
console.log(`- Essential files preserved in public/images/: ${remainingItems.length}`);
console.log(`- Preserved files: ${remainingItems.join(', ')}`);
console.log('====================================================\n');
