/**
 * Delivery Configuration
 * -----------------------
 * Configurable shop locations, delivery tiers and service rules.
 * Designed to support multiple shops and zones in the future.
 */

export interface ShopConfig {
  id: string;
  name: string;
  pinCode: string;
  /** Latitude of the shop (WGS84) */
  lat: number;
  /** Longitude of the shop (WGS84) */
  lng: number;
}

export interface DeliveryTier {
  /** Exclusive upper limit in km (null = beyond all tiers → unavailable) */
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
// Shop Locations
// ---------------------------------------------------------------------------
export const SHOPS: ShopConfig[] = [
  {
    id: "occasions-main",
    name: "Occasions Florist – Kozhikode Main",
    pinCode: "673001",
    // Kozhikode (Calicut) city centre, approximate coords for PIN 673001
    lat: 11.2588,
    lng: 75.7804,
  },
];

// Default shop used when no shopId is specified
export const DEFAULT_SHOP_ID = "occasions-main";

// ---------------------------------------------------------------------------
// Delivery Tiers  (evaluated in order, first match wins)
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
