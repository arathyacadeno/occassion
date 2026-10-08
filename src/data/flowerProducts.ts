import { FlowerProduct, CategoryInfo } from "@/types";

export const CATEGORIES_DATA: Record<string, CategoryInfo> = {
  // BY TYPE
  roses: {
    slug: "roses",
    name: "Roses",
    type: "type",
    title: "Artisanal Rose Collection",
    headline: "Exquisite hand-tied rose bouquets sourced from premier Dutch and highland gardens.",
    description: "Discover velvety long-stem red roses, soft blush garden roses, and pristine white blossoms arranged with fragrant eucalyptus and bespoke ribbons. Handcrafted daily for delivery across Calicut.",
    heroImage: "/images/red-rose-bouquet.jpg",
  },
  bouquets: {
    slug: "bouquets",
    name: "Bouquets",
    type: "type",
    title: "Signature Handcrafted Bouquets",
    headline: "Masterfully designed floral bouquets celebrating nature's most vivid seasonal blooms.",
    description: "From lush pastel garden arrangements to dramatic floral hampers and exotic orchid cascades, our signature bouquets are hand-tied with love and signature wrapping.",
    heroImage: "/images/farm-hand-bouquet-large.jpg",
  },
  tulips: {
    slug: "tulips",
    name: "Tulips",
    type: "type",
    title: "Fresh Dutch Tulips",
    headline: "Crisp, vibrant Holland tulips curated for modern elegance and timeless charm.",
    description: "Straight from Dutch floral farms, our pristine tulips feature graceful stems, silky petals, and luminous colors that open gracefully over days.",
    heroImage: "/images/flower-pink-tulips.jpg",
  },
  sunflowers: {
    slug: "sunflowers",
    name: "Sunflowers",
    type: "type",
    title: "Golden Sunshine Sunflowers",
    headline: "Radiant, uplifting sunflowers that bring warmth, happiness, and bright energy.",
    description: "Bold golden petals paired with delicate chamomile and fresh greenery. Hand-picked sunflowers known for their long-lasting vitality and cheerful presence.",
    heroImage: "/images/sunflower-bouquet.jpg",
  },
  lilies: {
    slug: "lilies",
    name: "Lilies",
    type: "type",
    title: "Fragrant Oriental Lilies",
    headline: "Majestic Casablanca and Asiatic lilies celebrated for pure fragrance and sculptured blooms.",
    description: "Unmatched in aromatic luxury, our oriental lilies create a lavish statement in any room with dramatic star-shaped blooms and lush verdant foliage.",
    heroImage: "/images/flower-white-lilies.jpg",
  },

  // BY OCCASION
  anniversary: {
    slug: "anniversary",
    name: "Anniversary Flowers",
    type: "occasion",
    title: "Anniversary Romance Collection",
    headline: "Express timeless devotion with romantic red roses and intoxicating luxury bouquets.",
    description: "Celebrate milestones and enduring love with curated floral expressions, fine chocolates, and delicate fragrant petals designed for unforgettable anniversary surprises.",
    heroImage: "/images/red-rose-bouquet.jpg",
  },
  birthday: {
    slug: "birthday",
    name: "Birthday Flowers",
    type: "occasion",
    title: "Celebration Birthday Blooms",
    headline: "Bright, festive flower bouquets and cake hampers to spark birthday smiles.",
    description: "Make birthdays truly special with vibrant multi-colored blooms, delicious gourmet cakes, and cheerful hand-tied arrangements delivered on their special day.",
    heroImage: "/images/bouquet-2.jpg",
  },
  wedding: {
    slug: "wedding",
    name: "Wedding Flowers",
    type: "occasion",
    title: "Boutique Wedding Florals",
    headline: "Bespoke bridal bouquets, wedding stage flowers, and car decor for your dream day.",
    description: "Handcrafted bridal roses, imported orchids, and cascading garlands tailored for grand wedding celebrations in Calicut and across Kerala.",
    heroImage: "/images/bouquet-1.jpg",
  },
  "mothers-day": {
    slug: "mothers-day",
    name: "Mother's Day Flowers",
    type: "occasion",
    title: "Mother's Day Floral Tributes",
    headline: "Gentle pinks, delicate carnations, and soft garden roses honoring maternal love.",
    description: "Show gratitude and adoration with soft pastel blooms and comforting scents created specifically to make every mother feel uniquely cherished.",
    heroImage: "/images/flower-pink-roses.jpg",
  },
  congratulations: {
    slug: "congratulations",
    name: "Congratulations Flowers",
    type: "occasion",
    title: "Celebration & Congratulations",
    headline: "Triumphant floral bouquets honoring achievements, milestones, and new chapters.",
    description: "Celebrate promotions, graduations, and joyful new beginnings with bold, uplifting blooms that radiate optimism and prestige.",
    heroImage: "/images/cat-congratulations.jpg",
  },

  // BY COLOR
  "pink-flowers": {
    slug: "pink-flowers",
    name: "Pink Flowers",
    type: "color",
    title: "Blush & Pink Bloom Collection",
    headline: "Feminine, graceful pink roses, tulips, and peonies in tender pastel shades.",
    description: "Symbolizing affection, sweetness, and admiration, our pink flower selection brings tenderness and contemporary romance to any gifting moment.",
    heroImage: "/images/flower-pink-roses.jpg",
  },
  "white-flowers": {
    slug: "white-flowers",
    name: "White Flowers",
    type: "color",
    title: "Pristine White & Ivory Florals",
    headline: "Pure white lilies, ivory garden roses, and snow-white tulips for minimalist serenity.",
    description: "Understated elegance at its finest. Crisp white petals evoke peace, purity, and refined sophistication for modern interiors and solemn occasions.",
    heroImage: "/images/flower-white-roses.jpg",
  },
  "red-flowers": {
    slug: "red-flowers",
    name: "Red Flowers",
    type: "color",
    title: "Passionate Red Blooms",
    headline: "Deep ruby red Dutch roses and passionate crimson bouquets crafted with intensity.",
    description: "The definitive symbol of profound love and admiration. Saturated velvet reds that command attention and convey timeless romance.",
    heroImage: "/images/red-rose-bouquet.jpg",
  },
  "purple-flowers": {
    slug: "purple-flowers",
    name: "Purple Flowers",
    type: "color",
    title: "Royal Purple & Lavender Botanicals",
    headline: "Regal Dendrobium orchids, violet tulips, and lavender blossoms of enchanting beauty.",
    description: "Evoking royalty and creative luxury, our purple floral collection provides deep jewel tones and captivating exotic accents.",
    heroImage: "/images/bouquet-3.jpg",
  },
  "yellow-flowers": {
    slug: "yellow-flowers",
    name: "Yellow Flowers",
    type: "color",
    title: "Warm Yellow & Gold Sunshine",
    headline: "Cheerful sunflowers, golden tulips, and warm yellow Asiatic lilies full of optimism.",
    description: "Infuse every space with golden radiance and warmth. Perfect for wishing wellness, celebrating friendship, or brightening someone's day.",
    heroImage: "/images/sunflower-bouquet.jpg",
  },
  all: {
    slug: "all",
    name: "All Flowers",
    type: "type",
    title: "The Complete Occasions Floral Collection",
    headline: "Explore our complete gallery of farm-fresh roses, tulips, lilies, and signature bouquets.",
    description: "Browse every handcrafted floral arrangement available for same-day and scheduled delivery throughout Calicut and surrounding areas.",
    heroImage: "/images/farm-hand-bouquet-large.jpg",
  },
};

export const FLOWER_PRODUCTS: FlowerProduct[] = [
  // ==================== ROSES ====================
  {
    id: "roses-white-rose-bouquet",
    slug: "white-rose-bouquet",
    category: "roses",
    name: "White Rose Bouquet",
    subtitle: "Pristine Polar Star White Roses in Crisp Wrapping",
    price: 1799,
    originalPrice: 2199,
    rating: 4.9,
    reviewsCount: 47,
    image: "/images/flower-white-roses.jpg",
    images: [
      "/images/flower-white-roses.jpg",
      "/images/flower-pink-roses.jpg",
      "/images/red-rose-bouquet.jpg",
    ],
    occasion: "wedding",
    colorTag: "white",
    occasionsList: ["wedding", "anniversary", "congratulations"],
    stems: [
      "22 Polar Star White Roses",
      "Fragrant Waxflowers",
      "Italian Ruscus Greenery",
      "Monochrome White & Slate Wrap",
      "Pearl White Satin Ribbon",
    ],
    description:
      "A testament to timeless sophistication. Twenty-two pristine white garden roses radiating pure grace and calmness. Ideal for elegant weddings, congratulations, and peace-filled occasions.",
    flowerCount: "22 Pure White Stems",
    scent: "Fresh & Green",
    badge: "Minimalist Luxe",
    dimensions: "48cm H × 36cm W",
    colors: ["Pure Ivory", "Blush Pink", "Classic Crimson"],
    details: [
      "Long-lasting white petals that unfurl gently over 7-10 days",
      "Comes in recyclable eco-luxe floral packaging",
      "Temperature-controlled local delivery in Calicut",
    ],
  },
  {
    id: "roses-premium-red-roses",
    slug: "premium-red-roses",
    category: "roses",
    name: "Premium Red Roses",
    subtitle: "36 Grand Stems in Heavy Embossed Gift Box",
    price: 2799,
    originalPrice: 3299,
    rating: 5.0,
    reviewsCount: 93,
    image: "/images/red-rose-bouquet.jpg",
    images: [
      "/images/red-rose-bouquet.jpg",
      "/images/flower-pink-roses.jpg",
    ],
    occasion: "romantic",
    colorTag: "red",
    occasionsList: ["anniversary", "romantic"],
    stems: [
      "36 Extra-Large Grand Red Roses",
      "Lush Salal Leaves",
      "Signature Occasions Round Gift Box",
      "Golden Grosgrain Ribbon",
    ],
    description:
      "For moments requiring nothing short of breathtaking grandeur. Thirty-six hand-selected extra large Dutch red roses presented in our signature embossed luxury hatbox. The ultimate grand gesture.",
    flowerCount: "36 Deluxe Stems",
    scent: "Heirloom Rose",
    badge: "Signature Collection",
    dimensions: "55cm H × 42cm W",
    colors: ["Velvet Red", "Soft Blush", "Royal Mixed"],
    details: [
      "Presented in reusable premium velvet-touch hatbox",
      "Floral foam sponge keeps flowers hydrated for days without vase",
      "Includes complimentary box of artisanal chocolates",
    ],
  },
  {
    id: "roses-mixed-rose-bouquet",
    slug: "mixed-rose-bouquet",
    category: "roses",
    name: "Mixed Rose Bouquet",
    subtitle: "Harmony of Crimson, Blush, Cream & Peach Roses",
    price: 1999,
    originalPrice: 2499,
    rating: 4.8,
    reviewsCount: 39,
    image: "/images/slide1-flower.jpg",
    images: [
      "/images/slide1-flower.jpg",
      "/images/flower-pink-roses.jpg",
      "/images/red-rose-bouquet.jpg",
    ],
    occasion: "celebration",
    colorTag: "pink",
    occasionsList: ["birthday", "anniversary", "congratulations"],
    stems: [
      "Red, Pink, Peach & White Roses",
      "Chamomile Flowers",
      "Hypericum Berries",
      "Eucalyptus Sprays",
    ],
    description:
      "A rich visual tapestry of harmonizing pastel and vibrant roses. Blending crimson passion, delicate blush, warm peach, and cream in a celebratory joyful composition.",
    flowerCount: "25 Harmonious Stems",
    scent: "Heirloom Rose",
    badge: "Florist Choice",
    dimensions: "46cm H × 38cm W",
    colors: ["Pastel Medley", "Sunset Warmth", "Blush Trio"],
    details: [
      "Artisan-assembled for optimal color contrast and depth",
      "Wrapped in double-layer Korean floral paper",
      "Guaranteed fresh delivery with 7-day vase life",
    ],
  },
  {
    id: "roses-long-stem-roses",
    slug: "long-stem-roses",
    category: "roses",
    name: "Long Stem Roses",
    subtitle: "60cm Tall Ecuadorian Single-Origin Red Roses",
    price: 2299,
    originalPrice: 2799,
    rating: 5.0,
    reviewsCount: 51,
    image: "/images/red-rose-bouquet.jpg",
    images: [
      "/images/red-rose-bouquet.jpg",
      "/images/flower-white-roses.jpg",
    ],
    occasion: "romantic",
    colorTag: "red",
    occasionsList: ["anniversary", "romantic", "wedding"],
    stems: [
      "18 Long-Stem (60cm) Red Roses",
      "Smilax Foliage",
      "French Kraft Paper Wrap",
      "Satin Drawstring Bow",
    ],
    description:
      "Unmatched length and theatrical stature. These 60cm extra-long stems feature immense velvet blooms that stand proud in high-profile glass vases. Pure luxury.",
    flowerCount: "18 Tall Ecuadorian Stems",
    scent: "Heirloom Rose",
    badge: "Extra Tall",
    dimensions: "60cm H × 32cm W",
    colors: ["Crimson Red", "Ivory White"],
    details: [
      "Hand-trimmed stems conditioned for immediate vase display",
      "Includes care guide for maximizing vase longevity",
    ],
  },

  // ==================== BOUQUETS ====================
  {
    id: "bouquets-celebration-floral-cake-hamper",
    slug: "celebration-floral-and-cake-hamper",
    category: "bouquets",
    name: "Celebration Floral & Cake Hamper",
    subtitle: "Fresh Blooms with Gourmet Birthday Cake",
    price: 1499,
    originalPrice: 1799,
    rating: 4.9,
    reviewsCount: 82,
    image: "/images/bouquet-2.jpg",
    images: [
      "/images/bouquet-2.jpg",
      "/images/cat-birthday.jpg",
    ],
    occasion: "celebration",
    colorTag: "yellow",
    occasionsList: ["birthday", "congratulations"],
    stems: [
      "Bright Gerberas & Carnations",
      "Yellow Asiatic Lilies",
      "Chamomile Blooms",
      "500g Fresh Cream Truffle Cake",
      "Personalized Calicut Greeting Card",
    ],
    description:
      "Our signature online combo delivered anywhere in Kozhikode city. A vibrant fresh flower bouquet paired with a delectable freshly baked chocolate truffle cake.",
    flowerCount: "20 stems + 1/2 kg Cake",
    scent: "Fresh & Green",
    badge: "Bestseller Combo",
    dimensions: "40cm H × 35cm W",
    colors: ["Vibrant Medley", "Pastel Sun"],
    details: [
      "Delivered simultaneously by specialized delivery executive",
      "Cake freshly baked on the morning of delivery",
    ],
  },
  {
    id: "bouquets-exotic-orchid-cascade",
    slug: "exotic-orchid-cascade",
    category: "bouquets",
    name: "Exotic Orchid Cascade",
    subtitle: "Dendrobium Purple Orchids & Anthuriums",
    price: 1299,
    originalPrice: 1599,
    rating: 5.0,
    reviewsCount: 41,
    image: "/images/bouquet-3.jpg",
    images: [
      "/images/bouquet-3.jpg",
      "/images/slide3-flower.jpg",
    ],
    occasion: "curated",
    colorTag: "purple",
    occasionsList: ["anniversary", "congratulations"],
    stems: [
      "Imported Purple Dendrobium Orchids",
      "Tropical Anthuriums",
      "Song of India Foliage",
      "Areca Palm Sprays",
    ],
    description:
      "Long-lasting exotic orchids with deep jewel tones. Perfect for anniversaries, stage gifts, and VIP presentations in Calicut.",
    flowerCount: "16-18 luxury stems",
    scent: "Exotic Musk",
    badge: "14+ Days Vase Life",
    dimensions: "50cm H × 40cm W",
    colors: ["Deep Purple", "Magenta Violet"],
    details: [
      "Known for outstanding longevity in Kerala's coastal climate",
      "Subtle tropical gloss with dramatic vertical architecture",
    ],
  },
  {
    id: "bouquets-luxury-pastel-blossom",
    slug: "luxury-pastel-blossom-bouquet",
    category: "bouquets",
    name: "Luxury Pastel Blossom Bouquet",
    subtitle: "Blush Peonies, Ranunculus & Garden Greens",
    price: 2199,
    originalPrice: 2699,
    rating: 4.9,
    reviewsCount: 68,
    image: "/images/farm-hand-bouquet-large.jpg",
    images: [
      "/images/farm-hand-bouquet-large.jpg",
      "/images/farm-peonies-tall-large.jpg",
    ],
    occasion: "curated",
    colorTag: "pink",
    occasionsList: ["mothers-day", "birthday", "anniversary"],
    stems: [
      "Pastel Peonies",
      "Blush Spray Roses",
      "Sweet Peas & Astilbe",
      "Feather Ferns",
    ],
    description:
      "A whimsical, dreamy cloud of delicate blossoms. Crafted for lovers of cottage garden charm with soft peach, powder pink, and cream tones.",
    flowerCount: "28 Delicate Blooms",
    scent: "Subtle & Sweet",
    badge: "Trending",
    dimensions: "44cm H × 36cm W",
    colors: ["Pastel Blossom", "Blush Cream"],
    details: [
      "Soft texture contrast with fluffy peony layers",
      "Tied with hand-torn raw-edge chiffon ribbon",
    ],
  },

  // ==================== TULIPS ====================
  {
    id: "tulips-crisp-white-royal-tulips",
    slug: "crisp-white-royal-tulips",
    category: "tulips",
    name: "Crisp White Royal Tulips",
    subtitle: "Minimalist Pure White Tulips in Clean Kraft Wrap",
    price: 1899,
    originalPrice: 2299,
    rating: 4.8,
    reviewsCount: 36,
    image: "/images/farm-tulips-wrap-large.jpg",
    images: [
      "/images/farm-tulips-wrap-large.jpg",
      "/images/flower-pink-tulips.jpg",
    ],
    occasion: "curated",
    colorTag: "white",
    occasionsList: ["congratulations", "wedding"],
    stems: [
      "15 White Royal Dutch Tulips",
      "Broad Tulip Foliage",
      "Neutral Scandinavian Paper Wrap",
    ],
    description:
      "Minimalism redefined. Pristine ivory white tulips celebrating clean lines, organic geometry, and quiet luxury. The favored pick for modern architectural interiors.",
    flowerCount: "15 Pure Stems",
    scent: "Fresh & Green",
    badge: "Nordic Style",
    dimensions: "40cm H × 28cm W",
    colors: ["Snow White", "Dutch Pink"],
    details: [
      "Architectural elegance suited for clear cylinder vases",
      "Arrives closed in bud to guarantee longest home vase life",
    ],
  },
  {
    id: "tulips-sunset-orange-dutch-tulips",
    slug: "sunset-orange-dutch-tulips",
    category: "tulips",
    name: "Sunset Orange Dutch Tulips",
    subtitle: "Glowing Amber and Tangerine Dutch Tulips",
    price: 1999,
    originalPrice: 2399,
    rating: 5.0,
    reviewsCount: 29,
    image: "/images/farm-tulips-wrap-large.jpg",
    images: [
      "/images/farm-tulips-wrap-large.jpg",
      "/images/flower-pink-tulips.jpg",
    ],
    occasion: "celebration",
    colorTag: "yellow",
    occasionsList: ["birthday", "congratulations"],
    stems: [
      "18 Sunset Amber & Orange Tulips",
      "Fresh Green Accents",
      "Warm Sand Ribbon",
    ],
    description:
      "Bursting with incandescent vitality, these orange tulips replicate the warm golden glow of a Kerala beach sunset. Energetic, optimistic, and deeply memorable.",
    flowerCount: "18 Sunset Stems",
    scent: "Fresh & Green",
    badge: "Seasonal Pick",
    dimensions: "42cm H × 30cm W",
    colors: ["Sunset Orange", "Sunshine Yellow"],
    details: [
      "Rich color saturation that brightens living and dining spaces",
      "Comes with cold gel pack packaging",
    ],
  },
  {
    id: "tulips-purple-velvet-emperor-tulips",
    slug: "purple-velvet-emperor-tulips",
    category: "tulips",
    name: "Purple Velvet Emperor Tulips",
    subtitle: "Deep Regal Violet Tulips with Silky Petals",
    price: 2099,
    originalPrice: 2599,
    rating: 4.9,
    reviewsCount: 31,
    image: "/images/flower-pink-tulips.jpg",
    images: [
      "/images/flower-pink-tulips.jpg",
      "/images/farm-tulips-wrap-large.jpg",
    ],
    occasion: "curated",
    colorTag: "purple",
    occasionsList: ["anniversary", "birthday"],
    stems: [
      "16 Royal Purple Emperor Tulips",
      "Silvery Leaves",
      "Luxe Eggplant Purple Ribbon",
    ],
    description:
      "Rare deep violet tulips with an iridescent sheen. An opulent, dramatic floral statement fit for connoisseurs of distinctive botanicals.",
    flowerCount: "16 Regal Stems",
    scent: "Fresh & Green",
    badge: "Rare Variety",
    dimensions: "40cm H × 28cm W",
    colors: ["Regal Violet", "Dutch Pink"],
    details: [
      "Sourced exclusively from specialized Dutch bulb growers",
      "Delivered in protective bespoke cone wrapping",
    ],
  },

  // ==================== SUNFLOWERS ====================
  {
    id: "sunflowers-radiant-sunshine-vase",
    slug: "radiant-sunshine-glass-vase",
    category: "sunflowers",
    name: "Radiant Sunshine Glass Vase",
    subtitle: "Sunflowers in Fluted Italian Cylinder Glass",
    price: 2199,
    originalPrice: 2599,
    rating: 4.9,
    reviewsCount: 38,
    image: "/images/sunflower-bouquet.jpg",
    images: [
      "/images/sunflower-bouquet.jpg",
    ],
    occasion: "celebration",
    colorTag: "yellow",
    occasionsList: ["anniversary", "congratulations"],
    stems: [
      "8 Giant Sunflowers",
      "Goldenrod Solidago",
      "Cascading Ivy Greens",
      "Heavy Glass Fluted Vase Included",
    ],
    description:
      "Ready to display right out of the box! Hand-arranged in a heavy glass vase, this sunny centerpiece brings organic happiness into living spaces and corporate offices.",
    flowerCount: "8 Stems + Vase",
    scent: "Fresh & Green",
    badge: "Vase Included",
    dimensions: "52cm H × 38cm W",
    colors: ["Golden Sunshine"],
    details: [
      "Comes pre-arranged in crystal clear cylinder vase with water & flower food",
      "Zero effort needed—just unwrap and place on table",
    ],
  },
  {
    id: "sunflowers-tuscan-sunflower-wildflower",
    slug: "tuscan-sunflower-wildflower-bunch",
    category: "sunflowers",
    name: "Tuscan Sunflower & Wildflower Bunch",
    subtitle: "Sunflowers with Lavender, Thistle & Herbs",
    price: 1799,
    originalPrice: 2199,
    rating: 4.8,
    reviewsCount: 34,
    image: "/images/sunflower-bouquet.jpg",
    images: [
      "/images/sunflower-bouquet.jpg",
      "/images/slide2-flower.jpg",
    ],
    occasion: "curated",
    colorTag: "yellow",
    occasionsList: ["birthday", "anniversary"],
    stems: [
      "6 Golden Sunflowers",
      "Blue Sea Holly Thistles",
      "Dried Lavender Accents",
      "Fragrant Rosemary Foliage",
    ],
    description:
      "Inspired by rustic Tuscan countryside estates. Bold sunflowers balanced with spiky blue sea holly and aromatic Mediterranean herbs wrapped in raw craft paper.",
    flowerCount: "16 Rustic Stems",
    scent: "Fresh & Green",
    badge: "Rustic Chic",
    dimensions: "48cm H × 35cm W",
    colors: ["Tuscan Gold & Blue"],
    details: [
      "Herbaceous aroma that naturally refreshes rooms",
      "Dry-able elements allow enjoyment for months as dried botanical art",
    ],
  },

  // ==================== LILIES ====================
  {
    id: "lilies-lily-and-the-celestial-daisy",
    slug: "lily-and-the-celestial-daisy",
    category: "lilies",
    name: "Lily and the Celestial Daisy",
    subtitle: "Pink Oriental Lilies & Celestial Daisy Vase Arrangement",
    price: 695,
    originalPrice: 795,
    rating: 4.9,
    ratingsCount: 35,
    reviewsCount: 34,
    image: "/images/lily-6-stems.png",
    images: [
      "/images/lily-6-stems.png",
      "/images/lily-12-stems.png",
      "/images/lily-custom-stems.png",
      "/images/flower-white-lilies.jpg",
    ],
    occasion: "romantic",
    colorTag: "pink",
    occasionsList: ["anniversary", "birthday", "mothers-day", "congratulations"],
    stems: [
      "Pink Oriental Lilies",
      "Celestial Daisy Sprays",
      "Eucalyptus & Broad Ruscus Foliage",
      "Keepsake Glass Vase",
      "Sheer Organza Ribbon Bow",
    ],
    description:
      "A radiant ensemble of multi-bloom Stargazer and Oriental pink lilies intertwined with delicate celestial daisies and verdant greenery. Presented in an elegant glass vase with sheer organza bow.",
    flowerCount: "6 Stems / 12 Stems / Custom Stems",
    scent: "Subtle & Sweet",
    badge: "Trending Gift",
    dimensions: "52cm H × 38cm W",
    colors: ["Blush Pink", "Celestial Daisy"],
    details: [
      "Artisanal glass vase with freshwater reservoir",
      "Buds open continuously for up to 12 days",
    ],
    variants: [
      {
        id: "6-stems",
        name: "6 Stems",
        price: 695,
        originalPrice: 795,
        image: "/images/lily-6-stems.png",
      },
      {
        id: "12-stems",
        name: "12 Stems",
        price: 1195,
        originalPrice: 1395,
        image: "/images/lily-12-stems.png",
      },
      {
        id: "custom",
        name: "Custom",
        price: 695,
        originalPrice: 795,
        image: "/images/lily-custom-stems.png",
      },
    ],
  },
  {
    id: "lilies-pure-white-oriental-lilies",
    slug: "pure-white-oriental-lilies",
    category: "lilies",
    name: "Pure White Oriental Lilies",
    subtitle: "Massive Casablanca Lily Sprays with Intoxicating Scent",
    price: 695,
    originalPrice: 795,
    rating: 5.0,
    reviewsCount: 58,
    image: "/images/flower-white-lilies.jpg",
    images: [
      "/images/flower-white-lilies.jpg",
      "/images/highlight-table-arrangements.jpg",
    ],
    occasion: "curated",
    colorTag: "white",
    occasionsList: ["wedding", "anniversary", "congratulations"],
    stems: [
      "6 Multi-Bloom Casablanca Lily Stems (18+ Flowers)",
      "Broad Palm Foliage",
      "Eucalyptus Accents",
      "Silver Matte Designer Paper",
    ],
    description:
      "The queen of aromatic flowers. Each heavy stem boasts 3-4 huge trumpet-shaped flowers that perfume the entire home with exquisite natural fragrance. Pristine white petals with delicate ruffled edges.",
    flowerCount: "6 Stems / 12 Stems / Custom Stems",
    scent: "Subtle & Sweet",
    badge: "Aromatic Marvel",
    dimensions: "60cm H × 42cm W",
    colors: ["Pure White", "Stargazer Pink"],
    details: [
      "Anthers carefully de-pollened by our team to avoid staining linens",
      "Buds open sequentially over 10-14 days for lasting enjoyment",
    ],
    variants: [
      {
        id: "6-stems",
        name: "6 Stems",
        price: 695,
        originalPrice: 795,
        image: "/images/flower-white-lilies.jpg",
      },
      {
        id: "12-stems",
        name: "12 Stems",
        price: 1195,
        originalPrice: 1395,
        image: "/images/highlight-table-arrangements.jpg",
      },
      {
        id: "custom",
        name: "Custom",
        price: 695,
        originalPrice: 795,
        image: "/images/flower-white-lilies.jpg",
      },
    ],
  },
  {
    id: "lilies-stargazer-pink-lily-bouquet",
    slug: "stargazer-pink-lily-bouquet",
    category: "lilies",
    name: "Stargazer Pink Lily Bouquet",
    subtitle: "Vivid Magenta Spotted Oriental Lilies & White Roses",
    price: 695,
    originalPrice: 795,
    rating: 4.9,
    reviewsCount: 46,
    image: "/images/farm-peonies-tall-large.jpg",
    images: [
      "/images/farm-peonies-tall-large.jpg",
      "/images/flower-white-lilies.jpg",
    ],
    occasion: "romantic",
    colorTag: "pink",
    occasionsList: ["anniversary", "birthday", "mothers-day"],
    stems: [
      "5 Multi-Bloom Stargazer Lilies",
      "8 Avalanche White Roses",
      "Baby's Breath",
      "Glossy Aralia Leaves",
    ],
    description:
      "Dramatic deep magenta petals bordered in snow-white and freckled with crimson specks. Paired with velvety white garden roses for a spellbinding visual and olfactory feast.",
    flowerCount: "6 Stems / 12 Stems / Custom Stems",
    scent: "Subtle & Sweet",
    badge: "Ultra Fragrant",
    dimensions: "55cm H × 40cm W",
    colors: ["Stargazer Pink", "Pure White"],
    details: [
      "Known worldwide for its deep, rich sweet fragrance",
      "Hand-tied with double-faced satin ribbon",
    ],
    variants: [
      {
        id: "6-stems",
        name: "6 Stems",
        price: 695,
        originalPrice: 795,
        image: "/images/farm-peonies-tall-large.jpg",
      },
      {
        id: "12-stems",
        name: "12 Stems",
        price: 1195,
        originalPrice: 1395,
        image: "/images/flower-white-lilies.jpg",
      },
      {
        id: "custom",
        name: "Custom",
        price: 695,
        originalPrice: 795,
        image: "/images/farm-peonies-tall-large.jpg",
      },
    ],
  },
  {
    id: "lilies-serene-lily-carnation-sympathy",
    slug: "serene-lily-carnation-sympathy",
    category: "lilies",
    name: "Serene Lily & Carnation Sympathy",
    subtitle: "Pristine Casablanca Lilies & Snow Carnations",
    price: 695,
    originalPrice: 795,
    rating: 5.0,
    reviewsCount: 37,
    image: "/images/bouquet-3.jpg",
    images: [
      "/images/bouquet-3.jpg",
      "/images/flower-white-lilies.jpg",
    ],
    occasion: "sympathy",
    colorTag: "white",
    occasionsList: ["sympathy", "congratulations"],
    stems: [
      "White Casablanca Lilies",
      "Pristine White Carnations",
      "Leatherleaf Ferns",
      "White Satin Ribbon",
    ],
    description:
      "A peaceful and dignified tribute offering quiet solace. Crisp white lilies and carnations arranged with gentle grace for heartfelt condolences and respectful honors.",
    flowerCount: "6 Stems / 12 Stems / Custom Stems",
    scent: "Subtle & Sweet",
    badge: "Serenity",
    dimensions: "50cm H × 36cm W",
    colors: ["Pure White"],
    details: [
      "Includes condolence card handwritten with utmost respect",
      "Direct venue or residence delivery available across Calicut",
    ],
    variants: [
      {
        id: "6-stems",
        name: "6 Stems",
        price: 695,
        originalPrice: 795,
        image: "/images/bouquet-3.jpg",
      },
      {
        id: "12-stems",
        name: "12 Stems",
        price: 1195,
        originalPrice: 1395,
        image: "/images/flower-white-lilies.jpg",
      },
      {
        id: "custom",
        name: "Custom",
        price: 695,
        originalPrice: 795,
        image: "/images/bouquet-3.jpg",
      },
    ],
  },
];

// Helper functions for dynamic fetching and filtering
export function getCategoryInfo(slug: string): CategoryInfo {
  const normalized = slug.toLowerCase().trim();
  if (CATEGORIES_DATA[normalized]) {
    return CATEGORIES_DATA[normalized];
  }
  // Fallback
  return {
    slug: normalized,
    name: normalized.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    type: "type",
    title: `${normalized.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} Flowers`,
    headline: "Exquisite hand-tied blooms curated for life's special occasions.",
    description: "Browse our farm-fresh flower arrangements crafted with artistry and care for same-day delivery in Calicut.",
    heroImage: "/images/red-rose-bouquet.jpg",
  };
}

export function getProductsByCategory(categorySlug: string): FlowerProduct[] {
  const slug = categorySlug.toLowerCase().trim();

  // "all" returns all products
  if (slug === "all") {
    return FLOWER_PRODUCTS;
  }

  // 1. Direct category match (e.g. "roses", "tulips", "sunflowers", "lilies", "bouquets")
  const byCategory = FLOWER_PRODUCTS.filter((p) => p.category.toLowerCase() === slug);
  if (byCategory.length > 0) {
    return byCategory;
  }

  // 2. Occasion match (e.g. "anniversary", "birthday", "wedding", "mothers-day", "congratulations")
  const byOccasion = FLOWER_PRODUCTS.filter(
    (p) =>
      p.occasionsList?.includes(slug) ||
      p.occasion?.toLowerCase() === slug ||
      (slug === "anniversary" && p.occasion === "romantic") ||
      (slug === "birthday" && p.occasion === "celebration")
  );
  if (byOccasion.length > 0) {
    return byOccasion;
  }

  // 3. Color match (e.g. "pink-flowers", "white-flowers", "red-flowers", "purple-flowers", "yellow-flowers")
  const colorKey = slug.replace("-flowers", "").replace("flowers", "").trim();
  const byColor = FLOWER_PRODUCTS.filter(
    (p) => p.colorTag?.toLowerCase() === colorKey || p.colors?.some((c) => c.toLowerCase().includes(colorKey))
  );
  if (byColor.length > 0) {
    return byColor;
  }

  // Default fallback: return all products
  return FLOWER_PRODUCTS;
}

export function getProductBySlug(productSlug: string): FlowerProduct | undefined {
  const normSlug = productSlug.toLowerCase().trim();
  return FLOWER_PRODUCTS.find(
    (p) => p.slug.toLowerCase() === normSlug || p.id.toLowerCase() === normSlug
  );
}

export function getRelatedProducts(
  currentProductSlug: string,
  category: string,
  limit: number = 4
): FlowerProduct[] {
  const normSlug = currentProductSlug.toLowerCase().trim();
  const sameCategory = FLOWER_PRODUCTS.filter(
    (p) => p.slug.toLowerCase() !== normSlug && p.category.toLowerCase() === category.toLowerCase()
  );

  if (sameCategory.length >= limit) {
    return sameCategory.slice(0, limit);
  }

  const otherProducts = FLOWER_PRODUCTS.filter(
    (p) => p.slug.toLowerCase() !== normSlug && p.category.toLowerCase() !== category.toLowerCase()
  );

  return [...sameCategory, ...otherProducts].slice(0, limit);
}
