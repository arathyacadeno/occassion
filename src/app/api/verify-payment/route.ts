import { NextResponse } from "next/server";
import { verifyPaymentSignature } from "@/lib/payment/razorpay";
import { getDb } from "@/lib/db";
import { sql } from "@/lib/db/neon";
import { sendWhatsAppToOwner } from "@/lib/whatsapp/service";

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

      // 3. Query order data to send full WhatsApp confirmation to owner 9447446008
      let order: any = null;
      let orderItems: any[] = [];
      try {
        const db = getDb();
        order = db.prepare("SELECT * FROM orders WHERE id = ? OR id = ?").get(cleanOrderId, `#${cleanOrderId}`);
        if (order) {
          orderItems = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(order.id);
        }
      } catch (err) {
        console.warn("Could not query order for WhatsApp in SQLite:", err);
      }

      if (!order && process.env.DATABASE_URL) {
        try {
          const neonRes = await sql`SELECT * FROM orders WHERE id = ${cleanOrderId} OR id = ${"#" + cleanOrderId}`;
          if (neonRes && neonRes.length > 0) {
            order = neonRes[0];
            orderItems = await sql`SELECT * FROM order_items WHERE order_id = ${order.id}`;
          }
        } catch (neonOrderErr) {
          console.warn("Could not query order for WhatsApp in Neon:", neonOrderErr);
        }
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
            discount: Number(order.discount) || 0,
            finalAmount: Number(order.final_amount) || 0,
            paymentMethod: paymentMethod?.type ? `${paymentMethod.type.toUpperCase()}` : "Razorpay Online",
            paymentStatus: "paid",
            paymentId: payment_id,
            notes: order.notes || "",
            createdAt: order.created_at,
          });
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
