import type { Metadata } from "next";
import CategoryPlaceholder, { CategoryPhotoItem } from "@/components/CategoryPlaceholder";

export const metadata: Metadata = {
  title: "Flower Basket | Occassions Florist Calicut",
  description:
    "Artisanal hand-woven baskets brimming with fresh roses, peonies, baby's breath & fragrant greenery.",
};

const FLOWER_BASKET_PHOTOS: CategoryPhotoItem[] = [
  {
    id: "basket-1",
    title: "Pastel Gerbera & Wildflower Basket",
    image: "/images/basket-gerberas.jpg",
    price: "₹2,650",
    tag: "Artisanal",
    description: "Woven willow basket filled with cheerful pink & yellow gerbera daisies, chamomile and ranunculus.",
  },
  {
    id: "basket-2",
    title: "Pure White Rose Majesty Basket",
    image: "/images/basket-white-roses.jpg",
    price: "₹3,400",
    tag: "Luxury Special",
    description: "Abundant wicker basket overflowing with dozens of velvety Dutch white roses and delicate ferns.",
  },
  {
    id: "basket-3",
    title: "Sunshine Golden Rose Basket",
    image: "/images/basket-yellow-roses.jpg",
    price: "₹2,800",
    tag: "Radiant & Warm",
    description: "Traditional handled basket with glowing bright yellow roses nestled in lush dark greenery.",
  },
  {
    id: "basket-4",
    title: "Crimson & Blush Satin Ribbon Basket",
    image: "/images/basket-crimson-pink-roses.jpg",
    price: "₹3,200",
    tag: "Romantic Bestseller",
    description: "Deep red velvet and pastel blush roses finished with a delicate satin ribbon bow.",
  },
  {
    id: "basket-5",
    title: "Pink Rose & Pompon Chrysanthemum Basket",
    image: "/images/basket-pink-chrysanthemums.jpg",
    price: "₹2,950",
    tag: "Garden Fresh",
    description: "Generous woven basket featuring fresh pink blooms, white button chrysanthemums and airy gypsophila.",
  },
  {
    id: "basket-6",
    title: "Romantic Wine Velvet & Pearl Basket",
    image: "/images/basket-romantic-ribbon.jpg",
    price: "₹3,600",
    tag: "Signature Luxury",
    description: "Luxe basket lined with pink tissue, magenta roses, peach blooms, and wine ribbon with pearl broach.",
  },
];

export default function FlowerBasketsPage() {
  return (
    <CategoryPlaceholder
      title="Flower Basket"
      description="Artisanal hand-woven baskets brimming with fresh roses, peonies, baby's breath & fragrant greenery."
      photos={FLOWER_BASKET_PHOTOS}
    />
  );
}
