const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

// Resilient DNS lookup
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

async function backupDatabase() {
  const sql = neon(process.env.DATABASE_URL);
  console.log('--- Connecting to Neon Database for Backup ---');

  const tablesRes = await sql.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `);

  const tables = tablesRes.map((r) => r.table_name);
  console.log(`Found ${tables.length} tables to backup.`);

  const backupData = {
    timestamp: new Date().toISOString(),
    database: 'neondb',
    provider: 'Neon PostgreSQL',
    tables: {},
  };

  const backupDir = path.join(process.cwd(), 'data', 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  let totalRows = 0;
  for (const table of tables) {
    const rows = await sql.query(`SELECT * FROM "${table}"`);
    backupData.tables[table] = rows;
    totalRows += rows.length;
    console.log(`  - Backed up "${table}": ${rows.length} rows`);
  }

  const timestampStr = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `backup_before_cloudinary_migration_${timestampStr}.json`;
  const backupFilePath = path.join(backupDir, filename);

  fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2));
  console.log(`\n✅ Backup successfully saved to: ${backupFilePath}`);
  console.log(`Total rows backed up across all tables: ${totalRows}`);
}

backupDatabase().catch((err) => {
  console.error('Backup failed:', err);
  process.exit(1);
});
