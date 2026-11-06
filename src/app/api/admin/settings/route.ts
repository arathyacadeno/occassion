import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { getAuthenticatedUser } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

// GET /api/admin/settings
export async function GET(req: NextRequest) {
  try {
    const auth = getAuthenticatedUser(req);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const rows = await sql`SELECT key, value FROM store_settings`;
    const settingsRows = (rows || []) as { key: string; value: string }[];

    const settings: Record<string, string> = {
      store_name: "Occassions",
      store_tagline: "Luxury Florist & Celebration Atelier",
      store_logo: "/images/occasions-logo.png",
      header_logo: "/images/occasions-logo.png",
      footer_logo: "/images/occasions-logo.png",
      store_favicon: "/favicon.ico",
      brand_description: "Bespoke floral arrangements, fresh bouquets, luxury cakes, and festive decor crafted in Calicut with love and precision.",
      primary_color: "#be185d",
      secondary_color: "#831843",
      store_phone: "+91 8606464700",
      store_whatsapp: "918606464700",
      store_email: "occassions.flowers@gmail.com",
      store_address: "Mavoor Road, Kozhikode (Calicut), Kerala 673004",
      opening_hours: "9:00 AM - 9:00 PM Daily",
      currency_symbol: "₹",
    };

    for (const row of settingsRows) {
      settings[row.key] = row.value;
    }

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (err: any) {
    console.error("GET /api/admin/settings error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/settings
export async function PUT(req: NextRequest) {
  try {
    const auth = getAuthenticatedUser(req);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { settings } = body;

    if (!settings || typeof settings !== "object") {
      return NextResponse.json(
        { success: false, error: "Settings object is required" },
        { status: 400 }
      );
    }

    // Write to Neon PostgreSQL as single source of truth
    for (const [key, value] of Object.entries(settings)) {
      if (typeof value === "string") {
        await sql`
          INSERT INTO store_settings (key, value)
          VALUES (${key}, ${value})
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
        `;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      settings,
    });
  } catch (err: any) {
    console.error("PUT /api/admin/settings error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}
