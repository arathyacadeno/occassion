import type { Metadata } from "next";
import CategoryPage from "@/components/CategoryPage";
import { getProductsByCategory } from "@/data/catalog";

export const metadata: Metadata = {
  title: "Flowers for Every Moment | Occassions Florist Calicut",
  description:
    "Exquisite handcrafted bouquets and artisanal flower baskets celebrating life's most precious moments.",
};

export default function FlowerCategoryPage() {
  const flowerProducts = getProductsByCategory("flower");

  return (
    <CategoryPage
      title="Flowers for Every Moment"
      description={"Exquisite handcrafted bouquets and artisanal flower baskets\ncelebrating life's most precious moments."}
      products={flowerProducts}
    />
  );
}
