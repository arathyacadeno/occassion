import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { getAuthenticatedUser } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

const ALL_OCCASIONS = [
  // 1. Current Standard Homepage Occasions (1 - 8)
  {
    id: "occ-birthday",
    name: "Birthday",
    slug: "birthday",
    image: "/images/occasion-birthday.jpg",
    href: "/flower-bouquets?occasion=birthday",
    whatsapp_message: "Hello Occassions Florist Calicut, I would like to order fresh flowers for a Birthday celebration.",
    active: 1,
    display_order: 1,
  },
  {
    id: "occ-anniversary",
    name: "Anniversary",
    slug: "anniversary",
    image: "/images/occasion-anniversary.jpg",
    href: "/flower-bouquets?occasion=anniversary",
    whatsapp_message: "Hello Occassions Florist Calicut, I would like to explore luxury flowers for an Anniversary.",
    active: 1,
    display_order: 2,
  },
  {
    id: "occ-get-well-soon",
    name: "Get Well Soon",
    slug: "get-well-soon",
    image: "/images/occasion-get-well-soon.jpg",
    href: "/flower-bouquets?occasion=get-well-soon",
    whatsapp_message: "Hello Occassions Florist Calicut, I would like to order cheerful Get Well Soon flowers.",
    active: 1,
    display_order: 3,
  },
  {
    id: "occ-condolences",
    name: "Condolences",
    slug: "condolences",
    image: "/images/occasion-condolences.jpg",
    href: "/flower-bouquets?occasion=condolences",
    whatsapp_message: "Hello Occassions Florist Calicut, I would like to inquire about sympathy and Condolences flowers.",
    active: 1,
    display_order: 4,
  },
  {
    id: "occ-best-wishes",
    name: "Best Wishes",
    slug: "best-wishes",
    image: "/images/occasion-best-wishes.jpg",
    href: "/flower-bouquets?occasion=best-wishes",
    whatsapp_message: "Hello Occassions Florist Calicut, I would like to order cheerful Best Wishes flowers.",
    active: 1,
    display_order: 5,
  },
  {
    id: "occ-thank-you",
    name: "Thank You",
    slug: "thank-you",
    image: "/images/occasion-thank-you.jpg",
    href: "/flower-bouquets?occasion=thank-you",
    whatsapp_message: "Hello Occassions Florist Calicut, I would like to send a Thank You flower arrangement.",
    active: 1,
    display_order: 6,
  },
  {
    id: "occ-wedding",
    name: "Wedding",
    slug: "wedding",
    image: "/images/occasion-wedding.jpg",
    href: "/flower-bouquets?occasion=wedding",
    whatsapp_message: "Hello Occassions Florist Calicut, I would like to inquire about Wedding floral decor and bridal bouquets.",
    active: 1,
    display_order: 7,
  },
  {
    id: "occ-congratulations",
    name: "Congratulations",
    slug: "congratulations",
    image: "/images/occasion-congratulations.png",
    href: "/flower-bouquets?occasion=congratulations",
    whatsapp_message: "Hello Occassions Florist Calicut, I would like to send Congratulations flower bouquets.",
    active: 1,
    display_order: 8,
  },

  // 2. Additional Popular Celebrations (9 - 11)
  {
    id: "occ-valentines",
    name: "Valentine's Day",
    slug: "valentines-day",
    image: "/images/rose.jpg",
    href: "/flower-bouquets?occasion=valentines-day",
    whatsapp_message: "Hello Occassions Florist Calicut, I would like to order romantic flowers for Valentine's Day.",
    active: 1,
    display_order: 9,
  },
  {
    id: "occ-housewarming",
    name: "Housewarming",
    slug: "housewarming",
    image: "/images/sunflower.jpg",
    href: "/flower-bouquets?occasion=housewarming",
    whatsapp_message: "Hello Occassions Florist Calicut, I would like to order vibrant flowers for a Housewarming celebration.",
    active: 1,
    display_order: 10,
  },
  {
    id: "occ-just-because",
    name: "Just Because",
    slug: "just-because",
    image: "/images/pastel-rose-wicker-basket.png",
    href: "/flower-bouquets?occasion=just-because",
    whatsapp_message: "Hello Occassions Florist Calicut, I would like to send a surprise flower bouquet Just Because.",
    active: 1,
    display_order: 11,
  },
];

let schemaEnsured = false;
async function ensureOccasionsSchema() {
  if (schemaEnsured) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS occasions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL
      );
    `;
    await sql`ALTER TABLE occasions ADD COLUMN IF NOT EXISTS image TEXT;`;
    await sql`ALTER TABLE occasions ADD COLUMN IF NOT EXISTS href TEXT;`;
    await sql`ALTER TABLE occasions ADD COLUMN IF NOT EXISTS whatsapp_message TEXT;`;
    await sql`ALTER TABLE occasions ADD COLUMN IF NOT EXISTS active INT DEFAULT 1;`;
    await sql`ALTER TABLE occasions ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;`;

    // Only seed initial default occasions ONCE if the table is completely empty!
    // Never re-seed or upsert on startup, otherwise deleted occasions will keep coming back!
    const countRows = await sql`SELECT count(*)::int as count FROM occasions`;
    const count = Number(countRows[0]?.count || 0);
    if (count === 0) {
      for (const o of ALL_OCCASIONS) {
        await sql`
          INSERT INTO occasions (id, name, slug, image, href, whatsapp_message, active, display_order)
          VALUES (${o.id}, ${o.name}, ${o.slug}, ${o.image}, ${o.href}, ${o.whatsapp_message}, ${o.active}, ${o.display_order});
        `;
      }
    }
    schemaEnsured = true;
  } catch (err) {
    console.warn("Occasions schema ensure notice:", err);
  }
}

export async function GET() {
  try {
    await ensureOccasionsSchema();
    const rows = await sql`SELECT * FROM occasions ORDER BY display_order ASC, name ASC`;
    return NextResponse.json({
      success: true,
      occasions: rows || [],
    });
  } catch (error: any) {
    console.error("Occasions fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch occasions", occasions: ALL_OCCASIONS },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = getAuthenticatedUser(request);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    await ensureOccasionsSchema();
    const body = await request.json();
    const { name, slug, image, href, whatsappMessage, whatsapp_message, active, displayOrder, display_order } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: "Occasion name is required" }, { status: 400 });
    }

    const cleanName = name.trim();
    const cleanSlug = (slug || cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-")).trim();
    const cleanId = "occ-" + cleanSlug;
    const cleanImage = image || "/images/occasion-birthday.jpg";
    const cleanHref = href || `/flower-bouquets?occasion=${cleanSlug}`;
    const cleanWhatsapp = (whatsapp_message ?? whatsappMessage ?? `Hello Occassions Florist Calicut, I would like to order fresh flowers for ${cleanName}.`).trim();
    const cleanActive = active === 0 || active === false ? 0 : 1;
    const cleanOrder = Number(display_order ?? displayOrder) || 0;

    await sql`
      INSERT INTO occasions (id, name, slug, image, href, whatsapp_message, active, display_order)
      VALUES (${cleanId}, ${cleanName}, ${cleanSlug}, ${cleanImage}, ${cleanHref}, ${cleanWhatsapp}, ${cleanActive}, ${cleanOrder})
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        slug = EXCLUDED.slug,
        image = EXCLUDED.image,
        href = EXCLUDED.href,
        whatsapp_message = EXCLUDED.whatsapp_message,
        active = EXCLUDED.active,
        display_order = EXCLUDED.display_order;
    `;

    return NextResponse.json({
      success: true,
      occasion: {
        id: cleanId,
        name: cleanName,
        slug: cleanSlug,
        image: cleanImage,
        href: cleanHref,
        whatsapp_message: cleanWhatsapp,
        active: cleanActive,
        display_order: cleanOrder,
      },
    });
  } catch (error: any) {
    console.error("Occasion creation error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to save occasion" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const auth = getAuthenticatedUser(request);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    await ensureOccasionsSchema();
    const body = await request.json();
    const { id, name, slug, image, href, whatsappMessage, whatsapp_message, active, displayOrder, display_order } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Occasion ID is required" }, { status: 400 });
    }

    const cleanName = (name || "").trim();
    const cleanSlug = (slug || cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-")).trim();
    const cleanActive = active === 0 || active === false ? 0 : 1;
    const cleanOrder = Number(display_order ?? displayOrder) || 0;
    const cleanWhatsapp = (whatsapp_message ?? whatsappMessage ?? "").trim();

    await sql`
      UPDATE occasions
      SET 
        name = ${cleanName},
        slug = ${cleanSlug},
        image = ${image || "/images/occasion-birthday.jpg"},
        href = ${href || `/flower-bouquets?occasion=${cleanSlug}`},
        whatsapp_message = ${cleanWhatsapp},
        active = ${cleanActive},
        display_order = ${cleanOrder}
      WHERE id = ${id};
    `;

    return NextResponse.json({
      success: true,
      message: "Occasion updated successfully",
    });
  } catch (error: any) {
    console.error("Occasion update error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update occasion" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = getAuthenticatedUser(request);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Occasion ID is required" }, { status: 400 });
    }

    await sql`DELETE FROM occasions WHERE id = ${id}`;

    return NextResponse.json({ success: true, message: "Occasion deleted successfully" });
  } catch (error: any) {
    console.error("Occasion delete error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to delete occasion" }, { status: 500 });
  }
}
