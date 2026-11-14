import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";

export const dynamic = "force-dynamic";

// GET /api/highlights - Public endpoint to retrieve active highlights and their galleries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const highlightId = searchParams.get("id");
    const highlightSlug = searchParams.get("slug");
    const activeOnly = searchParams.get("all") !== "true";

    // Single highlight lookup by ID or slug
    if (highlightId || highlightSlug) {
      const target = (highlightId || highlightSlug || "").trim();
      const rows = await sql`
        SELECT * FROM highlights 
        WHERE (id = ${target} OR slug = ${target})
        ${activeOnly ? sql`AND active = 1` : sql``}
        LIMIT 1
      `;

      if (!rows || rows.length === 0) {
        return NextResponse.json(
          { success: false, error: "Highlight not found" },
          { status: 404 }
        );
      }

      const h = rows[0];
      const gallery = await sql`
        SELECT * FROM highlight_gallery_images
        WHERE highlight_id = ${h.id}
        ORDER BY display_order ASC, created_at ASC
      `;

      let parsedFeatures = [];
      try {
        parsedFeatures = typeof h.features === "string" ? JSON.parse(h.features) : (h.features || []);
      } catch {
        parsedFeatures = [];
      }

      return NextResponse.json({
        success: true,
        highlight: {
          ...h,
          starting_price: Number(h.starting_price) || 0,
          features: parsedFeatures,
          gallery: gallery || [],
        },
      });
    }

    // List all active highlights
    const highlights = activeOnly
      ? await sql`SELECT * FROM highlights WHERE active = 1 ORDER BY display_order ASC, created_at ASC`
      : await sql`SELECT * FROM highlights ORDER BY display_order ASC, created_at ASC`;

    // Fetch all gallery images for these highlights
    const allGalleryImages = await sql`
      SELECT * FROM highlight_gallery_images 
      ORDER BY display_order ASC, created_at ASC
    `;

    // Group gallery images by highlight_id
    const galleryMap: Record<string, any[]> = {};
    for (const img of allGalleryImages || []) {
      if (!galleryMap[img.highlight_id]) {
        galleryMap[img.highlight_id] = [];
      }
      galleryMap[img.highlight_id].push({
        ...img,
        price: Number(img.price) || 0,
      });
    }

    const formatted = (highlights || []).map((h: any) => {
      let parsedFeatures = [];
      try {
        parsedFeatures = typeof h.features === "string" ? JSON.parse(h.features) : (h.features || []);
      } catch {
        parsedFeatures = [];
      }

      return {
        ...h,
        starting_price: Number(h.starting_price) || 0,
        features: parsedFeatures,
        gallery: galleryMap[h.id] || [],
      };
    });

    return NextResponse.json({
      success: true,
      highlights: formatted,
    });
  } catch (error: any) {
    console.error("GET /api/highlights error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch highlights" },
      { status: 500 }
    );
  }
}
