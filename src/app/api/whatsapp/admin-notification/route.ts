import { NextRequest, NextResponse } from "next/server";
import {
  sendWhatsAppToOwner,
  fetchOrderForNotification,
  OrderNotificationPayload,
  maskPhoneInLog,
  normalizeWhatsAppNumber,
} from "@/lib/whatsapp/service";

export const dynamic = "force-dynamic";

/**
 * POST /api/whatsapp/admin-notification
 * Notifies the website owner / admin of a new order on WhatsApp.
 * 
 * Supports:
 * 1. Automatic DB lookup: { "orderId": "2026112501" }
 * 2. Explicit payload: { "orderId": "...", "customerName": "...", "finalAmount": ..., ... }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    let payload: OrderNotificationPayload;

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
      payload = fetched.adminPayload;
    } else {
      // Mode B: Explicit payload provided
      const {
        orderId,
        customerName,
        customerPhone,
        customerEmail,
        receiverName,
        receiverPhone,
        houseBuilding,
        street,
        landmark,
        city,
        state,
        pinCode,
        deliveryDate,
        deliveryTime,
        items,
        subtotal,
        deliveryCharge,
        isCustomDelivery,
        discount,
        finalAmount,
        paymentMethod,
        paymentStatus,
        paymentId,
        notes,
      } = body;

      if (!orderId) {
        return NextResponse.json(
          { success: false, error: "'orderId' is required." },
          { status: 400 }
        );
      }

      payload = {
        orderId: String(orderId),
        customerName: customerName ? String(customerName) : "Customer",
        customerPhone: customerPhone ? String(customerPhone) : "",
        customerEmail: customerEmail ? String(customerEmail) : undefined,
        receiverName: receiverName ? String(receiverName) : undefined,
        receiverPhone: receiverPhone ? String(receiverPhone) : undefined,
        houseBuilding: houseBuilding ? String(houseBuilding) : undefined,
        street: street ? String(street) : undefined,
        landmark: landmark ? String(landmark) : undefined,
        city: city ? String(city) : "Kozhikode (Calicut)",
        state: state ? String(state) : "Kerala",
        pinCode: pinCode ? String(pinCode) : "673001",
        deliveryDate: deliveryDate ? String(deliveryDate) : undefined,
        deliveryTime: deliveryTime ? String(deliveryTime) : undefined,
        items: Array.isArray(items) ? items : [],
        subtotal: Number(subtotal) || Number(finalAmount) || 0,
        deliveryCharge: Number(deliveryCharge) || 0,
        isCustomDelivery: Boolean(isCustomDelivery),
        discount: Number(discount) || 0,
        finalAmount: Number(finalAmount) || 0,
        paymentMethod: paymentMethod ? String(paymentMethod) : "Online",
        paymentStatus: paymentStatus ? String(paymentStatus) : "pending",
        paymentId: paymentId ? String(paymentId) : undefined,
        notes: notes ? String(notes) : undefined,
      };
    }

    const result = await sendWhatsAppToOwner(payload, {
      forceRetry: Boolean(body.forceRetry),
    });

    const adminNumber =
      process.env.ADMIN_WHATSAPP_NUMBER?.trim() ||
      process.env.WHATSAPP_OWNER_PHONE?.trim() ||
      "";

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          orderId: payload.orderId,
          adminNumber: maskPhoneInLog(normalizeWhatsAppNumber(adminNumber)),
          error: result.error || "Failed to notify admin via WhatsApp",
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
      adminNumber: maskPhoneInLog(normalizeWhatsAppNumber(adminNumber)),
      whatsappUrl: result.whatsappUrl,
      message: "Admin new order notification dispatched successfully via WhatsApp",
    });
  } catch (err: any) {
    console.error("[POST /api/whatsapp/admin-notification error]:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Internal server error dispatching admin notification",
      },
      { status: 500 }
    );
  }
}
