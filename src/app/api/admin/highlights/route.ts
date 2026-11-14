import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { getAuthenticatedUser } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

// GET /api/admin/highlights: List all highlights (including inactive) with their gallery images
export async function GET(req: NextRequest) {
  try {
    const auth = getAuthenticatedUser(req);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const highlights = await sql`
      SELECT h.*, count(g.id)::int as gallery_count
      FROM highlights h
      LEFT JOIN highlight_gallery_images g ON g.highlight_id = h.id
      GROUP BY h.id
      ORDER BY h.display_order ASC, h.created_at ASC
    `;

    const allGalleryImages = await sql`
      SELECT * FROM highlight_gallery_images 
      ORDER BY display_order ASC, created_at ASC
    `;

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
        gallery_count: Number(h.gallery_count) || 0,
        gallery: galleryMap[h.id] || [],
      };
    });

    return NextResponse.json({
      success: true,
      highlights: formatted,
    });
  } catch (error: any) {
    console.error("GET /api/admin/highlights error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch highlights" },
      { status: 500 }
    );
  }
}

// POST /api/admin/highlights: Create a new highlight and optional initial gallery
export async function POST(req: NextRequest) {
  try {
    const auth = getAuthenticatedUser(req);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      slug,
      subtitle,
      tag,
      description,
      cover_image,
      starting_price,
      price_display,
      whatsapp_number,
      whatsapp_text,
      call_number,
      call_text,
      guarantee_text,
      features,
      active = 1,
      display_order = 0,
      gallery = [],
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 });
    }

    if (!cover_image || !cover_image.trim()) {
      return NextResponse.json({ success: false, error: "Cover image is required" }, { status: 400 });
    }

    // Generate or sanitize slug
    const cleanSlug = (slug || title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const id = cleanSlug || `hl-${Date.now().toString(36)}`;

    // Check slug uniqueness
    const existing = await sql`SELECT id FROM highlights WHERE id = ${id} OR slug = ${cleanSlug} LIMIT 1`;
    if (existing && existing.length > 0) {
      return NextResponse.json(
        { success: false, error: `A highlight with slug '${cleanSlug}' already exists.` },
        { status: 400 }
      );
    }

    const featuresJson = typeof features === "string" ? features : JSON.stringify(features || []);
    const numPrice = Number(starting_price) || 0;
    const formattedPriceDisplay = price_display || (numPrice > 0 ? `₹ ${numPrice.toLocaleString("en-IN")}` : "Inquire");

    await sql`
      INSERT INTO highlights (
        id, slug, title, subtitle, tag, description, cover_image,
        starting_price, price_display, whatsapp_number, whatsapp_text,
        call_number, call_text, guarantee_text, features, active, display_order, created_at, updated_at
      ) VALUES (
        ${id}, ${cleanSlug}, ${title.trim()}, ${subtitle || null}, ${tag || null}, ${description || null},
        ${cover_image.trim()}, ${numPrice}, ${formattedPriceDisplay},
        ${whatsapp_number || '918606464700'}, ${whatsapp_text || null},
        ${call_number || '+918606464700'}, ${call_text || 'Call Atelier Directly'},
        ${guarantee_text || '100% Freshness Guarantee'}, ${featuresJson},
        ${active ? 1 : 0}, ${Number(display_order) || 0}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `;

    // Insert initial gallery images if provided
    if (Array.isArray(gallery) && gallery.length > 0) {
      let order = 1;
      for (const item of gallery) {
        if (!item.image_url && !item.src) continue;
        const imgUrl = (item.image_url || item.src).trim();
        const imgId = `${id}-img-${order}-${Date.now().toString(36)}`;
        await sql`
          INSERT INTO highlight_gallery_images (
            id, highlight_id, image_url, title, alt_text, description, price, display_order, created_at
          ) VALUES (
            ${imgId}, ${id}, ${imgUrl}, ${item.title || title}, ${item.alt_text || item.alt || title},
            ${item.description || ''}, ${Number(item.price) || numPrice}, ${order}, CURRENT_TIMESTAMP
          )
        `;
        order++;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Highlight created successfully",
      id,
      slug: cleanSlug,
    });
  } catch (error: any) {
    console.error("POST /api/admin/highlights error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create highlight" },
      { status: 500 }
    );
  }
}
