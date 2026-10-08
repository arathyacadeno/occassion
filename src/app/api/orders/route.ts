import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth/jwt";
import { checkDelivery } from "@/lib/delivery/service";

export async function GET(request: Request) {
  try {
    const auth = getAuthenticatedUser(request);
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("id");

    const db = getDb();

    // If query by orderId directly (for tracking / order-success)
    if (orderId) {
      const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId);
      if (!order) {
        return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
      }

      // If user is logged in and not admin, ensure they own the order
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
    }

    // List orders: if admin, can list all or filter; if customer, list their own orders
    if (!auth) {
      return NextResponse.json({ success: false, error: "Authentication required to view order history" }, { status: 401 });
    }

    let ordersQuery = "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC";
    let params: any[] = [auth.userId];

    if (auth.role === "admin") {
      ordersQuery = "SELECT * FROM orders ORDER BY created_at DESC";
      params = [];
    }

    const ordersRaw = db.prepare(ordersQuery).all(...params);

    const orders = ordersRaw.map((o: any) => {
      const items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(o.id);
      return {
        ...o,
        deliveryAddress: JSON.parse(o.delivery_address || "{}"),
        paymentMethod: JSON.parse(o.payment_method || "{}"),
        trackingTimeline: JSON.parse(o.tracking_timeline || "[]"),
        items,
      };
    });

    return NextResponse.json({ success: true, orders, count: orders.length });
  } catch (error: any) {
    console.error("Orders GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = getAuthenticatedUser(request);
    const body = await request.json();
    const { items, delivery, paymentMethod, couponCode, notes } = body;

    // 1. Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: "No items provided in order" }, { status: 400 });
    }

    // 2. Validate delivery location & PIN code
    const pinCode = delivery?.pinCode;
    if (!pinCode) {
      return NextResponse.json({ success: false, error: "Delivery PIN code is required" }, { status: 400 });
    }

    const deliveryCheck = checkDelivery({ pinCode });
    if (!deliveryCheck.serviceable) {
      return NextResponse.json(
        {
          success: false,
          error: deliveryCheck.message || "Sorry, delivery is not available to this location. Please enter another delivery location.",
          deliveryCheck,
        },
        { status: 400 }
      );
    }

    // Backend verified delivery charge
    const verifiedDeliveryCharge = deliveryCheck.delivery_charge ?? 0;

    const db = getDb();

    // 3. Validate each item against DB product & stock, calculate verified subtotal
    let verifiedSubtotal = 0;
    const validatedOrderItems: {
      productId: string;
      productName: string;
      productPrice: number;
      quantity: number;
      productImage: string;
      subtotal: number;
    }[] = [];

    for (const it of items) {
      const pId = it.productId || it.id;
      const requestedQty = Math.max(1, Number(it.quantity) || 1);

      const product = db.prepare("SELECT * FROM products WHERE id = ? OR slug = ?").get(pId, pId);
      if (!product) {
        return NextResponse.json({ success: false, error: `Product not found: ${pId}` }, { status: 404 });
      }
      if (!product.active) {
        return NextResponse.json({ success: false, error: `${product.name} is currently unavailable` }, { status: 400 });
      }
      if (product.stock < requestedQty) {
        return NextResponse.json(
          { success: false, error: `Insufficient stock for ${product.name}. Only ${product.stock} left in stock.` },
          { status: 400 }
        );
      }

      let images = [];
      try {
        images = JSON.parse(product.images);
      } catch {
        images = [product.images];
      }

      const itemPrice = Number(product.price);
      const itemSubtotal = itemPrice * requestedQty;
      verifiedSubtotal += itemSubtotal;

      validatedOrderItems.push({
        productId: product.id,
        productName: product.name,
        productPrice: itemPrice,
        quantity: requestedQty,
        productImage: images[0] || it.image || "/images/lily-6-stems.png",
        subtotal: itemSubtotal,
      });
    }

    // 4. Validate coupon if provided
    let verifiedDiscount = 0;
    let appliedCouponCode: string | null = null;

    if (couponCode && typeof couponCode === "string" && couponCode.trim()) {
      const cleanCoupon = couponCode.trim().toUpperCase();
      const coupon = db.prepare("SELECT * FROM coupons WHERE code = ?").get(cleanCoupon);

      if (coupon && coupon.active) {
        const notExpired = !coupon.expiry_date || new Date(coupon.expiry_date) >= new Date();
        const withinLimit = !coupon.usage_limit || coupon.times_used < coupon.usage_limit;
        const meetsMin = verifiedSubtotal >= coupon.min_order_value;

        if (notExpired && withinLimit && meetsMin) {
          if (coupon.discount_type === "percentage") {
            verifiedDiscount = Math.round((verifiedSubtotal * coupon.discount_value) / 100);
            if (coupon.max_discount && verifiedDiscount > coupon.max_discount) {
              verifiedDiscount = coupon.max_discount;
            }
          } else {
            verifiedDiscount = coupon.discount_value;
          }
          verifiedDiscount = Math.min(verifiedDiscount, verifiedSubtotal);
          appliedCouponCode = coupon.code;

          // Increment coupon usage
          db.prepare("UPDATE coupons SET times_used = times_used + 1 WHERE id = ?").run(coupon.id);
        }
      }
    }

    // 5. Compute verified final total on backend
    const finalAmount = Math.max(0, verifiedSubtotal + verifiedDeliveryCharge - verifiedDiscount);

    // 6. Generate order ID and tracking timeline
    const orderRandom = Math.floor(100000 + Math.random() * 900000);
    const orderId = `${orderRandom}`;
    const now = new Date().toISOString();

    const customerName = (delivery?.fullName || auth?.name || "Customer").trim();
    const customerEmail = (delivery?.email || auth?.email || "customer@occasions.com").trim();
    const customerPhone = (delivery?.mobile || delivery?.phone || "+91 8606464700").trim();

    const trackingTimeline = [
      {
        status: "confirmed",
        title: "Order Confirmed",
        time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        date: "Today",
        completed: true,
        current: true,
        desc: "Order placed and payment recorded. Our floral designers are preparing your fresh arrangement.",
      },
      {
        status: "preparing",
        title: "Floral Crafting & Quality Check",
        time: "Upcoming",
        date: "Today",
        completed: false,
        desc: "Handcrafted with freshly harvested blooms from Calicut florists.",
      },
      {
        status: "out_for_delivery",
        title: "Out for Calicut Delivery",
        time: "Upcoming",
        date: "Today",
        completed: false,
        desc: "Assigned to refrigerated express delivery courier.",
      },
      {
        status: "delivered",
        title: "Delivered to Recipient",
        time: "Upcoming",
        date: "Today",
        completed: false,
        desc: "Handed over with personalized greeting card.",
      },
    ];

    // 7. Insert Order
    db.prepare(`
      INSERT INTO orders (
        id, user_id, customer_name, customer_email, customer_phone,
        subtotal, delivery_charge, discount, final_amount, coupon_code,
        delivery_address, payment_method, payment_status, order_status,
        tracking_timeline, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      orderId,
      auth?.userId || null,
      customerName,
      customerEmail,
      customerPhone,
      verifiedSubtotal,
      verifiedDeliveryCharge,
      verifiedDiscount,
      finalAmount,
      appliedCouponCode,
      JSON.stringify(delivery || {}),
      JSON.stringify(paymentMethod || { type: "COD", label: "Cash on Delivery" }),
      paymentMethod?.type === "COD" ? "pending" : "paid",
      "confirmed",
      JSON.stringify(trackingTimeline),
      notes || "",
      now,
      now
    );

    // 8. Insert Order Items & deduct stock
    const insertOrderItem = db.prepare(`
      INSERT INTO order_items (
        id, order_id, product_id, product_name, product_price,
        quantity, product_image, subtotal
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const deductStock = db.prepare("UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?");

    for (let i = 0; i < validatedOrderItems.length; i++) {
      const it = validatedOrderItems[i];
      const orderItemId = `oi-${orderId}-${i + 1}`;
      insertOrderItem.run(
        orderItemId,
        orderId,
        it.productId,
        it.productName,
        it.productPrice,
        it.quantity,
        it.productImage,
        it.subtotal
      );

      deductStock.run(it.quantity, it.productId);
    }

    // 9. Clear user's DB cart if logged in
    if (auth) {
      db.prepare("DELETE FROM cart_items WHERE user_id = ?").run(auth.userId);
    }

    return NextResponse.json({
      success: true,
      orderId,
      message: "Order placed successfully",
      status: "confirmed",
      subtotal: verifiedSubtotal,
      deliveryCharge: verifiedDeliveryCharge,
      discount: verifiedDiscount,
      finalAmount,
      deliveryDistanceKm: deliveryCheck.distance_km,
      createdAt: now,
    });
  } catch (error: any) {
    console.error("Order placement error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to place order" }, { status: 500 });
  }
}
