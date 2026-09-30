import type { Metadata } from "next";
import CategoryPage from "@/components/CategoryPage";
import { getProductsByCategory } from "@/data/catalog";

export const metadata: Metadata = {
  title: "Special Occasions | Occassions Florist Calicut",
  description: "Beautiful gifts and arrangements created for life's most memorable moments.",
};

export default function SpecialOccasionsCategoryPage() {
  const occasionProducts = getProductsByCategory("special-occasions");

  return (
    <CategoryPage
      title="Special Occasions"
      description="Beautiful gifts and arrangements created for life's most memorable moments."
      products={occasionProducts}
    />
  );
}
