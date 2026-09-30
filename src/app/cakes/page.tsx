import type { Metadata } from "next";
import CategoryPage from "@/components/CategoryPage";
import { getProductsByCategory } from "@/data/catalog";

export const metadata: Metadata = {
  title: "Cakes | Occassions Florist Calicut",
  description: "Deliciously crafted cakes made to make every celebration sweeter.",
};

export default function CakesCategoryPage() {
  const cakeProducts = getProductsByCategory("cakes");

  return (
    <CategoryPage
      title="Cakes"
      description="Deliciously crafted cakes made to make every celebration sweeter."
      products={cakeProducts}
    />
  );
}
