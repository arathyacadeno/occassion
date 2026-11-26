import { NextRequest, NextResponse } from "next/server";
import { sendGenericWhatsAppMessage, maskPhoneInLog } from "@/lib/whatsapp/service";

export const dynamic = "force-dynamic";

/**
 * POST /api/whatsapp/send
 * Sends an outbound WhatsApp message (text or template) using Meta WhatsApp Cloud API.
 * 
 * Body:
 * {
 *   "to": "918606464700",
 *   "message": "Hello from Occasions Flowers!",
 *   "template": { "name": "hello_world", "language": "en_US" } // optional
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { to, message, template } = body;

    if (!to || typeof to !== "string" || to.replace(/\D/g, "").length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: "Recipient phone number ('to') is required and must contain at least 10 digits.",
        },
        { status: 400 }
      );
    }

    if (!message && !template) {
      return NextResponse.json(
        {
          success: false,
          error: "Either a text 'message' or a 'template' object must be provided.",
        },
        { status: 400 }
      );
    }

    const result = await sendGenericWhatsAppMessage({
      to,
      message: message ? String(message) : undefined,
      template: template && typeof template === "object" ? template : undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          provider: result.provider,
          error: result.error || "Failed to send WhatsApp message",
          whatsappUrl: result.whatsappUrl,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      provider: result.provider,
      messageId: result.messageId,
      whatsappUrl: result.whatsappUrl,
      recipient: maskPhoneInLog(to),
      message: "WhatsApp message dispatched successfully",
    });
  } catch (err: any) {
    console.error("[POST /api/whatsapp/send error]:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Internal server error dispatching WhatsApp message",
      },
      { status: 500 }
    );
  }
}
