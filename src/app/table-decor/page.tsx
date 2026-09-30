import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import CategoryHeader from "@/components/CategoryHeader";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import { TABLE_DECOR_PRODUCTS } from "@/data/categoryProducts";

export const metadata: Metadata = {
  title: "Table Decor | Occassions Florist Calicut",
  description:
    "Exquisite floral centerpieces, candelabras & cascading botanical runners for memorable banquets.",
};

export default function TableDecorPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#ffffff" }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <CategoryHeader
          title="Table Decor"
          description={"Exquisite floral centerpieces, candelabras & cascading botanical runners\nfor memorable banquets, weddings, and celebration dining."}
        />
        <ProductGrid products={TABLE_DECOR_PRODUCTS} ariaLabel="Table Decor Products" />
      </main>
      <Footer />
    </div>
  );
}
