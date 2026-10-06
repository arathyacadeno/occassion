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
        id, full_name, phone, house, street, area, city, state, pin_code,
        latitude, longitude, type, is_default, created_at, updated_at
      FROM addresses
      WHERE user_id = ?
      ORDER BY is_default DESC, created_at DESC
    `).all(auth.userId);

    const addresses = rows.map((r: any) => ({
      id: r.id,
      fullName: r.full_name,
      phone: r.phone,
      house: r.house,
      street: r.street,
      area: r.area,
      city: r.city,
      state: r.state,
      pinCode: r.pin_code,
      latitude: r.latitude,
      longitude: r.longitude,
      type: r.type,
      isDefault: !!r.is_default,
      createdAt: r.created_at,
    }));

    return NextResponse.json({ success: true, addresses });
  } catch (error: any) {
    console.error("Addresses GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch addresses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = getAuthenticatedUser(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const {
      fullName,
      phone,
      house,
      street,
      area,
      city,
      state,
      pinCode,
      latitude,
      longitude,
      type = "Home",
      isDefault = false,
    } = body;

    if (!fullName || !phone || !house || !pinCode) {
      return NextResponse.json(
        { success: false, error: "Full name, phone, house/building, and PIN code are required" },
        { status: 400 }
      );
    }

    const db = getDb();
    const now = new Date().toISOString();
    const addressId = "addr-" + Math.random().toString(36).substring(2, 10);

    // If setting default or if it's the user's first address, make it default
    const existingCount = db.prepare("SELECT count(*) as count FROM addresses WHERE user_id = ?").get(auth.userId)?.count || 0;
    const shouldBeDefault = isDefault || existingCount === 0;

    if (shouldBeDefault) {
      db.prepare("UPDATE addresses SET is_default = 0 WHERE user_id = ?").run(auth.userId);
    }

    db.prepare(`
      INSERT INTO addresses (
        id, user_id, full_name, phone, house, street, area, city, state, pin_code,
        latitude, longitude, type, is_default, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      addressId,
      auth.userId,
      fullName.trim(),
      phone.trim(),
      house.trim(),
      (street || "").trim(),
      (area || "").trim(),
      (city || "Kozhikode").trim(),
      (state || "Kerala").trim(),
      pinCode.trim(),
      latitude ? Number(latitude) : null,
      longitude ? Number(longitude) : null,
      type || "Home",
      shouldBeDefault ? 1 : 0,
      now,
      now
    );

    return NextResponse.json({
      success: true,
      message: "Address saved successfully",
      addressId,
    });
  } catch (error: any) {
    console.error("Address POST error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to save address" }, { status: 500 });
  }
}
