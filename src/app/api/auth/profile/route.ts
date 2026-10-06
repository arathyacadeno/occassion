import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthenticatedUser, comparePassword, hashPassword } from "@/lib/auth/jwt";

export async function GET(request: Request) {
  try {
    const auth = getAuthenticatedUser(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const user = db.prepare(`
      SELECT id, name, email, phone, role, image, google_id, created_at
      FROM users
      WHERE id = ?
    `).get(auth.userId);

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Get order count and saved addresses count
    const ordersCount = db.prepare("SELECT count(*) as count FROM orders WHERE user_id = ?").get(user.id)?.count || 0;
    const addressCount = db.prepare("SELECT count(*) as count FROM addresses WHERE user_id = ?").get(user.id)?.count || 0;

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        image: user.image || null,
        isGoogleUser: !!user.google_id,
        createdAt: user.created_at,
        stats: {
          ordersCount,
          addressCount,
        },
      },
    });
  } catch (error: any) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const auth = getAuthenticatedUser(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, image, currentPassword, newPassword } = body;
    const db = getDb();
    const now = new Date().toISOString();

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(auth.userId);
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Handle password change if requested
    let passwordHash = user.password_hash;
    if (newPassword) {
      if (!user.password_hash) {
        return NextResponse.json(
          { success: false, error: "Accounts registered via Google do not have a password." },
          { status: 400 }
        );
      }
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, error: "Current password is required to change your password." },
          { status: 400 }
        );
      }
      const isMatch = await comparePassword(currentPassword, user.password_hash);
      if (!isMatch) {
        return NextResponse.json({ success: false, error: "Incorrect current password" }, { status: 400 });
      }
      if (newPassword.length < 6) {
        return NextResponse.json({ success: false, error: "New password must be at least 6 characters" }, { status: 400 });
      }
      passwordHash = await hashPassword(newPassword);
    }

    const updatedName = name ? name.trim() : user.name;
    const updatedPhone = phone !== undefined ? phone.trim() : user.phone;
    const updatedImage = image !== undefined ? image : user.image;

    db.prepare(`
      UPDATE users
      SET name = ?, phone = ?, image = ?, password_hash = ?, updated_at = ?
      WHERE id = ?
    `).run(updatedName, updatedPhone, updatedImage, passwordHash, now, user.id);

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user.id,
        name: updatedName,
        email: user.email,
        phone: updatedPhone,
        image: updatedImage,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update profile" }, { status: 500 });
  }
}
