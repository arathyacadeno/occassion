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

const DEFAULT_CATEGORY_CARDS: CategoryCardItem[] = [
  {
    id: "flower-bouquet",
    name: "Flower Bouquet",
    image: "/images/categories/flower-bouquet.jpg",
    link: "/flower-bouquets",
    delay: "0s",
    initTx: "0px",
    initTy: "16px",
    initRot: "0deg",
  },
  {
    id: "flower-basket",
    name: "Flower Basket",
    image: "/images/categories/flower-basket.jpg",
    link: "/flower-baskets",
    delay: "0.12s",
    initTx: "0px",
    initTy: "16px",
    initRot: "0deg",
  },
  {
    id: "cakes",
    name: "Cakes",
    image: "/images/cakes/cat-cakes-luxe.jpg",
    link: "/cakes",
    delay: "0.24s",
    initTx: "0px",
    initTy: "16px",
    initRot: "0deg",
  },
  {
    id: "table-decor",
    name: "Table Decor",
    image: "/images/categories/table-decor.jpg",
    link: "/table-decor",
    delay: "0.36s",
    initTx: "0px",
    initTy: "16px",
    initRot: "0deg",
  },
  {
    id: "wreath",
    name: "Wreath",
    image: "/images/categories/wreath.jpg",
    link: "/wreaths",
    delay: "0.48s",
    initTx: "0px",
    initTy: "16px",
    initRot: "0deg",
  },
];

const getCategoryLink = (slug: string, id: string): string => {
  const s = (slug || id || "").toLowerCase().replace(/^cat-/, "");
  if (s.includes("flower-bouquet") || s === "bouquet" || s === "bouquets") return "/flower-bouquets";
  if (s.includes("flower-basket") || s === "basket" || s === "baskets") return "/flower-baskets";
  if (s.includes("cake")) return "/cakes";
  if (s.includes("table-decor") || s === "table-decorations") return "/table-decor";
  if (s.includes("wreath")) return "/wreaths";
  return `/category/${s}`;
};

export default function ShopByCategory() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [categoryCards, setCategoryCards] = useState<CategoryCardItem[]>(DEFAULT_CATEGORY_CARDS);

  // Dynamically load active categories from database
  useEffect(() => {
    let isMounted = true;
    fetch("/api/categories?activeOnly=true")
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted || !data.success || !Array.isArray(data.categories) || data.categories.length === 0) return;

        // User fixed ordering: 1. Flower Bouquet, 2. Flower Basket, 3. Cakes, 4. Table Decor, 5. Wreath
        const FIXED_ORDER = ["flower-bouquet", "flower-basket", "cakes", "table-decor", "wreath"];
        const getSortRank = (cat: any) => {
          const s = (cat.slug || cat.id || "").toLowerCase().replace(/^cat-/, "");
          for (let i = 0; i < FIXED_ORDER.length; i++) {
            if (s.includes(FIXED_ORDER[i]) || FIXED_ORDER[i].includes(s)) {
              return i;
            }
          }
          return 100 + (cat.display_order || 0);
        };

        // Storefront MUST ONLY show these 5 categories, never Add-ons
        const storefrontCategories = data.categories.filter((c: any) => {
          const s = (c.slug || c.id || "").toLowerCase().replace(/^cat-/, "");
          if (s.includes("addon")) return false;
          return FIXED_ORDER.some((orderKey) => s.includes(orderKey) || orderKey.includes(s));
        });

        const sorted = [...storefrontCategories].sort((a: any, b: any) => getSortRank(a) - getSortRank(b));
        const mapped: CategoryCardItem[] = sorted.map((c: any, index: number) => {
          let fallbackImg = "/images/categories/flower-bouquet.jpg";
          const s = (c.slug || c.id || "").toLowerCase();
          if (s.includes("basket")) fallbackImg = "/images/categories/flower-basket.jpg";
          else if (s.includes("cake")) fallbackImg = "/images/cakes/cat-cakes-luxe.jpg";
          else if (s.includes("table")) fallbackImg = "/images/categories/table-decor.jpg";
          else if (s.includes("wreath")) fallbackImg = "/images/categories/wreath.jpg";

          const isBroken = !c.image || c.image.includes("lily-6-stems") || c.image.includes("flower-basket-pink-lilies") || c.image.includes("cake-chocolate") || c.image.includes("table-arrangement") || c.image.includes("wreath-white-lilies");

          return {
            id: c.slug || c.id,
            name: c.name,
            image: isBroken ? fallbackImg : c.image,
            link: getCategoryLink(c.slug, c.id),
            delay: `${Math.min(index * 0.1, 0.6).toFixed(2)}s`,
            initTx: "0px",
            initTy: "16px",
            initRot: "0deg",
          };
        });
        setCategoryCards(mapped);
      })
      .catch((err) => {
        console.warn("Dynamic category fetch error:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

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
      style={{ scrollMarginTop: "80px" }}
    >
      <div id="shop-by-category" style={{ position: "absolute", top: "-80px" }} />
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
            {categoryCards.map((cat) => (
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

      >
        <Image
          src={item.image}
          onError={(e: any) => {
            const el = e.currentTarget || e.target;
            if (el) el.src = "/images/cat-flower-bouquet-luxe.jpg";
          }}
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