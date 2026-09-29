import type { Metadata } from "next";
import CategoryPlaceholder, { CategoryPhotoItem } from "@/components/CategoryPlaceholder";

export const metadata: Metadata = {
  title: "Table Decor | Occassions Florist Calicut",
  description:
    "Exquisite floral centerpieces, candelabras & cascading botanical runners for memorable banquets.",
};

const TABLE_DECOR_PHOTOS: CategoryPhotoItem[] = [
  {
    id: "table-1",
    title: "Rustic Burlap & Baby's Breath Runner",
    image: "/images/table-decor-rustic-burlap.jpg",
    price: "₹3,800",
    tag: "Rustic Charm",
    description: "Natural burlap runner adorned with lace doilies and rustic mason jars filled with ethereal baby's breath and daisies.",
  },
  {
    id: "table-2",
    title: "Bespoke Dessert & Celebration Table",
    image: "/images/table-decor-baby-shower.png",
    price: "₹7,500",
    tag: "Event Styling",
    description: "Complete themed celebration table setup with wooden risers, apothecary jars, floral bunting banner, and cupcake displays.",
  },
  {
    id: "table-3",
    title: "Enchanted Fairy Light Banquet Table",
    image: "/images/table-decor-wedding-fairy-lights.jpg",
    price: "₹12,000",
    tag: "Grand Wedding",
    description: "Opulent outdoor marquee banquet with glowing canopy lights, taper candles, Chiavari chairs, and pastel floral arrangements.",
  },
  {
    id: "table-4",
    title: "Garden Lawn Grand Floral Runner",
    image: "/images/table-decor-garden-banquet-runner.jpg",
    price: "₹10,500",
    tag: "Lawn Banquet",
    description: "Long banqueting table with sage green runner and a continuous lush arrangement of pastel garden roses and botanical foliage.",
  },
  {
    id: "table-5",
    title: "Twilight Meadow Wedding Arch & Lantern Aisle",
    image: "/images/table-decor-outdoor-ceremony-arch.jpg",
    price: "₹15,000",
    tag: "Ceremony Arch",
    description: "Romantic rustic wooden arch draped in luminous fabric and florals, with string bulbs and candlelit lanterns along the aisle.",
  },
];

export default function TableDecorPage() {
  return (
    <CategoryPlaceholder
      title="Table Decor"
      description="Exquisite floral centerpieces, candelabras & cascading botanical runners for memorable banquets."
      photos={TABLE_DECOR_PHOTOS}
    />
  );
}
