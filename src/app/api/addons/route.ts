import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { ADDON_PRODUCTS, AddonProduct } from "@/data/addons";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const PREFERRED_CATEGORY_ORDER = [
  "All",
  "Flower Bouquets",
  "Flower Baskets",
  "Cakes",
  "Chocolates",
  "Soft Toys",
];

function fallbackDetermineCategory(row: any): "Cakes" | "Flower Bouquets" | "Flower Baskets" | "Chocolates" | "Soft Toys" {
  const nameLower = (row.name || "").toLowerCase();
  const typeLower = (row.type || "").toLowerCase();
  const idLower = (row.id || "").toLowerCase();

  // Soft Toys
  if (
    nameLower.includes("teddy") ||
    nameLower.includes("bear") ||
    nameLower.includes("plush") ||
    nameLower.includes("toy")
  ) {
    return "Soft Toys";
  }

  // Chocolates & Treats (Snickers, Dairy Milk, 5 Star, Kitkat, Ferrero, etc.)
  if (
    nameLower.includes("chocolate") ||
    nameLower.includes("snickers") ||
    nameLower.includes("snikcers") ||
    nameLower.includes("kitkat") ||
    nameLower.includes("ferrero") ||
    nameLower.includes("cadbury") ||
    nameLower.includes("dairy milk") ||
    nameLower.includes("diary milk") ||
    nameLower.includes("silk") ||
    nameLower.includes("5 star") ||
    nameLower.includes("5star") ||
    nameLower.includes("kisses") ||
    nameLower.includes("hershey") ||
    nameLower.includes("toblerone") ||
    nameLower.includes("bournville") ||
    nameLower.includes("temptations") ||
    nameLower.includes("roast almond") ||
    nameLower.includes("fruit & nut") ||
    nameLower.includes("fruit and nut") ||
    nameLower.includes("fruit n nut") ||
    nameLower.includes("galaxy")
  ) {
    return "Chocolates";
  }

  // Cakes
  if (typeLower === "cake" || nameLower.includes("cake") || nameLower.includes("pastry")) {
    return "Cakes";
  }

  // Flower Bouquets
  if (
    typeLower === "flower" ||
    nameLower.includes("bouquet") ||
    nameLower.includes("roses") ||
    nameLower.includes("carnation") ||
    nameLower.includes("lily") ||
    nameLower.includes("sunflower")
  ) {
    return "Flower Bouquets";
  }

  // Flower Baskets
  if (typeLower === "basket" || nameLower.includes("basket") || nameLower.includes("cane")) {
    return "Flower Baskets";
  }

  // Default for gifts/snacks is Chocolates
  return "Chocolates";
}

export async function GET() {
  try {
    let dbRows: any[] = [];
    try {
      dbRows = await sql`
        SELECT p.id, p.name, p.slug, p.price, p.discount_price, p.images, p.type,
               p.addon_category, p.category_id, p.active, p.status, p.description, p.created_at,
               c.name as category_name, c.slug as category_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE (
          p.category_id = 'cat-addons'
          OR p.category_id = 'addons'
          OR LOWER(COALESCE(c.slug, '')) = 'addons'
          OR LOWER(COALESCE(c.name, '')) = 'add-ons'
          OR LOWER(COALESCE(c.name, '')) = 'addons'
          OR p.id LIKE 'addon-%'
          OR p.slug LIKE 'addon-%'
        )
        AND p.active = 1
        AND (p.status = 'published' OR p.status IS NULL OR p.status = '')
        ORDER BY p.created_at DESC
      `;
    } catch (dbError) {
      console.error("Neon addons query error:", dbError);
    }

    // If database returned active items, use database as SINGLE SOURCE OF TRUTH
    // (Never resurrect deleted items by merging with static ADDON_PRODUCTS)
    let addonsList: AddonProduct[] = [];

    if (dbRows && dbRows.length > 0) {
      addonsList = dbRows.map((row: any) => {
        let image = "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647340/occasions/products/addons/addons-bournville.jpg";
        if (row.images) {
          try {
            const parsed = typeof row.images === "string" ? JSON.parse(row.images) : row.images;
            if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]) {
              image = parsed[0];
            }
          } catch {
            if (typeof row.images === "string" && row.images.trim()) {
              image = row.images.trim();
            }
          }
        }

        // Use database addon_category directly; fallback only if empty
        const category =
          row.addon_category && typeof row.addon_category === "string" && row.addon_category.trim()
            ? (row.addon_category.trim() as any)
            : fallbackDetermineCategory(row);

        const cleanSlug = (row.slug || row.id || "").replace(/^\//, "");

        return {
          id: row.id,
          name: row.name,
          price: Number(row.price) || 0,
          image,
          category,
          href: `/special-occasions/${cleanSlug}`,
          sectionHref: "/special-occasions",
        };
      });
    } else {
      // Fallback only if database connection failed or table is completely empty
      addonsList = ADDON_PRODUCTS;
    }

    // Compute dynamic categories present in the active addons
    const distinctCategories = Array.from(
      new Set(addonsList.map((item) => item.category).filter(Boolean))
    );

    distinctCategories.sort((a, b) => {
      const idxA = PREFERRED_CATEGORY_ORDER.indexOf(a);
      const idxB = PREFERRED_CATEGORY_ORDER.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });

    const categories = ["All", ...distinctCategories];

    return NextResponse.json(
      {
        success: true,
        categories,
        addons: addonsList,
        count: addonsList.length,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error: any) {
    console.error("GET /api/addons error:", error);
    return NextResponse.json(
      {
        success: true,
        categories: PREFERRED_CATEGORY_ORDER,
        addons: ADDON_PRODUCTS,
        count: ADDON_PRODUCTS.length,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  }
}


