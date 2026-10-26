import { NextResponse } from "next/server";
import { verifyPaymentSignature } from "@/lib/payment/razorpay";
import { getDb } from "@/lib/db";
import { sql } from "@/lib/db/neon";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const order_id = body.razorpay_order_id || body.order_id;
    const payment_id = body.razorpay_payment_id || body.payment_id;
    const signature = body.razorpay_signature || body.signature;
    const app_order_id = body.app_order_id || body.orderId;

    // Missing fields check
    if (!order_id || !payment_id || !signature) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required payment verification fields (order_id, payment_id, signature)",
        },
        { status: 400 }
      );
    }

    // Verify HMAC-SHA256 signature
    const isValid = verifyPaymentSignature({
      order_id,
      payment_id,
      signature,
    });

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Signature verification failed. Invalid or tampered payment signature.",
        },
        { status: 400 }
      );
    }

    // If an application order ID is provided, mark payment status as 'paid' in DB
    if (app_order_id) {
      const cleanOrderId = String(app_order_id).trim().replace(/^#+/, "");

      // 1. Update Neon PostgreSQL if connected
      if (process.env.DATABASE_URL) {
        try {
          await sql`
            UPDATE orders
            SET payment_status = 'paid',
                notes = COALESCE(notes, '') || ' | Razorpay: ' || ${payment_id}
            WHERE id = ${cleanOrderId} OR id = ${"#" + cleanOrderId}
          `;
        } catch (neonErr) {
          console.warn("Neon order status update warning:", neonErr);
        }
      }

      // 2. Update SQLite
      try {
        const db = getDb();
        db.prepare(
          "UPDATE orders SET payment_status = 'paid' WHERE id = ? OR id = ?"
        ).run(cleanOrderId, `#${cleanOrderId}`);
      } catch (sqliteErr) {
        console.warn("SQLite order status update warning:", sqliteErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      order_id,
      payment_id,
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal server error during verification",
      },
      { status: 500 }
    );
  }
}
