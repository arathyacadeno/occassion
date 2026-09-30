import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import CategoryHeader from "@/components/CategoryHeader";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import { FLOWER_BASKET_PRODUCTS } from "@/data/categoryProducts";

export const metadata: Metadata = {
  title: "Flower Basket | Occassions Florist Calicut",
  description:
    "Artisanal hand-woven baskets brimming with fresh roses, peonies, baby's breath & fragrant greenery.",
};

export default function FlowerBasketsPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#ffffff" }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <CategoryHeader
          title="Flower Basket"
          description={"Artisanal hand-woven baskets brimming with\nfresh roses, peonies, baby's breath & fragrant greenery."}
        />
        <ProductGrid products={FLOWER_BASKET_PRODUCTS} ariaLabel="Flower Basket Products" />
      </main>
      <Footer />
    </div>
  );
}
