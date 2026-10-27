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
• Delivery Fee: ${data.deliveryCharge === 0 ? "FREE" : `₹${data.deliveryCharge.toLocaleString("en-IN")}`}
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
