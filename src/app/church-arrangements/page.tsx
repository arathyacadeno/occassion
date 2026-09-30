import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import CategoryHeader from "@/components/CategoryHeader";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import { CHURCH_ARRANGEMENT_PRODUCTS } from "@/data/categoryProducts";

export const metadata: Metadata = {
  title: "Church Arrangements | Occassions Florist Calicut",
  description:
    "Grand floral arches, altar pedestal displays, and aisle adornments crafted for sacred wedding ceremonies and blessings.",
};

export default function ChurchArrangementsPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#ffffff" }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <CategoryHeader
          title="Church Arrangements"
          description={"Grand floral arches, altar pedestal displays, and aisle adornments\ncrafted for sacred wedding ceremonies, altar sanctuaries, and blessings."}
        />
        <ProductGrid products={CHURCH_ARRANGEMENT_PRODUCTS} ariaLabel="Church Arrangement Products" />
      </main>
      <Footer />
    </div>
  );
}
