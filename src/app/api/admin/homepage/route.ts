import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { getAuthenticatedUser } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

// GET /api/admin/homepage: Return all banners, sections, categories, and products for selector
export async function GET(req: NextRequest) {
  try {
    const auth = getAuthenticatedUser(req);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const banners = await sql`
      SELECT * FROM homepage_banners 
      ORDER BY display_order ASC, created_at DESC
    `;

    const sections = await sql`
      SELECT * FROM homepage_sections 
      ORDER BY display_order ASC
    `;

    const categories = await sql`
      SELECT id, name, slug, image FROM categories ORDER BY name ASC
    `;

    const products = await sql`
      SELECT id, name, slug, price, images, category_id, active FROM products 
      WHERE active = 1 
      ORDER BY name ASC
    `;

    return NextResponse.json({
      success: true,
      banners: banners || [],
      sections: sections || [],
      categories: categories || [],
      products: products || [],
    });
  } catch (err: any) {
    console.error("GET /api/admin/homepage error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load homepage data" },
      { status: 500 }
    );
  }
}

// POST /api/admin/homepage: Create new banner
export async function POST(req: NextRequest) {
  try {
    const auth = getAuthenticatedUser(req);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const {
      type = "hero",
      title = "",
      subtitle = "",
      button_text = "Shop Now",
      button_link = "/flower-bouquets",
      desktop_image,
      mobile_image,
      badge = "",
      active = 1,
      display_order = 0,
    } = body;

    if (!desktop_image) {
      return NextResponse.json(
        { success: false, error: "Desktop image is required for banner" },
        { status: 400 }
      );
    }

    const id = `banner-${Date.now()}`;
    const now = new Date().toISOString();

    await sql`
      INSERT INTO homepage_banners (
        id, type, title, subtitle, button_text, button_link, desktop_image, mobile_image, badge, active, display_order, created_at, updated_at
      ) VALUES (
        ${id}, ${type}, ${title}, ${subtitle}, ${button_text}, ${button_link}, ${desktop_image}, 
        ${mobile_image || desktop_image}, ${badge}, ${active ? 1 : 0}, ${Number(display_order) || 0}, ${now}, ${now}
      )
    `;

    return NextResponse.json({
      success: true,
      message: "Banner created successfully",
      banner: { id, type, title, subtitle, desktop_image, active, display_order },
    });
  } catch (err: any) {
    console.error("POST /api/admin/homepage error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create banner" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/homepage: Update banner or update section
export async function PUT(req: NextRequest) {
  try {
    const auth = getAuthenticatedUser(req);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { action, banner, section } = body;
    const now = new Date().toISOString();

    if (action === "update_banner" && banner) {
      await sql`
        UPDATE homepage_banners SET
          type = ${banner.type},
          title = ${banner.title},
          subtitle = ${banner.subtitle},
          button_text = ${banner.button_text},
          button_link = ${banner.button_link},
          desktop_image = ${banner.desktop_image},
          mobile_image = ${banner.mobile_image || banner.desktop_image},
          badge = ${banner.badge || ""},
          active = ${banner.active ? 1 : 0},
          display_order = ${Number(banner.display_order) || 0},
          updated_at = ${now}
        WHERE id = ${banner.id}
      `;

      return NextResponse.json({ success: true, message: "Banner updated successfully" });
    }

    if (action === "update_section" && section) {
      const productIdsJson = typeof section.product_ids === "string" 
        ? section.product_ids 
        : JSON.stringify(section.product_ids || []);

      await sql`
        INSERT INTO homepage_sections (key, title, subtitle, product_ids, active, display_order, updated_at)
        VALUES (${section.key}, ${section.title}, ${section.subtitle}, ${productIdsJson}, ${section.active ? 1 : 0}, ${Number(section.display_order) || 0}, ${now})
        ON CONFLICT (key) DO UPDATE SET
          title = EXCLUDED.title,
          subtitle = EXCLUDED.subtitle,
          product_ids = EXCLUDED.product_ids,
          active = EXCLUDED.active,
          display_order = EXCLUDED.display_order,
          updated_at = EXCLUDED.updated_at
      `;

      return NextResponse.json({ success: true, message: "Homepage section updated successfully" });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action or missing payload" },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("PUT /api/admin/homepage error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update homepage content" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/homepage?id=...
export async function DELETE(req: NextRequest) {
  try {
    const auth = getAuthenticatedUser(req);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Banner ID is required" },
        { status: 400 }
      );
    }

    await sql`DELETE FROM homepage_banners WHERE id = ${id}`;

    return NextResponse.json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (err: any) {
    console.error("DELETE /api/admin/homepage error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete banner" },
      { status: 500 }
    );
  }
}
