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

/**
 * Pure calculation helper to evaluate distance against delivery tiers.
 */
export function calculateDeliveryChargeFromDistance(distanceKm: number): {
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
