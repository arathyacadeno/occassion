import type { Metadata } from "next";
import CategoryPage from "@/components/CategoryPage";
import { getFlowerBouquets } from "@/data/catalog";

export const metadata: Metadata = {
  title: "Flower Bouquets | Occassions Florist Calicut",
  description:
    "Handcrafted fresh floral bouquets featuring premium Dutch roses, lilies, tulips & seasonal blooms.",
};

const BOUQUET_TABS = [
  { id: "all", label: "All Items" },
  { id: "birthday", label: "Birthday" },
  { id: "anniversary", label: "Anniversary" },
  { id: "roses", label: "Roses" },
  { id: "bouquets", label: "Signature Bouquets" },
];

export default function FlowerBouquetsPage() {
  const bouquetProducts = getFlowerBouquets();

  return (
    <CategoryPage
      title="Flower Bouquets"
      description={"Handcrafted fresh floral bouquets featuring\npremium Dutch roses, lilies, tulips & seasonal blooms."}
      products={bouquetProducts}
      filterTabs={BOUQUET_TABS}
    />
  );
}
