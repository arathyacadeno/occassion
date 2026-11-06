import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { getAuthenticatedUser } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

export interface DeliveryTier {
  id: string;
  min_km: number;
  max_km: number;
  charge: number;
  label: string;
  active: number;
  display_order: number;
}

// GET /api/admin/delivery - Retrieve all delivery tiers and delivery settings
export async function GET(req: NextRequest) {
  try {
    const auth = getAuthenticatedUser(req);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const tiers = await sql`
      SELECT * FROM delivery_tiers 
      ORDER BY display_order ASC, min_km ASC
    `;

    let settingsRows: { key: string; value: string }[] = [];
    try {
      const rows = await sql`SELECT key, value FROM delivery_settings`;
      settingsRows = rows as unknown as { key: string; value: string }[];
    } catch {
      // delivery_settings table might be empty or optional
    }

    const settings: Record<string, string> = {
      shop_location_name: "Kozhikode Head Post Office",
      shop_address: "Near CH Flyover, Kannur Road, Calicut, Kerala, 673001",
      shop_pin: "673001",
      max_serviceable_km: "50",
      allow_sunday_delivery: "false",
    };

    for (const row of settingsRows || []) {
      settings[row.key] = row.value;
    }

    return NextResponse.json({
      success: true,
      tiers: tiers || [],
      settings,
    });
  } catch (err: any) {
    console.error("GET /api/admin/delivery error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch delivery settings" },
      { status: 500 }
    );
  }
}

// POST /api/admin/delivery - Add a new delivery tier
export async function POST(req: NextRequest) {
  try {
    const auth = getAuthenticatedUser(req);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { min_km, max_km, charge, label, active = 1, display_order = 0 } = body;

    if (min_km === undefined || max_km === undefined || charge === undefined) {
      return NextResponse.json(
        { success: false, error: "min_km, max_km and charge are required fields" },
        { status: 400 }
      );
    }

    const id = `tier-${Date.now()}`;
    const minVal = Number(min_km);
    const maxVal = Number(max_km);
    const chargeVal = Number(charge);
    const orderVal = Number(display_order) || 0;
    const activeVal = active ? 1 : 0;
    const tierLabel = label || `${minVal} – ${maxVal} km`;

    await sql`
      INSERT INTO delivery_tiers (id, min_km, max_km, charge, label, active, display_order)
      VALUES (${id}, ${minVal}, ${maxVal}, ${chargeVal}, ${tierLabel}, ${activeVal}, ${orderVal})
    `;

    return NextResponse.json({
      success: true,
      message: "Delivery tier created successfully",
      tier: { id, min_km: minVal, max_km: maxVal, charge: chargeVal, label: tierLabel, active: activeVal, display_order: orderVal },
    });
  } catch (err: any) {
    console.error("POST /api/admin/delivery error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create delivery tier" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/delivery - Edit an existing tier or update general settings
export async function PUT(req: NextRequest) {
  try {
    const auth = getAuthenticatedUser(req);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { action, tier, settings } = body;

    // 1. Update delivery tier
    if (action === "update_tier" || tier) {
      const targetTier = tier;
      if (!targetTier || !targetTier.id) {
        return NextResponse.json({ success: false, error: "Tier ID is required" }, { status: 400 });
      }

      const minVal = Number(targetTier.min_km);
      const maxVal = Number(targetTier.max_km);
      const chargeVal = Number(targetTier.charge);
      const orderVal = Number(targetTier.display_order) || 0;
      const activeVal = targetTier.active ? 1 : 0;
      const tierLabel = targetTier.label || `${minVal} – ${maxVal} km`;

      await sql`
        UPDATE delivery_tiers SET
          min_km = ${minVal},
          max_km = ${maxVal},
          charge = ${chargeVal},
          label = ${tierLabel},
          active = ${activeVal},
          display_order = ${orderVal}
        WHERE id = ${targetTier.id}
      `;

      return NextResponse.json({
        success: true,
        message: "Delivery tier updated successfully",
      });
    }

    // 2. Update general settings (shop location, radius, pin)
    if (action === "update_settings" && settings) {
      for (const [key, value] of Object.entries(settings)) {
        if (typeof value === "string") {
          await sql`
            INSERT INTO delivery_settings (key, value) VALUES (${key}, ${value})
            ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
          `;
        }
      }

      return NextResponse.json({
        success: true,
        message: "Delivery settings updated successfully",
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action or payload" }, { status: 400 });
  } catch (err: any) {
    console.error("PUT /api/admin/delivery error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update delivery tier" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/delivery?id=... - Delete delivery tier
export async function DELETE(req: NextRequest) {
  try {
    const auth = getAuthenticatedUser(req);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Delivery Tier ID is required" }, { status: 400 });
    }

    await sql`DELETE FROM delivery_tiers WHERE id = ${id}`;

    return NextResponse.json({
      success: true,
      message: "Delivery tier deleted successfully",
    });
  } catch (err: any) {
    console.error("DELETE /api/admin/delivery error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete delivery tier" },
      { status: 500 }
    );
  }
}
