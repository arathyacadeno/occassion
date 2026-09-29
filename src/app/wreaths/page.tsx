import type { Metadata } from "next";
import CategoryPlaceholder, { CategoryPhotoItem } from "@/components/CategoryPlaceholder";

export const metadata: Metadata = {
  title: "Wreath | Occassions Florist Calicut",
  description:
    "Handcrafted fresh flower wreaths & circular botanical rings woven with silver eucalyptus and roses.",
};

const WREATH_PHOTOS: CategoryPhotoItem[] = [
  {
    id: "wreath-1",
    title: "Eternal Devotion Heart Wreath",
    image: "/images/wreath-heart-pink-sash.jpg",
    price: "₹4,800",
    tag: "Heart Tribute",
    description: "Standing heart-shaped tribute wreath woven with tender pink and lavender roses with satin memorial sash.",
  },
  {
    id: "wreath-2",
    title: "Serene Ivory Garden Standing Ring",
    image: "/images/wreath-circular-cream-bow.png",
    price: "₹4,200",
    tag: "Grace & Remembrance",
    description: "Full circular standing easel wreath featuring ivory roses, chrysanthemums, and a delicate personalized silk ribbon bow.",
  },
  {
    id: "wreath-3",
    title: "Pure White Celestial Cross Wreath",
    image: "/images/wreath-cross-white-genevieve.png",
    price: "₹5,200",
    tag: "Sacred Cross",
    description: "Stately standing cross arrangement composed of pristine white lilies, carnations, chrysanthemums and custom sash.",
  },
  {
    id: "wreath-4",
    title: "Crimson Heart Sacred Cross Wreath",
    image: "/images/wreath-cross-red-center.jpg",
    price: "₹4,950",
    tag: "Sacred Tribute",
    description: "Solemn standing cross covered in snowy white blooms featuring a vibrant scarlet rose center cluster.",
  },
  {
    id: "wreath-5",
    title: "Golden Light Sacred Cross Wreath",
    image: "/images/wreath-cross-yellow-center.jpg",
    price: "₹4,950",
    tag: "Sacred Tribute",
    description: "Majestic floral standing cross with bright yellow rose center and border of fresh white carnations.",
  },
  {
    id: "wreath-6",
    title: "Loving Memory Scarlet & Lily Easel Wreath",
    image: "/images/wreath-memorial-red-white.jpg",
    price: "₹5,500",
    tag: "Memorial Easel",
    description: "Grand circular standing wreath adorned with red velvet roses, fragrant white lilies, and custom memorial ribbon sash.",
  },
];

export default function WreathsPage() {
  return (
    <CategoryPlaceholder
      title="Wreath"
      description="Handcrafted fresh flower wreaths & circular botanical rings woven with silver eucalyptus and roses."
      photos={WREATH_PHOTOS}
    />
  );
}
