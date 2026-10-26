import Razorpay from "razorpay";
import crypto from "crypto";

export function getRazorpayClient() {
  const key_id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error("Razorpay credentials (RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET) are not configured.");
  }

  return new Razorpay({
    key_id,
    key_secret,
  });
}

export function verifyPaymentSignature({
  order_id,
  payment_id,
  signature,
}: {
  order_id: string;
  payment_id: string;
  signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    throw new Error("RAZORPAY_KEY_SECRET is not configured.");
  }

  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${order_id}|${payment_id}`)
    .digest("hex");

  try {
    return (
      generatedSignature.length === signature.length &&
      crypto.timingSafeEqual(Buffer.from(generatedSignature), Buffer.from(signature))
    );
  } catch {
    return generatedSignature === signature;
  }
}
