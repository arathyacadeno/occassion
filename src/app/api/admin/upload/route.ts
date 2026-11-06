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

    // Determine target local directory on server storage
    const { subDir, folderName } = resolveCategoryStorage(requestedFolder);
    const targetDir = path.join(process.cwd(), "public", "images", subDir);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Clean and sanitize filename to prevent overwrites or illegal characters
    const ext = (path.extname(originalName) || ".jpg").toLowerCase();
    const base = path.basename(originalName, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "product";

    let safeName = `${base}${ext}`;
    let targetFilePath = path.join(targetDir, safeName);

    // If file exists, append timestamp suffix
    if (fs.existsSync(targetFilePath)) {
      safeName = `${base}-${Date.now().toString().slice(-6)}${ext}`;
      targetFilePath = path.join(targetDir, safeName);
    }

    // Write file directly to local server storage
    fs.writeFileSync(targetFilePath, rawBuffer);

    // Storefront accessible local path
    const localUrl = `/images/${subDir}/${safeName}`;
    const mediaId = `med-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    // Record to Neon PostgreSQL media database
    await sql`
      INSERT INTO media (id, url, public_id, filename, format, size, width, height, folder, created_at)
      VALUES (
        ${mediaId}, ${localUrl}, ${localUrl}, ${safeName},
        ${ext.replace(".", "")}, ${rawBuffer.length}, 800, 800, ${folderName}, ${now}
      )
      ON CONFLICT (id) DO NOTHING
    `;

    // Optional Cloudinary backup upload in background
    if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
      const dataUri = `data:${mime};base64,${rawBuffer.toString("base64")}`;
      cloudinary.uploader
        .upload(dataUri, {
          folder: `occasions/${folderName}`,
          public_id: `${base}-${Date.now().toString().slice(-6)}`,
          resource_type: "image",
        })
        .catch((cldErr) => {
          console.warn("Cloudinary background upload warning:", cldErr.message);
        });
    }

    return NextResponse.json({
      success: true,
      url: localUrl,
      filename: safeName,
      mediaId,
      folder: folderName,
      size: rawBuffer.length,
      storage: "server",
    });
  } catch (error: any) {
    console.error("Server image upload error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to upload image to server storage" },
      { status: 500 }
    );
  }
}
