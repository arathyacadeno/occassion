import type { Metadata } from "next";
import CategoryPage from "@/components/CategoryPage";
import { getStorefrontCategoryProducts } from "@/lib/getProduct";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Flower Bouquets | Occassions Florist Calicut",
  description:
    "Handcrafted fresh floral bouquets featuring premium Dutch roses, orchids, sunflowers & seasonal blooms.",
};

const BOUQUET_TABS = [
  { id: "all", label: "All Items" },
  { id: "roses", label: "Roses" },
  { id: "orchids", label: "Orchids" },
  { id: "carnations", label: "Carnations" },
  { id: "sunflowers", label: "Sunflowers" },
  { id: "birthday", label: "Birthday" },
];

export default async function FlowerBouquetsPage() {
  const bouquetProducts = await getStorefrontCategoryProducts("flower-bouquets");

  return (
    <CategoryPage
      title="Flower Bouquets"
      description={"Handcrafted fresh floral bouquets featuring\npremium Dutch roses, orchids, sunflowers & seasonal blooms."}
      products={bouquetProducts}
      filterTabs={BOUQUET_TABS}
    />
  );
}
