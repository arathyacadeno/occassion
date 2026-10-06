import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";
import { CATALOG_PRODUCTS } from "@/data/catalog";

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
  `);
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
    { id: "cat-flower-bouquet", name: "Flower Bouquet", slug: "flower-bouquet", description: "Fresh hand-tied flower bouquets for every celebration", image: "/images/lily-6-stems.png" },
    { id: "cat-flower-basket", name: "Flower Basket", slug: "flower-basket", description: "Artisanal woven baskets overflowing with seasonal blooms", image: "/images/flower-basket-pink-lilies.jpg" },
    { id: "cat-cakes", name: "Cakes", slug: "cakes", description: "Delicious gourmet celebration cakes and desserts", image: "/images/cake-chocolate.jpg" },
    { id: "cat-table-decor", name: "Table Decor", slug: "table-decor", description: "Stunning floral centerpieces and table arrangements", image: "/images/table-arrangement.jpg" },
    { id: "cat-wreath", name: "Wreath", slug: "wreath", description: "Handcrafted memorial and celebration floral wreaths", image: "/images/wreath-white-lilies.jpg" },
  ];

  const insertCategory = db.prepare(`
    INSERT OR IGNORE INTO categories (id, name, slug, description, image)
    VALUES (?, ?, ?, ?, ?)
  `);
  for (const c of categories) {
    insertCategory.run(c.id, c.name, c.slug, c.description, c.image);
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

  // 6. Products from CATALOG_PRODUCTS
  const productCount = db.prepare("SELECT count(*) as count FROM products").get();
  if (productCount && productCount.count === 0) {
    const insertProduct = db.prepare(`
      INSERT OR IGNORE INTO products (
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

      const allImages = Array.isArray(p.images) && p.images.length > 0 ? p.images : [p.image];

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

  // 7. Seed demo orders (matching track-order demo IDs: OCC-100123 and OCC-100098)
  const orderCount = db.prepare("SELECT count(*) as count FROM orders").get();
  if (orderCount && orderCount.count === 0) {
    const demoOrders = [
      {
        id: "OCC-100123",
        userId: "admin-user-01",
        customerName: "Arathy T P",
        customerEmail: "arathy@example.com",
        customerPhone: "+91 8606464700",
        subtotal: 1299,
        deliveryCharge: 0,
        discount: 100,
        finalAmount: 1199,
        couponCode: "WELCOME100",
        deliveryAddress: JSON.stringify({
          fullName: "Arathy T P",
          phone: "+91 8606464700",
          house: "Lotus Villa, 4B",
          street: "Mavoor Road",
          area: "Arayidathupalam",
          city: "Kozhikode (Calicut)",
          state: "Kerala",
          pinCode: "673004",
        }),
        paymentMethod: JSON.stringify({ type: "UPI", label: "Google Pay / PhonePe" }),
        paymentStatus: "paid",
        orderStatus: "out_for_delivery",
        trackingTimeline: JSON.stringify([
          { status: "confirmed", title: "Order Confirmed", time: "10:30 AM", date: "Today", completed: true, desc: "Order details received and accepted" },
          { status: "preparing", title: "Floral Crafting & Quality Check", time: "11:45 AM", date: "Today", completed: true, desc: "Master florist handcrafting fresh flowers" },
          { status: "out_for_delivery", title: "Out for Calicut Delivery", time: "01:15 PM", date: "Today", completed: true, current: true, desc: "Assigned to express refrigerated delivery courier" },
          { status: "delivered", title: "Delivered to Recipient", time: "Est. 02:45 PM", date: "Today", completed: false, desc: "Handover with signature and personalized greeting card" },
        ]),
        notes: "Please call before arrival",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: [
          {
            id: "item-101",
            productId: "flower-lily-celestial-daisy",
            productName: "Lily and the Celestial Daisy",
            productPrice: 695,
            quantity: 1,
            productImage: "/images/lily-6-stems.png",
            subtotal: 695,
          },
          {
            id: "item-102",
            productId: "flower-basket-pink-lilies",
            productName: "Pink Lily Celebration Basket",
            productPrice: 604,
            quantity: 1,
            productImage: "/images/flower-basket-pink-lilies.jpg",
            subtotal: 604,
          },
        ],
      },
      {
        id: "OCC-100098",
        userId: "admin-user-01",
        customerName: "Rahul Menon",
        customerEmail: "rahul@example.com",
        customerPhone: "+91 9847000000",
        subtotal: 1450,
        deliveryCharge: 150,
        discount: 0,
        finalAmount: 1600,
        couponCode: null,
        deliveryAddress: JSON.stringify({
          fullName: "Rahul Menon",
          phone: "+91 9847000000",
          house: "Emerald Heights, Flat 7C",
          street: "Beach Road",
          area: "Vellayil",
          city: "Kozhikode",
          state: "Kerala",
          pinCode: "673011",
        }),
        paymentMethod: JSON.stringify({ type: "Card", label: "Credit Card" }),
        paymentStatus: "paid",
        orderStatus: "delivered",
        trackingTimeline: JSON.stringify([
          { status: "confirmed", title: "Order Confirmed", time: "09:00 AM", date: "Yesterday", completed: true, desc: "Order details received and accepted" },
          { status: "preparing", title: "Floral Crafting & Quality Check", time: "10:15 AM", date: "Yesterday", completed: true, desc: "Handcrafted with fresh stems" },
          { status: "out_for_delivery", title: "Out for Calicut Delivery", time: "11:30 AM", date: "Yesterday", completed: true, desc: "Handed over to courier" },
          { status: "delivered", title: "Delivered to Recipient", time: "12:45 PM", date: "Yesterday", completed: true, current: true, desc: "Delivered with personalized card and smile" },
        ]),
        notes: "",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        items: [
          {
            id: "item-201",
            productId: "flower-scarlet-whisper-rose",
            productName: "Scarlet Whisper Crimson Roses",
            productPrice: 1450,
            quantity: 1,
            productImage: "/images/rose-crimson.jpg",
            subtotal: 1450,
          },
        ],
      },
    ];

    const insertOrder = db.prepare(`
      INSERT INTO orders (
        id, user_id, customer_name, customer_email, customer_phone,
        subtotal, delivery_charge, discount, final_amount, coupon_code,
        delivery_address, payment_method, payment_status, order_status,
        tracking_timeline, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertOrderItem = db.prepare(`
      INSERT INTO order_items (
        id, order_id, product_id, product_name, product_price,
        quantity, product_image, subtotal
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const o of demoOrders) {
      insertOrder.run(
        o.id,
        o.userId,
        o.customerName,
        o.customerEmail,
        o.customerPhone,
        o.subtotal,
        o.deliveryCharge,
        o.discount,
        o.finalAmount,
        o.couponCode,
        o.deliveryAddress,
        o.paymentMethod,
        o.paymentStatus,
        o.orderStatus,
        o.trackingTimeline,
        o.notes,
        o.createdAt,
        o.updatedAt
      );

      for (const item of o.items) {
        insertOrderItem.run(
          item.id,
          o.id,
          item.productId,
          item.productName,
          item.productPrice,
          item.quantity,
          item.productImage,
          item.subtotal
        );
      }
    }
  }
}
