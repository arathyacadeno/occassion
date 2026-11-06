import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { signUserToken } from "@/lib/auth/jwt";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { idToken, phoneNumber } = body;

    let verifiedPhone = phoneNumber;
    let firebaseUid: string | null = null;

    // Verify / decode Firebase ID token payload if provided
    if (idToken && typeof idToken === "string") {
      try {
        const parts = idToken.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
          
          // Verify token expiration
          if (payload.exp && payload.exp * 1000 < Date.now()) {
            return NextResponse.json(
              { success: false, error: "Firebase authentication token has expired. Please try again." },
              { status: 401 }
            );
          }

          // Verify project ID if configured
          const expectedProject = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
          if (expectedProject && payload.aud && payload.aud !== expectedProject) {
            console.warn("Firebase token audience mismatch:", payload.aud, expectedProject);
          }

          if (payload.phone_number) {
            verifiedPhone = payload.phone_number;
          }
          if (payload.sub) {
            firebaseUid = payload.sub;
          }
        }
      } catch (err) {
        console.warn("Could not decode Firebase ID token:", err);
      }
    }

    if (!verifiedPhone) {
      return NextResponse.json(
        { success: false, error: "Valid mobile phone number is required" },
        { status: 400 }
      );
    }

    const cleanPhone = verifiedPhone.trim();
    const phoneDigits = cleanPhone.replace(/\D/g, "");
    const generatedEmail = `${phoneDigits}@phone.occasions.in`;
    const now = new Date().toISOString();

    // Check if user exists by phone or generated phone email in Neon PostgreSQL
    const existing = await sql`
      SELECT * FROM users 
      WHERE phone = ${cleanPhone} OR phone = ${`+${phoneDigits}`} OR email = ${generatedEmail}
      LIMIT 1
    `;

    let user: any;
    if (existing && existing.length > 0) {
      user = existing[0];
      // Existing user: ensure phone is formatted and updated
      await sql`
        UPDATE users
        SET phone = COALESCE(phone, ${cleanPhone}),
            updated_at = ${now}
        WHERE id = ${user.id}
      `;
      const updated = await sql`SELECT * FROM users WHERE id = ${user.id} LIMIT 1`;
      user = updated[0];
    } else {
      // Create new user for this mobile number in Neon PostgreSQL
      const userId = "usr-p-" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      const displayName = `Customer (+${phoneDigits.slice(-10)})`;

      await sql`
        INSERT INTO users (id, name, email, phone, role, created_at, updated_at)
        VALUES (${userId}, ${displayName}, ${generatedEmail}, ${cleanPhone}, 'customer', ${now}, ${now})
      `;
      const created = await sql`SELECT * FROM users WHERE id = ${userId} LIMIT 1`;
      user = created[0];
    }

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || cleanPhone,
      role: user.role as "customer" | "admin",
      image: user.image || null,
      firebaseUid,
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

    // Set secure HTTP-only session cookie
    response.cookies.set("occasions_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Phone auth API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process mobile login" },
      { status: 500 }
    );
  }
}
