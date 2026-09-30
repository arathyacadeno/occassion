"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import styles from "./JoyfulGiftsBanner.module.css";

export interface BannerSlide {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  href: string;
  accent: string;
}

export const FESTIVE_BANNERS: BannerSlide[] = [
  {
    id: "xmas-special",
    title: "Xmas Special",
    subtitle: "Celebrate with Festive Gifts & Sweets",
    image: "/images/banners/love-romance.png",
    href: "/occasions",
    accent: "#dc2626"
  },
  {
    id: "diwali-offer",
    title: "Diwali Offer",
    subtitle: "Share Happiness, Lights & Gift Hampers",
    image: "/images/banners/dwali.jpg.jpeg",
    href: "/occasions",
    accent: "#d97706"
  }
];

export default function JoyfulGiftsBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  const total = FESTIVE_BANNERS.length;

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = (idx: number) => {
    setCurrentIndex(idx);
  };

  // Auto animation timer (advances every 4 seconds unless hovered/touched)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      goToNext();
    }, 4000);

    return () => clearInterval(timer);
  }, [isPaused, goToNext]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    const diff = touchStartXRef.current - touchEndXRef.current;
    if (diff > 45) {
      goToNext();
    } else if (diff < -45) {
      goToPrev();
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  const currentSlide = FESTIVE_BANNERS[currentIndex];

  return (
    <section
      className={styles.sectionWrapper}
      aria-label="Festive Celebration Promotional Banners"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className={styles.container}>
        <div className={styles.bannerCarousel}>
          {/* Slider viewport with dynamic festive glow */}
          <div
            className={styles.sliderViewport}
            style={{
              boxShadow: `0 12px 32px ${currentSlide.accent}26`
            }}
          >
            <div
              className={styles.slidesTrack}
              style={{
                transform: `translateX(-${currentIndex * 100}%)`
              }}
            >
              {FESTIVE_BANNERS.map((slide, idx) => (
                <Link
                  key={slide.id}
                  href={slide.href}
                  className={styles.slideLink}
                  aria-label={`${slide.title} - ${slide.subtitle}`}
                  tabIndex={idx === currentIndex ? 0 : -1}
                >
                  <img
                    src={slide.image}
                    alt={`${slide.title} - ${slide.subtitle}`}
                    className={styles.bannerImg}
                    loading={idx === 0 ? "eager" : "lazy"}
                  />
                </Link>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button
              type="button"
              className={`${styles.navButton} ${styles.prevButton}`}
              onClick={(e) => {
                e.preventDefault();
                goToPrev();
              }}
              aria-label="Previous festive banner"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            <button
              type="button"
              className={`${styles.navButton} ${styles.nextButton}`}
              onClick={(e) => {
                e.preventDefault();
                goToNext();
              }}
              aria-label="Next festive banner"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>

          {/* Dots Navigation */}
          <div className={styles.dotsWrapper} role="tablist" aria-label="Festive banner indicators">
            {FESTIVE_BANNERS.map((slide, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
                  className={`${styles.dot} ${isActive ? styles.activeDot : ""}`}
                  style={{
                    backgroundColor: isActive ? slide.accent : undefined
                  }}
                  onClick={() => goToSlide(idx)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
