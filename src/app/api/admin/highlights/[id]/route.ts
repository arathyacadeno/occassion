import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { getAuthenticatedUser } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

// GET /api/admin/highlights/[id]: Get full highlight details with gallery
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthenticatedUser(req);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const cleanId = (id || "").trim();

    const rows = await sql`
      SELECT * FROM highlights 
      WHERE id = ${cleanId} OR slug = ${cleanId}
      LIMIT 1
    `;

    if (!rows || rows.length === 0) {
      return NextResponse.json({ success: false, error: "Highlight not found" }, { status: 404 });
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
        gallery: (gallery || []).map((g: any) => ({
          ...g,
          price: Number(g.price) || 0,
        })),
      },
    });
  } catch (error: any) {
    console.error("GET /api/admin/highlights/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch highlight" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/highlights/[id]: Update highlight and sync gallery images
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthenticatedUser(req);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const cleanId = (id || "").trim();

    // Verify highlight exists
    const rows = await sql`SELECT id FROM highlights WHERE id = ${cleanId} OR slug = ${cleanId} LIMIT 1`;
    if (!rows || rows.length === 0) {
      return NextResponse.json({ success: false, error: "Highlight not found" }, { status: 404 });
    }
    const highlightId = rows[0].id;

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
      active,
      display_order,
      gallery,
    } = body;

    const numPrice = Number(starting_price);
    const formattedPriceDisplay = price_display || (!isNaN(numPrice) && numPrice > 0 ? `₹ ${numPrice.toLocaleString("en-IN")}` : undefined);
    const featuresJson = features !== undefined
      ? (typeof features === "string" ? features : JSON.stringify(features || []))
      : undefined;

    // Update highlight attributes
    await sql`
      UPDATE highlights SET
        title = COALESCE(${title ? title.trim() : null}, title),
        slug = COALESCE(${slug ? slug.trim() : null}, slug),
        subtitle = COALESCE(${subtitle !== undefined ? subtitle : null}, subtitle),
        tag = COALESCE(${tag !== undefined ? tag : null}, tag),
        description = COALESCE(${description !== undefined ? description : null}, description),
        cover_image = COALESCE(${cover_image ? cover_image.trim() : null}, cover_image),
        starting_price = COALESCE(${!isNaN(numPrice) ? numPrice : null}, starting_price),
        price_display = COALESCE(${formattedPriceDisplay || null}, price_display),
        whatsapp_number = COALESCE(${whatsapp_number !== undefined ? whatsapp_number : null}, whatsapp_number),
        whatsapp_text = COALESCE(${whatsapp_text !== undefined ? whatsapp_text : null}, whatsapp_text),
        call_number = COALESCE(${call_number !== undefined ? call_number : null}, call_number),
        call_text = COALESCE(${call_text !== undefined ? call_text : null}, call_text),
        guarantee_text = COALESCE(${guarantee_text !== undefined ? guarantee_text : null}, guarantee_text),
        features = COALESCE(${featuresJson !== undefined ? featuresJson : null}, features),
        active = COALESCE(${active !== undefined ? (active ? 1 : 0) : null}, active),
        display_order = COALESCE(${display_order !== undefined ? Number(display_order) : null}, display_order),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${highlightId}
    `;

    // Sync gallery images if provided
    if (Array.isArray(gallery)) {
      // 1. Delete all existing gallery items for this highlight
      await sql`DELETE FROM highlight_gallery_images WHERE highlight_id = ${highlightId}`;

      // 2. Re-insert updated gallery items with strict ordering
      let order = 1;
      for (const item of gallery) {
        const imgUrl = (item.image_url || item.src || "").trim();
        if (!imgUrl) continue;

        const imgId = item.id && !item.id.startsWith("temp-")
          ? item.id
          : `${highlightId}-img-${order}-${Date.now().toString(36)}`;

        const imgPrice = Number(item.price);
        const itemPrice = !isNaN(imgPrice) ? imgPrice : (!isNaN(numPrice) ? numPrice : 0);

        await sql`
          INSERT INTO highlight_gallery_images (
            id, highlight_id, image_url, title, alt_text, description, price, display_order, created_at
          ) VALUES (
            ${imgId}, ${highlightId}, ${imgUrl},
            ${item.title || title || 'Highlight Image'},
            ${item.alt_text || item.alt || title || 'Highlight Image'},
            ${item.description || ''},
            ${itemPrice},
            ${order},
            CURRENT_TIMESTAMP
          )
        `;
        order++;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Highlight and gallery updated successfully",
      id: highlightId,
    });
  } catch (error: any) {
    console.error("PUT /api/admin/highlights/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update highlight" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/highlights/[id]: Delete highlight and associated gallery
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthenticatedUser(req);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const cleanId = (id || "").trim();

    const res = await sql`
      DELETE FROM highlights 
      WHERE id = ${cleanId} OR slug = ${cleanId}
      RETURNING id, title
    `;

    if (!res || res.length === 0) {
      return NextResponse.json({ success: false, error: "Highlight not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Highlight '${res[0].title}' and its gallery were deleted successfully`,
    });
  } catch (error: any) {
    console.error("DELETE /api/admin/highlights/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete highlight" },
      { status: 500 }
    );
  }
}
