import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, subtotal } = body;

    if (!code) {
      return NextResponse.json({ success: false, error: "Coupon code is required" }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const amount = Number(subtotal) || 0;

    const rows = await sql`SELECT * FROM coupons WHERE UPPER(code) = ${cleanCode} LIMIT 1`;
    const coupon = rows[0];

    if (!coupon) {
      return NextResponse.json({ success: false, error: "Invalid coupon code" }, { status: 404 });
    }

    if (!coupon.active) {
      return NextResponse.json({ success: false, error: "This coupon is no longer active" }, { status: 400 });
    }

    if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
      return NextResponse.json({ success: false, error: "This coupon has expired" }, { status: 400 });
    }

    const usageLimit = Number(coupon.usage_limit) || 1000;
    const timesUsed = Number(coupon.times_used) || 0;
    if (coupon.usage_limit && timesUsed >= usageLimit) {
      return NextResponse.json({ success: false, error: "Coupon usage limit reached" }, { status: 400 });
    }

    const minOrderVal = Number(coupon.min_order_value) || 0;
    if (amount < minOrderVal) {
      return NextResponse.json(
        {
          success: false,
          error: `Minimum order value of ₹${minOrderVal} required for this coupon. Your subtotal is ₹${amount}.`,
        },
        { status: 400 }
      );
    }

    let discount = 0;
    const discVal = Number(coupon.discount_value) || 0;
    const maxDisc = coupon.max_discount ? Number(coupon.max_discount) : null;

    if (coupon.discount_type === "percentage") {
      discount = Math.round((amount * discVal) / 100);
      if (maxDisc && discount > maxDisc) {
        discount = maxDisc;
      }
    } else {
      // Fixed discount
      discount = discVal;
    }

    // Ensure discount does not exceed subtotal
    discount = Math.min(discount, amount);

    return NextResponse.json({
      success: true,
      valid: true,
      code: coupon.code,
      discountType: coupon.discount_type,
      discountValue: discVal,
      discount,
      message: `Coupon applied! You saved ₹${discount}`,
    });
  } catch (error: any) {
    console.error("Coupon validate error:", error);
    return NextResponse.json({ success: false, error: "Failed to validate coupon" }, { status: 500 });
  }
}
