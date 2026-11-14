const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

function extractItems(content, varName) {
  const startIdx = content.indexOf(`export const ${varName}`);
  if (startIdx === -1) return [];
  const bracketStart = content.indexOf('[', startIdx);
  const semiIdx = content.indexOf('];', bracketStart);
  const arrStr = content.substring(bracketStart, semiIdx + 1);
  return eval(arrStr);
}

async function main() {
  console.log('--- 1. Creating Highlights Tables in Neon DB ---');

  await sql`
    CREATE TABLE IF NOT EXISTS highlights (
      id VARCHAR(64) PRIMARY KEY,
      slug VARCHAR(128) UNIQUE NOT NULL,
      title VARCHAR(255) NOT NULL,
      subtitle TEXT,
      tag VARCHAR(100),
      description TEXT,
      cover_image TEXT NOT NULL,
      starting_price NUMERIC(10, 2) DEFAULT 0,
      price_display VARCHAR(100),
      whatsapp_number VARCHAR(30) DEFAULT '918606464700',
      whatsapp_text TEXT,
      call_number VARCHAR(30) DEFAULT '+918606464700',
      call_text VARCHAR(100) DEFAULT 'Call Atelier Directly',
      guarantee_text VARCHAR(255) DEFAULT '100% Freshness Guarantee',
      features TEXT DEFAULT '[]',
      active INTEGER DEFAULT 1,
      display_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS highlight_gallery_images (
      id VARCHAR(64) PRIMARY KEY,
      highlight_id VARCHAR(64) NOT NULL REFERENCES highlights(id) ON DELETE CASCADE,
      image_url TEXT NOT NULL,
      title TEXT,
      alt_text TEXT,
      description TEXT,
      price NUMERIC(10, 2) DEFAULT 0,
      display_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_highlight_gallery_highlight_id 
    ON highlight_gallery_images(highlight_id);
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_highlights_active_order 
    ON highlights(active, display_order);
  `;

  console.log('Tables created successfully.');

  console.log('--- 2. Checking existing highlights in DB ---');
  const existing = await sql`SELECT id FROM highlights`;
  console.log('Existing highlights:', existing.map(e => e.id));

  // Extract gallery images from current components
  const carContent = fs.readFileSync('src/components/CarDecorModal.tsx', 'utf8');
  const stageContent = fs.readFileSync('src/components/StageDecorModal.tsx', 'utf8');
  const churchContent = fs.readFileSync('src/components/ChurchDecorModal.tsx', 'utf8');
  const garlandsContent = fs.readFileSync('src/components/GarlandsModal.tsx', 'utf8');

  const carItems = extractItems(carContent, 'CAR_DECOR_GALLERY');
  const stageItems = extractItems(stageContent, 'STAGE_DECOR_GALLERY');
  const churchItems = extractItems(churchContent, 'CHURCH_DECOR_GALLERY');
  const garlandsItems = extractItems(garlandsContent, 'GARLANDS_GALLERY');

  const initialHighlights = [
    {
      id: 'car-decor',
      slug: 'car-decor',
      title: 'Car Decor',
      subtitle: 'VIP Bonnet Florals and Satin Posies',
      tag: 'VIP Floristry',
      description: 'Transform your wedding arrival into an unforgettable spectacle with bespoke scratch-proof floral bonnets, door handle posies, and satin ribbons crafted with imported orchids and roses.',
      cover_image: 'https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647418/occasions/products/general/highlight-car-decorations.jpg',
      starting_price: 1800,
      price_display: '₹ 1,800',
      whatsapp_number: '918606464700',
      whatsapp_text: 'Hello Occasions Florist Calicut, I would like to inquire about wedding Car Decoration.',
      call_number: '+918606464700',
      call_text: 'Call Atelier Directly',
      guarantee_text: '100% Freshness Guarantee',
      features: JSON.stringify([
        'Imported Cymbidium Orchids',
        'Scratch-Proof Suction Mounting',
        'Door Posies and Satin Ribbons',
        'On-Site Venue Setup in Calicut',
      ]),
      active: 1,
      display_order: 1,
      items: carItems,
    },
    {
      id: 'stage-decor',
      slug: 'stage-decor',
      title: 'Stage Decor',
      subtitle: 'Opulent Banquet & Centerpiece Styling',
      tag: 'Celebration',
      description: 'Elevate your stage and banquet reception with opulent floral backdrops, elevated crystal centerpieces, blush roses, cascading hydrangeas, and glowing candlelight ambiance.',
      cover_image: 'https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647424/occasions/products/stage-decor/stage-decor-7.jpg',
      starting_price: 18000,
      price_display: '₹ 18,000',
      whatsapp_number: '918606464700',
      whatsapp_text: 'Hello Occasions Florist Calicut, I would like to inquire about wedding Table & Stage Arrangements.',
      call_number: '+918606464700',
      call_text: 'Call Atelier Directly',
      guarantee_text: '100% Freshness Guarantee',
      features: JSON.stringify([
        'Elevated Crystal Centerpieces',
        'Lush Floral Banquet Runners',
        'Floating Candle & Glass Ambiance',
        'VIP Head Table Styling',
      ]),
      active: 1,
      display_order: 2,
      items: stageItems,
    },
    {
      id: 'church-decor',
      slug: 'church-decor',
      title: 'Church Decor',
      subtitle: 'Grand Altar Arches and Aisle Florals',
      tag: 'Ceremony',
      description: 'Create a sacred, heavenly atmosphere for your wedding ceremony with grand cathedral altar arches, romantic candlelit pew decorations, and cascading aisle runners.',
      cover_image: 'https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647418/occasions/products/general/highlight-church-arrangements.jpg',
      starting_price: 16500,
      price_display: '₹ 16,500',
      whatsapp_number: '918606464700',
      whatsapp_text: 'Hello Occasions Florist Calicut, I would like to inquire about Church Arrangements and wedding altar florals.',
      call_number: '+918606464700',
      call_text: 'Call Atelier Directly',
      guarantee_text: '100% Freshness Guarantee',
      features: JSON.stringify([
        'Grand Altar Floral Arch',
        'Romantic Candlelit Pew Posies',
        'Casablanca Lilies and Hydrangeas',
        'Parish Protocol Coordination',
      ]),
      active: 1,
      display_order: 3,
      items: churchItems,
    },
    {
      id: 'garlands',
      slug: 'garlands',
      title: 'Garlands',
      subtitle: 'Fresh Jasmine Varmala and Gift Baskets',
      tag: 'Tradition',
      description: 'Handcrafted traditional and contemporary bridal garlands, reception varmalas, and auspicious gift flower baskets meticulously strung with fresh fragrant jasmine, lotus buds, and Dutch roses.',
      cover_image: 'https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647414/occasions/products/garlands/garlands-1.webp',
      starting_price: 2500,
      price_display: '₹ 2,500',
      whatsapp_number: '918606464700',
      whatsapp_text: 'Hello Occasions Florist Calicut, I would like to inquire about fresh floral Garlands and wedding varmalas.',
      call_number: '+918606464700',
      call_text: 'Call Atelier Directly',
      guarantee_text: '100% Freshness Guarantee',
      features: JSON.stringify([
        'Fragrant Madurai Jasmine',
        'Feather-Light Ceremony Comfort',
        'Grade-A Dutch Rose Petals',
        'Traditional Uruli and Gift Baskets',
      ]),
      active: 1,
      display_order: 4,
      items: garlandsItems,
    },
  ];

  for (const h of initialHighlights) {
    console.log(`Seeding highlight: ${h.title} (${h.id})...`);
    await sql`
      INSERT INTO highlights (
        id, slug, title, subtitle, tag, description, cover_image,
        starting_price, price_display, whatsapp_number, whatsapp_text,
        call_number, call_text, guarantee_text, features, active, display_order, updated_at
      ) VALUES (
        ${h.id}, ${h.slug}, ${h.title}, ${h.subtitle}, ${h.tag}, ${h.description}, ${h.cover_image},
        ${h.starting_price}, ${h.price_display}, ${h.whatsapp_number}, ${h.whatsapp_text},
        ${h.call_number}, ${h.call_text}, ${h.guarantee_text}, ${h.features}, ${h.active}, ${h.display_order}, CURRENT_TIMESTAMP
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        subtitle = EXCLUDED.subtitle,
        tag = EXCLUDED.tag,
        description = EXCLUDED.description,
        cover_image = EXCLUDED.cover_image,
        starting_price = EXCLUDED.starting_price,
        price_display = EXCLUDED.price_display,
        whatsapp_number = EXCLUDED.whatsapp_number,
        whatsapp_text = EXCLUDED.whatsapp_text,
        call_number = EXCLUDED.call_number,
        call_text = EXCLUDED.call_text,
        guarantee_text = EXCLUDED.guarantee_text,
        features = EXCLUDED.features,
        active = EXCLUDED.active,
        display_order = EXCLUDED.display_order,
        updated_at = CURRENT_TIMESTAMP;
    `;

    // Seed gallery images if none exist for this highlight
    const existingImages = await sql`
      SELECT COUNT(*) as count FROM highlight_gallery_images WHERE highlight_id = ${h.id}
    `;

    if (Number(existingImages[0].count) === 0 && Array.isArray(h.items)) {
      console.log(`  Seeding ${h.items.length} gallery images for ${h.id}...`);
      let order = 1;
      for (const item of h.items) {
        const imageId = `${h.id}-img-${order}-${Date.now().toString(36)}`;
        await sql`
          INSERT INTO highlight_gallery_images (
            id, highlight_id, image_url, title, alt_text, description, price, display_order
          ) VALUES (
            ${imageId}, ${h.id}, ${item.src}, ${item.title || h.title}, ${item.alt || h.title},
            ${item.description || ''}, ${item.price || h.starting_price}, ${order}
          );
        `;
        order++;
      }
    }
  }

  const finalHighlights = await sql`SELECT id, title, active, display_order FROM highlights ORDER BY display_order`;
  const finalImages = await sql`SELECT highlight_id, count(*) as count FROM highlight_gallery_images GROUP BY highlight_id`;
  console.log('Seeded highlights:', finalHighlights);
  console.log('Seeded gallery counts:', finalImages);
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
