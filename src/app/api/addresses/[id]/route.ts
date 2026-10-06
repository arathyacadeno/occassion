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
    const db = getDb();

    const existing = db.prepare("SELECT * FROM addresses WHERE id = ? AND user_id = ?").get(id, auth.userId);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Address not found" }, { status: 404 });
    }

    const now = new Date().toISOString();
    if (body.isDefault) {
      db.prepare("UPDATE addresses SET is_default = 0 WHERE user_id = ?").run(auth.userId);
    }

    db.prepare(`
      UPDATE addresses
      SET full_name = COALESCE(?, full_name),
          phone = COALESCE(?, phone),
          house = COALESCE(?, house),
          street = COALESCE(?, street),
          area = COALESCE(?, area),
          city = COALESCE(?, city),
          state = COALESCE(?, state),
          pin_code = COALESCE(?, pin_code),
          latitude = COALESCE(?, latitude),
          longitude = COALESCE(?, longitude),
          type = COALESCE(?, type),
          is_default = COALESCE(?, is_default),
          updated_at = ?
      WHERE id = ? AND user_id = ?
    `).run(
      body.fullName,
      body.phone,
      body.house,
      body.street,
      body.area,
      body.city,
      body.state,
      body.pinCode,
      body.latitude !== undefined ? Number(body.latitude) : null,
      body.longitude !== undefined ? Number(body.longitude) : null,
      body.type,
      body.isDefault !== undefined ? (body.isDefault ? 1 : 0) : null,
      now,
      id,
      auth.userId
    );

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
    const db = getDb();

    db.prepare("UPDATE addresses SET is_default = 0 WHERE user_id = ?").run(auth.userId);
    db.prepare("UPDATE addresses SET is_default = 1 WHERE id = ? AND user_id = ?").run(id, auth.userId);

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
    const db = getDb();

    db.prepare("DELETE FROM addresses WHERE id = ? AND user_id = ?").run(id, auth.userId);

    return NextResponse.json({ success: true, message: "Address deleted successfully" });
  } catch (error: any) {
    console.error("Address DELETE error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete address" }, { status: 500 });
  }
}
