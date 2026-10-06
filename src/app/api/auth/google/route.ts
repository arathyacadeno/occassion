import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
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

    const db = getDb();
    const now = new Date().toISOString();

    // Check if user already exists
    let user = db.prepare("SELECT * FROM users WHERE email = ?").get(cleanEmail);

    if (user) {
      // Existing user: Link Google ID / image if not set
      db.prepare(`
        UPDATE users
        SET google_id = COALESCE(google_id, ?),
            image = COALESCE(?, image),
            updated_at = ?
        WHERE id = ?
      `).run(cleanGoogleId, cleanImage, now, user.id);

      user = db.prepare("SELECT * FROM users WHERE id = ?").get(user.id);
    } else {
      // New user: Automatic account creation
      const userId = "usr-g-" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      db.prepare(`
        INSERT INTO users (id, name, email, phone, google_id, image, role, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 'customer', ?, ?)
      `).run(userId, cleanName, cleanEmail, "", cleanGoogleId, cleanImage, now, now);

      user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
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
