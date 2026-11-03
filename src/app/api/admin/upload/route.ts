import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/jwt";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const auth = getAuthenticatedUser(request);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const contentType = request.headers.get("content-type") || "";
    let fileBuffer: string | null = null;
    let folder = "occasions/products";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const customFolder = formData.get("folder") as string | null;
      if (customFolder) folder = customFolder;

      if (!file) {
        return NextResponse.json({ success: false, error: "No image file provided" }, { status: 400 });
      }

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
      if (body.folder) folder = body.folder;
    }

    if (!fileBuffer) {
      return NextResponse.json({ success: false, error: "Failed to parse image data" }, { status: 400 });
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

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
    });
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to upload image" }, { status: 500 });
  }
}

