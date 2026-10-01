"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./ShopByOccasion.module.css";

interface OccasionCardItem {
  id: string;
  name: string;
  image: string;
  href: string;
  whatsappMessage: string;
}

const OCCASIONS_ITEMS: OccasionCardItem[] = [
  {
    id: "birthday",
    name: "Birthday",
    image: "/images/occasion-birthday.jpg",
    href: "/flower-bouquets?occasion=birthday",
    whatsappMessage:
      "Hello Occassions Florist Calicut, I would like to order fresh flowers for a Birthday celebration.",
  },
  {
    id: "anniversary",
    name: "Anniversary",
    image: "/images/occasion-anniversary.jpg",
    href: "/flower-bouquets?occasion=anniversary",
    whatsappMessage:
      "Hello Occassions Florist Calicut, I would like to explore luxury flowers for an Anniversary.",
  },
  {
    id: "best-wishes",
    name: "Best Wishes",
    image: "/images/occasion-best-wishes.jpg",
    href: "/flower-bouquets?occasion=best-wishes",
    whatsappMessage:
      "Hello Occassions Florist Calicut, I would like to order cheerful Best Wishes flowers.",
  },
  {
    id: "thank-you",
    name: "Thank You",
    image: "/images/occasion-thank-you.jpg",
    href: "/flower-bouquets?occasion=thank-you",
    whatsappMessage:
      "Hello Occassions Florist Calicut, I would like to send a Thank You flower arrangement.",
  },
  {
    id: "wedding",
    name: "Wedding",
    image: "/images/occasion-wedding.jpg",
    href: "/flower-bouquets?occasion=wedding",
    whatsappMessage:
      "Hello Occassions Florist Calicut, I would like to inquire about Wedding floral decor and bridal bouquets.",
  },
  {
    id: "congratulations",
    name: "Congratulations",
    image: "/images/occasion-congratulations.png",
    href: "/flower-bouquets?occasion=congratulations",
    whatsappMessage:
      "Hello Occassions Florist Calicut, I would like to send Congratulations flower bouquets.",
  },
];

const ORIGINAL_COUNT = OCCASIONS_ITEMS.length; // 6
const START_INDEX = ORIGINAL_COUNT; // 6

// Create 3 sets (pre-clones, original, post-clones) for seamless infinite loop
const EXTENDED_ITEMS = [
  ...OCCASIONS_ITEMS.map((item, idx) => ({ ...item, uniqueKey: `pre-${idx}` })),
  ...OCCASIONS_ITEMS.map((item, idx) => ({ ...item, uniqueKey: `orig-${idx}` })),
  ...OCCASIONS_ITEMS.map((item, idx) => ({ ...item, uniqueKey: `post-${idx}` })),
];

export default function ShopByOccasion() {
  const [index, setIndex] = useState(START_INDEX);
  const [withTransition, setWithTransition] = useState(true);
  const [visibleCount, setVisibleCount] = useState(3);
  const [isVisible, setIsVisible] = useState(false);

  const sectionRef = useRef<HTMLElement | null>(null);
  const isTransitioningRef = useRef(false);
  const pointerStartX = useRef<number | null>(null);
  const isPointerDown = useRef(false);

  // Responsive visible count
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(1);
      } else if (window.innerWidth < 960) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Intersection observer for section entrance animation
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

  // Infinite Navigation: Next
  const handleNext = () => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setWithTransition(true);
    setIndex((prev) => prev + 1);
  };

  // Infinite Navigation: Prev
  const handlePrev = () => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setWithTransition(true);
    setIndex((prev) => prev - 1);
  };

  // Handle loop wrap-around on transition end without visual jump
  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    isTransitioningRef.current = false;

    if (index >= START_INDEX + ORIGINAL_COUNT) {
      // Reached post clones: teleport back by 6 items instantly
      setWithTransition(false);
      setIndex((prev) => prev - ORIGINAL_COUNT);
    } else if (index < START_INDEX) {
      // Reached pre clones: teleport forward by 6 items instantly
      setWithTransition(false);
      setIndex((prev) => prev + ORIGINAL_COUNT);
    }
  };

  // Re-enable transition after teleporting
  useEffect(() => {
    if (!withTransition) {
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setWithTransition(true);
        });
      });
      return () => cancelAnimationFrame(id);
    }
  }, [withTransition]);

  // Pointer / Touch Swipe Events
  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStartX.current = e.clientX;
    isPointerDown.current = true;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isPointerDown.current || pointerStartX.current === null) return;
    const diff = pointerStartX.current - e.clientX;
    isPointerDown.current = false;
    pointerStartX.current = null;

    if (diff > 45) {
      handleNext();
    } else if (diff < -45) {
      handlePrev();
    }
  };

  return (
    <section
      ref={sectionRef}
      className={styles.sectionWrapper}
      id="occasions"
      aria-label="Shop by Occasion"
    >
      <div className={styles.container}>
        {/* Section Header with Floral Divider */}
        <div
          className={`${styles.sectionHeader} ${
            isVisible ? styles.headerInView : ""
          }`}
        >
          <span className={styles.subtitle}>Special Moments</span>
          <h2 className={styles.mainTitle}>Shop By Occasion</h2>

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

        {/* Carousel Container with Always-Active Infinite Arrows */}
        <div className={styles.carouselContainer}>
          {/* Previous Button (Always Active in Infinite Loop) */}
          <button
            type="button"
            className={`${styles.navBtn} ${styles.prevBtn}`}
            onClick={handlePrev}
            aria-label="Previous occasion cards"
          >
            <ChevronLeft size={22} strokeWidth={2} />
          </button>

          {/* Viewport with generous padding so pill labels & shadows are never clipped */}
          <div
            className={styles.viewport}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
          >
            <div
              className={styles.track}
              onTransitionEnd={handleTransitionEnd}
              style={
                {
                  "--index": index,
                  "--visible-count": visibleCount,
                  transform: `translateX(calc(-1 * ${index} * ((100% + var(--gap, 40px)) / var(--visible-count, 3))))`,
                  transition: withTransition
                    ? "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
                    : "none",
                } as React.CSSProperties
              }
            >
              {EXTENDED_ITEMS.map((item, cardIdx) => {
                // Determine stagger based on current visible position:
                // When 3 cards are visible, the center card (visiblePos === 1) is lowered
                const visiblePos = cardIdx - index;
                const isCenter = visibleCount === 3 && visiblePos === 1;

                return (
                  <div
                    key={item.uniqueKey}
                    className={`${styles.cardWrapper} ${
                      isCenter ? styles.staggerCenter : styles.staggerSide
                    }`}
                  >
                    <OccasionCard item={item} isVisible={isVisible} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Next Button (Always Active in Infinite Loop) */}
          <button
            type="button"
            className={`${styles.navBtn} ${styles.nextBtn}`}
            onClick={handleNext}
            aria-label="Next occasion cards"
          >
            <ChevronRight size={22} strokeWidth={2} />
          </button>
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
      className={styles.cardLink}
      aria-label={`Shop flowers for ${item.name}`}
    >
      <article
        className={`${styles.card} ${isVisible ? styles.cardVisible : ""}`}
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

        {/* Gold / Pink Pill Label with Dotted Rounded Outline */}
        <div className={styles.pillContainer}>
          <div className={styles.pillDottedOuter}>
            <span className={styles.pillSolidInner}>{item.name}</span>
          </div>
        </div>
      </article>
    </a>
  );
}
