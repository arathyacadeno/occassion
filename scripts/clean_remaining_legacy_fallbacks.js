const fs = require('fs');
const path = require('path');

const manifest = JSON.parse(fs.readFileSync('scratch/cloudinary_upload_manifest.json', 'utf8'));

// Build lookup map
const urlMap = new Map();
for (const [k, v] of Object.entries(manifest)) {
  if (v.secure_url) {
    urlMap.set(k, v.secure_url);
    urlMap.set(decodeURIComponent(k), v.secure_url);
  }
}

// Target files with legacy mock strings
const targetFiles = [
  'src/data/categoryProducts.ts',
  'src/data/flowerProducts.ts',
  'src/data/catalog.ts',
  'src/data/bouquets.ts',
  'src/data/customizationConfig.ts',
  'src/app/api/addons/route.ts',
  'src/app/api/admin/settings/route.ts',
  'src/app/api/settings/route.ts',
  'src/components/admin/StoreBrandingManager.tsx',
  'src/context/StoreSettingsContext.tsx',
  'src/components/CustomBouquetBuilder.module.css',
];

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

// Fallbacks for any remaining mock paths
function resolveAnyPath(p) {
  if (PRESERVE_ROOT_FILES.has(p)) return null;

  if (urlMap.has(p)) return urlMap.get(p);
  if (urlMap.has(decodeURIComponent(p))) return urlMap.get(decodeURIComponent(p));

  const lower = p.toLowerCase();
  if (lower.includes('addons') || lower.includes('cadbury')) {
    return manifest['/images/addons/bournville.jpg']?.secure_url ||
      'https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647340/occasions/products/addons/addons-bournville.jpg';
  }
  if (lower.includes('side-view') && lower.includes('basket')) {
    return manifest['/images/flower-basket/side-view/asiatic-lily-peach-roses-basket/image_1_top_left.jpg']?.secure_url ||
      'https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647364/occasions/products/flower-basket/flower-basket-asiatic-lily-peach-roses-basket.jpg';
  }
  if (lower.includes('basket')) {
    return manifest['/images/flower-basket/asiatic-lily-peach-roses-basket.jpg']?.secure_url ||
      'https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647364/occasions/products/flower-basket/flower-basket-asiatic-lily-peach-roses-basket.jpg';
  }
  if (lower.includes('cake')) {
    return manifest['/images/cakes/cat-cakes-luxe.jpg']?.secure_url ||
      'https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647345/occasions/products/cakes/cakes-cat-cakes-luxe.jpg';
  }
  if (lower.includes('wreath')) {
    return manifest['/images/categories/wreath.jpg']?.secure_url ||
      'https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647362/occasions/categories/categories-wreath.jpg';
  }
  if (lower.includes('table') || lower.includes('centerpiece')) {
    return manifest['/images/categories/table-decor.jpg']?.secure_url ||
      'https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647362/occasions/categories/categories-table-decor.jpg';
  }
  if (lower.includes('slide') || lower.includes('bouquet') || lower.includes('flower') || lower.includes('tulip') || lower.includes('chrysanthemum')) {
    return manifest['/images/categories/flower-bouquet.jpg']?.secure_url ||
      'https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647361/occasions/categories/categories-flower-bouquet.jpg';
  }
  if (lower.includes('occasion') || lower.includes('congratulation')) {
    return manifest['/images/occasions-logo.png']?.secure_url ||
      'https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647421/occasions/branding/occasions-logo.png';
  }

  return 'https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647361/occasions/categories/categories-flower-bouquet.jpg';
}

let replaced = 0;
for (const relPath of targetFiles) {
  const full = path.join(process.cwd(), relPath);
  if (!fs.existsSync(full)) continue;

  let content = fs.readFileSync(full, 'utf8');
  let changed = false;

  content = content.replace(/["'`](\/images\/[^"'`]+)["'`]/g, (match, imgPath) => {
    if (PRESERVE_ROOT_FILES.has(imgPath)) return match;

    const cld = resolveAnyPath(imgPath);
    if (cld) {
      changed = true;
      replaced++;
      const quote = match[0];
      return `${quote}${cld}${quote}`;
    }
    return match;
  });

  if (changed) {
    fs.writeFileSync(full, content, 'utf8');
    console.log(`Updated legacy fallbacks in: ${relPath}`);
  }
}

console.log(`Replaced ${replaced} remaining mock references in fallback data.`);
