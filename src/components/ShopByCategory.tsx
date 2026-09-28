"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import styles from "./ShopByCategory.module.css";

interface CategoryCardItem {
  id: string;
  name: string;
  description: string;
  image: string;
  link: string;
  isExternal?: boolean;
  animDirection: "left" | "right" | "bottom-left" | "bottom" | "bottom-right";
  delay: string;
}

const ROW_ONE_CARDS: CategoryCardItem[] = [
  {
    id: "flower-basket",
    name: "Flower Basket",
    description:
      "Artisanal hand-woven baskets brimming with fresh roses, peonies, baby's breath & fragrant greenery.",
    image: "/images/flower-basket-cat.jpg",
    link: "/garlands-and-baskets",
    animDirection: "left",
    delay: "60ms",
  },
  {
    id: "flower-bouquet",
    name: "Flower Bouquet",
    description:
      "Luxury hand-tied flower bouquets wrapped in signature designer paper with French silk ribbons.",
    image: "/images/red-rose-bouquet.jpg",
    link: "/flowers/bouquets",
    animDirection: "right",
    delay: "180ms",
  },
];

const ROW_TWO_CARDS: CategoryCardItem[] = [
  {
    id: "cakes",
    name: "Cakes",
    description:
      "Premium fresh cream celebration & wedding cakes adorned with delicate edible floral decorations.",
    image: "/images/celebration-cake-cat.jpg",
    link: "https://wa.me/918606464700?text=Hello%20Occassions,%20I%20would%20like%20to%20order%20a%20fresh%20celebration%20cake.",
    isExternal: true,
    animDirection: "bottom-left",
    delay: "300ms",
  },
  {
    id: "table-decor",
    name: "Table Decor",
    description:
      "Exquisite floral centerpieces, candelabras & cascading botanical runners for memorable banquets.",
    image: "/images/highlight-table-arrangements.jpg",
    link: "/table-arrangements",
    animDirection: "bottom",
    delay: "420ms",
  },
  {
    id: "wreath",
    name: "Wreath",
    description:
      "Handcrafted fresh flower wreaths & circular botanical rings woven with silver eucalyptus and roses.",
    image: "/images/floral-wreath-cat.jpg",
    link: "/church-arrangements",
    animDirection: "bottom-right",
    delay: "540ms",
  },
];

export default function ShopByCategory() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Trigger only once when entering viewport
        }
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

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
        {/* Section Header */}
        <div className={`${styles.sectionHeader} ${isVisible ? styles.headerInView : ""}`}>
          <span className={styles.eyebrow}>EXPLORE OUR COLLECTION</span>
          <h2 className={styles.mainHeading}>Shop by Category</h2>
          <p className={styles.subHeading}>
            Discover beautiful flowers, cakes, and handcrafted decorations for every occasion.
          </p>
        </div>

        {/* ================= 2 + 3 BENTO GRID ================= */}
        <div className={styles.gridContainer}>
          {/* Row 1: 2 Large Cards */}
          <div className={styles.rowLarge}>
            {ROW_ONE_CARDS.map((cat) => (
              <CategoryCard
                key={cat.id}
                item={cat}
                isLarge={true}
                isVisible={isVisible}
              />
            ))}
          </div>

          {/* Row 2: 3 Smaller Cards */}
          <div className={styles.rowSmall}>
            {ROW_TWO_CARDS.map((cat) => (
              <CategoryCard
                key={cat.id}
                item={cat}
                isLarge={false}
                isVisible={isVisible}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryCard({
  item,
  isLarge,
  isVisible,
}: {
  item: CategoryCardItem;
  isLarge: boolean;
  isVisible: boolean;
}) {
  const directionClasses: Record<CategoryCardItem["animDirection"], string> = {
    left: styles.animFromLeft,
    right: styles.animFromRight,
    "bottom-left": styles.animFromBottomLeft,
    bottom: styles.animFromBottom,
    "bottom-right": styles.animFromBottomRight,
  };

  const cardContent = (
    <article
      className={`${styles.card} ${isLarge ? styles.cardLarge : styles.cardSmall} ${
        directionClasses[item.animDirection]
      } ${isVisible ? styles.cardVisible : ""}`}
      style={{ "--anim-delay": item.delay } as React.CSSProperties}
    >
      {/* Top Image Frame with Inset Soft Background */}
      <div className={`${styles.imageFrame} ${isLarge ? styles.imageFrameLarge : styles.imageFrameSmall}`}>
        <img
          src={item.image}
          alt={item.name}
          className={styles.cardImage}
          loading="lazy"
        />
        {/* Subtle Pink Hover Overlay */}
        <div className={styles.hoverOverlay} />
      </div>

      {/* Bottom Text Content */}
      <div className={styles.cardContent}>
        <div className={styles.textWrapper}>
          <h3 className={`${styles.cardTitle} ${isLarge ? styles.titleLarge : styles.titleSmall}`}>
            {item.name}
          </h3>
          <p className={styles.cardDesc}>{item.description}</p>
        </div>

        {/* Subtle Arrow CTA */}
        <div className={styles.ctaRow}>
          <span className={styles.ctaText}>Explore</span>
          <ArrowRight size={16} className={styles.ctaArrow} />
        </div>
      </div>
    </article>
  );

  if (item.isExternal) {
    return (
      <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.cardLink}
        aria-label={`Explore ${item.name}`}
      >
        {cardContent}
      </a>
    );
  }

  return (
    <Link href={item.link} className={styles.cardLink} aria-label={`Explore ${item.name}`}>
      {cardContent}
    </Link>
  );
}
