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

async function resolveRemaining() {
  const sql = neon(process.env.DATABASE_URL);
  const manifest = JSON.parse(fs.readFileSync('scratch/cloudinary_upload_manifest.json', 'utf8'));

  // Fallbacks from uploaded Cloudinary assets
  const fallbackMap = {
    '/images/red-rose-bouquet.jpg':
      manifest['/images/flower-bouquet/scarlet-bloom-elegance.jpg']?.secure_url ||
      manifest['/images/rose.jpg']?.secure_url,
    '/images/cakes/cake-anniversary-maroon-gold.png':
      manifest['/images/cakes/chocolate-anniversary-heart-cake.png']?.secure_url ||
      manifest['/images/cakes/cat-cakes-luxe.jpg']?.secure_url,
    '/images/basket-gerberas.jpg':
      manifest['/images/flower-basket/asiatic-lily-peach-roses-basket.jpg']?.secure_url ||
      manifest['/images/Gerbera.jpg']?.secure_url,
    '/images/sunflower-bouquet.jpg':
      manifest['/images/flower-bouquet/sunshine-and-peach-orchids.jpg']?.secure_url ||
      manifest['/images/sunflower.jpg']?.secure_url,
    '/images/table-decor-outdoor-ceremony-arch.jpg':
      manifest['/images/table decor/1.jpg']?.secure_url ||
      manifest['/images/categories/table-decor.jpg']?.secure_url,
    '/images/flower-white-lilies.jpg':
      manifest['/images/flower-bouquet/white-casablanca-lilies.jpg']?.secure_url ||
      manifest['/images/lilies.jpg']?.secure_url,
    '/images/cat-birthday.jpg':
      manifest['/images/occasion-birthday.jpg']?.secure_url ||
      manifest['/images/flower-bouquet/sunset-glow-carnations-roses.jpg']?.secure_url,
    '/images/cakes/cake-ombre-butterfly-birthday.jpg':
      manifest['/images/cakes/butterscotch-birthday-drizzle-cake.png']?.secure_url ||
      manifest['/images/cakes/cat-cakes-luxe.jpg']?.secure_url,
  };

  const products = await sql`SELECT id, images FROM products`;
  let fixed = 0;

  for (const p of products) {
    let imgs = [];
    try {
      imgs = JSON.parse(p.images || '[]');
    } catch {
      imgs = p.images ? [p.images] : [];
    }

    let modified = false;
    const newImgs = imgs.map((img) => {
      if (typeof img === 'string' && !img.includes('cloudinary.com')) {
        const replacement = fallbackMap[img];
        if (replacement) {
          modified = true;
          fixed++;
          return replacement;
        }
      }
      return img;
    });

    if (modified) {
      await sql`UPDATE products SET images = ${JSON.stringify(newImgs)}, updated_at = NOW() WHERE id = ${p.id}`;
      console.log(`Resolved placeholder images for product ${p.id}`);
    }
  }

  console.log(`Fixed ${fixed} remaining placeholder references in products!`);

  // Verify
  const check = await sql`
    SELECT COUNT(*) as remaining_local
    FROM products, json_array_elements_text(images::json) as elem
    WHERE elem NOT LIKE '%cloudinary.com%'
  `;
  console.log('Products remaining local paths:', check[0].remaining_local);
}

resolveRemaining().catch(console.error);
