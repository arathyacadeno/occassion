import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { getAuthenticatedUser } from "@/lib/auth/jwt";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthenticatedUser(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const quantity = Number(body.quantity);

    if (isNaN(quantity) || quantity < 0) {
      return NextResponse.json({ success: false, error: "Valid quantity is required" }, { status: 400 });
    }

    // Check item ownership and product stock in Neon
    const items = await sql`
      SELECT ci.id, ci.product_id, p.stock, p.name
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.id = ${id} AND ci.user_id = ${auth.userId}
      LIMIT 1
    `;
    const item = items[0];

    if (!item) {
      return NextResponse.json({ success: false, error: "Cart item not found" }, { status: 404 });
    }

    if (quantity === 0) {
      await sql`DELETE FROM cart_items WHERE id = ${id} AND user_id = ${auth.userId}`;
      return NextResponse.json({ success: true, message: "Item removed from cart" });
    }

    const itemStock = Number(item.stock) || 0;
    if (quantity > itemStock) {
      return NextResponse.json(
        { success: false, error: `Only ${itemStock} items available in stock for ${item.name}` },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    await sql`
      UPDATE cart_items
      SET quantity = ${quantity}, updated_at = ${now}
      WHERE id = ${id} AND user_id = ${auth.userId}
    `;

    return NextResponse.json({ success: true, message: "Cart updated successfully", quantity });
  } catch (error: any) {
    console.error("Cart item update error:", error);
    return NextResponse.json({ success: false, error: "Failed to update cart item" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthenticatedUser(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;
    await sql`DELETE FROM cart_items WHERE id = ${id} AND user_id = ${auth.userId}`;

    return NextResponse.json({ success: true, message: "Item removed from cart" });
  } catch (error: any) {
    console.error("Cart item delete error:", error);
    return NextResponse.json({ success: false, error: "Failed to remove item" }, { status: 500 });
  }
}
