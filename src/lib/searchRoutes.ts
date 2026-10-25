/**
 * Strict central search routing map
 * ---------------------------------
 * Maps normalized search queries and approved aliases to real product routes.
 * Prevents fuzzy false matches, unwanted non-product redirects (cart, contact, etc.),
 * and ensures unmatched queries route cleanly to /search?q=...
 */

export const SEARCH_ROUTE_MAP: Record<string, string> = {
  // Flowers
  "rose": "/flowers/roses",
  "roses": "/flowers/roses",
  "red rose": "/flowers/roses",
  "red roses": "/flowers/roses",

  "lily": "/flowers/lilies",
  "lilies": "/flowers/lilies",

  "sunflower": "/flowers/sunflowers",
  "sunflowers": "/flowers/sunflowers",

  "tulip": "/flowers/tulips",
  "tulips": "/flowers/tulips",

  "carnation": "/flowers/carnations",
  "carnations": "/flowers/carnations",

  "peony": "/flowers/peonies",
  "peonies": "/flowers/peonies",

  "orchid": "/flowers/orchids",
  "orchids": "/flowers/orchids",

  // Categories
  "cake": "/cakes",
  "cakes": "/cakes",

  "flower bouquet": "/flower-bouquets",
  "flower bouquets": "/flower-bouquets",
  "bouquet": "/flower-bouquets",
  "bouquets": "/flower-bouquets",

  "flower basket": "/flower-baskets",
  "flower baskets": "/flower-baskets",
  "basket": "/flower-baskets",
  "baskets": "/flower-baskets",
  "flowers in basket": "/flower-baskets",
  "flowers in baskets": "/flower-baskets",

  "table decor": "/table-decor",
  "table": "/table-decor",
  "decor": "/table-decor",
  "centerpiece": "/table-decor",
  "centerpieces": "/table-decor",

  "wreath": "/wreaths",
  "wreaths": "/wreaths",

  // Privacy Policy
  "privacy": "/privacy-policy",
  "privacy policy": "/privacy-policy",

  // Contact
  "contact": "/contact",
  "contact us": "/contact",
  "connect": "/contact",
  "connect with us": "/contact",
  "support": "/contact",

  // About
  "about": "/about",
  "about us": "/about",
};

/**
 * Normalizes query string: trims whitespace, converts to lowercase,
 * collapses internal multiple spaces into a single space.
 */
export function normalizeQuery(query: string): string {
  return (query || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/**
 * Returns matching destination route, or null if no exact/alias match exists.
 */
export function getSearchRoute(rawQuery: string): string | null {
  const normalized = normalizeQuery(rawQuery);
  if (!normalized) return null;
  return SEARCH_ROUTE_MAP[normalized] ?? null;
}
