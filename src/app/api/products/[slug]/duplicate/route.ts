import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth/jwt";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const auth = getAuthenticatedUser(request);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const { slug } = await params;
    const db = getDb();

    const product: any = db.prepare("SELECT * FROM products WHERE slug = ? OR id = ?").get(slug, slug);
    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    const now = new Date().toISOString();

    // Generate unique slug
    let baseSlug = `${product.slug}-copy`;
    let newSlug = baseSlug;
    let counter = 1;
    while (db.prepare("SELECT id FROM products WHERE slug = ?").get(newSlug)) {
      counter++;
      newSlug = `${baseSlug}-${counter}`;
    }

    const newId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newName = `${product.name} (Copy)`;
    const newSku = product.sku ? `${product.sku}-COPY-${Date.now().toString().slice(-4)}` : `SKU-${Date.now().toString().slice(-6)}`;

    db.prepare(`
      INSERT INTO products (
        id, name, slug, description, short_description, images, price, discount_price,
        stock, low_stock_threshold, sku, category_id, flower_type_id, occasion_id,
        featured, active, rating, reviews_count, delivery_info,
        offers, includes, badge, type, status, tags, seo_title, seo_description,
        attributes, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        0, 1, ?, ?, ?,
        ?, ?, ?, ?, 'draft', ?, ?, ?,
        ?, ?, ?
      )
    `).run(
      newId,
      newName,
      newSlug,
      product.description || "",
      product.short_description || "",
      product.images || "[]",
      product.price,
      product.discount_price,
      product.stock,
      product.low_stock_threshold ?? 5,
      newSku,
      product.category_id,
      product.flower_type_id,
      product.occasion_id,
      product.rating ?? 5.0,
      product.reviews_count ?? 0,
      product.delivery_info || "",
      product.offers || "[]",
      product.includes || "[]",
      product.badge || null,
      product.type || "flower",
      product.tags || "[]",
      product.seo_title || "",
      product.seo_description || "",
      product.attributes || "{}",
      now,
      now
    );

    return NextResponse.json({
      success: true,
      message: "Product duplicated successfully as draft",
      product: {
        id: newId,
        slug: newSlug,
        name: newName,
        sku: newSku,
        status: "draft",
      },
    });
  } catch (error: any) {
    console.error("Product duplicate error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to duplicate product" },
      { status: 500 }
    );
  }
}

