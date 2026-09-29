import type { Metadata } from "next";
import CategoryPlaceholder, { CategoryPhotoItem } from "@/components/CategoryPlaceholder";

export const metadata: Metadata = {
  title: "Flower Bouquet | Occassions Florist Calicut",
  description:
    "Luxury hand-tied flower bouquets wrapped in signature designer paper with French silk ribbons.",
};

const FLOWER_BOUQUET_PHOTOS: CategoryPhotoItem[] = [
  {
    id: "bouquet-1",
    title: "Pastel Blush & Rose Elegance Wrap",
    image: "/images/bouquet-pastel-luxe.png",
    price: "₹2,750",
    tag: "Signature Pastel",
    description: "Exquisite pastel pink roses, hydrangeas, and lisianthus wrapped in blush origami paper with silky satin ribbons.",
  },
  {
    id: "bouquet-2",
    title: "Scarlet Crimson Rose Romance",
    image: "/images/bouquet-red-roses-silk.jpg",
    price: "₹2,999",
    tag: "Pure Romance",
    description: "Long-stem velvety red roses meticulously gathered and draped across rich champagne silk satin.",
  },
  {
    id: "bouquet-3",
    title: "Delicate Pink Tulip Cone",
    image: "/images/bouquet-pink-tulips.png",
    price: "₹2,450",
    tag: "Dutch Import",
    description: "Fresh spring pink Dutch tulips gracefully wrapped in baby pink parchment with a delicate woven bow.",
  },
  {
    id: "bouquet-4",
    title: "Blush & Berry Tulip Kraft Bunch",
    image: "/images/bouquet-kraft-tulips.png",
    price: "₹2,600",
    tag: "Rustic Blossom",
    description: "Two-toned raspberry & blush tulips hand-tied in earthy eco-kraft wrap with natural jute twine.",
  },
  {
    id: "bouquet-5",
    title: "Golden Sunflower & Gypsophila Wrap",
    image: "/images/bouquet-sunflower-kraft.png",
    price: "₹1,950",
    tag: "Warm & Cheerful",
    description: "Radiant golden sunflowers surrounded by ethereal baby's breath and fresh silver dollar eucalyptus.",
  },
];

export default function FlowerBouquetsPage() {
  return (
    <CategoryPlaceholder
      title="Flower Bouquet"
      description="Luxury hand-tied flower bouquets wrapped in signature designer paper with French silk ribbons."
      photos={FLOWER_BOUQUET_PHOTOS}
    />
  );
}
