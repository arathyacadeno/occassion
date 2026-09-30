import type { Metadata } from "next";
import CategoryCatalog from "@/components/CategoryCatalog";
import { CAKE_PRODUCTS } from "@/data/categoryProducts";

export const metadata: Metadata = {
  title: "Cakes | Occassions Florist Calicut",
  description:
    "Premium fresh cream celebration & wedding cakes adorned with delicate edible floral decorations.",
};

export default function CakesPage() {
  return (
    <CategoryCatalog
      title="Cakes"
      subtitle="Artisanal celebration & wedding cakes crafted with rich Belgian chocolate, fresh cream, and delicate edible floral accents."
      products={CAKE_PRODUCTS}
    />
  );
}
