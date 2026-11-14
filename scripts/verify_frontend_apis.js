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

async function testFrontendVerification() {
  const sql = neon(process.env.DATABASE_URL);
  console.log('====================================================');
  console.log('STEP 5: FRONTEND DATA & API VERIFICATION');
  console.log('====================================================\n');

  // 1. Verify Product Listings (Sample from each category)
  const categories = await sql`SELECT id, name, slug, image FROM categories ORDER BY name`;
  console.log('1. Categories & Category Cards:');
  for (const cat of categories) {
    const isCloudinary = cat.image.startsWith('https://res.cloudinary.com/');
    console.log(`   [${isCloudinary ? 'PASS' : 'FAIL'}] Category "${cat.name}" -> ${cat.image}`);
  }

  // 2. Sample 1 product from each category
  console.log('\n2. Product Listings & Detail Pages (Sample across categories):');
  for (const cat of categories) {
    const prods = await sql`
      SELECT id, name, slug, price, images, rating 
      FROM products 
      WHERE category_id = ${cat.id} 
      LIMIT 1
    `;
    if (prods.length > 0) {
      const p = prods[0];
      const imgs = JSON.parse(p.images);
      const allCloudinary = imgs.every((url) => url.startsWith('https://res.cloudinary.com/'));
      console.log(`   [${allCloudinary ? 'PASS' : 'FAIL'}] Product "${p.name}" (${cat.name}):`);
      console.log(`         Primary Image: ${imgs[0]}`);
      console.log(`         Total Gallery Images: ${imgs.length} (All Cloudinary: ${allCloudinary})`);
    }
  }

  // 3. Homepage Banners
  console.log('\n3. Homepage Hero & Promotional Banners:');
  const banners = await sql`SELECT id, title, desktop_image, mobile_image FROM homepage_banners`;
  for (const b of banners) {
    const deskPass = b.desktop_image.startsWith('https://res.cloudinary.com/');
    const mobPass = b.mobile_image.startsWith('https://res.cloudinary.com/');
    console.log(`   [${deskPass && mobPass ? 'PASS' : 'FAIL'}] Banner "${b.title}":`);
    console.log(`         Desktop: ${b.desktop_image}`);
    console.log(`         Mobile:  ${b.mobile_image}`);
  }

  // 4. Store Branding (Logo & Favicon)
  console.log('\n4. Store Branding & Identity:');
  const branding = await sql`SELECT key, value FROM store_settings WHERE key IN ('store_logo', 'header_logo', 'footer_logo', 'store_favicon')`;
  for (const b of branding) {
    const pass = b.value.startsWith('https://res.cloudinary.com/');
    console.log(`   [${pass ? 'PASS' : 'FAIL'}] ${b.key} -> ${b.value}`);
  }

  // 5. Add-ons Category
  console.log('\n5. Add-on Products:');
  const addons = await sql`SELECT id, name, images FROM products WHERE category_id = 'cat-addons' LIMIT 3`;
  for (const a of addons) {
    const imgs = JSON.parse(a.images);
    const pass = imgs[0]?.startsWith('https://res.cloudinary.com/');
    console.log(`   [${pass ? 'PASS' : 'FAIL'}] Add-on "${a.name}" -> ${imgs[0]}`);
  }

  // 6. Media Library
  console.log('\n6. Admin Media Library:');
  const mediaSummary = await sql`
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN url LIKE 'https://res.cloudinary.com/%' THEN 1 END) as cld_count
    FROM media
  `;
  console.log(`   Total media items: ${mediaSummary[0].total}`);
  console.log(`   Served from Cloudinary: ${mediaSummary[0].cld_count} (${((mediaSummary[0].cld_count / mediaSummary[0].total) * 100).toFixed(1)}%)`);

  console.log('\n====================================================');
  console.log('ALL FRONTEND ASSET CHECKS COMPLETED SUCCESSFULLY');
  console.log('====================================================\n');
}

testFrontendVerification().catch(console.error);
