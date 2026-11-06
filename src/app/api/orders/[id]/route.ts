import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { getAuthenticatedUser } from "@/lib/auth/jwt";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cleanId = id.trim().replace(/^#+/, "");
    const hashId = `#${cleanId}`;
    const auth = getAuthenticatedUser(request);

    const neonOrders = await sql`
      SELECT * FROM orders 
      WHERE id = ${cleanId} OR id = ${hashId} OR id = ${id}
      LIMIT 1
    `;

    if (!neonOrders || neonOrders.length === 0) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    const order = neonOrders[0];
    const items = await sql`SELECT * FROM order_items WHERE order_id = ${order.id}`;

    // Security / Ownership check:
    if (order.user_id) {
      if (!auth) {
        return NextResponse.json(
          { success: false, error: "Please sign in to view this order", requiresAuth: true },
          { status: 401 }
        );
      }
      if (auth.role !== "admin" && String(auth.userId) !== String(order.user_id)) {
        return NextResponse.json(
          { success: false, error: "Access denied. You do not have permission to view this order." },
          { status: 403 }
        );
      }
    }

    const deliveryAddress =
      typeof order.delivery_address === "string"
        ? JSON.parse(order.delivery_address || "{}")
        : order.delivery_address;
    const paymentMethod =
      typeof order.payment_method === "string"
        ? JSON.parse(order.payment_method || "{}")
        : order.payment_method;
    const trackingTimeline =
      typeof order.tracking_timeline === "string"
        ? JSON.parse(order.tracking_timeline || "[]")
        : order.tracking_timeline;

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        deliveryAddress,
        paymentMethod,
        trackingTimeline,
        items,
      },
    });
  } catch (error: any) {
    console.error("Order GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = getAuthenticatedUser(request);
    const body = await request.json();
    const { action, status, paymentStatus } = body;

    const neonOrders = await sql`SELECT * FROM orders WHERE id = ${id} LIMIT 1`;
    if (!neonOrders || neonOrders.length === 0) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    const order = neonOrders[0];
    const now = new Date().toISOString();

    // Customer cancellation
    if (action === "cancel") {
      if (auth && auth.role !== "admin" && order.user_id && order.user_id !== auth.userId) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
      }

      if (order.order_status !== "pending" && order.order_status !== "confirmed") {
        return NextResponse.json(
          {
            success: false,
            error: `Order cannot be cancelled because it is already ${order.order_status.replace(/_/g, " ")}.`,
          },
          { status: 400 }
        );
      }

      // Restore stock for items & update order in Neon PostgreSQL
      const items = await sql`SELECT product_id, quantity FROM order_items WHERE order_id = ${id}`;

      let timeline: any[] = [];
      try {
        timeline = JSON.parse(order.tracking_timeline || "[]");
      } catch {
        timeline = [];
      }
      timeline.push({
        status: "cancelled",
        title: "Order Cancelled",
        time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        date: "Today",
        completed: true,
        current: true,
        desc: "Order was cancelled by customer. Any charged amount will be refunded within 3-5 business days.",
      });

      const txQueries: any[] = [
        ...items.map((item) => sql`UPDATE products SET stock = stock + ${item.quantity} WHERE id = ${item.product_id}`),
        sql`
          UPDATE orders
          SET order_status = 'cancelled',
              payment_status = CASE WHEN payment_status = 'paid' THEN 'refunded' ELSE payment_status END,
              tracking_timeline = ${JSON.stringify(timeline)},
              updated_at = ${now}
          WHERE id = ${id}
        `,
      ];

      await sql.transaction(txQueries);

      return NextResponse.json({
        success: true,
        message: "Order cancelled successfully and stock restored",
        status: "cancelled",
      });
    }

    // Admin status update
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const validStatuses = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"];
    const newStatus = status && validStatuses.includes(status) ? status : order.order_status;
    const newPaymentStatus = paymentStatus || order.payment_status;

    // Update tracking timeline to mark steps up to newStatus as completed
    let timeline: any[] = [];
    try {
      timeline = JSON.parse(order.tracking_timeline || "[]");
    } catch {
      timeline = [];
    }

    const statusOrder = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered"];
    const targetIdx = statusOrder.indexOf(newStatus);

    if (targetIdx !== -1) {
      timeline = timeline.map((step: any) => {
        const stepIdx = statusOrder.indexOf(step.status);
        if (stepIdx !== -1) {
          return {
            ...step,
            completed: stepIdx <= targetIdx,
            current: stepIdx === targetIdx,
          };
        }
        return step;
      });
    }

    await sql`
      UPDATE orders
      SET order_status = ${newStatus},
          payment_status = ${newPaymentStatus},
          tracking_timeline = ${JSON.stringify(timeline)},
          updated_at = ${now}
      WHERE id = ${id}
    `;

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${newStatus}`,
      orderStatus: newStatus,
      paymentStatus: newPaymentStatus,
    });
  } catch (error: any) {
    console.error("Order PATCH error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update order" }, { status: 500 });
  }
}
