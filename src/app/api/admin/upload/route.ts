import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getAuthenticatedUser } from "@/lib/auth/jwt";
import { sql } from "@/lib/db/neon";
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
  if (norm.includes("addon") || norm.includes("add-on")) {
    return { subDir: "addons", folderName: "addons" };
  }
  return { subDir: "uploads", folderName: "uploads" };
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
      requestedFolder =
        (formData.get("folder") as string) ||
        (formData.get("categoryId") as string) ||
        (formData.get("category") as string) ||
        null;

      if (!file) {
        return NextResponse.json({ success: false, error: "No image file provided" }, { status: 400 });
      }

      originalName = file.name || "upload.jpg";
      const bytes = await file.arrayBuffer();
      rawBuffer = Buffer.from(bytes);
    } else {
      const body = await request.json();
      requestedFolder = body.folder || body.categoryId || body.category || null;
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

    // Clean and sanitize filename to prevent illegal characters
    const ext = (path.extname(originalName) || ".jpg").toLowerCase();
    const base = path.basename(originalName, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "product";

    const { folderName } = resolveCategoryStorage(requestedFolder);
    const safeName = `${base}${ext}`;
    const publicId = `${base}-${Date.now().toString().slice(-6)}`;
    const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : ext === ".svg" ? "image/svg+xml" : "image/jpeg";
    const dataUri = `data:${mime};base64,${rawBuffer.toString("base64")}`;

    // Upload directly to Cloudinary — strictly NO local disk storage
    const cldResult = await cloudinary.uploader.upload(dataUri, {
      folder: `occasions/${folderName}`,
      public_id: publicId,
      resource_type: "image",
    });

    const cloudinaryUrl = cldResult.secure_url;
    const mediaId = `med-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    // Record to Neon PostgreSQL media database with Cloudinary secure URL
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
      url: cloudinaryUrl,
      public_id: cldResult.public_id,
      filename: safeName,
      mediaId,
      folder: folderName,
      size: cldResult.bytes || rawBuffer.length,
      width: cldResult.width || 800,
      height: cldResult.height || 800,
      storage: "cloudinary",
    });
  } catch (error: any) {
    console.error("Cloudinary image upload error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to upload image to Cloudinary" },
      { status: 500 }
    );
  }
}
