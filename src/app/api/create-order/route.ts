import { NextResponse } from "next/server";
import { getRazorpayClient } from "@/lib/payment/razorpay";

export async function POST(request: Request) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { success: false, error: "Razorpay credentials not configured" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { amount, currency = "INR", receipt, notes } = body;

    if (amount === undefined || amount === null || isNaN(Number(amount))) {
      return NextResponse.json(
        { success: false, error: "Valid amount is required" },
        { status: 400 }
      );
    }

    const amountInPaise = Math.round(Number(amount));

    // Validate minimum amount is at least 100 paise (₹1.00)
    if (amountInPaise < 100) {
      return NextResponse.json(
        { success: false, error: "Amount must be at least 100 paise (₹1.00)" },
        { status: 400 }
      );
    }

    const razorpay = getRazorpayClient();

    const orderOptions = {
      amount: amountInPaise,
      currency: currency.toUpperCase(),
      receipt: receipt || `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      notes: notes || {},
    };

    const order = await razorpay.orders.create(orderOptions);

    return NextResponse.json({
      success: true,
      order_id: order.id,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    });
  } catch (error: any) {
    console.error("Razorpay create-order error:", error);
    const statusCode = error?.statusCode || 500;
    return NextResponse.json(
      {
        success: false,
        error: error?.message || error?.error?.description || "Failed to create Razorpay order",
      },
      { status: statusCode }
    );
  }
}
