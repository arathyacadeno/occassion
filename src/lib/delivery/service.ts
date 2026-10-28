/**
 * Delivery Service
 * ----------------
 * Core business logic for PIN & Address validation, road distance calculation,
 * and delivery charge computation.
 *
 * Rules:
 * - Up to 5 km: Free delivery (₹0)
 * - More than 5 km and up to 20 km: ₹150
 * - More than 20 km and up to 30 km: ₹300
 * - More than 30 km and up to 40 km: ₹400
 * - More than 40 km and up to 50 km: ₹500
 * - More than 50 km: Delivery unavailable
 */

import {
  SHOPS,
  DEFAULT_SHOP_ID,
  calculateDeliveryChargeFromDistance,
  type ShopConfig,
} from "./config";
import { PIN_COORDS, type PinCoords } from "./pins";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DeliveryAddressDetails {
  houseBuilding?: string;
  street?: string;
  landmark?: string;
  area?: string;
  city?: string;
  state?: string;
  pinCode?: string;
}

export interface DeliveryCheckInput {
  pinCode?: string;
  query?: string;
  address?: string | DeliveryAddressDetails;
  /** Optional – defaults to DEFAULT_SHOP_ID */
  shopId?: string;
}

export interface DeliveryCheckResult {
  serviceable: boolean;
  pinCode?: string | null;
  distance_km: number | null;
  delivery_charge: number | null;
  area: string | null;
  district: string | null;
  state: string | null;
  message: string;
  tier_label: string | null;
  calculation_method?: "google_matrix" | "osrm_road" | "haversine_circuity";
  origin_address?: string;
  destination_address?: string;
}

// ---------------------------------------------------------------------------
// Location search helper (autocomplete)
// ---------------------------------------------------------------------------

export interface LocationSearchResult {
  pinCode: string;
  area: string;
  district: string;
  state: string;
}

export function searchLocations(query: string): LocationSearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q || q.length < 2) return [];

  const results: LocationSearchResult[] = [];
  for (const [pin, info] of Object.entries(PIN_COORDS)) {
    if (
      pin.startsWith(q) ||
      info.area.toLowerCase().includes(q) ||
      info.district.toLowerCase().includes(q) ||
      info.state.toLowerCase().includes(q)
    ) {
      results.push({
        pinCode: pin,
        area: info.area,
        district: info.district,
        state: info.state,
      });
      if (results.length >= 8) break;
    }
  }
  return results;
}

// ---------------------------------------------------------------------------
// Haversine distance formula (straight-line km)
// ---------------------------------------------------------------------------

export function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

// ---------------------------------------------------------------------------
// PIN & Address validation helpers
// ---------------------------------------------------------------------------

export function normalisePin(pin: string): string {
  return pin.replace(/\s+/g, "").trim();
}

export function isValidPinFormat(pin: string): boolean {
  return /^\d{6}$/.test(normalisePin(pin));
}

export function formatFullAddress(
  address?: string | DeliveryAddressDetails,
  fallbackPin?: string
): string {
  if (!address) return fallbackPin || "";
  if (typeof address === "string") return address.trim();

  const parts = [
    address.houseBuilding,
    address.street,
    address.landmark,
    address.area,
    address.city || "Kozhikode",
    address.state || "Kerala",
    address.pinCode || fallbackPin,
  ]
    .filter(Boolean)
    .map((s) => String(s).trim())
    .filter(Boolean);

  return parts.join(", ");
}

// ---------------------------------------------------------------------------
// Geocoding & Road Distance Computation
// ---------------------------------------------------------------------------

async function fetchGoogleDistanceMatrixKm(
  originAddress: string,
  destinationAddress: string,
  apiKey: string
): Promise<number | null> {
  try {
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
      originAddress
    )}&destinations=${encodeURIComponent(destinationAddress)}&key=${apiKey}`;

    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    const data = await res.json();

    if (
      data.status === "OK" &&
      data.rows?.[0]?.elements?.[0]?.status === "OK" &&
      typeof data.rows[0].elements[0].distance?.value === "number"
    ) {
      const distanceMeters = data.rows[0].elements[0].distance.value;
      return parseFloat((distanceMeters / 1000).toFixed(1));
    }
  } catch (err) {
    console.warn("[DistanceMatrix] Google API lookup error:", err);
  }
  return null;
}

async function fetchOsrmRoadDistanceKm(
  originLng: number,
  originLat: number,
  destLng: number,
  destLat: number
): Promise<number | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=false`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
    const data = await res.json();

    if (data.code === "Ok" && data.routes?.[0]?.distance) {
      const distanceMeters = data.routes[0].distance;
      return parseFloat((distanceMeters / 1000).toFixed(1));
    }
  } catch (err) {
    console.warn("[OSRM] Driving route calculation error:", err);
  }
  return null;
}

async function resolveCoordinatesExternal(
  query: string
): Promise<{ lat: number; lng: number; area?: string; district?: string; state?: string } | null> {
  try {
    // If 6-digit PIN, query Postal PIN Code API
    if (isValidPinFormat(query)) {
      const pinRes = await fetch(`https://api.postalpincode.in/pincode/${query}`, {
        signal: AbortSignal.timeout(3000),
      });
      const pinData = await pinRes.json();
      if (pinData?.[0]?.Status === "Success" && pinData[0].PostOffice?.[0]) {
        const po = pinData[0].PostOffice[0];
        // Now geocode the PostOffice name and District
        const geoQuery = `${po.Name}, ${po.District}, Kerala, India`;
        const nomRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            geoQuery
          )}&limit=1`,
          {
            headers: { "User-Agent": "OccasionsFlorist/1.0" },
            signal: AbortSignal.timeout(3000),
          }
        );
        const nomData = await nomRes.json();
        if (nomData && nomData[0]?.lat && nomData[0]?.lon) {
          return {
            lat: parseFloat(nomData[0].lat),
            lng: parseFloat(nomData[0].lon),
            area: po.Name,
            district: po.District,
            state: po.State,
          };
        }
      }
    }
  } catch (err) {
    console.warn("[Geocode] External location lookup error:", err);
  }
  return null;
}

// ---------------------------------------------------------------------------
// Main Service Functions (Async & Sync)
// ---------------------------------------------------------------------------

/**
 * Calculates road distance and delivery charge asynchronously using
 * Google Maps / OSRM mapping APIs with verified fallback.
 */
export async function checkDeliveryAsync(
  input: DeliveryCheckInput
): Promise<DeliveryCheckResult> {
  const rawInput = (
    input.pinCode ||
    (typeof input.address === "object" ? input.address.pinCode : "") ||
    input.query ||
    ""
  ).trim();

  let pin = normalisePin(rawInput);
  let customerCoords: PinCoords | undefined;

  // 1. Direct PIN lookup in pre-compiled coordinate database
  if (isValidPinFormat(pin)) {
    customerCoords = PIN_COORDS[pin];
  }

  // 2. Location name match if PIN wasn't matched
  if (!customerCoords && rawInput) {
    const lower = rawInput.toLowerCase();
    for (const [p, info] of Object.entries(PIN_COORDS)) {
      if (
        info.area.toLowerCase() === lower ||
        info.area.toLowerCase().includes(lower) ||
        info.district.toLowerCase() === lower
      ) {
        pin = p;
        customerCoords = info;
        break;
      }
    }
  }

  // 3. Fallback to external geocoding for newly added or unknown PIN codes
  if (!customerCoords && isValidPinFormat(pin)) {
    const external = await resolveCoordinatesExternal(pin);
    if (external) {
      customerCoords = {
        lat: external.lat,
        lng: external.lng,
        area: external.area || "Kozhikode District",
        district: external.district || "Kozhikode",
        state: external.state || "Kerala",
      };
    }
  }

  // If location cannot be resolved
  if (!customerCoords || !isValidPinFormat(pin)) {
    return {
      serviceable: false,
      pinCode: isValidPinFormat(pin) ? pin : null,
      distance_km: null,
      delivery_charge: null,
      area: null,
      district: null,
      state: null,
      message:
        "Sorry, delivery is not available to this location. Please enter another delivery location.",
      tier_label: null,
    };
  }

  // Resolve shop origin (exact configured address)
  const shopId = input.shopId ?? DEFAULT_SHOP_ID;
  const shop: ShopConfig | undefined = SHOPS.find((s) => s.id === shopId);
  if (!shop) {
    return {
      serviceable: false,
      pinCode: pin,
      distance_km: null,
      delivery_charge: null,
      area: null,
      district: null,
      state: null,
      message: "Shop configuration error. Please contact support.",
      tier_label: null,
    };
  }

  const destinationAddress = formatFullAddress(input.address, pin);

  // 4. Calculate Road Distance using Available APIs
  let roadDistanceKm: number | null = null;
  let calculationMethod: "google_matrix" | "osrm_road" | "haversine_circuity" = "osrm_road";

  // Option A: Google Maps Distance Matrix API (if key configured)
  const googleKey =
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ||
    process.env.DISTANCE_MATRIX_API_KEY;

  if (googleKey) {
    const destForGoogle = destinationAddress || `${customerCoords.lat},${customerCoords.lng}`;
    roadDistanceKm = await fetchGoogleDistanceMatrixKm(shop.address, destForGoogle, googleKey);
    if (roadDistanceKm !== null) {
      calculationMethod = "google_matrix";
    }
  }

  // Option B: OSRM Driving Road Distance API (Real OpenStreetMap road network)
  if (roadDistanceKm === null) {
    roadDistanceKm = await fetchOsrmRoadDistanceKm(
      shop.lng,
      shop.lat,
      customerCoords.lng,
      customerCoords.lat
    );
    if (roadDistanceKm !== null) {
      calculationMethod = "osrm_road";
    }
  }

  // Option C: Safe Mathematical Fallback (Haversine * Kerala Urban Road Circuity 1.25)
  if (roadDistanceKm === null) {
    const straightKm = haversineKm(shop.lat, shop.lng, customerCoords.lat, customerCoords.lng);
    roadDistanceKm = parseFloat((straightKm * 1.25).toFixed(1));
    calculationMethod = "haversine_circuity";
  }

  // 5. Apply Delivery Charge Rules
  const tierResult = calculateDeliveryChargeFromDistance(roadDistanceKm);

  return {
    serviceable: tierResult.serviceable,
    pinCode: pin,
    distance_km: roadDistanceKm,
    delivery_charge: tierResult.charge,
    area: customerCoords.area,
    district: customerCoords.district,
    state: customerCoords.state,
    message: tierResult.message,
    tier_label: tierResult.tier_label,
    calculation_method: calculationMethod,
    origin_address: shop.address,
    destination_address: destinationAddress,
  };
}

/**
 * Synchronous delivery check helper (uses local coordinates and road circuity factor).
 * Used for instant fallbacks and fast offline tests.
 */
export function checkDelivery(input: DeliveryCheckInput): DeliveryCheckResult {
  const rawInput = (
    input.pinCode ||
    (typeof input.address === "object" ? input.address.pinCode : "") ||
    input.query ||
    ""
  ).trim();

  let pin = normalisePin(rawInput);
  let customerCoords: PinCoords | undefined;

  if (isValidPinFormat(pin)) {
    customerCoords = PIN_COORDS[pin];
  } else {
    const lower = rawInput.toLowerCase();
    for (const [p, info] of Object.entries(PIN_COORDS)) {
      if (
        info.area.toLowerCase() === lower ||
        info.area.toLowerCase().includes(lower) ||
        info.district.toLowerCase() === lower
      ) {
        pin = p;
        customerCoords = info;
        break;
      }
    }
  }

  if (!customerCoords || !isValidPinFormat(pin)) {
    return {
      serviceable: false,
      pinCode: null,
      distance_km: null,
      delivery_charge: null,
      area: null,
      district: null,
      state: null,
      message:
        "Sorry, delivery is not available to this location. Please enter another delivery location.",
      tier_label: null,
    };
  }

  const shopId = input.shopId ?? DEFAULT_SHOP_ID;
  const shop: ShopConfig | undefined = SHOPS.find((s) => s.id === shopId);
  if (!shop) {
    return {
      serviceable: false,
      pinCode: pin,
      distance_km: null,
      delivery_charge: null,
      area: null,
      district: null,
      state: null,
      message: "Shop configuration error. Please contact support.",
      tier_label: null,
    };
  }

  // Haversine straight-line distance * circuity factor for road estimate
  const straightLineKm = haversineKm(shop.lat, shop.lng, customerCoords.lat, customerCoords.lng);
  // For local city (<= 4km straight line), road distance is usually within 5km (e.g. Kallai 673003 is ~3.8km)
  const distanceKm = parseFloat((straightLineKm * 1.25).toFixed(1));

  const tierResult = calculateDeliveryChargeFromDistance(distanceKm);

  return {
    serviceable: tierResult.serviceable,
    pinCode: pin,
    distance_km: distanceKm,
    delivery_charge: tierResult.charge,
    area: customerCoords.area,
    district: customerCoords.district,
    state: customerCoords.state,
    message: tierResult.message,
    tier_label: tierResult.tier_label,
    calculation_method: "haversine_circuity",
    origin_address: shop.address,
  };
}
