/**
 * Delivery Service
 * ----------------
 * Core business logic for PIN validation, distance calculation, and
 * delivery charge computation. Runs on the server only.
 */

import {
  SHOPS,
  DELIVERY_ZONES,
  DEFAULT_SHOP_ID,
  type ShopConfig,
  type DeliveryTier,
} from "./config";
import { PIN_COORDS, type PinCoords } from "./pins";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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
}

export interface DeliveryCheckInput {
  pinCode?: string;
  query?: string;
  /** Optional – defaults to DEFAULT_SHOP_ID */
  shopId?: string;
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
// Haversine distance formula  (returns km)
// ---------------------------------------------------------------------------

function haversineKm(
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
// Tier lookup
// ---------------------------------------------------------------------------

function getTier(distanceKm: number, tiers: DeliveryTier[]): DeliveryTier {
  for (const tier of tiers) {
    if (tier.maxKm === null || distanceKm <= tier.maxKm) {
      return tier;
    }
  }
  return { maxKm: null, charge: null, label: "Delivery not available" };
}

// ---------------------------------------------------------------------------
// PIN validation helper
// ---------------------------------------------------------------------------

function normalisePin(pin: string): string {
  return pin.replace(/\s+/g, "").trim();
}

function isValidPinFormat(pin: string): boolean {
  return /^\d{6}$/.test(normalisePin(pin));
}

// ---------------------------------------------------------------------------
// Main service function
// ---------------------------------------------------------------------------

export function checkDelivery(input: DeliveryCheckInput): DeliveryCheckResult {
  const rawInput = (input.pinCode || input.query || "").trim();
  let pin = normalisePin(rawInput);
  let customerCoords: PinCoords | undefined;

  // 1. If 6 digits, look up PIN directly
  if (isValidPinFormat(pin)) {
    customerCoords = PIN_COORDS[pin];
  } else {
    // 2. Otherwise treat as location name search (e.g. "Beach Road", "Ernakulam")
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

  // If neither valid PIN nor recognized location name
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

  // Resolve shop
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

  // Compute geographic distance (haversine)
  const distanceKm = parseFloat(
    haversineKm(shop.lat, shop.lng, customerCoords.lat, customerCoords.lng).toFixed(1)
  );

  // 5. Resolve delivery zone tiers for this shop
  const zoneConfig = DELIVERY_ZONES.find((z) => z.shopId === shopId);
  if (!zoneConfig) {
    return {
      serviceable: false,
      distance_km: distanceKm,
      delivery_charge: null,
      area: customerCoords.area,
      district: customerCoords.district,
      state: customerCoords.state,
      message:
        "Sorry, delivery is not available to this location. Please enter another delivery location.",
      tier_label: null,
    };
  }

  // 6. Find matching tier
  const tier = getTier(distanceKm, zoneConfig.tiers);

  if (tier.charge === null) {
    return {
      serviceable: false,
      distance_km: distanceKm,
      delivery_charge: null,
      area: customerCoords.area,
      district: customerCoords.district,
      state: customerCoords.state,
      message:
        "Sorry, delivery is not available to this location. Please enter another delivery location.",
      tier_label: tier.label,
    };
  }

  return {
    serviceable: true,
    distance_km: distanceKm,
    delivery_charge: tier.charge,
    area: customerCoords.area,
    district: customerCoords.district,
    state: customerCoords.state,
    message: "Delivery available",
    tier_label: tier.label,
  };
}
