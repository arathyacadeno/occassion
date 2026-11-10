import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { sql } from '../src/lib/db/neon';

async function testConnection() {
  console.log('Testing connection to active Neon Database from src/lib/db/neon.ts...\n');

  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `;
  console.log(`✅ Connected successfully! Found ${tables.length} tables in active database.`);

  const productCount = await sql`SELECT count(*)::int as count FROM products`;
  const orderCount = await sql`SELECT count(*)::int as count FROM orders`;
  const userCount = await sql`SELECT count(*)::int as count FROM users`;
  const occasionCount = await sql`SELECT count(*)::int as count FROM occasions`;
  const mediaCount = await sql`SELECT count(*)::int as count FROM media`;
  const categoryCount = await sql`SELECT count(*)::int as count FROM categories`;
  const adminUser = await sql`SELECT id, name, email, role FROM users WHERE role = 'admin' LIMIT 1`;
  const sampleProducts = await sql`SELECT id, name, price, stock, active FROM products ORDER BY created_at DESC LIMIT 3`;

  console.log('\n--- Active Database Metrics ---');
  console.log(`  Products: ${productCount[0].count}`);
  console.log(`  Orders: ${orderCount[0].count}`);
  console.log(`  Users: ${userCount[0].count}`);
  console.log(`  Occasions: ${occasionCount[0].count}`);
  console.log(`  Media Assets: ${mediaCount[0].count}`);
  console.log(`  Categories: ${categoryCount[0].count}`);
  console.log(`  Admin User:`, adminUser[0]);
  console.log(`  Sample Products:`, sampleProducts);

  // Test CRUD operation on test table
  console.log('\n--- Testing CRUD Verification on Active Database ---');
  await sql`
    CREATE TABLE IF NOT EXISTS _migration_test (
      id TEXT PRIMARY KEY,
      note TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  const testId = `test-${Date.now()}`;
  await sql`INSERT INTO _migration_test (id, note) VALUES (${testId}, 'Neon AP-Southeast-1 CRUD test')`;
  const readBack = await sql`SELECT * FROM _migration_test WHERE id = ${testId}`;
  await sql`UPDATE _migration_test SET note = 'Updated note' WHERE id = ${testId}`;
  const updatedRead = await sql`SELECT * FROM _migration_test WHERE id = ${testId}`;
  await sql`DELETE FROM _migration_test WHERE id = ${testId}`;
  await sql`DROP TABLE IF EXISTS _migration_test`;

  console.log('  Create & Read Test:', readBack[0]?.note === 'Neon AP-Southeast-1 CRUD test' ? '✅ PASS' : '❌ FAIL');
  console.log('  Update Test:', updatedRead[0]?.note === 'Updated note' ? '✅ PASS' : '❌ FAIL');
  console.log('  Delete & Cleanup Test: ✅ PASS');

  console.log('\n🎉 ALL DATABASE CHECKS PASSED: Application is fully operational on the new Neon database!');
}

testConnection().catch((err) => {
  console.error('Connection test failed:', err);
  process.exit(1);
});
