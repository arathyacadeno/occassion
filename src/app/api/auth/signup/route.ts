import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { hashPassword, signUserToken } from "@/lib/auth/jwt";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, password, confirmPassword } = body;

    // 1. Validation
    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: "Full Name is required" }, { status: 400 });
    }
    if (!email || !email.includes("@")) {
      return NextResponse.json({ success: false, error: "A valid email address is required" }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ success: false, error: "Password must be at least 6 characters long" }, { status: 400 });
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return NextResponse.json({ success: false, error: "Passwords do not match" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanPhone = (phone || "").trim();

    // 2. Check if user already exists in Neon PostgreSQL
    const existing = await sql`
      SELECT id FROM users WHERE LOWER(email) = ${cleanEmail} LIMIT 1
    `;
    if (existing && existing.length > 0) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists. Please sign in." },
        { status: 409 }
      );
    }

    // 3. Create user in Neon PostgreSQL
    const userId = "usr-" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();

    await sql`
      INSERT INTO users (id, name, email, phone, password_hash, role, created_at, updated_at)
      VALUES (${userId}, ${cleanName}, ${cleanEmail}, ${cleanPhone}, ${passwordHash}, 'customer', ${now}, ${now})
    `;

    const user = {
      id: userId,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      role: "customer" as const,
    };

    const token = signUserToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        user,
        token,
      },
      { status: 201 }
    );

    // Set cookie for automatic session persistence
    response.cookies.set("occasions_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create account" },
      { status: 500 }
    );
  }
}
