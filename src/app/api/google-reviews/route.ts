import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export interface GoogleReview {
  id: string;
  author_name: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time?: number;
  profile_photo_url?: string;
  author_url?: string;
}

export interface GoogleReviewsApiResponse {
  success: boolean;
  available: boolean;
  businessName: string;
  placeId: string;
  rating: number | null;
  userRatingsTotal: number | null;
  googleReviewUrl: string;
  reviews: GoogleReview[];
  error?: string;
}

// Authoritative Business References for Occasions Calicut
export const AUTHORITATIVE_PLACE_ID = "ChIJ78EY0zBZozsRz85plGQpYsE";
export const AUTHORITATIVE_REVIEW_URL =
  "https://www.google.com/search?q=occasions+calicut#lrd=0x3ba65930d81cc1ef:0xc1726494649efc9d,1";

// Server-side in-memory cache to prevent exceeding Google Places API quotas
let cachedResponse: GoogleReviewsApiResponse | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function GET() {
  // Check in-memory cache
  if (cachedResponse && Date.now() - lastCacheTime < CACHE_TTL_MS) {
    return NextResponse.json(cachedResponse);
  }

  // Server-side environment key (never exposed to client)
  const apiKey =
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_PLACES_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

  if (!apiKey || apiKey === "your_api_key") {
    const fallbackResponse: GoogleReviewsApiResponse = {
      success: false,
      available: false,
      businessName: "Occasions Calicut",
      placeId: AUTHORITATIVE_PLACE_ID,
      rating: null,
      userRatingsTotal: null,
      googleReviewUrl: AUTHORITATIVE_REVIEW_URL,
      reviews: [],
      error: "Google reviews are temporarily unavailable.",
    };
    return NextResponse.json(fallbackResponse, { status: 200 });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
      AUTHORITATIVE_PLACE_ID
    )}&fields=name,rating,user_ratings_total,reviews,url&key=${apiKey}`;

    const res = await fetch(url, {
      next: { revalidate: 3600 },
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      throw new Error(`Google API responded with HTTP ${res.status}`);
    }

    const data = await res.json();

    if (data.status !== "OK" || !data.result) {
      console.warn("Google Places API error status:", data.status, data.error_message);
      return NextResponse.json({
        success: false,
        available: false,
        businessName: "Occasions Calicut",
        placeId: AUTHORITATIVE_PLACE_ID,
        rating: null,
        userRatingsTotal: null,
        googleReviewUrl: AUTHORITATIVE_REVIEW_URL,
        reviews: [],
        error: "Google reviews are temporarily unavailable.",
      });
    }

    const result = data.result;
    const rawReviews = Array.isArray(result.reviews) ? result.reviews : [];

    // Filter strictly genuine reviews with authentic text and rating
    const validReviews: GoogleReview[] = rawReviews
      .filter(
        (r: any) =>
          r &&
          typeof r.text === "string" &&
          r.text.trim().length > 0 &&
          typeof r.rating === "number"
      )
      .map((r: any, idx: number) => ({
        id: `g-review-${r.time || idx}-${encodeURIComponent(r.author_name || "reviewer")}`,
        author_name: String(r.author_name || "Google Reviewer").trim(),
        rating: Math.min(5, Math.max(1, Number(r.rating) || 5)),
        relative_time_description: String(r.relative_time_description || "Recently").trim(),
        text: String(r.text).trim(),
        time: Number(r.time) || undefined,
        profile_photo_url: r.profile_photo_url || undefined,
        author_url: r.author_url || undefined,
      }));

    const responseData: GoogleReviewsApiResponse = {
      success: true,
      available: validReviews.length > 0,
      businessName: result.name || "Occasions Calicut",
      placeId: AUTHORITATIVE_PLACE_ID,
      rating: typeof result.rating === "number" ? result.rating : null,
      userRatingsTotal:
        typeof result.user_ratings_total === "number" ? result.user_ratings_total : null,
      googleReviewUrl: AUTHORITATIVE_REVIEW_URL,
      reviews: validReviews,
    };

    cachedResponse = responseData;
    lastCacheTime = Date.now();

    return NextResponse.json(responseData, { status: 200 });
  } catch (err: any) {
    console.error("GET /api/google-reviews error:", err);
    return NextResponse.json(
      {
        success: false,
        available: false,
        businessName: "Occasions Calicut",
        placeId: AUTHORITATIVE_PLACE_ID,
        rating: null,
        userRatingsTotal: null,
        googleReviewUrl: AUTHORITATIVE_REVIEW_URL,
        reviews: [],
        error: "Google reviews are temporarily unavailable.",
      },
      { status: 200 }
    );
  }
}
