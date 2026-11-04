"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
  },
  {
    id: "new-year",
    title: "New Year Offer",
    subtitle: "Welcome the New Year with Floral Celebrations",
    image: "/images/banners/NEW YEAR.jpeg",
    href: "/occasions",
    accent: "#d97706"
  },
  {
    id: "mothers-day",
    title: "Mother's Day Special",
    subtitle: "Celebrate Mom with Heartfelt Blooms & Gifts",
    image: "/images/banners/mothers day.jpg.jpeg",
    href: "/occasions",
    accent: "#ec4899"
  }
];

export default function JoyfulGiftsBanner() {
  const [banners, setBanners] = useState<BannerSlide[]>(FESTIVE_BANNERS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  // Fetch dynamic banners from database CMS
  useEffect(() => {
    fetch("/api/homepage")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.banners) && data.banners.length > 0) {
          const dynamicBanners: BannerSlide[] = data.banners.map((b: any) => {
            const badgeOrTitle = ((b.badge || "") + " " + (b.title || "") + " " + (b.id || "")).toLowerCase();
            const accent = badgeOrTitle.includes("diwali")
              ? "#d97706"
              : badgeOrTitle.includes("xmas") || badgeOrTitle.includes("love")
              ? "#dc2626"
              : badgeOrTitle.includes("mother")
              ? "#ec4899"
              : badgeOrTitle.includes("year")
              ? "#f59e0b"
              : "#be185d";

            return {
              id: b.id,
              title: b.title || "Occasions Special",
              subtitle: b.subtitle || "Fresh Celebration Blooms",
              image: b.desktop_image,
              href: b.button_link || "/occasions",
              accent,
            };
          });
          setBanners(dynamicBanners);
        }
      })
      .catch((err) => {
        console.warn("Could not load dynamic homepage banners, using fallback", err);
      });
  }, []);

  const total = banners.length;

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % (total || 1));
  }, [total]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + (total || 1)) % (total || 1));
  }, [total]);

  // Continuous automatic scrolling every 3.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      goToNext();
    }, 3500);

    return () => clearInterval(timer);
  }, [goToNext]);

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

  const currentSlide = banners[currentIndex] || FESTIVE_BANNERS[0];

  return (
    <section
      className={styles.sectionWrapper}
      aria-label="Festive Celebration Promotional Banners"
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
              boxShadow: `0 12px 32px ${currentSlide.accent || "#be185d"}26`
            }}
          >
            <div
              className={styles.slidesTrack}
              style={{
                transform: `translateX(-${currentIndex * 100}%)`
              }}
            >
              {banners.map((slide, idx) => (
                <Link
                  key={`${slide.id}-${idx}`}
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
          </div>
        </div>
      </div>
    </section>
  );
}
