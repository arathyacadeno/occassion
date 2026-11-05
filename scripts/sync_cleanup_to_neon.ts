import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function syncCleanupToNeon() {
  if (!process.env.DATABASE_URL) {
    console.log('No DATABASE_URL configured.');
    return;
  }

  const sql = neon(process.env.DATABASE_URL);

  console.log('Connecting to Neon PostgreSQL to apply bouquet duplicate cleanup...');

  // 1. Delete duplicate test product prod_1793690661162_m66iq
  await sql`DELETE FROM products WHERE id = 'prod_1793690661162_m66iq'`;
  console.log('Deleted duplicate copy: prod_1793690661162_m66iq');

  // 2. Delete legacy duplicate bouquets
  const legacyDupBouquetIds = [
    'bouquet-1',
    'bouquet-2',
    'bouquet-4',
    'bouquet-5',
    'bouquet-6',
    'bouquet-7',
    'bouquet-8',
    'bouquet-9',
    'bouquet-purple-lily-lavender',
    'flower-lily-celestial-daisy'
  ];

  for (const id of legacyDupBouquetIds) {
    await sql`DELETE FROM products WHERE id = ${id}`;
    console.log(`Deleted legacy duplicate bouquet: ${id}`);
  }

  // 3. Recategorize misplaced items out of cat-flower-bouquet
  const recat = [
    { id: 'prod_1793690661159_3k309', targetCat: 'cat-addons' },
    { id: 'hl-4', targetCat: 'cat-cakes' },
    { id: 'hl-6', targetCat: 'cat-cakes' },
    { id: 'hl-7', targetCat: 'cat-cakes' },
    { id: 'hl-5', targetCat: 'cat-flower-basket' },
    { id: 'flower-basket-9', targetCat: 'cat-flower-basket' },
    { id: 'hl-2', targetCat: 'cat-table-decor' },
    { id: 'occ-8', targetCat: 'cat-table-decor' },
    { id: 'occ-3', targetCat: 'cat-table-decor' },
    { id: 'hl-8', targetCat: 'cat-table-decor' },
    { id: 'hl-1', targetCat: 'cat-special-occasions' },
    { id: 'hl-3', targetCat: 'cat-special-occasions' },
    { id: 'flower-11', targetCat: 'cat-special-occasions' },
    { id: 'flower-12', targetCat: 'cat-special-occasions' },
    { id: 'occ-1', targetCat: 'cat-special-occasions' },
    { id: 'occ-2', targetCat: 'cat-special-occasions' },
    { id: 'occ-4', targetCat: 'cat-special-occasions' },
    { id: 'occ-6', targetCat: 'cat-special-occasions' },
    { id: 'occ-7', targetCat: 'cat-special-occasions' },
    { id: 'flower-oriental-sunset-lily-bouquet', targetCat: 'cat-special-occasions' },
    { id: 'flower-rajnigandha-fragrant-bunch', targetCat: 'cat-special-occasions' },
    { id: 'flower-gladiolus-pink-stately-bouquet', targetCat: 'cat-special-occasions' },
    { id: 'flower-tropical-heliconia-cascade-bouquet', targetCat: 'cat-special-occasions' },
  ];

  for (const item of recat) {
    await sql`UPDATE products SET category_id = ${item.targetCat} WHERE id = ${item.id}`;
    console.log(`Recategorized [${item.id}] -> ${item.targetCat}`);
  }

  const bouquetCount = await sql`SELECT count(*) FROM products WHERE category_id = 'cat-flower-bouquet'`;
  console.log('Neon bouquet count after cleanup:', bouquetCount[0]?.count);
}

syncCleanupToNeon().catch(err => {
  console.log('Neon update skipped (offline / sandbox):', err.message);
});

