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
        ci.id, ci.product_id, ci.quantity, ci.variant_id, ci.created_at,
        p.name, p.slug, p.price, p.discount_price, p.stock, p.active, p.images
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ${auth.userId}
      ORDER BY ci.created_at DESC
    `;

    let subtotal = 0;
    const items = rows.map((r: any) => {
      let images = [];
      try {
        images = typeof r.images === "string" ? JSON.parse(r.images) : r.images;
      } catch {
        images = [r.images];
      }

      const numPrice = Number(r.price) || 0;
      const numQty = Number(r.quantity) || 1;
      const itemTotal = numPrice * numQty;
      subtotal += itemTotal;

      return {
        id: r.id,
        productId: r.product_id,
        name: r.name,
        slug: r.slug,
        price: numPrice,
        originalPrice: r.discount_price ? Number(r.discount_price) : null,
        image: images[0] || "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647384/occasions/products/flower-bouquet/flower-bouquet-white-casablanca-lilies.jpg",
        quantity: numQty,
        stock: Number(r.stock) || 0,
        inStock: (Number(r.stock) || 0) >= numQty && Number(r.active) === 1,
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

    // 1. Backend validation: Product exists, active, stock
    const products = await sql`SELECT * FROM products WHERE id = ${productId} OR slug = ${productId} LIMIT 1`;
    const product = products[0];

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }
    if (!product.active) {
      return NextResponse.json({ success: false, error: "This product is currently unavailable" }, { status: 400 });
    }
    const currentStock = Number(product.stock) || 0;
    if (currentStock <= 0) {
      return NextResponse.json({ success: false, error: "Sorry, this product is currently out of stock" }, { status: 400 });
    }

    // 2. Check existing cart item
    const existingRows = await sql`
      SELECT id, quantity FROM cart_items
      WHERE user_id = ${auth.userId} AND product_id = ${product.id}
      LIMIT 1
    `;
    const existing = existingRows[0];

    const now = new Date().toISOString();
    let newQty = qtyToAdd;

    if (existing) {
      newQty = Number(existing.quantity) + qtyToAdd;
      if (newQty > currentStock) {
        return NextResponse.json(
          {
            success: false,
            error: `Only ${currentStock} items available in stock. You already have ${existing.quantity} in your cart.`,
          },
          { status: 400 }
        );
      }

      await sql`
        UPDATE cart_items
        SET quantity = ${newQty}, updated_at = ${now}
        WHERE id = ${existing.id}
      `;
    } else {
      if (newQty > currentStock) {
        return NextResponse.json(
          { success: false, error: `Only ${currentStock} items available in stock` },
          { status: 400 }
        );
      }

      const cartItemId = "cart-" + Math.random().toString(36).substring(2, 10);
      await sql`
        INSERT INTO cart_items (id, user_id, product_id, quantity, variant_id, created_at, updated_at)
        VALUES (${cartItemId}, ${auth.userId}, ${product.id}, ${newQty}, ${variantId}, ${now}, ${now})
      `;
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

    await sql`DELETE FROM cart_items WHERE user_id = ${auth.userId}`;

    return NextResponse.json({ success: true, message: "Cart cleared successfully" });
  } catch (error: any) {
    console.error("Cart clear error:", error);
    return NextResponse.json({ success: false, error: "Failed to clear cart" }, { status: 500 });
  }
}
