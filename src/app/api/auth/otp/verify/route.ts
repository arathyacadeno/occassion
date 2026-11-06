import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { signUserToken } from "@/lib/auth/jwt";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phoneNumber = body.phoneNumber || body.phone;
    const { otp } = body;

    if (!phoneNumber || !otp) {
      return NextResponse.json(
        { success: false, error: "Mobile number and OTP are required." },
        { status: 400 }
      );
    }

    const cleanPhone = phoneNumber.replace(/\D/g, "").slice(-10);
    const cleanOtp = otp.toString().trim();

    if (cleanPhone.length !== 10) {
      return NextResponse.json(
        { success: false, error: "Invalid mobile number format." },
        { status: 400 }
      );
    }

    // Check OTP record in Neon PostgreSQL
    const otpRecords = await sql`
      SELECT * FROM phone_otps WHERE phone = ${cleanPhone} LIMIT 1
    `;
    const otpRecord = otpRecords[0];

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, error: "No active OTP request found. Please request a new OTP." },
        { status: 400 }
      );
    }

    // Check expiration
    if (Date.now() > Number(otpRecord.expires_at)) {
      await sql`DELETE FROM phone_otps WHERE phone = ${cleanPhone}`;
      return NextResponse.json(
        { success: false, error: "OTP has expired. Please click 'Resend OTP'." },
        { status: 400 }
      );
    }

    // Verify OTP code
    if (otpRecord.otp !== cleanOtp) {
      return NextResponse.json(
        { success: false, error: "Incorrect verification code. Please check and try again." },
        { status: 400 }
      );
    }

    // OTP is valid - delete from active OTPs
    await sql`DELETE FROM phone_otps WHERE phone = ${cleanPhone}`;

    const fullPhone = `+91${cleanPhone}`;
    const generatedEmail = `${cleanPhone}@phone.occasions.in`;
    const now = new Date().toISOString();

    // Check if user already exists in Neon PostgreSQL
    const existing = await sql`
      SELECT * FROM users 
      WHERE phone = ${fullPhone} OR phone = ${cleanPhone} OR phone = ${`+91 ${cleanPhone}`} OR email = ${generatedEmail}
      LIMIT 1
    `;

    let user: any;
    if (existing && existing.length > 0) {
      user = existing[0];
      // Existing user: ensure updated timestamp
      await sql`
        UPDATE users 
        SET phone = COALESCE(phone, ${fullPhone}),
            updated_at = ${now}
        WHERE id = ${user.id}
      `;
      const updated = await sql`SELECT * FROM users WHERE id = ${user.id} LIMIT 1`;
      user = updated[0];
    } else {
      // Create new customer account in Neon PostgreSQL
      const userId = "usr-p-" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      const displayName = `Customer (${cleanPhone})`;

      await sql`
        INSERT INTO users (id, name, email, phone, role, created_at, updated_at)
        VALUES (${userId}, ${displayName}, ${generatedEmail}, ${fullPhone}, 'customer', ${now}, ${now})
      `;
      const created = await sql`SELECT * FROM users WHERE id = ${userId} LIMIT 1`;
      user = created[0];
    }

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || fullPhone,
      role: user.role as "customer" | "admin",
      image: user.image || null,
    };

    const token = signUserToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "customer" | "admin",
    });

    const response = NextResponse.json({
      success: true,
      user: userData,
      token,
    });

    // Set secure HTTP-only cookie
    response.cookies.set("occasions_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to verify OTP. Please try again." },
      { status: 500 }
    );
  }
}
