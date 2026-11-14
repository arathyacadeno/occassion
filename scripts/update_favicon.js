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

async function updateFavicon() {
  const sql = neon(process.env.DATABASE_URL);
  const manifest = JSON.parse(fs.readFileSync('scratch/cloudinary_upload_manifest.json', 'utf8'));
  const fav = manifest['/images/uploads/pink-rose-bud-logo-icon-524357.png']?.secure_url;
  if (!fav) {
    console.error('Favicon URL not found');
    return;
  }
  await sql`UPDATE store_settings SET value = ${fav} WHERE key = 'store_favicon'`;
  console.log('Updated store_favicon to:', fav);
}

updateFavicon().catch(console.error);
