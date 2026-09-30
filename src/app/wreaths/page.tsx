import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import CategoryHeader from "@/components/CategoryHeader";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import { WREATH_PRODUCTS } from "@/data/categoryProducts";

export const metadata: Metadata = {
  title: "Wreaths | Occassions Florist Calicut",
  description:
    "Handcrafted fresh flower wreaths & circular botanical rings woven with silver eucalyptus and roses.",
};

export default function WreathsPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#ffffff" }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <CategoryHeader
          title="Wreaths"
          description={"Handcrafted fresh flower wreaths & circular botanical rings\nwoven with silver eucalyptus, ivory lilies, and velvety roses."}
        />
        <ProductGrid products={WREATH_PRODUCTS} ariaLabel="Wreath Products" />
      </main>
      <Footer />
    </div>
  );
}
