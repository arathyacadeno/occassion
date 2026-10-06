import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth/jwt";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = getAuthenticatedUser(request);
    const db = getDb();

    const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(id);
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    // Authorization check: allow public lookup for order tracking if order exists, but if user is logged in they can only access their own unless admin
    if (auth && auth.role !== "admin" && order.user_id && order.user_id !== auth.userId) {
      return NextResponse.json({ success: false, error: "Unauthorized access to order" }, { status: 403 });
    }

    const items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(order.id);

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        deliveryAddress: JSON.parse(order.delivery_address || "{}"),
        paymentMethod: JSON.parse(order.payment_method || "{}"),
        trackingTimeline: JSON.parse(order.tracking_timeline || "[]"),
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

    const db = getDb();
    const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(id);
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

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

      // Restore stock for items
      const items = db.prepare("SELECT product_id, quantity FROM order_items WHERE order_id = ?").all(id);
      const restoreStock = db.prepare("UPDATE products SET stock = stock + ? WHERE id = ?");
      for (const item of items) {
        restoreStock.run(item.quantity, item.product_id);
      }

      let timeline = [];
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

      db.prepare(`
        UPDATE orders
        SET order_status = 'cancelled',
            payment_status = CASE WHEN payment_status = 'paid' THEN 'refunded' ELSE payment_status END,
            tracking_timeline = ?,
            updated_at = ?
        WHERE id = ?
      `).run(JSON.stringify(timeline), now, id);

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
    let timeline = [];
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

    db.prepare(`
      UPDATE orders
      SET order_status = ?,
          payment_status = ?,
          tracking_timeline = ?,
          updated_at = ?
      WHERE id = ?
    `).run(newStatus, newPaymentStatus, JSON.stringify(timeline), now, id);

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
