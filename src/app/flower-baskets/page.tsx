import type { Metadata } from "next";
import CategoryPage from "@/components/CategoryPage";
import { getStorefrontCategoryProducts } from "@/lib/getProduct";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Flower Baskets | Occassions Florist Calicut",
  description:
    "Artisanal hand-woven baskets brimming with fresh roses, peonies, baby's breath & fragrant greenery.",
};

const BASKET_TABS = [
  { id: "all", label: "All" },
  { id: "cane", label: "Flowers in Cane Basket" },
  { id: "bamboo", label: "Flowers in Bamboo Basket" },
  { id: "container", label: "Flowers in Container" },
];

export default async function FlowerBasketsPage() {
  const basketProducts = await getStorefrontCategoryProducts("flower-baskets");

  return (
    <CategoryPage
      title="Flower Baskets"
      description={"Artisanal hand-woven baskets brimming with\nfresh roses, peonies, baby's breath & fragrant greenery."}
      products={basketProducts}
      filterTabs={BASKET_TABS}
    />
  );
}
