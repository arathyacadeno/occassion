"use client";

import React, { useRef, useState } from "react";
import styles from "./ShopByFlowers.module.css";

interface FlowerCategory {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  alt: string;
  href: string;
}

const FLOWER_CATEGORIES: FlowerCategory[] = [
  {
    id: "roses",
    title: "Roses",
    subtitle: "Romantic & timeless",
    image: "/images/flower-pink-roses.jpg",
    alt: "Luxurious bouquet of soft pink roses with dewy petals",
    href: "#roses",
  },
  {
    id: "white-roses",
    title: "White Roses",
    subtitle: "Pure & elegant",
    image: "/images/flower-white-roses.jpg",
    alt: "Graceful bridal bouquet of pure white and ivory roses",
    href: "#white-roses",
  },
  {
    id: "tulips",
    title: "Tulips",
    subtitle: "Fresh & graceful",
    image: "/images/flower-pink-tulips.jpg",
    alt: "Fresh vibrant bouquet of pastel pink French tulips",
    href: "#tulips",
  },
  {
    id: "lilies",
    title: "Lilies",
    subtitle: "Elegant & serene",
    image: "/images/flower-white-lilies.jpg",
    alt: "Aesthetic bouquet of magnificent pristine white Oriental lilies",
    href: "#lilies",
  },
  {
    id: "peonies",
    title: "Peonies",
    subtitle: "Lush & enchanting",
    image: "/images/farm-peonies-tall-large.jpg",
    alt: "Opulent lush pink Sarah Bernhardt peonies tied with satin ribbon",
    href: "#peonies",
  },
  {
    id: "ranunculus",
    title: "Ranunculus",
    subtitle: "Vibrant & artistic",
    image: "/images/farm-hand-bouquet-large.jpg",
    alt: "Vivid magenta ranunculus and artisanal hand-tied botanical arrangement",
    href: "#ranunculus",
  },
  {
    id: "gerberas",
    title: "Gerberas",
    subtitle: "Joyful & radiant",
    image: "/images/cat-birthday.jpg",
    alt: "Lively white gerberas paired with peach garden roses and eucalyptus",
    href: "#gerberas",
  },
  {
    id: "carnations",
    title: "Carnations",
    subtitle: "Charming & delicate",
    image: "/images/cat-friendship.jpg",
    alt: "Artisan peach carnations and garden rosebuds in presentation bag",
    href: "#carnations",
  },
  {
    id: "delphiniums",
    title: "Delphiniums",
    subtitle: "Tall & majestic",
    image: "/images/cat-seasonal-flowers.jpg",
    alt: "Majestic tall pink snapdragons and seasonal cottage blooms",
    href: "#delphiniums",
  },
  {
    id: "pastel-tulips",
    title: "Pastel Tulips",
    subtitle: "Sweet & poetic",
    image: "/images/farm-tulips-wrap-large.jpg",
    alt: "Spring pastel tulips bouquet gracefully wrapped in powder blush paper",
    href: "#pastel-tulips",
  },
];

export default function ShopByFlowers() {
  const [isPaused, setIsPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  // Duplicate items array twice so the infinite loop flows seamlessly to the right
  const allCards = [...FLOWER_CATEGORIES, ...FLOWER_CATEGORIES];

  return (
    <section className={styles.sectionWrapper} id="shop-by-flowers" aria-label="Shop by Flowers">
      {/* Section Header */}
      <div className={styles.sectionHeader}>
        <h2 className={styles.mainTitle}>Shop By Flowers</h2>
        <span className={styles.subtitle}>Curated Blooms</span>
      </div>

      {/* Slider Viewport with Edge Fade Mask */}
      <div
        className={styles.sliderViewport}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          ref={trackRef}
          className={styles.sliderTrack}
          style={{ animationPlayState: isPaused ? "paused" : "running" }}
        >
          {allCards.map((cat, idx) => (
            <a
              key={`${cat.id}-${idx}`}
              href={cat.href}
              className={styles.flowerCard}
              aria-label={`Shop ${cat.title} - ${cat.subtitle}`}
            >
              {/* Top Large Flower Image */}
              <div className={styles.imageContainer}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cat.image}
                  alt={cat.alt}
                  className={styles.flowerImage}
                  loading={idx < 4 ? "eager" : "lazy"}
                />
              </div>

              {/* Card Information */}
              <div className={styles.cardContent}>
                <div className={styles.textGroup}>
                  <h3 className={styles.cardTitle}>{cat.title}</h3>
                  <p className={styles.cardSubtitle}>{cat.subtitle}</p>
                </div>

                {/* Circular Arrow Button */}
                <div className={styles.arrowButton} aria-hidden="true">
                  <svg
                    className={styles.arrowIcon}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
