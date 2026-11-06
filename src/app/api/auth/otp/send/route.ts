import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { sendFast2SmsOtp } from "@/lib/sms/fast2sms";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phoneNumber = body.phoneNumber || body.phone;

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, error: "Mobile number is required." },
        { status: 400 }
      );
    }

    const cleanPhone = phoneNumber.replace(/\D/g, "").slice(-10);

    if (cleanPhone.length !== 10) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    // Generate 6-digit random OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    const now = new Date().toISOString();

    // Store in Neon PostgreSQL phone_otps table
    await sql`
      INSERT INTO phone_otps (phone, otp, expires_at, created_at)
      VALUES (${cleanPhone}, ${otp}, ${expiresAt}, ${now})
      ON CONFLICT (phone) DO UPDATE
      SET otp = EXCLUDED.otp,
          expires_at = EXCLUDED.expires_at,
          created_at = EXCLUDED.created_at
    `;

    // Send SMS via Fast2SMS
    const smsResult = await sendFast2SmsOtp(cleanPhone, otp);

    if (!smsResult.success) {
      return NextResponse.json(
        { success: false, error: smsResult.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: smsResult.message,
      phoneNumber: `+91 ${cleanPhone}`,
    });
  } catch (error: any) {
    console.error("OTP send error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send OTP. Please try again." },
      { status: 500 }
    );
  }
}
