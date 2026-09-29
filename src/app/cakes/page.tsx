import type { Metadata } from "next";
import CategoryPlaceholder, { CategoryPhotoItem } from "@/components/CategoryPlaceholder";

export const metadata: Metadata = {
  title: "Cakes | Occassions Florist Calicut",
  description:
    "Premium fresh cream celebration & wedding cakes adorned with delicate edible floral decorations.",
};

const CAKE_PHOTOS: CategoryPhotoItem[] = [
  {
    id: "cake-1",
    title: "Pastel Ombre Butterfly Celebration Cake",
    image: "/images/cake-pink-butterfly-birthday.png",
    price: "₹2,650",
    tag: "Signature Birthday",
    description: "Delicate pink-to-cream textured ombre buttercream with gilded golden butterfly accents and pearls.",
  },
  {
    id: "cake-2",
    title: "Decadent Double Chocolate Strawberry Drip",
    image: "/images/cake-chocolate-strawberry-drip.png",
    price: "₹2,800",
    tag: "Bestseller",
    description: "Two-tiered moist chocolate sponge filled with fresh cream, glazed with rich dark chocolate drip and crowned with ruby strawberries.",
  },
  {
    id: "cake-3",
    title: "Belgian Dark Truffle Ganache Gateau",
    image: "/images/cake-chocolate-truffle-pedestal.png",
    price: "₹2,950",
    tag: "Chocoholic Delight",
    description: "Velvety textured dark chocolate cake coated in glossy chocolate ganache drip, chocolate shards and artisanal truffles.",
  },
  {
    id: "cake-4",
    title: "Royal Ivory & Maroon Fault-Line Cake",
    image: "/images/cake-anniversary-maroon-gold.png",
    price: "₹3,200",
    tag: "Anniversary Special",
    description: "Sophisticated two-tone fault-line finish bordered with 24k edible gold leaf, golden spheres and romantic hearts topper.",
  },
  {
    id: "cake-5",
    title: "Vintage Piped Heart Message Cake",
    image: "/images/cake-vintage-heart-breakup.jpg",
    price: "₹1,950",
    tag: "Custom Message",
    description: "Nostalgic retro Lambeth piped heart cake with custom lettering and ruffled buttercream borders.",
  },
];

export default function CakesPage() {
  return (
    <CategoryPlaceholder
      title="Cakes"
      description="Premium fresh cream celebration & wedding cakes adorned with delicate edible floral decorations."
      photos={CAKE_PHOTOS}
    />
  );
}
