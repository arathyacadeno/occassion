import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductGallery from "@/components/ProductGallery";
import ProductInfo from "@/components/ProductInfo";
import ProductGrid from "@/components/ProductGrid";
import { Product, getProductsByCategory } from "@/data/catalog";
import styles from "./ProductDetailView.module.css";

interface ProductDetailViewProps {
  product: Product;
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const relatedProducts = getProductsByCategory(product.category)
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <main className={styles.mainContainer}>
        {/* Main 2-column Product Detail Layout */}
        <section className={styles.productLayout}>
          <ProductGallery
            images={product.images}
            productName={product.name}
          />

          <ProductInfo product={product} />
        </section>

        {/* You May Also Like */}
        {relatedProducts.length > 0 && (
          <section className={styles.relatedSection}>
            <h2 className={styles.relatedHeading}>You May Also Like</h2>
            <ProductGrid products={relatedProducts} ariaLabel="Related Products" />
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
