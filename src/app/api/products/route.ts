import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth/jwt";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim().toLowerCase();
    const category = searchParams.get("category")?.trim().toLowerCase();
    const flower = searchParams.get("flower")?.trim().toLowerCase();
    const occasion = searchParams.get("occasion")?.trim().toLowerCase();
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : null;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : null;
    const sort = searchParams.get("sort") || "featured";
    const featured = searchParams.get("featured");
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 24));
    const offset = (page - 1) * limit;

    const db = getDb();

    const whereClauses: string[] = ["p.active = 1"];
    const params: any[] = [];

    // Search query (matches name, description, badge)
    if (search) {
      whereClauses.push("(LOWER(p.name) LIKE ? OR LOWER(p.description) LIKE ? OR LOWER(p.slug) LIKE ?)");
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    // Category filter
    if (category && category !== "all") {
      whereClauses.push("(c.slug = ? OR p.category_id = ?)");
      params.push(category, category);
    }

    // Flower type filter
    if (flower && flower !== "all") {
      whereClauses.push("(ft.slug = ? OR p.flower_type_id = ?)");
      params.push(flower, flower);
    }

    // Occasion filter
    if (occasion && occasion !== "all") {
      whereClauses.push("(o.slug = ? OR p.occasion_id = ?)");
      params.push(occasion, occasion);
    }

    // Price filters
    if (minPrice !== null && !isNaN(minPrice)) {
      whereClauses.push("p.price >= ?");
      params.push(minPrice);
    }
    if (maxPrice !== null && !isNaN(maxPrice)) {
      whereClauses.push("p.price <= ?");
      params.push(maxPrice);
    }

    // Featured filter
    if (featured === "true" || featured === "1") {
      whereClauses.push("p.featured = 1");
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // Sorting
    let orderSql = "ORDER BY p.featured DESC, p.id ASC";
    if (sort === "price-asc" || sort === "low-to-high") {
      orderSql = "ORDER BY p.price ASC";
    } else if (sort === "price-desc" || sort === "high-to-low") {
      orderSql = "ORDER BY p.price DESC";
    } else if (sort === "rating") {
      orderSql = "ORDER BY p.rating DESC";
    } else if (sort === "newest") {
      orderSql = "ORDER BY p.created_at DESC";
    }

    // Count total matching items
    const countSql = `
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN flower_types ft ON p.flower_type_id = ft.id
      LEFT JOIN occasions o ON p.occasion_id = o.id
      ${whereSql}
    `;
    const countResult = db.prepare(countSql).get(...params);
    const total = countResult ? countResult.total : 0;

    // Fetch paginated products
    const querySql = `
      SELECT
        p.id, p.name, p.slug, p.description, p.images, p.price, p.discount_price,
        p.stock, p.sku, p.featured, p.active, p.rating, p.reviews_count,
        p.delivery_info, p.offers, p.includes, p.badge, p.created_at, p.updated_at,
        c.name as category_name, c.slug as category_slug,
        ft.name as flower_type_name, ft.slug as flower_type_slug,
        o.name as occasion_name, o.slug as occasion_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN flower_types ft ON p.flower_type_id = ft.id
      LEFT JOIN occasions o ON p.occasion_id = o.id
      ${whereSql}
      ${orderSql}
      LIMIT ? OFFSET ?
    `;

    const rawRows = db.prepare(querySql).all(...params, limit, offset);

    const products = rawRows.map((r: any) => {
      let parsedImages = [];
      try {
        parsedImages = JSON.parse(r.images);
      } catch {
        parsedImages = [r.images];
      }

      let parsedOffers = [];
      try {
        parsedOffers = JSON.parse(r.offers || "[]");
      } catch {
        parsedOffers = [];
      }

      let parsedIncludes = [];
      try {
        parsedIncludes = JSON.parse(r.includes || "[]");
      } catch {
        parsedIncludes = [];
      }

      return {
        id: r.id,
        name: r.name,
        slug: r.slug,
        description: r.description,
        price: r.price,
        originalPrice: r.discount_price,
        image: parsedImages[0] || "/images/lily-6-stems.png",
        images: parsedImages,
        stock: r.stock,
        sku: r.sku,
        category: r.category_slug || "flower",
        categoryLabel: r.category_name || "Flowers",
        flowerType: r.flower_type_slug,
        flowerTypeLabel: r.flower_type_name,
        occasion: r.occasion_slug,
        occasionLabel: r.occasion_name,
        featured: !!r.featured,
        active: !!r.active,
        rating: r.rating,
        reviewsCount: r.reviews_count,
        deliveryInfo: r.delivery_info,
        offers: parsedOffers,
        includes: parsedIncludes,
        badge: r.badge,
        createdAt: r.created_at,
      };
    });

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Products query error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = getAuthenticatedUser(request);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      slug,
      description,
      images,
      price,
      originalPrice,
      stock,
      sku,
      categoryId,
      flowerTypeId,
      occasionId,
      featured,
      badge,
      deliveryInfo,
      offers,
      includes,
    } = body;

    if (!name || !price) {
      return NextResponse.json({ success: false, error: "Product name and price are required" }, { status: 400 });
    }

    const cleanSlug = slug
      ? slug.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      : name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const id = "prod-" + cleanSlug;
    const now = new Date().toISOString();
    const db = getDb();

    const imageArray = Array.isArray(images) ? images : [images || "/images/lily-6-stems.png"];

    db.prepare(`
      INSERT INTO products (
        id, name, slug, description, images, price, discount_price,
        stock, sku, category_id, flower_type_id, occasion_id,
        featured, active, rating, reviews_count, delivery_info,
        offers, includes, badge, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 5.0, 1, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      name,
      cleanSlug,
      description || "",
      JSON.stringify(imageArray),
      Number(price),
      originalPrice ? Number(originalPrice) : null,
      stock !== undefined ? Number(stock) : 50,
      sku || `SKU-${id.toUpperCase()}`,
      categoryId || "cat-flower-bouquet",
      flowerTypeId || "ft-mixed-flowers",
      occasionId || "occ-birthday",
      featured ? 1 : 0,
      deliveryInfo || "Same-day Calicut delivery available",
      JSON.stringify(offers || []),
      JSON.stringify(includes || []),
      badge || null,
      now,
      now
    );

    return NextResponse.json({
      success: true,
      message: "Product created successfully",
      productId: id,
    });
  } catch (error: any) {
    console.error("Product create error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to create product" }, { status: 500 });
  }
}
