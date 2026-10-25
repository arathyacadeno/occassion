import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
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

    // 1. Persist inquiry into database
    try {
      const db = getDb();
      db.exec(`
        CREATE TABLE IF NOT EXISTS contact_inquiries (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT,
          subject TEXT,
          message TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
      `);

      const inquiryId = "inq-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);
      const createdAt = new Date().toISOString();

      const stmt = db.prepare(`
        INSERT INTO contact_inquiries (id, name, email, phone, subject, message, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(inquiryId, cleanName, cleanEmail, cleanPhone, cleanSubject, cleanMessage, createdAt);
    } catch (dbErr) {
      console.warn("Could not save inquiry to local DB (continuing gracefully):", dbErr);
    }

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
