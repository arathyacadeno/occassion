import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getDb } from "@/lib/db";
import { sql } from "@/lib/db/neon";
import { getAuthenticatedUser } from "@/lib/auth/jwt";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function resolveCategoryStorage(folderOrCat: string | null): { subDir: string; folderName: string } {
  const norm = (folderOrCat || "").toLowerCase().replace(/^cat-/, "").trim();

  if (norm.includes("bouquet")) {
    return { subDir: "flower-bouquet", folderName: "flower-bouquet" };
  }
  if (norm.includes("basket")) {
    return { subDir: "flower-basket", folderName: "flower-basket" };
  }
  if (norm.includes("cake")) {
    return { subDir: "cakes", folderName: "cakes" };
  }
  if (norm.includes("table") || norm.includes("decor")) {
    return { subDir: "table decor", folderName: "table-decor" };
  }
  if (norm.includes("wreath")) {
    return { subDir: "wreaths", folderName: "wreaths" };
  }
  return { subDir: "uploads", folderName: "uploads" };
}

export async function GET(request: Request) {
  try {
    const auth = getAuthenticatedUser(request);
    if ((!auth || auth.role !== "admin") && process.env.NODE_ENV === "production") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim().toLowerCase() || "";
    const folder = searchParams.get("folder") || "all";
    const hideSideViews = searchParams.get("sideViews") === "false";

    const db = getDb();

    // Fetch all media from DB
    let query = "SELECT * FROM media";
    const whereClauses: string[] = [];
    const params: any[] = [];

    if (folder && folder !== "all") {
      if (folder === "flower-bouquet") {
        whereClauses.push("(folder = 'flower-bouquet' OR url LIKE '%/flower-bouquet/%')");
      } else if (folder === "flower-basket") {
        whereClauses.push("(folder = 'flower-basket' OR url LIKE '%/flower-basket/%')");
      } else if (folder === "table-decor" || folder === "table decor") {
        whereClauses.push("(folder = 'table-decor' OR url LIKE '%/table decor/%' OR url LIKE '%/table-decor/%')");
      } else if (folder === "cakes") {
        whereClauses.push("(folder = 'cakes' OR url LIKE '%/cakes/%')");
      } else if (folder === "uploads") {
        whereClauses.push("(folder = 'uploads' OR url LIKE '%/uploads/%')");
      } else if (folder === "wreaths") {
        whereClauses.push("(folder = 'wreaths' OR url LIKE '%/wreath%')");
      } else {
        whereClauses.push("folder = ?");
        params.push(folder);
      }
    }

    if (hideSideViews) {
      whereClauses.push("url NOT LIKE '%/side-view/%'");
    }

    if (search) {
      whereClauses.push("(filename LIKE ? OR public_id LIKE ? OR folder LIKE ? OR url LIKE ?)");
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(" AND ")}`;
    }

    query += " ORDER BY created_at DESC LIMIT 200";

    const mediaRows = db.prepare(query).all(...params);

    // Filter out any ghost/broken local paths that do not exist on disk
    const validMediaRows = mediaRows.filter((m: any) => {
      if (m.url.startsWith("http://") || m.url.startsWith("https://")) return true;
      const localFile = path.join(process.cwd(), "public", m.url.replace(/^\//, ""));
      const exists = fs.existsSync(localFile);
      if (!exists) {
        try {
          db.prepare("DELETE FROM media WHERE id = ?").run(m.id);
        } catch {}
      }
      return exists;
    });

    // Check image references in products & categories
    const products = db.prepare("SELECT id, name, images FROM products").all();
    const categories = db.prepare("SELECT id, name, image FROM categories").all();

    const enrichedMedia = validMediaRows.map((m: any) => {
      const referencedIn: string[] = [];

      for (const p of products) {
        if (p.images && p.images.includes(m.url)) {
          referencedIn.push(`Product: ${p.name}`);
        } else if (m.public_id && p.images && p.images.includes(m.public_id)) {
          referencedIn.push(`Product: ${p.name}`);
        }
      }

      for (const c of categories) {
        if (c.image && (c.image.includes(m.url) || (m.public_id && c.image.includes(m.public_id)))) {
          referencedIn.push(`Category: ${c.name}`);
        }
      }

      return {
        ...m,
        referencedBy: referencedIn,
        isReferenced: referencedIn.length > 0,
        usageCount: referencedIn.length,
      };
    });

    return NextResponse.json({
      success: true,
      media: enrichedMedia,
      total: enrichedMedia.length,
      folders: ["all", "flower-bouquet", "flower-basket", "table-decor", "cakes", "uploads", "wreaths"],
    });
  } catch (error: any) {
    console.error("Media list error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to list media" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = getAuthenticatedUser(request);
    if ((!auth || auth.role !== "admin") && process.env.NODE_ENV === "production") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const contentType = request.headers.get("content-type") || "";
    let rawBuffer: Buffer | null = null;
    let originalName = "upload.jpg";
    let requestedFolder: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      requestedFolder = (formData.get("folder") as string) || (formData.get("categoryId") as string) || null;

      if (!file) {
        return NextResponse.json({ success: false, error: "No image file provided" }, { status: 400 });
      }

      originalName = file.name || "upload.jpg";
      const bytes = await file.arrayBuffer();
      rawBuffer = Buffer.from(bytes);
    } else {
      const body = await request.json();
      requestedFolder = body.folder || body.categoryId || null;
      if (body.filename) originalName = body.filename;

      const fileData = body.image || body.dataUrl;
      if (!fileData) {
        return NextResponse.json({ success: false, error: "No image data provided" }, { status: 400 });
      }

      if (fileData.startsWith("data:")) {
        const base64Part = fileData.split(",")[1];
        rawBuffer = Buffer.from(base64Part, "base64");
      } else {
        rawBuffer = Buffer.from(fileData, "base64");
      }
    }

    if (!rawBuffer || rawBuffer.length === 0) {
      return NextResponse.json({ success: false, error: "Failed to read image data" }, { status: 400 });
    }

    // Determine target local directory on server storage
    const { subDir, folderName } = resolveCategoryStorage(requestedFolder);
    const targetDir = path.join(process.cwd(), "public", "images", subDir);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Clean and sanitize filename
    const ext = (path.extname(originalName) || ".jpg").toLowerCase();
    const base = path.basename(originalName, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "product";

    let safeName = `${base}${ext}`;
    let targetFilePath = path.join(targetDir, safeName);

    if (fs.existsSync(targetFilePath)) {
      safeName = `${base}-${Date.now().toString().slice(-6)}${ext}`;
      targetFilePath = path.join(targetDir, safeName);
    }

    // Save to local server storage
    fs.writeFileSync(targetFilePath, rawBuffer);

    const localUrl = `/images/${subDir}/${safeName}`;
    const mediaId = `med-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const db = getDb();
    db.prepare(`
      INSERT OR REPLACE INTO media (id, url, public_id, filename, format, size, width, height, folder, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      mediaId,
      localUrl,
      localUrl,
      safeName,
      ext.replace(".", ""),
      rawBuffer.length,
      800,
      800,
      folderName,
      now
    );

    if (process.env.DATABASE_URL) {
      try {
        await sql`
          INSERT INTO media (id, url, public_id, filename, format, size, width, height, folder, created_at)
          VALUES (
            ${mediaId}, ${localUrl}, ${localUrl}, ${safeName},
            ${ext.replace(".", "")}, ${rawBuffer.length}, 800, 800, ${folderName}, ${now}
          )
          ON CONFLICT (id) DO NOTHING
        `;
      } catch (neonErr: any) {
        console.warn("Neon media insert sync warning:", neonErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      mediaItem: {
        id: mediaId,
        url: localUrl,
        public_id: localUrl,
        filename: safeName,
        format: ext.replace(".", ""),
        size: rawBuffer.length,
        width: 800,
        height: 800,
        folder: folderName,
        created_at: now,
        referencedBy: [],
        isReferenced: false,
        usageCount: 0,
      },
    });
  } catch (error: any) {
    console.error("Media upload error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to upload media" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = getAuthenticatedUser(request);
    if ((!auth || auth.role !== "admin") && process.env.NODE_ENV === "production") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get("id");
    const publicId = searchParams.get("publicId");
    const force = searchParams.get("force") === "true";

    const db = getDb();

    let mediaItem: any = null;
    if (mediaId) {
      mediaItem = db.prepare("SELECT * FROM media WHERE id = ?").get(mediaId);
    } else if (publicId) {
      mediaItem = db.prepare("SELECT * FROM media WHERE public_id = ?").get(publicId);
    }

    if (!mediaItem) {
      return NextResponse.json({ success: false, error: "Media item not found" }, { status: 404 });
    }

    // Check usage references in products and categories
    const products = db.prepare("SELECT id, name, images FROM products").all();
    const categories = db.prepare("SELECT id, name, image FROM categories").all();

    const references: string[] = [];
    for (const p of products) {
      if (p.images && (p.images.includes(mediaItem.url) || p.images.includes(mediaItem.public_id))) {
        references.push(`Product: ${p.name}`);
      }
    }
    for (const c of categories) {
      if (c.image && (c.image.includes(mediaItem.url) || c.image.includes(mediaItem.public_id))) {
        references.push(`Category: ${c.name}`);
      }
    }

    if (references.length > 0 && !force) {
      return NextResponse.json(
        {
          success: false,
          isReferenced: true,
          references,
          error: `Cannot delete image: It is currently used in ${references.length} place(s): ${references.slice(0, 3).join(", ")}. Please remove image references first or confirm forced removal.`,
        },
        { status: 400 }
      );
    }

    // Delete local file from server storage
    if (mediaItem.url && mediaItem.url.startsWith("/images/")) {
      const localFilePath = path.join(process.cwd(), "public", mediaItem.url.replace(/^\//, ""));
      if (fs.existsSync(localFilePath)) {
        try {
          fs.unlinkSync(localFilePath);
        } catch (unlinkErr: any) {
          console.warn("Local file unlink warning:", unlinkErr.message);
        }
      }
    }

    // Optional Cloudinary cleanup
    if (mediaItem.public_id && mediaItem.public_id.startsWith("occasions/")) {
      try {
        await cloudinary.uploader.destroy(mediaItem.public_id);
      } catch (cldErr: any) {
        console.warn("Cloudinary destroy warning:", cldErr.message);
      }
    }

    // Delete from SQLite
    db.prepare("DELETE FROM media WHERE id = ?").run(mediaItem.id);

    // Delete from Neon DB
    if (process.env.DATABASE_URL) {
      try {
        await sql`DELETE FROM media WHERE id = ${mediaItem.id}`;
      } catch (neonErr: any) {
        console.warn("Neon media delete warning:", neonErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Image '${mediaItem.filename || mediaItem.public_id}' removed successfully`,
    });
  } catch (error: any) {
    console.error("Media delete error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to delete media" }, { status: 500 });
  }
}
