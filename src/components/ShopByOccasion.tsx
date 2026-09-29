"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./ShopByOccasion.module.css";

interface OccasionCardItem {
  id: string;
  name: string;
  image: string;
  href: string;
  staggerClass: string;
  delay: string;
  whatsappMessage: string;
}

const OCCASIONS_SLIDES: OccasionCardItem[][] = [
  // Slide 1 (3 cards)
  [
    {
      id: "birthday",
      name: "Birthday",
      image: "/images/occasion-birthday.jpg",
      href: "/flower-bouquets?occasion=birthday",
      staggerClass: styles.staggerLeft,
      delay: "0.06s",
      whatsappMessage:
        "Hello Occassions Florist Calicut, I would like to order fresh flowers for a Birthday celebration.",
    },
    {
      id: "anniversary",
      name: "Anniversary",
      image: "/images/occasion-anniversary.jpg",
      href: "/flower-bouquets?occasion=anniversary",
      staggerClass: styles.staggerCenter,
      delay: "0.18s",
      whatsappMessage:
        "Hello Occassions Florist Calicut, I would like to explore luxury flowers for an Anniversary.",
    },
    {
      id: "congratulations",
      name: "Congratulations",
      image: "/images/occasion-congratulations.jpg",
      href: "/flower-bouquets?occasion=congratulations",
      staggerClass: styles.staggerRight,
      delay: "0.3s",
      whatsappMessage:
        "Hello Occassions Florist Calicut, I would like to send Congratulations flower bouquets.",
    },
  ],
  // Slide 2 (3 cards)
  [
    {
      id: "best-wishes",
      name: "Best Wishes",
      image: "/images/occasion-best-wishes-sun.jpg",
      href: "/flower-bouquets?occasion=best-wishes",
      staggerClass: styles.staggerLeft,
      delay: "0.06s",
      whatsappMessage:
        "Hello Occassions Florist Calicut, I would like to order cheerful Best Wishes flowers.",
    },
    {
      id: "wedding",
      name: "Wedding",
      image: "/images/occasion-wedding.jpg",
      href: "/flower-bouquets?occasion=wedding",
      staggerClass: styles.staggerCenter,
      delay: "0.18s",
      whatsappMessage:
        "Hello Occassions Florist Calicut, I would like to inquire about Wedding floral decor and bridal bouquets.",
    },
    {
      id: "thank-you",
      name: "Thank You",
      image: "/images/occasion-thank-you.jpg",
      href: "/flower-bouquets?occasion=thank-you",
      staggerClass: styles.staggerRight,
      delay: "0.3s",
      whatsappMessage:
        "Hello Occassions Florist Calicut, I would like to send a Thank You flower arrangement.",
    },
  ],
];

export default function ShopByOccasion() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
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
        threshold: 0.08,
        rootMargin: "0px 0px -30px 0px",
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const handleSlideChange = (nextIndex: number) => {
    if (isTransitioning || nextIndex === currentSlide) return;
    setIsTransitioning(true);
    setCurrentSlide(nextIndex);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 400);
  };

  const handleNext = () => {
    handleSlideChange((currentSlide + 1) % OCCASIONS_SLIDES.length);
  };

  const handlePrev = () => {
    handleSlideChange(
      (currentSlide - 1 + OCCASIONS_SLIDES.length) % OCCASIONS_SLIDES.length
    );
  };

  return (
    <section
      ref={sectionRef}
      className={styles.sectionWrapper}
      id="occasions"
      aria-label="Shop by Occasion"
    >
      <div className={styles.container}>
        {/* Section Header with Floral Divider Structure */}
        <div
          className={`${styles.sectionHeader} ${
            isVisible ? styles.headerInView : ""
          }`}
        >
          <span className={styles.subtitle}>Special Moments</span>
          <h2 className={styles.mainTitle}>Shop By Occasion</h2>

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

        {/* 3-Card Carousel Container */}
        <div className={styles.carouselContainer}>
          {/* Previous Button */}
          <button
            type="button"
            className={`${styles.navBtn} ${styles.prevBtn}`}
            onClick={handlePrev}
            aria-label="Previous occasion cards"
          >
            <ChevronLeft size={22} strokeWidth={2} />
          </button>

          {/* Exactly 3 Cards Grid */}
          <div
            className={`${styles.gridContainer} ${
              isTransitioning ? styles.slideTransition : ""
            }`}
            key={currentSlide}
          >
            {OCCASIONS_SLIDES[currentSlide].map((item) => (
              <OccasionCard key={item.id} item={item} isVisible={isVisible} />
            ))}
          </div>

          {/* Next Button */}
          <button
            type="button"
            className={`${styles.navBtn} ${styles.nextBtn}`}
            onClick={handleNext}
            aria-label="Next occasion cards"
          >
            <ChevronRight size={22} strokeWidth={2} />
          </button>
        </div>

        {/* Slide Indicator Dots */}
        <div
          className={styles.paginationDots}
          role="tablist"
          aria-label="Occasion slides"
        >
          {OCCASIONS_SLIDES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              role="tab"
              aria-selected={currentSlide === idx}
              className={`${styles.dot} ${
                currentSlide === idx ? styles.activeDot : ""
              }`}
              onClick={() => handleSlideChange(idx)}
              aria-label={`Go to occasion slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function OccasionCard({
  item,
  isVisible,
}: {
  item: OccasionCardItem;
  isVisible: boolean;
}) {
  const whatsappUrl = `https://wa.me/918606464700?text=${encodeURIComponent(
    item.whatsappMessage
  )}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`${styles.cardLink} ${item.staggerClass}`}
      aria-label={`Shop flowers for ${item.name}`}
    >
      <article
        className={`${styles.card} ${isVisible ? styles.cardVisible : ""}`}
        style={{ "--anim-delay": item.delay } as React.CSSProperties}
      >
        {/* Large Rounded Image Frame */}
        <div className={styles.imageFrame}>
          <img
            src={item.image}
            alt={item.name}
            className={styles.cardImage}
            loading="lazy"
          />
        </div>

        {/* Gold/Mustard Pill Label with Dotted Rounded Outline */}
        <div className={styles.pillContainer}>
          <div className={styles.pillDottedOuter}>
            <span className={styles.pillSolidInner}>{item.name}</span>
          </div>
        </div>
      </article>
    </a>
  );
}
