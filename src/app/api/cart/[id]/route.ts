import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
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

    const db = getDb();

    // Check item ownership and product stock
    const item = db.prepare(`
      SELECT ci.id, ci.product_id, p.stock, p.name
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.id = ? AND ci.user_id = ?
    `).get(id, auth.userId);

    if (!item) {
      return NextResponse.json({ success: false, error: "Cart item not found" }, { status: 404 });
    }

    if (quantity === 0) {
      db.prepare("DELETE FROM cart_items WHERE id = ?").run(id);
      return NextResponse.json({ success: true, message: "Item removed from cart" });
    }

    if (quantity > item.stock) {
      return NextResponse.json(
        { success: false, error: `Only ${item.stock} items available in stock for ${item.name}` },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE cart_items
      SET quantity = ?, updated_at = ?
      WHERE id = ?
    `).run(quantity, now, id);

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
    const db = getDb();

    db.prepare("DELETE FROM cart_items WHERE id = ? AND user_id = ?").run(id, auth.userId);

    return NextResponse.json({ success: true, message: "Item removed from cart" });
  } catch (error: any) {
    console.error("Cart item delete error:", error);
    return NextResponse.json({ success: false, error: "Failed to remove item" }, { status: 500 });
  }
}
