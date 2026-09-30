import type { Metadata } from "next";
import CategoryCatalog from "@/components/CategoryCatalog";
import { FLOWER_BASKET_PRODUCTS } from "@/data/categoryProducts";

export const metadata: Metadata = {
  title: "Flower Basket | Occassions Florist Calicut",
  description:
    "Artisanal hand-woven baskets brimming with fresh roses, peonies, baby's breath & fragrant greenery.",
};

export default function FlowerBasketsPage() {
  return (
    <CategoryCatalog
      title="Flower Basket"
      subtitle="Artisanal hand-woven baskets brimming with fresh roses, peonies, baby's breath & fragrant greenery."
      products={FLOWER_BASKET_PRODUCTS}
    />
  );
}
