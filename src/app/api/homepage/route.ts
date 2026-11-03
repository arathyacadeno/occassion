import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sql } from "@/lib/db/neon";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let banners: any[] = [];
    let sections: any[] = [];

    // Try Neon first if configured
    if (process.env.DATABASE_URL) {
      try {
        banners = await sql`
          SELECT * FROM homepage_banners 
          WHERE active = 1 
          ORDER BY display_order ASC, created_at DESC;
        `;
        sections = await sql`
          SELECT * FROM homepage_sections 
          WHERE active = 1 
          ORDER BY display_order ASC;
        `;
      } catch (err) {
        console.warn("Neon homepage fetch fallback to SQLite:", err);
      }
    }

    // Fallback to SQLite
    if (!banners || banners.length === 0) {
      try {
        const db = getDb();
        banners = db.prepare(`
          SELECT * FROM homepage_banners 
          WHERE active = 1 
          ORDER BY display_order ASC, created_at DESC
        `).all();
        sections = db.prepare(`
          SELECT * FROM homepage_sections 
          WHERE active = 1 
          ORDER BY display_order ASC
        `).all();
      } catch (err) {
        console.warn("SQLite homepage fetch error:", err);
      }
    }

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

