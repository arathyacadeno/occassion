import { NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/**
 * In-memory deduplication cache for WhatsApp webhook events.
 * Retains event IDs for 10 minutes to prevent duplicate processing on Meta retries.
 */
const processedEventIds = new Map<string, number>();
const EVENT_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function isDuplicateEvent(id: string): boolean {
  if (!id) return false;
  const now = Date.now();

  // Housekeeping: purge entries older than TTL if map exceeds 2,000 items
  if (processedEventIds.size > 2000) {
    for (const [key, timestamp] of processedEventIds.entries()) {
      if (now - timestamp > EVENT_CACHE_TTL_MS) {
        processedEventIds.delete(key);
      }
    }
  }

  if (processedEventIds.has(id)) {
    return true;
  }
  processedEventIds.set(id, now);
  return false;
}

/**
 * Validates Meta's SHA-256 HMAC webhook signature.
 * Header format: "sha256=<hex_digest>"
 */
function verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  const appSecret = process.env.META_APP_SECRET?.trim();

  // If META_APP_SECRET is not configured in local development, warn but allow
  if (!appSecret) {
    if (process.env.NODE_ENV === "production") {
      console.error("[WhatsApp Webhook] META_APP_SECRET is missing in production. Rejecting unverified request.");
      return false;
    }
    console.warn("[WhatsApp Webhook] META_APP_SECRET is not set. Skipping signature verification in development.");
    return true;
  }

  if (!signatureHeader) {
    console.warn("[WhatsApp Webhook] Missing x-hub-signature-256 header.");
    return false;
  }

  const parts = signatureHeader.split("sha256=");
  const signatureHash = parts[1];
  if (!signatureHash) {
    return false;
  }

  try {
    const expectedHash = crypto
      .createHmac("sha256", appSecret)
      .update(rawBody, "utf8")
      .digest("hex");

    const sigBuf = Buffer.from(signatureHash, "hex");
    const expBuf = Buffer.from(expectedHash, "hex");

    if (sigBuf.length !== expBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(sigBuf, expBuf);
  } catch (err) {
    console.error("[WhatsApp Webhook] Error calculating HMAC signature:", err);
    return false;
  }
}

/**
 * Helper to mask sensitive phone numbers for privacy-compliant logging.
 * Example: '919447446008' -> '91******6008'
 */
function maskPhone(phone?: string): string {
  if (!phone) return "unknown";
  const str = String(phone);
  if (str.length <= 4) return "****";
  return str.slice(0, 2) + "*".repeat(Math.max(1, str.length - 6)) + str.slice(-4);
}

/**
 * GET /api/webhooks/whatsapp
 * Meta Webhook Verification Endpoint.
 * Meta hits this endpoint with:
 *   - hub.mode=subscribe
 *   - hub.verify_token=<token_configured_in_meta_dashboard>
 *   - hub.challenge=<random_string_from_meta>
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    const configuredToken = process.env.WHATSAPP_VERIFY_TOKEN?.trim();

    if (!configuredToken) {
      console.error("[WhatsApp Webhook GET] WHATSAPP_VERIFY_TOKEN is not configured in environment variables.");
      return new Response("Server configuration error: WHATSAPP_VERIFY_TOKEN not set", {
        status: 500,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    if (mode === "subscribe" && token === configuredToken) {
      console.log("[WhatsApp Webhook GET] Verification successful! Responding with challenge to Meta.");
      // Meta requires the challenge returned as RAW plain text with HTTP 200
      return new Response(challenge || "", {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    console.warn(
      `[WhatsApp Webhook GET] Verification failed. Mode: ${mode}, Token match: ${token === configuredToken}`
    );
    return new Response("Forbidden: Verification token mismatch", {
      status: 403,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error: any) {
    console.error("[WhatsApp Webhook GET Exception]:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

/**
 * POST /api/webhooks/whatsapp
 * Receives incoming WhatsApp messages, user interactions, and message delivery status updates.
 */
export async function POST(request: Request) {
  try {
    // 1. Read raw body as text for HMAC-SHA256 signature verification
    const rawBody = await request.text();
    const signatureHeader = request.headers.get("x-hub-signature-256");

    // 2. Validate signature
    const isValidSignature = verifyWebhookSignature(rawBody, signatureHeader);
    if (!isValidSignature) {
      console.warn("[WhatsApp Webhook POST] Invalid or missing HMAC signature.");
      return NextResponse.json(
        { success: false, error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    // 3. Parse JSON payload
    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch (parseErr) {
      console.warn("[WhatsApp Webhook POST] Received invalid JSON payload:", parseErr);
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    // Meta sends object: "whatsapp_business_account"
    if (body.object !== "whatsapp_business_account") {
      return NextResponse.json({ status: "ignored" }, { status: 200 });
    }

    // 4. Process each entry and changes
    if (Array.isArray(body.entry)) {
      for (const entry of body.entry) {
        const changes = entry.changes;
        if (!Array.isArray(changes)) continue;

        for (const change of changes) {
          if (change.field !== "messages") continue;

          const value = change.value;
          if (!value) continue;

          // A. Handle Message Delivery Statuses (sent, delivered, read, failed)
          if (Array.isArray(value.statuses)) {
            for (const status of value.statuses) {
              const statusKey = `status_${status.id}_${status.status}`;
              if (isDuplicateEvent(statusKey)) {
                continue;
              }

              const statusName = String(status.status).toLowerCase();
              const recipient = maskPhone(status.recipient_id);

              switch (statusName) {
                case "sent":
                  console.log(`[WhatsApp Status] Message ${status.id} SENT to ${recipient}`);
                  break;
                case "delivered":
                  console.log(`[WhatsApp Status] Message ${status.id} DELIVERED to ${recipient}`);
                  break;
                case "read":
                  console.log(`[WhatsApp Status] Message ${status.id} READ by ${recipient}`);
                  break;
                case "failed":
                  console.warn(
                    `[WhatsApp Status] Message ${status.id} FAILED for ${recipient}. Errors:`,
                    status.errors || "Unknown error"
                  );
                  break;
                default:
                  console.log(`[WhatsApp Status] Message ${status.id} status: ${statusName}`);
              }
            }
          }

          // B. Handle Incoming Messages from Customers
          if (Array.isArray(value.messages)) {
            for (const message of value.messages) {
              if (isDuplicateEvent(`msg_${message.id}`)) {
                continue;
              }

              const fromPhone = maskPhone(message.from);
              const messageType = message.type;

              if (messageType === "text" && message.text?.body) {
                const messageText = message.text.body.trim();
                console.log(
                  `[WhatsApp Incoming] Message from ${fromPhone} (ID: ${message.id}): "${messageText.slice(0, 50)}"`
                );
              } else {
                console.log(
                  `[WhatsApp Incoming] Received non-text message of type "${messageType}" from ${fromPhone}`
                );
              }
            }
          }
        }
      }
    }

    // 5. Always return HTTP 200 OK to Meta
    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error: any) {
    console.error("[WhatsApp Webhook POST Exception]:", error);
    // Return 200 even on unexpected error to prevent Meta from disabling the webhook endpoint
    return NextResponse.json(
      { status: "error_handled", message: error?.message || "Internal error" },
      { status: 200 }
    );
  }
}

