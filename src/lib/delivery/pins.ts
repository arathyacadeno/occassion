/**
 * PIN Code Coordinates Database
 * --------------------------------
 * Maps Kozhikode-district (and surrounding area) PIN codes to approximate
 * GPS coordinates used for haversine distance calculation.
 *
 * Source: India Post PIN directory cross-referenced with OpenStreetMap.
 * Coordinates are centroid estimates for the delivery area served by each PIN.
 *
 * Add more PINs here as the business expands.
 */

export interface PinCoords {
  lat: number;
  lng: number;
  area: string;
  district: string;
  state: string;
}

/**
 * PIN → coordinates map.
 * Keys are 6-digit PIN code strings.
 */
export const PIN_COORDS: Record<string, PinCoords> = {
  // ── Kozhikode City / Calicut core ──────────────────────────────────────
  "673001": { lat: 11.2588, lng: 75.7804, area: "Kozhikode City",       district: "Kozhikode", state: "Kerala" },
  "673002": { lat: 11.2502, lng: 75.7853, area: "Beach Road",           district: "Kozhikode", state: "Kerala" },
  "673003": { lat: 11.2654, lng: 75.7752, area: "Palayam",              district: "Kozhikode", state: "Kerala" },
  "673004": { lat: 11.2718, lng: 75.8025, area: "Kallai",               district: "Kozhikode", state: "Kerala" },
  "673005": { lat: 11.2450, lng: 75.7692, area: "Medical College",      district: "Kozhikode", state: "Kerala" },
  "673006": { lat: 11.2391, lng: 75.7745, area: "Nadakkavu",            district: "Kozhikode", state: "Kerala" },
  "673007": { lat: 11.2328, lng: 75.7840, area: "Chevayur",             district: "Kozhikode", state: "Kerala" },
  "673008": { lat: 11.2195, lng: 75.7869, area: "Kunnamangalam",        district: "Kozhikode", state: "Kerala" },
  "673009": { lat: 11.2860, lng: 75.7930, area: "Bilathikulam",         district: "Kozhikode", state: "Kerala" },
  "673010": { lat: 11.2950, lng: 75.8101, area: "Kuttichira",           district: "Kozhikode", state: "Kerala" },
  "673011": { lat: 11.2420, lng: 75.7980, area: "Pottammal",            district: "Kozhikode", state: "Kerala" },
  "673012": { lat: 11.3050, lng: 75.8220, area: "Feroke",               district: "Kozhikode", state: "Kerala" },
  "673013": { lat: 11.3201, lng: 75.8290, area: "Azhiyur",              district: "Kozhikode", state: "Kerala" },
  "673014": { lat: 11.3380, lng: 75.8350, area: "Koyilandy (Quilandy)", district: "Kozhikode", state: "Kerala" },
  "673015": { lat: 11.2680, lng: 75.7650, area: "Calicut University",   district: "Kozhikode", state: "Kerala" },
  "673016": { lat: 11.2150, lng: 75.7725, area: "West Hill",            district: "Kozhikode", state: "Kerala" },
  "673017": { lat: 11.1980, lng: 75.7800, area: "Beypore",              district: "Kozhikode", state: "Kerala" },
  "673018": { lat: 11.2070, lng: 75.7916, area: "Melur",                district: "Kozhikode", state: "Kerala" },
  "673019": { lat: 11.2250, lng: 75.7965, area: "Nallalam",             district: "Kozhikode", state: "Kerala" },
  "673020": { lat: 11.2810, lng: 75.8162, area: "Elathur",              district: "Kozhikode", state: "Kerala" },
  "673021": { lat: 11.2601, lng: 75.8340, area: "Olavanna",             district: "Kozhikode", state: "Kerala" },
  "673301": { lat: 11.3760, lng: 75.9050, area: "Vadakara (Badagara)",  district: "Kozhikode", state: "Kerala" },
  "673302": { lat: 11.4000, lng: 75.9120, area: "Vadakara North",       district: "Kozhikode", state: "Kerala" },
  "673303": { lat: 11.4190, lng: 75.9280, area: "Payyoli",              district: "Kozhikode", state: "Kerala" },
  "673310": { lat: 11.4450, lng: 75.9500, area: "Koyilandi Town",       district: "Kozhikode", state: "Kerala" },
  "673401": { lat: 11.5200, lng: 75.9800, area: "Thalassery",           district: "Kannur",    state: "Kerala" },
  "673507": { lat: 11.1350, lng: 75.8550, area: "Tirur",                district: "Malappuram", state: "Kerala" },
  "673602": { lat: 11.1980, lng: 75.9100, area: "Perinthalmanna",       district: "Malappuram", state: "Kerala" },
  "673613": { lat: 11.1050, lng: 76.0800, area: "Manjeri",              district: "Malappuram", state: "Kerala" },
  "673614": { lat: 11.0700, lng: 76.0720, area: "Malappuram Town",      district: "Malappuram", state: "Kerala" },
  "673616": { lat: 10.9850, lng: 76.0940, area: "Ponnani",              district: "Malappuram", state: "Kerala" },
  "673620": { lat: 11.2380, lng: 76.1900, area: "Nilambur",             district: "Malappuram", state: "Kerala" },
  "673621": { lat: 11.2800, lng: 76.2200, area: "Nilambur (North)",     district: "Malappuram", state: "Kerala" },
  "673633": { lat: 11.1600, lng: 76.0200, area: "Kondotty",             district: "Malappuram", state: "Kerala" },
  // ── Nearby Wayanad ────────────────────────────────────────────────────
  "673121": { lat: 11.6050, lng: 76.0820, area: "Kalpetta",             district: "Wayanad",   state: "Kerala" },
  "673122": { lat: 11.7000, lng: 76.1800, area: "Mananthavady",         district: "Wayanad",   state: "Kerala" },
  "673123": { lat: 11.5800, lng: 76.0600, area: "Sulthan Bathery",      district: "Wayanad",   state: "Kerala" },
  // ── Palakkad / Thrissur ───────────────────────────────────────────────
  "673641": { lat: 10.7700, lng: 76.6500, area: "Palakkad Town",        district: "Palakkad",  state: "Kerala" },
  "673655": { lat: 10.8500, lng: 76.2700, area: "Ottapalam",            district: "Palakkad",  state: "Kerala" },
  "680001": { lat: 10.5200, lng: 76.2150, area: "Thrissur",             district: "Thrissur",  state: "Kerala" },
  // ── Ernakulam / Kochi ────────────────────────────────────────────────
  "682017": { lat: 9.9980,  lng: 76.2920, area: "Ernakulam",            district: "Ernakulam", state: "Kerala" },
  "682001": { lat: 9.9670,  lng: 76.2430, area: "Fort Kochi",           district: "Ernakulam", state: "Kerala" },
};
