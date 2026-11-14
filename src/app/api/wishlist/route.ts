import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { getAuthenticatedUser } from "@/lib/auth/jwt";

export async function GET(request: Request) {
  try {
    const auth = getAuthenticatedUser(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    const rows = await sql`
      SELECT
        w.id as wishlist_id, w.created_at as added_at,
        p.id, p.name, p.slug, p.description, p.images, p.price,
        p.discount_price, p.stock, p.rating, p.reviews_count, p.badge
      FROM wishlist_items w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = ${auth.userId}
      ORDER BY w.created_at DESC
    `;

    const items = rows.map((r: any) => {
      let images = [];
      try {
        images = typeof r.images === "string" ? JSON.parse(r.images) : r.images;
      } catch {
        images = [r.images];
      }
      return {
        id: r.id,
        wishlistId: r.wishlist_id,
        name: r.name,
        slug: r.slug,
        description: r.description,
        price: Number(r.price) || 0,
        originalPrice: r.discount_price ? Number(r.discount_price) : null,
        image: images[0] || "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647384/occasions/products/flower-bouquet/flower-bouquet-white-casablanca-lilies.jpg",
        images,
        stock: Number(r.stock) || 0,
        rating: Number(r.rating) || 5.0,
        reviewsCount: Number(r.reviews_count) || 1,
        badge: r.badge,
        addedAt: r.added_at,
      };
    });

    return NextResponse.json({
      success: true,
      items,
      count: items.length,
    });
  } catch (error: any) {
    console.error("Wishlist GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch wishlist" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = getAuthenticatedUser(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 });
    }

    const products = await sql`
      SELECT id, name FROM products WHERE id = ${productId} OR slug = ${productId} LIMIT 1
    `;
    const product = products[0];

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    // Check if already in wishlist (toggle behavior)
    const existingRows = await sql`
      SELECT id FROM wishlist_items
      WHERE user_id = ${auth.userId} AND product_id = ${product.id}
      LIMIT 1
    `;
    const existing = existingRows[0];

    if (existing) {
      await sql`DELETE FROM wishlist_items WHERE id = ${existing.id}`;
      return NextResponse.json({
        success: true,
        action: "removed",
        inWishlist: false,
        message: `Removed ${product.name} from wishlist`,
      });
    }

    const id = "wish-" + Math.random().toString(36).substring(2, 10);
    const now = new Date().toISOString();
    await sql`
      INSERT INTO wishlist_items (id, user_id, product_id, created_at)
      VALUES (${id}, ${auth.userId}, ${product.id}, ${now})
    `;

    return NextResponse.json({
      success: true,
      action: "added",
      inWishlist: true,
      message: `Added ${product.name} to wishlist`,
      wishlistId: id,
    });
  } catch (error: any) {
    console.error("Wishlist POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to update wishlist" }, { status: 500 });
  }
}
