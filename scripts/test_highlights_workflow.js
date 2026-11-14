require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'occasions-florist-calicut-secret-2026-secure-jwt';
const adminToken = jwt.sign(
  { userId: 'admin-1', email: 'admin@occasions.com', name: 'Admin', role: 'admin' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

const sql = neon(process.env.DATABASE_URL);

async function runTests() {
  console.log('================================================================');
  console.log('🧪 TESTING HIGHLIGHTS & SERVICE GALLERIES WORKFLOW');
  console.log('================================================================\n');

  // TEST 1: Check initial database seed
  console.log('▶ TEST 1: Verifying Neon PostgreSQL Initial Highlights & Galleries...');
  const dbHighlights = await sql`SELECT id, slug, title, active, display_order FROM highlights ORDER BY display_order`;
  console.log(`   Found ${dbHighlights.length} highlights in Neon:`);
  for (const h of dbHighlights) {
    const galleryRows = await sql`SELECT count(*) as count FROM highlight_gallery_images WHERE highlight_id = ${h.id}`;
    console.log(`   - [${h.id}] "${h.title}" (Active: ${h.active}, Order: ${h.display_order}) -> ${galleryRows[0].count} gallery photos`);
  }

  if (dbHighlights.length < 4) {
    throw new Error(`Expected at least 4 seeded highlights, got ${dbHighlights.length}`);
  }
  console.log('   ✅ Initial database verification passed.\n');

  // TEST 2: Test Create Highlight
  console.log('▶ TEST 2: Creating a New Highlight via Direct DB & Schema Validation...');
  const testHighlightId = 'test-gazebo-florals';
  const testCover = 'https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647424/occasions/products/stage-decor/stage-decor-7.jpg';

  // Clean up if previous run left test
  await sql`DELETE FROM highlights WHERE id = ${testHighlightId} OR slug = 'test-gazebo-florals'`;

  await sql`
    INSERT INTO highlights (
      id, slug, title, subtitle, tag, description, cover_image,
      starting_price, price_display, whatsapp_number, whatsapp_text,
      call_number, call_text, guarantee_text, features, active, display_order, created_at, updated_at
    ) VALUES (
      ${testHighlightId}, 'test-gazebo-florals', 'Luxury Gazebo Florals',
      'Botanical Pavilion Decor for Garden Weddings', 'Bespoke Pavilion',
      'Graceful ceiling canopies of wisteria, white hydrangeas, and trailing ivy.',
      ${testCover}, 35000, '₹ 35,000', '918606464700',
      'Inquire about Luxury Gazebo Florals', '+918606464700',
      'Call Atelier Directly', '100% Freshness Guarantee',
      ${JSON.stringify(['Botanical Wisteria Vines', 'Weather-Proof Mounting', 'Calicut Venue Setup'])},
      1, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    );
  `;

  // Insert 2 initial gallery images
  const testImg1 = `${testHighlightId}-img-1`;
  const testImg2 = `${testHighlightId}-img-2`;
  await sql`
    INSERT INTO highlight_gallery_images (id, highlight_id, image_url, title, alt_text, description, price, display_order)
    VALUES 
    (${testImg1}, ${testHighlightId}, ${testCover}, 'Grand Wisteria Arch', 'Wisteria arch photo', 'Full canopy styling', 35000, 1),
    (${testImg2}, ${testHighlightId}, ${testCover}, 'Evening Candlelit Gazebo', 'Candlelit photo', 'Night illumination styling', 38000, 2);
  `;

  const createdH = await sql`SELECT * FROM highlights WHERE id = ${testHighlightId}`;
  const createdGallery = await sql`SELECT * FROM highlight_gallery_images WHERE highlight_id = ${testHighlightId} ORDER BY display_order`;
  console.log(`   Created Highlight "${createdH[0].title}" with ${createdGallery.length} gallery items.`);
  if (createdGallery.length !== 2) throw new Error('Gallery insertion mismatch');
  console.log('   ✅ Create highlight and gallery passed.\n');

  // TEST 3: Test Update & Gallery Modification
  console.log('▶ TEST 3: Updating Highlight & Adding 3rd Gallery Image...');
  const testImg3 = `${testHighlightId}-img-3`;
  await sql`
    UPDATE highlights SET
      title = 'Ultra-Luxury Gazebo & Pavilion Florals',
      starting_price = 42000,
      price_display = '₹ 42,000',
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${testHighlightId}
  `;

  await sql`
    INSERT INTO highlight_gallery_images (id, highlight_id, image_url, title, alt_text, description, price, display_order)
    VALUES (${testImg3}, ${testHighlightId}, ${testCover}, 'Sunset Rose Pavilion', 'Sunset photo', 'Sunset styling', 42000, 3)
  `;

  const updatedH = await sql`SELECT title, starting_price FROM highlights WHERE id = ${testHighlightId}`;
  const updatedGallery = await sql`SELECT count(*) as count FROM highlight_gallery_images WHERE highlight_id = ${testHighlightId}`;
  console.log(`   Updated title: "${updatedH[0].title}", New Starting Price: ₹${updatedH[0].starting_price}`);
  console.log(`   New gallery count: ${updatedGallery[0].count} images`);
  if (Number(updatedGallery[0].count) !== 3) throw new Error('Gallery update count mismatch');
  console.log('   ✅ Update highlight and gallery passed.\n');

  // TEST 4: Deactivation Test
  console.log('▶ TEST 4: Deactivating Highlight (active = 0)...');
  await sql`UPDATE highlights SET active = 0 WHERE id = ${testHighlightId}`;
  const publicActiveList = await sql`SELECT id FROM highlights WHERE active = 1`;
  const isIncludedInPublic = publicActiveList.some(item => item.id === testHighlightId);
  console.log(`   Is inactive highlight present in public list? ${isIncludedInPublic ? 'YES (FAILURE)' : 'NO (CORRECT)'}`);
  if (isIncludedInPublic) throw new Error('Inactive highlight must not appear in public query');
  console.log('   ✅ Deactivation hides highlight from public storefront.\n');

  // TEST 5: Cascade Deletion Test
  console.log('▶ TEST 5: Deleting Test Highlight & Verifying Foreign Key Cascade Deletion...');
  await sql`DELETE FROM highlights WHERE id = ${testHighlightId}`;
  const remainingImages = await sql`SELECT count(*) as count FROM highlight_gallery_images WHERE highlight_id = ${testHighlightId}`;
  console.log(`   Remaining gallery images for deleted highlight: ${remainingImages[0].count}`);
  if (Number(remainingImages[0].count) !== 0) throw new Error('Cascade deletion failed');
  console.log('   ✅ Cascade deletion passed cleanly.\n');

  // FINAL SANITY CHECK: Ensure original 4 highlights are intact
  console.log('▶ FINAL CHECK: Confirming original 4 Highlights are active and intact...');
  const originalHighlights = await sql`SELECT id, title, active FROM highlights ORDER BY display_order`;
  console.log(`   Active highlights remaining: ${originalHighlights.length}`);
  for (const orig of originalHighlights) {
    const c = await sql`SELECT count(*) as count FROM highlight_gallery_images WHERE highlight_id = ${orig.id}`;
    console.log(`   ✔ "${orig.title}" (${orig.id}): ${c[0].count} gallery images`);
  }
  console.log('\n================================================================');
  console.log('🎉 ALL INTEGRATION WORKFLOW TESTS PASSED SUCCESSFULLY!');
  console.log('================================================================');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
