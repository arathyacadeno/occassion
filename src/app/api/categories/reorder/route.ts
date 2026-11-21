import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { getAuthenticatedUser } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

async function handleReorder(request: Request) {
  try {
    const auth = getAuthenticatedUser(request);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const orders: { id: string; display_order: number }[] = [];

    if (Array.isArray(body.orders)) {
      for (const item of body.orders) {
        if (item && item.id && typeof item.display_order === "number") {
          orders.push({ id: String(item.id).trim(), display_order: item.display_order });
        }
      }
    } else if (Array.isArray(body.categoryIds)) {
      body.categoryIds.forEach((id: string, idx: number) => {
        if (id) orders.push({ id: String(id).trim(), display_order: idx + 1 });
      });
    }

    if (orders.length === 0) {
      return NextResponse.json({ success: false, error: "No category display orders provided" }, { status: 400 });
    }

    // Persist new display order to Neon PostgreSQL
    for (const item of orders) {
      await sql`
        UPDATE categories
        SET display_order = ${item.display_order}
        WHERE id = ${item.id} OR slug = ${item.id}
      `;
    }

    return NextResponse.json({
      success: true,
      message: "Category display order updated successfully",
      orders,
    });
  } catch (error: any) {
    console.error("Category reorder update error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update category display order" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  return handleReorder(request);
}

export async function POST(request: Request) {
  return handleReorder(request);
}
