import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
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
    const db = getDb();

    let order: any = null;
    let items: any[] = [];

    if (process.env.DATABASE_URL) {
      try {
        const neonOrders = await sql`SELECT * FROM orders WHERE id = ${cleanId} OR id = ${hashId} OR id = ${id}`;
        if (neonOrders && neonOrders.length > 0) {
          order = neonOrders[0];
          items = await sql`SELECT * FROM order_items WHERE order_id = ${order.id}`;
        }
      } catch (neonErr) {
        console.warn("Neon order [id] lookup fallback:", neonErr);
      }
    }

    if (!order) {
      order = db.prepare("SELECT * FROM orders WHERE id = ? OR id = ? OR id = ?").get(cleanId, hashId, id);
      if (order) {
        items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(order.id);
      }
    }

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

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
    } else {
      // Safe mapping for older orders: link if authenticated customer's email matches
      if (
        auth &&
        order.customer_email &&
        auth.email &&
        order.customer_email.toLowerCase().trim() === auth.email.toLowerCase().trim()
      ) {
        order.user_id = auth.userId;
        try {
          db.prepare("UPDATE orders SET user_id = ? WHERE id = ?").run(auth.userId, order.id);
          if (process.env.DATABASE_URL) {
            await sql`UPDATE orders SET user_id = ${auth.userId} WHERE id = ${order.id}`;
          }
        } catch (mapErr) {
          console.warn("Failed to auto-link unassigned order [id] to user:", mapErr);
        }
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
