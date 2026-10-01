"use client";

import React, { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import CategoryHeader from "@/components/CategoryHeader";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import { Product } from "@/data/catalog";
import styles from "./CategoryPage.module.css";

interface CategoryPageProps {
  title: string;
  description: string;
  products: Product[];
}

const FILTER_TABS = [
  { id: "all", label: "All Items" },
  { id: "birthday", label: "Birthday" },
  { id: "anniversary", label: "Anniversary" },
  { id: "boxes", label: "Flowers in Boxes" },
  { id: "bouquets", label: "Flower Bouquet" },
];

export default function CategoryPage({
  title,
  description,
  products,
}: CategoryPageProps) {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredProducts = useMemo(() => {
    if (activeFilter === "all") return products;

    return products.filter((p) => {
      const lowerName = (p.name || "").toLowerCase();
      const lowerDesc = (p.description || "").toLowerCase();
      const lowerSlug = (p.slug || "").toLowerCase();
      const text = `${lowerName} ${lowerDesc} ${lowerSlug}`;

      if (activeFilter === "birthday") {
        return text.includes("birthday") || text.includes("sunflower") || text.includes("cake") || text.includes("gerbera");
      }
      if (activeFilter === "anniversary") {
        return text.includes("anniversary") || text.includes("rose") || text.includes("romance");
      }
      if (activeFilter === "boxes") {
        return text.includes("basket") || text.includes("box") || text.includes("crate") || text.includes("uruli");
      }
      if (activeFilter === "bouquets") {
        return text.includes("bouquet") || text.includes("cone") || text.includes("tied");
      }
      return true;
    });
  }, [products, activeFilter]);

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <main className={styles.mainContent}>
        {/* Category Header */}
        <CategoryHeader title={title} description={description} />

        {/* Filter Pills Navigation (Matching Reference Image) */}
        <div className={styles.filterTabsRow} role="tablist" aria-label="Category Filters">
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`${styles.filterPill} ${
                  isActive ? styles.filterPillActive : ""
                }`}
                onClick={() => setActiveFilter(tab.id)}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Product Grid with Signature Wave Cutout Cards */}
        <ProductGrid
          products={filteredProducts.length > 0 ? filteredProducts : products}
          ariaLabel={`${title} Collection`}
        />
      </main>

      <Footer />
    </div>
  );
}
