import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth/jwt";

export async function GET() {
  try {
    const db = getDb();
    const categories = db.prepare("SELECT * FROM categories ORDER BY name ASC").all();
    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    console.error("Categories fetch error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = getAuthenticatedUser(request);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { name, slug, description, image } = body;

    if (!name || !slug) {
      return NextResponse.json({ success: false, error: "Name and slug are required" }, { status: 400 });
    }

    const id = "cat-" + slug.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const db = getDb();

    db.prepare(`
      INSERT INTO categories (id, name, slug, description, image)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, name, slug, description || "", image || "");

    return NextResponse.json({ success: true, category: { id, name, slug, description, image } });
  } catch (error: any) {
    console.error("Category creation error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to create category" }, { status: 500 });
  }
}
