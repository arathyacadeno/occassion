import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { getAuthenticatedUser } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

// GET /api/flowers: Fetch flower types (active only for public, all + product counts if all=true)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get("all") === "true";

    let flowers = [];
    if (includeAll) {
      // Admin view: include product count and inactive items
      flowers = await sql`
        SELECT 
          ft.id, 
          ft.name, 
          ft.slug, 
          ft.image, 
          ft.description, 
          COALESCE(ft.is_active, 1)::int as is_active, 
          COALESCE(ft.display_order, 0)::int as display_order, 
          ft.created_at, 
          ft.updated_at,
          COUNT(p.id)::int as product_count
        FROM flower_types ft
        LEFT JOIN products p ON (p.flower_type_id = ft.id OR p.flower_type_id = ft.slug)
        GROUP BY ft.id
        ORDER BY ft.display_order ASC, ft.name ASC
      `;
    } else {
      // Customer view: only active flower types
      flowers = await sql`
        SELECT 
          id, 
          name, 
          slug, 
          image, 
          description, 
          COALESCE(is_active, 1)::int as is_active, 
          COALESCE(display_order, 0)::int as display_order
        FROM flower_types
        WHERE is_active = 1 OR is_active IS NULL
        ORDER BY display_order ASC, name ASC
      `;
    }

    return NextResponse.json({ success: true, flowers: flowers || [] }, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    console.error("Flower types fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch flower types" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

// POST /api/flowers: Create a new flower type
export async function POST(request: NextRequest) {
  try {
    const auth = getAuthenticatedUser(request);
    const isProd = process.env.NODE_ENV === "production";
    if ((!auth || auth.role !== "admin") && isProd) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Admin access required" },
        { status: 403, headers: NO_CACHE_HEADERS }
      );
    }

    const body = await request.json();
    const {
      name,
      slug,
      image,
      description,
      is_active = 1,
      display_order = 0,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: "Flower type name is required" }, { status: 400, headers: NO_CACHE_HEADERS });
    }

    const cleanSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const id = "ft-" + cleanSlug;

    // Check slug uniqueness
    const existing = await sql`SELECT id FROM flower_types WHERE id = ${id} OR slug = ${cleanSlug} LIMIT 1`;
    if (existing && existing.length > 0) {
      return NextResponse.json(
        { success: false, error: `A flower type with slug '${cleanSlug}' already exists.` },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const numOrder = Number(display_order) || 0;
    const activeVal = is_active ? 1 : 0;

    await sql`
      INSERT INTO flower_types (
        id, name, slug, image, description, is_active, display_order, created_at, updated_at
      ) VALUES (
        ${id}, 
        ${name.trim()}, 
        ${cleanSlug}, 
        ${image || null}, 
        ${description ? description.trim() : null}, 
        ${activeVal}, 
        ${numOrder}, 
        CURRENT_TIMESTAMP, 
        CURRENT_TIMESTAMP
      )
    `;

    return NextResponse.json(
      {
        success: true,
        flowerType: {
          id,
          name: name.trim(),
          slug: cleanSlug,
          image: image || null,
          description: description ? description.trim() : null,
          is_active: activeVal,
          display_order: numOrder,
        },
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: any) {
    console.error("Flower type creation error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create flower type" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
