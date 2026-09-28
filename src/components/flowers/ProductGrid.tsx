"use client";

import React, { useState, useMemo } from "react";
import { FlowerProduct } from "@/types";
import ProductCard from "./ProductCard";
import { ArrowUpDown, Sparkles } from "lucide-react";
import styles from "./ProductGrid.module.css";

interface ProductGridProps {
  products: FlowerProduct[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "rating">("featured");

  const sortedProducts = useMemo(() => {
    const list = [...products];
    switch (sortBy) {
      case "price-asc":
        return list.sort((a, b) => a.price - b.price);
      case "price-desc":
        return list.sort((a, b) => b.price - a.price);
      case "rating":
        return list.sort((a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount);
      case "featured":
      default:
        return list;
    }
  }, [products, sortBy]);

  if (products.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <Sparkles size={36} className={styles.emptyIcon} />
        <h3 className={styles.emptyTitle}>No flower arrangements found</h3>
        <p className={styles.emptySubtitle}>
          We are currently preparing fresh harvest bouquets for this category. Please check back shortly or explore our other collections.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {/* Control Bar: Sort dropdown */}
      <div className={styles.controlBar}>
        <span className={styles.itemCountText}>
          Showing <strong>{products.length}</strong> {products.length === 1 ? "design" : "designs"}
        </span>

        <div className={styles.sortGroup}>
          <ArrowUpDown size={14} className={styles.sortIcon} />
          <label htmlFor="sort-select" className={styles.sortLabel}>
            Sort By:
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className={styles.sortSelect}
          >
            <option value="featured">Featured Florist Picks</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Responsive Grid */}
      <div className={styles.grid}>
        {sortedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
