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
        {/* Section Header */}
        <div
          className={`${styles.sectionHeader} ${
            isVisible ? styles.headerInView : ""
          }`}
        >
          <h2 className={styles.mainHeading}>Shop By Occasion</h2>
          <p className={styles.subHeading}>Flowers for every special moment</p>
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
