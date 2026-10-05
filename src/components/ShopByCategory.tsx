"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./ShopByCategory.module.css";

interface CategoryCardItem {
  id: string;
  name: string;
  image: string;
  link: string;
  delay: string;
  initTx: string;
  initTy: string;
  initRot: string;
}

const CATEGORY_CARDS: CategoryCardItem[] = [
  {
    id: "flower-basket",
    name: "Flower Basket",
    image: "/images/cat-flower-basket-luxe.jpg",
    link: "/flower-baskets",
    delay: "0s",
    initTx: "0px",
    initTy: "16px",
    initRot: "0deg",
  },
  {
    id: "flower-bouquet",
    name: "Flower Bouquet",
    image: "/images/flower-bouquet-luxe.png",
    link: "/flower-bouquets",
    delay: "0.12s",
    initTx: "0px",
    initTy: "16px",
    initRot: "0deg",
  },
  {
    id: "cakes",
    name: "Cakes",
    image: "/images/cat-cakes-luxe.jpg",
    link: "/cakes",
    delay: "0.24s",
    initTx: "0px",
    initTy: "16px",
    initRot: "0deg",
  },
  {
    id: "table-decor",
    name: "Table Decor",
    image: "/images/cat-table-arrangements-luxe.jpg",
    link: "/table-arrangements",
    delay: "0.36s",
    initTx: "0px",
    initTy: "16px",
    initRot: "0deg",
  },
  {
    id: "wreath",
    name: "Wreath",
    image: "/images/cat-wreath-luxe.jpg",
    link: "/wreaths",
    delay: "0.48s",
    initTx: "0px",
    initTy: "16px",
    initRot: "0deg",
  },
  {
    id: "get-well-soon",
    name: "Get Well Soon",
    image: "/images/cat-get-well-soon.jpg",
    link: "/flower-bouquets?occasion=get-well-soon",
    delay: "0.60s",
    initTx: "0px",
    initTy: "16px",
    initRot: "0deg",
  },
  {
    id: "condolences",
    name: "Condolences",
    image: "/images/cat-condolences.jpg",
    link: "/flower-bouquets?occasion=condolences",
    delay: "0.72s",
    initTx: "0px",
    initTy: "16px",
    initRot: "0deg",
  },
];

export default function ShopByCategory() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const target = sectionRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
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
        {/* Section heading */}
        <div
          className={`${styles.sectionHeader} ${isVisible ? styles.headerInView : ""
            }`}
        >
          <span className={styles.subtitle}>Fresh Collections</span>
          <h2 className={styles.mainTitle}>Shop By Category</h2>

          <div className={styles.floralDivider} aria-hidden="true">
            <span className={styles.dividerLine} />
            <span className={styles.dividerIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 12 C9 8.2 9 4.2 12 1.2 C15 4.2 15 8.2 12 12 Z"
                  fill="#fdf2f7"
                  stroke="#db2777"
                  strokeWidth="1.3"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 12 C9 15.8 9 19.8 12 22.8 C15 19.8 15 15.8 12 12 Z"
                  fill="#fdf2f7"
                  stroke="#db2777"
                  strokeWidth="1.3"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 12 C8.2 9 4.2 9 1.2 12 C4.2 15 8.2 15 12 12 Z"
                  fill="#fdf2f7"
                  stroke="#db2777"
                  strokeWidth="1.3"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 12 C15.8 9 19.8 9 22.8 12 C19.8 15 15.8 15 12 12 Z"
                  fill="#fdf2f7"
                  stroke="#db2777"
                  strokeWidth="1.3"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className={styles.dividerLine} />
          </div>
        </div>

        {/* White Rounded Card Container */}
        <div className={styles.whiteCardWrapper}>
          <div className={styles.galleryGrid}>
            {CATEGORY_CARDS.map((cat) => (
              <CategoryItem key={cat.id} item={cat} isVisible={isVisible} />
            ))}
          </div>
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
  const isBouquet = item.id === "flower-bouquet";
  const content = (
    <div className={styles.itemWrapper}>
      <div
        className={styles.imageFrame}
        style={isBouquet ? { backgroundColor: "#B5DCF7" } : undefined}
      >
        <Image
          src={item.image}
          alt={item.name}
          fill
          unoptimized
          sizes="(max-width: 640px) 45vw, (max-width: 960px) 30vw, 220px"
          className={styles.categoryImage}
        />
      </div>
      <h3 className={styles.categoryTitle}>{item.name}</h3>
    </div>
  );

  return (
    <div
      className={`${styles.itemContainer} ${
        isVisible ? styles.itemVisible : ""
      }`}
      style={
        {
          "--anim-delay": item.delay,
          "--tx": item.initTx,
          "--ty": item.initTy,
          "--rot": item.initRot,
        } as React.CSSProperties
      }
    >
      <Link href={item.link} className={styles.categoryLink} aria-label={item.name}>
        {content}
      </Link>
    </div>
  );
}