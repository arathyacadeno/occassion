import { v2 as cloudinary } from "cloudinary";

export const CLOUDINARY_VERIFIED_CLOUD_NAME = "hm2hbrdd";
export const CLOUDINARY_VERIFIED_API_KEY = "987437152799173";
export const CLOUDINARY_VERIFIED_API_SECRET = "3Ruw3T5z_KsdPgb3pTMMOEtM_k4";

/**
 * Sanitizes and validates the Cloudinary API secret.
 * Resolves production issues where environment variables on hosting platforms (such as Hostinger)
 * mistakenly have the numeric API Key entered into the CLOUDINARY_API_SECRET variable.
 */
export function getSanitizedCloudinarySecret(): string {
  const rawSecret = (process.env.CLOUDINARY_API_SECRET || "").trim().replace(/^["']|["']$/g, "");
  const rawKey = (process.env.CLOUDINARY_API_KEY || "").trim().replace(/^["']|["']$/g, "");

  // If secret is missing, equal to API key, purely numeric, placeholder text, or suspiciously short:
  if (
    !rawSecret ||
    rawSecret === rawKey ||
    rawSecret === CLOUDINARY_VERIFIED_API_KEY ||
    /^\d+$/.test(rawSecret) ||
    rawSecret.includes("your-") ||
    rawSecret.length < 20
  ) {
    return CLOUDINARY_VERIFIED_API_SECRET;
  }
  return rawSecret;
}

export function getSanitizedCloudinaryConfig() {
  let cloudName = (process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "").trim().replace(/^["']|["']$/g, "");
  if (!cloudName || cloudName.includes("your-")) {
    cloudName = CLOUDINARY_VERIFIED_CLOUD_NAME;
  }

  let apiKey = (process.env.CLOUDINARY_API_KEY || "").trim().replace(/^["']|["']$/g, "");
  if (!apiKey || apiKey.includes("your-")) {
    apiKey = CLOUDINARY_VERIFIED_API_KEY;
  }

  const apiSecret = getSanitizedCloudinarySecret();

  return {
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  };
}

export function getCloudinaryClient() {
  const config = getSanitizedCloudinaryConfig();
  cloudinary.config({
    cloud_name: config.cloud_name,
    api_key: config.api_key,
    api_secret: config.api_secret,
    secure: true,
  });
  return cloudinary;
}

export function uploadBufferToCloudinary(buffer: Buffer, options: any): Promise<any> {
  const client = getCloudinaryClient();
  return new Promise((resolve, reject) => {
    const uploadStream = client.uploader.upload_stream(options, (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
    uploadStream.end(buffer);
  });
}

export { cloudinary };
