export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: "flower" | "cakes" | "special-occasions" | "our-highlights";
  categoryLabel: string;
  image: string;
  images: string[];
  rating: number;
  reviewsCount: number;
  description: string;
  deliveryInfo: string;
  offers: string[];
  includes: string[];
  badge?: string;
  shortDescription?: string;
  deliveryText?: string;
  variants?: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
  }[];
  ratingsCount?: number;
}

export const CATALOG_PRODUCTS: Product[] = [
  // ==================== FLOWER PRODUCTS (/flower) ====================
  {
    id: "flower-9",
    slug: "white-pink-roses-gypsophilla-bamboo-basket",
    name: "White /pink roses with gypsophilla in a bamboo basket",
    price: 1800,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/flower-basket/pastel-rose-wicker-basket.png",
    images: [
      "/images/flower-basket/pastel-rose-wicker-basket.png",
      "/images/flower-basket/pink-carnation-ribbon-basket.png",
      "/images/flower-basket/basket-crimson-pink-roses.jpg",
    ],
    rating: 4.9,
    reviewsCount: 42,
    description:
      "White and pink roses with gypsophilla arranged in a natural bamboo basket. A gentle, elegant arrangement.",
    deliveryInfo: "Fresh morning delivery within 3 hours across Calicut.",
    offers: ["Flat 10% off with code OCCASIONS10", "Complimentary heartfelt note card"],
    includes: [
      "White & Pink Roses",
      "Fresh Gypsophila Baby's Breath",
      "Handcrafted Bamboo Basket",
    ],
    badge: "Bestseller",
  },
  {
    id: "flower-10",
    slug: "15-pink-carnations-gypsophilla-bamboo-basket",
    name: "15 pink carnations with gypsophilla arranged in bamboo basket",
    price: 1095,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/flower-basket/pink-carnation-ribbon-basket.png",
    images: [
      "/images/flower-basket/pink-carnation-ribbon-basket.png",
      "/images/flower-basket/pastel-rose-wicker-basket.png",
      "/images/flower-basket/flower-white-lilies.jpg",
    ],
    rating: 4.8,
    reviewsCount: 36,
    description:
      "15 pink carnations with gypsophilla delicately arranged in a bamboo basket.",
    deliveryInfo: "Delivered fresh from botanical farms in insulated floristry vans.",
    offers: ["Free customized greeting card", "Complimentary floral nutrition sachet"],
    includes: [
      "15 Fresh Pink Carnations",
      "Delicate Gypsophila Filler",
      "Handcrafted Bamboo Basket",
      "Keepsake Ribbon Bow",
    ],
    badge: "Artisanal Choice",
  },
  {
    id: "flower-basket-3",
    slug: "lilly-roses-chrysanthemum-chocolate-basket",
    name: "Lilly roses chrysanthemum n assorted chocolates arranged in a bamboo basket",
    price: 1600,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/flower-basket/lilly-roses-chrysanthemum-chocolate-basket.jpg",
    images: [
      "/images/flower-basket/lilly-roses-chrysanthemum-chocolate-basket.jpg",
    ],
    rating: 4.9,
    reviewsCount: 24,
    description: "Lilly roses chrysanthemum n assorted chocolates arranged in a bamboo basket.",
    deliveryInfo: "Delivered fresh from botanical farms in insulated floristry vans.",
    offers: ["Free customized greeting card"],
    includes: [
      "Lilies, Roses & Chrysanthemums",
      "Assorted Chocolates",
      "Handcrafted Bamboo Basket",
    ],
    badge: "Bestseller",
  },
  {
    id: "flower-basket-4",
    slug: "red-roses-chrysanthemum-bamboo-basket",
    name: "20 Red Roses, white chrysanthemum n gypsophilla arranged in bamboo basket",
    price: 1395,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/flower-basket/red-roses-chrysanthemum-bamboo-basket.jpg",
    images: [
      "/images/flower-basket/red-roses-chrysanthemum-bamboo-basket.jpg",
    ],
    rating: 4.9,
    reviewsCount: 30,
    description: "20 Red Roses, white chrysanthemum n gypsophilla arranged in bamboo basket.",
    deliveryInfo: "Delivered fresh from botanical farms in insulated floristry vans.",
    offers: ["Free customized greeting card"],
    includes: [
      "20 Red Roses",
      "White Chrysanthemums & Gypsophila",
      "Handcrafted Bamboo Basket",
    ],
    badge: "Classic Choice",
  },
  {
    id: "flower-basket-5",
    slug: "20-white-pink-roses-gypsophilla-bamboo-basket",
    name: "20 white pink roses with gypsophilla arranged in bamboo basket",
    price: 1100,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/flower-basket/20-white-pink-roses-bamboo-basket.jpg",
    images: [
      "/images/flower-basket/20-white-pink-roses-bamboo-basket.jpg",
    ],
    rating: 4.8,
    reviewsCount: 15,
    description: "20 white pink roses with gypsophilla delicately arranged in a bamboo basket.",
    deliveryInfo: "Delivered fresh from botanical farms in insulated floristry vans.",
    offers: ["Free customized greeting card"],
    includes: [
      "20 White & Pink Roses",
      "Gypsophila Filler",
      "Handcrafted Bamboo Basket",
    ],
    badge: "Elegant Choice",
  },
  {
    id: "flower-basket-6",
    slug: "30-white-yellow-roses-gypsophilla-premium-basket",
    name: "Mix flower one sided arrangements in white yellow combination in a premium quality basket 1800",
    price: 1800,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/flower-basket/30-white-yellow-roses-premium-basket.jpg",
    images: [
      "/images/flower-basket/30-white-yellow-roses-premium-basket.jpg",
    ],
    rating: 4.9,
    reviewsCount: 18,
    description: "30 white yellow roses with gypsophilla delicately arranged in a premium quality basket.",
    deliveryInfo: "Delivered fresh from botanical farms in insulated floristry vans.",
    offers: ["Free customized greeting card"],
    includes: [
      "30 White & Yellow Roses",
      "Gypsophila Filler",
      "Premium Handcrafted Basket",
    ],
    badge: "Premium Choice",
  },
  {
    id: "flower-basket-7",
    slug: "mix-flower-half-ball-basket",
    name: "Mix flower half ball arrangement in a basket.... 20 roses, chrysanthemum, gypsophilla",
    price: 1495,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/flower-basket/mix-flower-half-ball-basket.jpg",
    images: [
      "/images/flower-basket/mix-flower-half-ball-basket.jpg",
    ],
    rating: 4.8,
    reviewsCount: 22,
    description: "Mix flower half ball arrangement in a basket featuring 20 roses, chrysanthemum, and gypsophilla.",
    deliveryInfo: "Delivered fresh from botanical farms in insulated floristry vans.",
    offers: ["Free customized greeting card"],
    includes: [
      "20 Assorted Roses",
      "Chrysanthemums & Gypsophila",
      "Handcrafted Basket",
    ],
    badge: "Bestseller",
  },
  {
    id: "flower-basket-8",
    slug: "40-pink-white-roses-chrysanthemum-basket",
    name: "40 pink white roses with pink Chrysanthemum n gypsophilla arranged in bamboo basket",
    price: 2500,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/flower-basket/40-pink-white-roses-chrysanthemum-basket.jpg",
    images: [
      "/images/flower-basket/40-pink-white-roses-chrysanthemum-basket.jpg",
    ],
    rating: 5.0,
    reviewsCount: 12,
    description: "40 pink and white roses with pink Chrysanthemum and gypsophilla gracefully arranged in a bamboo basket.",
    deliveryInfo: "Delivered fresh from botanical farms in insulated floristry vans.",
    offers: ["Free customized greeting card"],
    includes: [
      "40 Pink & White Roses",
      "Pink Chrysanthemums & Gypsophila",
      "Handcrafted Bamboo Basket",
    ],
    badge: "Luxury Choice",
  },
  {
    id: "flower-basket-9",
    slug: "pink-lily-rose-carnation-round-container",
    name: "2 stem pink Lilly,20 stems roses, carnations, gypsophilla arrangement in a round container",
    price: 1600,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/flower-basket/pink-lily-rose-carnation-round-container.jpg",
    images: [
      "/images/flower-basket/pink-lily-rose-carnation-round-container.jpg",
    ],
    rating: 4.8,
    reviewsCount: 14,
    description: "2 stem pink Lilly, 20 stems roses, carnations, and gypsophilla beautifully arranged in a premium round container.",
    deliveryInfo: "Delivered fresh from botanical farms in insulated floristry vans.",
    offers: ["Free customized greeting card"],
    includes: [
      "2 Pink Lilies",
      "20 Pink Roses & Carnations",
      "Premium Round Container",
    ],
    badge: "Elegant Choice",
  },
  {
    id: "flower-basket-10",
    slug: "asiatic-lily-peach-roses-basket",
    name: "1 stem Asiatic lilly, white pink peach roses, chrysanthemum, gypsophilla",
    price: 1600,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/flower-basket/asiatic-lily-peach-roses-basket.jpg",
    images: [
      "/images/flower-basket/asiatic-lily-peach-roses-basket.jpg",
    ],
    rating: 4.9,
    reviewsCount: 16,
    description: "1 stem Asiatic lily paired with beautiful white, pink, and peach roses, chrysanthemums, and gypsophilla arranged in a classic bamboo basket.",
    deliveryInfo: "Delivered fresh from botanical farms in insulated floristry vans.",
    offers: ["Free customized greeting card"],
    includes: [
      "1 White Asiatic Lily",
      "Assorted Peach, Pink & White Roses",
      "Handcrafted Basket",
    ],
    badge: "Bestseller",
  },
  {
    id: "flower-basket-11",
    slug: "40-white-yellow-roses-one-sided-basket",
    name: "40 white /yellow roses with gypsophilla one sided arrangement in premium quality basket",
    price: 2299,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/flower-basket/40-white-yellow-roses-one-sided-basket.jpg",
    images: [
      "/images/flower-basket/40-white-yellow-roses-one-sided-basket.jpg",
    ],
    rating: 4.9,
    reviewsCount: 19,
    description: "40 beautifully arranged white and yellow roses with gypsophilla in a one-sided premium quality basket.",
    deliveryInfo: "Delivered fresh from botanical farms in insulated floristry vans.",
    offers: ["Free customized greeting card"],
    includes: [
      "40 White & Yellow Roses",
      "Gypsophila Fillers",
      "Premium Handcrafted Basket",
    ],
    badge: "Premium Choice",
  },
  {
    id: "flower-basket-12",
    slug: "24-white-pink-roses-basket",
    name: "24 White/pink roses and gypsophilla beautifully arranged in a bamboo basket",
    price: 1400,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/flower-basket/24-white-pink-roses-basket.jpg",
    images: [
      "/images/flower-basket/24-white-pink-roses-basket.jpg",
    ],
    rating: 4.7,
    reviewsCount: 15,
    description: "24 White and pink roses and gypsophilla beautifully arranged in a classic bamboo basket.",
    deliveryInfo: "Delivered fresh from botanical farms in insulated floristry vans.",
    offers: ["Free customized greeting card"],
    includes: [
      "24 White & Pink Roses",
      "Gypsophila Fillers",
      "Handcrafted Bamboo Basket",
    ],
    badge: "Bestseller",
  },
  {
    id: "flower-basket-13",
    slug: "30-white-yellow-roses-premium-basket",
    name: "30 white yellow roses with gypsophilla arranged in premium quality basket",
    price: 1995,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/flower-basket/30-white-yellow-roses-premium-basket-2.jpg",
    images: [
      "/images/flower-basket/30-white-yellow-roses-premium-basket-2.jpg",
    ],
    rating: 4.8,
    reviewsCount: 20,
    description: "30 white yellow roses with gypsophilla delicately arranged in a premium quality basket.",
    deliveryInfo: "Delivered fresh from botanical farms in insulated floristry vans.",
    offers: ["Free customized greeting card"],
    includes: [
      "30 White & Yellow Roses",
      "Gypsophila Fillers",
      "Premium Handcrafted Basket",
    ],
    badge: "Premium Choice",
  },

  // ==================== BOUQUET PRODUCTS (/flower-bouquets) ====================
  {
    id: "bouquet-black-velvet-roses",
    slug: "black-velvet-roses-bouquet",
    name: "Black Velvet Roses - 20 roses with gypsophilla",
    price: 1300,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/flower-bouquet/black-velvet-roses.jpg",
    images: [
      "/images/flower-bouquet/black-velvet-roses.jpg",
    ],
    rating: 4.8,
    reviewsCount: 12,
    description: "20 elegant red roses with gypsophilla beautifully wrapped in striking black premium paper with gold accents.",
    deliveryInfo: "Delivered fresh from botanical farms in insulated floristry vans.",
    offers: ["Free customized greeting card"],
    includes: [
      "20 Red Roses",
      "Gypsophila Fillers",
      "Premium Black & Gold Wrapping",
    ],
    badge: "Classic Choice",
  },
  {
    id: "bouquet-ivory-elegance",
    slug: "ivory-elegance",
    name: "Ivory Elegance",
    price: 1200,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/flower-bouquet/ivory-elegance-2.jpg",
    images: [
      "/images/flower-bouquet/ivory-elegance-2.jpg",
    ],
    rating: 4.9,
    reviewsCount: 20,
    description: "An elegant bouquet of pristine white roses and delicate gypsophila, carefully arranged and wrapped in a classic white and gold paper finish.",
    deliveryInfo: "Delivered fresh from botanical farms in insulated floristry vans.",
    offers: ["Free customized greeting card"],
    includes: [
      "White Roses",
      "Gypsophila Fillers",
      "Premium White & Gold Wrapping",
    ],
    badge: "New",
  },
  {
    id: "bouquet-orchid-symphony",
    slug: "orchid-symphony",
    name: "Orchid Symphony",
    price: 2000,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/flower-bouquet/orchid-symphony-2.jpg",
    images: [
      "/images/flower-bouquet/orchid-symphony-2.jpg",
    ],
    rating: 4.8,
    reviewsCount: 15,
    description: "A stunning symphony of exotic purple orchids and delicate pink roses, beautifully arranged to create a lasting impression.",
    deliveryInfo: "Delivered fresh from botanical farms in insulated floristry vans.",
    offers: ["Free customized greeting card"],
    includes: [
      "Purple Orchids",
      "Pink Roses",
      "Gypsophila Fillers",
      "Premium Wrapping",
    ],
    badge: "Exotic",
  },
  {
    id: "bouquet-rose-garden-bliss",
    slug: "rose-garden-bliss",
    name: "Rose Garden Bliss - 60 roses",
    price: 3600,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/flower-bouquet/rose-garden-bliss.jpg",
    images: [
      "/images/flower-bouquet/rose-garden-bliss.jpg",
    ],
    rating: 5.0,
    reviewsCount: 30,
    description: "A breathtaking arrangement of 60 premium mixed roses, including red, yellow, and pink blooms, meticulously hand-tied with a beautiful ribbon.",
    deliveryInfo: "Delivered fresh from botanical farms in insulated floristry vans.",
    offers: ["Free customized greeting card"],
    includes: [
      "60 Premium Mixed Roses",
      "Gypsophila Fillers",
      "Elegant Wrapping & Ribbon",
    ],
    badge: "Premium",
  },
  {
    id: "bouquet-rose-majesty",
    slug: "rose-majesty",
    name: "Rose Majesty",
    price: 500,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/flower-bouquet/rose-majesty.jpg",
    images: [
      "/images/flower-bouquet/rose-majesty.jpg",
    ],
    rating: 4.8,
    reviewsCount: 12,
    description: "A majestic bouquet of vibrant red, white, and pink roses accented with delicate green foliage, beautifully wrapped for any special occasion.",
    deliveryInfo: "Delivered fresh from botanical farms in insulated floristry vans.",
    offers: ["Free customized greeting card"],
    includes: [
      "Red, White, and Pink Roses",
      "Gypsophila Fillers",
      "Elegant Wrapping & Ribbon",
    ],
    badge: "New",
  },
  {
    id: "bouquet-orchid-harmony",
    slug: "orchid-harmony",
    name: "Orchid Harmony",
    price: 500,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/flower-bouquet/orchid-harmony.jpg",
    images: [
      "/images/flower-bouquet/orchid-harmony.jpg",
    ],
    rating: 4.8,
    reviewsCount: 15,
    description: "A harmonious blend of striking purple orchids and delicate pink and white blooms, beautifully presented in an elegant wrap.",
    deliveryInfo: "Delivered fresh from botanical farms in insulated floristry vans.",
    offers: ["Free customized greeting card"],
    includes: [
      "Purple Orchids",
      "Mixed Blooms",
      "Gypsophila Fillers",
      "Elegant Wrapping",
    ],
    badge: "Exotic",
  },
  {
    id: "bouquet-eternal-blush",
    slug: "eternal-blush",
    name: "Eternal Blush",
    price: 800,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/flower-bouquet/eternal-blush.jpg",
    images: [
      "/images/flower-bouquet/eternal-blush.jpg",
    ],
    rating: 4.7,
    reviewsCount: 18,
    description: "A charming bouquet featuring a delicate mix of soft pink and white roses, complemented by fresh green foliage, elegantly wrapped for a timeless touch.",
    deliveryInfo: "Delivered fresh from botanical farms in insulated floristry vans.",
    offers: ["Free customized greeting card"],
    includes: [
      "Pink and White Roses",
      "Green Foliage Fillers",
      "Elegant Wrapping & Ribbon",
    ],
    badge: "New",
  },
  {
    id: "bouquet-forever-red",
    slug: "forever-red",
    name: "Forever Red",
    price: 1200,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/flower-bouquet/forever-red.jpg",
    images: [
      "/images/flower-bouquet/forever-red.jpg",
    ],
    rating: 4.9,
    reviewsCount: 22,
    description: "A striking bouquet of deep red roses elegantly contrasted with premium black and white wrapping, finished with a classic red ribbon.",
    deliveryInfo: "Delivered fresh from botanical farms in insulated floristry vans.",
    offers: ["Free customized greeting card"],
    includes: [
      "Red Roses",
      "Green Foliage",
      "Premium Black & White Wrapping",
      "Red Ribbon",
    ],
    badge: "Bestseller",
  },
  {
    id: "bouquet-royal-rose-romance",
    slug: "royal-rose-romance",
    name: "Royal Rose Romance - 60 red roses bunch",
    price: 4000,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/flower-bouquet/royal-rose-romance.jpg",
    images: [
      "/images/flower-bouquet/royal-rose-romance.jpg",
    ],
    rating: 5.0,
    reviewsCount: 35,
    description: "An extravagant bunch of 60 premium red roses and delicate gypsophila, meticulously arranged and wrapped in elegant off-white paper with a red ribbon.",
    deliveryInfo: "Delivered fresh from botanical farms in insulated floristry vans.",
    offers: ["Free customized greeting card"],
    includes: [
      "60 Red Roses",
      "Gypsophila Fillers",
      "Off-White Paper Wrapping",
      "Red Satin Ribbon",
    ],
    badge: "Premium",
  },
  {
    id: "bouquet-ruby-romance",
    slug: "ruby-romance",
    name: "Ruby Romance",
    price: 900,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/flower-bouquet/ruby-romance.jpg",
    images: [
      "/images/flower-bouquet/ruby-romance.jpg",
    ],
    rating: 4.8,
    reviewsCount: 20,
    description: "A beautiful expression of love featuring vibrant red roses and lush green foliage, elegantly wrapped in soft paper.",
    deliveryInfo: "Delivered fresh from botanical farms in insulated floristry vans.",
    offers: ["Free customized greeting card"],
    includes: [
      "Red Roses",
      "Green Foliage",
      "Elegant Wrapping",
    ],
    badge: "New",
  },
  {
    id: "bouquet-orchid-fantasy",
    slug: "orchid-fantasy",
    name: "Orchid Fantasy",
    price: 1100,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/flower-bouquet/orchid-fantasy.jpg",
    images: [
      "/images/flower-bouquet/orchid-fantasy.jpg",
    ],
    rating: 4.8,
    reviewsCount: 15,
    description: "A mesmerizing fantasy of purple orchids and soft pink roses, beautifully arranged and wrapped in elegant pink paper to create a dreamy look.",
    deliveryInfo: "Delivered fresh from botanical farms in insulated floristry vans.",
    offers: ["Free customized greeting card"],
    includes: [
      "Purple Orchids",
      "Pink Roses",
      "Gypsophila Fillers",
      "Pink Paper Wrapping",
    ],
    badge: "Exotic",
  },
  {
    id: "bouquet-crimson-bloom",
    slug: "crimson-bloom",
    name: "Crimson Bloom - 40 roses with gypsophilla",
    price: 2000,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/flower-bouquet/crimson-bloom.jpg",
    images: [
      "/images/flower-bouquet/crimson-bloom.jpg",
    ],
    rating: 4.9,
    reviewsCount: 25,
    description: "A breathtaking bunch of 40 fresh red roses and delicate gypsophila, carefully hand-tied and beautifully wrapped in a premium red non-woven sheet paper with a matching ribbon.",
    deliveryInfo: "Delivered fresh from botanical farms in insulated floristry vans.",
    offers: ["Free customized greeting card"],
    includes: [
      "40 Red Roses",
      "Gypsophila Fillers",
      "Red Non-Woven Sheet Wrapping",
      "Red Ribbon",
    ],
    badge: "Premium",
  },
  {
    id: "bouquet-scarlet-grace",
    slug: "scarlet-grace",
    name: "Scarlet Grace",
    price: 700,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/flower-bouquet/scarlet-grace.jpg",
    images: [
      "/images/flower-bouquet/scarlet-grace.jpg",
    ],
    rating: 4.8,
    reviewsCount: 15,
    description: "A graceful bouquet featuring elegant red roses enveloped in pristine white paper, accented with a striking red ribbon.",
    deliveryInfo: "Delivered fresh from botanical farms in insulated floristry vans.",
    offers: ["Free customized greeting card"],
    includes: [
      "Red Roses",
      "Green Foliage Fillers",
      "White Paper Wrapping",
      "Red Ribbon",
    ],
    badge: "New",
  },
  {
    id: "bouquet-luxury-rose-medley",
    slug: "luxury-rose-medley",
    name: "Luxury Rose Medley - 80 mix colour roses bunch",
    price: 5500,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/flower-bouquet/luxury-rose-medley.jpg",
    images: [
      "/images/flower-bouquet/luxury-rose-medley.jpg",
    ],
    rating: 5.0,
    reviewsCount: 42,
    description: "An extravagant and colorful medley of 80 premium mixed roses, meticulously arranged to create a spectacular display of romance and elegance.",
    deliveryInfo: "Delivered fresh from botanical farms in insulated floristry vans.",
    offers: ["Free customized greeting card"],
    includes: [
      "80 Mixed Color Roses",
      "Green Foliage Fillers",
      "Premium Wrapping",
      "Elegant Ribbon",
    ],
    badge: "Luxury",
  },
  {
    id: "bouquet-pink-rose-delight",
    slug: "pink-rose-delight",
    name: "Pink Rose Delight",
    price: 350,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/flower-bouquet/pink-rose-delight.jpg",
    images: [
      "/images/flower-bouquet/pink-rose-delight.jpg",
    ],
    rating: 4.7,
    reviewsCount: 10,
    description: "A delightful bunch of soft pink and red roses beautifully wrapped in a lovely pink paper, tied with a matching ribbon.",
    deliveryInfo: "Delivered fresh from botanical farms in insulated floristry vans.",
    offers: ["Free customized greeting card"],
    includes: [
      "Pink and Red Roses",
      "Green Foliage",
      "Pink Paper Wrapping",
      "Pink Ribbon",
    ],
    badge: "New",
  },
  {
    id: "bouquet-pink-serenity",
    slug: "pink-serenity",
    name: "Pink Serenity",
    price: 700,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/flower-bouquet/pink-serenity.jpg",
    images: [
      "/images/flower-bouquet/pink-serenity.jpg",
    ],
    rating: 4.8,
    reviewsCount: 18,
    description: "A serene and elegant arrangement of fresh pink roses intertwined with delicate gypsophila, presented in a premium pink wrap.",
    deliveryInfo: "Delivered fresh from botanical farms in insulated floristry vans.",
    offers: ["Free customized greeting card"],
    includes: [
      "Pink Roses",
      "Gypsophila Fillers",
      "Premium Pink Wrapping",
      "Pink Satin Ribbon",
    ],
    badge: "Bestseller",
  },
  {
    id: "bouquet-eternal-ivory",
    slug: "eternal-ivory",
    name: "Eternal Ivory",
    price: 500,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/flower-bouquet/eternal-ivory.jpg",
    images: [
      "/images/flower-bouquet/eternal-ivory.jpg",
    ],
    rating: 4.8,
    reviewsCount: 12,
    description: "A sophisticated arrangement of pure white roses and lush green foliage, elegantly wrapped in white paper with striking black accents.",
    deliveryInfo: "Delivered fresh from botanical farms in insulated floristry vans.",
    offers: ["Free customized greeting card"],
    includes: [
      "White Roses",
      "Green Foliage",
      "White Paper Wrapping with Black Borders",
      "Black Ribbon",
    ],
    badge: "Elegant",
  },
  {
    id: "bouquet-yellow-blossom",
    slug: "yellow-blossom",
    name: "Yellow Blossom",
    price: 700,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/flower-bouquet/yellow-blossom.jpg",
    images: [
      "/images/flower-bouquet/yellow-blossom.jpg",
    ],
    rating: 4.8,
    reviewsCount: 16,
    description: "A bright and cheerful bouquet of vibrant yellow roses, perfectly complemented by green foliage and wrapped in beautiful purple paper.",
    deliveryInfo: "Delivered fresh from botanical farms in insulated floristry vans.",
    offers: ["Free customized greeting card"],
    includes: [
      "Yellow Roses",
      "Green Foliage",
      "Purple Paper Wrapping",
      "Gold Ribbon",
    ],
    badge: "New",
  },

  // ==================== CAKES PRODUCTS (/cakes) ====================

  {
    id: "cake-blue-floral",
    slug: "blue-floral-birthday-cake",
    name: "Blue Floral Birthday Cake",
    price: 1150,
    category: "cakes",
    categoryLabel: "Cakes",
    image: "/images/cakes/blue-floral-birthday-cake.png",
    images: [
      "/images/cakes/blue-floral-birthday-cake.png",
    ],
    rating: 5.0,
    reviewsCount: 118,
    description:
      "Ethereal pastel blue and cream buttercream tiers adorned with hand-piped edible floral rosettes, delicate gold leaf accents, and a festive birthday topper.",
    deliveryInfo: "Chilled temperature-controlled delivery guaranteed within Kozhikode.",
    offers: [
      "Complimentary personalized birthday card",
      "Free cake sparkler",
    ],
    includes: [
      "1kg Vanilla Blueberry Cream Cake",
      "Hand-Piped Floral Accents",
      "Bespoke Ribbon Gift Box",
    ],
    badge: "Floral Elegance",
  },
  {
    id: "cake-chocolate-amma",
    slug: "chocolate-birthday-cake-for-amma",
    name: "Chocolate Birthday Cake for Amma",
    price: 1150,
    category: "cakes",
    categoryLabel: "Cakes",
    image: "/images/cakes/chocolate-birthday-cake-for-amma.png",
    images: [
      "/images/cakes/chocolate-birthday-cake-for-amma.png",
    ],
    rating: 5.0,
    reviewsCount: 142,
    description:
      "Heartwarming chocolate celebration cake crafted especially for Amma, layered with rich Dutch truffle ganache, piped floral rosettes, fresh strawberries, and an affectionate commemorative topper.",
    deliveryInfo: "Same-day delivery across Calicut city.",
    offers: [
      "Free custom chocolate plaque with your message",
      "Complimentary birthday candle set",
    ],
    includes: [
      "1kg Dutch Truffle Chocolate Cake",
      "Fresh Ruby Strawberries",
      "Gold Amma Keepsake Topper",
    ],
    badge: "Bestseller for Mom",
  },
  {
    id: "cake-decadent-shavings",
    slug: "1kg Premium Belgium Chocolate Cake",
    name: "1kg Premium Belgium Chocolate Cake",
    price: 2300,
    category: "cakes",
    categoryLabel: "Cakes",
    image: "/images/cakes/decadent-chocolate-shavings-cake.png",
    images: [
      "/images/cakes/decadent-chocolate-shavings-cake.png",
    ],
    rating: 4.9,
    reviewsCount: 88,
    description:
      "Layers of velvety devil's food chocolate sponge smothered in rich fudge ganache, generously crowned with cascading dark chocolate shavings and handcrafted truffles.",
    deliveryInfo: "Delivered chilled in insulated gift packaging.",
    offers: ["10% off when bundled with fresh flower bouquets"],
    includes: [
      "1kg Couverture Chocolate Gateau",
      "Dark Chocolate Shavings Crown",
      "Wooden Cutlery Set",
    ],
    badge: "Chocoholic Delight",
  },
  {
    id: "cake-chocolate-web",
    slug: "elegant-chocolate-web-cake",
    name: "Artisan Chocolate Web Drizzle Cake",
    price: 1199,
    category: "cakes",
    categoryLabel: "Cakes",
    image: "/images/cakes/elegant-chocolate-web-cake.png",
    images: [
      "/images/cakes/elegant-chocolate-web-cake.png",
    ],
    rating: 4.8,
    reviewsCount: 75,
    description:
      "Striking contemporary cake featuring intricate dark chocolate spiderweb marbling drizzled over smooth vanilla-bean buttercream, presented on an artisanal pedestal.",
    deliveryInfo: "Hand-delivered with delicate care across Calicut.",
    offers: ["Free greeting card with custom wax seal"],
    includes: [
      "1kg Mocha Chocolate Layer Cake",
      "Artisan Spiderweb Glaze",
      "Gift Presentation Packaging",
    ],
    badge: "Artisan Pick",
  },
  {
    id: "cake-just-engaged",
    slug: "elegant-just-engaged-heart-cake",
    name: "Elegant Just Engaged Heart Cake",
    price: 1299,
    category: "cakes",
    categoryLabel: "Cakes",
    image: "/images/cakes/elegant-just-engaged-heart-cake.png",
    images: [
      "/images/cakes/elegant-just-engaged-heart-cake.png",
    ],
    rating: 5.0,
    reviewsCount: 64,
    description:
      "Romantic ivory heart-shaped cake bordered with vintage Lambeth ruffled piping, pearl sprinkles, and a glistening gold 'Just Engaged' keepsake topper for your unforgettable announcement.",
    deliveryInfo: "Express 3-hour priority delivery for engagement parties.",
    offers: [
      "Includes keepsake acrylic gold topper",
      "Complimentary champagne candle",
    ],
    includes: [
      "1.2kg Red Velvet Cream Cheese Heart Cake",
      "Vintage Lambeth Ruffled Borders",
      "Luxury Satin Bow Presentation",
    ],
    badge: "Engagement Special",
  },
  {
    id: "cake-red-heart-anniversary",
    slug: "1kg Chocolate truffle cake white topping 1150",
    name: "1kg Chocolate Truffle Cake White Topping",
    price: 1150,
    category: "cakes",
    categoryLabel: "Cakes",
    image: "/images/cakes/elegant-red-heart-anniversary-cake.png",
    images: [
      "/images/cakes/elegant-red-heart-anniversary-cake.png",
    ],
    rating: 4.9,
    reviewsCount: 110,
    description:
      "Passionate crimson heart cake frosted with deep red velvet buttercream, crowned with hand-sculpted sugar blossoms, golden anniversary accents, and celebratory romantic hearts.",
    deliveryInfo: "Guaranteed evening surprise delivery in Kozhikode.",
    offers: [
      "Free romantic card with wax seal",
      "Use code LOVE10 for 10% off",
    ],
    includes: [
      "1kg Red Velvet & White Chocolate Cake",
      "Sugar Rose Accents",
      "Golden Heart Anniversary Keepsake",
    ],
    badge: "Anniversary Special",
  },
  {
    id: "cake-evana-floral",
    slug: "evana-floral-celebration-cake",
    name: "Evana Pastel Floral Celebration Cake",
    price: 1199,
    category: "cakes",
    categoryLabel: "Cakes",
    image: "/images/cakes/evana-floral-celebration-cake.png",
    images: [
      "/images/cakes/evana-floral-celebration-cake.png",
    ],
    rating: 4.9,
    reviewsCount: 82,
    description:
      "Graceful tall tier of vanilla chiffon cake frosted in delicate blush ombre buttercream, adorned with edible wild rose petals, French pastel macarons, and golden sparkles.",
    deliveryInfo: "Cold transport courier delivery across Calicut.",
    offers: [
      "Free celebration candle box",
      "Custom piped name lettering",
    ],
    includes: [
      "1kg Vanilla Berry Chiffon Cake",
      "Fresh Edible Blooms & Macarons",
      "Designer Gift Box",
    ],
    badge: "Signature Design",
  },
  {
    id: "cake-golden-crumb",
    slug: "golden-crumb-chocolate-drizzle-cake",
    name: "1kg Special Butterscotch Cake",
    price: 1150,
    category: "cakes",
    categoryLabel: "Cakes",
    image: "/images/cakes/golden-crumb-chocolate-drizzle-cake.png",
    images: [
      "/images/cakes/golden-crumb-chocolate-drizzle-cake.png",
    ],
    rating: 4.8,
    reviewsCount: 67,
    description:
      "Decadent dark chocolate gateau cascading with warm melted couverture drip, roasted golden hazelnut crumble, and caramelized gold flakes over silky buttercream.",
    deliveryInfo: "Available for same-day delivery across Kozhikode.",
    offers: ["Free customized message on chocolate disk"],
    includes: [
      "1kg Hazelnut Praline Chocolate Cake",
      "Couverture Ganache Drip",
      "Toasted Hazelnut Crumb",
    ],
    badge: "Gourmet Pick",
  },
  {
    id: "cake-lavender-amma",
    slug: "lavender-floral-happy-birthday-amma-cake",
    name: "1kg Vanilla Flavour Cake",
    price: 995,
    category: "cakes",
    categoryLabel: "Cakes",
    image: "/images/cakes/lavender-floral-happy-birthday-amma-cake.png",
    images: [
      "/images/cakes/lavender-floral-happy-birthday-amma-cake.png",
    ],
    rating: 5.0,
    reviewsCount: 134,
    description:
      "Serene lilac and lavender buttercream creation accented with fresh edible blooms, gold dusted pearls, and a heartfelt handwritten birthday wish for dearest Amma.",
    deliveryInfo: "Same-day 3-hour delivery in Kozhikode.",
    offers: [
      "Personalized greeting message included",
      "Free birthday sparkler",
    ],
    includes: [
      "1kg Blueberry Lavender Vanilla Cake",
      "Edible Floral Arrangement",
      "Luxury Gift Box Packaging",
    ],
    badge: "Amma's Favorite",
  },
  {
    id: "cake-luxury-half-choco",
    slug: "luxury-half-chocolate-birthday-cake",
    name: "1kg Choco Vanilla Cake",
    price: 1150,
    category: "cakes",
    categoryLabel: "Cakes",
    image: "/images/cakes/luxury-half-chocolate-birthday-cake.png",
    images: [
      "/images/cakes/luxury-half-chocolate-birthday-cake.png",
    ],
    rating: 4.9,
    reviewsCount: 93,
    description:
      "The ultimate dual temptation: half richly glazed in dark Belgian truffle ganache with chocolate spheres, and half enveloped in vanilla chantilly with golden birthday accents.",
    deliveryInfo: "Delivered chilled in insulated gift carrier.",
    offers: ["Free personalized cake topper"],
    includes: [
      "1.2kg Duo Chocolate & Vanilla Gateau",
      "Artisan Truffle Spheres",
      "Celebration Sparkler",
    ],
    badge: "Duo Delight",
  },
  {
    id: "cake-pastel-pink-heart",
    slug: "Pink marvel Chocolate cake 1150",
    name: "Pink Marvel Chocolate Cake",
    price: 1150,
    category: "cakes",
    categoryLabel: "Cakes",
    image: "/images/cakes/pastel-pink-heart-cake.png",
    images: [
      "/images/cakes/pastel-pink-heart-cake.png",
    ],
    rating: 4.9,
    reviewsCount: 88,
    description:
      "Dreamy baby-pink heart-shaped cake featuring intricate Victorian lace piping, delicate ribbon rosettes, and sweet raspberry vanilla compote sponge layered with cream cheese.",
    deliveryInfo: "Fresh morning bake; same-day delivery across Calicut.",
    offers: ["Custom retro piped lettering included"],
    includes: [
      "1kg Strawberry Raspberry Heart Cake",
      "Vintage Lambeth Ruffled Piping",
      "Luxury Keepsake Box",
    ],
    badge: "Trending Heart",
  },
  {
    id: "cake-onyx-black",
    slug: "onyx-black-celebration-cake",
    name: "Onyx Black Celebration Cake",
    price: 1199,
    category: "cakes",
    categoryLabel: "Cakes",
    image: "/images/cakes/onyx-black-celebration-cake.png",
    images: [
      "/images/cakes/onyx-black-celebration-cake.png",
    ],
    rating: 4.9,
    reviewsCount: 96,
    description:
      "Ultra-modern matte obsidian buttercream cake adorned with sleek metallic spheres, gold dust splatters, and celebratory candles. An avant-garde luxury statement for landmark birthdays and milestones.",
    deliveryInfo: "Freshly baked on order; express 3-hour chilled delivery across Calicut.",
    offers: [
      "Free celebration candle & wooden knife",
      "Use code SWEET10 for 10% off",
    ],
    includes: [
      "1kg Dark Belgian Chocolate Sponge",
      "Hand-Rolled Metallic Spheres",
      "Premium Gold Lettering Plaque",
    ],
    badge: "Modern Luxe",
  },
  {
    id: "cake-red-velvet-gold",
    slug: "red-velvet-gold-birthday-cake",
    name: "1kg Red Velvet Cake With Topper",
    price: 1250,
    category: "cakes",
    categoryLabel: "Cakes",
    image: "/images/cakes/red-velvet-gold-birthday-cake.png",
    images: [
      "/images/cakes/red-velvet-gold-birthday-cake.png",
    ],
    rating: 5.0,
    reviewsCount: 156,
    description:
      "Show-stopping deep ruby red velvet cake layered with Madagascar vanilla cream cheese frosting, crowned with edible 24k gold leaf and an acrylic golden Happy Birthday topper.",
    deliveryInfo: "White glove delivery across Kozhikode within 3 hours.",
    offers: [
      "Complimentary gold birthday topper included",
      "Free wax-sealed greeting card",
    ],
    includes: [
      "1.2kg Classic Red Velvet Gateau",
      "Edible Gold Leaf Accents",
      "Golden Acrylic Keepsake Topper",
    ],
    badge: "Royal Bestseller",
  },
  {
    id: "addon-black-forest",
    slug: "black-forest",
    name: "Black Forest Cake",
    price: 80,
    originalPrice: 120,
    category: "cakes",
    categoryLabel: "Cakes",
    image: "/images/addons/black-forest.jpg",
    images: [
      "/images/addons/black-forest.jpg",
      "/images/addons/black-forest.jpg",
    ],
    rating: 4.9,
    ratingsCount: 42,
    reviewsCount: 38,
    description:
      "Classic rich Black Forest cake layered with dark chocolate sponge, whipped fresh cream, and juicy dark cherries, crowned with chocolate shavings.",
    deliveryInfo: "Fresh chilled delivery guaranteed across Calicut.",
    offers: [
      "10% off when ordered with flower bouquets",
      "Complimentary candle & knife set included",
    ],
    includes: [
      "Signature Black Forest Sponge",
      "Fresh Whipped Dairy Cream & Cherries",
      "Dark Chocolate Curls",
    ],
    badge: "Addon Favorite",
  },

  // ==================== SPECIAL OCCASIONS PRODUCTS (/special-occasions) ====================
  {
    id: "occ-1",
    slug: "birthday-flower-gift",
    name: "Birthday Flower Gift Set",
    price: 1199,
    originalPrice: 1399,
    category: "special-occasions",
    categoryLabel: "Special Occasions",
    image: "/images/occasion-birthday.jpg",
    images: [
      "/images/occasion-birthday.jpg",
      "/images/cat-birthday.jpg",
      "/images/sunflower-bouquet.jpg",
      "/images/cakes/cake-ombre-butterfly-birthday.jpg",
    ],
    rating: 4.9,
    reviewsCount: 153,
    description:
      "A joyful birthday presentation featuring cheerful pink gerberas, sunny chrysanthemums, and balloons with a celebratory keepsake card.",
    deliveryInfo: "Same-day birthday surprise delivery available until 9 PM.",
    offers: [
      "Free birthday message card with wax seal",
      "Use code BDAY10 for 10% off",
    ],
    includes: [
      "Joyful Birthday Bloom Bunch",
      "Birthday Helium Balloon Accent",
      "Wax-Sealed Birthday Wish Note",
    ],
    badge: "Birthday",
  },
  {
    id: "occ-2",
    slug: "anniversary-romance-rose-hamper",
    name: "Anniversary Romance Rose Hamper",
    price: 1899,
    originalPrice: 2299,
    category: "special-occasions",
    categoryLabel: "Special Occasions",
    image: "/images/occasion-anniversary.jpg",
    images: [
      "/images/occasion-anniversary.jpg",
      "/images/red-rose-bouquet.jpg",
      "/images/cakes/cake-anniversary-maroon-gold.png",
    ],
    rating: 5.0,
    reviewsCount: 167,
    description:
      "Celebrate milestone love with a luxury box of two dozen crimson velvet roses, Belgian chocolates, and fragrant dried lavender petals.",
    deliveryInfo: "Midnight anniversary delivery available across Calicut.",
    offers: ["Complimentary engraved wooden anniversary tag"],
    includes: [
      "24 Velvet Red Roses",
      "Artisanal Box of Chocolates",
      "Champagne Silk Ribbon Bow",
    ],
    badge: "Anniversary",
  },
  {
    id: "occ-3",
    slug: "wedding-cathedral-altar-arch",
    name: "Cathedral Grand Altar Floral Arch",
    price: 4999,
    originalPrice: 5999,
    category: "special-occasions",
    categoryLabel: "Special Occasions",
    image: "/images/highlight-church-arrangements.jpg",
    images: [
      "/images/highlight-church-arrangements.jpg",
      "/images/table-decor-outdoor-ceremony-arch.jpg",
      "/images/occasion-wedding.jpg",
    ],
    rating: 5.0,
    reviewsCount: 48,
    description:
      "Bespoke ceremonial arch crafted with Casablanca white lilies, Avalanche roses, hydrangeas, and lush cascading Italian ruscus.",
    deliveryInfo: "Setup and styled on-site by Occasions master decor team.",
    offers: ["Free in-person floral consultation in Calicut"],
    includes: [
      "Full Grand Floral Arch Installation",
      "Fresh White Lilies & Avalanche Roses",
      "On-Site Setup & Post-Event Breakdown",
    ],
    badge: "Wedding",
  },
  {
    id: "occ-4",
    slug: "valentines-crimson-luxury-box",
    name: "Valentine's Crimson Luxury Heart",
    price: 1599,
    originalPrice: 1899,
    category: "special-occasions",
    categoryLabel: "Special Occasions",
    image: "/images/wreath-heart-pink-sash.jpg",
    images: [
      "/images/wreath-heart-pink-sash.jpg",
      "/images/red-rose-bouquet.jpg",
      "/images/basket-romantic-ribbon.jpg",
    ],
    rating: 4.9,
    reviewsCount: 135,
    description:
      "Sculpted heart arrangement woven with tender red and blush roses, eucalyptus foliage, and custom satin love ribbon.",
    deliveryInfo: "Special timed delivery slots for Valentine surprises.",
    offers: ["Free imported Ferrero Rocher box with order"],
    includes: [
      "Heart-Shaped Rose Arrangement",
      "Luxury Ribbon Sash",
      "Gift Card in Gold Envelope",
    ],
    badge: "Valentine's Day",
  },
  {
    id: "occ-5",
    slug: "mothers-day-pastels-basket",
    name: "Mother's Day Pastel Grace Basket",
    price: 1349,
    originalPrice: 1599,
    category: "special-occasions",
    categoryLabel: "Special Occasions",
    image: "/images/basket-pink-chrysanthemums.jpg",
    images: [
      "/images/basket-pink-chrysanthemums.jpg",
      "/images/basket-gerberas.jpg",
      "/images/flower-pink-roses.jpg",
    ],
    rating: 4.9,
    reviewsCount: 89,
    description:
      "Soft blush roses, chamomile, and white button chrysanthemums arranged in a wicker garden basket with a warm handwritten tribute card.",
    deliveryInfo: "Delivered on Mother's Day morning anywhere in Kozhikode.",
    offers: ["Free personalized photo frame included"],
    includes: [
      "Blush Roses & Pink Carnations",
      "Airy White Chrysanthemums",
      "Handcrafted Basket with Tissue Lining",
    ],
    badge: "Mother's Day",
  },
  {
    id: "occ-6",
    slug: "congratulations-sunshine-blooms",
    name: "Congratulations Sunshine Blooms",
    price: 1099,
    originalPrice: 1299,
    category: "special-occasions",
    categoryLabel: "Special Occasions",
    image: "/images/occasion-congratulations.jpg",
    images: [
      "/images/occasion-congratulations.jpg",
      "/images/cat-congratulations.jpg",
      "/images/sunflower-bouquet.jpg",
    ],
    rating: 4.8,
    reviewsCount: 76,
    description:
      "Vibrant orange gerberas, golden Asiatic lilies, and sunflowers celebrating promotions, graduations, and achievements with dazzling energy.",
    deliveryInfo: "Same-day express dispatch to offices and residences.",
    offers: ["Congratulatory greeting card included"],
    includes: [
      "Golden Lilies & Orange Gerberas",
      "Congratulations Gold Foil Tag",
      "Vibrant Color Gift Wrapping",
    ],
    badge: "Congratulations",
  },
  {
    id: "occ-7",
    slug: "get-well-soon-chamomile-gift",
    name: "Get Well Soon Chamomile Meadow",
    price: 999,
    originalPrice: 1199,
    category: "special-occasions",
    categoryLabel: "Special Occasions",
    image: "/images/occasion-best-wishes.jpg",
    images: [
      "/images/occasion-best-wishes.jpg",
      "/images/basket-gerberas.jpg",
      "/images/sunflower-bouquet.jpg",
    ],
    rating: 4.9,
    reviewsCount: 54,
    description:
      "Calming, uplifting arrangement of fragrant chamomile, white daisies, and soothing lavender greens to brighten recovery days.",
    deliveryInfo: "Safe delivery to hospital rooms and home recovery addresses.",
    offers: ["Free healing wishes note card"],
    includes: [
      "Fresh Chamomile Stems",
      "White Daisies & Green Button Mums",
      "Recyclable Ceramic Pitcher Vase",
    ],
    badge: "Get Well Soon",
  },
  {
    id: "occ-8",
    slug: "candlelit-wedding-aisle-clusters",
    name: "Candlelit Wedding Aisle Clusters",
    price: 2499,
    originalPrice: 2999,
    category: "special-occasions",
    categoryLabel: "Special Occasions",
    image: "/images/table-decor-wedding-fairy-lights.jpg",
    images: [
      "/images/table-decor-wedding-fairy-lights.jpg",
      "/images/table-centerpiece-decor.jpg",
      "/images/highlight-church-arrangements.jpg",
    ],
    rating: 5.0,
    reviewsCount: 62,
    description:
      "Ethereal candlelit floral clusters designed for church aisle pews, banquet tables, and ceremonial bridal walkways.",
    deliveryInfo: "Includes candle glass holders and on-site event placement.",
    offers: ["Special bundle discount for 10+ pew clusters"],
    includes: [
      "White Roses & Lisianthus Posies",
      "Floating Pillar Glass Candles",
      "Sheer Chiffon Pew Drapes",
    ],
    badge: "Wedding",
  },
  {
    id: "addon-ferrero",
    slug: "ferrero-rocher-chocolate",
    name: "Ferrero Rocher Chocolate",
    price: 80,
    originalPrice: 100,
    category: "special-occasions",
    categoryLabel: "Special Occasions",
    image: "/images/addons/ferrero-rocher.jpg",
    images: [
      "/images/addons/ferrero-rocher.jpg",
      "/images/addons/ferrero-rocher.jpg",
    ],
    rating: 5.0,
    ratingsCount: 56,
    reviewsCount: 52,
    description:
      "Iconic Italian Ferrero Rocher crisp hazelnut and milk chocolate pralines wrapped in signature gold foil with an elegant gold bow.",
    deliveryInfo: "Delivered chilled alongside your floral arrangements.",
    offers: [
      "Complimentary personalized greeting card",
    ],
    includes: [
      "Ferrero Rocher Hazelnut Chocolates",
      "Gold Ribbon Keepsake Box",
    ],
    badge: "Bestseller Addon",
  },
  {
    id: "addon-cadbury-silk",
    slug: "cadbury-dairy-milk-silk",
    name: "Cadbury Dairy Milk Silk",
    price: 80,
    originalPrice: 95,
    category: "special-occasions",
    categoryLabel: "Special Occasions",
    image: "/images/addons/dairy-milk-silk.jpg",
    images: [
      "/images/addons/dairy-milk-silk.jpg",
      "/images/addons/dairy-milk-silk.jpg",
    ],
    rating: 4.8,
    ratingsCount: 47,
    reviewsCount: 43,
    description:
      "Smooth, velvety Cadbury Dairy Milk Silk chocolate crafted with rich milk cocoa that melts luxuriously in the mouth.",
    deliveryInfo: "Delivered fresh and chilled with your floral order.",
    offers: [
      "Complimentary gift wrap packaging",
    ],
    includes: [
      "Cadbury Dairy Milk Silk Bar",
      "Signature Gift Sleeve",
    ],
    badge: "Sweet Delight",
  },
  {
    id: "addon-cadbury-silk-oreo",
    slug: "cadbury-dairy-milk-silk-oreo",
    name: "Cadbury Dairy Milk Silk Oreo",
    price: 85,
    originalPrice: 105,
    category: "special-occasions",
    categoryLabel: "Special Occasions",
    image: "/images/addons/dairy-milk-silk-oreo.jpg",
    images: [
      "/images/addons/dairy-milk-silk-oreo.jpg",
      "/images/addons/dairy-milk-silk.jpg",
    ],
    rating: 4.9,
    ratingsCount: 62,
    reviewsCount: 58,
    description:
      "Irresistible Cadbury Dairy Milk Silk combined with crunchy Oreo cookie bites and a smooth vanilla cream center for an indulgent crunch.",
    deliveryInfo: "Delivered fresh and chilled with your floral order.",
    offers: [
      "Complimentary gift wrap packaging",
      "10% off when ordered with celebration bouquets",
    ],
    includes: [
      "Cadbury Dairy Milk Silk Oreo Bar (130g)",
      "Premium Gift Wrap Sleeve",
    ],
    badge: "Oreo Crunch",
  },
  {
    id: "addon-galaxy-smooth-milk",
    slug: "galaxy-smooth-milk-chocolate",
    name: "Galaxy Smooth Milk Chocolate",
    price: 90,
    originalPrice: 115,
    category: "special-occasions",
    categoryLabel: "Special Occasions",
    image: "/images/addons/galaxy-smooth-milk.jpg",
    images: [
      "/images/addons/galaxy-smooth-milk.jpg",
      "/images/addons/dairy-milk-silk.jpg",
    ],
    rating: 4.9,
    ratingsCount: 54,
    reviewsCount: 49,
    description:
      "Silky smooth Galaxy pure milk chocolate that melts effortlessly on the tongue with quintessential British cocoa richness.",
    deliveryInfo: "Delivered fresh and chilled with your floral order.",
    offers: ["Complimentary gift card included"],
    includes: [
      "Galaxy Smooth Milk Chocolate Bar (110g)",
      "Signature Gift Sleeve",
    ],
    badge: "Silky Smooth",
  },
  {
    id: "addon-cadbury-fruit-nut",
    slug: "cadbury-dairy-milk-fruit-and-nut",
    name: "Cadbury Dairy Milk Fruit & Nut",
    price: 85,
    originalPrice: 105,
    category: "special-occasions",
    categoryLabel: "Special Occasions",
    image: "/images/addons/dairy-milk-fruit-nut.jpg",
    images: [
      "/images/addons/dairy-milk-fruit-nut.jpg",
      "/images/addons/dairy-milk-silk.jpg",
    ],
    rating: 4.8,
    ratingsCount: 41,
    reviewsCount: 37,
    description:
      "Classic Cadbury Dairy Milk packed with whole crunchy California almonds and succulent sun-ripened raisins for the perfect textured bite.",
    deliveryInfo: "Delivered fresh and chilled with your floral order.",
    offers: ["Complimentary gift wrap packaging"],
    includes: [
      "Cadbury Dairy Milk Fruit & Nut Bar (110g)",
      "Decorative Gift Ribbon",
    ],
    badge: "Crunchy & Chewy",
  },
  {
    id: "addon-cadbury-roast-almond",
    slug: "cadbury-dairy-milk-roast-almond",
    name: "Cadbury Dairy Milk Roast Almond",
    price: 85,
    originalPrice: 105,
    category: "special-occasions",
    categoryLabel: "Special Occasions",
    image: "/images/addons/dairy-milk-roast-almond.jpg",
    images: [
      "/images/addons/dairy-milk-roast-almond.jpg",
      "/images/addons/dairy-milk-silk.jpg",
    ],
    rating: 4.8,
    ratingsCount: 38,
    reviewsCount: 35,
    description:
      "Loaded with gently roasted whole almonds folded into rich, creamy milk chocolate for a satisfying nutty crunch.",
    deliveryInfo: "Delivered fresh and chilled with your floral order.",
    offers: ["Complimentary gift wrap packaging"],
    includes: [
      "Cadbury Dairy Milk Roast Almond Bar (110g)",
      "Signature Gift Sleeve",
    ],
    badge: "Roasted Crunch",
  },
  {
    id: "addon-cadbury-bubbly",
    slug: "cadbury-dairy-milk-silk-bubbly",
    name: "Cadbury Dairy Milk Silk Bubbly",
    price: 90,
    originalPrice: 110,
    category: "special-occasions",
    categoryLabel: "Special Occasions",
    image: "/images/addons/dairy-milk-bubbly.jpg",
    images: [
      "/images/addons/dairy-milk-bubbly.jpg",
      "/images/addons/dairy-milk-silk.jpg",
    ],
    rating: 4.9,
    ratingsCount: 45,
    reviewsCount: 40,
    description:
      "Playful aerated bubbly chocolate on the outside with pure creamy Silk chocolate inside for an extraordinary melt-in-your-mouth experience.",
    deliveryInfo: "Delivered fresh and chilled with your floral order.",
    offers: ["Complimentary gift wrap packaging"],
    includes: [
      "Cadbury Dairy Milk Silk Bubbly Bar (120g)",
      "Signature Gift Sleeve",
    ],
    badge: "Bubbly Melt",
  },
  {
    id: "addon-soft-toys",
    slug: "soft-toys",
    name: "Soft Toys Teddy Bear",
    price: 80,
    originalPrice: 120,
    category: "special-occasions",
    categoryLabel: "Special Occasions",
    image: "/images/addons/soft-toys.jpg",
    images: [
      "/images/addons/soft-toys.jpg",
      "/images/addons/soft-toys.jpg",
    ],
    rating: 4.9,
    ratingsCount: 39,
    reviewsCount: 35,
    description:
      "Adorable blush pink plush teddy bear holding an embroidered heart. Ultra-soft and huggable, the sweetest accompaniment to your celebration blooms.",
    deliveryInfo: "Hand-delivered along with your gift package in pristine condition.",
    offers: [
      "Free personalized satin ribbon tag",
    ],
    includes: [
      "Plush Pink Cuddle Bear",
      "Embroidered Heart Keepsake",
    ],
    badge: "Heartfelt Gift",
  },

  // ==================== OUR HIGHLIGHTS PRODUCTS (/our-highlights) ====================
  {
    id: "hl-1",
    slug: "signature-occasions-bridal-bouquet",
    name: "Signature Occasions Bridal Bouquet",
    price: 1899,
    originalPrice: 2299,
    category: "our-highlights",
    categoryLabel: "Our Highlights",
    image: "/images/bouquet-1.jpg",
    images: [
      "/images/bouquet-1.jpg",
      "/images/red-rose-bouquet.jpg",
      "/images/flower-pink-roses.jpg",
      "/images/flower-white-roses.jpg",
    ],
    rating: 5.0,
    reviewsCount: 210,
    description:
      "Our most celebrated bridal bouquet in Calicut: Dutch blush roses paired with sweet Madurai jasmine sprigs, gypsophila, and trailing silk ribbons.",
    deliveryInfo: "Delivered fresh on wedding morning in protective boutique crate.",
    offers: [
      "Featured on India Florist Association spotlight",
      "Complimentary groom boutonniere included",
    ],
    includes: [
      "28 Dutch Blush Avalanche Roses",
      "Madurai Jasmine Sprays",
      "Silver Dollar Eucalyptus",
      "Cascading Silk French Ribbon",
    ],
    badge: "Store Icon",
  },
  {
    id: "hl-2",
    slug: "royal-casablanca-candelabra-display",
    name: "Royal Casablanca Candelabra Display",
    price: 2899,
    originalPrice: 3499,
    category: "our-highlights",
    categoryLabel: "Our Highlights",
    image: "/images/highlight-table-arrangements.jpg",
    images: [
      "/images/highlight-table-arrangements.jpg",
      "/images/table-centerpiece-decor.jpg",
      "/images/flower-white-lilies.jpg",
    ],
    rating: 4.9,
    reviewsCount: 88,
    description:
      "Elevated antique candelabra arrangement adorned with Casablanca lilies, Avalanche white roses, hydrangeas, and trailing eucalyptus for elite banquets.",
    deliveryInfo: "Delivered and installed by Occasions banquet stylists.",
    offers: ["Free LED candle pillar inclusions"],
    includes: [
      "Antique Brass Candelabra",
      "Casablanca Lilies & White Hydrangeas",
      "Trailing Ruscus & Ivy",
    ],
    badge: "Luxury Decor",
  },
  {
    id: "hl-3",
    slug: "ceremonial-jasmine-marigold-garland",
    name: "Ceremonial Jasmine & Marigold Garland",
    price: 1499,
    originalPrice: 1799,
    category: "our-highlights",
    categoryLabel: "Our Highlights",
    image: "/images/highlight-garlands.jpg",
    images: [
      "/images/highlight-garlands.jpg",
      "/images/jasmine-blossom.png",
      "/images/basket-yellow-roses.jpg",
    ],
    rating: 5.0,
    reviewsCount: 165,
    description:
      "Aromatic hand-woven garland of fragrant Madurai jasmine buds and golden marigolds for traditional Kerala wedding rituals and temple blessings.",
    deliveryInfo: "Fresh morning woven dispatch guaranteed across Malabar.",
    offers: ["Pair discount available for bride & groom varmala"],
    includes: [
      "Aromatic Madurai Jasmine Buds",
      "Selected Golden Marigold Petals",
      "Traditional Gold Thread Weave",
    ],
    badge: "Traditional",
  },
  {
    id: "hl-4",
    slug: "celebration-cake-flower-hamper-luxe",
    name: "Celebration Cake & Floral Hamper Luxe",
    price: 1799,
    originalPrice: 2099,
    category: "our-highlights",
    categoryLabel: "Our Highlights",
    image: "/images/bouquet-2.jpg",
    images: [
      "/images/bouquet-2.jpg",
      "/images/cakes/cake-chocolate-strawberry-drip.png",
      "/images/sunflower-bouquet.jpg",
    ],
    rating: 4.9,
    reviewsCount: 144,
    description:
      "The top-selling Occasions combo: Freshly baked truffle gateau paired with a hand-tied meadow bouquet of sunflowers, roses, and daisies.",
    deliveryInfo: "Delivered together seamlessly in a keepsake presentation box.",
    offers: ["Free customized wax-sealed celebration card"],
    includes: [
      "500g Belgian Truffle Gateau",
      "Hand-Tied Sunshine & Rose Bouquet",
      "Celebration Sparkler Candle",
    ],
    badge: "Most Loved Combo",
  },
  {
    id: "hl-5",
    slug: "pure-white-rose-majesty-highlight",
    name: "Pure White Rose Majesty Basket",
    price: 1699,
    originalPrice: 1999,
    category: "our-highlights",
    categoryLabel: "Our Highlights",
    image: "/images/basket-white-roses.jpg",
    images: [
      "/images/basket-white-roses.jpg",
      "/images/basket-gerberas.jpg",
      "/images/flower-white-roses.jpg",
    ],
    rating: 5.0,
    reviewsCount: 99,
    description:
      "Spectacular woven wicker basket overflowing with dozens of pure Dutch white roses and feathery asparagus ferns. A benchmark of florist artistry.",
    deliveryInfo: "Express 2-hour delivery across Calicut.",
    offers: ["Flat 10% off with code HIGHLIGHT10"],
    includes: [
      "30 Avalanche Dutch White Roses",
      "Fine Wicker Basket with Satin Bow",
      "Long-Lasting Hydration Oasis Base",
    ],
    badge: "Customer Favorite",
  },
  {
    id: "hl-7",
    slug: "pastel-ombre-butterfly-cake-highlight",
    name: "Artisan Ombre Butterfly Cake",
    price: 1199,
    originalPrice: 1399,
    category: "our-highlights",
    categoryLabel: "Our Highlights",
    image: "/images/cakes/cake-ombre-butterfly-birthday.jpg",
    images: [
      "/images/cakes/cake-ombre-butterfly-birthday.jpg",
      "/images/cakes/cake-anniversary-maroon-gold.png",
      "/images/cakes/celebration-cake-cat.jpg",
    ],
    rating: 5.0,
    reviewsCount: 115,
    description:
      "Artisanal square ombre buttercream cake with textured maroon-to-cream gradient, chocolate pearls, a delicate butterfly accent, and celebration candle.",
    deliveryInfo: "Same-day boutique delivery in Kozhikode.",
    offers: ["Free customized anniversary greeting card"],
    includes: [
      "1kg Strawberry Cream Ombre Cake",
      "Gilded Golden Butterfly Toppers",
      "Luxury Keepsake Box",
    ],
    badge: "Showstopper",
  },
  {
    id: "hl-8",
    slug: "grand-altar-floral-sanctuary-highlight",
    name: "Cathedral Grand Altar Floral Arch",
    price: 4999,
    originalPrice: 5999,
    category: "our-highlights",
    categoryLabel: "Our Highlights",
    image: "/images/highlight-church-arrangements.jpg",
    images: [
      "/images/highlight-church-arrangements.jpg",
      "/images/table-decor-outdoor-ceremony-arch.jpg",
      "/images/flower-white-lilies.jpg",
    ],
    rating: 5.0,
    reviewsCount: 75,
    description:
      "Grand floral arch featuring Casablanca lilies, Avalanche white roses, hydrangeas, and lush Italian ruscus for unforgettable ceremonies.",
    deliveryInfo: "Professional on-site installation by Occasions team.",
    offers: ["Includes full post-event disassembly"],
    includes: [
      "9ft Grand Floral Arch Installation",
      "Casablanca Lilies & White Roses",
      "On-Site Event Styling",
    ],
    badge: "Grand Arch",
  },
];

export function getProductsByCategory(
  category: "flower" | "cakes" | "special-occasions" | "our-highlights"
): Product[] {
  return CATALOG_PRODUCTS.filter((p) => p.category === category);
}

export function getFlowerBaskets(): Product[] {
  return CATALOG_PRODUCTS.filter(
    (p) => p.id === "flower-9" || p.id === "flower-10" || p.id === "flower-basket-3" || p.id === "flower-basket-4" || p.id === "flower-basket-5" || p.id === "flower-basket-6" || p.id === "flower-basket-7" || p.id === "flower-basket-8" || p.id === "flower-basket-9" || p.id === "flower-basket-10" || p.id === "flower-basket-11" || p.id === "flower-basket-12" || p.id === "flower-basket-13"
  );
}

export function getFlowerBouquets(): Product[] {
  return CATALOG_PRODUCTS.filter(
    (p) =>
      p.category === "flower" &&
      !p.name.toLowerCase().includes("basket") &&
      !p.name.toLowerCase().includes("box") &&
      (p.name.toLowerCase().includes("bouquet") ||
        p.description.toLowerCase().includes("bouquet") ||
        p.description.toLowerCase().includes("hand-tied") ||
        p.id.startsWith("bouquet-") ||
        p.id === "flower-lily-celestial-daisy" ||
        p.id === "bouquet-orchid-symphony")
  );
}

export function getProductBySlug(
  category: string,
  slug: string
): Product | undefined {
  const normCat = category.toLowerCase().trim();
  const rawSlug = decodeURIComponent(slug).toLowerCase().trim();
  const hyphenSlug = rawSlug.replace(/\s+/g, "-");

  return CATALOG_PRODUCTS.find((p) => {
    if (p.category.toLowerCase().trim() !== normCat) return false;
    const pSlug = p.slug.toLowerCase().trim();
    const pHyphen = pSlug.replace(/\s+/g, "-");
    return (
      pSlug === rawSlug ||
      pHyphen === hyphenSlug ||
      decodeURIComponent(p.slug).toLowerCase().trim() === rawSlug
    );
  });
}

export function getAllProducts(): Product[] {
  return CATALOG_PRODUCTS;
}

export function isFlowerBouquet(product: {
  category?: string;
  name?: string;
  description?: string;
  id?: string;
}): boolean {
  if (!product) return false;
  const cat = (product.category || "").toLowerCase();
  const name = (product.name || "").toLowerCase();
  const desc = (product.description || "").toLowerCase();
  const id = (product.id || "").toLowerCase();

  if (
    cat === "cakes" ||
    cat === "table-decor" ||
    cat === "table-arrangements" ||
    cat === "wreaths" ||
    cat === "our-highlights"
  ) {
    return false;
  }
  if (
    name.includes("basket") ||
    name.includes("box") ||
    desc.includes("basket") ||
    desc.includes("hat box")
  ) {
    return false;
  }
  if (
    name.includes("cake") ||
    name.includes("wreath") ||
    name.includes("arch") ||
    name.includes("car decor") ||
    name.includes("garland")
  ) {
    return false;
  }

  return (
    cat === "flower-bouquets" ||
    cat === "bouquets" ||
    name.includes("bouquet") ||
    desc.includes("bouquet") ||
    desc.includes("hand-tied") ||
    id.startsWith("bouquet-") ||
    id === "flower-lily-celestial-daisy"
  );
}

export function getPricePerFlower(product: {
  name?: string;
  description?: string;
  price?: number;
}): number {
  const name = (product.name || "").toLowerCase();
  const desc = (product.description || "").toLowerCase();

  if (name.includes("lily") || desc.includes("lily")) return 110;
  if (name.includes("orchid") || desc.includes("orchid")) return 120;
  if (name.includes("tulip") || desc.includes("tulip")) return 95;
  if (name.includes("rose") || desc.includes("rose")) return 75;
  if (name.includes("sunflower") || desc.includes("sunflower")) return 85;
  if (name.includes("carnation") || desc.includes("carnation")) return 60;

  if (product.price && product.price > 0) {
    return Math.max(50, Math.round(product.price / 16));
  }
  return 75;
}

