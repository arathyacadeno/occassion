import React from "react";
import Link from "next/link";
import { CategoryInfo } from "@/types";
import styles from "./CategoryHeader.module.css";

interface CategoryHeaderProps {
  category: CategoryInfo;
  productCount: number;
}

const POPULAR_FLOWER_TABS = [
  { slug: "roses", label: "Roses" },
  { slug: "bouquets", label: "Bouquets" },
  { slug: "tulips", label: "Tulips" },
  { slug: "sunflowers", label: "Sunflowers" },
  { slug: "lilies", label: "Lilies" },
  { slug: "anniversary", label: "Anniversary" },
  { slug: "birthday", label: "Birthday" },
  { slug: "pink-flowers", label: "Pink" },
];

export default function CategoryHeader({ category, productCount }: CategoryHeaderProps) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{category.title}</h1>
      <p className={styles.headline}>{category.headline}</p>
      <p className={styles.description}>{category.description}</p>

      {/* Category Pills Navigation */}
      <div className={styles.tabsWrapper}>
        <div className={styles.tabsList}>
          {POPULAR_FLOWER_TABS.map((tab) => {
            const isActive = tab.slug === category.slug;
            return (
              <Link
                key={tab.slug}
                href={`/flowers/${tab.slug}`}
                className={`${styles.tabItem} ${isActive ? styles.tabActive : ""}`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
        <div className={styles.countInfo}>
          Showing <strong>{productCount}</strong> {productCount === 1 ? "arrangement" : "arrangements"}
        </div>
      </div>
    </header>
  );
}
