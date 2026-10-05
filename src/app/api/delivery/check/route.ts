/**
 * POST /api/delivery/check
 *
 * Request body:
 *   { "pinCode": "673020", "shopId"?: "occasions-main" }
 *
 * Response:
 *   { serviceable, distance_km, delivery_charge, area, district, state, message, tier_label }
 */

import { NextResponse } from "next/server";
import { checkDelivery } from "@/lib/delivery/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pinCode, shopId } = body ?? {};

    if (!pinCode || typeof pinCode !== "string") {
      return NextResponse.json(
        {
          serviceable: false,
          distance_km: null,
          delivery_charge: null,
          area: null,
          district: null,
          state: null,
          message: "Please provide a pinCode in the request body.",
          tier_label: null,
        },
        { status: 400 }
      );
    }

    const result = checkDelivery({ pinCode, shopId });

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("[delivery/check] error:", err);
    return NextResponse.json(
      {
        serviceable: false,
        distance_km: null,
        delivery_charge: null,
        area: null,
        district: null,
        state: null,
        message: "An unexpected error occurred. Please try again.",
        tier_label: null,
      },
      { status: 500 }
    );
  }
}
