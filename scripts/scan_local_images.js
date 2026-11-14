const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

// Setup resilient DNS lookup for cloud serverless environments
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

async function runScan() {
  const sql = neon(process.env.DATABASE_URL);
  const publicDir = path.join(process.cwd(), 'public');
  const imagesDir = path.join(publicDir, 'images');

  // 1. Scan filesystem for all images under public/
  function scanDir(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of list) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        results = results.concat(scanDir(fullPath));
      } else {
        const ext = path.extname(item.name).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif', '.avif'].includes(ext)) {
          const relPath = '/' + path.relative(publicDir, fullPath).replace(/\\/g, '/');
          const stat = fs.statSync(fullPath);
          results.push({
            fullPath,
            relPath,
            filename: item.name,
            ext,
            size: stat.size,
          });
        }
      }
    }
    return results;
  }

  const allLocalFiles = scanDir(imagesDir);
  console.log(`Found ${allLocalFiles.length} total image files in public/images/`);

  // Map local files by relPath (both normalized and case-insensitive)
  const localFileMap = new Map();
  for (const f of allLocalFiles) {
    localFileMap.set(f.relPath, f);
    localFileMap.set(decodeURIComponent(f.relPath), f);
  }

  // 2. Fetch database records
  console.log('Fetching database records from Neon...');
  const products = await sql`SELECT id, name, slug, category_id, images FROM products`;
  const categories = await sql`SELECT id, name, slug, image FROM categories`;
  const banners = await sql`SELECT id, title, desktop_image, mobile_image FROM homepage_banners`;
  const settings = await sql`SELECT key, value FROM store_settings WHERE key IN ('logo_url', 'favicon_url')`;
  const mediaRows = await sql`SELECT id, url, public_id, filename, folder FROM media`;

  console.log(`Fetched ${products.length} products, ${categories.length} categories, ${banners.length} banners, ${mediaRows.length} media records.`);

  // 3. Track references
  const references = []; // { sourceTable, sourceId, sourceField, rawPath, normalizedPath, index }

  // Products
  for (const p of products) {
    let imgs = [];
    try {
      imgs = JSON.parse(p.images || '[]');
    } catch {
      imgs = p.images ? [p.images] : [];
    }
    imgs.forEach((img, idx) => {
      if (img && typeof img === 'string') {
        references.push({
          sourceTable: 'products',
          sourceId: p.id,
          productName: p.name,
          categoryId: p.category_id,
          sourceField: 'images',
          fieldIndex: idx,
          rawPath: img.trim(),
        });
      }
    });
  }

  // Categories
  for (const c of categories) {
    if (c.image) {
      references.push({
        sourceTable: 'categories',
        sourceId: c.id,
        categoryName: c.name,
        sourceField: 'image',
        fieldIndex: null,
        rawPath: c.image.trim(),
      });
    }
  }

  // Banners
  for (const b of banners) {
    if (b.desktop_image) {
      references.push({
        sourceTable: 'homepage_banners',
        sourceId: b.id,
        sourceField: 'desktop_image',
        fieldIndex: null,
        rawPath: b.desktop_image.trim(),
      });
    }
    if (b.mobile_image) {
      references.push({
        sourceTable: 'homepage_banners',
        sourceId: b.id,
        sourceField: 'mobile_image',
        fieldIndex: null,
        rawPath: b.mobile_image.trim(),
      });
    }
  }

  // Settings
  for (const s of settings) {
    if (s.value) {
      references.push({
        sourceTable: 'store_settings',
        sourceId: s.key,
        sourceField: 'value',
        fieldIndex: null,
        rawPath: s.value.trim(),
      });
    }
  }

  // Media table
  for (const m of mediaRows) {
    if (m.url) {
      references.push({
        sourceTable: 'media',
        sourceId: m.id,
        sourceField: 'url',
        fieldIndex: null,
        rawPath: m.url.trim(),
      });
    }
  }

  // 4. Analyze references
  const localRefs = [];
  const cloudinaryRefs = [];
  const otherRefs = [];

  for (const ref of references) {
    const p = ref.rawPath;
    if (p.includes('cloudinary.com')) {
      cloudinaryRefs.push(ref);
    } else if (p.startsWith('/') || p.startsWith('images/')) {
      localRefs.push(ref);
    } else {
      otherRefs.push(ref);
    }
  }

  console.log(`Total DB image references: ${references.length}`);
  console.log(`- Local references: ${localRefs.length}`);
  console.log(`- Cloudinary references: ${cloudinaryRefs.length}`);
  console.log(`- Other references: ${otherRefs.length}`);

  // 5. Check existence of local files referenced by DB
  const uniqueLocalPaths = [...new Set(localRefs.map((r) => r.rawPath))];
  console.log(`Unique local paths referenced in DB: ${uniqueLocalPaths.length}`);

  const existingReferenced = [];
  const missingReferenced = [];

  for (const p of uniqueLocalPaths) {
    // Normalization
    let cleanPath = p.startsWith('/') ? p : '/' + p;
    // Check if on disk
    let full = path.join(publicDir, cleanPath);
    let exists = fs.existsSync(full);
    if (!exists) {
      // Try decodeURIComponent
      try {
        const decoded = decodeURIComponent(cleanPath);
        full = path.join(publicDir, decoded);
        exists = fs.existsSync(full);
      } catch {}
    }

    if (exists) {
      const stat = fs.statSync(full);
      existingReferenced.push({
        refPath: p,
        fullPath: full,
        size: stat.size,
        associatedRefs: localRefs.filter((r) => r.rawPath === p),
      });
    } else {
      missingReferenced.push({
        refPath: p,
        associatedRefs: localRefs.filter((r) => r.rawPath === p),
      });
    }
  }

  console.log(`Referenced local files existing on disk: ${existingReferenced.length}`);
  console.log(`Referenced local files missing on disk: ${missingReferenced.length}`);
  if (missingReferenced.length > 0) {
    console.log('Sample missing:', missingReferenced.slice(0, 10));
  }

  // 6. Check unreferenced files in public/images
  const referencedFullPaths = new Set(existingReferenced.map((e) => e.fullPath.toLowerCase()));
  const unreferencedLocalFiles = allLocalFiles.filter(
    (f) => !referencedFullPaths.has(f.fullPath.toLowerCase())
  );
  console.log(`Unreferenced local files in public/images/: ${unreferencedLocalFiles.length}`);

  // Save report
  const inventory = {
    totalFilesOnDisk: allLocalFiles.length,
    totalLocalRefsInDb: localRefs.length,
    uniqueLocalPathsInDb: uniqueLocalPaths.length,
    existingReferencedCount: existingReferenced.length,
    missingReferencedCount: missingReferenced.length,
    unreferencedFilesCount: unreferencedLocalFiles.length,
    missingReferenced,
    existingReferenced: existingReferenced.map((e) => ({
      refPath: e.refPath,
      size: e.size,
      refCount: e.associatedRefs.length,
      sampleSources: e.associatedRefs.slice(0, 3).map((r) => `${r.sourceTable}:${r.sourceId}`),
    })),
    unreferencedSample: unreferencedLocalFiles.slice(0, 20).map((u) => u.relPath),
  };

  fs.writeFileSync('scratch/image_migration_inventory.json', JSON.stringify(inventory, null, 2));
  console.log('Inventory saved to scratch/image_migration_inventory.json');
}

runScan().catch((err) => {
  console.error('Scan failed:', err);
  process.exit(1);
});
