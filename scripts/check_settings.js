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

async function updateStoreSettings() {
  const sql = neon(process.env.DATABASE_URL);
  const manifest = JSON.parse(fs.readFileSync('scratch/cloudinary_upload_manifest.json', 'utf8'));

  const rows = await sql`SELECT key, value FROM store_settings`;
  console.log('All store_settings rows:', rows);

  const logoUrl = manifest['/images/occasions-logo.png']?.secure_url;
  if (!logoUrl) {
    console.error('Logo URL not found in manifest');
    return;
  }

  for (const key of ['store_logo', 'header_logo', 'footer_logo']) {
    await sql`UPDATE store_settings SET value = ${logoUrl} WHERE key = ${key}`;
    console.log(`Updated setting "${key}" -> ${logoUrl}`);
  }

  const updated = await sql`SELECT key, value FROM store_settings WHERE key IN ('store_logo', 'header_logo', 'footer_logo')`;
  console.log('\nVerified updated settings:\n', updated);
}

updateStoreSettings().catch(console.error);
