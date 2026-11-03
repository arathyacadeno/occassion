import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sql } from "@/lib/db/neon";

export const dynamic = "force-dynamic";

// GET /api/admin/homepage: Return all banners, sections, categories, and products for selector
export async function GET() {
  try {
    const db = getDb();
    const banners = db.prepare(`
      SELECT * FROM homepage_banners 
      ORDER BY display_order ASC, created_at DESC
    `).all();

    const sections = db.prepare(`
      SELECT * FROM homepage_sections 
      ORDER BY display_order ASC
    `).all();

    const categories = db.prepare(`
      SELECT id, name, slug, image FROM categories ORDER BY name ASC
    `).all();

    const products = db.prepare(`
      SELECT id, name, slug, price, images, category_id, active FROM products 
      WHERE active = 1 
      ORDER BY name ASC
    `).all();

    return NextResponse.json({
      success: true,
      banners,
      sections,
      categories,
      products,
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

    // 1. Insert into SQLite
    const db = getDb();
    db.prepare(`
      INSERT INTO homepage_banners (
        id, type, title, subtitle, button_text, button_link, desktop_image, mobile_image, badge, active, display_order, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      type,
      title,
      subtitle,
      button_text,
      button_link,
      desktop_image,
      mobile_image || desktop_image,
      badge,
      active ? 1 : 0,
      Number(display_order) || 0,
      now,
      now
    );

    // 2. Dual-write to Neon PostgreSQL
    if (process.env.DATABASE_URL) {
      try {
        await sql`
          INSERT INTO homepage_banners (
            id, type, title, subtitle, button_text, button_link, desktop_image, mobile_image, badge, active, display_order, created_at, updated_at
          ) VALUES (
            ${id}, ${type}, ${title}, ${subtitle}, ${button_text}, ${button_link}, ${desktop_image}, 
            ${mobile_image || desktop_image}, ${badge}, ${active ? 1 : 0}, ${Number(display_order) || 0}, ${now}, ${now}
          );
        `;
      } catch (neonErr) {
        console.warn("Neon homepage_banners insert sync warning:", neonErr);
      }
    }

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
    const body = await req.json();
    const { action, banner, section } = body;
    const now = new Date().toISOString();
    const db = getDb();

    if (action === "update_banner" && banner) {
      db.prepare(`
        UPDATE homepage_banners SET
          type = ?,
          title = ?,
          subtitle = ?,
          button_text = ?,
          button_link = ?,
          desktop_image = ?,
          mobile_image = ?,
          badge = ?,
          active = ?,
          display_order = ?,
          updated_at = ?
        WHERE id = ?
      `).run(
        banner.type,
        banner.title,
        banner.subtitle,
        banner.button_text,
        banner.button_link,
        banner.desktop_image,
        banner.mobile_image || banner.desktop_image,
        banner.badge || "",
        banner.active ? 1 : 0,
        Number(banner.display_order) || 0,
        now,
        banner.id
      );

      if (process.env.DATABASE_URL) {
        try {
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
            WHERE id = ${banner.id};
          `;
        } catch (neonErr) {
          console.warn("Neon homepage_banners update sync warning:", neonErr);
        }
      }

      return NextResponse.json({ success: true, message: "Banner updated successfully" });
    }

    if (action === "update_section" && section) {
      const productIdsJson = typeof section.product_ids === "string" 
        ? section.product_ids 
        : JSON.stringify(section.product_ids || []);

      db.prepare(`
        INSERT INTO homepage_sections (key, title, subtitle, product_ids, active, display_order, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET
          title = excluded.title,
          subtitle = excluded.subtitle,
          product_ids = excluded.product_ids,
          active = excluded.active,
          display_order = excluded.display_order,
          updated_at = excluded.updated_at
      `).run(
        section.key,
        section.title,
        section.subtitle,
        productIdsJson,
        section.active ? 1 : 0,
        Number(section.display_order) || 0,
        now
      );

      if (process.env.DATABASE_URL) {
        try {
          await sql`
            INSERT INTO homepage_sections (key, title, subtitle, product_ids, active, display_order, updated_at)
            VALUES (${section.key}, ${section.title}, ${section.subtitle}, ${productIdsJson}, ${section.active ? 1 : 0}, ${Number(section.display_order) || 0}, ${now})
            ON CONFLICT (key) DO UPDATE SET
              title = EXCLUDED.title,
              subtitle = EXCLUDED.subtitle,
              product_ids = EXCLUDED.product_ids,
              active = EXCLUDED.active,
              display_order = EXCLUDED.display_order,
              updated_at = EXCLUDED.updated_at;
          `;
        } catch (neonErr) {
          console.warn("Neon homepage_sections update sync warning:", neonErr);
        }
      }

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
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Banner ID is required" },
        { status: 400 }
      );
    }

    const db = getDb();
    db.prepare("DELETE FROM homepage_banners WHERE id = ?").run(id);

    if (process.env.DATABASE_URL) {
      try {
        await sql`DELETE FROM homepage_banners WHERE id = ${id};`;
      } catch (neonErr) {
        console.warn("Neon homepage_banners delete sync warning:", neonErr);
      }
    }

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

