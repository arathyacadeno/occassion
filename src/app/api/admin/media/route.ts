import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getDb } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth/jwt";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request: Request) {
  try {
    const auth = getAuthenticatedUser(request);
    if ((!auth || auth.role !== "admin") && process.env.NODE_ENV === "production") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim().toLowerCase() || "";
    const folder = searchParams.get("folder") || "all";
    const syncCloudinary = searchParams.get("sync") === "true";

    const db = getDb();

    // 1. Optional sync from Cloudinary directly to local media table
    if (syncCloudinary) {
      try {
        const cldRes = await cloudinary.api.resources({
          type: "upload",
          prefix: "occasions/",
          max_results: 100,
        });

        const insertMedia = db.prepare(`
          INSERT OR IGNORE INTO media (id, url, public_id, filename, format, size, width, height, folder, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const res of cldRes.resources || []) {
          const mId = `med-${res.public_id.replace(/[^a-zA-Z0-9]/g, "-")}`;
          const parts = res.public_id.split("/");
          const folderName = parts.length > 1 ? parts[1] : "products";
          const filename = parts[parts.length - 1];

          insertMedia.run(
            mId,
            res.secure_url,
            res.public_id,
            filename,
            res.format || "jpg",
            res.bytes || 0,
            res.width || 800,
            res.height || 800,
            folderName,
            res.created_at || new Date().toISOString()
          );
        }
      } catch (cldErr: any) {
        console.warn("Cloudinary sync warning:", cldErr.message);
      }
    }

    // 2. Fetch all media from DB
    let query = "SELECT * FROM media";
    const whereClauses: string[] = [];
    const params: any[] = [];

    if (folder && folder !== "all") {
      whereClauses.push("folder = ?");
      params.push(folder);
    }

    if (search) {
      whereClauses.push("(filename LIKE ? OR public_id LIKE ? OR folder LIKE ?)");
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(" AND ")}`;
    }

    query += " ORDER BY created_at DESC LIMIT 150";

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

    // 3. Check image references in products & categories
    const products = db.prepare("SELECT id, name, images FROM products").all();
    const categories = db.prepare("SELECT id, name, image FROM categories").all();

    const enrichedMedia = validMediaRows.map((m: any) => {
      const referencedIn: string[] = [];

      // Check products
      for (const p of products) {
        if (p.images && p.images.includes(m.url)) {
          referencedIn.push(`Product: ${p.name}`);
        } else if (m.public_id && p.images && p.images.includes(m.public_id)) {
          referencedIn.push(`Product: ${p.name}`);
        }
      }

      // Check categories
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
      folders: ["products", "categories", "banners", "branding"],
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
    let fileBuffer: string | null = null;
    let folder = "occasions/products";
    let originalName = "upload";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const customFolder = formData.get("folder") as string | null;
      if (customFolder) folder = customFolder.startsWith("occasions/") ? customFolder : `occasions/${customFolder}`;

      if (!file) {
        return NextResponse.json({ success: false, error: "No image file provided" }, { status: 400 });
      }

      originalName = file.name;
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mime = file.type || "image/jpeg";
      fileBuffer = `data:${mime};base64,${buffer.toString("base64")}`;
    } else {
      const body = await request.json();
      if (!body.image && !body.dataUrl) {
        return NextResponse.json({ success: false, error: "No image data provided" }, { status: 400 });
      }
      fileBuffer = body.image || body.dataUrl;
      if (body.folder) folder = body.folder.startsWith("occasions/") ? body.folder : `occasions/${body.folder}`;
      if (body.filename) originalName = body.filename;
    }

    if (!fileBuffer) {
      return NextResponse.json({ success: false, error: "Failed to read image data" }, { status: 400 });
    }

    // Upload to Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload(
        fileBuffer!,
        {
          folder,
          resource_type: "image",
          transformation: [{ quality: "auto" }, { fetch_format: "auto" }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });

    const db = getDb();
    const mediaId = `med-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const folderLabel = folder.replace(/^occasions\//, "");

    db.prepare(`
      INSERT INTO media (id, url, public_id, filename, format, size, width, height, folder, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      mediaId,
      uploadResult.secure_url,
      uploadResult.public_id,
      originalName,
      uploadResult.format || "jpg",
      uploadResult.bytes || 0,
      uploadResult.width || 800,
      uploadResult.height || 800,
      folderLabel,
      uploadResult.created_at || new Date().toISOString()
    );

    return NextResponse.json({
      success: true,
      mediaItem: {
        id: mediaId,
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
        filename: originalName,
        format: uploadResult.format,
        size: uploadResult.bytes,
        width: uploadResult.width,
        height: uploadResult.height,
        folder: folderLabel,
        created_at: uploadResult.created_at || new Date().toISOString(),
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

    // Check usage references
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
      return NextResponse.json({
        success: false,
        isReferenced: true,
        references,
        error: `Cannot delete image: It is currently used in ${references.length} place(s): ${references.slice(0, 3).join(", ")}. Please remove image references first or confirm forced removal.`,
      }, { status: 400 });
    }

    // Delete from Cloudinary
    if (mediaItem.public_id) {
      try {
        await cloudinary.uploader.destroy(mediaItem.public_id);
      } catch (cldErr: any) {
        console.warn("Cloudinary destroy warning:", cldErr.message);
      }
    }

    // Delete from DB
    db.prepare("DELETE FROM media WHERE id = ?").run(mediaItem.id);

    return NextResponse.json({
      success: true,
      message: `Image '${mediaItem.filename || mediaItem.public_id}' removed successfully`,
    });
  } catch (error: any) {
    console.error("Media delete error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to delete media" }, { status: 500 });
  }
}
