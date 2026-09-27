"use client";

import React, { useState } from "react";
import styles from "./ShopByCategory.module.css";
import { ArrowUpRight } from "lucide-react";

export interface CategoryItem {
  id: string;
  title: string;
  subtitle: string;
  pillLabel: string;
  image: string;
  count: string;
  whatsAppText: string;
}

const CATEGORIES_DATA: CategoryItem[] = [
  {
    id: "seasonal-flowers",
    title: "Seasonal flowers",
    subtitle: "Choose From",
    pillLabel: "Seasonal",
    image: "/images/cat-seasonal-flowers.jpg",
    count: "24 Arrangements",
    whatsAppText:
      "Hello Occassions, I would like to inquire about fresh Seasonal Flowers arrangements.",
  },
  {
    id: "birthday",
    title: "Birthday",
    subtitle: "Choose From",
    pillLabel: "Birthday",
    image: "/images/cat-birthday.jpg",
    count: "36 Bouquets",
    whatsAppText:
      "Hello Occassions, I would like to inquire about Birthday floral bouquets.",
  },
  {
    id: "friendship",
    title: "Friendship",
    subtitle: "Choose From",
    pillLabel: "Friendship",
    image: "/images/cat-friendship.jpg",
    count: "18 Selections",
    whatsAppText:
      "Hello Occassions, I would like to inquire about Friendship floral gifts.",
  },
  {
    id: "congratulations",
    title: "Congratulations",
    subtitle: "Choose From",
    pillLabel: "Congratulations",
    image: "/images/cat-congratulations.jpg",
    count: "28 Creations",
    whatsAppText:
      "Hello Occassions, I would like to inquire about Congratulations flower baskets.",
  },
];

export default function ShopByCategory() {
  // 1st card is larger by default (matching screenshot)
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const handleCardClick = (cat: CategoryItem) => {
    // Open WhatsApp inquiry for this category
    const encoded = encodeURIComponent(cat.whatsAppText);
    window.open(`https://wa.me/918606464700?text=${encoded}`, "_blank");
  };

  return (
    <section className={styles.sectionWrapper} id="categories">
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.mainTitle}>Shop By Category</h2>
          <span className={styles.subtitle}>Curated Celebrations</span>
        </div>

        {/* ================= ACCORDION CARDS TRACK =================
            - Mouse hover on any card smoothly expands it to be large like 1st card
            - Mouse leave resets smoothly to 1st card
            ========================================================= */}
        <div
          className={styles.cardsTrack}
          onMouseLeave={() => setActiveIndex(0)}
        >
          {CATEGORIES_DATA.map((cat, index) => {
            const isExpanded = activeIndex === index;

            return (
              <div
                key={cat.id}
                className={`${styles.categoryCard} ${
                  isExpanded ? styles.cardExpanded : styles.cardCollapsed
                }`}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => {
                  setActiveIndex(index);
                  handleCardClick(cat);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActiveIndex(index);
                    handleCardClick(cat);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                aria-label={`Category: ${cat.title}`}
              >
                <div className={styles.cardImgWrap}>
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className={styles.cardImg}
                    loading="lazy"
                  />

                  {/* Gradient shadow for text readability */}
                  <div className={styles.cardOverlay} />

                  {/* Top Count Tag (Visible on expanded card) */}
                  <span className={styles.itemCountTag}>{cat.count}</span>

                  {/* Vertical Pill Badge (Visible on collapsed card) */}
                  <div className={styles.verticalPill}>
                    {cat.pillLabel}
                  </div>

                  {/* Expanded Content Overlay (Title + Choose From) */}
                  <div className={styles.expandedContent}>
                    <h3 className={styles.categoryTitle}>{cat.title}</h3>
                    <span className={styles.categoryAction}>
                      <span>{cat.subtitle}</span>
                      <ArrowUpRight size={14} className={styles.actionIcon} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
