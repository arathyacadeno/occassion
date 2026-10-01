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
      {products.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#6b7280" }}>
          <p style={{ fontSize: "18px", fontWeight: 500, margin: 0 }}>
            No flower arrangements found for this filter.
          </p>
          <p style={{ fontSize: "14px", marginTop: "8px", color: "#9ca3af" }}>
            Please select &quot;All Items&quot; or choose another category.
          </p>
        </div>
      ) : (
        <section className={styles.productGrid} aria-label={ariaLabel}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>
      )}
    </div>
  );
}
