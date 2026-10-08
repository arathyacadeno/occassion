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
import { checkDelivery, searchLocations } from "@/lib/delivery/service";

/**
 * GET /api/delivery/check?q=beach
 * Returns autocomplete location & PIN suggestions.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pinCode = searchParams.get("pinCode") || searchParams.get("pin");
    const q = searchParams.get("q") || "";

    if (pinCode) {
      const result = checkDelivery({ pinCode });
      return NextResponse.json(result);
    }

    let suggestions = searchLocations(q);

    if (suggestions.length === 0 && /^\d{6}$/.test(q)) {
      try {
        const pinRes = await fetch(`https://api.postalpincode.in/pincode/${q}`);
        const pinData = await pinRes.json();
        if (pinData && pinData[0] && pinData[0].Status === "Success") {
          const postOffice = pinData[0].PostOffice[0];
          suggestions = [{
            pinCode: q,
            area: postOffice.Name,
            district: postOffice.District,
            state: postOffice.State
          }];
        }
      } catch (e) {
        console.error("Failed to fetch external pincode for autocomplete", e);
      }
    }

    return NextResponse.json({ suggestions });
  } catch (err) {
    console.error("[delivery/search] error:", err);
    return NextResponse.json({ suggestions: [] }, { status: 500 });
  }
}

/**
 * POST /api/delivery/check
 * Body: { pinCode?: "673002", query?: "Beach Road", shopId?: "occasions-main" }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pinCode, query, shopId } = body ?? {};
    const inputVal = pinCode || query;

    if (!inputVal || typeof inputVal !== "string") {
      return NextResponse.json(
        {
          serviceable: false,
          pinCode: null,
          distance_km: null,
          delivery_charge: null,
          area: null,
          district: null,
          state: null,
          message: "Please enter a delivery PIN code or location name.",
          tier_label: null,
        },
        { status: 400 }
      );
    }

    const result = checkDelivery({ pinCode, query, shopId });

    if (!result.area && inputVal && /^\d{6}$/.test(inputVal)) {
      try {
        const pinRes = await fetch(`https://api.postalpincode.in/pincode/${inputVal}`);
        const pinData = await pinRes.json();
        if (pinData && pinData[0] && pinData[0].Status === "Success") {
          const postOffice = pinData[0].PostOffice[0];
          result.area = postOffice.Name;
          result.district = postOffice.District;
          result.state = postOffice.State;
          result.pinCode = inputVal;
        }
      } catch (e) {
        console.error("Failed to fetch external pincode", e);
      }
    }

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
