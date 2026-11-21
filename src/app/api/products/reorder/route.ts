import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { getAuthenticatedUser } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

export async function PUT(request: Request) {
  return handleReorder(request);
}

export async function POST(request: Request) {
  return handleReorder(request);
}

async function handleReorder(request: Request) {
  try {
    const auth = getAuthenticatedUser(request);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const orders = body.orders || body.products || body.productOrders;

    if (!Array.isArray(orders) || orders.length === 0) {
      return NextResponse.json({ success: false, error: "Missing or invalid orders array" }, { status: 400 });
    }

    const now = new Date().toISOString();

    for (const item of orders) {
      if (!item) continue;
      const targetId = item.id || item.productId || item.slug;
      const orderNum = item.display_order ?? item.displayOrder ?? item.order;
      if (targetId && orderNum !== undefined && !isNaN(Number(orderNum))) {
        await sql`
          UPDATE products
          SET display_order = ${Number(orderNum)}, updated_at = ${now}
          WHERE id = ${String(targetId)} OR slug = ${String(targetId)}
        `;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated display order for ${orders.length} products successfully`,
    });
  } catch (error: any) {
    console.error("Product reorder API error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update product order" }, { status: 500 });
  }
}
