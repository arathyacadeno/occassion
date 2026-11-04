import type { Metadata } from "next";
import CategoryPage from "@/components/CategoryPage";
import { getStorefrontCategoryProducts } from "@/lib/getProduct";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wreaths | Occassions Florist Calicut",
  description:
    "Handcrafted tribute wreaths, standing easels & sacred cross floral tributes crafted with utmost grace & devotion.",
};

const WREATH_TABS = [
  { id: "all", label: "All Items" },
  { id: "cross", label: "Cross Wreaths" },
  { id: "circular", label: "Circular Rings" },
  { id: "easel", label: "Standing Easels" },
];

export default async function WreathsPage() {
  const wreathProducts = await getStorefrontCategoryProducts("wreaths");

  return (
    <CategoryPage
      title="Wreaths"
      description={"Handcrafted tribute wreaths, standing easels & sacred cross floral tributes\ncrafted with utmost grace & devotion."}
      products={wreathProducts}
      filterTabs={WREATH_TABS}
    />
  );
}
