import { NextRequest, NextResponse } from "next/server";
import {
  sendCustomerOrderNotification,
  fetchOrderForNotification,
  CustomerOrderNotificationPayload,
  maskPhoneInLog,
} from "@/lib/whatsapp/service";

export const dynamic = "force-dynamic";

/**
 * POST /api/whatsapp/order-confirmation
 * Sends automated WhatsApp order confirmation notification to the customer.
 * 
 * Supports:
 * 1. Automatic DB lookup: { "orderId": "2026112501" }
 * 2. Explicit payload: { "orderId": "...", "customerName": "...", "customerPhone": "...", ... }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    let payload: CustomerOrderNotificationPayload;

    // Mode A: Order ID provided -> Fetch directly from Neon PostgreSQL
    if (body.orderId && (!body.customerPhone || !body.items)) {
      const fetched = await fetchOrderForNotification(body.orderId);
      if (!fetched) {
        return NextResponse.json(
          {
            success: false,
            error: `Order #${body.orderId} not found in database.`,
          },
          { status: 404 }
        );
      }
      payload = fetched.customerPayload;
    } else {
      // Mode B: Explicit payload provided
      const {
        orderId,
        customerName,
        customerPhone,
        items,
        finalAmount,
        orderStatus,
        paymentStatus,
        deliveryDate,
        deliveryTime,
        deliveryAddress,
      } = body;

      if (!orderId) {
        return NextResponse.json(
          { success: false, error: "'orderId' is required." },
          { status: 400 }
        );
      }

      if (!customerPhone || String(customerPhone).replace(/\D/g, "").length < 10) {
        return NextResponse.json(
          {
            success: false,
            error: "A valid 'customerPhone' (at least 10 digits) is required.",
          },
          { status: 400 }
        );
      }

      payload = {
        orderId: String(orderId),
        customerName: customerName ? String(customerName) : "Valued Customer",
        customerPhone: String(customerPhone),
        items: Array.isArray(items) ? items : [],
        finalAmount: Number(finalAmount) || 0,
        orderStatus: orderStatus ? String(orderStatus) : "confirmed",
        paymentStatus: paymentStatus ? String(paymentStatus) : "pending",
        deliveryDate: deliveryDate ? String(deliveryDate) : undefined,
        deliveryTime: deliveryTime ? String(deliveryTime) : undefined,
        deliveryAddress: deliveryAddress ? String(deliveryAddress) : undefined,
      };
    }

    const result = await sendCustomerOrderNotification(payload);

    if (result.alreadySent) {
      return NextResponse.json({
        success: true,
        alreadySent: true,
        orderId: payload.orderId,
        recipient: maskPhoneInLog(payload.customerPhone),
        message: "Customer has already received a notification for this order.",
        whatsappUrl: result.whatsappUrl,
      });
    }

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          orderId: payload.orderId,
          error: result.error || "Failed to dispatch customer order confirmation",
          whatsappUrl: result.whatsappUrl,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: payload.orderId,
      provider: result.provider,
      messageId: result.messageId,
      whatsappUrl: result.whatsappUrl,
      recipient: maskPhoneInLog(payload.customerPhone),
      message: "Customer order confirmation dispatched successfully via WhatsApp",
    });
  } catch (err: any) {
    console.error("[POST /api/whatsapp/order-confirmation error]:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Internal server error dispatching customer order confirmation",
      },
      { status: 500 }
    );
  }
}
