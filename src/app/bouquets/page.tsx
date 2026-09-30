import type { Metadata } from "next";
import CategoryCatalog from "@/components/CategoryCatalog";
import { BOUQUET_PRODUCTS } from "@/data/categoryProducts";

export const metadata: Metadata = {
  title: "Bouquet | Occassions Florist Calicut",
  description:
    "Luxury hand-tied flower bouquets wrapped in signature designer paper with French silk ribbons.",
};

export default function BouquetsPage() {
  return (
    <CategoryCatalog
      title="Bouquet"
      subtitle="Luxury hand-tied flower bouquets wrapped in signature designer paper with French silk ribbons."
      products={BOUQUET_PRODUCTS}
    />
  );
}
