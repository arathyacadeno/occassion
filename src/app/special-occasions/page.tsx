import type { Metadata } from "next";
import CategoryPage from "@/components/CategoryPage";
import { getStorefrontCategoryProducts } from "@/lib/getProduct";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Special Occasions | Occassions Florist Calicut",
  description: "Beautiful gifts and arrangements created for life's most memorable moments.",
};

export default async function SpecialOccasionsCategoryPage() {
  const occasionProducts = await getStorefrontCategoryProducts("special-occasions");

  return (
    <CategoryPage
      title="Special Occasions"
      description="Beautiful gifts and arrangements created for life's most memorable moments."
      products={occasionProducts}
    />
  );
}
