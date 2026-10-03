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
    initTx: "-68px",
    initTy: "0px",
    initRot: "-5deg",
  },
  {
    id: "flower-bouquet",
    name: "Flower Bouquet",
    image: "/images/flower-bouquet-luxe.png",
    link: "/flower-bouquets",
    delay: "0.14s",
    initTx: "-44px",
    initTy: "-55px",
    initRot: "5deg",
  },
  {
    id: "cakes",
    name: "Cakes",
    image: "/images/cat-cakes-pedestal.jpg",
    link: "/cakes",
    delay: "0.28s",
    initTx: "0px",
    initTy: "65px",
    initRot: "-4deg",
  },
  {
    id: "table-decor",
    name: "Table Decor",
    image: "/images/cat-table-decor-luxe.jpg",
    link: "/table-decor",
    delay: "0.42s",
    initTx: "44px",
    initTy: "-55px",
    initRot: "5deg",
  },
  {
    id: "wreath",
    name: "Wreath",
    image: "/images/cat-wreath-luxe.jpg",
    link: "/wreaths",
    delay: "0.56s",
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
          <h2 className={styles.mainTitle}>Shop By Category</h2>
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
      id={item.id}
      className={`${styles.itemContainer} ${isVisible ? styles.itemVisible : ""
        }`}
      style={
        {
          "--tx": item.initTx,
          "--ty": item.initTy,
          "--rot": item.initRot,
          "--anim-delay": item.delay,
        } as React.CSSProperties
      }
    >
      <Link
        href={item.link}
        className={styles.categoryLink}
        aria-label={`Shop ${item.name}`}
      >
        {content}
      </Link>
    </div>
  );
}