import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { getAuthenticatedUser } from "@/lib/auth/jwt";
import { ADDON_PRODUCTS } from "@/data/addons";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    let product: any = null;
    const rows = await sql`
      SELECT
        p.id, p.name, p.slug, p.description, p.short_description, p.images, p.price, p.discount_price,
        p.stock, p.low_stock_threshold, p.sku, p.featured, p.active, p.rating, p.reviews_count,
        p.delivery_info, p.offers, p.includes, p.badge, p.created_at, p.updated_at,
        p.type, p.status, p.tags, p.seo_title, p.seo_description, p.attributes, p.addon_category,
        p.category_id, p.flower_type_id, p.occasion_id,
        c.name as category_name, c.slug as category_slug,
        ft.name as flower_type_name, ft.slug as flower_type_slug,
        o.name as occasion_name, o.slug as occasion_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN flower_types ft ON p.flower_type_id = ft.id
      LEFT JOIN occasions o ON p.occasion_id = o.id
      WHERE p.slug = ${slug} OR p.id = ${slug}
      LIMIT 1
    `;

    if (rows && rows.length > 0) {
      product = rows[0];
    }

    if (!product && typeof slug === "string" && slug.startsWith("addon-")) {
      const stripped = slug.replace(/^addon-/, "");
      const strippedRows = await sql`
        SELECT
          p.id, p.name, p.slug, p.description, p.short_description, p.images, p.price, p.discount_price,
          p.stock, p.low_stock_threshold, p.sku, p.featured, p.active, p.rating, p.reviews_count,
          p.delivery_info, p.offers, p.includes, p.badge, p.created_at, p.updated_at,
          p.type, p.status, p.tags, p.seo_title, p.seo_description, p.attributes, p.addon_category,
          p.category_id, p.flower_type_id, p.occasion_id,
          c.name as category_name, c.slug as category_slug,
          ft.name as flower_type_name, ft.slug as flower_type_slug,
          o.name as occasion_name, o.slug as occasion_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN flower_types ft ON p.flower_type_id = ft.id
        LEFT JOIN occasions o ON p.occasion_id = o.id
        WHERE p.slug = ${stripped} OR p.id = ${stripped}
        LIMIT 1
      `;
      if (strippedRows && strippedRows.length > 0) {
        product = strippedRows[0];
      }
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
      parsedImages = product.images ? [product.images] : [];
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
        price: Number(product.price),
        originalPrice: product.discount_price ? Number(product.discount_price) : undefined,
        image: parsedImages[0] || "/images/sunflower-bouquet.jpg",
        images: parsedImages,
        stock: Number(product.stock),
        lowStockThreshold: product.low_stock_threshold ?? 5,
        sku: product.sku,
        category: product.category_slug || (product.category_id ? product.category_id.replace(/^cat-/, "") : "flower"),
        categoryId: product.category_id,
        categorySlug: product.category_slug || (product.category_id ? product.category_id.replace(/^cat-/, "") : "flower"),
        categoryLabel: product.category_name || (
          product.category_id === "cat-flower-basket" ? "Flower Basket" :
          product.category_id === "cat-flower-bouquet" ? "Flower Bouquet" :
          product.category_id === "cat-cakes" ? "Cakes" :
          product.category_id === "cat-table-decor" ? "Table Decor" :
          product.category_id === "cat-wreath" ? "Wreath" :
          product.category_id === "cat-addons" ? "Add-ons" :
          "Flowers"
        ),
        addonCategory: product.addon_category || null,
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
        rating: Number(product.rating) || 5.0,
        reviewsCount: Number(product.reviews_count) || 0,
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
    const now = new Date().toISOString();

    const existingProducts = await sql`SELECT * FROM products WHERE slug = ${slug} OR id = ${slug} LIMIT 1`;
    if (!existingProducts || existingProducts.length === 0) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }
    const product = existingProducts[0];

    const values: any[] = [now];
    const updates: string[] = ["updated_at = $1"];

    const addParam = (val: any) => {
      values.push(val);
      return `$${values.length}`;
    };

    if (body.name !== undefined) {
      updates.push(`name = ${addParam(body.name.trim())}`);
    }
    if (body.slug !== undefined) {
      const newSlug = body.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      if (newSlug && newSlug !== product.slug) {
        const existing = await sql`SELECT id FROM products WHERE slug = ${newSlug} AND id != ${product.id} LIMIT 1`;
        if (existing && existing.length > 0) {
          return NextResponse.json({ success: false, error: "Product slug already in use" }, { status: 400 });
        }
        updates.push(`slug = ${addParam(newSlug)}`);
      }
    }
    if (body.description !== undefined) {
      updates.push(`description = ${addParam(body.description)}`);
    }
    if (body.shortDescription !== undefined) {
      updates.push(`short_description = ${addParam(body.shortDescription)}`);
    }
    if (body.price !== undefined) {
      updates.push(`price = ${addParam(Number(body.price))}`);
    }
    if (body.originalPrice !== undefined) {
      updates.push(`discount_price = ${addParam(body.originalPrice ? Number(body.originalPrice) : null)}`);
    }
    if (body.stock !== undefined) {
      updates.push(`stock = ${addParam(Number(body.stock))}`);
    }
    if (body.lowStockThreshold !== undefined) {
      updates.push(`low_stock_threshold = ${addParam(Number(body.lowStockThreshold))}`);
    }
    if (body.sku !== undefined) {
      updates.push(`sku = ${addParam(body.sku)}`);
    }
    if (body.active !== undefined) {
      updates.push(`active = ${addParam(body.active ? 1 : 0)}`);
    }
    if (body.featured !== undefined) {
      updates.push(`featured = ${addParam(body.featured ? 1 : 0)}`);
    }
    if (body.status !== undefined) {
      updates.push(`status = ${addParam(body.status)}`);
    }
    if (body.type !== undefined) {
      updates.push(`type = ${addParam(body.type)}`);
    }
    if (body.images !== undefined) {
      updates.push(`images = ${addParam(JSON.stringify(Array.isArray(body.images) ? body.images : [body.images]))}`);
    }
    if (body.badge !== undefined) {
      updates.push(`badge = ${addParam(body.badge)}`);
    }
    if (body.deliveryInfo !== undefined) {
      updates.push(`delivery_info = ${addParam(body.deliveryInfo)}`);
    }
    if (body.offers !== undefined) {
      updates.push(`offers = ${addParam(JSON.stringify(Array.isArray(body.offers) ? body.offers : []))}`);
    }
    if (body.includes !== undefined) {
      updates.push(`includes = ${addParam(JSON.stringify(Array.isArray(body.includes) ? body.includes : []))}`);
    }
    if (body.tags !== undefined) {
      updates.push(`tags = ${addParam(JSON.stringify(Array.isArray(body.tags) ? body.tags : []))}`);
    }
    if (body.seoTitle !== undefined) {
      updates.push(`seo_title = ${addParam(body.seoTitle)}`);
    }
    if (body.seoDescription !== undefined) {
      updates.push(`seo_description = ${addParam(body.seoDescription)}`);
    }
    if (body.attributes !== undefined) {
      updates.push(`attributes = ${addParam(JSON.stringify(typeof body.attributes === "object" && body.attributes !== null ? body.attributes : {}))}`);
    }
    if (body.categoryId !== undefined) {
      updates.push(`category_id = ${addParam(body.categoryId)}`);
    }
    if (body.addonCategory !== undefined || body.addon_category !== undefined) {
      const catVal = body.addonCategory ?? body.addon_category;
      updates.push(`addon_category = ${addParam(catVal || null)}`);
    }
    if (body.flowerTypeId !== undefined) {
      updates.push(`flower_type_id = ${addParam(body.flowerTypeId)}`);
    }
    if (body.occasionId !== undefined) {
      updates.push(`occasion_id = ${addParam(body.occasionId)}`);
    }

    const idPlaceholder = addParam(product.id);
    await sql.query(`UPDATE products SET ${updates.join(", ")} WHERE id = ${idPlaceholder}`, values);

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
    const existingProducts = await sql`SELECT id, name FROM products WHERE slug = ${slug} OR id = ${slug} LIMIT 1`;
    if (!existingProducts || existingProducts.length === 0) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }
    const product = existingProducts[0];

    // Check if product is referenced in any customer orders
    const orderCountRes = await sql`SELECT count(*)::int as count FROM order_items WHERE product_id = ${product.id}`;
    const hasOrders = (orderCountRes[0]?.count || 0) > 0;

    const { searchParams } = new URL(request.url);
    const forceHardDelete = searchParams.get("force") === "true";

    if (hasOrders && !forceHardDelete) {
      // Soft-delete / Archive product to protect order history integrity
      const now = new Date().toISOString();
      await sql`UPDATE products SET active = 0, status = 'archived', updated_at = ${now} WHERE id = ${product.id}`;
      return NextResponse.json({
        success: true,
        archived: true,
        message: `Product '${product.name}' is referenced in past customer orders and has been safely archived/unpublished instead of deleted to protect order history.`,
      });
    }

    // Hard delete if never ordered
    await sql`DELETE FROM products WHERE id = ${product.id}`;

    return NextResponse.json({
      success: true,
      message: `Product '${product.name}' deleted successfully`,
    });
  } catch (error: any) {
    console.error("Product delete error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to delete product" }, { status: 500 });
  }
}
