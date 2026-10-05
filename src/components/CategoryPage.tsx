"use client";

import React, { useMemo, useState } from "react";
import styles from "./CategoryPage.module.css";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Product } from "@/data/catalog";

const FILTERS = [
  "All Items",
  "Birthday",
  "Anniversary",
  "Flowers in Boxes",
  "Handcrafted Baskets",
];

interface CategoryPageProps {
  title?: string;
  description?: string;
  products: Product[];
  filterTabs?: { id: string; label: string }[];
}

export default function CategoryPage({
  title = "Flower Baskets",
  products,
}: CategoryPageProps) {
  const [activeFilter, setActiveFilter] = useState<string>(FILTERS[0]);

  const visibleProducts = useMemo(
    () =>
      activeFilter === FILTERS[0]
        ? products
        : products.filter((p) => {
            const text = `${p.name} ${p.description ?? ""} ${p.slug ?? ""}`.toLowerCase();
            const f = activeFilter.toLowerCase();
            if (f === "birthday")
              return (
                text.includes("birthday") ||
                text.includes("celebration") ||
                text.includes("sunflower") ||
                text.includes("gerbera")
              );
            if (f === "anniversary")
              return (
                text.includes("anniversary") ||
                text.includes("wedding") ||
                text.includes("heart") ||
                text.includes("romance")
              );
            if (f === "flowers in boxes")
              return (
                text.includes("basket") ||
                text.includes("box") ||
                text.includes("crate")
              );
            if (f === "handcrafted baskets") return text.includes("basket");
            return true;
          }),
    [activeFilter, products]
  );

  return (
    <div className={styles.pageWrapper}>
      <Navbar />
      <main className={styles.mainContent}>
        {/* ================= HEADING ================= */}
        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>{title}</h1>
          <p className={styles.pageSubtitle}>
            Artisanal hand-woven baskets brimming with
            <br />
            fresh roses, peonies, baby&apos;s breath &amp; fragrant greenery.
          </p>
        </header>

        {/* ================= PINK PANEL ================= */}
        <section className={styles.categoryPanel}>
          <div
            className={styles.filterTabsRow}
            role="tablist"
            aria-label="Filter products"
          >
            {FILTERS.map((filter) => {
              const isActive = filter === activeFilter;
              return (
                <button
                  key={filter}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`${styles.filterPill} ${
                    isActive ? styles.filterPillActive : ""
                  }`}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              );
            })}
          </div>

          <div className={styles.gridContainer}>
            <div className={styles.productGrid}>
              {visibleProducts.length > 0 ? (
                visibleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <p className={styles.emptyState}>
                  No products in this category yet.
                </p>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}