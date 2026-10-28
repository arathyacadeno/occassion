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

      if (process.env.DATABASE_URL) {
        try {
          const neonOrders = await sql`SELECT * FROM orders WHERE id = ${cleanOrderId} OR id = ${hashOrderId} OR id = ${rawOrderId}`;
          if (neonOrders && neonOrders.length > 0) {
            const nOrder = neonOrders[0];
            const nItems = await sql`SELECT * FROM order_items WHERE order_id = ${nOrder.id}`;
            return NextResponse.json({
              success: true,
              order: {
                ...nOrder,
                deliveryAddress: typeof nOrder.delivery_address === 'string' ? JSON.parse(nOrder.delivery_address || "{}") : nOrder.delivery_address,
                paymentMethod: typeof nOrder.payment_method === 'string' ? JSON.parse(nOrder.payment_method || "{}") : nOrder.payment_method,
                trackingTimeline: typeof nOrder.tracking_timeline === 'string' ? JSON.parse(nOrder.tracking_timeline || "[]") : nOrder.tracking_timeline,
                items: nItems,
              },
            });
          }
        } catch (neonErr) {
          console.warn("Neon order lookup fallback:", neonErr);
        }
      }

      const order = db
        .prepare("SELECT * FROM orders WHERE id = ? OR id = ? OR id = ?")
        .get(cleanOrderId, hashOrderId, rawOrderId);
      if (!order) {
        return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
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
