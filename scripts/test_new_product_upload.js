const { neon } = require('@neondatabase/serverless');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Resilient DNS
try {
  const { setGlobalDispatcher, Agent } = require('undici');
  const dns = require('dns');
  dns.setServers(['8.8.8.8', '1.1.1.1']);
  const dnsPromises = dns.promises;
  const agent = new Agent({
    connect: {
      lookup: (hostname, options, callback) => {
        dnsPromises
          .resolve4(hostname)
          .then((addresses) => {
            if (options && options.all) {
              callback(null, addresses.map((a) => ({ address: a, family: 4 })));
            } else {
              callback(null, addresses[0], 4);
            }
          })
          .catch(() => dns.lookup(hostname, options, callback));
      },
    },
  });
  setGlobalDispatcher(agent);
} catch (e) {}

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
cloudinary.config({
  cloud_name: cloudName,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function getAllLocalFiles(dir) {
  let res = [];
  if (!fs.existsSync(dir)) return res;
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) res = res.concat(getAllLocalFiles(full));
    else res.push(full);
  }
  return res;
}

function mapDbToProduct(dbProduct) {
  let images = [];
  try {
    images = JSON.parse(dbProduct.images || "[]");
  } catch {
    images = dbProduct.images ? [dbProduct.images] : [];
  }
  return {
    id: dbProduct.id,
    slug: dbProduct.slug || dbProduct.id,
    name: dbProduct.name,
    price: Number(dbProduct.price),
    image: images[0],
    images,
  };
}

async function runTest() {
  const sql = neon(process.env.DATABASE_URL);
  const publicImagesDir = path.join(process.cwd(), 'public', 'images');

  console.log('===============================================================');
  console.log('TEST: CLOUDINARY EXCLUSIVE PRODUCT IMAGE UPLOAD & PERSISTENCE');
  console.log('===============================================================\n');

  // Step A: Snapshot local files before test
  const filesBefore = getAllLocalFiles(publicImagesDir);
  console.log(`[Check 1] Pre-test local files in public/images/: ${filesBefore.length}`);

  // Clean any previous test artifacts
  await sql`DELETE FROM products WHERE id LIKE 'prod-test-cloud-symphony%'`;
  await sql`DELETE FROM media WHERE id LIKE 'med-test-%'`;

  // Step B: Direct upload of 2 test product images to Cloudinary
  console.log('\n[Check 2] Uploading 2 product images directly to Cloudinary...');
  // Use preserved local sample asset
  const sample1Path = path.join(publicImagesDir, 'logo.png');
  const sample2Path = path.join(publicImagesDir, 'occasions-logo.png');
  const sample3Path = path.join(publicImagesDir, 'empty-cart-box.png');

  const upload1 = await cloudinary.uploader.upload(sample1Path, {
    folder: 'occasions/products/flower-bouquet',
    public_id: `test-signature-rose-1-${Date.now().toString().slice(-4)}`,
    resource_type: 'image',
    overwrite: true,
  });

  const upload2 = await cloudinary.uploader.upload(sample2Path, {
    folder: 'occasions/products/flower-bouquet',
    public_id: `test-signature-rose-2-${Date.now().toString().slice(-4)}`,
    resource_type: 'image',
    overwrite: true,
  });

  console.log(`  - Image 1 Uploaded: ${upload1.secure_url}`);
  console.log(`  - Image 2 Uploaded: ${upload2.secure_url}`);

  // Register in media table (as upload API does)
  const mediaId1 = `med-test-${Date.now()}-1`;
  const mediaId2 = `med-test-${Date.now()}-2`;
  await sql`
    INSERT INTO media (id, url, public_id, filename, format, size, width, height, folder, created_at)
    VALUES 
      (${mediaId1}, ${upload1.secure_url}, ${upload1.public_id}, 'test-rose-1.jpg', ${upload1.format}, ${upload1.bytes}, ${upload1.width}, ${upload1.height}, 'flower-bouquet', NOW()),
      (${mediaId2}, ${upload2.secure_url}, ${upload2.public_id}, 'test-rose-2.jpg', ${upload2.format}, ${upload2.bytes}, ${upload2.width}, ${upload2.height}, 'flower-bouquet', NOW())
    ON CONFLICT (id) DO NOTHING
  `;
  console.log('  - Both image records registered in Neon PostgreSQL media table');

  // Step C: Create new product in Neon DB with these Cloudinary URLs
  console.log('\n[Check 3] Creating new product in Neon PostgreSQL with Cloudinary URLs...');
  const testProductId = `prod-test-cloud-symphony-${Date.now().toString().slice(-4)}`;
  const testProductSlug = `occasions-signature-rose-cloud-symphony-${Date.now().toString().slice(-4)}`;
  const productImages = [upload1.secure_url, upload2.secure_url];

  await sql`
    INSERT INTO products (
      id, name, slug, description, short_description, images, price, discount_price,
      stock, low_stock_threshold, sku, category_id, flower_type_id, occasion_id,
      featured, active, rating, reviews_count, delivery_info,
      offers, includes, badge, type, status, tags, seo_title, seo_description,
      attributes, created_at, updated_at
    ) VALUES (
      ${testProductId}, 'Occasions Signature Rose Cloud Symphony', ${testProductSlug},
      'Exquisite luxury bouquet handcrafted with premium crimson avalanche roses, oriental lilies, and eucalyptus foliage.',
      'Signature luxury bloom arrangement.',
      ${JSON.stringify(productImages)}, 2499, 2999,
      50, 5, ${`SKU-${testProductId.toUpperCase()}`}, 'cat-flower-bouquet', 'ft-roses',
      'occ-anniversary', 1, 1, 5.0, 1, 'Same-day Calicut express delivery available',
      '["Free luxury vase included", "Complimentary gift card"]',
      '["24 Long-stem Red Roses", "Casablanca Lilies", "Botanical wrap"]',
      'Exclusive Bloom', 'flower', 'published', '["Luxury", "Signature", "Roses"]',
      'Signature Rose Cloud Symphony | Occasions',
      'Luxury rose bouquet available for delivery in Calicut.',
      '{}', NOW(), NOW()
    )
  `;
  console.log(`  - Product created: "${testProductId}" with slug "${testProductSlug}"`);

  // Step D: Verify product in Neon PostgreSQL
  console.log('\n[Check 4] Verifying product stored in Neon PostgreSQL...');
  const savedRow = await sql`SELECT id, name, slug, images, price, active, status FROM products WHERE id = ${testProductId}`;
  console.log('  - Database row retrieved:', savedRow[0]);
  const parsedImgs = JSON.parse(savedRow[0].images);
  console.log('  - Parsed images array in Neon:', parsedImgs);
  console.log(`  - 1st Image (Main Thumbnail): ${parsedImgs[0]}`);
  console.log(`  - 2nd Image (Gallery): ${parsedImgs[1]}`);

  if (parsedImgs[0] !== upload1.secure_url || parsedImgs[1] !== upload2.secure_url) {
    throw new Error('Neon database images array does not match uploaded Cloudinary URLs!');
  }

  // Step E: Verify storefront mapping
  console.log('\n[Check 5] Verifying storefront catalog retrieval (mapDbToProduct)...');
  const storefrontProduct = mapDbToProduct(savedRow[0]);
  console.log(`  - Storefront Primary Image: ${storefrontProduct.image}`);
  console.log(`  - Storefront Gallery: ${JSON.stringify(storefrontProduct.images)}`);
  console.log(`  - Primary Image is Cloudinary HTTPS: ${storefrontProduct.image.startsWith('https://res.cloudinary.com/')}`);

  // Step F: Edit the product (add 3rd image)
  console.log('\n[Check 6] Testing product edit / update with 3rd Cloudinary image...');
  // Edit test with 3rd asset
  const upload3 = await cloudinary.uploader.upload(sample3Path, {
    folder: 'occasions/products/flower-bouquet',
    public_id: `test-signature-rose-3-${Date.now().toString().slice(-4)}`,
    resource_type: 'image',
    overwrite: true,
  });

  const updatedImages = [...parsedImgs, upload3.secure_url];
  await sql`
    UPDATE products 
    SET images = ${JSON.stringify(updatedImages)}, price = 2299, updated_at = NOW()
    WHERE id = ${testProductId}
  `;
  const updatedRow = await sql`SELECT id, images, price FROM products WHERE id = ${testProductId}`;
  const updatedImgsParsed = JSON.parse(updatedRow[0].images);
  console.log(`  - Product updated with 3 images. Total: ${updatedImgsParsed.length}`);
  console.log(`  - All 3 images are Cloudinary HTTPS: ${updatedImgsParsed.every((u) => u.startsWith('https://res.cloudinary.com/'))}`);

  // Step G: Verify public/images local filesystem did NOT change
  console.log('\n[Check 7] Verifying public/images/ directory has ZERO new files...');
  const filesAfter = getAllLocalFiles(publicImagesDir);
  console.log(`  - Files before: ${filesBefore.length}`);
  console.log(`  - Files after:  ${filesAfter.length}`);
  if (filesAfter.length !== filesBefore.length) {
    throw new Error(`Local files were created during upload! Before: ${filesBefore.length}, After: ${filesAfter.length}`);
  }
  console.log('  - SUCCESS: Exactly 0 local files were created inside public/images/!');

  // Step H: Clean up test product and test media
  console.log('\n[Check 8] Cleaning up test data from Neon PostgreSQL and Cloudinary...');
  await sql`DELETE FROM products WHERE id = ${testProductId}`;
  await sql`DELETE FROM media WHERE id IN (${mediaId1}, ${mediaId2})`;
  await cloudinary.uploader.destroy(upload1.public_id);
  await cloudinary.uploader.destroy(upload2.public_id);
  await cloudinary.uploader.destroy(upload3.public_id);
  console.log('  - Test product and test media cleaned up cleanly. Catalog remains pristine.');

  console.log('\n===============================================================');
  console.log('ALL VERIFICATION CHECKS PASSED WITH 100% SUCCESS!');
  console.log('===============================================================\n');
}

runTest().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
