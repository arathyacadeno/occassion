import {
  getProductBySlug,
  getFlowerBouquets,
  getFlowerBaskets,
  getProductsByCategory,
  getAllProducts,
  Product,
} from "@/data/catalog";
import { getDb } from "@/lib/db";
import { sql } from "@/lib/db/neon";

export function mapDbToProduct(dbProduct: any): Product {
  let images: string[] = [];
  try {
    images = JSON.parse(dbProduct.images || "[]");
  } catch {
    images = dbProduct.images ? [dbProduct.images] : [];
  }
  if (!images.length) {
    images = ["/images/flower-bouquet/Sunflower Bouquet with Ribbon Tag.png"];
  }

  let offers: string[] = [];
  try {
    offers = JSON.parse(dbProduct.offers || "[]");
  } catch {
    offers = [];
  }
  if (!offers.length) {
    offers = ["10% off on your first order with code WELCOME10"];
  }

  let includes: string[] = [];
  try {
    includes = JSON.parse(dbProduct.includes || "[]");
  } catch {
    includes = [];
  }
  if (!includes.length) {
    includes = ["Fresh Flowers", "Eco-friendly hydration wrap", "Greeting card"];
  }

  let category: Product["category"] = "flower";
  const catSlug = (dbProduct.category_slug || dbProduct.category_id || "").toLowerCase();
  if (catSlug.includes("cake")) category = "cakes";
  else if (catSlug.includes("table")) category = "table-decor";
  else if (catSlug.includes("wreath")) category = "wreaths";
  else if (catSlug.includes("special") || catSlug.includes("occ")) category = "special-occasions";

  return {
    id: dbProduct.id,
    slug: dbProduct.slug || dbProduct.id,
    name: dbProduct.name,
    price: Number(dbProduct.price) || 999,
    originalPrice: dbProduct.discount_price ? Number(dbProduct.discount_price) : undefined,
    category,
    categoryLabel: dbProduct.category_name || "Flower Bouquet",
    image: images[0],
    images,
    rating: dbProduct.rating || 4.9,
    reviewsCount: dbProduct.reviews_count || 18,
    description: dbProduct.description || "Freshly handpicked flowers arranged with care by Occasions artisans.",
    deliveryInfo: dbProduct.delivery_info || "Same-day delivery available across Kerala",
    offers,
    includes,
    badge: dbProduct.badge || undefined,
    shortDescription: dbProduct.short_description || undefined,
  };
}

export async function getProduct(category: string, slug: string): Promise<Product | null> {
  const decodedSlug = decodeURIComponent(slug).trim();

  // 1. Try static catalog
  const catalogProduct =
    getProductBySlug(category, decodedSlug) ||
    getProductBySlug("flower", decodedSlug) ||
    getProductBySlug("special-occasions", decodedSlug) ||
    getProductBySlug("cakes", decodedSlug) ||
    getProductBySlug("table-decor", decodedSlug) ||
    getProductBySlug("wreaths", decodedSlug);

  if (catalogProduct) return catalogProduct;

  // 2. Try Neon PostgreSQL
  if (process.env.DATABASE_URL) {
    try {
      const rows = await sql`
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.slug = ${decodedSlug} OR p.id = ${decodedSlug}
        LIMIT 1
      `;
      if (rows && rows.length > 0) {
        return mapDbToProduct(rows[0]);
      }
    } catch (e) {
      console.warn("Neon product lookup fallback:", e);
    }
  }

  // 3. Try SQLite
  try {
    const db = getDb();
    const row = db.prepare(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.slug = ? OR p.id = ?
      LIMIT 1
    `).get(decodedSlug, decodedSlug);
    if (row) {
      return mapDbToProduct(row);
    }
  } catch (e) {
    console.warn("SQLite product lookup error:", e);
  }

  return null;
}

export async function getStorefrontCategoryProducts(categoryType: string): Promise<Product[]> {
  // 1. Get base static products
  let baseProducts: Product[] = [];
  if (categoryType === "flower-bouquets" || categoryType === "bouquets") {
    baseProducts = getFlowerBouquets();
  } else if (categoryType === "flower-baskets" || categoryType === "baskets") {
    baseProducts = getFlowerBaskets();
  } else if (categoryType === "cakes") {
    baseProducts = getProductsByCategory("cakes").filter((p) => !p.id.startsWith("addon-"));
  } else if (categoryType === "table-decor") {
    baseProducts = getProductsByCategory("table-decor");
  } else if (categoryType === "wreaths") {
    baseProducts = getProductsByCategory("wreaths");
  } else if (categoryType === "special-occasions") {
    baseProducts = getProductsByCategory("special-occasions");
  } else {
    baseProducts = getAllProducts();
  }

  // 2. Fetch live published products from database
  let dbRows: any[] = [];

  if (process.env.DATABASE_URL) {
    try {
      dbRows = await sql`
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.active = 1 AND (p.status = 'published' OR p.status IS NULL OR p.status = '')
        ORDER BY p.created_at DESC
      `;
    } catch (e) {
      console.warn("Neon category products fetch fallback:", e);
    }
  }

  if (!dbRows || dbRows.length === 0) {
    try {
      const db = getDb();
      dbRows = db.prepare(`
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.active = 1 AND (p.status = 'published' OR p.status IS NULL OR p.status = '')
        ORDER BY p.created_at DESC
      `).all();
    } catch (e) {
      console.warn("SQLite category products fetch error:", e);
    }
  }

  if (!dbRows || dbRows.length === 0) {
    return baseProducts;
  }

  // Filter dbRows matching this category
  const filteredDbProducts = dbRows.filter((row: any) => {
    const catId = (row.category_id || "").toLowerCase();
    const catSlug = (row.category_slug || "").toLowerCase();
    const name = (row.name || "").toLowerCase();
    const desc = (row.description || "").toLowerCase();

    if (categoryType === "flower-bouquets" || categoryType === "bouquets") {
      return (
        catId === "cat-flower-bouquet" ||
        catSlug === "flower-bouquet" ||
        catId.includes("bouquet") ||
        catSlug.includes("bouquet") ||
        name.includes("bouquet") ||
        desc.includes("bouquet")
      );
    }
    if (categoryType === "flower-baskets" || categoryType === "baskets") {
      return (
        catId === "cat-flower-basket" ||
        catSlug === "flower-basket" ||
        catId.includes("basket") ||
        catSlug.includes("basket") ||
        name.includes("basket")
      );
    }
    if (categoryType === "cakes") {
      return (
        catId === "cat-cake" ||
        catSlug === "cakes" ||
        catSlug === "cake" ||
        catId.includes("cake") ||
        name.includes("cake")
      );
    }
    if (categoryType === "table-decor") {
      return (
        catId === "cat-table-decor" ||
        catSlug === "table-decor" ||
        catId.includes("table") ||
        name.includes("table") ||
        name.includes("centerpiece")
      );
    }
    if (categoryType === "wreaths") {
      return (
        catId === "cat-wreath" ||
        catSlug === "wreaths" ||
        catSlug === "wreath" ||
        catId.includes("wreath") ||
        name.includes("wreath")
      );
    }
    if (categoryType === "special-occasions") {
      return (
        catId.startsWith("occ-") ||
        row.occasion_id !== null ||
        catSlug === "special-occasions"
      );
    }
    return true;
  });

  const mappedDb = filteredDbProducts.map(mapDbToProduct);

  // Merge: Database products first, avoiding duplicates
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();
  const merged: Product[] = [];

  for (const p of mappedDb) {
    seenIds.add(p.id.toLowerCase());
    seenSlugs.add(p.slug.toLowerCase());
    merged.push(p);
  }

  for (const p of baseProducts) {
    if (!seenIds.has(p.id.toLowerCase()) && !seenSlugs.has(p.slug.toLowerCase())) {
      seenIds.add(p.id.toLowerCase());
      seenSlugs.add(p.slug.toLowerCase());
      merged.push(p);
    }
  }

  return merged;
}
