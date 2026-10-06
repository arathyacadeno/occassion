import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth/jwt";

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

    // Delete by wishlist ID or product ID
    db.prepare(`
      DELETE FROM wishlist_items
      WHERE user_id = ? AND (id = ? OR product_id = ?)
    `).run(auth.userId, id, id);

    return NextResponse.json({ success: true, message: "Removed from wishlist" });
  } catch (error: any) {
    console.error("Wishlist DELETE error:", error);
    return NextResponse.json({ success: false, error: "Failed to remove from wishlist" }, { status: 500 });
  }
}
