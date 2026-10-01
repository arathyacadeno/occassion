"use client";

import React, { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import CategoryHeader from "@/components/CategoryHeader";
import Breadcrumb from "@/components/Breadcrumb";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import { Product } from "@/data/catalog";
import styles from "./CategoryPage.module.css";

interface CategoryPageProps {
  title: string;
  description: string;
  products: Product[];
  filterTabs?: { id: string; label: string }[];
  showBreadcrumb?: boolean;
}

const DEFAULT_FILTER_TABS = [
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
  filterTabs,
  showBreadcrumb = false,
}: CategoryPageProps) {
  const [activeFilter, setActiveFilter] = useState("all");
  const tabs = filterTabs && filterTabs.length > 0 ? filterTabs : DEFAULT_FILTER_TABS;

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
      if (activeFilter === "boxes" || activeFilter === "baskets") {
        return text.includes("basket") || text.includes("box") || text.includes("crate") || text.includes("uruli");
      }
      if (activeFilter === "bouquets") {
        return text.includes("bouquet") || text.includes("cone") || text.includes("tied");
      }
      if (activeFilter === "roses") {
        return text.includes("rose");
      }
      if (activeFilter === "tulips") {
        return text.includes("tulip");
      }
      if (activeFilter === "lilies") {
        return text.includes("lily") || text.includes("lilies");
      }
      if (activeFilter === "chocolate") {
        return text.includes("chocolate") || text.includes("truffle") || text.includes("espresso") || text.includes("biscoff");
      }
      if (activeFilter === "fruit" || activeFilter === "vanilla") {
        return text.includes("berry") || text.includes("vanilla") || text.includes("mango") || text.includes("forest") || text.includes("butterscotch");
      }
      return true;
    });
  }, [products, activeFilter]);

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <main className={styles.mainContent}>
        {/* Optional Breadcrumb Navigation */}
        {showBreadcrumb && <Breadcrumb items={[{ label: title }]} />}

        {/* Category Header */}
        <CategoryHeader title={title} description={description} />

        {/* Filter Pills Navigation (Matching Reference Image) */}
        <div className={styles.filterTabsRow} role="tablist" aria-label="Category Filters">
          {tabs.map((tab) => {
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
          products={filteredProducts}
          ariaLabel={`${title} Collection`}
        />
      </main>

      <Footer />
    </div>
  );
}
