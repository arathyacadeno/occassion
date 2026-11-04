import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sql } from "@/lib/db/neon";
import { getAuthenticatedUser } from "@/lib/auth/jwt";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("activeOnly") === "true";

    const db = getDb();
    let query = `
      SELECT c.*, count(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON (p.category_id = c.id OR p.category_id = c.slug)
    `;

    if (activeOnly) {
      query += ` WHERE c.active = 1`;
    }

    query += ` GROUP BY c.id ORDER BY c.display_order ASC, c.name ASC`;

    const rawCategories: any[] = db.prepare(query).all();
    const categories = rawCategories.map((c) => {
      let img = c.image;
      if (!img || img.includes("lily-6-stems") || img.includes("flower-basket-pink-lilies") || img.includes("cake-chocolate") || img.includes("table-arrangement") || img.includes("wreath-white-lilies")) {
        const s = (c.slug || c.id || "").toLowerCase();
        if (s.includes("basket")) img = "/images/categories/flower-basket.jpg";
        else if (s.includes("cake")) img = "/images/cakes/cat-cakes-luxe.jpg";
        else if (s.includes("table")) img = "/images/categories/table-decor.jpg";
        else if (s.includes("wreath")) img = "/images/categories/wreath.jpg";
        else img = "/images/categories/flower-bouquet.jpg";
      }
      return { ...c, image: img };
    });

    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    console.error("Categories fetch error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = getAuthenticatedUser(request);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { name, slug, description, image, displayOrder, active } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: "Category name is required" }, { status: 400 });
    }

    const cleanSlug = slug
      ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
      : name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    const id = body.id || `cat-${cleanSlug}`;
    const cleanOrder = Number(displayOrder) || 0;
    const cleanActive = active !== undefined ? (active ? 1 : 0) : 1;
    const cleanImage = image || "/images/sunflower-bouquet.jpg";

    const db = getDb();

    // Check slug uniqueness
    const existing = db.prepare("SELECT id FROM categories WHERE slug = ? OR id = ?").get(cleanSlug, id);
    if (existing) {
      return NextResponse.json({ success: false, error: "Category with this slug or ID already exists" }, { status: 400 });
    }

    db.prepare(`
      INSERT INTO categories (id, name, slug, description, image, display_order, active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, name.trim(), cleanSlug, description || "", cleanImage, cleanOrder, cleanActive);

    // Sync to Neon DB
    if (process.env.DATABASE_URL) {
      try {
        await sql`
          INSERT INTO categories (id, name, slug, description, image, display_order, active)
          VALUES (${id}, ${name.trim()}, ${cleanSlug}, ${description || ""}, ${cleanImage}, ${cleanOrder}, ${cleanActive})
        `;
      } catch (neonErr) {
        console.warn("Neon category insert sync warning:", neonErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Category created successfully",
      category: { id, name: name.trim(), slug: cleanSlug, description: description || "", image: cleanImage, display_order: cleanOrder, active: cleanActive, product_count: 0 },
    });
  } catch (error: any) {
    console.error("Category creation error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to create category" }, { status: 500 });
  }
}
