import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth/jwt";
import {
  DEFAULT_SIZES,
  DEFAULT_WRAPPING_PAPERS,
  DEFAULT_RIBBON_COLORS,
  DEFAULT_DECORATIONS,
} from "@/data/customizationConfig";

export async function GET(request: Request) {
  try {
    const db = getDb();
    const row = db.prepare("SELECT config_json FROM product_customizations WHERE id = 'global_settings'").get() as { config_json: string } | undefined;

    let config = {
      sizes: DEFAULT_SIZES,
      wrappingPapers: DEFAULT_WRAPPING_PAPERS,
      ribbonColors: DEFAULT_RIBBON_COLORS,
      decorations: DEFAULT_DECORATIONS,
      disabledProductIds: [] as string[],
    };

    if (row && row.config_json) {
      try {
        const parsed = JSON.parse(row.config_json);
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
    const db = getDb();
    const now = new Date().toISOString();

    const configJson = JSON.stringify(body);

    db.prepare(`
      INSERT INTO product_customizations (id, enabled, config_json, updated_at)
      VALUES ('global_settings', 1, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        config_json = excluded.config_json,
        updated_at = excluded.updated_at
    `).run(configJson, now);

    return NextResponse.json({ success: true, message: "Customization settings saved successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save customization settings" },
      { status: 500 }
    );
  }
}
