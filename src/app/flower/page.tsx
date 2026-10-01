import type { Metadata } from "next";
import CategoryPage from "@/components/CategoryPage";
import { getProductsByCategory } from "@/data/catalog";

export const metadata: Metadata = {
  title: "Flowers for Every Moment | Occassions Florist Calicut",
  description:
    "Artisanal hand-woven baskets brimming with fresh roses, peonies, baby's breath & fragrant greenery.",
};

export default function FlowerCategoryPage() {
  const flowerProducts = getProductsByCategory("flower");

  return (
    <CategoryPage
      title="Flowers for Every Moment"
      description="Artisanal hand-woven baskets brimming with fresh roses, peonies, baby's breath & fragrant greenery."
      products={flowerProducts}
    />
  );
}
