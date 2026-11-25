/**
 * WhatsApp Business Notification Service
 * Integrates Meta / Facebook WhatsApp Cloud API (v25.0) to send automated order confirmation
 * messages to customers and website owner / admin.
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

/**
 * Normalizes phone number into international format without leading '+' or symbols.
 * Defaults Indian 10-digit numbers (like 9447446008) to '919447446008'.
 */
export function normalizeWhatsAppNumber(phone?: string): string {
  const clean = (phone || "").replace(/\D/g, "");
  if (!clean) return "919447446008";
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

  // Items List
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

  // Location string parts
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
 * Ensures the `whatsapp_customer_notified` column exists on the `orders` table
 * for duplicate notification prevention.
 */
let orderNotifiedColumnChecked = false;
export async function ensureOrderNotifiedColumn() {
  if (orderNotifiedColumnChecked) return;
  try {
    const { sql } = await import("@/lib/db/neon");
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS whatsapp_customer_notified INT DEFAULT 0;`;
    orderNotifiedColumnChecked = true;
  } catch (err) {
    console.warn("[WhatsApp Service] Order notified column ensure warning:", err);
  }
}

/**
 * Marks order as notified in Neon PostgreSQL to prevent duplicate notifications
 */
export async function markOrderNotified(orderId: string) {
  try {
    const cleanId = String(orderId || "").replace(/^#+/, "");
    const { sql } = await import("@/lib/db/neon");
    await sql`
      UPDATE orders 
      SET whatsapp_customer_notified = 1 
      WHERE id = ${cleanId} OR id = ${"#" + cleanId}
    `;
  } catch (err) {
    console.warn("[WhatsApp Service] Could not update whatsapp_customer_notified status:", err);
  }
}

/**
 * Retrieves full order details from Neon PostgreSQL by order ID for notification dispatches
 */
export async function fetchOrderForNotification(orderId: string): Promise<{
  adminPayload: OrderNotificationPayload;
  customerPayload: CustomerOrderNotificationPayload;
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

    return { adminPayload, customerPayload };
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

  // Build body (Template or Text)
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

  // Timeout handler with AbortController (12 seconds)
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
 */
export async function sendWhatsAppToOwner(
  payload: OrderNotificationPayload
): Promise<WhatsAppSendResult> {
  const adminNumber =
    process.env.ADMIN_WHATSAPP_NUMBER?.trim() ||
    process.env.WHATSAPP_OWNER_PHONE?.trim() ||
    "919447446008";

  const targetPhone = normalizeWhatsAppNumber(adminNumber);
  const messageText = buildOrderWhatsAppMessage(payload);

  return await sendGenericWhatsAppMessage({
    to: targetPhone,
    message: messageText,
  });
}

/**
 * Sends automated WhatsApp order confirmation to the customer upon successful order placement
 * or payment confirmation.
 * 
 * Features:
 * - Duplicate event prevention (tracks whatsapp_customer_notified in Neon PostgreSQL)
 * - Meta WhatsApp Template API support (when WHATSAPP_ORDER_TEMPLATE_NAME is configured)
 * - Graceful fallback to rich text messaging & direct wa.me link
 * - Safe phone number normalization for Indian (+91) and international numbers
 */
export async function sendCustomerOrderNotification(
  payload: CustomerOrderNotificationPayload
): Promise<CustomerNotificationResult> {
  const cleanOrderId = String(payload.orderId || "").replace(/^#+/, "");
  const rawCustomerPhone = (payload.customerPhone || "").trim();

  // Validate phone number
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

  // 1. Duplicate check in database
  try {
    await ensureOrderNotifiedColumn();
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

  const templateName = process.env.WHATSAPP_ORDER_TEMPLATE_NAME?.trim();
  let result: WhatsAppSendResult;

  // If a template is configured, attempt sending template
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

    // If template send failed, retry with direct formatted text message
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
    // Direct formatted text message
    result = await sendGenericWhatsAppMessage({
      to: targetPhone,
      message: messageText,
    });
  }

  if (result.success && result.provider === "meta_cloud_api") {
    // Mark order as notified in Neon PostgreSQL
    await markOrderNotified(cleanOrderId);
  }

  return result;
}
