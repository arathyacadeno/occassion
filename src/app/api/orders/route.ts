import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { delivery, paymentMethod, coupon, total } = body;

    // Generate secure order ID
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const orderId = `ORD${randomSuffix}`;

    console.log("Order received:", {
      orderId,
      customer: delivery?.fullName,
      mobile: delivery?.mobile,
      city: delivery?.city,
      method: paymentMethod?.type,
      total,
      coupon,
    });

    return NextResponse.json({
      success: true,
      orderId,
      message: "Order placed successfully",
      status: "confirmed",
      total,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to process order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to place order" },
      { status: 400 }
    );
  }
}
