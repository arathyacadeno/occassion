/**
 * WhatsApp Business Notification Service
 * Integrates Meta / Facebook WhatsApp Cloud API (v25.0) to send automated order confirmation
 * and status updates to customers and website owner / admin.
 */

export interface OrderNotificationItem {
  name: string;
  quantity: number;
  price: number;
  subtotal?: number;
  isAddon?: boolean;
}

export interface OrderNotificationPayload {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  receiverName?: string;
  receiverPhone?: string;
  houseBuilding?: string;
  street?: string;
  landmark?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  deliveryDate?: string;
  deliveryTime?: string;
  items: OrderNotificationItem[];
  subtotal: number;
  deliveryCharge: number;
  isCustomDelivery?: boolean;
  discount?: number;
  finalAmount: number;
  paymentMethod: string;
  paymentStatus: "paid" | "pending" | "failed" | string;
  paymentId?: string;
  notes?: string;
  createdAt?: string;
}

export interface CustomerOrderNotificationPayload {
  orderId: string;
  customerName: string;
  customerPhone: string;
  items: OrderNotificationItem[];
  finalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  deliveryDate?: string;
  deliveryTime?: string;
  deliveryAddress?: string;
  createdAt?: string;
}

export type OrderFulfillmentStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export interface OrderStatusNotificationPayload {
  orderId: string;
  status: OrderFulfillmentStatus;
  customerName?: string;
  customerPhone?: string;
  deliveryDate?: string;
  deliveryTime?: string;
  deliveryAddress?: string;
}

export interface WhatsAppSendResult {
  success: boolean;
  provider: "meta_cloud_api" | "direct_link";
  messageId?: string;
  whatsappUrl: string;
  messageText: string;
  error?: string;
  rawResponse?: any;
}

export interface CustomerNotificationResult extends WhatsAppSendResult {
  alreadySent?: boolean;
}

export interface SendGenericMessagePayload {
  to: string;
  message?: string;
  template?: {
    name: string;
    language?: { code: string } | string;
    components?: any[];
  };
}

export interface WhatsAppHistoryEntry {
  type: "order_confirmation" | "status_update" | "retry" | "admin_alert";
  status?: string;
  messageId?: string;
  deliveryStatus?: "sent" | "delivered" | "read" | "failed";
  timestamp: string;
  recipient: string;
  error?: string;
  success: boolean;
}

/**
 * Normalizes phone number into international format without leading '+' or symbols.
 * Returns empty string if no valid digits are found.
 */
export function normalizeWhatsAppNumber(phone?: string): string {
  const clean = (phone || "").replace(/\D/g, "");
  if (!clean) return "";
  if (clean.length === 10) return `91${clean}`;
  if (clean.length === 12 && clean.startsWith("91")) return clean;
  if (clean.length === 11 && clean.startsWith("0")) return `91${clean.slice(1)}`;
  return clean;
}

/**
 * Helper to mask sensitive phone numbers in server logs
 */
export function maskPhoneInLog(phone?: string): string {
  if (!phone) return "unknown";
  const str = String(phone);
  if (str.length <= 4) return "****";
  return str.slice(0, 2) + "*".repeat(Math.max(1, str.length - 6)) + str.slice(-4);
}

/**
 * Helper to mask credentials in error outputs
 */
export function sanitizeMetaError(err: any): any {
  if (!err) return null;
  const str = typeof err === "string" ? err : JSON.stringify(err);
  return str.replace(/EAA[A-Za-z0-9_-]+/g, "EAA***[MASKED]");
}

/**
 * Formats a comprehensive, professional WhatsApp order notification message for the admin
 */
export function buildOrderWhatsAppMessage(data: OrderNotificationPayload): string {
  const orderId = String(data.orderId || "").replace(/^#+/, "");
  const orderTimeStr = data.createdAt
    ? new Date(data.createdAt).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

  const itemsText =
    data.items && data.items.length > 0
      ? data.items
          .map((it, idx) => {
            const lineTotal = it.subtotal || it.price * (it.quantity || 1);
            const addonTag = it.isAddon ? " _(Add-on)_" : "";
            return `${idx + 1}. *${it.name}*${addonTag} × ${it.quantity || 1} — ₹${lineTotal.toLocaleString("en-IN")}`;
          })
          .join("\n")
      : "1. Fresh Floral Bouquet";

  const addressLines: string[] = [];
  if (data.receiverName) addressLines.push(`• *Recipient Name:* ${data.receiverName}`);
  if (data.receiverPhone) addressLines.push(`• *Recipient Phone:* ${data.receiverPhone}`);
  if (data.houseBuilding) addressLines.push(`• *House / Flat:* ${data.houseBuilding}`);
  if (data.street) addressLines.push(`• *Street / Area:* ${data.street}`);
  if (data.landmark) addressLines.push(`• *Landmark:* ${data.landmark}`);
  addressLines.push(`• *City & State:* ${data.city || "Kozhikode (Calicut)"}, ${data.state || "Kerala"}`);
  addressLines.push(`• *PIN Code:* ${data.pinCode || "673001"}`);

  const discountText =
    data.discount && data.discount > 0
      ? `• Discount Applied: -₹${data.discount.toLocaleString("en-IN")}\n`
      : "";

  const paymentStatusBadge =
    data.paymentStatus?.toLowerCase() === "paid" ? "✅ PAID" : "⏳ PENDING / COD";

  const paymentRef = data.paymentId ? ` (Ref: ${data.paymentId})` : "";
  const notesText = data.notes?.trim() ? `• *Customer Notes:* ${data.notes.trim()}\n` : "";

  const slotInfo = data.deliveryTime ? ` (${data.deliveryTime})` : "";
  const deliveryDateInfo = data.deliveryDate
    ? `• *Delivery Date:* ${data.deliveryDate}${slotInfo}\n`
    : "";

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://occasionswithflowers.com";

  return `🌸 *NEW ORDER CONFIRMATION — OCCASIONS* 🌸
━━━━━━━━━━━━━━━━━━━━━━
📦 *Order ID:* #${orderId}
📅 *Order Time:* ${orderTimeStr}
${deliveryDateInfo}
💰 *PRICE & PAYMENT:*
• Items Subtotal: ₹${data.subtotal.toLocaleString("en-IN")}
• Delivery Fee: ${data.deliveryCharge === 0 ? "FREE" : `₹${data.deliveryCharge.toLocaleString("en-IN")}`}${data.isCustomDelivery ? " _(Includes ₹100 Specific Time Slot Add-on)_" : ""}
${discountText}• *TOTAL AMOUNT:* ₹${data.finalAmount.toLocaleString("en-IN")}
• Payment: *${paymentStatusBadge}* via ${data.paymentMethod}${paymentRef}

👤 *CUSTOMER CONTACT:*
• *Name:* ${data.customerName || "Customer"}
• *Phone:* ${data.customerPhone || "Not provided"}
${data.customerEmail ? `• *Email:* ${data.customerEmail}\n` : ""}
📍 *DELIVERY LOCATION:*
${addressLines.join("\n")}

🛒 *ORDERED ITEMS:*
${itemsText}

${notesText}━━━━━━━━━━━━━━━━━━━━━━
🔗 *Store Admin Tracking:* ${appUrl}/track-order?id=${orderId}`;
}

/**
 * Formats a clean, high-conversion WhatsApp confirmation message for the customer
 */
export function buildCustomerOrderWhatsAppMessage(data: CustomerOrderNotificationPayload): string {
  const cleanOrderId = String(data.orderId || "").replace(/^#+/, "");
  const isPaid = data.paymentStatus?.toLowerCase() === "paid";
  const statusDisplay = data.orderStatus === "confirmed" ? "Confirmed 🌸" : (data.orderStatus || "Confirmed");

  const itemsList =
    data.items && data.items.length > 0
      ? data.items
          .map((it, idx) => {
            const lineTotal = it.subtotal || it.price * (it.quantity || 1);
            return `${idx + 1}. *${it.name}* × ${it.quantity} — ₹${lineTotal.toLocaleString("en-IN")}`;
          })
          .join("\n")
      : "1. Fresh Floral Bouquet";

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://occasionswithflowers.com";
  const deliveryInfo = data.deliveryDate
    ? `📅 *Delivery Date:* ${data.deliveryDate}${data.deliveryTime ? ` (${data.deliveryTime})` : ""}\n`
    : "";

  const addressLine = data.deliveryAddress ? `📍 *Delivery Address:* ${data.deliveryAddress}\n` : "";

  return `🌸 *ORDER CONFIRMATION — OCCASIONS FLORIST* 🌸

Dear *${data.customerName || "Valued Customer"}*,
Thank you for choosing *Occasions – Do it with flowers*! We have received your celebration order.

📦 *Order ID:* #${cleanOrderId}
📊 *Order Status:* *${statusDisplay}*
💳 *Payment:* *${isPaid ? "✅ Paid Online" : "⏳ Cash on Delivery (COD)"}*
💰 *Total Amount:* ₹${data.finalAmount.toLocaleString("en-IN")}
${deliveryInfo}${addressLine}
🛒 *ORDERED ITEMS:*
${itemsList}

📍 *Live Order Tracking:*
${appUrl}/track-order?id=${cleanOrderId}

📞 *Need Assistance or Custom Requests?*
Reply directly to this WhatsApp message or call our Calicut atelier at +91 8606464700.

_Occasions Florist & Celebration Atelier — Mavoor Road, Calicut_`;
}

/**
 * Formats status update messages (Preparing, Out for Delivery, Delivered, Cancelled)
 */
export function buildOrderStatusWhatsAppMessage(data: OrderStatusNotificationPayload): string {
  const cleanOrderId = String(data.orderId || "").replace(/^#+/, "");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://occasionswithflowers.com";
  const customerName = data.customerName || "Valued Customer";

  switch (data.status) {
    case "preparing":
      return `🌸 *Artisanal Crafting Underway — Occasions* 🌸

Dear *${customerName}*,
Our floral artisans in Calicut have begun carefully handcrafting and arranging fresh flowers for your order *#${cleanOrderId}*.

📍 *Track Progress:*
${appUrl}/track-order?id=${cleanOrderId}

📞 *Questions or Special Notes?*
Call us at +91 8606464700 or reply directly to this chat.

_Occasions – Do it with flowers_`;

    case "out_for_delivery":
      return `🚚 *Out for Delivery — Occasions Florist* 🚚

Dear *${customerName}*,
Exciting news! Your flower order *#${cleanOrderId}* is now out for delivery with our delivery specialist${data.deliveryAddress ? ` to *${data.deliveryAddress}*` : ""}.
${data.deliveryTime ? `⏱️ *Estimated Slot:* ${data.deliveryTime}\n` : ""}
📍 *Live Order Tracking:*
${appUrl}/track-order?id=${cleanOrderId}

_Occasions – Fresh Flowers Delivered with Love_`;

    case "delivered":
      return `💐 *Delivered with Love — Occasions Florist* 💐

Dear *${customerName}*,
Your celebration order *#${cleanOrderId}* has been successfully delivered! We hope it brings immense joy and memorable smiles to your special occasion.

🌸 Thank you for choosing *Occasions – Do it with flowers*!
⭐ Have feedback or loved your arrangement? We'd love to hear from you:
${appUrl}#testimonials

_Occasions Florist & Celebration Atelier — Calicut_`;

    case "cancelled":
      return `ℹ️ *Order Update — Occasions Florist* ℹ️

Dear *${customerName}*,
Your order *#${cleanOrderId}* has been cancelled. If you did not request this cancellation or have any questions, please contact our team immediately at +91 8606464700.

_Occasions Calicut_`;

    case "confirmed":
    default:
      return `🌸 *Order Confirmed — Occasions Florist* 🌸

Dear *${customerName}*,
Your order *#${cleanOrderId}* is confirmed! We will prepare your arrangement fresh for delivery${data.deliveryDate ? ` on *${data.deliveryDate}*` : ""}.

📍 *Track Order:*
${appUrl}/track-order?id=${cleanOrderId}

_Occasions – Do it with flowers_`;
  }
}

/**
 * Ensures all WhatsApp columns exist on the orders table in Neon PostgreSQL
 */
let columnsChecked = false;
export async function ensureWhatsAppColumns() {
  if (columnsChecked) return;
  try {
    const { sql } = await import("@/lib/db/neon");
    await sql`
      ALTER TABLE orders 
        ADD COLUMN IF NOT EXISTS whatsapp_customer_notified INT DEFAULT 0,
        ADD COLUMN IF NOT EXISTS whatsapp_status VARCHAR(50) DEFAULT 'pending',
        ADD COLUMN IF NOT EXISTS whatsapp_message_id VARCHAR(255),
        ADD COLUMN IF NOT EXISTS whatsapp_last_error TEXT,
        ADD COLUMN IF NOT EXISTS whatsapp_last_status_at TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS whatsapp_history JSONB DEFAULT '[]'::jsonb;
    `;
    columnsChecked = true;
  } catch (err) {
    console.warn("[WhatsApp Service] ensureWhatsAppColumns notice:", err);
  }
}

/**
 * Records a WhatsApp event in Neon PostgreSQL for an order
 */
export async function recordWhatsAppEvent(
  orderId: string,
  entry: WhatsAppHistoryEntry
) {
  try {
    await ensureWhatsAppColumns();
    const cleanId = String(orderId || "").replace(/^#+/, "");
    const { sql } = await import("@/lib/db/neon");

    const entryJson = JSON.stringify([entry]);

    await sql`
      UPDATE orders 
      SET 
        whatsapp_status = COALESCE(${entry.deliveryStatus || (entry.success ? "sent" : "failed")}, whatsapp_status),
        whatsapp_message_id = COALESCE(${entry.messageId || null}, whatsapp_message_id),
        whatsapp_last_error = ${entry.error || null},
        whatsapp_last_status_at = NOW(),
        whatsapp_customer_notified = CASE WHEN ${entry.success} THEN 1 ELSE whatsapp_customer_notified END,
        whatsapp_history = COALESCE(whatsapp_history, '[]'::jsonb) || ${entryJson}::jsonb
      WHERE id = ${cleanId} OR id = ${"#" + cleanId}
    `;
  } catch (err) {
    console.warn("[WhatsApp Service] recordWhatsAppEvent warning:", err);
  }
}

/**
 * Marks order as notified in Neon PostgreSQL
 */
export async function markOrderNotified(orderId: string, messageId?: string) {
  try {
    await ensureWhatsAppColumns();
    const cleanId = String(orderId || "").replace(/^#+/, "");
    const { sql } = await import("@/lib/db/neon");
    await sql`
      UPDATE orders 
      SET 
        whatsapp_customer_notified = 1,
        whatsapp_status = 'sent',
        whatsapp_message_id = COALESCE(${messageId || null}, whatsapp_message_id),
        whatsapp_last_status_at = NOW()
      WHERE id = ${cleanId} OR id = ${"#" + cleanId}
    `;
  } catch (err) {
    console.warn("[WhatsApp Service] markOrderNotified warning:", err);
  }
}

/**
 * Retrieves full order details from Neon PostgreSQL by order ID for notification dispatches
 */
export async function fetchOrderForNotification(orderId: string): Promise<{
  adminPayload: OrderNotificationPayload;
  customerPayload: CustomerOrderNotificationPayload;
  rawOrder: any;
} | null> {
  try {
    const cleanId = String(orderId || "").trim().replace(/^#+/, "");
    const { sql } = await import("@/lib/db/neon");

    const orders = await sql`
      SELECT * FROM orders 
      WHERE id = ${cleanId} OR id = ${"#" + cleanId}
      LIMIT 1
    `;

    if (!orders || orders.length === 0) {
      return null;
    }

    const order = orders[0];
    const rawItems = await sql`SELECT * FROM order_items WHERE order_id = ${order.id}`;

    const delivery =
      typeof order.delivery_address === "string"
        ? JSON.parse(order.delivery_address || "{}")
        : order.delivery_address || {};

    const paymentMethod =
      typeof order.payment_method === "string"
        ? JSON.parse(order.payment_method || "{}")
        : order.payment_method || {};

    const items: OrderNotificationItem[] = (rawItems || []).map((it: any) => ({
      name: it.product_name || "Flower Item",
      quantity: Number(it.quantity) || 1,
      price: Number(it.product_price) || 0,
      subtotal: Number(it.subtotal) || (Number(it.product_price) || 0) * (Number(it.quantity) || 1),
    }));

    const deliveryAddressStr = [
      delivery.houseBuilding || delivery.house,
      delivery.street,
      delivery.landmark || delivery.area,
      delivery.city || "Kozhikode",
      delivery.pinCode || delivery.pin_code,
    ]
      .filter(Boolean)
      .join(", ");

    const adminPayload: OrderNotificationPayload = {
      orderId: cleanId,
      customerName: order.customer_name || delivery.receiverName || "Customer",
      customerPhone: order.customer_phone || delivery.receiverMobile || "",
      customerEmail: order.customer_email || "",
      receiverName: delivery.receiverName || delivery.fullName || order.customer_name,
      receiverPhone: delivery.receiverMobile || delivery.phone || order.customer_phone,
      houseBuilding: delivery.houseBuilding || delivery.house || "",
      street: delivery.street || "",
      landmark: delivery.landmark || delivery.area || "",
      city: delivery.city || "Kozhikode (Calicut)",
      state: delivery.state || "Kerala",
      pinCode: delivery.pinCode || delivery.pin_code || "",
      deliveryDate: delivery.deliveryDate || "",
      deliveryTime: delivery.deliveryTime || "",
      items,
      subtotal: Number(order.subtotal) || 0,
      deliveryCharge: Number(order.delivery_charge) || 0,
      isCustomDelivery: Boolean(delivery.isCustomDelivery),
      discount: Number(order.discount) || 0,
      finalAmount: Number(order.final_amount) || 0,
      paymentMethod: paymentMethod?.type ? String(paymentMethod.type).toUpperCase() : "Online Payment",
      paymentStatus: order.payment_status || "pending",
      paymentId: order.payment_id || undefined,
      notes: order.notes || "",
      createdAt: order.created_at,
    };

    const customerPayload: CustomerOrderNotificationPayload = {
      orderId: cleanId,
      customerName: order.customer_name || "Valued Customer",
      customerPhone: order.customer_phone || delivery.receiverMobile || "",
      items,
      finalAmount: Number(order.final_amount) || 0,
      orderStatus: order.order_status || "confirmed",
      paymentStatus: order.payment_status || "pending",
      deliveryDate: delivery.deliveryDate || "",
      deliveryTime: delivery.deliveryTime || "",
      deliveryAddress: deliveryAddressStr,
      createdAt: order.created_at,
    };

    return { adminPayload, customerPayload, rawOrder: order };
  } catch (err) {
    console.error("[WhatsApp Service] fetchOrderForNotification error:", err);
    return null;
  }
}

/**
 * Core generic WhatsApp sender via Meta Cloud API
 * Handles Bearer auth, timeouts (12s), error handling, and wa.me fallback
 */
export async function sendGenericWhatsAppMessage(
  options: SendGenericMessagePayload
): Promise<WhatsAppSendResult> {
  const targetPhone = normalizeWhatsAppNumber(options.to);
  const messageText = options.message || "Hello from Occasions Flowers!";

  if (!targetPhone || targetPhone.length < 10) {
    return {
      success: false,
      provider: "direct_link",
      whatsappUrl: "",
      messageText,
      error: `Invalid or missing recipient phone number: "${options.to || ""}"`,
    };
  }

  const whatsappUrl = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(
    messageText
  )}`;

  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  const apiVersion = process.env.WHATSAPP_API_VERSION?.trim() || "v25.0";

  // If Meta Cloud API credentials are not set, return graceful fallback with wa.me URL
  if (!phoneNumberId || !accessToken) {
    console.info(
      `[WhatsApp] Meta Cloud API credentials not configured. Direct WhatsApp link generated for ${maskPhoneInLog(
        targetPhone
      )}:`,
      whatsappUrl
    );
    return {
      success: true,
      provider: "direct_link",
      whatsappUrl,
      messageText,
    };
  }

  const metaApiEndpoint = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

  let requestBody: any;
  if (options.template) {
    const langCode =
      typeof options.template.language === "string"
        ? options.template.language
        : options.template.language?.code || "en_US";

    requestBody = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: targetPhone,
      type: "template",
      template: {
        name: options.template.name,
        language: { code: langCode },
        ...(options.template.components ? { components: options.template.components } : {}),
      },
    };
  } else {
    requestBody = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: targetPhone,
      type: "text",
      text: {
        preview_url: true,
        body: messageText,
      },
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(metaApiEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const resJson = await res.json();

    if (!res.ok || resJson.error) {
      const sanitizedError = sanitizeMetaError(resJson.error?.message || "WhatsApp Cloud API error");
      console.error("[WhatsApp Cloud API Error]:", sanitizedError);
      return {
        success: false,
        provider: "meta_cloud_api",
        whatsappUrl,
        messageText,
        error: sanitizedError,
        rawResponse: resJson,
      };
    }

    const messageId = resJson.messages?.[0]?.id;
    console.log(
      `[WhatsApp] Message successfully dispatched to ${maskPhoneInLog(targetPhone)}. Message ID: ${messageId}`
    );

    return {
      success: true,
      provider: "meta_cloud_api",
      messageId,
      whatsappUrl,
      messageText,
      rawResponse: resJson,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    const isTimeout = err.name === "AbortError";
    const errorMessage = isTimeout
      ? "Meta WhatsApp Cloud API request timed out (12s)"
      : err.message || "Network exception sending WhatsApp message";
    console.error("[WhatsApp Send Exception]:", errorMessage);
    return {
      success: false,
      provider: "meta_cloud_api",
      whatsappUrl,
      messageText,
      error: errorMessage,
    };
  }
}

/**
 * Sends order notification to website owner / admin (ADMIN_WHATSAPP_NUMBER or WHATSAPP_OWNER_PHONE).
 * Uses approved Utility template 'admin_new_order_alert' as the primary production notification.
 * Includes deduplication check against database history to prevent duplicate alerts.
 * Does not fall back to ordinary text messages or test templates per production rules.
 */
export async function sendWhatsAppToOwner(
  payload: OrderNotificationPayload,
  options?: { forceRetry?: boolean }
): Promise<WhatsAppSendResult> {
  const rawAdminNumber =
    process.env.ADMIN_WHATSAPP_NUMBER?.trim() ||
    process.env.WHATSAPP_OWNER_PHONE?.trim();

  if (!rawAdminNumber) {
    const errorMsg =
      "ADMIN_WHATSAPP_NUMBER or WHATSAPP_OWNER_PHONE environment variable is not configured. Admin WhatsApp alert aborted.";
    console.error(`[WhatsApp Admin] ${errorMsg}`);
    return {
      success: false,
      provider: "direct_link",
      whatsappUrl: "",
      messageText: "",
      error: errorMsg,
    };
  }

  const targetPhone = normalizeWhatsAppNumber(rawAdminNumber);
  if (!targetPhone || targetPhone.length < 10) {
    const errorMsg = `Invalid admin phone number configured: "${rawAdminNumber}".`;
    console.error(`[WhatsApp Admin] ${errorMsg}`);
    return {
      success: false,
      provider: "direct_link",
      whatsappUrl: "",
      messageText: "",
      error: errorMsg,
    };
  }

  const cleanOrderId = String(payload.orderId || "").replace(/^#+/, "");
  const messageText = buildOrderWhatsAppMessage(payload);
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(
    messageText
  )}`;

  // Duplicate prevention check in database (unless forceRetry is specified)
  if (!options?.forceRetry && cleanOrderId) {
    try {
      await ensureWhatsAppColumns();
      const { sql } = await import("@/lib/db/neon");
      const existing = await sql`
        SELECT whatsapp_history FROM orders 
        WHERE id = ${cleanOrderId} OR id = ${"#" + cleanOrderId}
        LIMIT 1
      `;
      if (existing && existing.length > 0) {
        const history = (existing[0].whatsapp_history || []) as WhatsAppHistoryEntry[];
        const alreadyNotified = history.some(
          (h) => h.type === "admin_alert" && h.success === true
        );
        if (alreadyNotified) {
          console.log(
            `[WhatsApp Admin] Order #${cleanOrderId} admin notification already dispatched. Preventing duplicate.`
          );
          return {
            success: true,
            provider: "meta_cloud_api",
            whatsappUrl,
            messageText,
          };
        }
      }
    } catch (dbErr) {
      console.warn("[WhatsApp Admin] DB dedup check notice:", dbErr);
    }
  }

  // Primary production dispatch using approved Utility template
  const templateName =
    process.env.ADMIN_ORDER_TEMPLATE_NAME?.trim() || "admin_new_order_alert";
  const langCode = process.env.WHATSAPP_TEMPLATE_LANG?.trim() || "en";

  // Build items summary: e.g. "Pink Roses (x1), Orchids (x2)"
  const itemsSummary =
    (payload.items || [])
      .map((it) => `${it.name} (x${it.quantity || 1})`)
      .join(", ")
      .slice(0, 300) || "Floral Order";

  const isPaid = payload.paymentStatus?.toLowerCase() === "paid";
  const paymentBadge = isPaid ? "Paid Online" : "COD / Pending";
  const totalAmountFormatted = `₹${payload.finalAmount.toLocaleString("en-IN")} (${paymentBadge})`;

  // Delivery details: slot + date + address
  const slotStr = payload.deliveryTime ? ` [${payload.deliveryTime}]` : "";
  const dateStr = payload.deliveryDate ? `${payload.deliveryDate}${slotStr}, ` : "";
  const addressSummary = [
    payload.houseBuilding,
    payload.street,
    payload.landmark,
    payload.city || "Calicut",
    payload.pinCode,
  ]
    .filter(Boolean)
    .join(", ");
  const deliveryInfo = `${dateStr}${addressSummary || "Calicut"}`.slice(0, 300);

  const result = await sendGenericWhatsAppMessage({
    to: targetPhone,
    message: messageText,
    template: {
      name: templateName,
      language: { code: langCode },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: `#${cleanOrderId}` },
            { type: "text", text: payload.customerName || "Customer" },
            { type: "text", text: payload.customerPhone || "Not provided" },
            { type: "text", text: itemsSummary },
            { type: "text", text: totalAmountFormatted },
            { type: "text", text: deliveryInfo },
          ],
        },
      ],
    },
  });

  if (!result.success) {
    console.error(
      `[WhatsApp Admin Alert Failed] Could not dispatch template "${templateName}" to ${maskPhoneInLog(
        targetPhone
      )}: ${result.error}. (Ordinary text / hello_world fallback suppressed per production policy)`
    );
  }

  // Record admin alert in database
  await recordWhatsAppEvent(payload.orderId, {
    type: "admin_alert",
    recipient: targetPhone,
    messageId: result.messageId,
    deliveryStatus: result.success ? "sent" : "failed",
    timestamp: new Date().toISOString(),
    error: result.error,
    success: result.success,
  });

  return result;
}

/**
 * Sends automated WhatsApp order confirmation to the customer upon successful order placement
 * or payment confirmation.
 */
export async function sendCustomerOrderNotification(
  payload: CustomerOrderNotificationPayload,
  options?: { forceRetry?: boolean }
): Promise<CustomerNotificationResult> {
  const cleanOrderId = String(payload.orderId || "").replace(/^#+/, "");
  const rawCustomerPhone = (payload.customerPhone || "").trim();

  if (!rawCustomerPhone || rawCustomerPhone.replace(/\D/g, "").length < 10) {
    console.warn(
      `[WhatsApp Customer] No valid phone number for order #${cleanOrderId}. Skipping customer WhatsApp.`
    );
    return {
      success: false,
      provider: "direct_link",
      whatsappUrl: "",
      messageText: "",
      error: "No valid customer phone number provided",
    };
  }

  const targetPhone = normalizeWhatsAppNumber(rawCustomerPhone);
  const messageText = buildCustomerOrderWhatsAppMessage(payload);
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(
    messageText
  )}`;

  // Duplicate check in database (unless forceRetry is requested by admin)
  if (!options?.forceRetry) {
    try {
      await ensureWhatsAppColumns();
      const { sql } = await import("@/lib/db/neon");
      const existing = await sql`
        SELECT whatsapp_customer_notified FROM orders 
        WHERE id = ${cleanOrderId} OR id = ${"#" + cleanOrderId} 
        LIMIT 1
      `;
      if (existing[0]?.whatsapp_customer_notified === 1) {
        console.log(
          `[WhatsApp Customer] Order #${cleanOrderId} already notified via WhatsApp. Preventing duplicate dispatch.`
        );
        return {
          success: true,
          alreadySent: true,
          provider: "meta_cloud_api",
          whatsappUrl,
          messageText,
        };
      }
    } catch (dbErr) {
      console.warn("[WhatsApp Customer] DB dedup check notice:", dbErr);
    }
  }

  const templateName = process.env.WHATSAPP_ORDER_TEMPLATE_NAME?.trim();
  let result: WhatsAppSendResult;

  if (templateName) {
    const itemsSummary = (payload.items || [])
      .map((it) => `${it.name} (x${it.quantity})`)
      .join(", ")
      .slice(0, 100);

    result = await sendGenericWhatsAppMessage({
      to: targetPhone,
      message: messageText,
      template: {
        name: templateName,
        language: { code: process.env.WHATSAPP_TEMPLATE_LANG || "en" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: payload.customerName || "Customer" },
              { type: "text", text: cleanOrderId },
              { type: "text", text: itemsSummary || "Fresh Flowers" },
              { type: "text", text: `₹${payload.finalAmount.toLocaleString("en-IN")}` },
              { type: "text", text: payload.orderStatus || "Confirmed" },
            ],
          },
        ],
      },
    });

    if (!result.success && result.provider === "meta_cloud_api") {
      console.warn(
        `[WhatsApp Customer] Template "${templateName}" failed (${result.error}). Retrying with formatted text message.`
      );
      result = await sendGenericWhatsAppMessage({
        to: targetPhone,
        message: messageText,
      });
    }
  } else {
    result = await sendGenericWhatsAppMessage({
      to: targetPhone,
      message: messageText,
    });
  }

  // Record customer notification event
  await recordWhatsAppEvent(cleanOrderId, {
    type: options?.forceRetry ? "retry" : "order_confirmation",
    recipient: targetPhone,
    messageId: result.messageId,
    deliveryStatus: result.success ? "sent" : "failed",
    timestamp: new Date().toISOString(),
    error: result.error,
    success: result.success,
  });

  return result;
}

/**
 * Sends order fulfillment status update notification to the customer
 * (e.g. Preparing, Out for Delivery, Delivered)
 * Includes duplicate event prevention per status.
 */
export async function sendOrderStatusWhatsAppNotification(
  payload: OrderStatusNotificationPayload
): Promise<WhatsAppSendResult> {
  const cleanOrderId = String(payload.orderId || "").replace(/^#+/, "");

  // Fetch missing customer details if not supplied
  let customerName = payload.customerName;
  let customerPhone = payload.customerPhone;
  let deliveryAddress = payload.deliveryAddress;
  let deliveryTime = payload.deliveryTime;

  if (!customerPhone) {
    const fetched = await fetchOrderForNotification(cleanOrderId);
    if (!fetched) {
      return {
        success: false,
        provider: "direct_link",
        whatsappUrl: "",
        messageText: "",
        error: `Order #${cleanOrderId} not found`,
      };
    }
    customerName = customerName || fetched.customerPayload.customerName;
    customerPhone = fetched.customerPayload.customerPhone;
    deliveryAddress = deliveryAddress || fetched.customerPayload.deliveryAddress;
    deliveryTime = deliveryTime || fetched.customerPayload.deliveryTime;

    // Check duplicate status notification in order's whatsapp_history
    const history = (fetched.rawOrder?.whatsapp_history || []) as WhatsAppHistoryEntry[];
    const alreadySentStatus = history.some(
      (h) => h.type === "status_update" && h.status === payload.status && h.success
    );

    if (alreadySentStatus) {
      console.log(
        `[WhatsApp Status] Order #${cleanOrderId} already notified for status '${payload.status}'. Skipping duplicate.`
      );
      return {
        success: true,
        provider: "meta_cloud_api",
        whatsappUrl: "",
        messageText: "Already notified for this status",
      };
    }
  }

  if (!customerPhone || customerPhone.replace(/\D/g, "").length < 10) {
    return {
      success: false,
      provider: "direct_link",
      whatsappUrl: "",
      messageText: "",
      error: "No valid customer phone number",
    };
  }

  const targetPhone = normalizeWhatsAppNumber(customerPhone);
  const messageText = buildOrderStatusWhatsAppMessage({
    ...payload,
    customerName,
    customerPhone,
    deliveryAddress,
    deliveryTime,
  });

  const result = await sendGenericWhatsAppMessage({
    to: targetPhone,
    message: messageText,
  });

  // Record status update event
  await recordWhatsAppEvent(cleanOrderId, {
    type: "status_update",
    status: payload.status,
    recipient: targetPhone,
    messageId: result.messageId,
    deliveryStatus: result.success ? "sent" : "failed",
    timestamp: new Date().toISOString(),
    error: result.error,
    success: result.success,
  });

  return result;
}
