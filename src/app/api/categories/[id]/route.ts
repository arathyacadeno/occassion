import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sql } from "@/lib/db/neon";
import { getAuthenticatedUser } from "@/lib/auth/jwt";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();

    const category: any = db.prepare(`
      SELECT c.*, count(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON (p.category_id = c.id OR p.category_id = c.slug)
      WHERE c.id = ? OR c.slug = ?
      GROUP BY c.id
    `).get(id, id);

    if (!category) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
    }

    const products = db.prepare(`
      SELECT id, name, slug, price, stock, active, status, images
      FROM products
      WHERE category_id = ? OR category_id = ?
      ORDER BY name ASC
    `).all(category.id, category.slug);

    return NextResponse.json({ success: true, category, products });
  } catch (error: any) {
    console.error("Category get error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch category" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthenticatedUser(request);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const db = getDb();

    const category = db.prepare("SELECT * FROM categories WHERE id = ? OR slug = ?").get(id, id) as any;
    if (!category) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (body.name !== undefined) {
      updates.push("name = ?");
      values.push(body.name.trim());
    }

    if (body.slug !== undefined) {
      const cleanSlug = body.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      if (cleanSlug && cleanSlug !== category.slug) {
        const existing = db.prepare("SELECT id FROM categories WHERE slug = ? AND id != ?").get(cleanSlug, category.id);
        if (existing) {
          return NextResponse.json({ success: false, error: "Slug already in use by another category" }, { status: 400 });
        }
        updates.push("slug = ?");
        values.push(cleanSlug);
      }
    }

    if (body.description !== undefined) {
      updates.push("description = ?");
      values.push(body.description);
    }

    if (body.image !== undefined) {
      updates.push("image = ?");
      values.push(body.image);
    }

    if (body.displayOrder !== undefined || body.display_order !== undefined) {
      updates.push("display_order = ?");
      values.push(Number(body.displayOrder ?? body.display_order) || 0);
    }

    if (body.active !== undefined) {
      updates.push("active = ?");
      values.push(body.active ? 1 : 0);
    }

    if (updates.length === 0) {
      return NextResponse.json({ success: true, message: "No changes requested" });
    }

    values.push(category.id);
    db.prepare(`UPDATE categories SET ${updates.join(", ")} WHERE id = ?`).run(...values);

    // Sync to Neon DB
    if (process.env.DATABASE_URL) {
      try {
        if (body.name !== undefined) await sql`UPDATE categories SET name = ${body.name.trim()} WHERE id = ${category.id}`;
        if (body.description !== undefined) await sql`UPDATE categories SET description = ${body.description} WHERE id = ${category.id}`;
        if (body.image !== undefined) await sql`UPDATE categories SET image = ${body.image} WHERE id = ${category.id}`;
        if (body.active !== undefined) await sql`UPDATE categories SET active = ${body.active ? 1 : 0} WHERE id = ${category.id}`;
      } catch (neonErr) {
        console.warn("Neon category update sync warning:", neonErr);
      }
    }

    return NextResponse.json({ success: true, message: "Category updated successfully" });
  } catch (error: any) {
    console.error("Category update error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthenticatedUser(request);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const db = getDb();

    const category = db.prepare("SELECT * FROM categories WHERE id = ? OR slug = ?").get(id, id) as any;
    if (!category) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
    }

    // Dependency check: prevent deleting categories that contain products
    const prodCount = db.prepare(`
      SELECT count(*) as count 
      FROM products 
      WHERE category_id = ? OR category_id = ?
    `).get(category.id, category.slug) as { count: number };

    if (prodCount && prodCount.count > 0) {
      return NextResponse.json({
        success: false,
        error: `Cannot delete '${category.name}' because it contains ${prodCount.count} active product(s). Please reassign or delete these products first, or disable this category instead.`,
        productCount: prodCount.count,
      }, { status: 400 });
    }

    // Delete category
    db.prepare("DELETE FROM categories WHERE id = ?").run(category.id);

    // Sync to Neon DB
    if (process.env.DATABASE_URL) {
      try {
        await sql`DELETE FROM categories WHERE id = ${category.id}`;
      } catch {}
    }

    return NextResponse.json({
      success: true,
      message: `Category '${category.name}' deleted successfully`,
    });
  } catch (error: any) {
    console.error("Category delete error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to delete category" }, { status: 500 });
  }
}
