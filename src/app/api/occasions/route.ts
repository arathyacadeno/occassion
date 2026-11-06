import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { getAuthenticatedUser } from "@/lib/auth/jwt";

export async function GET() {
  try {
    const occasions = await sql`SELECT * FROM occasions ORDER BY name ASC`;
    return NextResponse.json({ success: true, occasions: occasions || [] });
  } catch (error: any) {
    console.error("Occasions fetch error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch occasions" }, { status: 500 });
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

    const id = "occ-" + slug.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    await sql`
      INSERT INTO occasions (id, name, slug)
      VALUES (${id}, ${name}, ${slug})
      ON CONFLICT (id) DO NOTHING
    `;

    return NextResponse.json({ success: true, occasion: { id, name, slug } });
  } catch (error: any) {
    console.error("Occasion creation error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to create occasion" }, { status: 500 });
  }
}
