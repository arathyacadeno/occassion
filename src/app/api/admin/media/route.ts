import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { sql } from "@/lib/db/neon";
import { getAuthenticatedUser } from "@/lib/auth/jwt";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function resolveCategoryStorage(folderOrCat: string | null): { subDir: string; folderName: string; cloudinaryFolder: string } {
  const norm = (folderOrCat || "").toLowerCase().replace(/^cat-/, "").trim();

  if (norm.includes("bouquet")) {
    return { subDir: "flower-bouquet", folderName: "flower-bouquet", cloudinaryFolder: "occasions/products/flower-bouquet" };
  }
  if (norm.includes("basket")) {
    return { subDir: "flower-basket", folderName: "flower-basket", cloudinaryFolder: "occasions/products/flower-basket" };
  }
  if (norm.includes("cake")) {
    return { subDir: "cakes", folderName: "cakes", cloudinaryFolder: "occasions/products/cakes" };
  }
  if (norm.includes("table") || norm.includes("decor")) {
    return { subDir: "table-decor", folderName: "table-decor", cloudinaryFolder: "occasions/products/table-decor" };
  }
  if (norm.includes("wreath")) {
    return { subDir: "wreaths", folderName: "wreaths", cloudinaryFolder: "occasions/products/wreath" };
  }
  if (norm.includes("addon") || norm.includes("add-on")) {
    return { subDir: "addons", folderName: "addons", cloudinaryFolder: "occasions/products/addons" };
  }
  if (norm.includes("banner")) {
    return { subDir: "banners", folderName: "banners", cloudinaryFolder: "occasions/banners" };
  }
  if (norm.includes("categories") || norm.includes("category")) {
    return { subDir: "categories", folderName: "categories", cloudinaryFolder: "occasions/categories" };
  }
  if (norm.includes("branding") || norm.includes("logo") || norm.includes("favicon")) {
    return { subDir: "branding", folderName: "branding", cloudinaryFolder: "occasions/branding" };
  }
  const cleanCat = norm.replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "general";
  return { subDir: cleanCat, folderName: cleanCat, cloudinaryFolder: `occasions/products/${cleanCat}` };
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

    let query = "SELECT * FROM media";
    const whereClauses: string[] = [];
    const params: any[] = [];

    const addParam = (val: any) => {
      params.push(val);
      return `$${params.length}`;
    };

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
      } else if (folder === "addons") {
        whereClauses.push("(folder = 'addons' OR url LIKE '%/addons/%')");
      } else {
        whereClauses.push(`folder = ${addParam(folder)}`);
      }
    }

    if (hideSideViews) {
      whereClauses.push("url NOT LIKE '%/side-view/%'");
    }

    if (search) {
      const term = `%${search}%`;
      const p1 = addParam(term);
      const p2 = addParam(term);
      const p3 = addParam(term);
      const p4 = addParam(term);
      whereClauses.push(`(filename LIKE ${p1} OR public_id LIKE ${p2} OR folder LIKE ${p3} OR url LIKE ${p4})`);
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(" AND ")}`;
    }

    query += " ORDER BY created_at DESC LIMIT 200";

    const mediaRows = await sql.query(query, params);

    // Filter out any broken local paths that do not exist on disk
    const validMediaRows: any[] = [];
    for (const m of mediaRows || []) {
      if (m.url.startsWith("http://") || m.url.startsWith("https://")) {
        validMediaRows.push(m);
        continue;
      }
      const localFile = path.join(process.cwd(), "public", m.url.replace(/^\//, ""));
      const exists = fs.existsSync(localFile);
      if (!exists) {
        try {
          await sql`DELETE FROM media WHERE id = ${m.id}`;
        } catch {}
      } else {
        validMediaRows.push(m);
      }
    }

    // Check image references in products & categories from Neon PostgreSQL
    const products = await sql`SELECT id, name, images FROM products`;
    const categories = await sql`SELECT id, name, image FROM categories`;

    const enrichedMedia = validMediaRows.map((m: any) => {
      const referencedIn: string[] = [];

      for (const p of products || []) {
        if (p.images && p.images.includes(m.url)) {
          referencedIn.push(`Product: ${p.name}`);
        } else if (m.public_id && p.images && p.images.includes(m.public_id)) {
          referencedIn.push(`Product: ${p.name}`);
        }
      }

      for (const c of categories || []) {
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
      folders: ["all", "flower-bouquet", "flower-basket", "table-decor", "cakes", "wreaths", "addons", "uploads"],
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

    if (rawBuffer.length > 10 * 1024 * 1024) {
      const sizeMB = (rawBuffer.length / (1024 * 1024)).toFixed(2);
      return NextResponse.json(
        { success: false, error: `Image file size (${sizeMB} MB) exceeds maximum allowed limit of 10 MB` },
        { status: 400 }
      );
    }

    // Clean and sanitize filename
    const ext = (path.extname(originalName) || ".jpg").toLowerCase();
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif", ".avif"];
    if (!allowed.includes(ext)) {
      return NextResponse.json(
        { success: false, error: `Invalid file format "${ext}". Allowed formats: JPG, PNG, WEBP, SVG, GIF, AVIF` },
        { status: 400 }
      );
    }

    const base = path.basename(originalName, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "product";

    const { folderName, cloudinaryFolder } = resolveCategoryStorage(requestedFolder);
    const safeName = `${base}${ext}`;
    const publicId = `${base}-${Date.now().toString().slice(-6)}`;
    const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : ext === ".svg" ? "image/svg+xml" : "image/jpeg";
    const dataUri = `data:${mime};base64,${rawBuffer.toString("base64")}`;

    // Upload directly to Cloudinary — strictly NO local disk storage
    const cldResult = await cloudinary.uploader.upload(dataUri, {
      folder: cloudinaryFolder,
      public_id: publicId,
      resource_type: "image",
    });

    const cloudinaryUrl = cldResult.secure_url;
    const mediaId = `med-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    await sql`
      INSERT INTO media (id, url, public_id, filename, format, size, width, height, folder, created_at)
      VALUES (
        ${mediaId}, ${cloudinaryUrl}, ${cldResult.public_id}, ${safeName},
        ${cldResult.format || ext.replace(".", "")}, ${cldResult.bytes || rawBuffer.length},
        ${cldResult.width || 800}, ${cldResult.height || 800}, ${folderName}, ${now}
      )
      ON CONFLICT (id) DO NOTHING
    `;

    return NextResponse.json({
      success: true,
      mediaItem: {
        id: mediaId,
        url: cloudinaryUrl,
        public_id: cldResult.public_id,
        filename: safeName,
        format: cldResult.format || ext.replace(".", ""),
        size: cldResult.bytes || rawBuffer.length,
        width: cldResult.width || 800,
        height: cldResult.height || 800,
        folder: folderName,
        created_at: now,
        referencedBy: [],
        isReferenced: false,
        usageCount: 0,
      },
    });
  } catch (error: any) {
    console.error("Cloudinary media upload error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to upload image to Cloudinary" }, { status: 500 });
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

    let mediaItem: any = null;
    if (mediaId) {
      const rows = await sql`SELECT * FROM media WHERE id = ${mediaId} LIMIT 1`;
      mediaItem = rows[0];
    } else if (publicId) {
      const rows = await sql`SELECT * FROM media WHERE public_id = ${publicId} LIMIT 1`;
      mediaItem = rows[0];
    }

    if (!mediaItem) {
      return NextResponse.json({ success: false, error: "Media item not found" }, { status: 404 });
    }

    // Check usage references in products and categories
    const products = await sql`SELECT id, name, images FROM products`;
    const categories = await sql`SELECT id, name, image FROM categories`;

    const references: string[] = [];
    for (const p of products || []) {
      if (p.images && (p.images.includes(mediaItem.url) || p.images.includes(mediaItem.public_id))) {
        references.push(`Product: ${p.name}`);
      }
    }
    for (const c of categories || []) {
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

    // Delete from Neon PostgreSQL
    await sql`DELETE FROM media WHERE id = ${mediaItem.id}`;

    return NextResponse.json({
      success: true,
      message: `Image '${mediaItem.filename || mediaItem.public_id}' removed successfully`,
    });
  } catch (error: any) {
    console.error("Media delete error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to delete media" }, { status: 500 });
  }
}
