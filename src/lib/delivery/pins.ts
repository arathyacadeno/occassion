/**
 * PIN Code Coordinates Database
 * --------------------------------
 * Maps Kozhikode-district (and surrounding area) PIN codes to approximate
 * GPS coordinates used for haversine distance calculation.
 *
 * NOTE: Coordinates are approximate centroids (good for delivery-radius checks,
 * not routing). Verify PINs against the India Post directory before production.
 */

export interface PinCoords {
  lat: number;
  lng: number;
  area: string;
  district: string;
  state: string;
}

export const PIN_COORDS: Record<string, PinCoords> = {
  // ── Kozhikode City ─────────────────────────────────────────────────────
  "673001": { lat: 11.2514, lng: 75.7767, area: "Kozhikode City",   district: "Kozhikode", state: "Kerala" },
  "673002": { lat: 11.2520, lng: 75.7830, area: "Palayam",          district: "Kozhikode", state: "Kerala" },
  "673003": { lat: 11.2370, lng: 75.7790, area: "Kallai",           district: "Kozhikode", state: "Kerala" },
  "673004": { lat: 11.2650, lng: 75.8000, area: "Mavoor Road",      district: "Kozhikode", state: "Kerala" },
  "673005": { lat: 11.2790, lng: 75.7660, area: "West Hill",        district: "Kozhikode", state: "Kerala" },
  "673006": { lat: 11.2800, lng: 75.7900, area: "Eranhipalam",      district: "Kozhikode", state: "Kerala" },
  "673008": { lat: 11.2820, lng: 75.8350, area: "Medical College",  district: "Kozhikode", state: "Kerala" },
  "673011": { lat: 11.2690, lng: 75.7830, area: "Nadakkavu",        district: "Kozhikode", state: "Kerala" },
  "673015": { lat: 11.1700, lng: 75.8020, area: "Beypore",          district: "Kozhikode", state: "Kerala" },
  "673017": { lat: 11.2800, lng: 75.8060, area: "Chevayur",         district: "Kozhikode", state: "Kerala" },
  "673027": { lat: 11.2300, lng: 75.8000, area: "Nallalam",         district: "Kozhikode", state: "Kerala" },

  // ── Kozhikode District ─────────────────────────────────────────────────
  "673631": { lat: 11.1850, lng: 75.8370, area: "Feroke",           district: "Kozhikode", state: "Kerala" },
  "673633": { lat: 11.1700, lng: 75.8700, area: "Ramanattukara",    district: "Kozhikode", state: "Kerala" },
  "673571": { lat: 11.3040, lng: 75.8770, area: "Kunnamangalam",    district: "Kozhikode", state: "Kerala" },
  "673303": { lat: 11.3300, lng: 75.7400, area: "Elathur",          district: "Kozhikode", state: "Kerala" },
  "673305": { lat: 11.4360, lng: 75.6930, area: "Koyilandy",        district: "Kozhikode", state: "Kerala" },
  "673101": { lat: 11.6000, lng: 75.5900, area: "Vadakara",         district: "Kozhikode", state: "Kerala" },
  "673523": { lat: 11.5130, lng: 75.6700, area: "Payyoli",          district: "Kozhikode", state: "Kerala" },
  "673525": { lat: 11.5640, lng: 75.7570, area: "Perambra",         district: "Kozhikode", state: "Kerala" },
  "673508": { lat: 11.6400, lng: 75.7600, area: "Kuttiady",         district: "Kozhikode", state: "Kerala" },
  "673612": { lat: 11.4560, lng: 75.8350, area: "Balussery",        district: "Kozhikode", state: "Kerala" },
  "673573": { lat: 11.4070, lng: 75.9370, area: "Thamarassery",     district: "Kozhikode", state: "Kerala" },
  "673572": { lat: 11.3500, lng: 75.9100, area: "Koduvally",        district: "Kozhikode", state: "Kerala" },
  "673602": { lat: 11.3130, lng: 76.0480, area: "Mukkam",           district: "Kozhikode", state: "Kerala" },
  "673661": { lat: 11.2630, lng: 75.9450, area: "Mavoor",           district: "Kozhikode", state: "Kerala" },

  // ── Mahe / Kannur ──────────────────────────────────────────────────────
  "673310": { lat: 11.7002, lng: 75.5341, area: "Mahe",             district: "Mahe",      state: "Puducherry" },
  "670101": { lat: 11.7490, lng: 75.4890, area: "Thalassery",       district: "Kannur",    state: "Kerala" },

  // ── Malappuram ─────────────────────────────────────────────────────────
  "673647": { lat: 11.1360, lng: 75.9500, area: "Karipur Airport",  district: "Malappuram", state: "Kerala" },
  "673638": { lat: 11.1480, lng: 75.9620, area: "Kondotty",         district: "Malappuram", state: "Kerala" },
  "676101": { lat: 10.9100, lng: 75.9220, area: "Tirur",            district: "Malappuram", state: "Kerala" },
  "679322": { lat: 10.9760, lng: 76.2260, area: "Perinthalmanna",   district: "Malappuram", state: "Kerala" },
  "676121": { lat: 11.1200, lng: 76.1200, area: "Manjeri",          district: "Malappuram", state: "Kerala" },
  "676505": { lat: 11.0730, lng: 76.0740, area: "Malappuram Town",  district: "Malappuram", state: "Kerala" },
  "679577": { lat: 10.7670, lng: 75.9250, area: "Ponnani",          district: "Malappuram", state: "Kerala" },
  "679329": { lat: 11.2790, lng: 76.2270, area: "Nilambur",         district: "Malappuram", state: "Kerala" },

  // ── Wayanad ────────────────────────────────────────────────────────────
  "673121": { lat: 11.6080, lng: 76.0830, area: "Kalpetta",         district: "Wayanad",   state: "Kerala" },
  "670645": { lat: 11.8010, lng: 76.0040, area: "Mananthavady",     district: "Wayanad",   state: "Kerala" },
  "673592": { lat: 11.6640, lng: 76.2570, area: "Sulthan Bathery",  district: "Wayanad",   state: "Kerala" },

  // ── Palakkad / Thrissur ────────────────────────────────────────────────
  "678001": { lat: 10.7867, lng: 76.6548, area: "Palakkad Town",    district: "Palakkad",  state: "Kerala" },
  "679101": { lat: 10.7700, lng: 76.3770, area: "Ottapalam",        district: "Palakkad",  state: "Kerala" },
  "680001": { lat: 10.5276, lng: 76.2144, area: "Thrissur",         district: "Thrissur",  state: "Kerala" },

  // ── Ernakulam / Kochi ──────────────────────────────────────────────────
  "682017": { lat: 9.9816,  lng: 76.2999, area: "Ernakulam",        district: "Ernakulam", state: "Kerala" },
  "682001": { lat: 9.9639,  lng: 76.2427, area: "Fort Kochi",       district: "Ernakulam", state: "Kerala" },
};

/** Look up coordinates for a PIN (returns undefined if unknown). */
export function getPinCoords(pin: string): PinCoords | undefined {
  return PIN_COORDS[pin.trim()];
}

/** Haversine distance between two coordinates, in kilometres. */
export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Distance in km between two PINs, or null if either is unknown. */
export function distanceBetweenPins(pinA: string, pinB: string): number | null {
  const a = getPinCoords(pinA);
  const b = getPinCoords(pinB);
  return a && b ? haversineKm(a, b) : null;
}