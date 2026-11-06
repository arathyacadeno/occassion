import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
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

    // Delete by wishlist ID or product ID in Neon
    await sql`
      DELETE FROM wishlist_items
      WHERE user_id = ${auth.userId} AND (id = ${id} OR product_id = ${id})
    `;

    return NextResponse.json({ success: true, message: "Removed from wishlist" });
  } catch (error: any) {
    console.error("Wishlist DELETE error:", error);
    return NextResponse.json({ success: false, error: "Failed to remove from wishlist" }, { status: 500 });
  }
}
