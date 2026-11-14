const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
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

async function verifyMigration() {
  const sql = neon(process.env.DATABASE_URL);
  console.log('====================================================');
  console.log('VERIFYING DATABASE IMAGE MIGRATION TO CLOUDINARY');
  console.log('====================================================\n');

  // 1. Verify Products
  const products = await sql`SELECT id, name, images FROM products`;
  let totalProductImages = 0;
  let cldProductImages = 0;
  let localProductImages = 0;
  let sampleProducts = [];

  for (const p of products) {
    let imgs = [];
    try {
      imgs = JSON.parse(p.images || '[]');
    } catch {
      imgs = p.images ? [p.images] : [];
    }
    for (const img of imgs) {
      totalProductImages++;
      if (typeof img === 'string' && img.includes('cloudinary.com')) {
        cldProductImages++;
      } else {
        localProductImages++;
      }
    }
    if (sampleProducts.length < 3) {
      sampleProducts.push({ id: p.id, name: p.name, firstImage: imgs[0] });
    }
  }

  console.log('1. Products Table:');
  console.log(`   - Total Products: ${products.length}`);
  console.log(`   - Total Product Images: ${totalProductImages}`);
  console.log(`   - Cloudinary URLs: ${cldProductImages} (${((cldProductImages / totalProductImages) * 100).toFixed(1)}%)`);
  console.log(`   - Local Paths Remaining: ${localProductImages}`);
  console.log('   - Sample products:', JSON.stringify(sampleProducts, null, 2));

  // 2. Verify Categories
  const categories = await sql`SELECT id, name, image FROM categories`;
  let cldCatImages = 0;
  for (const c of categories) {
    if (c.image && c.image.includes('cloudinary.com')) cldCatImages++;
  }
  console.log('\n2. Categories Table:');
  console.log(`   - Total Categories: ${categories.length}`);
  console.log(`   - Cloudinary URLs: ${cldCatImages}/${categories.length}`);
  console.log('   - Categories:', JSON.stringify(categories, null, 2));

  // 3. Verify Homepage Banners
  const banners = await sql`SELECT id, title, desktop_image, mobile_image FROM homepage_banners`;
  let cldBanners = 0;
  for (const b of banners) {
    if (b.desktop_image?.includes('cloudinary.com') && b.mobile_image?.includes('cloudinary.com')) {
      cldBanners++;
    }
  }
  console.log('\n3. Homepage Banners Table:');
  console.log(`   - Total Banners: ${banners.length}`);
  console.log(`   - Cloudinary URLs: ${cldBanners}/${banners.length}`);
  console.log('   - Banners:', JSON.stringify(banners, null, 2));

  // 4. Verify Store Settings
  const settings = await sql`SELECT key, value FROM store_settings WHERE key IN ('store_logo', 'header_logo', 'footer_logo', 'store_favicon')`;
  console.log('\n4. Store Settings Table:');
  console.log('   - Branding settings:', JSON.stringify(settings, null, 2));

  // 5. Verify Media Table
  const mediaCountRes = await sql`
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN url LIKE '%cloudinary.com%' THEN 1 END) as cloudinary_count,
      COUNT(CASE WHEN url NOT LIKE '%cloudinary.com%' THEN 1 END) as local_count
    FROM media
  `;
  console.log('\n5. Media Library Table:');
  console.log(`   - Total media records: ${mediaCountRes[0].total}`);
  console.log(`   - Cloudinary URLs: ${mediaCountRes[0].cloudinary_count}`);
  console.log(`   - Local Paths: ${mediaCountRes[0].local_count}`);

  const report = {
    products: {
      total: products.length,
      totalImages: totalProductImages,
      cloudinaryImages: cldProductImages,
      localImages: localProductImages,
    },
    categories: {
      total: categories.length,
      cloudinary: cldCatImages,
    },
    banners: {
      total: banners.length,
      cloudinary: cldBanners,
    },
    settings,
    media: mediaCountRes[0],
  };

  fs.writeFileSync('scratch/db_migration_verification_report.json', JSON.stringify(report, null, 2));
}

verifyMigration().catch(console.error);
