import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth/jwt";

export async function GET(request: Request) {
  try {
    const auth = getAuthenticatedUser(request);
    const db = getDb();

    if (auth && auth.role === "admin") {
      const coupons = db.prepare("SELECT * FROM coupons ORDER BY active DESC, code ASC").all();
      return NextResponse.json({ success: true, coupons });
    }

    // Public active coupons
    const coupons = db.prepare(`
      SELECT code, discount_type, discount_value, min_order_value, max_discount
      FROM coupons
      WHERE active = 1
      ORDER BY min_order_value ASC
    `).all();

    return NextResponse.json({ success: true, coupons });
  } catch (error: any) {
    console.error("Coupons GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch coupons" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = getAuthenticatedUser(request);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { code, discountType, discountValue, minOrderValue, maxDiscount, expiryDate, usageLimit } = body;

    if (!code || !discountType || discountValue === undefined) {
      return NextResponse.json({ success: false, error: "Code, discount type, and discount value are required" }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const id = "cpn-" + cleanCode.toLowerCase();
    const db = getDb();

    db.prepare(`
      INSERT OR REPLACE INTO coupons (
        id, code, discount_type, discount_value, min_order_value, max_discount, expiry_date, usage_limit, active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run(
      id,
      cleanCode,
      discountType,
      Number(discountValue),
      minOrderValue ? Number(minOrderValue) : 0,
      maxDiscount ? Number(maxDiscount) : null,
      expiryDate || null,
      usageLimit ? Number(usageLimit) : 1000
    );

    return NextResponse.json({ success: true, message: `Coupon ${cleanCode} created successfully` });
  } catch (error: any) {
    console.error("Coupon POST error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to create coupon" }, { status: 500 });
  }
}
