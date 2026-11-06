import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
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
    console.error("GET /api/settings error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load store settings" },
      { status: 500 }
    );
  }
}
