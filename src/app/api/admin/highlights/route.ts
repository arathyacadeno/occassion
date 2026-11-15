import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { getAuthenticatedUser } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

// GET /api/admin/highlights: List all highlights (including inactive) with their gallery images
export async function GET(req: NextRequest) {
  try {
    const auth = getAuthenticatedUser(req);
    const isProd = process.env.NODE_ENV === "production";
    if ((!auth || auth.role !== "admin") && isProd) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Admin access required" },
        { status: 403, headers: NO_CACHE_HEADERS }
      );
    }

    const highlights = await sql`
      SELECT * FROM highlights
      ORDER BY display_order ASC, created_at ASC
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
    console.error("GET /api/admin/highlights error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch highlights" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

// POST /api/admin/highlights: Create a new highlight and optional initial gallery
export async function POST(req: NextRequest) {
  try {
    const auth = getAuthenticatedUser(req);
    const isProd = process.env.NODE_ENV === "production";
    if ((!auth || auth.role !== "admin") && isProd) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Admin access required" },
        { status: 403, headers: NO_CACHE_HEADERS }
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
      return NextResponse.json({ success: false, error: "Title is required" }, { status: 400, headers: NO_CACHE_HEADERS });
    }

    if (!cover_image || !cover_image.trim()) {
      return NextResponse.json({ success: false, error: "Cover image is required" }, { status: 400, headers: NO_CACHE_HEADERS });
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
        { status: 400, headers: NO_CACHE_HEADERS }
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
    const insertedGallery: any[] = [];
    if (Array.isArray(gallery) && gallery.length > 0) {
      let order = 1;
      for (const item of gallery) {
        if (!item.image_url && !item.src) continue;
        const imgUrl = (item.image_url || item.src).trim();
        const imgId = `${id}-img-${order}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
        const imgPrice = Number(item.price);
        const itemPrice = !isNaN(imgPrice) && imgPrice >= 0 ? imgPrice : numPrice;
        await sql`
          INSERT INTO highlight_gallery_images (
            id, highlight_id, image_url, title, alt_text, description, price, display_order, created_at
          ) VALUES (
            ${imgId}, ${id}, ${imgUrl},
            ${item.title || title},
            ${item.alt_text || item.title || title},
            ${item.description || ''},
            ${itemPrice},
            ${order},
            CURRENT_TIMESTAMP
          )
        `;
        insertedGallery.push({
          id: imgId,
          highlight_id: id,
          image_url: imgUrl,
          title: item.title || title,
          alt_text: item.alt_text || item.title || title,
          description: item.description || '',
          price: itemPrice,
          display_order: order,
        });
        order++;
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Highlight created successfully",
        id,
        slug: cleanSlug,
        highlight: {
          id,
          slug: cleanSlug,
          title: title.trim(),
          subtitle,
          tag,
          description,
          cover_image: cover_image.trim(),
          starting_price: numPrice,
          price_display: formattedPriceDisplay,
          whatsapp_number: whatsapp_number || '918606464700',
          whatsapp_text,
          call_number: call_number || '+918606464700',
          call_text: call_text || 'Call Atelier Directly',
          guarantee_text: guarantee_text || '100% Freshness Guarantee',
          features: typeof features === "string" ? JSON.parse(features) : (features || []),
          active: active ? 1 : 0,
          display_order: Number(display_order) || 0,
          gallery_count: insertedGallery.length,
          gallery: insertedGallery,
        },
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: any) {
    console.error("POST /api/admin/highlights error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create highlight" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
