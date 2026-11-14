const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);

async function run() {
  const hs = await sql`SELECT * FROM homepage_sections`;
  console.log('homepage_sections:', hs);
  const wc = await sql`SELECT * FROM website_content`;
  console.log('website_content:', wc);
}
run().catch(console.error);
