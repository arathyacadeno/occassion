import { NextRequest, NextResponse } from "next/server";
import { maskPhoneInLog } from "@/lib/whatsapp/service";

export const dynamic = "force-dynamic";

/**
 * GET /api/whatsapp/webhook
 * Handles Meta Webhook verification handshake (hub.mode, hub.verify_token, hub.challenge).
 * Configured in Meta App Dashboard > WhatsApp > Configuration > Callback URL
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    const expectedToken =
      process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN?.trim() ||
      process.env.WHATSAPP_VERIFY_TOKEN?.trim();

    if (!expectedToken) {
      console.warn("[WhatsApp Webhook] No WHATSAPP_WEBHOOK_VERIFY_TOKEN configured in environment.");
      return new Response("Webhook verification token not configured on server", { status: 500 });
    }

    if (mode === "subscribe" && token === expectedToken) {
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
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => ({}));

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
              console.log(
                `[WhatsApp Webhook Status] Message ${status.id} -> ${recipientId}: status="${messageStatus}" at ${timestamp}`
              );

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

    // Unrecognized object
    return NextResponse.json({ status: "IGNORED" }, { status: 404 });
  } catch (err: any) {
    console.error("[POST /api/whatsapp/webhook error]:", err);
    // Return 200 even on unparseable format to satisfy Meta webhook contract
    return NextResponse.json({ status: "ERROR_LOGGED" }, { status: 200 });
  }
}
