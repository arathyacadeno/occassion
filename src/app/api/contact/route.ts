import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { sendContactNotification } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Please provide your full name" },
        { status: 400 }
      );
    }

    if (!email || !email.trim() || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, error: "Please enter your message" },
        { status: 400 }
      );
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone ? phone.trim() : null;
    const cleanSubject = subject ? subject.trim() : "General Inquiry";
    const cleanMessage = message.trim();

    // 1. Persist inquiry into Neon PostgreSQL database
    const inquiryId = "inq-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);
    const createdAt = new Date().toISOString();

    await sql`
      INSERT INTO contact_inquiries (id, name, email, phone, subject, message, created_at)
      VALUES (${inquiryId}, ${cleanName}, ${cleanEmail}, ${cleanPhone}, ${cleanSubject}, ${cleanMessage}, ${createdAt})
    `;

    // 2. Dispatch email notification to owner (occassions.flowers@gmail.com)
    try {
      await sendContactNotification({
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        subject: cleanSubject,
        message: cleanMessage,
      });
    } catch (emailErr) {
      console.error("Error dispatching contact email:", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: "Thank you for reaching out! Our floral team in Calicut has received your message and will respond shortly.",
    });
  } catch (error: any) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process message" },
      { status: 500 }
    );
  }
}
