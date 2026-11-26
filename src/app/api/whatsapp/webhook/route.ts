import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { maskPhoneInLog } from "@/lib/whatsapp/service";

export const dynamic = "force-dynamic";

/**
 * Validates Meta's HMAC-SHA256 signature from x-hub-signature-256 header
 */
function verifyMetaSignature(
  rawBody: string,
  signatureHeader: string | null,
  appSecret: string
): boolean {
  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) {
    return false;
  }
  const signatureHash = signatureHeader.slice(7).trim();
  const expectedHash = crypto
    .createHmac("sha256", appSecret)
    .update(rawBody)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signatureHash, "utf-8"),
      Buffer.from(expectedHash, "utf-8")
    );
  } catch {
    return false;
  }
}

/**
 * GET /api/whatsapp/webhook
 * Handles Meta Webhook verification handshake (hub.mode, hub.verify_token, hub.challenge).
 * Configured in Meta App Dashboard > WhatsApp > Configuration > Callback URL
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token")?.trim();
    const challenge = searchParams.get("hub.challenge");

    // Accept tokens configured in environment or generated secure tokens
    const validTokens = new Set(
      [
        process.env.WHATSAPP_VERIFY_TOKEN?.trim(),
        process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN?.trim(),
        "occasions_webhook_verify_secret_2026",
        "occ_wa_live_e2df067e6ac9e502b9ed63c2675b8af6",
      ].filter(Boolean) as string[]
    );

    if (mode === "subscribe" && token && validTokens.has(token)) {
      console.log("[WhatsApp Webhook] Verification successful. Handshake accepted.");
      return new Response(challenge || "OK", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    console.warn("[WhatsApp Webhook] Verification failed. Token mismatch or invalid mode.");
    return new Response("Forbidden: Invalid verification token", { status: 403 });
  } catch (err: any) {
    console.error("[GET /api/whatsapp/webhook error]:", err);
    return new Response("Internal server error during webhook verification", { status: 500 });
  }
}

/**
 * POST /api/whatsapp/webhook
 * Receives WhatsApp webhook events from Meta (messages, delivery status updates, read receipts).
 * Validates HMAC-SHA256 signature when META_APP_SECRET is configured.
 */
export async function POST(req: NextRequest) {
  try {
    const rawText = await req.text();
    const appSecret = process.env.META_APP_SECRET?.trim();

    // Verify Meta webhook signature if META_APP_SECRET is set
    if (appSecret) {
      const signatureHeader = req.headers.get("x-hub-signature-256");
      const isValid = verifyMetaSignature(rawText, signatureHeader, appSecret);
      if (!isValid) {
        console.warn("[WhatsApp Webhook] Invalid HMAC-SHA256 signature rejected.");
        return new Response("Forbidden: Invalid signature", { status: 401 });
      }
    }

    let rawBody: any = {};
    try {
      rawBody = JSON.parse(rawText || "{}");
    } catch {
      rawBody = {};
    }

    // Meta sends { object: "whatsapp_business_account", entry: [...] }
    if (rawBody.object === "whatsapp_business_account") {
      const entries = Array.isArray(rawBody.entry) ? rawBody.entry : [];

      for (const entry of entries) {
        const changes = Array.isArray(entry.changes) ? entry.changes : [];
        for (const change of changes) {
          const value = change.value;
          if (!value) continue;

          // 1. Process Message Status Updates (sent, delivered, read, failed)
          if (Array.isArray(value.statuses)) {
            for (const status of value.statuses) {
              const recipientId = maskPhoneInLog(status.recipient_id);
              const messageStatus = status.status;
              const timestamp = status.timestamp;
              const msgId = status.id;

              console.log(
                `[WhatsApp Webhook Status] Message ${msgId} -> ${recipientId}: status="${messageStatus}" at ${timestamp}`
              );

              // Update order delivery status in Neon PostgreSQL
              try {
                const { sql } = await import("@/lib/db/neon");
                const statusDate = timestamp
                  ? new Date(Number(timestamp) * 1000).toISOString()
                  : new Date().toISOString();

                const errorMsg =
                  status.errors && status.errors.length > 0
                    ? JSON.stringify(status.errors[0])
                    : null;

                await sql`
                  UPDATE orders
                  SET 
                    whatsapp_status = ${messageStatus},
                    whatsapp_last_status_at = ${statusDate},
                    whatsapp_last_error = COALESCE(${errorMsg}, whatsapp_last_error)
                  WHERE whatsapp_message_id = ${msgId}
                `;
              } catch (dbErr) {
                console.warn("[WhatsApp Webhook] DB update status notice:", dbErr);
              }

              if (status.errors && status.errors.length > 0) {
                console.warn(
                  `[WhatsApp Webhook Status Error] Message ${status.id} error:`,
                  status.errors
                );
              }
            }
          }

          // 2. Process Inbound Messages (customer replies)
          if (Array.isArray(value.messages)) {
            for (const msg of value.messages) {
              const sender = maskPhoneInLog(msg.from);
              const msgType = msg.type;
              const textBody = msg.text?.body || `[${msgType}]`;
              console.log(`[WhatsApp Inbound Message] From ${sender}: "${textBody}"`);
            }
          }
        }
      }

      // Return 200 OK immediately so Meta does not retry
      return NextResponse.json({ status: "EVENT_RECEIVED" }, { status: 200 });
    }

    return NextResponse.json({ status: "IGNORED" }, { status: 404 });
  } catch (err: any) {
    console.error("[POST /api/whatsapp/webhook error]:", err);
    return NextResponse.json({ status: "ERROR_LOGGED" }, { status: 200 });
  }
}
