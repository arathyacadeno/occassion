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
    const productType = searchParams.get("type")?.trim().toLowerCase();
    const status = searchParams.get("status")?.trim().toLowerCase();
    const stockStatus = searchParams.get("stockStatus")?.trim().toLowerCase();
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : null;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : null;
    const sort = searchParams.get("sort") || "featured";
    const featured = searchParams.get("featured");
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(200, Math.max(1, Number(searchParams.get("limit")) || 24));
    const offset = (page - 1) * limit;

    const auth = getAuthenticatedUser(request);
    const isAdmin = auth?.role === "admin";

    const db = getDb();

    const whereClauses: string[] = [];
    const params: any[] = [];

    // Customer vs Admin visibility rule:
    // Public customers only see active = 1 AND status = 'published' (or published legacy products where status is null)
    if (!isAdmin) {
      whereClauses.push("p.active = 1");
      whereClauses.push("(p.status = 'published' OR p.status IS NULL OR p.status = '')");
    } else {
      // Admin can filter by status ('all', 'published', 'draft')
      if (status && status !== "all") {
        whereClauses.push("p.status = ?");
        params.push(status);
      }
      // Admin can filter by active/inactive
      const activeParam = searchParams.get("active");
      if (activeParam !== null && activeParam !== "all") {
        whereClauses.push("p.active = ?");
        params.push(activeParam === "true" || activeParam === "1" ? 1 : 0);
      }
    }

    // Search query (matches name, description, slug, sku, badge)
    if (search) {
      whereClauses.push("(LOWER(p.name) LIKE ? OR LOWER(p.description) LIKE ? OR LOWER(p.slug) LIKE ? OR LOWER(p.sku) LIKE ? OR LOWER(p.badge) LIKE ?)");
      const term = `%${search}%`;
      params.push(term, term, term, term, term);
    }

    // Category filter
    if (category && category !== "all") {
      whereClauses.push("(c.slug = ? OR p.category_id = ?)");
      params.push(category, category);
    }

    // Product Type filter (flower, cake, basket, wreath, decor, general)
    if (productType && productType !== "all") {
      whereClauses.push("p.type = ?");
      params.push(productType);
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

    // Stock Status filter (in_stock, low_stock, out_of_stock)
    if (stockStatus && stockStatus !== "all") {
      if (stockStatus === "out_of_stock") {
        whereClauses.push("p.stock <= 0");
      } else if (stockStatus === "low_stock") {
        whereClauses.push("p.stock > 0 AND p.stock <= COALESCE(p.low_stock_threshold, 5)");
      } else if (stockStatus === "in_stock") {
        whereClauses.push("p.stock > COALESCE(p.low_stock_threshold, 5)");
      }
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
    } else if (sort === "name-asc") {
      orderSql = "ORDER BY p.name ASC";
    } else if (sort === "stock-asc") {
      orderSql = "ORDER BY p.stock ASC";
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
        p.type, p.status, p.short_description, p.tags, p.low_stock_threshold,
        p.seo_title, p.seo_description, p.attributes,
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
      let parsedImages: string[] = [];
      try {
        parsedImages = JSON.parse(r.images);
      } catch {
        parsedImages = [r.images];
      }

      let parsedOffers: string[] = [];
      try {
        parsedOffers = JSON.parse(r.offers || "[]");
      } catch {
        parsedOffers = [];
      }

      let parsedIncludes: string[] = [];
      try {
        parsedIncludes = JSON.parse(r.includes || "[]");
      } catch {
        parsedIncludes = [];
      }

      let parsedTags: string[] = [];
      try {
        parsedTags = JSON.parse(r.tags || "[]");
      } catch {
        parsedTags = [];
      }

      let parsedAttributes: Record<string, any> = {};
      try {
        parsedAttributes = JSON.parse(r.attributes || "{}");
      } catch {
        parsedAttributes = {};
      }

      return {
        id: r.id,
        name: r.name,
        slug: r.slug,
        description: r.description,
        shortDescription: r.short_description || "",
        price: r.price,
        originalPrice: r.discount_price,
        image: parsedImages[0] || "/images/sunflower-bouquet.jpg",
        images: parsedImages,
        stock: r.stock,
        lowStockThreshold: r.low_stock_threshold ?? 5,
        sku: r.sku,
        category: r.category_slug || "flower",
        categoryId: r.category_id,
        categoryLabel: r.category_name || "Flowers",
        type: r.type || "general",
        status: r.status || "published",
        flowerType: r.flower_type_slug,
        flowerTypeId: r.flower_type_id,
        flowerTypeLabel: r.flower_type_name,
        occasion: r.occasion_slug,
        occasionId: r.occasion_id,
        occasionLabel: r.occasion_name,
        featured: !!r.featured,
        active: !!r.active,
        rating: r.rating,
        reviewsCount: r.reviews_count,
        deliveryInfo: r.delivery_info,
        offers: parsedOffers,
        includes: parsedIncludes,
        tags: parsedTags,
        attributes: parsedAttributes,
        seoTitle: r.seo_title || "",
        seoDescription: r.seo_description || "",
        badge: r.badge,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
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
      shortDescription,
      images,
      price,
      originalPrice,
      stock,
      lowStockThreshold,
      sku,
      categoryId,
      flowerTypeId,
      occasionId,
      featured,
      active,
      badge,
      deliveryInfo,
      offers,
      includes,
      type,
      status,
      tags,
      seoTitle,
      seoDescription,
      attributes,
    } = body;

    // Validation
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ success: false, error: "Product name is required" }, { status: 400 });
    }
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return NextResponse.json({ success: false, error: "Valid product price is required" }, { status: 400 });
    }

    const db = getDb();
    const now = new Date().toISOString();

    // Generate unique slug
    let cleanSlug = slug
      ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
      : name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    if (!cleanSlug) cleanSlug = "product-" + Date.now();

    // Ensure slug uniqueness
    const existingSlug = db.prepare("SELECT id FROM products WHERE slug = ?").get(cleanSlug);
    if (existingSlug) {
      cleanSlug = `${cleanSlug}-${Date.now().toString().slice(-4)}`;
    }

    const id = body.id || `prod-${cleanSlug}`;
    const imageArray = Array.isArray(images) && images.length > 0 ? images : ["/images/sunflower-bouquet.jpg"];

    // Infer product type if omitted
    let inferredType = type || "general";
    if (!type || type === "general") {
      const lower = (name + " " + (categoryId || "")).toLowerCase();
      if (lower.includes("cake")) inferredType = "cake";
      else if (lower.includes("basket")) inferredType = "basket";
      else if (lower.includes("wreath")) inferredType = "wreath";
      else if (lower.includes("table") || lower.includes("decor")) inferredType = "decor";
      else if (lower.includes("flower") || lower.includes("rose") || lower.includes("lily") || lower.includes("bouquet")) inferredType = "flower";
    }

    db.prepare(`
      INSERT INTO products (
        id, name, slug, description, short_description, images, price, discount_price,
        stock, low_stock_threshold, sku, category_id, flower_type_id, occasion_id,
        featured, active, rating, reviews_count, delivery_info,
        offers, includes, badge, type, status, tags, seo_title, seo_description,
        attributes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 5.0, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      name.trim(),
      cleanSlug,
      description || "",
      shortDescription || "",
      JSON.stringify(imageArray),
      numPrice,
      originalPrice ? Number(originalPrice) : null,
      stock !== undefined ? Number(stock) : 45,
      lowStockThreshold !== undefined ? Number(lowStockThreshold) : 5,
      sku || `SKU-${id.toUpperCase()}`,
      categoryId || "cat-flower-bouquet",
      flowerTypeId || "ft-mixed-flowers",
      occasionId || "occ-birthday",
      featured ? 1 : 0,
      active !== undefined ? (active ? 1 : 0) : 1,
      deliveryInfo || "Same-day Calicut express delivery available",
      JSON.stringify(Array.isArray(offers) ? offers : []),
      JSON.stringify(Array.isArray(includes) ? includes : []),
      badge || null,
      inferredType,
      status || "published",
      JSON.stringify(Array.isArray(tags) ? tags : []),
      seoTitle || "",
      seoDescription || "",
      JSON.stringify(typeof attributes === "object" && attributes !== null ? attributes : {}),
      now,
      now
    );

    return NextResponse.json({
      success: true,
      message: "Product created successfully",
      productId: id,
      slug: cleanSlug,
    });
  } catch (error: any) {
    console.error("Product create error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to create product" }, { status: 500 });
  }
}
