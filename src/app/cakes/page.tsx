import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import CategoryHeader from "@/components/CategoryHeader";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import { CAKE_PRODUCTS } from "@/data/categoryProducts";

export const metadata: Metadata = {
  title: "Cakes | Occassions Florist Calicut",
  description:
    "Fresh handcrafted celebration cakes prepared with premium ingredients and edible floral accents.",
};

export default function CakesPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#ffffff" }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <CategoryHeader
          title="Cakes"
          description={"Fresh handcrafted celebration cakes prepared with\nrich Belgian chocolate, fresh cream, and delicate edible floral accents."}
        />
        <ProductGrid products={CAKE_PRODUCTS} ariaLabel="Cake Products" />
      </main>
      <Footer />
    </div>
  );
}
