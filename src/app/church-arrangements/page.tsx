import type { Metadata } from "next";
import CategoryCatalog from "@/components/CategoryCatalog";
import { CHURCH_ARRANGEMENT_PRODUCTS } from "@/data/categoryProducts";

export const metadata: Metadata = {
  title: "Church Arrangements | Occassions Florist Calicut",
  description:
    "Grand floral arches, altar pedestal displays, and aisle adornments crafted for sacred wedding ceremonies and blessings.",
};

export default function ChurchArrangementsPage() {
  return (
    <CategoryCatalog
      title="Church Arrangements"
      subtitle="Grand floral arches, altar pedestal displays, and aisle adornments crafted for sacred wedding ceremonies and blessings."
      products={CHURCH_ARRANGEMENT_PRODUCTS}
    />
  );
}
