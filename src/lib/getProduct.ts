import {
  getProductBySlug,
  getFlowerBouquets,
  getFlowerBaskets,
  getProductsByCategory,
  getAllProducts,
  CATALOG_PRODUCTS,
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
    rating: Number(dbProduct.rating) || 4.9,
    reviewsCount: Number(dbProduct.reviews_count) || 18,
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
  // 1. Get base curated products (identical to original verified catalog)
  let baseProducts: Product[] = [];
  if (categoryType === "flower-bouquets" || categoryType === "bouquets") {
    baseProducts = getFlowerBouquets();
  } else if (categoryType === "flower-baskets" || categoryType === "baskets") {
    baseProducts = getFlowerBaskets();
  } else if (categoryType === "cakes") {
    baseProducts = getProductsByCategory("cakes").filter(
      (p) => !p.id.startsWith("addon-") && !p.slug.startsWith("addon-")
    );
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

  // Map of live published DB rows by ID and Slug
  const dbRowById = new Map<string, any>();
  const dbRowBySlug = new Map<string, any>();
  for (const r of dbRows) {
    if (r.id) dbRowById.set(r.id, r);
    if (r.slug) dbRowBySlug.set(r.slug.toLowerCase(), r);
  }

  // 3. Update base products with live edits from database (e.g. image replacements, price changes)
  // or suppress if marked inactive/drafted
  const updatedBaseProducts: Product[] = [];
  for (const bp of baseProducts) {
    const dbMatch = dbRowById.get(bp.id) || dbRowBySlug.get(bp.slug.toLowerCase());
    if (dbMatch) {
      if (dbMatch.active === 0 || dbMatch.status === "draft" || dbMatch.status === "archived") {
        continue;
      }
      const mapped = mapDbToProduct(dbMatch);
      updatedBaseProducts.push({
        ...bp,
        ...mapped,
        category: bp.category,
      });
    } else {
      updatedBaseProducts.push(bp);
    }
  }

  // Deduplication sets based on updated base products
  const seenIds = new Set(updatedBaseProducts.map((p) => p.id));
  const seenSlugs = new Set(updatedBaseProducts.map((p) => p.slug.toLowerCase()));
  const seenNames = new Set(updatedBaseProducts.map((p) => p.name.trim().toLowerCase()));
  const seenImages = new Set(
    updatedBaseProducts
      .map((p) => (p.image || "").trim().toLowerCase())
      .filter(Boolean)
  );

  // 4. Filter ONLY newly created admin products (created via Admin Dashboard with 'prod-' or 'prod_' prefix)
  const newlyCreatedAdminProducts: Product[] = [];

  for (const row of dbRows) {
    // Skip all addon items
    if (row.id.startsWith("addon-") || (row.slug || "").startsWith("addon-")) {
      continue;
    }

    // Must be a genuinely new product added via Admin (starts with 'prod-' or 'prod_')
    const isNewAdminProduct = row.id.startsWith("prod-") || row.id.startsWith("prod_");

    if (!isNewAdminProduct) {
      continue;
    }

    const cat = (row.category_id || "").toLowerCase().replace(/^cat-/, "");
    const name = (row.name || "").toLowerCase();
    const desc = (row.description || "").toLowerCase();

    let matchesCategory = false;
    if (categoryType === "flower-bouquets" || categoryType === "bouquets") {
      matchesCategory =
        (cat === "flower-bouquet" || cat === "bouquet" || (!cat.includes("cake") && !cat.includes("table") && !cat.includes("wreath") && !cat.includes("basket") && !cat.includes("addon"))) &&
        !name.includes("basket") &&
        !desc.includes("in a basket") &&
        !name.includes("cake") &&
        !name.includes("table") &&
        !name.includes("wreath") &&
        !name.includes("runner") &&
        !name.includes("centerpiece") &&
        !name.includes("box") &&
        !name.includes("bear") &&
        !name.includes("chocolate");
    } else if (categoryType === "flower-baskets" || categoryType === "baskets") {
      matchesCategory = cat === "flower-basket" || cat === "basket" || name.includes("basket");
    } else if (categoryType === "cakes") {
      matchesCategory = (cat === "cakes" || cat === "cake" || name.includes("cake")) && !name.includes("basket");
    } else if (categoryType === "table-decor") {
      matchesCategory = cat === "table-decor" || name.includes("table") || name.includes("centerpiece") || name.includes("runner");
    } else if (categoryType === "wreaths") {
      matchesCategory = cat === "wreath" || cat === "wreaths" || name.includes("wreath") || name.includes("cross") || name.includes("ring");
    } else if (categoryType === "special-occasions") {
      matchesCategory = cat.includes("occ") || cat === "special-occasions";
    }

    if (!matchesCategory) {
      continue;
    }

    const mapped = mapDbToProduct(row);
    const normName = row.name.trim().toLowerCase();
    const normSlug = (row.slug || "").trim().toLowerCase();
    const primaryImg = (mapped.image || "").trim().toLowerCase();

    if (
      seenIds.has(row.id) ||
      seenSlugs.has(normSlug) ||
      seenNames.has(normName) ||
      (primaryImg && seenImages.has(primaryImg))
    ) {
      continue;
    }

    seenIds.add(row.id);
    seenSlugs.add(normSlug);
    seenNames.add(normName);
    if (primaryImg) seenImages.add(primaryImg);
    newlyCreatedAdminProducts.push(mapped);
  }

  // Combined product list with final-pass strict deduplication
  const combined = [...newlyCreatedAdminProducts, ...updatedBaseProducts];
  const finalIds = new Set<string>();
  const finalSlugs = new Set<string>();
  const finalNames = new Set<string>();
  const finalImages = new Set<string>();
  const dedupedProducts: Product[] = [];

  for (const p of combined) {
    const idKey = (p.id || "").toLowerCase();
    const slugKey = (p.slug || "").trim().toLowerCase();
    const nameKey = (p.name || "").trim().toLowerCase();
    const imgKey = (p.image || "").trim().toLowerCase();

    if (finalIds.has(idKey) || finalSlugs.has(slugKey) || finalNames.has(nameKey)) {
      continue;
    }
    if (imgKey && finalImages.has(imgKey)) {
      continue;
    }

    finalIds.add(idKey);
    finalSlugs.add(slugKey);
    finalNames.add(nameKey);
    if (imgKey) finalImages.add(imgKey);
    dedupedProducts.push(p);
  }

  return dedupedProducts;
}
