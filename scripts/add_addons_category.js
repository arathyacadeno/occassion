const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('data/occasions.db');

db.prepare(`
  INSERT OR IGNORE INTO categories (id, name, slug, description, image, display_order, active)
  VALUES ('cat-addons', 'Add-ons', 'addons', 'Chocolates, cards, teddy bears and celebration gifts', '/images/addons/bournville.jpg', 6, 1)
`).run();

const cats = db.prepare(`
  SELECT c.id, c.name, c.slug, count(p.id) as product_count
  FROM categories c
  LEFT JOIN products p ON (p.category_id = c.id OR p.category_id = c.slug)
  GROUP BY c.id
  ORDER BY c.display_order ASC
`).all();

console.log('Categories with product counts:');
console.log(cats);
