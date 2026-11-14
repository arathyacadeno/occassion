import { setGlobalDispatcher, Agent } from 'undici';
import * as dns from 'dns';
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Setup resilient DNS lookup for cloud serverless environments
dns.setServers(['8.8.8.8', '1.1.1.1']);
const dnsPromises = dns.promises;

const agent = new Agent({
  connect: {
    lookup: (hostname, options, callback) => {
      dnsPromises
        .resolve4(hostname)
        .then((addresses) => {
          if (options && (options as any).all) {
            callback(null, addresses.map((a) => ({ address: a, family: 4 })) as any);
          } else {
            callback(null, addresses[0], 4);
          }
        })
        .catch((err) => (callback as any)(err));
    },
  },
});
setGlobalDispatcher(agent);

dotenv.config({ path: '.env.local' });

const OLD_DATABASE_URL = process.env.OLD_DATABASE_URL || process.env.DATABASE_URL;
const NEW_DATABASE_URL =
  process.env.NEW_DATABASE_URL || 'postgresql://neondb_owner:password@host/neondb?sslmode=require';

if (!OLD_DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in .env.local');
}

// Foreign-key dependency order
const PREFERRED_INSERT_ORDER = [
  'users',
  'categories',
  'flower_types',
  'occasions',
  'delivery_settings',
  'delivery_tiers',
  'store_settings',
  'website_content',
  'coupons',
  'media',
  'homepage_banners',
  'homepage_sections',
  'stem_prices',
  'products',
  'product_customizations',
  'addresses',
  'phone_otps',
  'contact_inquiries',
  'orders',
  'order_items',
  'cart_items',
  'wishlist_items',
];

async function runMigration() {
  console.log('====================================================');
  console.log('NEON POSTGRESQL DATABASE MIGRATION & DATA TRANSFER');
  console.log('====================================================\n');

  console.log('Connecting to SOURCE Neon Database...');
  const sourceSql = neon(OLD_DATABASE_URL!);

  console.log('Connecting to TARGET Neon Database...');
  const targetSql = neon(NEW_DATABASE_URL);

  // 1. Discover all tables in source database
  console.log('\n--- Step 1: Discovering Source Tables ---');
  const sourceTablesRes = await sourceSql.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `);

  const sourceTableNames = (sourceTablesRes as any[]).map((r) => r.table_name);
  console.log(`Found ${sourceTableNames.length} tables in source database:\n  ${sourceTableNames.join(', ')}`);

  // 2. Fetch all data and create local backup
  console.log('\n--- Step 2: Backing up all Source Data ---');
  const backupData: Record<string, any[]> = {};
  const backupDir = path.join(process.cwd(), 'data', 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  let totalRowsSource = 0;
  for (const tableName of sourceTableNames) {
    const rows = await sourceSql.query(`SELECT * FROM "${tableName}"`);
    backupData[tableName] = rows as any[];
    totalRowsSource += (rows as any[]).length;
    console.log(`  Backed up table "${tableName}": ${(rows as any[]).length} rows`);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFilePath = path.join(backupDir, `backup_before_neon_migration_${timestamp}.json`);
  fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2));
  console.log(`✅ Full backup (${totalRowsSource} total rows) saved to: ${backupFilePath}`);

  // 3. Replicate table definitions from Source to Target
  console.log('\n--- Step 3: Replicating Schema & Tables to Target Neon Database ---');

  for (const tableName of sourceTableNames) {
    // Get column details
    const colsRes = await sourceSql.query(`
      SELECT column_name, data_type, udt_name, is_nullable, column_default, character_maximum_length
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = '${tableName}'
      ORDER BY ordinal_position;
    `);

    // Get primary key details
    const pkRes = await sourceSql.query(`
      SELECT kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      WHERE tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_name = '${tableName}';
    `);
    const pkColumns = (pkRes as any[]).map((r) => r.column_name);

    // Build column definitions
    const colDefs: string[] = [];
    for (const col of colsRes as any[]) {
      let typeStr = col.udt_name.toUpperCase();
      if (typeStr === 'VARCHAR' && col.character_maximum_length) {
        typeStr = `VARCHAR(${col.character_maximum_length})`;
      } else if (typeStr === 'TIMESTAMPTZ') {
        typeStr = 'TIMESTAMPTZ';
      } else if (typeStr === 'NUMERIC') {
        typeStr = 'NUMERIC';
      } else if (typeStr === 'INT4') {
        typeStr = 'INT';
      } else if (typeStr === 'INT8') {
        typeStr = 'BIGINT';
      } else if (typeStr === 'TEXT') {
        typeStr = 'TEXT';
      }

      let def = `"${col.column_name}" ${typeStr}`;
      if (pkColumns.length === 1 && pkColumns[0] === col.column_name) {
        def += ' PRIMARY KEY';
      } else {
        if (col.is_nullable === 'NO') def += ' NOT NULL';
        if (col.column_default) def += ` DEFAULT ${col.column_default}`;
      }
      colDefs.push(def);
    }

    if (pkColumns.length > 1) {
      colDefs.push(`PRIMARY KEY (${pkColumns.map((c) => `"${c}"`).join(', ')})`);
    }

    const createTableSql = `CREATE TABLE IF NOT EXISTS "${tableName}" (\n  ${colDefs.join(',\n  ')}\n);`;
    await targetSql.query(createTableSql);

    // In case table already existed, ensure all columns exist
    const targetColsRes = await targetSql.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = '${tableName}';
    `);
    const targetColSet = new Set((targetColsRes as any[]).map((c) => c.column_name));

    for (const col of colsRes as any[]) {
      if (!targetColSet.has(col.column_name)) {
        let typeStr = col.udt_name.toUpperCase();
        if (typeStr === 'INT4') typeStr = 'INT';
        console.log(`  Adding column "${col.column_name}" to target table "${tableName}"...`);
        let alterSql = `ALTER TABLE "${tableName}" ADD COLUMN "${col.column_name}" ${typeStr}`;
        if (col.column_default) alterSql += ` DEFAULT ${col.column_default}`;
        await targetSql.query(alterSql);
      }
    }

    console.log(`  ✅ Schema ready for table "${tableName}"`);
  }

  // 4. Transfer data in dependency order
  console.log('\n--- Step 4: Transferring Data to Target Neon Database ---');

  const orderedTables = [
    ...PREFERRED_INSERT_ORDER.filter((t) => sourceTableNames.includes(t)),
    ...sourceTableNames.filter((t) => !PREFERRED_INSERT_ORDER.includes(t)),
  ];

  for (const tableName of orderedTables) {
    const rows = backupData[tableName] || [];
    if (rows.length === 0) {
      console.log(`  Table "${tableName}": 0 rows (empty, skipping data insert)`);
      continue;
    }

    console.log(`  Transferring table "${tableName}" (${rows.length} rows)...`);

    // Get primary key columns on target
    const pkRes = await targetSql.query(`
      SELECT kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      WHERE tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_name = '${tableName}';
    `);
    const pkColumns = (pkRes as any[]).map((r) => r.column_name);

    for (const row of rows) {
      const keys = Object.keys(row);
      const colNames = keys.map((k) => `"${k}"`).join(', ');
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const values = keys.map((k) => {
        const val = row[k];
        if (val instanceof Date) return val.toISOString();
        if (typeof val === 'object' && val !== null) return JSON.stringify(val);
        return val;
      });

      let insertQuery = `INSERT INTO "${tableName}" (${colNames}) VALUES (${placeholders})`;

      if (pkColumns.length > 0) {
        const pkConstraint = pkColumns.map((c) => `"${c}"`).join(', ');
        const updateSet = keys
          .filter((k) => !pkColumns.includes(k))
          .map((k) => `"${k}" = EXCLUDED."${k}"`)
          .join(', ');

        if (updateSet.length > 0) {
          insertQuery += ` ON CONFLICT (${pkConstraint}) DO UPDATE SET ${updateSet};`;
        } else {
          insertQuery += ` ON CONFLICT (${pkConstraint}) DO NOTHING;`;
        }
      } else {
        insertQuery += ';';
      }

      await targetSql.query(insertQuery, values);
    }
    console.log(`  ✅ Table "${tableName}": Successfully transferred all ${rows.length} rows.`);
  }

  // 5. Verify records on both databases
  console.log('\n====================================================');
  console.log('MIGRATION VERIFICATION RESULTS');
  console.log('====================================================');
  console.log('| Table Name                  | Source Rows | Target Rows | Status  |');
  console.log('|-----------------------------|-------------|-------------|---------|');

  let allMatched = true;

  for (const tableName of sourceTableNames) {
    const sCountRes = await sourceSql.query(`SELECT count(*)::int as count FROM "${tableName}"`);
    const tCountRes = await targetSql.query(`SELECT count(*)::int as count FROM "${tableName}"`);
    const sCount = (sCountRes as any[])[0]?.count || 0;
    const tCount = (tCountRes as any[])[0]?.count || 0;
    const matched = sCount === tCount;
    if (!matched) allMatched = false;

    const paddedName = tableName.padEnd(27, ' ');
    const paddedS = String(sCount).padStart(11, ' ');
    const paddedT = String(tCount).padStart(11, ' ');
    const status = matched ? '✅ MATCH ' : '❌ MISMATCH';

    console.log(`| ${paddedName} | ${paddedS} | ${paddedT} | ${status} |`);
  }

  if (allMatched) {
    console.log('\n🎉 ALL TABLES VERIFIED: 100% OF RECORDS MATCH PERFECTLY!');
  } else {
    console.warn('\n⚠️ Some tables had count differences. Please review the table above.');
  }

  console.log('====================================================');
}

runMigration().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
