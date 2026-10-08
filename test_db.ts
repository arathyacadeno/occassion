import { getDb } from './src/lib/db.ts'; const db = getDb(); console.log(db.prepare('SELECT id, slug FROM products WHERE id = ?').get('bouquet-orchid-symphony'));
