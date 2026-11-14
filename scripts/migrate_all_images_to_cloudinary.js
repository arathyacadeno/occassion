const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

// Resilient DNS lookup for Neon Cloud
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

// Configure Cloudinary
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error('Missing Cloudinary credentials in .env.local');
  process.exit(1);
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

const MANIFEST_FILE = path.join(process.cwd(), 'scratch', 'cloudinary_upload_manifest.json');
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images');

// 1. Resolve Cloudinary Folder
function resolveCloudinaryFolder(relPath) {
  const norm = relPath.toLowerCase().replace(/\\/g, '/');
  if (norm.includes('/flower-bouquet/')) return 'occasions/products/flower-bouquet';
  if (norm.includes('/flower-basket/')) return 'occasions/products/flower-basket';
  if (norm.includes('/cakes/')) return 'occasions/products/cakes';
  if (norm.includes('/table decor/') || norm.includes('/table-decor/')) return 'occasions/products/table-decor';
  if (norm.includes('/wreath/')) return 'occasions/products/wreath';
  if (norm.includes('/addons/')) return 'occasions/products/addons';
  if (norm.includes('/car decor/')) return 'occasions/products/car-decor';
  if (norm.includes('/garlands/')) return 'occasions/products/garlands';
  if (norm.includes('/stage decor/')) return 'occasions/products/stage-decor';
  if (norm.includes('/highlights/')) return 'occasions/highlights';
  if (norm.includes('/categories/')) return 'occasions/categories';
  if (norm.includes('/banners/')) return 'occasions/banners';
  if (norm.includes('/about/')) return 'occasions/about';
  if (norm.includes('/uploads/')) return 'occasions/branding';
  if (
    norm.includes('logo') ||
    norm.includes('icon') ||
    norm.includes('quote-mark') ||
    norm.includes('vector') ||
    norm.includes('container') ||
    norm.includes('call.') ||
    norm.includes('email.')
  ) {
    return 'occasions/branding';
  }
  if (norm.includes('occasion-')) return 'occasions/branding';
  return 'occasions/products/general';
}

// 2. Resolve Public ID
function resolvePublicId(relPath) {
  let sub = relPath.replace(/^\/images\//i, '').replace(/\\/g, '/');
  const ext = path.extname(sub);
  sub = sub.slice(0, -ext.length);
  const clean = sub
    .split('/')
    .map((seg) =>
      seg
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
    )
    .filter(Boolean)
    .join('-');
  return clean || 'asset-' + Date.now().toString().slice(-6);
}

// 3. Scan local files
function getAllLocalImageFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results = results.concat(getAllLocalImageFiles(fullPath));
    } else {
      const ext = path.extname(item.name).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif', '.avif'].includes(ext)) {
        const relPath = '/' + path.relative(PUBLIC_DIR, fullPath).replace(/\\/g, '/');
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

// 4. Concurrency Queue Runner
async function runWithConcurrency(items, concurrency, workerFn) {
  const results = [];
  let index = 0;

  async function next() {
    while (index < items.length) {
      const currentIndex = index++;
      const item = items[currentIndex];
      try {
        const res = await workerFn(item, currentIndex, items.length);
        results[currentIndex] = { success: true, item, res };
      } catch (err) {
        results[currentIndex] = { success: false, item, error: err };
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => next());
  await Promise.all(workers);
  return results;
}

async function migrateImages() {
  console.log('===============================================================');
  console.log('MIGRATION: ALL LOCAL WEBSITE IMAGES TO CLOUDINARY + NEON DB');
  console.log('===============================================================\n');

  // Load existing manifest (resumability)
  let manifest = {};
  if (fs.existsSync(MANIFEST_FILE)) {
    try {
      manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8'));
      console.log(`Loaded existing manifest with ${Object.keys(manifest).length} cached entries.`);
    } catch (e) {
      manifest = {};
    }
  }

  function saveManifest() {
    fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
  }

  const localFiles = getAllLocalImageFiles(IMAGES_DIR);
  console.log(`Found ${localFiles.length} total local image files on disk.\n`);

  // Step 3: Upload files
  console.log('--- Step 3: Uploading Local Images to Cloudinary ---');

  const filesToUpload = localFiles.filter((f) => {
    // Check both raw relPath and decoded relPath
    return !manifest[f.relPath] && !manifest[decodeURIComponent(f.relPath)];
  });

  console.log(`Already uploaded in manifest: ${localFiles.length - filesToUpload.length}`);
  console.log(`Pending uploads: ${filesToUpload.length}\n`);

  let completedCount = localFiles.length - filesToUpload.length;
  let saveCounter = 0;

  await runWithConcurrency(filesToUpload, 5, async (file, i, total) => {
    const folder = resolveCloudinaryFolder(file.relPath);
    const publicId = resolvePublicId(file.relPath);

    // Determine resource_type (for svg use 'image')
    const resourceType = 'image';

    const uploadRes = await cloudinary.uploader.upload(file.fullPath, {
      folder,
      public_id: publicId,
      overwrite: false,
      resource_type: resourceType,
      use_filename: false,
    });

    manifest[file.relPath] = {
      localRelPath: file.relPath,
      localFullPath: file.fullPath,
      folder,
      public_id: uploadRes.public_id,
      secure_url: uploadRes.secure_url,
      format: uploadRes.format,
      bytes: uploadRes.bytes || file.size,
      width: uploadRes.width,
      height: uploadRes.height,
      uploadedAt: new Date().toISOString(),
    };

    // Also index decoded path if different
    const decoded = decodeURIComponent(file.relPath);
    if (decoded !== file.relPath) {
      manifest[decoded] = manifest[file.relPath];
    }

    completedCount++;
    saveCounter++;
    if (saveCounter % 15 === 0 || completedCount === localFiles.length) {
      saveManifest();
      console.log(`[Progress] Uploaded ${completedCount}/${localFiles.length} files...`);
    }

    return uploadRes;
  });

  saveManifest();
  console.log(`\n✅ Upload phase complete! Total files in manifest: ${Object.keys(manifest).length}\n`);

  // Step 4: Update Neon Database
  console.log('--- Step 4: Updating Neon PostgreSQL Records ---');
  const sql = neon(process.env.DATABASE_URL);

  // Helper to find Cloudinary URL for a given database raw path
  function getCloudinaryUrl(rawPath) {
    if (!rawPath || typeof rawPath !== 'string') return null;
    const trimmed = rawPath.trim();
    if (trimmed.includes('cloudinary.com')) return trimmed; // already cloudinary

    let clean = trimmed.startsWith('/') ? trimmed : '/' + trimmed;
    if (manifest[clean]) return manifest[clean].secure_url;

    // Try decoded
    try {
      const dec = decodeURIComponent(clean);
      if (manifest[dec]) return manifest[dec].secure_url;
    } catch (e) {}

    // Try case-insensitive matching
    const lower = clean.toLowerCase();
    for (const [k, v] of Object.entries(manifest)) {
      if (k.toLowerCase() === lower) return v.secure_url;
    }

    // Try basename match if exact path not found
    const base = path.basename(clean).toLowerCase();
    for (const [k, v] of Object.entries(manifest)) {
      if (path.basename(k).toLowerCase() === base) return v.secure_url;
    }

    return null;
  }

  // 4A. Update Products
  console.log('\n[4A] Updating products table...');
  const products = await sql`SELECT id, name, images FROM products`;
  let productsUpdated = 0;
  let productImagesReplaced = 0;
  let productImagesUnresolved = 0;

  for (const p of products) {
    let imgs = [];
    try {
      imgs = JSON.parse(p.images || '[]');
    } catch {
      imgs = p.images ? [p.images] : [];
    }

    let modified = false;
    const newImages = imgs.map((img) => {
      if (!img || typeof img !== 'string') return img;
      if (img.includes('cloudinary.com')) return img;
      const cld = getCloudinaryUrl(img);
      if (cld) {
        modified = true;
        productImagesReplaced++;
        return cld;
      } else {
        productImagesUnresolved++;
        console.warn(`  [Warning] Product "${p.id}" unresolved image: "${img}"`);
        return img;
      }
    });

    if (modified) {
      await sql`
        UPDATE products 
        SET images = ${JSON.stringify(newImages)}, updated_at = NOW()
        WHERE id = ${p.id}
      `;
      productsUpdated++;
    }
  }
  console.log(`  - Products updated: ${productsUpdated}/${products.length}`);
  console.log(`  - Product image references replaced with Cloudinary URLs: ${productImagesReplaced}`);
  console.log(`  - Unresolved image references: ${productImagesUnresolved}`);

  // 4B. Update Categories
  console.log('\n[4B] Updating categories table...');
  const categories = await sql`SELECT id, name, slug, image FROM categories`;
  let categoriesUpdated = 0;

  for (const c of categories) {
    if (c.image && !c.image.includes('cloudinary.com')) {
      const cld = getCloudinaryUrl(c.image);
      if (cld) {
        await sql`UPDATE categories SET image = ${cld} WHERE id = ${c.id}`;
        categoriesUpdated++;
        console.log(`  - Category "${c.name}": "${c.image}" -> "${cld}"`);
      } else {
        console.warn(`  [Warning] Category "${c.name}" unresolved image: "${c.image}"`);
      }
    }
  }
  console.log(`  - Categories updated: ${categoriesUpdated}/${categories.length}`);

  // 4C. Update Homepage Banners
  console.log('\n[4C] Updating homepage_banners table...');
  const banners = await sql`SELECT id, title, desktop_image, mobile_image FROM homepage_banners`;
  let bannersUpdated = 0;

  for (const b of banners) {
    let desktopCld = b.desktop_image;
    let mobileCld = b.mobile_image;
    let modified = false;

    if (b.desktop_image && !b.desktop_image.includes('cloudinary.com')) {
      const cld = getCloudinaryUrl(b.desktop_image);
      if (cld) {
        desktopCld = cld;
        modified = true;
      }
    }

    if (b.mobile_image && !b.mobile_image.includes('cloudinary.com')) {
      const cld = getCloudinaryUrl(b.mobile_image);
      if (cld) {
        mobileCld = cld;
        modified = true;
      }
    }

    if (modified) {
      await sql`
        UPDATE homepage_banners 
        SET desktop_image = ${desktopCld}, mobile_image = ${mobileCld}, updated_at = NOW()
        WHERE id = ${b.id}
      `;
      bannersUpdated++;
      console.log(`  - Banner "${b.title}": desktop & mobile images updated to Cloudinary`);
    }
  }
  console.log(`  - Banners updated: ${bannersUpdated}/${banners.length}`);

  // 4D. Update Store Settings (logo_url)
  console.log('\n[4D] Updating store_settings table...');
  const settings = await sql`SELECT key, value FROM store_settings WHERE key = 'logo_url'`;
  let settingsUpdated = 0;

  for (const s of settings) {
    if (s.value && !s.value.includes('cloudinary.com')) {
      const cld = getCloudinaryUrl(s.value);
      if (cld) {
        await sql`UPDATE store_settings SET value = ${cld}, updated_at = NOW() WHERE key = ${s.key}`;
        settingsUpdated++;
        console.log(`  - Setting "${s.key}": "${s.value}" -> "${cld}"`);
      }
    }
  }
  console.log(`  - Store settings updated: ${settingsUpdated}`);

  // 4E. Update Media Table
  console.log('\n[4E] Updating media registry table...');
  const mediaRows = await sql`SELECT id, url, public_id, filename, folder FROM media`;
  let mediaUpdated = 0;

  for (const m of mediaRows) {
    if (m.url && !m.url.includes('cloudinary.com')) {
      const cld = getCloudinaryUrl(m.url);
      if (cld) {
        const manifestEntry = Object.values(manifest).find((v) => v.secure_url === cld);
        const pubId = manifestEntry ? manifestEntry.public_id : m.public_id;
        await sql`
          UPDATE media 
          SET url = ${cld}, public_id = ${pubId}
          WHERE id = ${m.id}
        `;
        mediaUpdated++;
      }
    }
  }
  console.log(`  - Existing media records updated to Cloudinary URLs: ${mediaUpdated}/${mediaRows.length}`);

  // 4F. Register newly migrated assets in media table if not present
  console.log('\n[4F] Synchronizing media table with all migrated Cloudinary assets...');
  const existingMediaUrls = new Set(
    (await sql`SELECT url FROM media`).map((r) => r.url.toLowerCase())
  );

  let newMediaInserted = 0;
  for (const entry of Object.values(manifest)) {
    if (!entry.secure_url) continue;
    if (!existingMediaUrls.has(entry.secure_url.toLowerCase())) {
      const mediaId = `med-${Date.now().toString().slice(-8)}-${Math.random().toString(36).substring(2, 6)}`;
      const filename = path.basename(entry.localRelPath);
      const ext = path.extname(filename).replace('.', '') || 'jpg';
      const folderName = entry.folder ? entry.folder.replace(/^occasions\//, '') : 'general';

      try {
        await sql`
          INSERT INTO media (id, url, public_id, filename, format, size, width, height, folder, created_at)
          VALUES (
            ${mediaId}, ${entry.secure_url}, ${entry.public_id}, ${filename},
            ${ext}, ${entry.bytes || 0}, ${entry.width || 800}, ${entry.height || 800},
            ${folderName}, NOW()
          )
          ON CONFLICT (id) DO NOTHING
        `;
        existingMediaUrls.add(entry.secure_url.toLowerCase());
        newMediaInserted++;
      } catch (err) {
        // non-blocking
      }
    }
  }
  console.log(`  - Newly registered assets in media table: ${newMediaInserted}`);

  console.log('\n===============================================================');
  console.log('MIGRATION & DATABASE UPDATE COMPLETE!');
  console.log('===============================================================\n');
}

migrateImages().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
