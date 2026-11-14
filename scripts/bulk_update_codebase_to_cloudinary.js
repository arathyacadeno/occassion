const fs = require('fs');
const path = require('path');

const manifest = JSON.parse(fs.readFileSync('scratch/cloudinary_upload_manifest.json', 'utf8'));

// Build direct lookup from manifest
const urlMap = new Map();
for (const [k, v] of Object.entries(manifest)) {
  if (v.secure_url) {
    urlMap.set(k, v.secure_url);
    urlMap.set(decodeURIComponent(k), v.secure_url);
  }
}

// Fallback map for legacy/seed mock paths that were not physical files
const fallbackMap = {
  '/images/cat-flower-bouquet-luxe.jpg': 'https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647361/occasions/categories/categories-flower-bouquet.jpg',
  '/images/sunflower-bouquet.jpg': 'https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647383/occasions/products/flower-bouquet/flower-bouquet-sunshine-and-peach-orchids.jpg',
  '/images/lily-6-stems.png': 'https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647384/occasions/products/flower-bouquet/flower-bouquet-white-casablanca-lilies.jpg',
  '/images/lily-12-stems.png': 'https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647384/occasions/products/flower-bouquet/flower-bouquet-white-casablanca-lilies.jpg',
  '/images/lily-custom-stems.png': 'https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647384/occasions/products/flower-bouquet/flower-bouquet-white-casablanca-lilies.jpg',
  '/images/red-rose-bouquet.jpg': 'https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647380/occasions/products/flower-bouquet/flower-bouquet-scarlet-bloom-elegance.jpg',
  '/images/flower-white-lilies.jpg': 'https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647384/occasions/products/flower-bouquet/flower-bouquet-white-casablanca-lilies.jpg',
  '/images/flower-pink-roses.jpg': 'https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647378/occasions/products/flower-bouquet/flower-bouquet-pink-blush-roses.png',
  '/images/flower-white-roses.jpg': 'https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647384/occasions/products/flower-bouquet/flower-bouquet-white-cloud-perfection.png',
  '/images/farm-hand-bouquet-large.jpg': 'https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647376/occasions/products/flower-bouquet/flower-bouquet-golden-blush-orchid-rose.png',
  '/images/bouquet-2.jpg': 'https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647376/occasions/products/flower-bouquet/flower-bouquet-golden-blush-orchid-rose.png',
  '/images/bouquet-3.jpg': 'https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647380/occasions/products/flower-bouquet/flower-bouquet-rose-garden-bliss.png',
  '/images/bouquet-4.jpg': 'https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647383/occasions/products/flower-bouquet/flower-bouquet-sunshine-orchids.png',
  '/images/slide1-flower.jpg': 'https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647380/occasions/products/flower-bouquet/flower-bouquet-rose-garden-bliss.png',
  '/images/slide2-flower.jpg': 'https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647384/occasions/products/flower-bouquet/flower-bouquet-white-casablanca-lilies.jpg',
  '/images/slide3-flower.jpg': 'https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647383/occasions/products/flower-bouquet/flower-bouquet-sunshine-orchids.png',
  '/images/story-bg.jpg': 'https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647338/occasions/about/about-story-workshop.jpg',
  '/images/story-bg-hd.png': 'https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647338/occasions/about/about-story-florists.jpg',
  '/images/basket-yellow-roses.jpg': 'https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647364/occasions/products/flower-basket/flower-basket-asiatic-lily-peach-roses-basket.jpg',
  '/images/table-decor-outdoor-ceremony-arch.jpg': 'https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647425/occasions/products/table-decor/table-decor-10-1200.jpg',
  '/images/cat-birthday.jpg': 'https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647420/occasions/branding/occasion-birthday.jpg',
  '/images/cakes/cake-anniversary-maroon-gold.png': 'https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647345/occasions/products/cakes/cakes-chocolate-anniversary-heart-cake.png',
  '/images/cakes/cake-ombre-butterfly-birthday.jpg': 'https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647345/occasions/products/cakes/cakes-butterscotch-birthday-drizzle-cake.png',
  '/images/basket-gerberas.jpg': 'https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647364/occasions/products/flower-basket/flower-basket-asiatic-lily-peach-roses-basket.jpg',
  '/images/flower-basket/pastel-rose-wicker-basket.jpg': 'https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647366/occasions/products/flower-basket/flower-basket-peach-roses-basket.jpg',
  '/images/pastel-rose-wicker-basket.png': 'https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647366/occasions/products/flower-basket/flower-basket-peach-roses-basket.jpg',
};

// Essential root UI assets intentionally preserved locally
const PRESERVE_ROOT_FILES = new Set([
  '/images/call.svg',
  '/images/email.svg',
  '/images/Container (6).svg',
  '/images/Img (2).svg',
  '/images/Vector (4).svg',
  '/images/Vector (4) copy.svg',
  '/images/Vector (5).svg',
  '/images/Vector (5) copy.svg',
  '/images/Vector (6).svg',
  '/images/Vector (7).svg',
  '/images/empty-cart-box.png',
  '/images/empty-wishlist-bag.png',
  '/images/empty-wishlist-bag-trans.png',
  '/images/no-orders.png',
  '/images/quote-mark.png',
  '/images/footer.jpeg',
  '/images/gpay.png',
  '/images/phonepe.png',
  '/images/paytm.png',
  '/images/logo.png',
  '/images/logo.jpeg',
  '/images/occasions-logo.png',
]);

function getFiles(dir) {
  let res = [];
  if (!fs.existsSync(dir)) return res;
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, f.name);
    if (itemIsHidden(f.name)) continue;
    if (f.isDirectory()) res = res.concat(getFiles(full));
    else if (['.ts', '.tsx', '.js', '.jsx', '.css'].includes(path.extname(f.name))) res.push(full);
  }
  return res;
}

function itemIsHidden(name) {
  return name.startsWith('.') || name === 'node_modules' || name === '.next';
}

const allSrcFiles = getFiles(path.join(process.cwd(), 'src'));
console.log(`Scanning ${allSrcFiles.length} source files in src/...`);

let totalFilesUpdated = 0;
let totalReplacements = 0;

for (const file of allSrcFiles) {
  const relPath = path.relative(process.cwd(), file).replace(/\\/g, '/');
  let content = fs.readFileSync(file, 'utf8');
  let fileChanged = false;

  // Find all matches of /images/...
  content = content.replace(/["'`](\/images\/[^"'`]+)["'`]/g, (match, imagePath) => {
    // If it's an intentionally preserved local UI asset, leave it
    if (PRESERVE_ROOT_FILES.has(imagePath)) {
      return match;
    }

    // Try manifest lookup
    let cldUrl = urlMap.get(imagePath) || urlMap.get(decodeURIComponent(imagePath));
    if (!cldUrl) {
      // Try fallback map
      cldUrl = fallbackMap[imagePath];
    }

    if (cldUrl) {
      fileChanged = true;
      totalReplacements++;
      const quote = match[0];
      return `${quote}${cldUrl}${quote}`;
    }

    return match;
  });

  if (fileChanged) {
    fs.writeFileSync(file, content, 'utf8');
    totalFilesUpdated++;
    console.log(`  Updated: ${relPath}`);
  }
}

console.log('\n====================================================');
console.log(`Bulk update complete!`);
console.log(`Files modified: ${totalFilesUpdated}`);
console.log(`Image references replaced: ${totalReplacements}`);
console.log('====================================================\n');
