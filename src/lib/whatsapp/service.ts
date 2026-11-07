/**
 * WhatsApp Business Notification Service
 * Integrates Meta / Facebook WhatsApp Cloud API to send automated order confirmation
 * messages to the store owner's WhatsApp number (default: 9447446008 / +91 9447446008).
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

export interface WhatsAppSendResult {
  success: boolean;
  provider: "meta_cloud_api" | "direct_link";
  messageId?: string;
  whatsappUrl: string;
  messageText: string;
  error?: string;
  rawResponse?: any;
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
 * Formats a comprehensive, professional WhatsApp order confirmation message
 * including prices, delivery location, customer contact details, and item breakdown.
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
      : "1. Standard Floral Arrangement";

  // Location string parts
  const addressLines: string[] = [];
  if (data.receiverName) addressLines.push(`• *Recipient Name:* ${data.receiverName}`);
  if (data.receiverPhone) addressLines.push(`• *Recipient Phone:* ${data.receiverPhone}`);
  if (data.houseBuilding) addressLines.push(`• *House / Flat:* ${data.houseBuilding}`);
  if (data.street) addressLines.push(`• *Street / Area:* ${data.street}`);
  if (data.landmark) addressLines.push(`• *Landmark:* ${data.landmark}`);
  addressLines.push(`• *City & State:* ${data.city || "Kozhikode (Calicut)"}, ${data.state || "Kerala"}`);
  addressLines.push(`• *PIN Code:* ${data.pinCode || "673602"}`);

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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://occasions.com";

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
 * Sends order confirmation message to owner business WhatsApp (9447446008).
 * Uses Meta WhatsApp Cloud API if configured in .env, with automatic wa.me deep-link generation.
 */
export async function sendWhatsAppToOwner(
  payload: OrderNotificationPayload
): Promise<WhatsAppSendResult> {
  const targetPhone = normalizeWhatsAppNumber(
    process.env.WHATSAPP_OWNER_PHONE || "919447446008"
  );
  const messageText = buildOrderWhatsAppMessage(payload);
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(
    messageText
  )}`;

  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  const apiVersion = process.env.WHATSAPP_API_VERSION?.trim() || "v21.0";

  // If Meta Cloud API credentials are not set, return graceful fallback with wa.me URL
  if (!phoneNumberId || !accessToken) {
    console.info(
      `[WhatsApp] Meta Cloud API credentials not configured in .env. Pre-generated direct WhatsApp URL for owner (${targetPhone}):`,
      whatsappUrl
    );
    return {
      success: true,
      provider: "direct_link",
      whatsappUrl,
      messageText,
    };
  }

  // Send via Meta / Facebook WhatsApp Cloud API
  const metaApiEndpoint = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

  try {
    const res = await fetch(metaApiEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: targetPhone,
        type: "text",
        text: {
          preview_url: false,
          body: messageText,
        },
      }),
    });

    const resJson = await res.json();

    if (!res.ok || resJson.error) {
      console.error("[WhatsApp Cloud API Error]:", resJson);
      return {
        success: false,
        provider: "meta_cloud_api",
        whatsappUrl,
        messageText,
        error: resJson.error?.message || "Failed to send message via WhatsApp Cloud API",
        rawResponse: resJson,
      };
    }

    const messageId = resJson.messages?.[0]?.id;
    console.log(
      `[WhatsApp] Successfully sent order #${payload.orderId} notification to owner (${targetPhone}). Message ID:`,
      messageId
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
    console.error("[WhatsApp Send Exception]:", err);
    return {
      success: false,
      provider: "meta_cloud_api",
      whatsappUrl,
      messageText,
      error: err.message || "Network exception sending WhatsApp message",
    };
  }
}

/**
 * Customer Order Notification Payload
 */
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
}

export interface CustomerNotificationResult extends WhatsAppSendResult {
  alreadySent?: boolean;
}

/**
 * Helper to mask sensitive phone numbers in logs
 */
function maskPhoneInLog(phone?: string): string {
  if (!phone) return "unknown";
  const str = String(phone);
  if (str.length <= 4) return "****";
  return str.slice(0, 2) + "*".repeat(Math.max(1, str.length - 6)) + str.slice(-4);
}

/**
 * Ensures the `whatsapp_customer_notified` column exists on the `orders` table
 * for duplicate notification prevention.
 */
let orderNotifiedColumnChecked = false;
async function ensureOrderNotifiedColumn() {
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
 * Formats a clean, high-conversion WhatsApp confirmation message for the customer.
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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://occassion.vercel.app";
  const deliveryInfo = data.deliveryDate
    ? `📅 *Delivery Date:* ${data.deliveryDate}${data.deliveryTime ? ` (${data.deliveryTime})` : ""}\n`
    : "";

  return `🌸 *ORDER CONFIRMATION — OCCASIONS FLORIST* 🌸

Dear *${data.customerName || "Valued Customer"}*,
Thank you for ordering with *Occasions – Do it with flowers*! We have received your celebration order.

📦 *Order ID:* #${cleanOrderId}
📊 *Order Status:* *${statusDisplay}*
💳 *Payment:* *${isPaid ? "✅ Paid Online" : "⏳ Cash on Delivery (COD)"}*
💰 *Total Amount:* ₹${data.finalAmount.toLocaleString("en-IN")}
${deliveryInfo}
🛒 *ORDERED ITEMS:*
${itemsList}

📍 *Live Order Tracking:*
${appUrl}/track-order?id=${cleanOrderId}

📞 *Need Assistance or Custom Requests?*
Reply directly to this WhatsApp message or call our Calicut atelier at +91 8606464700.

_Occasions Florist & Celebration Atelier — Mavoor Road, Calicut_`;
}

/**
 * Sends automated WhatsApp order confirmation to the customer upon successful order placement
 * or payment confirmation.
 * 
 * Features:
 * - Duplicate event prevention (tracks whatsapp_customer_notified in Neon PostgreSQL)
 * - Meta WhatsApp Template API support (when WHATSAPP_ORDER_TEMPLATE_NAME is defined)
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
    console.warn(`[WhatsApp Customer] No valid phone number for order #${cleanOrderId}. Skipping customer WhatsApp.`);
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

  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  const apiVersion = process.env.WHATSAPP_API_VERSION?.trim() || "v21.0";
  const templateName = process.env.WHATSAPP_ORDER_TEMPLATE_NAME?.trim();

  // If Cloud API credentials are not set, return direct link fallback
  if (!phoneNumberId || !accessToken) {
    console.info(
      `[WhatsApp Customer] Cloud API credentials not set. Direct customer WhatsApp link generated for ${maskPhoneInLog(targetPhone)}:`,
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

  try {
    let requestBody: any;

    // Use approved template if configured in environment
    if (templateName) {
      const itemsSummary = (payload.items || [])
        .map((it) => `${it.name} (x${it.quantity})`)
        .join(", ")
        .slice(0, 100);

      requestBody = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: targetPhone,
        type: "template",
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
      };
    } else {
      // Direct formatted text message
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

    const res = await fetch(metaApiEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const resJson = await res.json();

    // If template send failed, try graceful fallback to text message
    if (!res.ok && templateName && resJson.error) {
      console.warn(
        `[WhatsApp Customer] Template "${templateName}" failed (${resJson.error.message}). Retrying with formatted text message.`
      );
      const textFallbackRes = await fetch(metaApiEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: targetPhone,
          type: "text",
          text: {
            preview_url: true,
            body: messageText,
          },
        }),
      });
      const fallbackJson = await textFallbackRes.json();
      if (textFallbackRes.ok && !fallbackJson.error) {
        const msgId = fallbackJson.messages?.[0]?.id;
        await markOrderNotified(cleanOrderId);
        console.log(
          `[WhatsApp Customer] Notification sent via text fallback to ${maskPhoneInLog(targetPhone)}. Message ID: ${msgId}`
        );
        return {
          success: true,
          provider: "meta_cloud_api",
          messageId: msgId,
          whatsappUrl,
          messageText,
          rawResponse: fallbackJson,
        };
      }
    }

    if (!res.ok || resJson.error) {
      console.error("[WhatsApp Customer Cloud API Error]:", resJson.error || resJson);
      return {
        success: false,
        provider: "meta_cloud_api",
        whatsappUrl,
        messageText,
        error: resJson.error?.message || "Failed to dispatch customer notification via WhatsApp Cloud API",
        rawResponse: resJson,
      };
    }

    const messageId = resJson.messages?.[0]?.id;
    console.log(
      `[WhatsApp Customer] Successfully dispatched order #${cleanOrderId} confirmation to customer (${maskPhoneInLog(targetPhone)}). Message ID:`,
      messageId
    );

    // Mark order as notified in Neon PostgreSQL to prevent future duplicates
    await markOrderNotified(cleanOrderId);

    return {
      success: true,
      provider: "meta_cloud_api",
      messageId,
      whatsappUrl,
      messageText,
      rawResponse: resJson,
    };
  } catch (err: any) {
    console.error("[WhatsApp Customer Exception]:", err);
    return {
      success: false,
      provider: "meta_cloud_api",
      whatsappUrl,
      messageText,
      error: err.message || "Network exception sending customer WhatsApp notification",
    };
  }
}

async function markOrderNotified(orderId: string) {
  try {
    const { sql } = await import("@/lib/db/neon");
    await sql`
      UPDATE orders 
      SET whatsapp_customer_notified = 1 
      WHERE id = ${orderId} OR id = ${"#" + orderId}
    `;
  } catch (err) {
    console.warn("[WhatsApp Service] Could not update whatsapp_customer_notified status:", err);
  }
}
