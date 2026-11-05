import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sql } from "@/lib/db/neon";
import { getAuthenticatedUser } from "@/lib/auth/jwt";
import { checkDeliveryAsync } from "@/lib/delivery/service";
import { isSpecificOrCustomSlot, CUSTOM_DELIVERY_FEE } from "@/lib/delivery/schedule";
import { ADDON_PRODUCTS } from "@/data/addons";
import { sendWhatsAppToOwner } from "@/lib/whatsapp/service";

export async function GET(request: Request) {
  try {
    const auth = getAuthenticatedUser(request);
    const { searchParams } = new URL(request.url);
    const rawOrderId = searchParams.get("id");

    const db = getDb();

    // If query by orderId directly (for tracking / thank-you)
    if (rawOrderId) {
      const cleanOrderId = rawOrderId.trim().replace(/^#+/, "");
      const hashOrderId = `#${cleanOrderId}`;

      let foundOrder: any = null;
      let orderItems: any[] = [];

      if (process.env.DATABASE_URL) {
        try {
          const neonOrders = await sql`SELECT * FROM orders WHERE id = ${cleanOrderId} OR id = ${hashOrderId} OR id = ${rawOrderId}`;
          if (neonOrders && neonOrders.length > 0) {
            foundOrder = neonOrders[0];
            orderItems = await sql`SELECT * FROM order_items WHERE order_id = ${foundOrder.id}`;
          }
        } catch (neonErr) {
          console.warn("Neon order lookup fallback:", neonErr);
        }
      }

      if (!foundOrder) {
        foundOrder = db
          .prepare("SELECT * FROM orders WHERE id = ? OR id = ? OR id = ?")
          .get(cleanOrderId, hashOrderId, rawOrderId);
        if (foundOrder) {
          orderItems = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(foundOrder.id);
        }
      }

      if (!foundOrder) {
        return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
      }

      // Security / Ownership validation
      if (foundOrder.user_id) {
        if (!auth) {
          return NextResponse.json(
            { success: false, error: "Please sign in to track this order", requiresAuth: true },
            { status: 401 }
          );
        }
        if (auth.role !== "admin" && String(auth.userId) !== String(foundOrder.user_id)) {
          return NextResponse.json(
            { success: false, error: "Access denied. This order does not belong to your account." },
            { status: 403 }
          );
        }
      } else {
        // Safe mapping for older orders without user_id: if authenticated user's email matches customer_email
        if (
          auth &&
          foundOrder.customer_email &&
          auth.email &&
          foundOrder.customer_email.toLowerCase().trim() === auth.email.toLowerCase().trim()
        ) {
          foundOrder.user_id = auth.userId;
          try {
            db.prepare("UPDATE orders SET user_id = ? WHERE id = ?").run(auth.userId, foundOrder.id);
            if (process.env.DATABASE_URL) {
              await sql`UPDATE orders SET user_id = ${auth.userId} WHERE id = ${foundOrder.id}`;
            }
          } catch (mapErr) {
            console.warn("Failed to auto-link unassigned order to user:", mapErr);
          }
        }
      }

      const deliveryAddress =
        typeof foundOrder.delivery_address === "string"
          ? JSON.parse(foundOrder.delivery_address || "{}")
          : foundOrder.delivery_address;
      const paymentMethod =
        typeof foundOrder.payment_method === "string"
          ? JSON.parse(foundOrder.payment_method || "{}")
          : foundOrder.payment_method;
      const trackingTimeline =
        typeof foundOrder.tracking_timeline === "string"
          ? JSON.parse(foundOrder.tracking_timeline || "[]")
          : foundOrder.tracking_timeline;

      return NextResponse.json({
        success: true,
        order: {
          ...foundOrder,
          deliveryAddress,
          paymentMethod,
          trackingTimeline,
          items: orderItems,
        },
      });
    }

    // List orders: strictly require authentication
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Authentication required to view order history", requiresAuth: true },
        { status: 401 }
      );
    }

    // Safe mapping: link any older unmapped orders that have matching customer_email to auth.userId
    if (auth.email) {
      try {
        db.prepare(
          "UPDATE orders SET user_id = ? WHERE (user_id IS NULL OR user_id = '') AND LOWER(TRIM(customer_email)) = LOWER(TRIM(?))"
        ).run(auth.userId, auth.email);
      } catch (sqlErr) {
        console.warn("SQLite auto-map error:", sqlErr);
      }
    }

    // 1. If Neon PostgreSQL is configured, fetch from Neon
    if (process.env.DATABASE_URL) {
      try {
        if (auth.email) {
          try {
            await sql`UPDATE orders SET user_id = ${auth.userId} WHERE (user_id IS NULL OR user_id = '') AND LOWER(TRIM(customer_email)) = LOWER(TRIM(${auth.email}))`;
          } catch (mErr) {
            console.warn("Neon auto-map error:", mErr);
          }
        }

        let neonOrders;
        if (auth.role === "admin") {
          neonOrders = await sql`SELECT * FROM orders ORDER BY created_at DESC`;
        } else {
          neonOrders = await sql`SELECT * FROM orders WHERE user_id = ${auth.userId} ORDER BY created_at DESC`;
        }

        if (neonOrders && Array.isArray(neonOrders)) {
          const ordersWithItems = [];
          for (const o of neonOrders) {
            const items = await sql`SELECT * FROM order_items WHERE order_id = ${o.id}`;
            ordersWithItems.push({
              ...o,
              deliveryAddress:
                typeof o.delivery_address === "string"
                  ? JSON.parse(o.delivery_address || "{}")
                  : o.delivery_address,
              paymentMethod:
                typeof o.payment_method === "string"
                  ? JSON.parse(o.payment_method || "{}")
                  : o.payment_method,
              trackingTimeline:
                typeof o.tracking_timeline === "string"
                  ? JSON.parse(o.tracking_timeline || "[]")
                  : o.tracking_timeline,
              items,
            });
          }
          return NextResponse.json({ success: true, orders: ordersWithItems, count: ordersWithItems.length });
        }
      } catch (neonErr) {
        console.warn("Neon orders listing fallback to SQLite:", neonErr);
      }
    }

    // 2. Fallback to SQLite (local)
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

    const deliveryCheck = await checkDeliveryAsync({
      pinCode,
      address: {
        houseBuilding: delivery?.houseBuilding || delivery?.house,
        street: delivery?.street,
        landmark: delivery?.landmark || delivery?.area,
        city: delivery?.city,
        state: delivery?.state,
        pinCode,
      },
    });

    if (!deliveryCheck.serviceable || deliveryCheck.delivery_charge === null) {
      return NextResponse.json(
        {
          success: false,
          error:
            deliveryCheck.message ||
            "Sorry, delivery is not available to this location. Please enter another delivery location.",
          deliveryCheck,
        },
        { status: 400 }
      );
    }

    // Backend verified delivery charge
    const baseDeliveryCharge = deliveryCheck.delivery_charge ?? 0;
    const isCustomDelivery = Boolean(
      delivery?.isCustomDelivery ||
      isSpecificOrCustomSlot(delivery?.deliveryTime)
    );
    const customDeliveryFee = isCustomDelivery ? CUSTOM_DELIVERY_FEE : 0;
    const verifiedDeliveryCharge = baseDeliveryCharge + customDeliveryFee;

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

      let product: any = db.prepare("SELECT * FROM products WHERE id = ? OR slug = ?").get(pId, pId);

      if (!product) {
        // 1. If ID starts with addon-, try matching with prefix stripped
        if (typeof pId === "string" && pId.startsWith("addon-")) {
          const stripped = pId.replace(/^addon-/, "");
          product = db.prepare("SELECT * FROM products WHERE id = ? OR slug = ?").get(stripped, stripped);
        }

        // 2. Check if product is in ADDON_PRODUCTS catalog
        if (!product) {
          const addon = ADDON_PRODUCTS.find(
            (a) => a.id === pId || a.name.toLowerCase() === (it.name || "").toLowerCase()
          );
          if (addon) {
            const slugFromHref = addon.href ? addon.href.split("/").pop() : "";
            const dbMatch = db
              .prepare("SELECT * FROM products WHERE slug = ? OR name = ? OR id = ?")
              .get(slugFromHref, addon.name, slugFromHref);
            if (dbMatch) {
              product = dbMatch;
            } else {
              product = {
                id: addon.id,
                name: addon.name,
                price: addon.price,
                active: 1,
                stock: 999,
                images: JSON.stringify([addon.image]),
              };
            }
          }
        }

        // 3. Fallback for valid cart items with name & price
        if (!product && it.name && it.price !== undefined) {
          product = {
            id: pId,
            name: it.name,
            price: Number(it.price) || 0,
            active: 1,
            stock: 999,
            images: JSON.stringify([it.image || "/images/lily-6-stems.png"]),
          };
        }
      }

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

      const cleanImage =
        images.find((img: string) => img && !img.includes("/side-view/")) ||
        (it.image && !it.image.includes("/side-view/") ? it.image : null) ||
        (it.image ? it.image.replace(/\/side-view\/[0-9]+-/, "/").replace(/\/side-view\/[0-9]+\//, "/").replace(/\/side-view\//, "/") : null) ||
        images[0] ||
        "/images/lily-6-stems.png";

      validatedOrderItems.push({
        productId: product.id,
        productName: product.name,
        productPrice: itemPrice,
        quantity: requestedQty,
        productImage: cleanImage,
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

    // 6a. Duplicate Order Prevention (Idempotency check within last 60 seconds)
    const sixtySecsAgo = new Date(Date.now() - 60000).toISOString();
    const existingRecentOrder = db.prepare(`
      SELECT id, final_amount, created_at FROM orders 
      WHERE (customer_phone = ? OR customer_email = ? OR (user_id IS NOT NULL AND user_id = ?))
        AND final_amount = ?
        AND created_at >= ?
      ORDER BY created_at DESC LIMIT 1
    `).get(customerPhone, customerEmail, auth?.userId || null, finalAmount, sixtySecsAgo) as { id: string; final_amount: number; created_at: string } | undefined;

    if (existingRecentOrder) {
      console.log(`[Order Dedup] Returning existing order #${existingRecentOrder.id} to prevent duplicate submission`);
      return NextResponse.json({
        success: true,
        orderId: existingRecentOrder.id,
        message: "Order placed successfully",
        status: "confirmed",
        subtotal: verifiedSubtotal,
        deliveryCharge: verifiedDeliveryCharge,
        discount: verifiedDiscount,
        finalAmount,
        createdAt: existingRecentOrder.created_at,
      });
    }

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

    // 7. Insert Order into Neon PostgreSQL
    if (process.env.DATABASE_URL) {
      try {
        await sql`
          INSERT INTO orders (
            id, user_id, customer_name, customer_email, customer_phone,
            subtotal, delivery_charge, discount, final_amount, coupon_code,
            delivery_address, payment_method, payment_status, order_status,
            tracking_timeline, notes
          ) VALUES (
            ${orderId},
            ${auth?.userId || null},
            ${customerName},
            ${customerEmail},
            ${customerPhone},
            ${verifiedSubtotal},
            ${verifiedDeliveryCharge},
            ${verifiedDiscount},
            ${finalAmount},
            ${appliedCouponCode},
            ${JSON.stringify(delivery || {})},
            ${JSON.stringify(paymentMethod || { type: "COD", label: "Cash on Delivery" })},
            ${paymentMethod?.type === "COD" ? "pending" : "paid"},
            'confirmed',
            ${JSON.stringify(trackingTimeline)},
            ${notes || ""}
          )
        `;

        for (let i = 0; i < validatedOrderItems.length; i++) {
          const it = validatedOrderItems[i];
          const orderItemId = `oi-${orderId}-${i + 1}`;
          await sql`
            INSERT INTO order_items (
              id, order_id, product_id, product_name, product_price,
              quantity, product_image, subtotal
            ) VALUES (
              ${orderItemId},
              ${orderId},
              ${it.productId},
              ${it.productName},
              ${it.productPrice},
              ${it.quantity},
              ${it.productImage || null},
              ${it.subtotal}
            )
          `;
          await sql`UPDATE products SET stock = GREATEST(0, stock - ${it.quantity}) WHERE id = ${it.productId}`;
        }
      } catch (neonInsertErr) {
        console.error("Neon order insert error:", neonInsertErr);
      }
    }

    // Insert Order into SQLite (backup / local cache)
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

    // 10. Auto-save delivery address to user's saved addresses
    if (auth?.userId && delivery && (delivery.houseBuilding || delivery.house) && delivery.pinCode) {
      try {
        const dHouse = (delivery.houseBuilding || delivery.house || "").trim();
        const dStreet = (delivery.street || "").trim();
        const dLandmark = (delivery.landmark || delivery.area || "").trim();
        const dCity = (delivery.city || "Kozhikode (Calicut)").trim();
        const dState = (delivery.state || "Kerala").trim();
        const dPinCode = (delivery.pinCode || delivery.pin_code || "").trim();
        const dName = (delivery.receiverName || delivery.senderName || customerName || auth.name || "Customer").trim();
        const dPhone = (delivery.receiverMobile || delivery.senderMobile || customerPhone || "+91 8606464700").trim();

        const addrId = "addr-" + Math.random().toString(36).substring(2, 10);

        // Check SQLite
        const existingSqlite = db.prepare("SELECT id FROM addresses WHERE user_id = ? AND house = ? AND pin_code = ?").get(auth.userId, dHouse, dPinCode);
        if (!existingSqlite) {
          const count = db.prepare("SELECT count(*) as count FROM addresses WHERE user_id = ?").get(auth.userId)?.count || 0;
          db.prepare(`
            INSERT INTO addresses (
              id, user_id, full_name, phone, house, street, area, city, state, pin_code,
              type, is_default, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Home', ?, ?, ?)
          `).run(addrId, auth.userId, dName, dPhone, dHouse, dStreet, dLandmark, dCity, dState, dPinCode, count === 0 ? 1 : 0, now, now);
        }

        // Check Neon
        if (process.env.DATABASE_URL) {
          try {
            const existingNeon = await sql`SELECT id FROM addresses WHERE user_id = ${auth.userId} AND house = ${dHouse} AND pin_code = ${dPinCode}`;
            if (existingNeon.length === 0) {
              const countRes = await sql`SELECT count(*)::int as count FROM addresses WHERE user_id = ${auth.userId}`;
              const count = countRes[0]?.count || 0;
              await sql`
                INSERT INTO addresses (
                  id, user_id, full_name, phone, house, street, area, city, state, pin_code,
                  type, is_default, created_at, updated_at
                ) VALUES (
                  ${addrId}, ${auth.userId}, ${dName}, ${dPhone}, ${dHouse}, ${dStreet}, ${dLandmark}, ${dCity}, ${dState}, ${dPinCode},
                  'Home', ${count === 0 ? 1 : 0}, ${now}, ${now}
                )
              `;
            }
          } catch (e) {
            console.warn("Could not save address to Neon on order:", e);
          }
        }
      } catch (addrErr) {
        console.warn("Could not auto-save delivery address on order:", addrErr);
      }
    }

    // 11. Send WhatsApp notification to owner 9447446008 (Instant for COD; generated for all)
    let whatsappResult: any = null;
    try {
      const isCod = paymentMethod?.type === "COD";
      whatsappResult = await sendWhatsAppToOwner({
        orderId,
        customerName,
        customerPhone,
        customerEmail,
        receiverName: delivery?.receiverName || delivery?.fullName || customerName,
        receiverPhone: delivery?.receiverMobile || delivery?.phone || customerPhone,
        houseBuilding: delivery?.houseBuilding || delivery?.house || "",
        street: delivery?.street || "",
        landmark: delivery?.landmark || delivery?.area || "",
        city: delivery?.city || "Kozhikode (Calicut)",
        state: delivery?.state || "Kerala",
        pinCode: delivery?.pinCode || "",
        deliveryDate: delivery?.deliveryDate || "",
        deliveryTime: delivery?.deliveryTime || "",
        items: validatedOrderItems.map((it) => ({
          name: it.productName,
          quantity: it.quantity,
          price: it.productPrice,
          subtotal: it.subtotal,
        })),
        subtotal: verifiedSubtotal,
        deliveryCharge: verifiedDeliveryCharge,
        isCustomDelivery,
        discount: verifiedDiscount,
        finalAmount,
        paymentMethod: isCod ? "Cash on Delivery (COD)" : (paymentMethod?.type ? `${paymentMethod.type.toUpperCase()}` : "Online Payment"),
        paymentStatus: isCod ? "pending" : "pending",
        notes: notes || "",
        createdAt: now,
      });
    } catch (wpErr) {
      console.warn("WhatsApp notification error on order create:", wpErr);
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
      whatsappSent: whatsappResult?.success || false,
      whatsappUrl: whatsappResult?.whatsappUrl,
      createdAt: now,
    });
  } catch (error: any) {
    console.error("Order placement error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to place order" }, { status: 500 });
  }
}
