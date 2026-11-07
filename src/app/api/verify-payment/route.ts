import { NextResponse } from "next/server";
import { verifyPaymentSignature } from "@/lib/payment/razorpay";
import { sql } from "@/lib/db/neon";
import { sendWhatsAppToOwner, sendCustomerOrderNotification } from "@/lib/whatsapp/service";
import { isSpecificOrCustomSlot } from "@/lib/delivery/schedule";

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

    let whatsappResult: any = null;

    // If an application order ID is provided, mark payment status as 'paid' in Neon PostgreSQL
    if (app_order_id) {
      const cleanOrderId = String(app_order_id).trim().replace(/^#+/, "");

      // Idempotency check: if order is already marked paid with this payment_id, return success immediately
      const existingRows = await sql`
        SELECT * FROM orders 
        WHERE id = ${cleanOrderId} OR id = ${"#" + cleanOrderId} 
        LIMIT 1
      `;
      const existingOrder = existingRows[0];

      if (existingOrder && existingOrder.payment_status === "paid" && existingOrder.notes?.includes(payment_id)) {
        return NextResponse.json({
          success: true,
          message: "Payment already verified",
          order_id,
          payment_id,
          orderId: cleanOrderId,
          alreadyProcessed: true,
        });
      }

      await sql`
        UPDATE orders
        SET payment_status = 'paid',
            notes = CASE 
              WHEN notes IS NULL OR notes = '' THEN ${'Razorpay: ' + payment_id}
              WHEN notes LIKE ${'%' + payment_id + '%'} THEN notes
              ELSE notes || ' | Razorpay: ' || ${payment_id}
            END
        WHERE id = ${cleanOrderId} OR id = ${"#" + cleanOrderId}
      `;

      // Query order data from Neon to send full WhatsApp confirmation to owner 9447446008
      let order: any = null;
      let orderItems: any[] = [];
      const neonRes = await sql`SELECT * FROM orders WHERE id = ${cleanOrderId} OR id = ${"#" + cleanOrderId} LIMIT 1`;
      if (neonRes && neonRes.length > 0) {
        order = neonRes[0];
        orderItems = await sql`SELECT * FROM order_items WHERE order_id = ${order.id}`;
      }

      if (order) {
        let deliveryAddr: any = {};
        try {
          deliveryAddr = typeof order.delivery_address === "string" ? JSON.parse(order.delivery_address) : (order.delivery_address || {});
        } catch {}

        let paymentMethod: any = {};
        try {
          paymentMethod = typeof order.payment_method === "string" ? JSON.parse(order.payment_method) : (order.payment_method || {});
        } catch {}

        try {
          whatsappResult = await sendWhatsAppToOwner({
            orderId: cleanOrderId,
            customerName: order.customer_name || "Customer",
            customerPhone: order.customer_phone || "",
            customerEmail: order.customer_email || "",
            receiverName: deliveryAddr.receiverName || deliveryAddr.fullName || order.customer_name,
            receiverPhone: deliveryAddr.receiverMobile || deliveryAddr.phone || order.customer_phone,
            houseBuilding: deliveryAddr.houseBuilding || deliveryAddr.house || "",
            street: deliveryAddr.street || "",
            landmark: deliveryAddr.landmark || deliveryAddr.area || "",
            city: deliveryAddr.city || "Kozhikode (Calicut)",
            state: deliveryAddr.state || "Kerala",
            pinCode: deliveryAddr.pinCode || deliveryAddr.pin_code || "",
            deliveryDate: deliveryAddr.deliveryDate || "",
            deliveryTime: deliveryAddr.deliveryTime || "",
            items: (orderItems || []).map((it: any) => ({
              name: it.product_name,
              quantity: it.quantity,
              price: it.product_price,
              subtotal: it.subtotal,
            })),
            subtotal: Number(order.subtotal) || 0,
            deliveryCharge: Number(order.delivery_charge) || 0,
            isCustomDelivery: Boolean(
              deliveryAddr.isCustomDelivery ||
              isSpecificOrCustomSlot(deliveryAddr.deliveryTime)
            ),
            discount: Number(order.discount) || 0,
            finalAmount: Number(order.final_amount) || 0,
            paymentMethod: paymentMethod?.type ? `${paymentMethod.type.toUpperCase()}` : "Razorpay Online",
            paymentStatus: "paid",
            paymentId: payment_id,
            notes: order.notes || "",
            createdAt: order.created_at,
          });

          // Send payment confirmation & order details to customer
          if (order.customer_phone) {
            sendCustomerOrderNotification({
              orderId: cleanOrderId,
              customerName: order.customer_name || "Customer",
              customerPhone: order.customer_phone,
              items: (orderItems || []).map((it: any) => ({
                name: it.product_name,
                quantity: it.quantity,
                price: it.product_price,
                subtotal: it.subtotal,
              })),
              finalAmount: Number(order.final_amount) || 0,
              orderStatus: order.order_status || "confirmed",
              paymentStatus: "paid",
              deliveryDate: deliveryAddr.deliveryDate || "",
              deliveryTime: deliveryAddr.deliveryTime || "",
              deliveryAddress: `${deliveryAddr.houseBuilding || deliveryAddr.house || ""}, ${deliveryAddr.street || ""}, ${deliveryAddr.city || "Kozhikode"}`,
            }).catch((cErr) => console.warn("[WhatsApp] Customer payment confirmation notification error:", cErr));
          }
        } catch (wpErr) {
          console.warn("WhatsApp notification error in verify-payment:", wpErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      order_id,
      payment_id,
      whatsappSent: whatsappResult?.success || false,
      whatsappUrl: whatsappResult?.whatsappUrl,
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
