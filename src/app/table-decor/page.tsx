import type { Metadata } from "next";
import CategoryPage from "@/components/CategoryPage";
import { getStorefrontCategoryProducts } from "@/lib/getProduct";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Table Decor | Occassions Florist Calicut",
  description:
    "Stunning floral centerpieces, banquet runners & bespoke table arrangements handcrafted for memorable celebrations.",
};

const TABLE_DECOR_TABS = [
  { id: "all", label: "All Items" },
  { id: "centerpiece", label: "Centerpieces" },
  { id: "runner", label: "Runners & Banquets" },
  { id: "heart", label: "Heart Arrangements" },
  { id: "wedding", label: "Wedding & Ceremonies" },
];

export default async function TableDecorCategoryPage() {
  const tableProducts = await getStorefrontCategoryProducts("table-decor");

  return (
    <CategoryPage
      title="Table Decor"
      description={"Stunning floral centerpieces, banquet runners & bespoke table arrangements\nhandcrafted for memorable celebrations."}
      products={tableProducts}
      filterTabs={TABLE_DECOR_TABS}
    />
  );
}
