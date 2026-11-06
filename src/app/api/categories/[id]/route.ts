import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { getAuthenticatedUser } from "@/lib/auth/jwt";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const cats = await sql`
      SELECT c.*, count(p.id)::int as product_count
      FROM categories c
      LEFT JOIN products p ON (p.category_id = c.id OR p.category_id = c.slug)
      WHERE c.id = ${id} OR c.slug = ${id}
      GROUP BY c.id
      LIMIT 1
    `;

    if (!cats || cats.length === 0) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
    }

    const category = cats[0];
    const products = await sql`
      SELECT id, name, slug, price, stock, active, status, images
      FROM products
      WHERE category_id = ${category.id} OR category_id = ${category.slug}
      ORDER BY name ASC
    `;

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

    const existingCats = await sql`SELECT * FROM categories WHERE id = ${id} OR slug = ${id} LIMIT 1`;
    if (!existingCats || existingCats.length === 0) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
    }
    const category = existingCats[0];

    const updates: string[] = [];
    const values: any[] = [];

    const addParam = (val: any) => {
      values.push(val);
      return `$${values.length}`;
    };

    if (body.name !== undefined) {
      updates.push(`name = ${addParam(body.name.trim())}`);
    }

    if (body.slug !== undefined) {
      const cleanSlug = body.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      if (cleanSlug && cleanSlug !== category.slug) {
        const slugCheck = await sql`SELECT id FROM categories WHERE slug = ${cleanSlug} AND id != ${category.id} LIMIT 1`;
        if (slugCheck && slugCheck.length > 0) {
          return NextResponse.json({ success: false, error: "Slug already in use by another category" }, { status: 400 });
        }
        updates.push(`slug = ${addParam(cleanSlug)}`);
      }
    }

    if (body.description !== undefined) {
      updates.push(`description = ${addParam(body.description)}`);
    }

    if (body.image !== undefined) {
      updates.push(`image = ${addParam(body.image)}`);
    }

    if (body.displayOrder !== undefined || body.display_order !== undefined) {
      updates.push(`display_order = ${addParam(Number(body.displayOrder ?? body.display_order) || 0)}`);
    }

    if (body.active !== undefined) {
      updates.push(`active = ${addParam(body.active ? 1 : 0)}`);
    }

    if (updates.length === 0) {
      return NextResponse.json({ success: true, message: "No changes requested" });
    }

    const idPlaceholder = addParam(category.id);
    await sql.query(`UPDATE categories SET ${updates.join(", ")} WHERE id = ${idPlaceholder}`, values);

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

    const existingCats = await sql`SELECT * FROM categories WHERE id = ${id} OR slug = ${id} LIMIT 1`;
    if (!existingCats || existingCats.length === 0) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
    }
    const category = existingCats[0];

    // Dependency check: prevent deleting categories that contain products
    const prodCountRes = await sql`
      SELECT count(*)::int as count 
      FROM products 
      WHERE category_id = ${category.id} OR category_id = ${category.slug}
    `;
    const prodCount = prodCountRes[0]?.count || 0;

    if (prodCount > 0) {
      return NextResponse.json({
        success: false,
        error: `Cannot delete '${category.name}' because it contains ${prodCount} active product(s). Please reassign or delete these products first, or disable this category instead.`,
        productCount: prodCount,
      }, { status: 400 });
    }

    // Delete category
    await sql`DELETE FROM categories WHERE id = ${category.id}`;

    return NextResponse.json({
      success: true,
      message: `Category '${category.name}' deleted successfully`,
    });
  } catch (error: any) {
    console.error("Category delete error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to delete category" }, { status: 500 });
  }
}
