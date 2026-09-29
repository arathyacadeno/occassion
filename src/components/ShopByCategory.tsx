"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./ShopByCategory.module.css";

interface CategoryCardItem {
  id: string;
  name: string;
  image: string;
  link: string;
  isExternal?: boolean;
  delay: string;
  /** Directional entrance initial transforms */
  initTx: string;
  initTy: string;
  initRot: string;
}

const CATEGORY_CARDS: CategoryCardItem[] = [
  {
    id: "flower-basket",
    name: "Flower Basket",
    image: "/images/flower-basket-cat.jpg",
    link: "/flower-baskets",
    delay: "0s",
    // 1. Flower Basket → from left
    initTx: "-68px",
    initTy: "0px",
    initRot: "-5deg",
  },
  {
    id: "flower-bouquet",
    name: "Flower Bouquet",
    image: "/images/red-rose-bouquet.jpg",
    link: "/flower-bouquets",
    delay: "0.14s",
    // 2. Flower Bouquet → from top-left
    initTx: "-44px",
    initTy: "-55px",
    initRot: "5deg",
  },
  {
    id: "cakes",
    name: "Cakes",
    image: "/images/celebration-cake-cat.jpg",
    link: "/cakes",
    delay: "0.28s",
    // 3. Cakes → from bottom
    initTx: "0px",
    initTy: "65px",
    initRot: "-4deg",
  },
  {
    id: "table-decor",
    name: "Table Decor",
    image: "/images/highlight-table-arrangements.jpg",
    link: "/table-decor",
    delay: "0.42s",
    // 4. Table Decor → from top-right
    initTx: "44px",
    initTy: "-55px",
    initRot: "5deg",
  },
  {
    id: "wreath",
    name: "Wreath",
    image: "/images/floral-wreath-cat.jpg",
    link: "/wreaths",
    delay: "0.56s",
    // 5. Wreath → from right
    initTx: "68px",
    initTy: "0px",
    initRot: "-5deg",
  },
];

export default function ShopByCategory() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const target = sectionRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Trigger when entering viewport and play only once
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles.sectionWrapper}
      id="categories"
      aria-label="Shop by Category"
    >
      <div className={styles.container}>
        {/* Section Heading with Floral Divider Structure */}
        <div className={`${styles.sectionHeader} ${isVisible ? styles.headerInView : ""}`}>
          <span className={styles.subtitle}>Fresh Collections</span>
          <h2 className={styles.mainTitle}>Shop By Category</h2>

          {/* Decorative floral icon with thin horizontal lines */}
          <div className={styles.floralDivider} aria-hidden="true">
            <span className={styles.dividerLine} />
            <span className={styles.dividerIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="2.2" fill="#db2777" />
                <path
                  d="M12 4.5C12 4.5 10 7.5 10 9.5C10 10.6 10.9 11.5 12 11.5C13.1 11.5 14 10.6 14 9.5C14 7.5 12 4.5 12 4.5Z"
                  fill="#fbcfe8"
                  stroke="#db2777"
                  strokeWidth="0.8"
                />
                <path
                  d="M12 19.5C12 19.5 10 16.5 10 14.5C10 13.4 10.9 12.5 12 12.5C13.1 12.5 14 13.4 14 14.5C14 16.5 12 19.5 12 19.5Z"
                  fill="#fbcfe8"
                  stroke="#db2777"
                  strokeWidth="0.8"
                />
                <path
                  d="M4.5 12C4.5 12 7.5 10 9.5 10C10.6 10 11.5 10.9 11.5 12C11.5 13.1 10.6 14 9.5 14C7.5 14 4.5 12 4.5 12Z"
                  fill="#fbcfe8"
                  stroke="#db2777"
                  strokeWidth="0.8"
                />
                <path
                  d="M19.5 12C19.5 12 16.5 10 14.5 10C13.4 10 12.5 10.9 12.5 12C12.5 13.1 13.4 14 14.5 14C16.5 14 19.5 12 19.5 12Z"
                  fill="#fbcfe8"
                  stroke="#db2777"
                  strokeWidth="0.8"
                />
              </svg>
            </span>
            <span className={styles.dividerLine} />
          </div>
        </div>

        {/* 5 Categories Editorial Gallery Row */}
        <div className={styles.galleryGrid}>
          {CATEGORY_CARDS.map((cat) => (
            <CategoryItem
              key={cat.id}
              item={cat}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryItem({
  item,
  isVisible,
}: {
  item: CategoryCardItem;
  isVisible: boolean;
}) {
  const content = (
    <div className={styles.itemWrapper}>
      {/* Large Rectangular Image Area with 20px-24px rounded corners */}
      <div className={styles.imageFrame}>
        <img
          src={item.image}
          alt={item.name}
          className={styles.categoryImage}
          loading="lazy"
        />
      </div>

      {/* Clean Category Name Underneath */}
      <h3 className={styles.categoryTitle}>{item.name}</h3>
    </div>
  );

  return (
    <div
      className={`${styles.itemContainer} ${isVisible ? styles.itemVisible : ""}`}
      style={
        {
          "--tx": item.initTx,
          "--ty": item.initTy,
          "--rot": item.initRot,
          "--anim-delay": item.delay,
        } as React.CSSProperties
      }
    >
      {item.isExternal ? (
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.categoryLink}
          aria-label={`Shop ${item.name}`}
        >
          {content}
        </a>
      ) : (
        <Link
          href={item.link}
          className={styles.categoryLink}
          aria-label={`Shop ${item.name}`}
        >
          {content}
        </Link>
      )}
    </div>
  );
}
