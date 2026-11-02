import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth/jwt";
import { ADDON_PRODUCTS } from "@/data/addons";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const db = getDb();

    let product: any = db.prepare(`
      SELECT
        p.id, p.name, p.slug, p.description, p.short_description, p.images, p.price, p.discount_price,
        p.stock, p.low_stock_threshold, p.sku, p.featured, p.active, p.rating, p.reviews_count,
        p.delivery_info, p.offers, p.includes, p.badge, p.created_at, p.updated_at,
        p.type, p.status, p.tags, p.seo_title, p.seo_description, p.attributes,
        p.category_id, p.flower_type_id, p.occasion_id,
        c.name as category_name, c.slug as category_slug,
        ft.name as flower_type_name, ft.slug as flower_type_slug,
        o.name as occasion_name, o.slug as occasion_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN flower_types ft ON p.flower_type_id = ft.id
      LEFT JOIN occasions o ON p.occasion_id = o.id
      WHERE p.slug = ? OR p.id = ?
    `).get(slug, slug);

    if (!product && typeof slug === "string" && slug.startsWith("addon-")) {
      const stripped = slug.replace(/^addon-/, "");
      product = db.prepare(`
        SELECT
          p.id, p.name, p.slug, p.description, p.short_description, p.images, p.price, p.discount_price,
          p.stock, p.low_stock_threshold, p.sku, p.featured, p.active, p.rating, p.reviews_count,
          p.delivery_info, p.offers, p.includes, p.badge, p.created_at, p.updated_at,
          p.type, p.status, p.tags, p.seo_title, p.seo_description, p.attributes,
          p.category_id, p.flower_type_id, p.occasion_id,
          c.name as category_name, c.slug as category_slug,
          ft.name as flower_type_name, ft.slug as flower_type_slug,
          o.name as occasion_name, o.slug as occasion_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN flower_types ft ON p.flower_type_id = ft.id
        LEFT JOIN occasions o ON p.occasion_id = o.id
        WHERE p.slug = ? OR p.id = ?
      `).get(stripped, stripped);
    }

    if (!product) {
      const addon = ADDON_PRODUCTS.find(
        (a) => a.id === slug || a.href.endsWith(`/${slug}`) || a.name.toLowerCase() === slug.toLowerCase()
      );
      if (addon) {
        product = {
          id: addon.id,
          name: addon.name,
          slug: addon.id,
          description: addon.name,
          short_description: "",
          images: JSON.stringify([addon.image]),
          price: addon.price,
          discount_price: null,
          stock: 100,
          low_stock_threshold: 5,
          sku: `SKU-${addon.id.toUpperCase()}`,
          featured: 0,
          active: 1,
          status: "published",
          type: "general",
          tags: "[]",
          attributes: "{}",
          seo_title: "",
          seo_description: "",
          rating: 5.0,
          reviews_count: 24,
          delivery_info: "Same-day delivery available across Kerala",
          offers: "[]",
          includes: "[]",
          badge: null,
          category_id: "cat-flower-basket",
          category_name: addon.category,
          category_slug: addon.category.toLowerCase(),
          flower_type_id: "ft-mixed-flowers",
          flower_type_name: null,
          flower_type_slug: null,
          occasion_id: "occ-birthday",
          occasion_name: null,
          occasion_slug: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
    }

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    let parsedImages: string[] = [];
    try {
      parsedImages = JSON.parse(product.images);
    } catch {
      parsedImages = [product.images];
    }

    let parsedOffers: string[] = [];
    try {
      parsedOffers = JSON.parse(product.offers || "[]");
    } catch {
      parsedOffers = [];
    }

    let parsedIncludes: string[] = [];
    try {
      parsedIncludes = JSON.parse(product.includes || "[]");
    } catch {
      parsedIncludes = [];
    }

    let parsedTags: string[] = [];
    try {
      parsedTags = JSON.parse(product.tags || "[]");
    } catch {
      parsedTags = [];
    }

    let parsedAttributes: Record<string, any> = {};
    try {
      parsedAttributes = JSON.parse(product.attributes || "{}");
    } catch {
      parsedAttributes = {};
    }

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        shortDescription: product.short_description || "",
        price: product.price,
        originalPrice: product.discount_price,
        image: parsedImages[0] || "/images/sunflower-bouquet.jpg",
        images: parsedImages,
        stock: product.stock,
        lowStockThreshold: product.low_stock_threshold ?? 5,
        sku: product.sku,
        category: product.category_slug || "flower",
        categoryId: product.category_id,
        categoryLabel: product.category_name || "Flowers",
        type: product.type || "general",
        status: product.status || "published",
        flowerType: product.flower_type_slug,
        flowerTypeId: product.flower_type_id,
        flowerTypeLabel: product.flower_type_name,
        occasion: product.occasion_slug,
        occasionId: product.occasion_id,
        occasionLabel: product.occasion_name,
        featured: !!product.featured,
        active: !!product.active,
        rating: product.rating,
        reviewsCount: product.reviews_count,
        deliveryInfo: product.delivery_info,
        offers: parsedOffers,
        includes: parsedIncludes,
        tags: parsedTags,
        attributes: parsedAttributes,
        seoTitle: product.seo_title || "",
        seoDescription: product.seo_description || "",
        badge: product.badge,
        createdAt: product.created_at,
        updatedAt: product.updated_at,
      },
    });
  } catch (error: any) {
    console.error("Product get error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const auth = getAuthenticatedUser(request);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { slug } = await params;
    const body = await request.json();
    const db = getDb();
    const now = new Date().toISOString();

    const product = db.prepare("SELECT * FROM products WHERE slug = ? OR id = ?").get(slug, slug);
    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    const updates: string[] = ["updated_at = ?"];
    const values: any[] = [now];

    if (body.name !== undefined) { updates.push("name = ?"); values.push(body.name.trim()); }
    if (body.slug !== undefined) {
      const newSlug = body.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      if (newSlug && newSlug !== product.slug) {
        const existing = db.prepare("SELECT id FROM products WHERE slug = ? AND id != ?").get(newSlug, product.id);
        if (existing) {
          return NextResponse.json({ success: false, error: "Product slug already in use" }, { status: 400 });
        }
        updates.push("slug = ?");
        values.push(newSlug);
      }
    }
    if (body.description !== undefined) { updates.push("description = ?"); values.push(body.description); }
    if (body.shortDescription !== undefined) { updates.push("short_description = ?"); values.push(body.shortDescription); }
    if (body.price !== undefined) { updates.push("price = ?"); values.push(Number(body.price)); }
    if (body.originalPrice !== undefined) { updates.push("discount_price = ?"); values.push(body.originalPrice ? Number(body.originalPrice) : null); }
    if (body.stock !== undefined) { updates.push("stock = ?"); values.push(Number(body.stock)); }
    if (body.lowStockThreshold !== undefined) { updates.push("low_stock_threshold = ?"); values.push(Number(body.lowStockThreshold)); }
    if (body.sku !== undefined) { updates.push("sku = ?"); values.push(body.sku); }
    if (body.active !== undefined) { updates.push("active = ?"); values.push(body.active ? 1 : 0); }
    if (body.featured !== undefined) { updates.push("featured = ?"); values.push(body.featured ? 1 : 0); }
    if (body.status !== undefined) { updates.push("status = ?"); values.push(body.status); }
    if (body.type !== undefined) { updates.push("type = ?"); values.push(body.type); }
    if (body.images !== undefined) { updates.push("images = ?"); values.push(JSON.stringify(Array.isArray(body.images) ? body.images : [body.images])); }
    if (body.badge !== undefined) { updates.push("badge = ?"); values.push(body.badge); }
    if (body.deliveryInfo !== undefined) { updates.push("delivery_info = ?"); values.push(body.deliveryInfo); }
    if (body.offers !== undefined) { updates.push("offers = ?"); values.push(JSON.stringify(Array.isArray(body.offers) ? body.offers : [])); }
    if (body.includes !== undefined) { updates.push("includes = ?"); values.push(JSON.stringify(Array.isArray(body.includes) ? body.includes : [])); }
    if (body.tags !== undefined) { updates.push("tags = ?"); values.push(JSON.stringify(Array.isArray(body.tags) ? body.tags : [])); }
    if (body.seoTitle !== undefined) { updates.push("seo_title = ?"); values.push(body.seoTitle); }
    if (body.seoDescription !== undefined) { updates.push("seo_description = ?"); values.push(body.seoDescription); }
    if (body.attributes !== undefined) { updates.push("attributes = ?"); values.push(JSON.stringify(typeof body.attributes === "object" && body.attributes !== null ? body.attributes : {})); }
    if (body.categoryId !== undefined) { updates.push("category_id = ?"); values.push(body.categoryId); }
    if (body.flowerTypeId !== undefined) { updates.push("flower_type_id = ?"); values.push(body.flowerTypeId); }
    if (body.occasionId !== undefined) { updates.push("occasion_id = ?"); values.push(body.occasionId); }

    values.push(product.id);

    db.prepare(`UPDATE products SET ${updates.join(", ")} WHERE id = ?`).run(...values);

    return NextResponse.json({ success: true, message: "Product updated successfully" });
  } catch (error: any) {
    console.error("Product update error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const auth = getAuthenticatedUser(request);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { slug } = await params;
    const db = getDb();

    const product = db.prepare("SELECT id, name FROM products WHERE slug = ? OR id = ?").get(slug, slug);
    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    db.prepare("DELETE FROM products WHERE id = ?").run(product.id);

    return NextResponse.json({
      success: true,
      message: `Product '${product.name}' deleted successfully`,
    });
  } catch (error: any) {
    console.error("Product delete error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to delete product" }, { status: 500 });
  }
}
