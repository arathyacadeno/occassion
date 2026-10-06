import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, subtotal } = body;

    if (!code) {
      return NextResponse.json({ success: false, error: "Coupon code is required" }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const amount = Number(subtotal) || 0;
    const db = getDb();

    const coupon = db.prepare("SELECT * FROM coupons WHERE code = ?").get(cleanCode);

    if (!coupon) {
      return NextResponse.json({ success: false, error: "Invalid coupon code" }, { status: 404 });
    }

    if (!coupon.active) {
      return NextResponse.json({ success: false, error: "This coupon is no longer active" }, { status: 400 });
    }

    if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
      return NextResponse.json({ success: false, error: "This coupon has expired" }, { status: 400 });
    }

    if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) {
      return NextResponse.json({ success: false, error: "Coupon usage limit reached" }, { status: 400 });
    }

    if (amount < coupon.min_order_value) {
      return NextResponse.json(
        {
          success: false,
          error: `Minimum order value of ₹${coupon.min_order_value} required for this coupon. Your subtotal is ₹${amount}.`,
        },
        { status: 400 }
      );
    }

    let discount = 0;
    if (coupon.discount_type === "percentage") {
      discount = Math.round((amount * coupon.discount_value) / 100);
      if (coupon.max_discount && discount > coupon.max_discount) {
        discount = coupon.max_discount;
      }
    } else {
      // Fixed discount
      discount = coupon.discount_value;
    }

    // Ensure discount does not exceed subtotal
    discount = Math.min(discount, amount);

    return NextResponse.json({
      success: true,
      valid: true,
      code: coupon.code,
      discountType: coupon.discount_type,
      discountValue: coupon.discount_value,
      discount,
      message: `Coupon applied! You saved ₹${discount}`,
    });
  } catch (error: any) {
    console.error("Coupon validate error:", error);
    return NextResponse.json({ success: false, error: "Failed to validate coupon" }, { status: 500 });
  }
}
