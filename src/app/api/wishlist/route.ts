import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth/jwt";

export async function GET(request: Request) {
  try {
    const auth = getAuthenticatedUser(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    const db = getDb();
    const rows = db.prepare(`
      SELECT
        w.id as wishlist_id, w.created_at as added_at,
        p.id, p.name, p.slug, p.description, p.images, p.price,
        p.discount_price, p.stock, p.rating, p.reviews_count, p.badge
      FROM wishlist_items w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC
    `).all(auth.userId);

    const items = rows.map((r: any) => {
      let images = [];
      try {
        images = JSON.parse(r.images);
      } catch {
        images = [r.images];
      }
      return {
        id: r.id,
        wishlistId: r.wishlist_id,
        name: r.name,
        slug: r.slug,
        description: r.description,
        price: r.price,
        originalPrice: r.discount_price,
        image: images[0] || "/images/lily-6-stems.png",
        images,
        stock: r.stock,
        rating: r.rating,
        reviewsCount: r.reviews_count,
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

    const db = getDb();
    const product = db.prepare("SELECT id, name FROM products WHERE id = ? OR slug = ?").get(productId, productId);
    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    // Check if already in wishlist (toggle behavior)
    const existing = db.prepare(`
      SELECT id FROM wishlist_items
      WHERE user_id = ? AND product_id = ?
    `).get(auth.userId, product.id);

    if (existing) {
      db.prepare("DELETE FROM wishlist_items WHERE id = ?").run(existing.id);
      return NextResponse.json({
        success: true,
        action: "removed",
        inWishlist: false,
        message: `Removed ${product.name} from wishlist`,
      });
    }

    const id = "wish-" + Math.random().toString(36).substring(2, 10);
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO wishlist_items (id, user_id, product_id, created_at)
      VALUES (?, ?, ?, ?)
    `).run(id, auth.userId, product.id, now);

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
