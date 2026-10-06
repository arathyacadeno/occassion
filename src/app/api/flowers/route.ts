import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth/jwt";

export async function GET() {
  try {
    const db = getDb();
    const flowers = db.prepare("SELECT * FROM flower_types ORDER BY name ASC").all();
    return NextResponse.json({ success: true, flowers });
  } catch (error: any) {
    console.error("Flower types fetch error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch flower types" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = getAuthenticatedUser(request);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { name, slug } = body;

    if (!name || !slug) {
      return NextResponse.json({ success: false, error: "Name and slug are required" }, { status: 400 });
    }

    const id = "ft-" + slug.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const db = getDb();

    db.prepare(`
      INSERT INTO flower_types (id, name, slug)
      VALUES (?, ?, ?)
    `).run(id, name, slug);

    return NextResponse.json({ success: true, flowerType: { id, name, slug } });
  } catch (error: any) {
    console.error("Flower type creation error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to create flower type" }, { status: 500 });
  }
}
