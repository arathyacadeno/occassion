import React from "react";
import { Product } from "@/data/catalog";
import ProductCard from "./ProductCard";
import styles from "./ProductGrid.module.css";

interface ProductGridProps {
  products: Product[];
  ariaLabel?: string;
}

export default function ProductGrid({
  products,
  ariaLabel = "Product Grid",
}: ProductGridProps) {
  return (
    <div className={styles.gridContainer}>
      <section className={styles.productGrid} aria-label={ariaLabel}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>
    </div>
  );
}
