import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const banners = await sql`
      SELECT * FROM homepage_banners 
      WHERE active = 1 
      ORDER BY display_order ASC, created_at DESC
    `;
    const sections = await sql`
      SELECT * FROM homepage_sections 
      WHERE active = 1 
      ORDER BY display_order ASC
    `;

    return NextResponse.json({
      success: true,
      banners: banners || [],
      sections: sections || [],
    });
  } catch (err: any) {
    console.error("GET /api/homepage error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch homepage content" },
      { status: 500 }
    );
  }
}
