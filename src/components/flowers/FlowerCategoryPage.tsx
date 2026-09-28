"use client";

import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumb from "./Breadcrumb";
import CategoryHeader from "./CategoryHeader";
import ProductGrid from "./ProductGrid";
import { CategoryInfo, FlowerProduct } from "@/types";
import styles from "./FlowerCategoryPage.module.css";

interface FlowerCategoryPageProps {
  category: CategoryInfo;
  products: FlowerProduct[];
}

export default function FlowerCategoryPage({ category, products }: FlowerCategoryPageProps) {
  return (
    <div className={styles.pageContainer}>
      <Header />

      <main className={styles.mainContent}>
        <div className={styles.contentInner}>
          {/* Breadcrumb: Home / Flowers / Category */}
          <Breadcrumb items={[{ label: category.name }]} />

          {/* Category Header */}
          <CategoryHeader category={category} productCount={products.length} />

          {/* Product Grid */}
          <ProductGrid products={products} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
