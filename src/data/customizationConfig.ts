import { ProductCustomizationConfig, BouquetSizeOption, WrappingOption, RibbonOption, DecorationOption, FlowerVarietyOption, CustomizerAddonOption } from "@/types/customization";
import { Product, getProductsForFlower, CATALOG_PRODUCTS } from "./catalog";

// Standard bouquet sizes with stem counts & sensible additional charges
export const DEFAULT_SIZES: BouquetSizeOption[] = [
  { id: "small", name: "Small (Standard)", stemsText: "12 - 15 Stems", extraPrice: 0, isDefault: true },
  { id: "medium", name: "Medium", stemsText: "18 - 22 Stems", extraPrice: 200 },
  { id: "large", name: "Large Deluxe", stemsText: "26 - 30 Stems", extraPrice: 450 },
  { id: "premium", name: "Premium Luxe Atelier", stemsText: "36 - 42 Stems", extraPrice: 750 },
];

// High quality wrapping paper options using existing project visual identity
export const DEFAULT_WRAPPING_PAPERS: WrappingOption[] = [
  { id: "craft-natural", name: "Classic Natural Craft Wrap", extraPrice: 0, colorCode: "#d7ba9d" },
  { id: "blush-pink-matte", name: "Blush Pink Matte Luxury Wrap", extraPrice: 80, colorCode: "#fbcfe8" },
  { id: "champagne-gold-foil", name: "Champagne Gold Foil Border", extraPrice: 120, colorCode: "#fef08a" },
  { id: "midnight-black-gold", name: "Midnight Onyx & Gold Accent", extraPrice: 100, colorCode: "#18181b" },
  { id: "frosted-pearl", name: "Frosted Pearl Minimalist Wrap", extraPrice: 90, colorCode: "#f8fafc" },
];

// Curated satin ribbon colors with exact hex color swatches
export const DEFAULT_RIBBON_COLORS: RibbonOption[] = [
  { id: "champagne-gold", name: "Champagne Gold Ribbon", colorCode: "#d4af37", extraPrice: 0 },
  { id: "blush-pink", name: "Blush Rose Pink Ribbon", colorCode: "#f472b6", extraPrice: 30 },
  { id: "royal-crimson", name: "Royal Crimson Red Ribbon", colorCode: "#be185d", extraPrice: 30 },
  { id: "deep-maroon", name: "Deep Maroon Satin Ribbon", colorCode: "#831843", extraPrice: 40 },
  { id: "lavender-violet", name: "Lavender Violet Ribbon", colorCode: "#a855f7", extraPrice: 30 },
  { id: "emerald-green", name: "Forest Emerald Ribbon", colorCode: "#059669", extraPrice: 30 },
  { id: "ivory-silk", name: "Ivory Silk Ribbon", colorCode: "#fef3c7", extraPrice: 30 },
];

// Supported fresh foliage and floral decorations

// Curated Luxury Add-ons for Master Customizer
export const DEFAULT_CUSTOMIZER_ADDONS: CustomizerAddonOption[] = [
  {
    id: "premium-wrap",
    name: "Signature Artisanal Velvet Wrap",
    category: "wrapping",
    extraPrice: 150,
    image: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647373/occasions/products/flower-bouquet/flower-bouquet-black-velvet-roses.png",
    description: "Double-layered luxury matte paper with velvet textured finish",
  },
  {
    id: "deluxe-chocolate",
    name: "Ferrero Rocher Deluxe Box",
    category: "chocolate",
    extraPrice: 450,
    image: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647342/occasions/products/addons/addons-ferrero-rocher-24.png",
    description: "Crisp hazelnut and milk chocolate pralines (24 pcs gold gift box)",
  },
  {
    id: "keepsake-card",
    name: "Luxe Gold Foil Letterpress Card",
    category: "card",
    extraPrice: 90,
    image: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647413/occasions/products/flower-bouquet/flower-bouquet-sunflower-bouquet-with-ribbon-tag.png",
    description: "Heavyweight cotton card stock with hand-stamped gold foil",
  },
  {
    id: "satin-ribbon",
    name: "Double-Satin French Ribbon Knot",
    category: "ribbon",
    extraPrice: 60,
    image: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647374/occasions/products/flower-bouquet/flower-bouquet-brown-non-woven-pink-ribbon.jpg",
    description: "Hand-tied 38mm lustrous woven double-faced French satin ribbon",
  },
];

export const DEFAULT_DECORATIONS: DecorationOption[] = [
  { id: "babys-breath", name: "Fresh Baby's Breath (Gypsophila)", extraPrice: 100, description: "Delicate cloud-like white blooms adding airy texture" },
  { id: "ruscus-greens", name: "Italian Ruscus Greenery", extraPrice: 70, description: "Vibrant emerald leafy foliage framing the arrangement" },
  { id: "eucalyptus", name: "Fragrant Silver Dollar Eucalyptus", extraPrice: 90, description: "Aromatic soft-green leaves providing calming scent" },
  { id: "golden-fillers", name: "Decorative Floral Sparkle Fillers", extraPrice: 120, description: "Subtle celebratory botanical accents for milestones" },
];

// Category-tailored flower varieties & blends
export const CATEGORY_FLOWER_VARIETIES: Record<string, FlowerVarietyOption[]> = {
  chrysanthemums: [
    { id: "chrys-white", name: "Pure Snow White Chrysanthemums", extraPrice: 0, description: "Crisp snowy blooms radiating freshness", image: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647362/occasions/products/general/chrysanthemum.png" },
    { id: "chrys-pink", name: "Soft Blush Pink Chrysanthemums", extraPrice: 150, description: "Delicate pastel petals with warm romantic tones", image: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647362/occasions/products/general/chrysanthemum.png" },
    { id: "chrys-yellow", name: "Sunshine Golden Chrysanthemums", extraPrice: 100, description: "Vibrant yellow joyful blooms full of warmth", image: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647362/occasions/products/general/chrysanthemum.png" },
    { id: "chrys-rose-mix", name: "Chrysanthemums & Rose Medley", extraPrice: 250, description: "Blended with fresh Dutch premium roses", image: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647423/occasions/products/general/rose.jpg" },
  ],
  roses: [
    { id: "rose-crimson", name: "Classic Dutch Crimson Red Roses", extraPrice: 0, description: "Velvety scarlet petals symbolizing deep love", image: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647423/occasions/products/general/rose.jpg" },
    { id: "rose-pink", name: "Sweet Avalanche Pink Roses", extraPrice: 80, description: "Graceful pastel pink blooms for celebrations", image: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647361/occasions/products/general/carnations.jpg" },
    { id: "rose-white", name: "Mondial Snow White Roses", extraPrice: 80, description: "Pure, pristine white blooms denoting elegance", image: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647446/occasions/products/general/white-roses-table-centerpiece.png" },
    { id: "rose-yellow", name: "Bright Sunshine Yellow Roses", extraPrice: 60, description: "Radiant friendship blooms filled with cheer", image: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647361/occasions/categories/categories-flower-bouquet.jpg" },
    { id: "rose-multicolor", name: "Spectacular Multi-Color Rose Medley", extraPrice: 150, description: "Hand-tied assortment of red, pink and white roses", image: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647423/occasions/products/general/rose.jpg" },
  ],
  orchids: [
    { id: "orchid-sonia", name: "Exotic Sonia Purple Orchids", extraPrice: 0, description: "Signature deep magenta-purple tropical sprays", image: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647421/occasions/products/general/orchid.jpg" },
    { id: "orchid-white", name: "Royal Dendrobium White Orchids", extraPrice: 120, description: "Aristocratic pristine white petals", image: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647421/occasions/products/general/orchid.jpg" },
    { id: "orchid-blue", name: "Mystic Blue Tinted Orchids", extraPrice: 200, description: "Captivating azure hue for dramatic presentations", image: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647421/occasions/products/general/orchid.jpg" },
    { id: "orchid-rose-blend", name: "Orchids & Pink Rose Symphony", extraPrice: 280, description: "Paired with velvety soft-pink roses", image: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647423/occasions/products/general/rose.jpg" },
  ],
  gerberas: [
    { id: "gerbera-vibrant-mix", name: "Vibrant Rainbow Gerbera Mix", extraPrice: 0, description: "Cheery multi-colored daisy-style blooms", image: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647416/occasions/products/general/gerbera.jpg" },
    { id: "gerbera-sun-orange", name: "Tangerine Orange Gerberas", extraPrice: 60, description: "Warm sunset tones that brighten any space", image: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647416/occasions/products/general/gerbera.jpg" },
    { id: "gerbera-scarlet-red", name: "Bold Scarlet Red Gerberas", extraPrice: 60, description: "Eye-catching vivid red daisy blooms", image: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647416/occasions/products/general/gerbera.jpg" },
  ],
  sunflowers: [
    { id: "sunflower-classic", name: "Pure Golden Dutch Sunflowers", extraPrice: 0, description: "Large sunny heads that bring sheer happiness", image: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647425/occasions/products/general/sunflower.jpg" },
    { id: "sunflower-rose-mix", name: "Sunflowers & Red Roses Harmony", extraPrice: 250, description: "Bold yellow blooms juxtaposed with classic red roses", image: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647423/occasions/products/general/rose.jpg" },
    { id: "sunflower-greenery", name: "Sunflowers with Lush Meadow Greens", extraPrice: 120, description: "Rustic country-garden presentation", image: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647425/occasions/products/general/sunflower.jpg" },
  ],
  carnations: [
    { id: "carnation-red", name: "Passionate Scarlet Carnations", extraPrice: 0, description: "Ruffled festive crimson blossoms", image: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647361/occasions/products/general/carnations.jpg" },
    { id: "carnation-pink", name: "Delicate Fairy Pink Carnations", extraPrice: 50, description: "Soft pastel frills for gentle expressions", image: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647361/occasions/products/general/carnations.jpg" },
    { id: "carnation-white", name: "Pristine Snow Carnations", extraPrice: 50, description: "Crisp white ruffled blooms", image: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647361/occasions/products/general/carnations.jpg" },
  ],
  lilies: [
    { id: "lily-asiatic", name: "Vibrant Asiatic Lilies", extraPrice: 0, description: "Sturdy un-scented star-shaped orange/pink blooms", image: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647417/occasions/products/general/green-world-lily.jpg" },
    { id: "lily-oriental", name: "Fragrant Sunset Oriental Lilies", extraPrice: 300, description: "Intensely fragrant large Stargazer blooms", image: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647421/occasions/products/general/oriental-lily.jpg" },
    { id: "lily-white-casablanca", name: "Pure White Casablanca Lilies", extraPrice: 350, description: "Magnificent pristine white trumpet blooms", image: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647419/occasions/products/general/lilies.jpg" },
  ],
  gladiolus: [
    { id: "glad-pink-white", name: "Bicolor Pink & White Gladiolus Spikes", extraPrice: 0, description: "Towering floral stalks with ruffled florets", image: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647417/occasions/products/general/gladiolus.jpg" },
    { id: "glad-red", name: "Majestic Crimson Red Gladiolus", extraPrice: 50, description: "Tall dramatic scarlet flower towers", image: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647417/occasions/products/general/gladiolus.jpg" },
  ],
  rajnigandha: [
    { id: "rajni-pure", name: "Fragrant Tuberose (Rajnigandha) Spikes", extraPrice: 0, description: "Intoxicating evening fragrance and timeless elegance", image: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647422/occasions/products/general/rajnigandha.jpg" },
    { id: "rajni-rose-blend", name: "Rajnigandha with Red Rose Highlights", extraPrice: 180, description: "Traditional wedding and pooja arrangement", image: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647423/occasions/products/general/rose.jpg" },
  ],
  heliconia: [
    { id: "heli-exotic", name: "Tropical Lobster-Claw Heliconia", extraPrice: 0, description: "Dramatic tropical hanging cascades with vibrant bracts", image: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647418/occasions/branding/heliconia.png" },
    { id: "heli-orchids", name: "Heliconia & Purple Orchid Tropical Fusion", extraPrice: 350, description: "High-fashion upscale botanical centerpiece", image: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647421/occasions/products/general/orchid.jpg" },
  ],
};

/**
 * Normalizes flower category string
 */
export function normalizeCategorySlug(rawCategory?: string): string {
  if (!rawCategory) return "roses";
  const norm = rawCategory.toLowerCase().trim().replace(/s$/, "");
  if (norm.includes("chrysanthemum")) return "chrysanthemums";
  if (norm.includes("orchid")) return "orchids";
  if (norm.includes("rose")) return "roses";
  if (norm.includes("gerbera")) return "gerberas";
  if (norm.includes("sunflower")) return "sunflowers";
  if (norm.includes("carnation")) return "carnations";
  if (norm.includes("lili") || norm.includes("lily")) return "lilies";
  if (norm.includes("gladiol")) return "gladiolus";
  if (norm.includes("rajnigandha") || norm.includes("tuberose")) return "rajnigandha";
  if (norm.includes("heliconia")) return "heliconia";
  return rawCategory.toLowerCase().trim();
}

/**
 * Returns customization config for any product
 */
export function getCustomizationConfigForProduct(
  product: Product,
  flowerCategory?: string
): ProductCustomizationConfig {
  const catKey = normalizeCategorySlug(flowerCategory || product.category);
  const flowerOptions = CATEGORY_FLOWER_VARIETIES[catKey] || CATEGORY_FLOWER_VARIETIES["roses"];

  return {
    productId: product.id,
    enabled: true,
    basePrice: product.price,
    flowerCategory: catKey,
    flowerOptions,
    sizes: DEFAULT_SIZES,
    wrappingPapers: DEFAULT_WRAPPING_PAPERS,
    ribbonColors: DEFAULT_RIBBON_COLORS,
    decorations: DEFAULT_DECORATIONS,
    addons: DEFAULT_CUSTOMIZER_ADDONS,
    allowCustomNote: true,
  };
}

/**
 * Returns all customizable products for a given flower category
 */
export function getCustomizableProductsForFlower(flowerCategory: string): Product[] {
  const norm = flowerCategory.toLowerCase().trim();
  const allInCat = getProductsForFlower(norm);

  // Return all items in category with customizable !== false
  const customizable = allInCat.filter((p) => p.customizable !== false);
  return customizable.length > 0 ? customizable : allInCat;
}

/**
 * Server-side / Client-side price validator
 */
export function calculateCustomizationPrice(
  basePrice: number,
  sizeId: string,
  wrappingId?: string,
  ribbonId?: string,
  decorationIds: string[] = [],
  flowerVarietyId?: string,
  category?: string,
  addonIds: string[] = []
): {
  basePrice: number;
  sizeCharge: number;
  wrappingCharge: number;
  ribbonCharge: number;
  decorationCharges: number;
  varietyCharge: number;
  addonCharges: number;
  selectedAddons: CustomizerAddonOption[];
  customizationCharges: number;
  finalPrice: number;
} {
  const sizeObj = DEFAULT_SIZES.find((s) => s.id === sizeId) || DEFAULT_SIZES[0];
  const wrapObj = wrappingId ? DEFAULT_WRAPPING_PAPERS.find((w) => w.id === wrappingId) : null;
  const ribbonObj = ribbonId ? DEFAULT_RIBBON_COLORS.find((r) => r.id === ribbonId) : null;

  const catKey = normalizeCategorySlug(category);
  const varieties = CATEGORY_FLOWER_VARIETIES[catKey] || [];
  const varietyObj = varieties.find((v) => v.id === flowerVarietyId);
  const varietyCharge = varietyObj ? varietyObj.extraPrice : 0;

  const decorationCharges = decorationIds.reduce((sum, id) => {
    const dec = DEFAULT_DECORATIONS.find((d) => d.id === id);
    return sum + (dec ? dec.extraPrice : 0);
  }, 0);

  const selectedAddons = (addonIds || [])
    .map((id) => DEFAULT_CUSTOMIZER_ADDONS.find((a) => a.id === id))
    .filter((a): a is CustomizerAddonOption => Boolean(a));

  const addonCharges = selectedAddons.reduce((sum, a) => sum + a.extraPrice, 0);

  const wrappingCharge = wrapObj ? wrapObj.extraPrice : 0;
  const ribbonCharge = ribbonObj ? ribbonObj.extraPrice : 0;

  const customizationCharges =
    sizeObj.extraPrice + wrappingCharge + ribbonCharge + decorationCharges + varietyCharge + addonCharges;

  const finalPrice = Math.max(0, basePrice + customizationCharges);

  return {
    basePrice,
    sizeCharge: sizeObj.extraPrice,
    wrappingCharge,
    ribbonCharge,
    decorationCharges,
    varietyCharge,
    addonCharges,
    selectedAddons,
    customizationCharges,
    finalPrice,
  };
}

