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

    const existing = await sql`
      SELECT * FROM addresses WHERE id = ${id} AND user_id = ${auth.userId} LIMIT 1
    `;
    if (!existing || existing.length === 0) {
      return NextResponse.json({ success: false, error: "Address not found" }, { status: 404 });
    }

    const now = new Date().toISOString();
    if (body.isDefault) {
      await sql`UPDATE addresses SET is_default = 0 WHERE user_id = ${auth.userId}`;
    }

    await sql`
      UPDATE addresses
      SET full_name = COALESCE(${body.fullName || null}, full_name),
          phone = COALESCE(${body.phone || null}, phone),
          house = COALESCE(${body.house || null}, house),
          street = COALESCE(${body.street || null}, street),
          area = COALESCE(${body.area || null}, area),
          city = COALESCE(${body.city || null}, city),
          state = COALESCE(${body.state || null}, state),
          pin_code = COALESCE(${body.pinCode || null}, pin_code),
          type = COALESCE(${body.type || null}, type),
          is_default = COALESCE(${body.isDefault !== undefined ? (body.isDefault ? 1 : 0) : null}, is_default),
          updated_at = ${now}
      WHERE id = ${id} AND user_id = ${auth.userId}
    `;

    return NextResponse.json({ success: true, message: "Address updated successfully" });
  } catch (error: any) {
    console.error("Address PUT error:", error);
    return NextResponse.json({ success: false, error: "Failed to update address" }, { status: 500 });
  }
}

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthenticatedUser(_request);
    if (!auth) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;

    await sql`UPDATE addresses SET is_default = 0 WHERE user_id = ${auth.userId}`;
    await sql`UPDATE addresses SET is_default = 1 WHERE id = ${id} AND user_id = ${auth.userId}`;

    return NextResponse.json({ success: true, message: "Default address updated" });
  } catch (error: any) {
    console.error("Address default set error:", error);
    return NextResponse.json({ success: false, error: "Failed to set default address" }, { status: 500 });
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
    await sql`DELETE FROM addresses WHERE id = ${id} AND user_id = ${auth.userId}`;

    return NextResponse.json({ success: true, message: "Address deleted successfully" });
  } catch (error: any) {
    console.error("Address DELETE error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete address" }, { status: 500 });
  }
}
