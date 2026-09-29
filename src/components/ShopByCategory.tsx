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
  delay: string;
}

const CATEGORY_CARDS: CategoryCardItem[] = [
  {
    id: "flower-basket",
    name: "Flower Basket",
    description:
      "Artisanal hand-woven baskets brimming with fresh roses, peonies, baby's breath & fragrant greenery.",
    image: "/images/flower-basket-cat.jpg",
    link: "/flower-baskets",
    delay: "60ms",
  },
  {
    id: "flower-bouquet",
    name: "Flower Bouquet",
    description:
      "Luxury hand-tied flower bouquets wrapped in signature designer paper with French silk ribbons.",
    image: "/images/red-rose-bouquet.jpg",
    link: "/flower-bouquets",
    delay: "140ms",
  },
  {
    id: "cakes",
    name: "Cakes",
    description:
      "Premium fresh cream celebration & wedding cakes adorned with delicate edible floral decorations.",
    image: "/images/celebration-cake-cat.jpg",
    link: "/cakes",
    delay: "220ms",
  },
  {
    id: "table-decor",
    name: "Table Decor",
    description:
      "Exquisite floral centerpieces, candelabras & cascading botanical runners for memorable banquets.",
    image: "/images/highlight-table-arrangements.jpg",
    link: "/table-decor",
    delay: "300ms",
  },
  {
    id: "wreath",
    name: "Wreath",
    description:
      "Handcrafted fresh flower wreaths & circular botanical rings woven with silver eucalyptus and roses.",
    image: "/images/floral-wreath-cat.jpg",
    link: "/wreaths",
    delay: "380ms",
  },
];

export default function ShopByCategory() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < 30) {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const target = gridRef.current || sectionRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else if (entry.boundingClientRect.top > 0) {
          setIsVisible(false);
        }
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -30px 0px",
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
        {/* Section Header */}
        <div className={`${styles.sectionHeader} ${isVisible ? styles.headerInView : ""}`}>
          <span className={styles.eyebrow}>EXPLORE OUR COLLECTION</span>
          <h2 className={styles.mainHeading}>Shop by Category</h2>
          <p className={styles.subHeading}>
            Discover beautiful flowers, cakes, and handcrafted decorations for every occasion.
          </p>
        </div>

        {/* ================= 1 ROW WITH 5 CARDS ================= */}
        <div ref={gridRef} className={styles.gridContainer}>
          <div className={styles.rowFive}>
            {CATEGORY_CARDS.map((cat, idx) => (
              <CategoryCard
                key={cat.id}
                item={cat}
                index={idx}
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
  index,
  isVisible,
}: {
  item: CategoryCardItem;
  index: number;
  isVisible: boolean;
}) {
  const cardContent = (
    <article
      className={`${styles.card} ${isVisible ? styles.cardVisible : ""}`}
      style={{ "--anim-delay": item.delay } as React.CSSProperties}
    >
      {/* Top Image Frame with Inset Soft Background */}
      <div className={styles.imageFrame}>
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
        <h3 className={styles.cardTitle}>{item.name}</h3>

        {/* Subtle Arrow CTA */}
        <div className={styles.ctaRow}>
          <span className={styles.ctaText}>Explore</span>
          <ArrowRight size={15} className={styles.ctaArrow} />
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
