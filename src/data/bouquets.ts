import { Bouquet } from "@/types";

export const BOUQUETS_DATA: Bouquet[] = [
  {
    id: "bouquet-1",
    name: "Classic Calicut Bridal Bouquet",
    subtitle: "Blush Roses, Baby's Breath & Jasmine Accents",
    price: 1899,
    originalPrice: 2299,
    image: "/images/bouquet-1.jpg",
    occasion: "wedding",
    rating: 5.0,
    reviewsCount: 56,
    stems: [
      "Dutch Pink Roses",
      "White Gypsophila (Baby's Breath)",
      "Madurai Jasmine Sprays",
      "Silver Dollar Eucalyptus",
      "French Silk Ribbon"
    ],
    description: "Hand-tied bridal bouquet specially designed for wedding ceremonies and receptions in Calicut. Features velvety blush roses paired with delicate gypsophila and trailing silk ribbon.",
    flowerCount: "26-30 hand-selected stems",
    scent: "Heirloom Rose",
    badge: "Bridal Favorite",
    dimensions: "45cm H × 38cm W"
  },
  {
    id: "bouquet-2",
    name: "Celebration Floral & Cake Hamper",
    subtitle: "Fresh Blooms with Gourmet Birthday Cake",
    price: 1499,
    originalPrice: 1799,
    image: "/images/bouquet-2.jpg",
    occasion: "celebration",
    rating: 4.9,
    reviewsCount: 82,
    stems: [
      "Bright Gerberas & Carnations",
      "Yellow Asiatic Lilies",
      "Chamomile Blooms",
      "500g Fresh Cream Truffle Cake",
      "Personalized Calicut Greeting Card"
    ],
    description: "Our signature online combo delivered anywhere in Kozhikode city. A vibrant fresh flower bouquet paired with a delectable freshly baked cake.",
    flowerCount: "20 stems + 1/2 kg Cake",
    scent: "Fresh & Green",
    badge: "Bestseller",
    dimensions: "40cm H × 35cm W"
  },
  {
    id: "bouquet-3",
    name: "Exotic Orchid Cascade",
    subtitle: "Dendrobium Purple Orchids & Anthuriums",
    price: 1299,
    originalPrice: 1599,
    image: "/images/bouquet-3.jpg",
    occasion: "curated",
    rating: 5.0,
    reviewsCount: 41,
    stems: [
      "Imported Purple Dendrobium Orchids",
      "Tropical Anthuriums",
      "Song of India Foliage",
      "Areca Palm Sprays"
    ],
    description: "Long-lasting exotic orchids with deep jewel tones. Perfect for anniversaries, stage gifts, and VIP presentations.",
    flowerCount: "16-18 luxury stems",
    scent: "Exotic Musk",
    badge: "Long Lasting (14+ Days)",
    dimensions: "50cm H × 40cm W"
  },
  {
    id: "bouquet-4",
    name: "Royal Car Decoration Package",
    subtitle: "Floral Bonnet Arch, Door Handles & Ribbons",
    price: 2999,
    originalPrice: 3499,
    image: "/images/slide3-flower.jpg",
    occasion: "wedding",
    rating: 5.0,
    reviewsCount: 68,
    stems: [
      "Red & White Premium Roses",
      "Orchid Sprays",
      "Weather-Resistant Foam Mounts",
      "Satin Ribbons & Tulle Draping"
    ],
    description: "Complete wedding car floral decoration service at your doorstep or venue in Calicut. Scratch-proof, securely mounted fresh rose & orchid arrangements.",
    flowerCount: "Full Vehicle Floral Styling",
    scent: "Heirloom Rose",
    badge: "Car Decoration",
    dimensions: "Custom Vehicle Fitting"
  },
  {
    id: "bouquet-5",
    name: "Serene Lily & Carnation Sympathy",
    subtitle: "Pristine Casablanca Lilies & Snow Carnations",
    price: 1199,
    image: "/images/bouquet-4.jpg",
    occasion: "sympathy",
    rating: 4.8,
    reviewsCount: 24,
    stems: [
      "White Oriental Lilies",
      "Snow Carnations",
      "White Gladiolus",
      "Eucalyptus & Ferns"
    ],
    description: "Dignified and peaceful white floral tribute delivered with utmost care and respect across Calicut homes and memorial services.",
    flowerCount: "22 pristine stems",
    scent: "Fresh & Green",
    badge: "Express 2-Hour Delivery",
    dimensions: "55cm H × 40cm W"
  },
  {
    id: "bouquet-6",
    name: "Grand Stage & Church Floral Setup",
    subtitle: "Custom Mandap, Stage Backdrop & Aisle Decor",
    price: 14999,
    originalPrice: 17999,
    image: "/images/story-bg.jpg",
    occasion: "wedding",
    rating: 5.0,
    reviewsCount: 94,
    stems: [
      "Fresh Marigolds & Jasmine Garlands",
      "Hydrangea & Rose Clusters",
      "Church Altar Pillar Flowers",
      "Stage Fairy-Light Floral Canopies"
    ],
    description: "Full-scale wedding stage and church floral styling by Sreejesh K.V and our expert decor team in Calicut. Custom themes tailored to your venue and budget.",
    flowerCount: "Complete Venue Floral Architecture",
    scent: "Subtle & Sweet",
    badge: "Stage & Church Decor",
    dimensions: "Venue Scaled Setup"
  }
];

export const OCCASIONS_LIST = [
  {
    id: "stage-decor",
    name: "Stage Decoration",
    tagline: "Grand Wedding Mandaps & Reception Backdrops",
    image: "/images/story-bg.jpg",
    count: "Over 500+ Stages Styled"
  },
  {
    id: "car-decor",
    name: "Car Decoration",
    tagline: "Bridal Car Styling with Fresh Roses & Orchids",
    image: "/images/slide3-flower.jpg",
    count: "Scratch-Free On-Site Setup"
  },
  {
    id: "bridal-bouquets",
    name: "Bridal Bouquets",
    tagline: "Hand-Tied Couture Bouquets for Every Bride",
    image: "/images/bouquet-1.jpg",
    count: "Custom Color Matching"
  },
  {
    id: "online-delivery",
    name: "Bouquet & Cake Delivery",
    tagline: "Same-Day Delivery Across Calicut & Suburbs",
    image: "/images/bouquet-2.jpg",
    count: "Doorstep Delivery in 2 Hours"
  }
];
