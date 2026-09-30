import React from "react";
import Navbar from "@/components/Navbar";
import CategoryHeader from "@/components/CategoryHeader";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import { Product } from "@/data/catalog";

interface CategoryPageProps {
  title: string;
  description: string;
  products: Product[];
}

export default function CategoryPage({
  title,
  description,
  products,
}: CategoryPageProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#ffffff",
      }}
    >
      <Navbar />
      <main style={{ flex: 1 }}>
        <CategoryHeader title={title} description={description} />
        <ProductGrid products={products} ariaLabel={`${title} Collection`} />
      </main>
      <Footer />
    </div>
  );
}
