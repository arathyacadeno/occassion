import { NextResponse } from "next/server";
import path from "path";
import { getAuthenticatedUser } from "@/lib/auth/jwt";
import { sql } from "@/lib/db/neon";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with primary or fallback cloud name
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif", ".avif"];
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/gif",
  "image/avif",
];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB Cloudinary limit

// Map category / context to designated Cloudinary folder structure
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

  // Support future custom product categories seamlessly
  const cleanCat = norm.replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "general";
  return {
    subDir: cleanCat,
    folderName: cleanCat,
    cloudinaryFolder: `occasions/products/${cleanCat}`,
  };
}

export async function POST(request: Request) {
  try {
    const auth = getAuthenticatedUser(request);
    if ((!auth || auth.role !== "admin") && process.env.NODE_ENV === "production") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    if (!cloudName || !apiKey || !apiSecret) {
      console.error("Cloudinary credentials missing in environment variables");
      return NextResponse.json(
        { success: false, error: "Cloudinary image service is not configured" },
        { status: 500 }
      );
    }

    const contentType = request.headers.get("content-type") || "";
    let rawBuffer: Buffer | null = null;
    let originalName = "upload.jpg";
    let requestedFolder: string | null = null;
    let fileMime: string | null = null;

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
      fileMime = file.type || null;
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
        const matches = fileData.match(/^data:([a-zA-Z0-9/+-]+);base64,(.+)$/);
        if (matches) {
          fileMime = matches[1];
          rawBuffer = Buffer.from(matches[2], "base64");
        } else {
          const base64Part = fileData.split(",")[1];
          rawBuffer = Buffer.from(base64Part, "base64");
        }
      } else {
        rawBuffer = Buffer.from(fileData, "base64");
      }
    }

    if (!rawBuffer || rawBuffer.length === 0) {
      return NextResponse.json({ success: false, error: "Failed to read image data" }, { status: 400 });
    }

    // 1. File Size Validation (Max 10MB)
    if (rawBuffer.length > MAX_FILE_SIZE_BYTES) {
      const sizeMB = (rawBuffer.length / (1024 * 1024)).toFixed(2);
      return NextResponse.json(
        {
          success: false,
          error: `Image file size (${sizeMB} MB) exceeds maximum allowed limit of 10 MB`,
        },
        { status: 400 }
      );
    }

    // 2. File Type / Extension Validation
    const ext = (path.extname(originalName) || ".jpg").toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file format "${ext}". Allowed formats: JPG, PNG, WEBP, SVG, GIF, AVIF`,
        },
        { status: 400 }
      );
    }

    if (fileMime && !ALLOWED_MIME_TYPES.includes(fileMime.toLowerCase())) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid image MIME type "${fileMime}". Please upload a standard image file.`,
        },
        { status: 400 }
      );
    }

    // Clean and sanitize filename to prevent illegal characters
    const base = path.basename(originalName, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "product";

    const { folderName, cloudinaryFolder } = resolveCategoryStorage(requestedFolder);
    const safeName = `${base}${ext}`;
    const publicId = `${base}-${Date.now().toString().slice(-6)}`;
    const mime = fileMime || (ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : ext === ".svg" ? "image/svg+xml" : "image/jpeg");
    const dataUri = `data:${mime};base64,${rawBuffer.toString("base64")}`;

    // Upload directly to Cloudinary — strictly NO local disk storage
    const cldResult = await cloudinary.uploader.upload(dataUri, {
      folder: cloudinaryFolder,
      public_id: publicId,
      resource_type: "image",
      overwrite: false,
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
      cloudinaryFolder,
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
