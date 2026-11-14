import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const banners = await sql`
      SELECT * FROM homepage_banners 
      WHERE active = 1 
      ORDER BY display_order ASC, created_at DESC
    `;
    const rawSections = await sql`
      SELECT * FROM homepage_sections 
      WHERE active = 1 
      ORDER BY display_order ASC
    `;

    const sections = [];
    for (const s of rawSections || []) {
      let pIds: string[] = [];
      if (typeof s.product_ids === "string") {
        try {
          pIds = JSON.parse(s.product_ids);
        } catch {
          pIds = [];
        }
      } else if (Array.isArray(s.product_ids)) {
        pIds = s.product_ids;
      }

      let sectionProducts: any[] = [];
      if (pIds.length > 0) {
        try {
          const prods = await sql`
            SELECT p.*, c.name as category_name, c.slug as category_slug
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE (p.id = ANY(${pIds}) OR p.slug = ANY(${pIds}) OR p.name = ANY(${pIds}))
              AND p.active = 1
          `;

          sectionProducts = prods.map((r: any) => {
            let parsedImages: string[] = [];
            try {
              parsedImages = JSON.parse(r.images);
            } catch {
              parsedImages = r.images ? [r.images] : [];
            }
            return {
              id: r.id,
              name: r.name,
              slug: r.slug,
              description: r.description,
              price: Number(r.price),
              originalPrice: r.discount_price ? Number(r.discount_price) : undefined,
              image: parsedImages[0] || "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647361/occasions/categories/categories-flower-bouquet.jpg",
              images: parsedImages,
              category: r.category_slug || (r.category_id ? r.category_id.replace(/^cat-/, "") : "flowers"),
              badge: r.badge,
              rating: Number(r.rating) || 5.0,
              reviewsCount: Number(r.reviews_count) || 12,
              inStock: Number(r.stock) > 0,
            };
          });
        } catch (prodErr) {
          console.warn(`Error loading products for section ${s.key}:`, prodErr);
        }
      }

      sections.push({
        ...s,
        products: sectionProducts,
      });
    }

    return NextResponse.json({
      success: true,
      banners: banners || [],
      sections: sections || [],
    });
  } catch (err: any) {
    console.error("GET /api/homepage error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch homepage content" },
      { status: 500 }
    );
  }
}
