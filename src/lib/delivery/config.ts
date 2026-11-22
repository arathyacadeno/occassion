/**
 * Delivery Configuration
 * -----------------------
 * Configurable shop locations, delivery tiers and service rules.
 * Uses exact configured shop address and road distance tiers.
 */

export interface ShopConfig {
  id: string;
  name: string;
  address: string;
  pinCode: string;
  /** Latitude of the shop (WGS84) */
  lat: number;
  /** Longitude of the shop (WGS84) */
  lng: number;
}

export interface DeliveryTier {
  /** Upper limit in km (inclusive, null = beyond all tiers → unavailable) */
  maxKm: number | null;
  /** Delivery charge in INR (null = unavailable) */
  charge: number | null;
  label: string;
}

export interface DeliveryZoneConfig {
  shopId: string;
  tiers: DeliveryTier[];
}

// ---------------------------------------------------------------------------
// Shop Locations (Exact Configured Address)
// ---------------------------------------------------------------------------
export const SHOPS: ShopConfig[] = [
  {
    id: "occasions-main",
    name: "Occasions Florist – Kozhikode Main",
    address: "Near CH Flyover, Kannur Road, Calicut, Kerala, 673001",
    pinCode: "673001",
    lat: 11.2588,
    lng: 75.7804,
  },
];

// Default shop used when no shopId is specified
export const DEFAULT_SHOP_ID = "occasions-main";

// ---------------------------------------------------------------------------
// Delivery Tiers
// - Up to 5 km: Free delivery (₹0)
// - More than 5 km and up to 20 km: ₹150
// - More than 20 km and up to 30 km: ₹300
// - More than 30 km and up to 40 km: ₹400
// - More than 40 km and up to 50 km: ₹500
// - More than 50 km: Delivery unavailable
// ---------------------------------------------------------------------------
export const DELIVERY_ZONES: DeliveryZoneConfig[] = [
  {
    shopId: "occasions-main",
    tiers: [
      { maxKm: 5,    charge: 0,    label: "Free delivery" },
      { maxKm: 20,   charge: 150,  label: "₹150 delivery charge" },
      { maxKm: 30,   charge: 300,  label: "₹300 delivery charge" },
      { maxKm: 40,   charge: 400,  label: "₹400 delivery charge" },
      { maxKm: 50,   charge: 500,  label: "₹500 delivery charge" },
      { maxKm: null, charge: null, label: "Delivery not available beyond 50 km" },
    ],
  },
];

export interface DeliveryTierEval {
  id?: string;
  min_km: number;
  max_km: number;
  charge: number;
  label?: string;
  active?: number;
}

/**
 * Pure calculation helper to evaluate distance against delivery tiers.
 * Supports dynamic database tiers configured from the Admin Panel.
 */
export function calculateDeliveryChargeFromDistance(
  distanceKm: number,
  customTiers?: DeliveryTierEval[]
): {
  charge: number | null;
  tier_label: string;
  serviceable: boolean;
  message: string;
} {
  if (isNaN(distanceKm) || distanceKm < 0) {
    return {
      charge: null,
      tier_label: "Invalid distance",
      serviceable: false,
      message: "Unable to calculate delivery distance.",
    };
  }

  // 1. Evaluate against database-configured tiers if available
  if (customTiers && customTiers.length > 0) {
    const activeTiers = customTiers
      .filter((t) => t.active === undefined || t.active === 1)
      .sort((a, b) => a.min_km - b.min_km);

    const match =
      activeTiers.find((t) => {
        if (t.min_km === 0) {
          return distanceKm >= 0 && distanceKm <= t.max_km;
        }
        return distanceKm > t.min_km && distanceKm <= t.max_km;
      }) || activeTiers.find((t) => distanceKm >= t.min_km && distanceKm <= t.max_km);

    if (match) {
      const charge = Number(match.charge);
      let label = match.label?.trim() || "";
      if (charge > 0 && /free/i.test(label)) {
        label = label
          .replace(/\(?Free\s*Express\)?/gi, "(Express Delivery)")
          .replace(/Free\s*delivery/gi, `₹${charge} delivery`)
          .trim();
      }
      if (!label) {
        label = charge === 0 ? "Free delivery" : `₹${charge} delivery charge`;
      }
      const message =
        charge === 0
          ? `Delivery available (Free delivery within ${match.max_km} km)`
          : `Delivery available (₹${charge} delivery charge)`;

      return {
        charge,
        tier_label: label,
        serviceable: true,
        message,
      };
    }

    const maxKm = Math.max(...activeTiers.map((t) => t.max_km), 50);
    return {
      charge: null,
      tier_label: `Delivery not available beyond ${maxKm} km`,
      serviceable: false,
      message: `Sorry, delivery is not available beyond ${maxKm} km. Please enter another delivery location.`,
    };
  }

  // 2. Default fallback tiers
  if (distanceKm <= 5.0) {
    return {
      charge: 0,
      tier_label: "Free delivery",
      serviceable: true,
      message: "Delivery available (Free delivery within 5 km)",
    };
  }
  if (distanceKm <= 20.0) {
    return {
      charge: 150,
      tier_label: "₹150 delivery charge",
      serviceable: true,
      message: "Delivery available (₹150 delivery charge)",
    };
  }
  if (distanceKm <= 30.0) {
    return {
      charge: 300,
      tier_label: "₹300 delivery charge",
      serviceable: true,
      message: "Delivery available (₹300 delivery charge)",
    };
  }
  if (distanceKm <= 40.0) {
    return {
      charge: 400,
      tier_label: "₹400 delivery charge",
      serviceable: true,
      message: "Delivery available (₹400 delivery charge)",
    };
  }
  if (distanceKm <= 50.0) {
    return {
      charge: 500,
      tier_label: "₹500 delivery charge",
      serviceable: true,
      message: "Delivery available (₹500 delivery charge)",
    };
  }
  return {
    charge: null,
    tier_label: "Delivery not available beyond 50 km",
    serviceable: false,
    message: "Sorry, delivery is not available beyond 50 km. Please enter another delivery location.",
  };
}
