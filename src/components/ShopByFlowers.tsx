"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./ShopByFlowers.module.css";

interface FlowerCategory {
  id: string;
  title: string;
  description: string;
  image: string;
  href: string;
}

const FLOWER_CATEGORIES: FlowerCategory[] = [
  { id: "roses", title: "Roses", description: "Romantic & timeless", image: "/images/flowers-roses-nobg.png", href: "/flowers/roses" },
  { id: "lilies", title: "Lilies", description: "Elegant & graceful", image: "/images/flowers-lilies-nobg.png", href: "/flowers/lilies" },
  { id: "sunflowers", title: "Sunflowers", description: "Bright & joyful", image: "/images/flowers-sunflowers-nobg.png", href: "/flowers/sunflowers" },
  { id: "tulips", title: "Tulips", description: "Sweet & charming", image: "/images/flowers-tulips-nobg.png", href: "/flowers/tulips" },
  { id: "carnations", title: "Carnations", description: "Charming & delicate", image: "/images/flowers-carnations-nobg.png", href: "/flowers/carnations" },
  { id: "peonies", title: "Peonies", description: "Lush & enchanting", image: "/images/flowers-peonies-nobg.png", href: "/flowers/peonies" },
  { id: "orchids", title: "Orchids", description: "Exotic & graceful", image: "/images/flowers-orchids-nobg.png", href: "/flowers/orchids" },
  { id: "pastel-tulips", title: "Pastel Tulips", description: "Sweet & poetic", image: "/images/flowers-pasteltulips-nobg.png", href: "/flowers/tulips" },
];

const ORIGINAL_COUNT = FLOWER_CATEGORIES.length;
const SPEED_PX_PER_SEC = 45; // increase for faster scrolling

// 3 sets so the loop is seamless in both directions
const EXTENDED_ITEMS = [
  ...FLOWER_CATEGORIES.map((item, idx) => ({ ...item, uniqueKey: `pre-${idx}` })),
  ...FLOWER_CATEGORIES.map((item, idx) => ({ ...item, uniqueKey: `orig-${idx}` })),
  ...FLOWER_CATEGORIES.map((item, idx) => ({ ...item, uniqueKey: `post-${idx}` })),
];

export default function ShopByFlowers() {
  const [visibleCount, setVisibleCount] = useState(4);

  const trackRef = useRef<HTMLDivElement | null>(null);
  const offsetRef = useRef(0);
  const pendingRef = useRef(0);
  const pausedRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const pointerStartX = useRef<number | null>(null);
  const isPointerDown = useRef(false);

  // Responsive visible count
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 560) setVisibleCount(2); // 2 cards on mobile
      else if (w < 860) setVisibleCount(2);
      else if (w < 1180) setVisibleCount(3);
      else setVisibleCount(4);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Width of one card + gap
  const getStep = useCallback(() => {
    const track = trackRef.current;
    if (!track || track.children.length < 2) return 0;
    const a = track.children[0] as HTMLElement;
    const b = track.children[1] as HTMLElement;
    return b.offsetLeft - a.offsetLeft;
  }, []);

  // Continuous right-to-left animation loop
  useEffect(() => {
    reducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let rafId = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(now - last, 50) / 1000;
      last = now;

      const track = trackRef.current;
      const step = getStep();

      if (track && step > 0) {
        const setLen = step * ORIGINAL_COUNT;

        if (offsetRef.current === 0) offsetRef.current = setLen;

        if (!pausedRef.current && !reducedMotionRef.current) {
          offsetRef.current += SPEED_PX_PER_SEC * dt;
        }

        if (Math.abs(pendingRef.current) > 0.5) {
          const move = pendingRef.current * 0.14;
          offsetRef.current += move;
          pendingRef.current -= move;
        } else if (pendingRef.current !== 0) {
          offsetRef.current += pendingRef.current;
          pendingRef.current = 0;
        }

        if (offsetRef.current >= setLen * 2) offsetRef.current -= setLen;
        if (offsetRef.current < setLen) offsetRef.current += setLen;

        track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [getStep]);

  const handleNext = () => {
    pendingRef.current += getStep();
  };
  const handlePrev = () => {
    pendingRef.current -= getStep();
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStartX.current = e.clientX;
    isPointerDown.current = true;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isPointerDown.current || pointerStartX.current === null) return;
    const diff = pointerStartX.current - e.clientX;
    isPointerDown.current = false;
    pointerStartX.current = null;

    if (diff > 45) handleNext();
    else if (diff < -45) handlePrev();
  };

  return (
    <section
      className={styles.sectionWrapper}
      id="shop-by-flowers"
      aria-label="Shop by Flowers"
    >
      <span id="flowers" style={{ position: "relative", top: "-100px", visibility: "hidden" }} />
      <div className={styles.container}>
        {/* ================= SECTION HEADER ================= */}
        <div className={styles.sectionHeader}>
          <span className={styles.subtitle}>Curated Blooms</span>
          <h2 className={styles.mainTitle}>Shop By Flowers</h2>

          <div className={styles.floralDivider} aria-hidden="true">
            <span className={styles.dividerLine} />
            <span className={styles.dividerIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="2.2" fill="#db2777" />
                <path d="M12 4.5C12 4.5 10 7.5 10 9.5C10 10.6 10.9 11.5 12 11.5C13.1 11.5 14 10.6 14 9.5C14 7.5 12 4.5 12 4.5Z" fill="#fbcfe8" stroke="#db2777" strokeWidth="0.8" />
                <path d="M12 19.5C12 19.5 10 16.5 10 14.5C10 13.4 10.9 12.5 12 12.5C13.1 12.5 14 13.4 14 14.5C14 16.5 12 19.5 12 19.5Z" fill="#fbcfe8" stroke="#db2777" strokeWidth="0.8" />
                <path d="M4.5 12C4.5 12 7.5 10 9.5 10C10.6 10 11.5 10.9 11.5 12C11.5 13.1 10.6 14 9.5 14C7.5 14 4.5 12 4.5 12Z" fill="#fbcfe8" stroke="#db2777" strokeWidth="0.8" />
                <path d="M19.5 12C19.5 12 16.5 10 14.5 10C13.4 10 12.5 10.9 12.5 12C12.5 13.1 13.4 14 14.5 14C16.5 14 19.5 12 19.5 12Z" fill="#fbcfe8" stroke="#db2777" strokeWidth="0.8" />
              </svg>
            </span>
            <span className={styles.dividerLine} />
          </div>
        </div>

        {/* ================= CAROUSEL ================= */}
        <div
          className={styles.carouselOuter}
          onMouseEnter={() => (pausedRef.current = true)}
          onMouseLeave={() => (pausedRef.current = false)}
        >
          <button
            type="button"
            className={`${styles.navBtn} ${styles.prevBtn}`}
            onClick={handlePrev}
            aria-label="Previous flower categories"
          >
            <ChevronLeft size={22} strokeWidth={2.2} />
          </button>

          <div
            className={styles.sliderViewport}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
          >
            <div
              ref={trackRef}
              className={styles.sliderTrack}
              style={
                {
                  "--visible-count": visibleCount,
                  "--gap": "28px",
                } as React.CSSProperties
              }
            >
              {EXTENDED_ITEMS.map((cat, idx) => (
                <div key={`${cat.uniqueKey}-${idx}`} className={styles.flowerItem}>
                  <Link
                    href={cat.href}
                    className={styles.itemInner}
                    aria-label={`Shop ${cat.title} bouquets`}
                    draggable={false}
                  >
                    <div className={styles.circleContainer}>
                      <img
                        src={cat.image}
                        alt={`${cat.title} bouquet`}
                        className={styles.bouquetImg}
                        draggable={false}
                      />
                    </div>
                    <div className={styles.infoArea}>
                      <h3 className={styles.flowerTitle}>{cat.title}</h3>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            className={`${styles.navBtn} ${styles.nextBtn}`}
            onClick={handleNext}
            aria-label="Next flower categories"
          >
            <ChevronRight size={22} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </section>
  );
}