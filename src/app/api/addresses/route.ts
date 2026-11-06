import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { getAuthenticatedUser } from "@/lib/auth/jwt";

export async function GET(request: Request) {
  try {
    const auth = getAuthenticatedUser(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    let addresses: any[] = [];

    // 1. Fetch from Neon Postgres
    const neonRows = await sql`
      SELECT
        id, full_name, phone, house, street, area, city, state, pin_code,
        latitude, longitude, type, is_default, created_at, updated_at
      FROM addresses
      WHERE user_id = ${auth.userId}
      ORDER BY is_default DESC, updated_at DESC
    `;
    if (neonRows && neonRows.length > 0) {
      addresses = neonRows.map((r: any) => ({
        id: r.id,
        fullName: r.full_name,
        phone: r.phone,
        house: r.house,
        street: r.street,
        area: r.area,
        city: r.city,
        state: r.state,
        pinCode: r.pin_code,
        latitude: r.latitude ? Number(r.latitude) : null,
        longitude: r.longitude ? Number(r.longitude) : null,
        type: r.type || "Home",
        isDefault: !!r.is_default,
        createdAt: r.created_at,
      }));
    }

    // 2. If user has 0 saved addresses, check past orders in Neon for previously used delivery address
    if (addresses.length === 0) {
      const oRows = await sql`
        SELECT delivery_address, customer_name, customer_phone, created_at
        FROM orders
        WHERE user_id = ${auth.userId} AND delivery_address IS NOT NULL
        ORDER BY created_at DESC LIMIT 1
      `;
      const orderWithAddr = oRows[0];

      if (orderWithAddr) {
        let parsedAddr: any = null;
        try {
          parsedAddr = typeof orderWithAddr.delivery_address === "string"
            ? JSON.parse(orderWithAddr.delivery_address)
            : orderWithAddr.delivery_address;
        } catch {}

        if (parsedAddr && (parsedAddr.houseBuilding || parsedAddr.house)) {
          const now = new Date().toISOString();
          const addrId = "addr-auto-" + Math.random().toString(36).substring(2, 9);
          const fullName = (parsedAddr.fullName || orderWithAddr.customer_name || "Customer").trim();
          const phone = (parsedAddr.mobile || parsedAddr.phone || orderWithAddr.customer_phone || "").trim();
          const house = (parsedAddr.houseBuilding || parsedAddr.house || "").trim();
          const street = (parsedAddr.street || "").trim();
          const area = (parsedAddr.landmark || parsedAddr.area || "").trim();
          const city = (parsedAddr.city || "Calicut").trim();
          const state = (parsedAddr.state || "Kerala").trim();
          const pinCode = (parsedAddr.pinCode || parsedAddr.pincode || "673004").trim();

          await sql`
            INSERT INTO addresses (
              id, user_id, full_name, phone, house, street, area, city, state, pin_code,
              type, is_default, created_at, updated_at
            ) VALUES (
              ${addrId}, ${auth.userId}, ${fullName}, ${phone}, ${house}, ${street},
              ${area}, ${city}, ${state}, ${pinCode},
              'Home', 1, ${now}, ${now}
            ) ON CONFLICT (id) DO NOTHING
          `;

          addresses = [{
            id: addrId,
            fullName,
            phone,
            house,
            street,
            area,
            city,
            state,
            pinCode,
            type: "Home",
            isDefault: true,
            createdAt: now,
          }];
        }
      }
    }

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

    const now = new Date().toISOString();
    const addressId = "addr-" + Math.random().toString(36).substring(2, 10);

    // If setting default or if it's the user's first address, make it default
    const countRes = await sql`SELECT count(*) as count FROM addresses WHERE user_id = ${auth.userId}`;
    const existingCount = Number(countRes[0]?.count) || 0;
    const shouldBeDefault = isDefault || existingCount === 0;

    if (shouldBeDefault) {
      await sql`UPDATE addresses SET is_default = 0 WHERE user_id = ${auth.userId}`;
    }

    await sql`
      INSERT INTO addresses (
        id, user_id, full_name, phone, house, street, area, city, state, pin_code,
        latitude, longitude, type, is_default, created_at, updated_at
      ) VALUES (
        ${addressId}, ${auth.userId}, ${fullName.trim()}, ${phone.trim()}, ${house.trim()},
        ${(street || "").trim()}, ${(area || "").trim()}, ${(city || "Kozhikode").trim()},
        ${(state || "Kerala").trim()}, ${pinCode.trim()},
        ${latitude ? Number(latitude) : null}, ${longitude ? Number(longitude) : null},
        ${type || "Home"}, ${shouldBeDefault ? 1 : 0}, ${now}, ${now}
      )
    `;

    return NextResponse.json({
      success: true,
      message: "Address saved successfully",
      addressId,
      address: {
        id: addressId,
        fullName: fullName.trim(),
        phone: phone.trim(),
        house: house.trim(),
        street: (street || "").trim(),
        area: (area || "").trim(),
        city: (city || "Kozhikode").trim(),
        state: (state || "Kerala").trim(),
        pinCode: pinCode.trim(),
        type: type || "Home",
        isDefault: shouldBeDefault,
      },
    });
  } catch (error: any) {
    console.error("Address POST error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to save address" }, { status: 500 });
  }
}
