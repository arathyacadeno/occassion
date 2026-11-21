import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { getAuthenticatedUser } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("activeOnly") === "true";

    let query = `
      SELECT c.*, count(p.id)::int as product_count
      FROM categories c
      LEFT JOIN products p ON (p.category_id = c.id OR p.category_id = c.slug)
    `;

    if (activeOnly) {
      query += ` WHERE c.active = 1`;
    }

    query += ` GROUP BY c.id ORDER BY c.display_order ASC, c.name ASC`;

    const rawCategories = await sql.query(query);
    const categories = (rawCategories || []).map((c: any) => {
      let img = c.image;
      if (!img || img.includes("lily-6-stems") || img.includes("flower-basket-pink-lilies") || img.includes("cake-chocolate") || img.includes("table-arrangement") || img.includes("wreath-white-lilies")) {
        const s = (c.slug || c.id || "").toLowerCase();
        if (s.includes("basket")) img = "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647361/occasions/categories/categories-flower-basket.jpg";
        else if (s.includes("cake")) img = "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647345/occasions/products/cakes/cakes-cat-cakes-luxe.jpg";
        else if (s.includes("table")) img = "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647362/occasions/categories/categories-table-decor.jpg";
        else if (s.includes("wreath")) img = "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647362/occasions/categories/categories-wreath.jpg";
        else img = "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647361/occasions/categories/categories-flower-bouquet.jpg";
      }
      return { ...c, image: img, product_count: Number(c.product_count) || 0 };
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
    const cleanImage = image || "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647383/occasions/products/flower-bouquet/flower-bouquet-sunshine-and-peach-orchids.jpg";

    // Check slug uniqueness in Neon
    const existing = await sql`SELECT id FROM categories WHERE slug = ${cleanSlug} OR id = ${id} LIMIT 1`;
    if (existing && existing.length > 0) {
      return NextResponse.json({ success: false, error: "Category with this slug or ID already exists" }, { status: 400 });
    }

    await sql`
      INSERT INTO categories (id, name, slug, description, image, display_order, active)
      VALUES (${id}, ${name.trim()}, ${cleanSlug}, ${description || ""}, ${cleanImage}, ${cleanOrder}, ${cleanActive})
    `;

    return NextResponse.json({
      success: true,
      message: "Category created successfully",
      category: {
        id,
        name: name.trim(),
        slug: cleanSlug,
        description: description || "",
        image: cleanImage,
        display_order: cleanOrder,
        active: cleanActive,
        product_count: 0,
      },
    });
  } catch (error: any) {
    console.error("Category creation error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to create category" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const auth = getAuthenticatedUser(request);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const orders: { id: string; display_order: number }[] = [];

    if (Array.isArray(body.orders)) {
      for (const item of body.orders) {
        if (item && item.id && typeof item.display_order === "number") {
          orders.push({ id: String(item.id).trim(), display_order: item.display_order });
        }
      }
    } else if (Array.isArray(body.categoryIds)) {
      body.categoryIds.forEach((id: string, idx: number) => {
        if (id) orders.push({ id: String(id).trim(), display_order: idx + 1 });
      });
    }

    if (orders.length === 0) {
      return NextResponse.json({ success: false, error: "No category display orders provided" }, { status: 400 });
    }

    // Persist new display order to Neon PostgreSQL
    for (const item of orders) {
      await sql`
        UPDATE categories
        SET display_order = ${item.display_order}
        WHERE id = ${item.id} OR slug = ${item.id}
      `;
    }

    return NextResponse.json({
      success: true,
      message: "Category display order updated successfully",
      orders,
    });
  } catch (error: any) {
    console.error("Category reorder update error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update category display order" }, { status: 500 });
  }
}
