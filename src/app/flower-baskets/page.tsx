import type { Metadata } from "next";
import CategoryPage from "@/components/CategoryPage";
import { getFlowerBaskets } from "@/data/catalog";

export const metadata: Metadata = {
  title: "Flower Baskets | Occassions Florist Calicut",
  description:
    "Artisanal hand-woven baskets brimming with fresh roses, peonies, baby's breath & fragrant greenery.",
};

const BASKET_TABS = [
  { id: "all", label: "All Items" },
  { id: "birthday", label: "Birthday" },
  { id: "anniversary", label: "Anniversary" },
  { id: "boxes", label: "Flowers in Boxes" },
  { id: "baskets", label: "Handcrafted Baskets" },
];

export default function FlowerBasketsPage() {
  const basketProducts = getFlowerBaskets();

  return (
    <CategoryPage
      title="Flower Baskets"
      description={"Artisanal hand-woven baskets brimming with\nfresh roses, peonies, baby's breath & fragrant greenery."}
      products={basketProducts}
      filterTabs={BASKET_TABS}
    />
  );
}
