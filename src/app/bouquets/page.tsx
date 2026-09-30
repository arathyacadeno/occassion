import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import CategoryHeader from "@/components/CategoryHeader";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import { BOUQUET_PRODUCTS } from "@/data/categoryProducts";

export const metadata: Metadata = {
  title: "Bouquets | Occassions Florist Calicut",
  description:
    "Artisanal hand-tied floral bouquets wrapped in luxury papers and French ribbons.",
};

export default function BouquetsPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#ffffff" }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <CategoryHeader
          title="Bouquets"
          description={"Artisanal hand-tied floral bouquets wrapped in\nluxury papers, organic kraft wraps, and French silk ribbons."}
        />
        <ProductGrid products={BOUQUET_PRODUCTS} ariaLabel="Bouquet Products" />
      </main>
      <Footer />
    </div>
  );
}
