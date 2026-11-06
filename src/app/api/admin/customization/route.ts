import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { getAuthenticatedUser } from "@/lib/auth/jwt";
import {
  DEFAULT_SIZES,
  DEFAULT_WRAPPING_PAPERS,
  DEFAULT_RIBBON_COLORS,
  DEFAULT_DECORATIONS,
} from "@/data/customizationConfig";

export async function GET(request: Request) {
  try {
    const rows = await sql`SELECT config_json FROM product_customizations WHERE id = 'global_settings' LIMIT 1`;
    const row = rows[0];

    let config = {
      sizes: DEFAULT_SIZES,
      wrappingPapers: DEFAULT_WRAPPING_PAPERS,
      ribbonColors: DEFAULT_RIBBON_COLORS,
      decorations: DEFAULT_DECORATIONS,
      disabledProductIds: [] as string[],
    };

    if (row && row.config_json) {
      try {
        const parsed = typeof row.config_json === "string" ? JSON.parse(row.config_json) : row.config_json;
        config = { ...config, ...parsed };
      } catch (e) {
        console.error("Failed to parse customization config JSON", e);
      }
    }

    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load customization settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized access: Administrator credentials required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const now = new Date().toISOString();
    const configJson = JSON.stringify(body);

    await sql`
      INSERT INTO product_customizations (id, enabled, config_json, updated_at)
      VALUES ('global_settings', 1, ${configJson}, ${now})
      ON CONFLICT(id) DO UPDATE SET
        config_json = EXCLUDED.config_json,
        updated_at = EXCLUDED.updated_at
    `;

    return NextResponse.json({ success: true, message: "Customization settings saved successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save customization settings" },
      { status: 500 }
    );
  }
}
