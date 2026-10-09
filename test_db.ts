import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function testConnection() {
  try {
    console.log('Testing connection to Neon...');
    const sql = neon(process.env.DATABASE_URL!);
    
    // Execute a simple query
    const result = await sql`SELECT version();`;
    
    console.log('\n✅ SUCCESS! Connected to Neon Database.');
    console.log('Postgres Version:', result[0].version);
  } catch (error) {
    console.error('\n❌ FAILED to connect to Neon Database.');
    console.error(error);
  }
}

testConnection();
