import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";
import { CATALOG_PRODUCTS } from "@/data/catalog";
import { ADDON_PRODUCTS } from "@/data/addons";

// Lazy-load or require node:sqlite DatabaseSync
let DatabaseSyncClass: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const sqlite = require("node:sqlite");
  DatabaseSyncClass = sqlite.DatabaseSync;
} catch (e) {
  console.error("Failed to load node:sqlite", e);
}

let dbInstance: any = null;

export function getDb() {
  if (dbInstance) return dbInstance;
  if ((globalThis as any)._occasions_db) {
    dbInstance = (globalThis as any)._occasions_db;
    return dbInstance;
  }

  // On Vercel / AWS Lambda serverless functions, the root filesystem is READ-ONLY.
  // The only writable path is `/tmp`.
  const isVercel = Boolean(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.VERCEL_ENV
  );
  const sourceDbPath = path.join(process.cwd(), "data", "occasions.db");

  let dbPath: string;
  if (isVercel) {
    const tmpDir = "/tmp";
    dbPath = path.join(tmpDir, "occasions.db");

    // If database already exists in data/occasions.db, copy it to /tmp initially
    if (!fs.existsSync(dbPath) && fs.existsSync(sourceDbPath)) {
      try {
        fs.copyFileSync(sourceDbPath, dbPath);
      } catch (e) {
        console.warn("Could not copy existing db to /tmp, creating fresh", e);
      }
    }
  } else {
    const dbDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    dbPath = path.join(dbDir, "occasions.db");
  }

  const db = new DatabaseSyncClass(dbPath);

  // Configure journal mode & foreign keys
  // Note: On Vercel / serverless /tmp, WAL mode requires shared memory (.shm files) which can fail.
  // Using MEMORY or DELETE journal mode is robust on serverless.
  if (isVercel) {
    db.exec("PRAGMA journal_mode = MEMORY;");
  } else {
    db.exec("PRAGMA journal_mode = WAL;");
  }
  db.exec("PRAGMA foreign_keys = ON;");

  initSchema(db);
  seedInitialData(db);

  dbInstance = db;
  (globalThis as any)._occasions_db = db;
  return db;
}

function initSchema(db: any) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password_hash TEXT,
      google_id TEXT,
      image TEXT,
      role TEXT DEFAULT 'customer',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      image TEXT
    );

    CREATE TABLE IF NOT EXISTS flower_types (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS occasions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      images TEXT NOT NULL, -- JSON array
      price REAL NOT NULL,
      discount_price REAL,
      stock INTEGER DEFAULT 50,
      sku TEXT,
      category_id TEXT,
      flower_type_id TEXT,
      occasion_id TEXT,
      featured INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
      rating REAL DEFAULT 4.8,
      reviews_count INTEGER DEFAULT 12,
      delivery_info TEXT,
      offers TEXT, -- JSON array
      includes TEXT, -- JSON array
      badge TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      variant_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS wishlist_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(user_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS addresses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      house TEXT NOT NULL,
      street TEXT NOT NULL,
      area TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pin_code TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      type TEXT DEFAULT 'Home',
      is_default INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      discount_type TEXT NOT NULL, -- 'percentage' | 'fixed'
      discount_value REAL NOT NULL,
      min_order_value REAL DEFAULT 0,
      max_discount REAL,
      expiry_date TEXT,
      usage_limit INTEGER DEFAULT 1000,
      times_used INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      subtotal REAL NOT NULL,
      delivery_charge REAL NOT NULL,
      discount REAL DEFAULT 0,
      final_amount REAL NOT NULL,
      coupon_code TEXT,
      delivery_address TEXT NOT NULL, -- JSON
      payment_method TEXT NOT NULL, -- JSON
      payment_status TEXT NOT NULL, -- 'pending' | 'paid' | 'failed' | 'refunded'
      order_status TEXT NOT NULL, -- 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled'
      tracking_timeline TEXT NOT NULL, -- JSON
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      product_price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      product_image TEXT,
      subtotal REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS delivery_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS phone_otps (
      phone TEXT PRIMARY KEY,
      otp TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS product_customizations (
      id TEXT PRIMARY KEY,
      enabled INTEGER DEFAULT 1,
      config_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS stem_prices (
      id TEXT PRIMARY KEY,
      flower_name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      price_per_stem REAL NOT NULL,
      min_stems INTEGER DEFAULT 6,
      max_stems INTEGER DEFAULT 50,
      active INTEGER DEFAULT 1,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      public_id TEXT,
      filename TEXT,
      format TEXT,
      size INTEGER,
      width INTEGER,
      height INTEGER,
      folder TEXT DEFAULT 'products',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS homepage_banners (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT,
      subtitle TEXT,
      button_text TEXT,
      button_link TEXT,
      desktop_image TEXT NOT NULL,
      mobile_image TEXT,
      badge TEXT,
      active INTEGER DEFAULT 1,
      display_order INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS homepage_sections (
      key TEXT PRIMARY KEY,
      title TEXT,
      subtitle TEXT,
      product_ids TEXT,
      active INTEGER DEFAULT 1,
      display_order INTEGER DEFAULT 0,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS delivery_tiers (
      id TEXT PRIMARY KEY,
      min_km REAL NOT NULL,
      max_km REAL NOT NULL,
      charge REAL NOT NULL,
      label TEXT,
      active INTEGER DEFAULT 1,
      display_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS website_content (
      slug TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS store_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Safe idempotent column additions
  function addColumnIfNotExists(table: string, column: string, typeDef: string) {
    try {
      const cols: any[] = db.prepare(`PRAGMA table_info("${table}")`).all();
      const exists = cols.some((c) => c.name === column);
      if (!exists) {
        db.exec(`ALTER TABLE "${table}" ADD COLUMN ${column} ${typeDef};`);
      }
    } catch (err) {
      console.warn(`Could not add column ${column} to ${table}:`, err);
    }
  }

  addColumnIfNotExists("products", "type", "TEXT DEFAULT 'general'");
  addColumnIfNotExists("products", "short_description", "TEXT");
  addColumnIfNotExists("products", "tags", "TEXT");
  addColumnIfNotExists("products", "status", "TEXT DEFAULT 'published'");
  addColumnIfNotExists("products", "low_stock_threshold", "INTEGER DEFAULT 5");
  addColumnIfNotExists("products", "seo_title", "TEXT");
  addColumnIfNotExists("products", "seo_description", "TEXT");
  addColumnIfNotExists("products", "attributes", "TEXT");

  addColumnIfNotExists("categories", "display_order", "INTEGER DEFAULT 0");
  addColumnIfNotExists("categories", "active", "INTEGER DEFAULT 1");
}

function seedInitialData(db: any) {
  const now = new Date().toISOString();

  // 1. Admin user
  const adminExists = db.prepare("SELECT id FROM users WHERE email = ?").get("admin@occasions.com");
  if (!adminExists) {
    const adminPasswordHash = bcrypt.hashSync("admin123", 10);
    db.prepare(`
      INSERT INTO users (id, name, email, phone, password_hash, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'admin', ?, ?)
    `).run(
      "admin-user-01",
      "Occasions Admin",
      "admin@occasions.com",
      "+91 8606464700",
      adminPasswordHash,
      now,
      now
    );
  }

  // 2. Categories
  const categories = [
    { id: "cat-flower-bouquet", name: "Flower Bouquet", slug: "flower-bouquet", description: "Fresh hand-tied flower bouquets for every celebration", image: "/images/categories/flower-bouquet.jpg", display_order: 1 },
    { id: "cat-flower-basket", name: "Flower Basket", slug: "flower-basket", description: "Artisanal woven baskets overflowing with seasonal blooms", image: "/images/categories/flower-basket.jpg", display_order: 2 },
    { id: "cat-cakes", name: "Cakes", slug: "cakes", description: "Delicious gourmet celebration cakes and desserts", image: "/images/cakes/cat-cakes-luxe.jpg", display_order: 3 },
    { id: "cat-table-decor", name: "Table Decor", slug: "table-decor", description: "Stunning floral centerpieces and table arrangements", image: "/images/categories/table-decor.jpg", display_order: 4 },
    { id: "cat-wreath", name: "Wreath", slug: "wreath", description: "Handcrafted memorial and celebration floral wreaths", image: "/images/categories/wreath.jpg", display_order: 5 },
  ];

  const insertCategory = db.prepare(`
    INSERT OR IGNORE INTO categories (id, name, slug, description, image, display_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const c of categories) {
    insertCategory.run(c.id, c.name, c.slug, c.description, c.image, c.display_order);
  }

  // 3. Flower Types
  const flowerTypes = [
    { id: "ft-roses", name: "Roses", slug: "roses" },
    { id: "ft-lilies", name: "Lilies", slug: "lilies" },
    { id: "ft-orchids", name: "Orchids", slug: "orchids" },
    { id: "ft-sunflowers", name: "Sunflowers", slug: "sunflowers" },
    { id: "ft-mixed-flowers", name: "Mixed Flowers", slug: "mixed-flowers" },
  ];

  const insertFlowerType = db.prepare(`
    INSERT OR IGNORE INTO flower_types (id, name, slug)
    VALUES (?, ?, ?)
  `);
  for (const ft of flowerTypes) {
    insertFlowerType.run(ft.id, ft.name, ft.slug);
  }

  // 4. Occasions
  const occasions = [
    { id: "occ-birthday", name: "Birthday", slug: "birthday" },
    { id: "occ-anniversary", name: "Anniversary", slug: "anniversary" },
    { id: "occ-wedding", name: "Wedding", slug: "wedding" },
    { id: "occ-valentines", name: "Valentine's Day", slug: "valentines-day" },
    { id: "occ-housewarming", name: "Housewarming", slug: "housewarming" },
    { id: "occ-just-because", name: "Just Because", slug: "just-because" },
  ];

  const insertOccasion = db.prepare(`
    INSERT OR IGNORE INTO occasions (id, name, slug)
    VALUES (?, ?, ?)
  `);
  for (const o of occasions) {
    insertOccasion.run(o.id, o.name, o.slug);
  }

  // 5. Coupons
  const coupons = [
    { id: "cpn-occ10", code: "OCCASIONS10", type: "percentage", value: 10, minOrder: 500, maxDiscount: 200 },
    { id: "cpn-flower50", code: "FLOWER50", type: "fixed", value: 50, minOrder: 400, maxDiscount: 50 },
    { id: "cpn-welcome100", code: "WELCOME100", type: "fixed", value: 100, minOrder: 999, maxDiscount: 100 },
    { id: "cpn-love15", code: "LOVE15", type: "percentage", value: 15, minOrder: 1200, maxDiscount: 300 },
  ];

  const insertCoupon = db.prepare(`
    INSERT OR IGNORE INTO coupons (id, code, discount_type, discount_value, min_order_value, max_discount, active)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `);
  for (const cp of coupons) {
    insertCoupon.run(cp.id, cp.code, cp.type, cp.value, cp.minOrder, cp.maxDiscount);
  }

  const findProduct = db.prepare("SELECT id FROM products WHERE id = ? OR slug = ?");
  const updateProduct = db.prepare(`
    UPDATE products SET
      id = ?,
      name = ?,
      slug = ?,
      description = ?,
      images = ?,
      price = ?,
      discount_price = ?,
      category_id = ?,
      flower_type_id = ?,
      occasion_id = ?,
      badge = ?,
      updated_at = ?
    WHERE id = ?
  `);
  const insertProduct = db.prepare(`
    INSERT INTO products (
      id, name, slug, description, images, price, discount_price, stock, sku,
      category_id, flower_type_id, occasion_id, featured, active, rating,
      reviews_count, delivery_info, offers, includes, badge, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const p of CATALOG_PRODUCTS) {
    // Map category
    let categoryId = "cat-flower-bouquet";
    if (p.category === "cakes") categoryId = "cat-cakes";
    else if (p.slug.includes("basket")) categoryId = "cat-flower-basket";
    else if (p.slug.includes("table")) categoryId = "cat-table-decor";
    else if (p.slug.includes("wreath")) categoryId = "cat-wreath";

    // Map flower type
    let flowerTypeId = "ft-mixed-flowers";
    const lower = (p.name + " " + p.slug).toLowerCase();
    if (lower.includes("rose")) flowerTypeId = "ft-roses";
    else if (lower.includes("lily") || lower.includes("lilies")) flowerTypeId = "ft-lilies";
    else if (lower.includes("orchid")) flowerTypeId = "ft-orchids";
    else if (lower.includes("sunflower")) flowerTypeId = "ft-sunflowers";

    // Map occasion
    let occasionId = "occ-birthday";
    if (lower.includes("anniversary")) occasionId = "occ-anniversary";
    else if (lower.includes("wedding")) occasionId = "occ-wedding";
    else if (lower.includes("valentine") || lower.includes("love")) occasionId = "occ-valentines";
    else if (lower.includes("housewarming")) occasionId = "occ-housewarming";

    const allImages = p.image
      ? [p.image, ...(Array.isArray(p.images) ? p.images.filter((img) => img !== p.image) : [])]
      : Array.isArray(p.images) && p.images.length > 0
      ? p.images
      : [];

    const existing = findProduct.get(p.id, p.slug);
    if (existing) {
      updateProduct.run(
        p.id,
        p.name,
        p.slug,
        p.description || "",
        JSON.stringify(allImages),
        p.price,
        p.originalPrice || null,
        categoryId,
        flowerTypeId,
        occasionId,
        p.badge || null,
        now,
        existing.id
      );
    } else {
      insertProduct.run(
        p.id,
        p.name,
        p.slug,
        p.description || "",
        JSON.stringify(allImages),
        p.price,
        p.originalPrice || null,
        45, // initial stock
        `SKU-${p.id.toUpperCase()}`,
        categoryId,
        flowerTypeId,
        occasionId,
        p.badge ? 1 : 0,
        1,
        p.rating || 4.8,
        p.reviewsCount || 10,
        p.deliveryInfo || "Express same-day Calicut delivery available",
        JSON.stringify(p.offers || []),
        JSON.stringify(p.includes || []),
        p.badge || null,
        now,
        now
      );
    }
  }

  // 6b. Seed Addon products (cakes, chocolates, gifts) so addon IDs resolve in orders & catalog
  for (const a of ADDON_PRODUCTS) {
    const existing = findProduct.get(a.id, a.id);
    if (!existing) {
      let catId = "cat-cakes";
      if (a.category === "Chocolates") catId = "cat-flower-basket";
      else if (a.category === "Soft Toys" || (a as any).category === "Gifts") catId = "cat-table-decor";

      insertProduct.run(
        a.id,
        a.name,
        a.id,
        a.name,
        JSON.stringify([a.image]),
        a.price,
        null,
        100,
        `SKU-${a.id.toUpperCase()}`,
        catId,
        "ft-mixed-flowers",
        "occ-birthday",
        0,
        1,
        5.0,
        25,
        "Same-day delivery available across Kerala",
        JSON.stringify([]),
        JSON.stringify([]),
        null,
        now,
        now
      );
    }
  }

  // Ensure any existing order items for blue floral cake reflect the correct name
  try {
    db.prepare(`UPDATE order_items SET product_name = 'Blue Floral Birthday Cake' WHERE product_id = 'cake-blue-floral'`).run();
  } catch {}

  // 7. Demo orders seeding removed for production integrity

  // 8. Stem Prices
  const defaultStemPrices = [
    { id: "sp-rose", name: "Rose", slug: "rose", price: 60, minStems: 6, maxStems: 100 },
    { id: "sp-carnation", name: "Carnation", slug: "carnation", price: 60, minStems: 6, maxStems: 50 },
    { id: "sp-orchid", name: "Orchid", slug: "orchid", price: 80, minStems: 4, maxStems: 50 },
    { id: "sp-sunflower", name: "Sunflower", slug: "sunflower", price: 250, minStems: 2, maxStems: 30 },
    { id: "sp-lily", name: "Lily / Stargazer", slug: "lily", price: 300, minStems: 2, maxStems: 30 },
    { id: "sp-rajnigandha", name: "Rajnigandha (Tuberose)", slug: "rajnigandha", price: 90, minStems: 6, maxStems: 50 },
    { id: "sp-gerbera", name: "Gerbera", slug: "gerbera", price: 50, minStems: 6, maxStems: 50 },
    { id: "sp-gladiolus", name: "Gladiolus", slug: "gladiolus", price: 200, minStems: 4, maxStems: 40 },
    { id: "sp-chrysanthemum", name: "Chrysanthemum", slug: "chrysanthemum", price: 50, minStems: 6, maxStems: 50 },
    { id: "sp-heliconia", name: "Heliconia", slug: "heliconia", price: 200, minStems: 2, maxStems: 20 },
  ];
  const insertStemPrice = db.prepare(`
    INSERT OR IGNORE INTO stem_prices (id, flower_name, slug, price_per_stem, min_stems, max_stems, active, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 1, ?)
  `);
  for (const sp of defaultStemPrices) {
    insertStemPrice.run(sp.id, sp.name, sp.slug, sp.price, sp.minStems, sp.maxStems, now);
  }

  // 9. Delivery Tiers
  const defaultTiers = [
    { id: "tier-1", minKm: 0, maxKm: 5, charge: 0, label: "0 – 5 km (Free Express)", order: 1 },
    { id: "tier-2", minKm: 5, maxKm: 20, charge: 150, label: "5 – 20 km (Standard City)", order: 2 },
    { id: "tier-3", minKm: 20, maxKm: 30, charge: 300, label: "20 – 30 km (Outer District)", order: 3 },
    { id: "tier-4", minKm: 30, maxKm: 40, charge: 400, label: "30 – 40 km (Suburban Express)", order: 4 },
    { id: "tier-5", minKm: 40, maxKm: 50, charge: 500, label: "40 – 50 km (Regional)", order: 5 },
  ];
  const insertTier = db.prepare(`
    INSERT OR IGNORE INTO delivery_tiers (id, min_km, max_km, charge, label, active, display_order)
    VALUES (?, ?, ?, ?, ?, 1, ?)
  `);
  for (const dt of defaultTiers) {
    insertTier.run(dt.id, dt.minKm, dt.maxKm, dt.charge, dt.label, dt.order);
  }

  // 10. Delivery Settings
  const defaultDeliverySettings = [
    { key: "allow_sunday_delivery", value: "false" },
    { key: "store_latitude", value: "11.2588" },
    { key: "store_longitude", value: "75.7804" },
    { key: "delivery_slots", value: JSON.stringify(["Morning (9:00 AM - 1:00 PM)", "Afternoon (1:00 PM - 5:00 PM)", "Evening (5:00 PM - 9:00 PM)"]) },
  ];
  const insertDeliverySetting = db.prepare(`
    INSERT OR IGNORE INTO delivery_settings (key, value) VALUES (?, ?)
  `);
  for (const ds of defaultDeliverySettings) {
    insertDeliverySetting.run(ds.key, ds.value);
  }

  // 11. Homepage Banners
  const defaultBanners = [
    {
      id: "banner-xmas",
      type: "promo",
      title: "Xmas Special",
      subtitle: "Celebrate with Festive Gifts & Sweets",
      button_text: "Shop Festive",
      button_link: "/occasions",
      desktop_image: "/images/banners/love-romance.png",
      mobile_image: "/images/banners/love-romance.png",
      badge: "Xmas Special",
      order: 1,
    },
    {
      id: "banner-diwali",
      type: "promo",
      title: "Diwali Offer",
      subtitle: "Share Happiness, Lights & Gift Hampers",
      button_text: "Shop Diwali",
      button_link: "/occasions",
      desktop_image: "/images/banners/dwali.jpg.jpeg",
      mobile_image: "/images/banners/dwali.jpg.jpeg",
      badge: "Diwali Offer",
      order: 2,
    },
    {
      id: "banner-new-year",
      type: "promo",
      title: "New Year Offer",
      subtitle: "Welcome the New Year with Floral Celebrations",
      button_text: "Shop New Year",
      button_link: "/occasions",
      desktop_image: "/images/banners/NEW YEAR.jpeg",
      mobile_image: "/images/banners/NEW YEAR.jpeg",
      badge: "New Year Offer",
      order: 3,
    },
    {
      id: "banner-mothers-day",
      type: "promo",
      title: "Mother's Day Special",
      subtitle: "Celebrate Mom with Heartfelt Blooms & Gifts",
      button_text: "Shop Mother's Day",
      button_link: "/occasions",
      desktop_image: "/images/banners/mothers day.jpg.jpeg",
      mobile_image: "/images/banners/mothers day.jpg.jpeg",
      badge: "Mother's Day Special",
      order: 4,
    },
  ];
  const insertBanner = db.prepare(`
    INSERT OR IGNORE INTO homepage_banners (id, type, title, subtitle, button_text, button_link, desktop_image, mobile_image, badge, active, display_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
  `);
  for (const b of defaultBanners) {
    insertBanner.run(b.id, b.type, b.title, b.subtitle, b.button_text, b.button_link, b.desktop_image, b.mobile_image, b.badge, b.order, now, now);
  }

  // 12. Homepage Sections
  const defaultSections = [
    {
      key: "featured_products",
      title: "Featured Masterpieces",
      subtitle: "Our florists' hand-picked bestsellers",
      product_ids: JSON.stringify(["flower-oriental-sunset-lily-bouquet", "flower-rajnigandha-fragrant-bunch", "flower-3", "cake-chocolate-truffle"]),
      order: 1,
    },
    {
      key: "new_arrivals",
      title: "New Seasonal Arrivals",
      subtitle: "Freshly sourced from botanical highlands",
      product_ids: JSON.stringify(["flower-oriental-sunset-lily-bouquet", "flower-rajnigandha-fragrant-bunch"]),
      order: 2,
    },
  ];
  const insertSection = db.prepare(`
    INSERT OR IGNORE INTO homepage_sections (key, title, subtitle, product_ids, active, display_order, updated_at)
    VALUES (?, ?, ?, ?, 1, ?, ?)
  `);
  for (const s of defaultSections) {
    insertSection.run(s.key, s.title, s.subtitle, s.product_ids, s.order, now);
  }

  // 13. Website Content
  const defaultContent = [
    {
      slug: "about",
      title: "About Occassions Florist",
      content: "Welcome to Occassions, Kozhikode's premier boutique floral design studio. We specialize in handcrafted fresh floral bouquets, elegant gift baskets, gourmet cakes, and bespoke event decorations. Every bouquet is crafted with care, passion, and botanical precision to celebrate your most cherished moments.",
    },
    {
      slug: "contact",
      title: "Contact Information",
      content: "Phone: +91 8606464700 | WhatsApp: +91 9447446008 | Email: occassions.flowers@gmail.com | Location: Mavoor Road, Arayidathupalam, Kozhikode (Calicut), Kerala 673004. Open 9:00 AM - 9:00 PM every day.",
    },
    {
      slug: "faqs",
      title: "Frequently Asked Questions",
      content: "Q: Do you offer same-day delivery? Yes, orders placed before 5:00 PM are eligible for same-day refrigerated express delivery across Kozhikode.\n\nQ: Can I customize my bouquet stems? Absolutely! Use our Flower Customizer to select custom stems, wrapping, and ribbon colors.",
    },
    {
      slug: "privacy",
      title: "Privacy Policy",
      content: "At Occassions, your privacy is our top priority. We only collect the necessary information required to process and deliver your orders securely.",
    },
    {
      slug: "terms",
      title: "Terms and Conditions",
      content: "All orders placed on Occassions are subject to product availability and delivery schedule confirmation. Cancellations are permitted up to 4 hours prior to scheduled delivery.",
    },
    {
      slug: "refund",
      title: "Refund Policy",
      content: "If you receive damaged or unsatisfactory flowers, contact us within 2 hours of delivery with photographic evidence for an immediate replacement or full refund.",
    },
  ];
  const insertContent = db.prepare(`
    INSERT OR IGNORE INTO website_content (slug, title, content, updated_at)
    VALUES (?, ?, ?, ?)
  `);
  for (const c of defaultContent) {
    insertContent.run(c.slug, c.title, c.content, now);
  }

  // 14. Store Settings
  const defaultSettings = [
    { key: "store_name", value: "Occassions" },
    { key: "store_tagline", value: "Luxury Florist & Celebration Atelier" },
    { key: "store_phone", value: "+91 8606464700" },
    { key: "store_whatsapp", value: "919447446008" },
    { key: "store_email", value: "occassions.flowers@gmail.com" },
    { key: "store_address", value: "Mavoor Road, Kozhikode (Calicut), Kerala 673004" },
    { key: "opening_hours", value: "9:00 AM - 9:00 PM Daily" },
    { key: "currency_symbol", value: "₹" },
    { key: "tax_percentage", value: "0" },
  ];
  const insertSetting = db.prepare(`
    INSERT OR IGNORE INTO store_settings (key, value) VALUES (?, ?)
  `);
  for (const st of defaultSettings) {
    insertSetting.run(st.key, st.value);
  }

  // 15. Safe classification migration for existing products
  try {
    db.prepare(`UPDATE products SET status = 'published' WHERE status IS NULL OR status = ''`).run();
    db.prepare(`UPDATE products SET low_stock_threshold = 5 WHERE low_stock_threshold IS NULL`).run();
    db.prepare(`UPDATE products SET category_id = 'cat-wreath' WHERE category_id = 'cat-wreaths'`).run();
    db.prepare(`UPDATE products SET type = 'cake' WHERE (type IS NULL OR type = 'general') AND (category_id = 'cat-cakes' OR id LIKE 'cake-%' OR slug LIKE '%cake%')`).run();
    db.prepare(`UPDATE products SET type = 'basket' WHERE (type IS NULL OR type = 'general') AND (category_id = 'cat-flower-basket' OR slug LIKE '%basket%' OR name LIKE '%basket%')`).run();
    db.prepare(`UPDATE products SET type = 'wreath' WHERE (type IS NULL OR type = 'general') AND (category_id = 'cat-wreath' OR slug LIKE '%wreath%' OR name LIKE '%wreath%')`).run();
    db.prepare(`UPDATE products SET type = 'decor' WHERE (type IS NULL OR type = 'general') AND (category_id = 'cat-table-decor' OR slug LIKE '%table%' OR slug LIKE '%decor%')`).run();
    db.prepare(`UPDATE products SET type = 'flower' WHERE (type IS NULL OR type = 'general') AND (category_id = 'cat-flower-bouquet' OR category_id = 'flower' OR id LIKE 'flower-%')`).run();
  } catch (err) {
    console.warn("Product classification migration warning:", err);
  }
}
