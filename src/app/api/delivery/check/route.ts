/**
 * Delivery Check API Routes
 * -------------------------
 * GET /api/delivery/check?pinCode=673003 (or ?q=beach)
 * POST /api/delivery/check { pinCode, address, query, shopId }
 *
 * Computes road distance from the shop's exact address and returns
 * verified delivery charge, serviceable status, and location info.
 */

import { NextResponse } from "next/server";
import {
  checkDeliveryAsync,
  searchLocations,
} from "@/lib/delivery/service";

/**
 * GET /api/delivery/check?pinCode=673003 (or ?q=beach)
 * Returns road delivery check or autocomplete suggestions.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pinCode = searchParams.get("pinCode") || searchParams.get("pin");
    const q = searchParams.get("q") || "";

    if (pinCode) {
      const result = await checkDeliveryAsync({ pinCode });
      return NextResponse.json(result);
    }

    let suggestions = searchLocations(q);

    if (suggestions.length === 0 && /^\d{6}$/.test(q)) {
      try {
        const pinRes = await fetch(`https://api.postalpincode.in/pincode/${q}`, {
          signal: AbortSignal.timeout(3000),
        });
        const pinData = await pinRes.json();
        if (pinData && pinData[0] && pinData[0].Status === "Success") {
          const postOffice = pinData[0].PostOffice[0];
          suggestions = [
            {
              pinCode: q,
              area: postOffice.Name,
              district: postOffice.District,
              state: postOffice.State,
            },
          ];
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
 * Body: { pinCode?: "673003", address?: { ... }, query?: "...", shopId?: "occasions-main" }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { pinCode, query, shopId, address } = body ?? {};
    const inputVal =
      pinCode || (typeof address === "object" ? address.pinCode : "") || query;

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
          message: "Please enter a valid 6-digit delivery PIN code.",
          tier_label: null,
        },
        { status: 400 }
      );
    }

    const result = await checkDeliveryAsync({ pinCode: inputVal, query, shopId, address });
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
        message: "An unexpected error occurred while calculating delivery distance.",
        tier_label: null,
      },
      { status: 500 }
    );
  }
}
