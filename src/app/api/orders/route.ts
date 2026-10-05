import { NextResponse } from "next/server";
import { checkDelivery } from "@/lib/delivery/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { delivery, paymentMethod, coupon, total, items } = body;

    // 1. Backend validation of delivery PIN & calculation of delivery charge
    // Never trust frontend-submitted delivery charge
    const pinCode = delivery?.pinCode;
    const deliveryCheck = checkDelivery({ pinCode });

    if (!deliveryCheck.serviceable) {
      return NextResponse.json(
        {
          success: false,
          error:
            deliveryCheck.message ||
            "Sorry, delivery is not available to this location. Please enter another delivery location.",
          deliveryCheck,
        },
        { status: 400 }
      );
    }

    const verifiedDeliveryCharge = deliveryCheck.delivery_charge ?? 0;

    // Generate secure order ID
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const orderId = `ORD${randomSuffix}`;

    console.log("Order received:", {
      orderId,
      customer: delivery?.fullName,
      mobile: delivery?.mobile,
      city: delivery?.city,
      pinCode,
      distanceKm: deliveryCheck.distance_km,
      deliveryCharge: verifiedDeliveryCharge,
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
