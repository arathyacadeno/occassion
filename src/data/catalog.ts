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
    id: "flower-lily-celestial-daisy",
    slug: "lily-and-the-celestial-daisy",
    name: "Lily and the Celestial Daisy",
    price: 695,
    originalPrice: 795,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/lily-6-stems.png",
    images: [
      "/images/lily-6-stems.png",
      "/images/lily-12-stems.png",
      "/images/lily-custom-stems.png",
      "/images/flower-basket-pink-lilies.jpg",
    ],
    rating: 4.9,
    ratingsCount: 35,
    reviewsCount: 34,
    description:
      "A radiant ensemble of multi-bloom Stargazer and Oriental pink lilies intertwined with delicate celestial daisies and verdant greenery. Presented in an elegant glass vase with sheer organza bow.",
    deliveryInfo: "Delivered fresh from Calicut gardens within 3 hours.",
    offers: [
      "13% OFF instant discount applied",
      "Free personalized greeting card with wax seal",
      "Complimentary floral nutrition sachet",
    ],
    includes: [
      "Multi-Bloom Pink Oriental Lilies",
      "Celestial Daisy Chrysanthemums",
      "Fresh Italian Ruscus & Glossy Greenery",
      "Clear Glass Cylindrical Keepsake Vase",
      "Sheer Organza Ribbon Bow",
    ],
    badge: "Trending Gift",
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
    id: "flower-3",
    slug: "wildflower-basket",
    name: "Wildflower Basket",
    price: 2300,
    originalPrice: 2850,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/basket-gerberas.jpg",
    images: [
      "/images/basket-gerberas.jpg",
      "/images/basket-pink-chrysanthemums.jpg",
      "/images/basket-white-roses.jpg",
      "/images/artisanal-flower-basket.jpg",
    ],
    rating: 4.5,
    reviewsCount: 96,
    description:
      "Artisanal woven willow basket brimming with cheerful pink & yellow gerbera daisies, wild chamomile, and fresh ranunculus nestled in verdant greenery.",
    deliveryInfo: "Delivered fresh from Calicut gardens within 3 hours.",
    offers: [
      "Free greeting card with your heartfelt message",
      "Flat 10% off with code OCCASIONS10",
    ],
    includes: [
      "Assorted Pastel Gerberas",
      "Wild Chamomile & Lisianthus",
      "Handcrafted Wicker Willow Basket",
      "Fresh Oasis Floral Foam",
    ],
    badge: "Bestseller",
  },
  {
    id: "flower-4",
    slug: "white-rose-majesty-basket",
    name: "White Rose Majesty Basket",
    price: 2300,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/basket-white-roses.jpg",
    images: [
      "/images/basket-white-roses.jpg",
      "/images/basket-yellow-roses.jpg",
      "/images/flower-white-roses.jpg",
      "/images/basket-crimson-pink-roses.jpg",
    ],
    rating: 4.5,
    reviewsCount: 78,
    description:
      "Abundant wicker basket overflowing with dozens of velvety Dutch white roses, delicate ferns, and airy baby's breath. A symbol of grace, purity, and reverence.",
    deliveryInfo: "Same-day delivery across Calicut and neighboring towns.",
    offers: [
      "Free Delivery Included",
      "Complimentary floral fragrance spray",
    ],
    includes: [
      "30 Avalanche Dutch White Roses",
      "Asparagus Ferns & Gypsophila",
      "Hand-Woven Natural Basket",
      "Satin Keepsake Ribbon",
    ],
    badge: "Free Delivery",
  },
  {
    id: "flower-8",
    slug: "crimson-blush-ribbon-basket",
    name: "Crimson & Blush Ribbon Basket",
    price: 1399,
    originalPrice: 1650,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/basket-crimson-pink-roses.jpg",
    images: [
      "/images/basket-crimson-pink-roses.jpg",
      "/images/basket-white-roses.jpg",
      "/images/basket-romantic-ribbon.jpg",
    ],
    rating: 4.9,
    reviewsCount: 88,
    description:
      "Deep red velvet and pastel blush roses finished with a delicate satin ribbon bow. A timeless romantic arrangement for anniversaries and love expressions.",
    deliveryInfo: "Hand-delivered by our uniformed boutique delivery team.",
    offers: ["Flat ₹150 off with code LOVE150"],
    includes: [
      "Crimson & Blush Roses",
      "White Spray Chrysanthemums",
      "Handcrafted Basket with Satin Bow",
    ],
    badge: "Romantic",
  },
  {
    id: "flower-9",
    slug: "blush-pink-rose-chrysanthemum-basket",
    name: "Blush Pink Rose & Chrysanthemum Basket",
    price: 2199,
    originalPrice: 2599,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/flower-basket-pink-roses.jpg",
    images: [
      "/images/flower-basket-pink-roses.jpg",
      "/images/basket-crimson-pink-roses.jpg",
      "/images/basket-gerberas.jpg",
    ],
    rating: 4.9,
    reviewsCount: 42,
    description:
      "Handcrafted rustic willow basket brimming with velvety blush pink roses, soft spray chrysanthemums, and airy baby's breath. A gentle, romantic centerpiece.",
    deliveryInfo: "Fresh morning delivery within 3 hours across Calicut.",
    offers: ["Flat 10% off with code OCCASIONS10", "Complimentary heartfelt note card"],
    includes: [
      "Imported Blush Pink Roses",
      "Snow-White Spray Chrysanthemums",
      "Fresh Gypsophila Baby's Breath",
      "Handwoven Natural Willow Basket",
    ],
    badge: "Bestseller",
  },
  {
    id: "flower-10",
    slug: "pink-lily-carnation-basket",
    name: "Pink Lily & Carnation Floral Basket",
    price: 2499,
    originalPrice: 2899,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/flower-basket-pink-lilies.jpg",
    images: [
      "/images/flower-basket-pink-lilies.jpg",
      "/images/flower-basket-pink-roses.jpg",
      "/images/flower-white-lilies.jpg",
    ],
    rating: 4.8,
    reviewsCount: 36,
    description:
      "Graceful woven basket featuring regal pink Oriental lilies, garden roses, pastel carnations, and keepsake lace ribbon. Perfect for birthdays, thank yous, and warm regards.",
    deliveryInfo: "Delivered fresh from botanical farms in insulated floristry vans.",
    offers: ["Free customized greeting card", "Complimentary floral nutrition sachet"],
    includes: [
      "Multi-Bloom Pink Oriental Lilies",
      "Pastel Pink Carnations & Roses",
      "Handwoven Wicker Basket with Lace Ribbon",
      "Hydrating Floral Sponge Base",
    ],
    badge: "Artisanal Choice",
  },
  {
    id: "flower-11",
    slug: "imperial-white-lily-crimson-box",
    name: "Imperial White Lily & Crimson Rose Box",
    price: 2299,
    originalPrice: 2699,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/flower-box-white-lilies-gold.jpg",
    images: [
      "/images/flower-box-white-lilies-gold.jpg",
      "/images/flower-white-lilies.jpg",
      "/images/red-rose-bouquet.jpg",
    ],
    rating: 5.0,
    reviewsCount: 58,
    description:
      "Exquisite pure white cylinder hat box adorned with pristine white Casablanca lilies, ruby red carnations, and an opulent golden ribbon bow.",
    deliveryInfo: "Same-day express delivery across Calicut and neighboring regions.",
    offers: ["10% discount on first box arrangement", "Free custom wax-sealed card"],
    includes: [
      "Fresh White Casablanca Lilies",
      "Deep Crimson Carnations",
      "Round Luxury White Hat Box",
      "Double-Faced Gold Satin Ribbon",
    ],
    badge: "Luxury Box",
  },
  {
    id: "flower-12",
    slug: "sunflower-golden-rose-noir-box",
    name: "Sunflower & Golden Rose Noir Box",
    price: 1899,
    originalPrice: 2249,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/flower-box-sunflowers-yellow-roses.jpg",
    images: [
      "/images/flower-box-sunflowers-yellow-roses.jpg",
      "/images/sunflower-bouquet.jpg",
      "/images/basket-yellow-roses.jpg",
    ],
    rating: 4.9,
    reviewsCount: 64,
    description:
      "Modern matte black presentation hat box filled with cheerful golden sunflowers, sunny yellow garden roses, silver eucalyptus, and luxury white monogram ribbon.",
    deliveryInfo: "Guaranteed 2-hour rush delivery available across Kozhikode.",
    offers: ["Flat ₹100 instant off with code SUN100", "Free photo print card"],
    includes: [
      "Vibrant Golden Sunflowers",
      "Yellow Highland Roses",
      "Silver Dollar Eucalyptus",
      "Matte Black Presentation Hat Box",
      "Designer Monogrammed Ribbon",
    ],
    badge: "Sunshine Special",
  },
  {
    id: "flower-13",
    slug: "royal-purple-orchid-lavender-basket",
    name: "Royal Purple Orchid & Lavender Rose Basket",
    price: 2799,
    originalPrice: 3299,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/flower-basket-purple-orchids.jpg",
    images: [
      "/images/flower-basket-purple-orchids.jpg",
      "/images/flower-basket-pink-roses.jpg",
      "/images/basket-white-roses.jpg",
    ],
    rating: 5.0,
    reviewsCount: 29,
    description:
      "Grand handled wicker basket showcasing majestic royal purple Vanda orchids, heirloom lavender roses, purple spray carnations, and lush emerald foliage.",
    deliveryInfo: "Temperature-controlled white-glove delivery across Calicut.",
    offers: ["Free luxury gift wrapping", "Personalized message card with gold foiling"],
    includes: [
      "Exotic Purple Vanda Orchids",
      "Heirloom Lavender Garden Roses",
      "Deep Purple Carnations & Lisianthus",
      "Traditional Natural Handled Basket",
    ],
    badge: "Exotic Grandeur",
  },

  // ==================== BOUQUET PRODUCTS (/flower-bouquets) ====================
  {
    id: "bouquet-purple-lily-lavender",
    slug: "royal-purple-lily-lavender-bouquet",
    name: "Royal Purple Lily & Lavender Bouquet",
    price: 2499,
    originalPrice: 2999,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/purple-lily-lavender-bouquet.jpg",
    images: [
      "/images/purple-lily-lavender-bouquet.jpg",
      "/images/lily-celestial-daisy.jpg",
      "/images/flower-white-lilies.jpg",
    ],
    rating: 5.0,
    reviewsCount: 68,
    description:
      "Bespoke hand-tied bouquet featuring enchanting purple lilies, heirloom lavender garden roses, English lavender stalks, and delicate lilac blossoms finished with a pure silk ribbon bow.",
    deliveryInfo: "Same-day express delivery across Calicut within 3 hours.",
    offers: [
      "Free personalized greeting card with wax seal",
      "Flat 10% off with code OCCASIONS10",
    ],
    includes: [
      "Exotic Purple Lilies & Roses",
      "English Lavender Sprigs",
      "Lilac & Hydrangea Accents",
      "Pure White Silk Ribbon Bow",
    ],
    badge: "New Arrival",
  },
  {
    id: "bouquet-9",
    slug: "royal-purple-tulip-lavender-bouquet",
    name: "Royal Purple Tulip & Lavender Bouquet",
    price: 2499,
    originalPrice: 2999,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/royal-purple-tulip-bouquet.jpg",
    images: [
      "/images/royal-purple-tulip-bouquet.jpg",
      "/images/purple-tulip-lavender-bouquet.jpg",
      "/images/flower-pink-tulips.jpg",
    ],
    rating: 5.0,
    reviewsCount: 74,
    description:
      "An enchanting bridal and celebration bouquet showcasing lush royal purple Dutch tulips mingled with soothing English lavender sprays and delicate lilac blossoms. Handcrafted by master florists and tied with a cascading royal purple satin bow.",
    deliveryInfo: "Same-day express delivery across Calicut within 3 hours.",
    offers: [
      "Free personalized greeting card with wax seal",
      "Flat 10% off with code OCCASIONS10",
    ],
    includes: [
      "Dutch Royal Purple Tulips",
      "Fragrant English Lavender Sprigs",
      "Lilac Blossom Florets",
      "Silver Dollar Eucalyptus",
      "Cascading Royal Purple Satin Ribbon",
    ],
    badge: "Trending Bouquet",
  },
  {
    id: "bouquet-1",
    slug: "red-rose-bouquet",
    name: "Red Rose Bouquet",
    price: 1899,
    originalPrice: 2399,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/red-rose-bouquet.jpg",
    images: [
      "/images/red-rose-bouquet.jpg",
      "/images/flower-pink-roses.jpg",
      "/images/flower-white-roses.jpg",
    ],
    rating: 5.0,
    reviewsCount: 84,
    description:
      "Our premier bouquet of two dozen rich velvet Dutch red roses hand-tied by master florists with matte blush packaging and cascading silk ribbon. Perfect for romantic anniversaries, proposals, and heartfelt gestures.",
    deliveryInfo: "Same-day boutique delivery guaranteed in Calicut.",
    offers: [
      "Flat 10% off with code OCCASIONS10",
      "Free personalized greeting card with wax seal",
    ],
    includes: [
      "24 Imported Dutch Red Roses",
      "Silver Dollar Eucalyptus",
      "Gypsophila Baby's Breath",
      "Matte Blush Paper Wrap",
      "Silk Satin Ribbon",
    ],
    badge: "Bestseller",
  },
  {
    id: "bouquet-2",
    slug: "classic-calicut-bridal-bouquet",
    name: "Classic Calicut Bridal Bouquet",
    price: 1899,
    originalPrice: 2299,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/bouquet-1.jpg",
    images: [
      "/images/bouquet-1.jpg",
      "/images/flower-pink-roses.jpg",
      "/images/flower-white-roses.jpg",
    ],
    rating: 5.0,
    reviewsCount: 56,
    description:
      "Hand-tied bridal bouquet specially designed for wedding ceremonies and receptions in Calicut. Features velvety blush roses paired with delicate gypsophila, fragrant jasmine, and trailing French silk ribbon.",
    deliveryInfo: "Fresh morning delivery within 3 hours across Calicut.",
    offers: [
      "Complimentary silk boutonnière",
      "Free personalized handwritten note card",
    ],
    includes: [
      "Dutch Pink Roses",
      "White Gypsophila (Baby's Breath)",
      "Madurai Jasmine Sprays",
      "Silver Dollar Eucalyptus",
      "French Silk Ribbon",
    ],
    badge: "Bridal Favorite",
  },
  {
    id: "bouquet-4",
    slug: "pink-rose-bouquet",
    name: "Pink Rose Bouquet",
    price: 1699,
    originalPrice: 2099,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/flower-pink-roses.jpg",
    images: [
      "/images/flower-pink-roses.jpg",
      "/images/red-rose-bouquet.jpg",
      "/images/flower-white-roses.jpg",
    ],
    rating: 4.9,
    reviewsCount: 62,
    description:
      "Radiating sweet gentleness, this hand-tied bouquet features 20 lush blush pink roses complemented by fragrant jasmine sprays and dusty rose velvet ribbon. Suited for birthdays and milestone anniversaries.",
    deliveryInfo: "Delivered fresh within 3 hours across Calicut.",
    offers: [
      "Flat ₹100 instant off with code ROSE100",
      "Complimentary floral hydration pack",
    ],
    includes: [
      "20 Avalanche Soft Pink Roses",
      "Sweet Madurai Jasmine Buds",
      "Silver Leaf Foliage",
      "Cream Designer Wrapping",
      "Dusty Rose Velvet Ribbon",
    ],
    badge: "Most Loved",
  },
  {
    id: "bouquet-5",
    slug: "golden-sunshine-sunflower-bouquet",
    name: "Golden Sunshine Sunflower Bouquet",
    price: 1599,
    originalPrice: 1899,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/sunflower-bouquet.jpg",
    images: [
      "/images/sunflower-bouquet.jpg",
      "/images/bouquet-sunflower-kraft.png",
      "/images/cat-flower-bouquet-luxe.jpg",
    ],
    rating: 4.9,
    reviewsCount: 48,
    description:
      "Radiant golden sunflowers that bring warmth, happiness, and bright energy. Bold petals paired with delicate chamomile and fresh silver eucalyptus in rustic kraft wrapping.",
    deliveryInfo: "Guaranteed fresh morning delivery across Kozhikode.",
    offers: [
      "Free floral nutrition sachet",
      "Free custom photo print card",
    ],
    includes: [
      "5 Jumbo Golden Sunflowers",
      "Wild Chamomile Accents",
      "Silver Dollar Eucalyptus",
      "Eco-Friendly Textured Kraft Wrap",
      "Natural Jute Twine Bow",
    ],
    badge: "Sunshine Special",
  },
  {
    id: "bouquet-6",
    slug: "pastel-dutch-tulip-bouquet",
    name: "Pastel Dutch Tulip Bouquet",
    price: 2199,
    originalPrice: 2699,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/flower-pink-tulips.jpg",
    images: [
      "/images/flower-pink-tulips.jpg",
      "/images/bouquet-pink-tulips.png",
      "/images/bouquet-pastel-luxe.png",
    ],
    rating: 4.8,
    reviewsCount: 39,
    description:
      "Crisp, vibrant Holland tulips curated for modern elegance. Graceful stems and silky blush petals hand-tied in minimalist luxury wrapping.",
    deliveryInfo: "Cold-chain express delivery across Calicut.",
    offers: [
      "Flat 10% off with code OCCASIONS10",
      "Complimentary boutique carry bag",
    ],
    includes: [
      "20 Premium Dutch Holland Tulips",
      "Delicate Waxflower Sprigs",
      "Frosted Luxe Paper Wrap",
      "Bespoke Satin Organza Ribbon",
    ],
    badge: "Imported Luxury",
  },
  {
    id: "bouquet-7",
    slug: "oriental-casablanca-lily-bouquet",
    name: "Oriental Casablanca Lily Bouquet",
    price: 2299,
    originalPrice: 2799,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/flower-white-lilies.jpg",
    images: [
      "/images/flower-white-lilies.jpg",
      "/images/flower-white-roses.jpg",
      "/images/bouquet-3.jpg",
    ],
    rating: 4.9,
    reviewsCount: 51,
    description:
      "Unmatched in aromatic luxury, multi-bloom Casablanca white lilies create a lavish statement, paired with Avalanche white roses and cascading Italian ruscus.",
    deliveryInfo: "Delivered fresh from botanical farms in insulated vans.",
    offers: [
      "Free Delivery Included",
      "Complimentary flower care guide",
    ],
    includes: [
      "Casablanca Fragrant White Lilies",
      "Avalanche Dutch Roses",
      "Fresh Italian Ruscus Greenery",
      "Embossed Textured Wrap",
      "Champagne Gold Ribbon",
    ],
    badge: "Fragrant Luxury",
  },
  {
    id: "bouquet-8",
    slug: "velvet-scarlet-rose-gypsophila-bouquet",
    name: "Velvet Scarlet Rose & Gypsophila Bouquet",
    price: 1999,
    originalPrice: 2499,
    category: "flower",
    categoryLabel: "Flowers",
    image: "/images/bouquet-red-roses-silk.jpg",
    images: [
      "/images/bouquet-red-roses-silk.jpg",
      "/images/red-rose-bouquet.jpg",
      "/images/bouquet-1.jpg",
    ],
    rating: 5.0,
    reviewsCount: 73,
    description:
      "Passionate crimson roses enveloped in clouds of starry gypsophila baby's breath and finished with a bespoke crimson silk ribbon. A dramatic expression of timeless devotion.",
    deliveryInfo: "Hand-delivered by our uniformed boutique florists.",
    offers: [
      "Flat ₹150 off with code LOVE150",
      "Complimentary scented greeting card",
    ],
    includes: [
      "24 Scarlet Dutch Roses",
      "Starry White Gypsophila",
      "Luxury Matte Black & Gold Wrap",
      "Double-Faced Crimson Silk Ribbon",
    ],
    badge: "Romantic Choice",
  },


  // ==================== CAKES PRODUCTS (/cakes) ====================

  {
    id: "cake-blue-floral",
    slug: "Chocolate truffle Cake",
    name: "Chocolate Truffle Cake",
    price: 1150,
    category: "cakes",
    categoryLabel: "Cakes",
    image: "/images/cakes/blue-floral-birthday-cake.png",
    images: [
      "/images/cakes/blue-floral-birthday-cake.png",
      "/images/Cake category/Blue Floral Birthday Cake.png",
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
    slug: "Chocolate Truffle Cake",
    name: "Chocolate Truffle Cake",
    price: 1150,
    category: "cakes",
    categoryLabel: "Cakes",
    image: "/images/cakes/chocolate-birthday-cake-for-amma.png",
    images: [
      "/images/cakes/chocolate-birthday-cake-for-amma.png",
      "/images/Cake category/Chocolate Birthday Cake for Amma.png",
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
      "/images/Cake category/Decadent Chocolate Shavings Cake.png",
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
      "/images/Cake category/Elegant Chocolate Web Cake on White Pedestal.png",
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
      "/images/Cake category/Elegant Just Engaged Heart Cake.png",
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
      "/images/Cake category/Elegant Red Heart Anniversary Cake.png",
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
      "/images/Cake category/Evana Floral Celebration Cake.png",
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
      "/images/Cake category/Golden Crumb Chocolate Drizzle Cake.png",
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
      "/images/Cake category/Lavender Floral Happy Birthday Amma Cake.png",
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
      "/images/Cake category/Luxury Half-Chocolate Birthday Cake.png",
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
      "/images/Cake category/Pastel Pink Heart Cake on Stand.png",
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
      "/images/Cake category/AO Smith Z3 Onyx Black Celebration Cake.png",
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
      "/images/Cake category/Red Velvet Cake with Gold Birthday Topper.png",
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
      "/images/cake-ombre-butterfly-birthday.jpg",
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
      "/images/cake-anniversary-maroon-gold.png",
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
      "/images/cake-chocolate-strawberry-drip.png",
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
    id: "hl-6",
    slug: "double-chocolate-strawberry-drip-highlight",
    name: "Double Chocolate Strawberry Drip Cake",
    price: 1099,
    originalPrice: 1299,
    category: "our-highlights",
    categoryLabel: "Our Highlights",
    image: "/images/cake-chocolate-strawberry-drip.png",
    images: [
      "/images/cake-chocolate-strawberry-drip.png",
      "/images/cake-chocolate-truffle-pedestal.png",
      "/images/berry-vanilla-cake.jpg",
    ],
    rating: 4.9,
    reviewsCount: 130,
    description:
      "Layered chocolate fudge sponge with fresh chantilly cream, rich dark chocolate ganache drip, and crowned with ruby strawberries.",
    deliveryInfo: "Baked fresh and delivered in chilled insulated cake caddy.",
    offers: ["Free celebration candles and wooden knife"],
    includes: [
      "1kg Belgian Chocolate Drip Cake",
      "Fresh Strawberries & Chocolate Shards",
      "Gold Lettered Plaque",
    ],
    badge: "Top Rated Cake",
  },
  {
    id: "hl-7",
    slug: "pastel-ombre-butterfly-cake-highlight",
    name: "Artisan Ombre Butterfly Cake",
    price: 1199,
    originalPrice: 1399,
    category: "our-highlights",
    categoryLabel: "Our Highlights",
    image: "/images/cake-ombre-butterfly-birthday.jpg",
    images: [
      "/images/cake-ombre-butterfly-birthday.jpg",
      "/images/cake-anniversary-maroon-gold.png",
      "/images/celebration-cake-cat.jpg",
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
    (p) =>
      p.category === "flower" &&
      (p.name.toLowerCase().includes("basket") ||
        p.name.toLowerCase().includes("box") ||
        p.description.toLowerCase().includes("basket") ||
        p.description.toLowerCase().includes("hat box"))
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
        p.id === "flower-lily-celestial-daisy")
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

