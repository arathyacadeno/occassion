import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { signUserToken } from "@/lib/auth/jwt";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let email = body.email;
    let name = body.name;
    let image = body.image || body.picture;
    let googleId = body.googleId || body.sub;

    // If client sent Google JWT credential directly (from Google Identity Services)
    if (body.credential && typeof body.credential === "string") {
      try {
        const parts = body.credential.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
          email = payload.email || email;
          name = payload.name || name;
          image = payload.picture || image;
          googleId = payload.sub || googleId;
        }
      } catch (e) {
        console.warn("Could not decode credential JWT payload:", e);
      }
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Valid Google email is required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name || cleanEmail.split("@")[0]).trim();
    const cleanGoogleId = googleId ? String(googleId) : null;
    const cleanImage = image || null;
    const now = new Date().toISOString();

    // Check if user already exists in Neon PostgreSQL
    const existing = await sql`
      SELECT * FROM users WHERE LOWER(email) = ${cleanEmail} LIMIT 1
    `;

    let user: any;
    if (existing && existing.length > 0) {
      user = existing[0];
      // Existing user: Link Google ID / image if not set
      await sql`
        UPDATE users
        SET google_id = COALESCE(google_id, ${cleanGoogleId}),
            image = COALESCE(${cleanImage}, image),
            updated_at = ${now}
        WHERE id = ${user.id}
      `;
      const updated = await sql`SELECT * FROM users WHERE id = ${user.id} LIMIT 1`;
      user = updated[0];
    } else {
      // New user: Automatic account creation in Neon PostgreSQL
      const userId = "usr-g-" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      await sql`
        INSERT INTO users (id, name, email, phone, google_id, image, role, created_at, updated_at)
        VALUES (${userId}, ${cleanName}, ${cleanEmail}, '', ${cleanGoogleId}, ${cleanImage}, 'customer', ${now}, ${now})
      `;
      const created = await sql`SELECT * FROM users WHERE id = ${userId} LIMIT 1`;
      user = created[0];
    }

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role as "customer" | "admin",
      image: user.image || null,
    };

    const token = signUserToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      message: "Successfully signed in with Google",
      user: userData,
      token,
    });

    response.cookies.set("occasions_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Google Auth error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to authenticate with Google" },
      { status: 500 }
    );
  }
}
