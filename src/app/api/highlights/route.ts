import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";

export const dynamic = "force-dynamic";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

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
          { status: 404, headers: NO_CACHE_HEADERS }
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

      const formattedGallery = (gallery || []).map((g: any) => ({
        ...g,
        price: Number(g.price) || 0,
        display_order: Number(g.display_order) || 1,
      }));

      return NextResponse.json(
        {
          success: true,
          highlight: {
            ...h,
            starting_price: Number(h.starting_price) || 0,
            features: parsedFeatures,
            gallery_count: formattedGallery.length,
            gallery: formattedGallery,
          },
        },
        { headers: NO_CACHE_HEADERS }
      );
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
        display_order: Number(img.display_order) || 1,
      });
    }

    const formatted = (highlights || []).map((h: any) => {
      let parsedFeatures = [];
      try {
        parsedFeatures = typeof h.features === "string" ? JSON.parse(h.features) : (h.features || []);
      } catch {
        parsedFeatures = [];
      }

      const hGallery = galleryMap[h.id] || [];

      return {
        ...h,
        starting_price: Number(h.starting_price) || 0,
        features: parsedFeatures,
        gallery_count: hGallery.length,
        gallery: hGallery,
      };
    });

    return NextResponse.json(
      {
        success: true,
        highlights: formatted,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: any) {
    console.error("GET /api/highlights error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch highlights" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
