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
  /** Initial transform when card is off-screen (before animation) */
  initTx: string;   // translateX value, e.g. "-80px"
  initTy: string;   // translateY value, e.g. "0px"
  initRot: string;  // rotate value,  e.g. "-8deg"
}

const CATEGORY_CARDS: CategoryCardItem[] = [
  {
    id: "flower-basket",
    name: "Flower Basket",
    description:
      "Artisanal hand-woven baskets brimming with fresh roses, peonies, baby's breath & fragrant greenery.",
    image: "/images/flower-basket-cat.jpg",
    link: "/flower-baskets",
    delay: "0ms",
    // Card 1: enter from the left, tilted CCW
    initTx: "-72px",
    initTy: "10px",
    initRot: "-7deg",
  },
  {
    id: "flower-bouquet",
    name: "Flower Bouquet",
    description:
      "Luxury hand-tied flower bouquets wrapped in signature designer paper with French silk ribbons.",
    image: "/images/red-rose-bouquet.jpg",
    link: "/flower-bouquets",
    delay: "120ms",
    // Card 2: enter from top-left, tilted CW
    initTx: "-50px",
    initTy: "-60px",
    initRot: "7deg",
  },
  {
    id: "cakes",
    name: "Cakes",
    description:
      "Premium fresh cream celebration & wedding cakes adorned with delicate edible floral decorations.",
    image: "/images/celebration-cake-cat.jpg",
    link: "/cakes",
    delay: "220ms",
    // Card 3: enter from below, tilted CCW
    initTx: "0px",
    initTy: "70px",
    initRot: "-6deg",
  },
  {
    id: "table-decor",
    name: "Table Decor",
    description:
      "Exquisite floral centerpieces, candelabras & cascading botanical runners for memorable banquets.",
    image: "/images/highlight-table-arrangements.jpg",
    link: "/table-decor",
    delay: "120ms",
    // Card 4: enter from top-right, tilted CW
    initTx: "50px",
    initTy: "-60px",
    initRot: "7deg",
  },
  {
    id: "wreath",
    name: "Wreath",
    description:
      "Handcrafted fresh flower wreaths & circular botanical rings woven with silver eucalyptus and roses.",
    image: "/images/floral-wreath-cat.jpg",
    link: "/wreaths",
    delay: "0ms",
    // Card 5: enter from the right, tilted CCW
    initTx: "72px",
    initTy: "10px",
    initRot: "-7deg",
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
      style={
        {
          "--tx": item.initTx,
          "--ty": item.initTy,
          "--rot": item.initRot,
          "--anim-delay": item.delay,
        } as React.CSSProperties
      }
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
