import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { getAuthenticatedUser } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

// GET /api/flowers/[id]: Fetch a single flower type
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cleanId = (id || "").trim();

    const rows = await sql`
      SELECT 
        ft.*,
        COUNT(p.id)::int as product_count
      FROM flower_types ft
      LEFT JOIN products p ON (p.flower_type_id = ft.id OR p.flower_type_id = ft.slug)
      WHERE ft.id = ${cleanId} OR ft.slug = ${cleanId}
      GROUP BY ft.id
      LIMIT 1
    `;

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Flower type not found" },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    const auth = getAuthenticatedUser(req);
    const isAdmin = auth && auth.role === "admin";
    if ((Number(rows[0].is_active) === 0 || rows[0].is_active === false) && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Flower collection is currently hidden" },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    return NextResponse.json({ success: true, flowerType: rows[0] }, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    console.error("GET /api/flowers/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch flower type" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

// PUT /api/flowers/[id]: Update an existing flower type
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthenticatedUser(req);
    const isProd = process.env.NODE_ENV === "production";
    if ((!auth || auth.role !== "admin") && isProd) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Admin access required" },
        { status: 403, headers: NO_CACHE_HEADERS }
      );
    }

    const { id } = await params;
    const cleanId = (id || "").trim();

    const existingRows = await sql`
      SELECT * FROM flower_types WHERE id = ${cleanId} OR slug = ${cleanId} LIMIT 1
    `;

    if (!existingRows || existingRows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Flower type not found" },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    const current = existingRows[0];
    const body = await req.json();
    const {
      name,
      slug,
      image,
      description,
      is_active,
      display_order,
    } = body;

    const newName = name !== undefined ? String(name).trim() : current.name;
    const rawSlug = slug !== undefined ? String(slug).trim() : current.slug;
    const newSlug = rawSlug
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || current.slug;

    // Check slug collision with other records
    if (newSlug !== current.slug) {
      const collision = await sql`
        SELECT id FROM flower_types 
        WHERE (slug = ${newSlug} OR id = ${"ft-" + newSlug}) AND id != ${current.id} 
        LIMIT 1
      `;
      if (collision && collision.length > 0) {
        return NextResponse.json(
          { success: false, error: `Slug '${newSlug}' is already in use by another flower type.` },
          { status: 400, headers: NO_CACHE_HEADERS }
        );
      }
    }

    const newImage = image !== undefined ? image : current.image;
    const newDescription = description !== undefined ? description : current.description;
    const newActive = is_active !== undefined
      ? (Number(is_active) === 1 || is_active === true || is_active === "1" ? 1 : 0)
      : current.is_active;
    const newOrder = display_order !== undefined ? Number(display_order) : current.display_order;

    await sql`
      UPDATE flower_types
      SET 
        name = ${newName},
        slug = ${newSlug},
        image = ${newImage},
        description = ${newDescription},
        is_active = ${newActive},
        display_order = ${newOrder},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${current.id}
    `;

    // If slug changed, cascade update to products.flower_type_id if it referenced old slug/id
    if (newSlug !== current.slug) {
      await sql`
        UPDATE products
        SET flower_type_id = ${current.id}
        WHERE flower_type_id = ${current.slug}
      `;
    }

    const updatedRows = await sql`SELECT * FROM flower_types WHERE id = ${current.id}`;

    return NextResponse.json(
      {
        success: true,
        flowerType: updatedRows[0],
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: any) {
    console.error("PUT /api/flowers/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update flower type" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

// DELETE /api/flowers/[id]: Delete flower type with product relationship validation
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthenticatedUser(req);
    const isProd = process.env.NODE_ENV === "production";
    if ((!auth || auth.role !== "admin") && isProd) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Admin access required" },
        { status: 403, headers: NO_CACHE_HEADERS }
      );
    }

    const { id } = await params;
    const cleanId = (id || "").trim();

    const existingRows = await sql`
      SELECT * FROM flower_types WHERE id = ${cleanId} OR slug = ${cleanId} LIMIT 1
    `;

    if (!existingRows || existingRows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Flower type not found" },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    const current = existingRows[0];
    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force") === "true";

    // Product Relationship Validation:
    // Check if any products are assigned to this flower type
    const productCheck = await sql`
      SELECT id, name FROM products 
      WHERE flower_type_id = ${current.id} OR flower_type_id = ${current.slug}
      LIMIT 10
    `;

    const linkedCount = productCheck.length;
    if (linkedCount > 0 && !force) {
      const sampleNames = productCheck.slice(0, 3).map((p: any) => `"${p.name}"`).join(", ");
      const extraText = linkedCount > 3 ? ` and ${linkedCount - 3} more` : "";
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete "${current.name}": It is currently assigned to ${linkedCount} product(s) (${sampleNames}${extraText}). Please reassign or remove these products before deleting this flower type.`,
          code: "PRODUCTS_LINKED",
          linkedCount,
        },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    // If forced deletion, unlink products first
    if (linkedCount > 0 && force) {
      await sql`
        UPDATE products 
        SET flower_type_id = NULL 
        WHERE flower_type_id = ${current.id} OR flower_type_id = ${current.slug}
      `;
    }

    await sql`DELETE FROM flower_types WHERE id = ${current.id}`;

    return NextResponse.json(
      {
        success: true,
        message: `Flower type "${current.name}" deleted successfully.`,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: any) {
    console.error("DELETE /api/flowers/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete flower type" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
