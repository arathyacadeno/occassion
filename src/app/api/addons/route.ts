import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { ADDON_PRODUCTS, AddonProduct } from "@/data/addons";

export const dynamic = "force-dynamic";

function determineCategory(row: any): "Cakes" | "Flower Bouquets" | "Flower Baskets" | "Chocolates" | "Soft Toys" {
  const nameLower = (row.name || "").toLowerCase();
  const typeLower = (row.type || "").toLowerCase();
  const descLower = (row.description || "").toLowerCase();

  if (typeLower === "cake" || nameLower.includes("cake") || nameLower.includes("pastry")) {
    return "Cakes";
  }
  if (typeLower === "basket" || nameLower.includes("basket")) {
    return "Flower Baskets";
  }
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
  if (
    nameLower.includes("teddy") ||
    nameLower.includes("bear") ||
    nameLower.includes("plush") ||
    nameLower.includes("toy")
  ) {
    return "Soft Toys";
  }

  // Chocolates / Confectionery / Treats (Default for gifts & snacks like Diary milk, 5 Star, etc.)
  return "Chocolates";
}

export async function GET() {
  try {
    let dbRows: any[] = [];
    try {
      dbRows = await sql`
        SELECT p.id, p.name, p.slug, p.price, p.discount_price, p.images, p.type,
               p.category_id, p.active, p.status, p.description, p.created_at,
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

    if (!dbRows || dbRows.length === 0) {
      return NextResponse.json({ success: true, addons: ADDON_PRODUCTS });
    }

    // Map database rows into AddonProduct format
    const dbAddons: AddonProduct[] = dbRows.map((row: any) => {
      let image = "/images/addons/Cadbury-Dairy-Milk.png";
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

      const category = determineCategory(row);
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

    // Merge: DB items take precedence, then append static catalog items that aren't already represented
    const seenIds = new Set<string>();
    const seenSlugs = new Set<string>();
    const seenNames = new Set<string>();
    const merged: AddonProduct[] = [];

    // 1. Add DB items (most recent first)
    for (const item of dbAddons) {
      const cleanId = item.id.toLowerCase();
      const cleanName = item.name.trim().toLowerCase();
      const cleanSlug = item.href.toLowerCase().replace(/^\/special-occasions\//, "");

      seenIds.add(cleanId);
      seenNames.add(cleanName);
      if (cleanSlug) seenSlugs.add(cleanSlug);

      merged.push(item);
    }

    // 2. Append static items that are not in DB
    for (const item of ADDON_PRODUCTS) {
      const cleanId = item.id.toLowerCase();
      const cleanName = item.name.trim().toLowerCase();
      const cleanSlug = item.href.toLowerCase().replace(/^\/(special-occasions|cakes|flower|flower-bouquets)\//, "");

      // Avoid duplicates
      if (seenIds.has(cleanId) || seenNames.has(cleanName) || (cleanSlug && seenSlugs.has(cleanSlug))) {
        continue;
      }

      merged.push(item);
    }

    return NextResponse.json({
      success: true,
      addons: merged,
      count: merged.length,
    });
  } catch (error: any) {
    console.error("GET /api/addons error:", error);
    return NextResponse.json({ success: true, addons: ADDON_PRODUCTS });
  }
}
