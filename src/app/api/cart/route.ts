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
        ci.id, ci.product_id, ci.quantity, ci.variant_id, ci.created_at,
        p.name, p.slug, p.price, p.discount_price, p.stock, p.active, p.images
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
      ORDER BY ci.created_at DESC
    `).all(auth.userId);

    let subtotal = 0;
    const items = rows.map((r: any) => {
      let images = [];
      try {
        images = JSON.parse(r.images);
      } catch {
        images = [r.images];
      }

      const itemTotal = r.price * r.quantity;
      subtotal += itemTotal;

      return {
        id: r.id,
        productId: r.product_id,
        name: r.name,
        slug: r.slug,
        price: r.price,
        originalPrice: r.discount_price,
        image: images[0] || "/images/lily-6-stems.png",
        quantity: r.quantity,
        stock: r.stock,
        inStock: r.stock >= r.quantity && r.active === 1,
        variantId: r.variant_id,
        itemTotal,
      };
    });

    return NextResponse.json({
      success: true,
      items,
      itemCount: items.reduce((sum: number, it: any) => sum + it.quantity, 0),
      subtotal,
    });
  } catch (error: any) {
    console.error("Cart GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch cart" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = getAuthenticatedUser(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const { productId, quantity = 1, variantId = null } = body;

    if (!productId) {
      return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 });
    }

    const qtyToAdd = Math.max(1, Number(quantity) || 1);
    const db = getDb();

    // 1. Backend validation: Product exists, active, stock
    const product = db.prepare("SELECT * FROM products WHERE id = ? OR slug = ?").get(productId, productId);
    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }
    if (!product.active) {
      return NextResponse.json({ success: false, error: "This product is currently unavailable" }, { status: 400 });
    }
    if (product.stock <= 0) {
      return NextResponse.json({ success: false, error: "Sorry, this product is currently out of stock" }, { status: 400 });
    }

    // 2. Check existing cart item
    const existing = db.prepare(`
      SELECT id, quantity FROM cart_items
      WHERE user_id = ? AND product_id = ?
    `).get(auth.userId, product.id);

    const now = new Date().toISOString();
    let newQty = qtyToAdd;

    if (existing) {
      newQty = existing.quantity + qtyToAdd;
      if (newQty > product.stock) {
        return NextResponse.json(
          {
            success: false,
            error: `Only ${product.stock} items available in stock. You already have ${existing.quantity} in your cart.`,
          },
          { status: 400 }
        );
      }

      db.prepare(`
        UPDATE cart_items
        SET quantity = ?, updated_at = ?
        WHERE id = ?
      `).run(newQty, now, existing.id);
    } else {
      if (newQty > product.stock) {
        return NextResponse.json(
          { success: false, error: `Only ${product.stock} items available in stock` },
          { status: 400 }
        );
      }

      const cartItemId = "cart-" + Math.random().toString(36).substring(2, 10);
      db.prepare(`
        INSERT INTO cart_items (id, user_id, product_id, quantity, variant_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(cartItemId, auth.userId, product.id, newQty, variantId, now, now);
    }

    return NextResponse.json({
      success: true,
      message: `Added ${product.name} to cart`,
      productId: product.id,
      quantity: newQty,
    });
  } catch (error: any) {
    console.error("Cart POST error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to add to cart" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = getAuthenticatedUser(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    const db = getDb();
    db.prepare("DELETE FROM cart_items WHERE user_id = ?").run(auth.userId);

    return NextResponse.json({ success: true, message: "Cart cleared successfully" });
  } catch (error: any) {
    console.error("Cart clear error:", error);
    return NextResponse.json({ success: false, error: "Failed to clear cart" }, { status: 500 });
  }
}
