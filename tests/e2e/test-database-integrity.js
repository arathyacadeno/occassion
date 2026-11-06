/**
 * Occasions E-Commerce Platform - End-to-End Test Suite
 * Section 6: Database & Integrity Testing (Neon PostgreSQL Single Source of Truth)
 */

const { sql, queryNeon } = require("./helpers");
const fs = require("fs");
const path = require("path");

async function runDatabaseIntegrityTests() {
  console.log("=================================================");
  console.log("   SECTION 6: DATABASE & INTEGRITY TESTING (NEON)");
  console.log("=================================================");

  const results = { passed: [], failed: [] };

  function assert(condition, testName, detail = "") {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      results.passed.push(testName);
    } else {
      console.error(`  ✗ FAIL: ${testName} - ${detail}`);
      results.failed.push({ testName, detail });
    }
  }

  // 6.1 Verify All Required Tables in Neon PostgreSQL
  const requiredTables = [
    "users",
    "products",
    "categories",
    "orders",
    "order_items",
    "cart_items",
    "wishlist_items",
    "addresses",
    "coupons",
    "delivery_tiers",
    "flower_types",
    "occasions",
    "homepage_banners",
    "homepage_sections",
    "store_settings",
    "media",
    "phone_otps",
    "contact_inquiries",
    "stem_prices",
    "product_customizations",
    "website_content",
    "delivery_settings",
  ];

  try {
    const tableRows = await queryNeon(() => sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    const existingTableNames = tableRows.map((r) => r.table_name);

    for (const table of requiredTables) {
      const exists = existingTableNames.includes(table);
      assert(exists, `6.1 Neon table '${table}' exists in public schema`);
    }

    assert(existingTableNames.length >= 22, `6.1 At least 22 tables present in Neon schema (${existingTableNames.length} found)`);
  } catch (err) {
    assert(false, "6.1 Neon schema tables verification", err.message);
  }

  // 6.2 Data Integrity and Relationships Check
  try {
    // 1. Check order items without valid order (orphaned order items)
    const orphanedOrderItems = await queryNeon(() => sql`
      SELECT oi.id, oi.order_id 
      FROM order_items oi
      LEFT JOIN orders o ON oi.order_id = o.id
      WHERE o.id IS NULL
      LIMIT 10
    `);
    assert(orphanedOrderItems.length === 0, "6.2 No orphaned order_items (all order_items link to valid orders)");

    // 2. Check addresses with invalid user_id
    const orphanedAddresses = await queryNeon(() => sql`
      SELECT a.id, a.user_id
      FROM addresses a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.user_id IS NOT NULL AND u.id IS NULL
      LIMIT 10
    `);
    assert(orphanedAddresses.length === 0, "6.2 All user addresses link to valid registered users");

    // 3. Check cart items with invalid user_id
    const orphanedCartItems = await queryNeon(() => sql`
      SELECT c.id, c.user_id
      FROM cart_items c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE u.id IS NULL
      LIMIT 10
    `);
    assert(orphanedCartItems.length === 0, "6.2 All cart items link to valid registered users");

    // 4. Check wishlist items with invalid user_id
    const orphanedWishlistItems = await queryNeon(() => sql`
      SELECT w.id, w.user_id
      FROM wishlist_items w
      LEFT JOIN users u ON w.user_id = u.id
      WHERE u.id IS NULL
      LIMIT 10
    `);
    assert(orphanedWishlistItems.length === 0, "6.2 All wishlist items link to valid registered users");

    // 5. Check products belong to existing category
    const productsWithoutCategory = await queryNeon(() => sql`
      SELECT p.id, p.name, p.category_id
      FROM products p
      LEFT JOIN categories c ON (p.category_id = c.id OR p.category_id = c.slug)
      WHERE p.category_id IS NOT NULL AND c.id IS NULL
      LIMIT 10
    `);
    assert(productsWithoutCategory.length === 0, "6.2 All products have valid matching category records");
  } catch (err) {
    assert(false, "6.2 Data integrity & relationship audit", err.message);
  }

  // 6.3 Codebase Audit: Zero SQLite imports / queries in production routes
  try {
    function walkDir(dir) {
      let files = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name !== "node_modules" && entry.name !== ".next" && entry.name !== "scratch") {
            files = files.concat(walkDir(full));
          }
        } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx") || entry.name.endsWith(".js")) {
          files.push(full);
        }
      }
      return files;
    }

    const appFiles = walkDir(path.resolve(process.cwd(), "src/app/api"));
    const libFiles = walkDir(path.resolve(process.cwd(), "src/lib")).filter(
      (f) => !f.includes(path.normalize("lib/db/sqlite.ts")) // legacy sqlite file retained as archive
    );

    const activeProdFiles = [...appFiles, ...libFiles];
    const violations = [];

    for (const f of activeProdFiles) {
      const content = fs.readFileSync(f, "utf8");
      if (content.includes("better-sqlite3") || content.includes("@/lib/db/sqlite")) {
        violations.push(path.relative(process.cwd(), f));
      }
    }

    assert(violations.length === 0, `6.3 Zero SQLite references in active production routes and libraries (${violations.length} found)`);
    if (violations.length > 0) {
      console.warn("  Violations:", violations);
    }
  } catch (err) {
    assert(false, "6.3 SQLite deprecation audit", err.message);
  }

  // 6.4 Transaction Rollback on Failure Verification
  try {
    const canaryProductId = "test-canary-tx-" + Date.now();

    let rollbackSuccessful = false;
    try {
      await sql.transaction([
        sql`
          INSERT INTO products (
            id, name, slug, description, images, price, stock, active
          ) VALUES (
            ${canaryProductId}, 'Canary Product', ${canaryProductId}, 'Testing tx rollback',
            '["/images/canary.jpg"]', 999, 10, 1
          )
        `,
        // Intentional failure: referencing non-existent table
        sql`INSERT INTO __completely_nonexistent_table_for_rollback_test__ (id) VALUES ('fail')`,
      ]);
    } catch (txErr) {
      // Expected transaction failure
      rollbackSuccessful = true;
    }

    assert(rollbackSuccessful, "6.4 SQL Transaction intentionally aborted on simulated query failure");

    // Verify Canary product was NOT committed (atomic rollback check)
    const canaryCheck = await queryNeon(() => sql`SELECT id FROM products WHERE id = ${canaryProductId}`);
    assert(canaryCheck.length === 0, "6.4 Canary product was rolled back completely (0 rows committed in Neon)");
  } catch (err) {
    assert(false, "6.4 Transaction rollback test", err.message);
  }

  // 6.5 Connection Pooling & Error Resilience
  try {
    // Test multiple concurrent queries
    const queries = Array.from({ length: 5 }, (_, i) =>
      queryNeon(() => sql`SELECT ${i + 1} as test_index`)
    );
    const resultsArray = await Promise.all(queries);

    const allSuccessful = resultsArray.every((res, idx) => Number(res[0]?.test_index) === idx + 1);
    assert(allSuccessful, "6.5 Neon PostgreSQL connection pool handles concurrent requests smoothly");
  } catch (err) {
    assert(false, "6.5 Connection pooling test", err.message);
  }

  console.log(`\nSection 6 Results: ${results.passed.length} Passed, ${results.failed.length} Failed\n`);
  if (results.failed.length > 0) {
    process.exit(1);
  }
}

runDatabaseIntegrityTests().catch(console.error);

