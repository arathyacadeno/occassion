import { NextResponse } from "next/server";
import crypto from "crypto";
import { sql } from "@/lib/db/neon";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ success: false, error: "Missing x-razorpay-signature header" }, { status: 400 });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
    if (!webhookSecret) {
      console.error("[Razorpay Webhook] Neither RAZORPAY_WEBHOOK_SECRET nor RAZORPAY_KEY_SECRET is configured.");
      return NextResponse.json({ success: false, error: "Webhook secret not configured" }, { status: 500 });
    }

    // Verify HMAC-SHA256 signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    let isMatch = false;
    try {
      isMatch =
        expectedSignature.length === signature.length &&
        crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature));
    } catch {
      isMatch = expectedSignature === signature;
    }

    if (!isMatch) {
      console.warn("[Razorpay Webhook] Signature verification failed.");
      return NextResponse.json({ success: false, error: "Invalid webhook signature" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    console.log(`[Razorpay Webhook] Received verified event: ${event}`);

    // Extract order id
    const paymentEntity = payload?.payload?.payment?.entity;
    const orderEntity = payload?.payload?.order?.entity;

    const appOrderId =
      paymentEntity?.notes?.appOrderId ||
      orderEntity?.notes?.appOrderId ||
      (paymentEntity?.receipt?.startsWith("rcpt_") ? paymentEntity.receipt.replace("rcpt_", "") : null) ||
      (orderEntity?.receipt?.startsWith("rcpt_") ? orderEntity.receipt.replace("rcpt_", "") : null);

    const paymentId = paymentEntity?.id;

    if (appOrderId) {
      const cleanId = String(appOrderId).trim().replace(/^#+/, "");

      if (event === "payment.captured" || event === "order.paid") {
        // Mark payment as paid and confirmed
        await sql`
          UPDATE orders
          SET payment_status = 'paid',
              order_status = 'confirmed',
              notes = CASE 
                WHEN notes IS NULL OR notes = '' THEN ${paymentId ? 'Razorpay Webhook: ' + paymentId : 'Razorpay Webhook'}
                WHEN notes LIKE ${paymentId ? '%' + paymentId + '%' : '%Razorpay%'} THEN notes
                ELSE notes || ' | ' || ${paymentId ? 'Razorpay Webhook: ' + paymentId : 'Razorpay Webhook'}
              END,
              updated_at = NOW()
          WHERE id = ${cleanId} OR id = ${"#" + cleanId}
        `;
        console.log(`[Razorpay Webhook] Order #${cleanId} marked as 'paid' via webhook.`);
      } else if (event === "payment.failed") {
        const errorDesc = paymentEntity?.error_description || "Transaction failed";
        await sql`
          UPDATE orders
          SET payment_status = 'failed',
              notes = CASE 
                WHEN notes IS NULL OR notes = '' THEN ${'Payment failed: ' + errorDesc}
                ELSE notes || ' | Payment failed: ' || ${errorDesc}
              END,
              updated_at = NOW()
          WHERE (id = ${cleanId} OR id = ${"#" + cleanId})
            AND payment_status != 'paid'
        `;
        console.log(`[Razorpay Webhook] Order #${cleanId} marked as 'failed' via webhook.`);
      } else if (event === "refund.processed" || event === "refund.created" || event === "payment.refunded") {
        await sql`
          UPDATE orders
          SET payment_status = 'refunded',
              updated_at = NOW()
          WHERE id = ${cleanId} OR id = ${"#" + cleanId}
        `;
        console.log(`[Razorpay Webhook] Order #${cleanId} marked as 'refunded' via webhook.`);
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error: any) {
    console.error("[Razorpay Webhook] Error processing event:", error);
    return NextResponse.json({ success: false, error: error?.message || "Webhook handling error" }, { status: 500 });
  }
}
