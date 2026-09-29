"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import styles from "./ShopByFlowers.module.css";

interface FlowerCategory {
  id: string;
  title: string;
  description: string;
  image: string;
  href: string;
}

const FLOWER_CATEGORIES: FlowerCategory[] = [
  {
    id: "roses",
    title: "Roses",
    description: "Romantic & timeless",
    image: "/images/flowers-roses-nobg.png",
    href: "/flower-bouquets",
  },
  {
    id: "lilies",
    title: "Lilies",
    description: "Elegant & graceful",
    image: "/images/flowers-lilies-nobg.png",
    href: "/flower-bouquets",
  },
  {
    id: "sunflowers",
    title: "Sunflowers",
    description: "Bright & joyful",
    image: "/images/flowers-sunflowers-nobg.png",
    href: "/flower-bouquets",
  },
  {
    id: "tulips",
    title: "Tulips",
    description: "Sweet & charming",
    image: "/images/flowers-tulips-nobg.png",
    href: "/flower-bouquets",
  },
  {
    id: "carnations",
    title: "Carnations",
    description: "Charming & delicate",
    image: "/images/flowers-carnations-nobg.png",
    href: "/flower-bouquets",
  },
  {
    id: "peonies",
    title: "Peonies",
    description: "Lush & enchanting",
    image: "/images/flowers-peonies-nobg.png",
    href: "/flower-bouquets",
  },
  {
    id: "gerberas",
    title: "Gerberas",
    description: "Joyful & radiant",
    image: "/images/flowers-gerberas-nobg.png",
    href: "/flower-bouquets",
  },
  {
    id: "pastel-tulips",
    title: "Pastel Tulips",
    description: "Sweet & poetic",
    image: "/images/flowers-pasteltulips-nobg.png",
    href: "/flower-bouquets",
  },
];

// Duplicate items twice so the infinite loop flows seamlessly to the right
const ALL_CARDS = [...FLOWER_CATEGORIES, ...FLOWER_CATEGORIES];

export default function ShopByFlowers() {
  const [isPaused, setIsPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const handleNudge = (direction: "left" | "right") => {
    if (!viewportRef.current) return;
    const scrollAmount = direction === "right" ? 300 : -300;
    viewportRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  return (
    <section
      className={styles.sectionWrapper}
      id="shop-by-flowers"
      aria-label="Shop by Flowers"
    >
      <div className={styles.container}>
        {/* ================= SECTION HEADER ================= */}
        <div className={styles.sectionHeader}>
          <span className={styles.subtitle}>CURATED BLOOMS</span>
          <h2 className={styles.mainTitle}>Shop By Flowers</h2>

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

        {/* ================= CAROUSEL WRAPPER WITH CONTROLS ================= */}
        <div className={styles.carouselOuter}>
          {/* Circular Left Arrow */}
          <button
            type="button"
            className={`${styles.navBtn} ${styles.prevBtn}`}
            onClick={() => handleNudge("left")}
            aria-label="Previous flower categories"
          >
            <ChevronLeft size={22} strokeWidth={2} />
          </button>

          {/* Slider Viewport with Edge Fade Mask & Continuous Auto-Slide to Right */}
          <div
            ref={viewportRef}
            className={styles.sliderViewport}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div
              ref={trackRef}
              className={styles.sliderTrack}
              style={{ animationPlayState: isPaused ? "paused" : "running" }}
            >
              {ALL_CARDS.map((cat, idx) => (
                <div
                  key={`${cat.id}-${idx}`}
                  className={styles.flowerItem}
                >
                  <div className={styles.itemInner}>
                    {/* Subtle light-pink circular/oval background behind bouquet */}
                    <div className={styles.backdropWrapper}>
                      <div className={styles.pinkOvalGlow} />

                      {/* Floating Bouquet Wrapper */}
                      <div className={styles.floatContainer}>
                        <img
                          src={cat.image}
                          alt={`${cat.title} bouquet`}
                          className={styles.bouquetImg}
                          loading={idx < 6 ? "eager" : "lazy"}
                        />
                      </div>
                    </div>

                    {/* Flower Information */}
                    <div className={styles.infoArea}>
                      <h3 className={styles.flowerTitle}>{cat.title}</h3>
                      <p className={styles.flowerDesc}>{cat.description}</p>

                      {/* Small circular pink outlined arrow button */}
                      <Link
                        href={cat.href}
                        className={styles.arrowButton}
                        aria-label={`Shop ${cat.title} bouquets`}
                      >
                        <ArrowRight size={15} strokeWidth={2.2} />
                      </Link>
                    </div>
                  </div>

                  {/* Thin vertical dotted separator between categories */}
                  <div className={styles.dottedSeparator} aria-hidden="true" />
                </div>
              ))}
            </div>
          </div>

          {/* Circular Right Arrow */}
          <button
            type="button"
            className={`${styles.navBtn} ${styles.nextBtn}`}
            onClick={() => handleNudge("right")}
            aria-label="Next flower categories"
          >
            <ChevronRight size={22} strokeWidth={2} />
          </button>
        </div>
      </div>
    </section>
  );
}
