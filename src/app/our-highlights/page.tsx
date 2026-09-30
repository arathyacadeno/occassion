import type { Metadata } from "next";
import CategoryPage from "@/components/CategoryPage";
import { getProductsByCategory } from "@/data/catalog";

export const metadata: Metadata = {
  title: "Our Highlights | Occassions Florist Calicut",
  description: "Discover our most loved flowers, gifts and special arrangements.",
};

export default function OurHighlightsCategoryPage() {
  const highlightProducts = getProductsByCategory("our-highlights");

  return (
    <CategoryPage
      title="Our Highlights"
      description="Discover our most loved flowers, gifts and special arrangements."
      products={highlightProducts}
    />
  );
}
