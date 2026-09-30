import type { Metadata } from "next";
import CategoryPage from "@/components/CategoryPage";
import { getProductsByCategory } from "@/data/catalog";

export const metadata: Metadata = {
  title: "Flowers | Occassions Florist Calicut",
  description: "Beautifully crafted floral arrangements for every special moment.",
};

export default function FlowerCategoryPage() {
  const flowerProducts = getProductsByCategory("flower");

  return (
    <CategoryPage
      title="Flowers"
      description="Beautifully crafted floral arrangements for every special moment."
      products={flowerProducts}
    />
  );
}
