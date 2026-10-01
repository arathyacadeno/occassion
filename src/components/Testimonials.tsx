"use client";

import React, { useState, useEffect } from "react";
import styles from "./Testimonials.module.css";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

export interface TestimonialItem {
  id: number;
  headline?: string;
  quote: string;
  name: string;
  rating: number;
  quotePosition?: "left" | "right";
}

const TESTIMONIALS_DATA: TestimonialItem[] = [
  {
    id: 1,
    quote:
      "The quality was amazing. The colors were soft and beautiful, and the arrangement looked very premium. Everything arrived safely and exactly as shown.",
    name: "MEERA S.",
    rating: 4,
    quotePosition: "left",
  },
  {
    id: 2,
    headline: "“Absolutely beautiful flowers!”",
    quote:
      "The bouquet was even more beautiful in person. Every flower looked fresh and carefully arranged. The packaging was elegant, and the delivery was right on time. It made the birthday celebration extra special.",
    name: "ANANYA R.",
    rating: 4,
    quotePosition: "right",
  },
  {
    id: 3,
    quote:
      "I ordered these for our anniversary and couldn't have been happier. The flowers were fresh, vibrant, and arranged beautifully. My wife absolutely loved them!",
    name: "RAHUL M.",
    rating: 4,
    quotePosition: "right",
  },
  {
    id: 4,
    headline: "“Breathtaking bridal arrangements”",
    quote:
      "Occassions made our wedding day magical. The bridal bouquet was so fresh and fragrant, and the custom orchids lasted for days after the event. Truly unmatched florist artistry in Kozhikode.",
    name: "PRIYA K.",
    rating: 5,
    quotePosition: "right",
  },
  {
    id: 5,
    headline: "“Prompt delivery & fresh blooms”",
    quote:
      "Ordered a morning birthday surprise hamper and it was delivered right on time. The chocolate cake was delectable and the flowers smelled divine. Superb service!",
    name: "ARJUN K.",
    rating: 5,
    quotePosition: "right",
  },
];

function QuoteMarks({ className }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 64 56"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M22 6 C28.627 6 34 11.373 34 18 C34 23.36 30.47 27.89 25.6 29.4 C25.1 34.6 21.8 41.5 14.2 47.8 C13.3 48.5 12 48.4 11.2 47.5 C10.5 46.6 10.6 45.3 11.5 44.6 C17.8 39.4 20.3 33.7 20.7 29.1 C14.6 27.8 10 23.4 10 18 C10 11.373 15.373 6 22 6 Z" />
      <path d="M50 6 C56.627 6 62 11.373 62 18 C62 23.36 58.47 27.89 53.6 29.4 C53.1 34.6 49.8 41.5 42.2 47.8 C41.3 48.5 40 48.4 39.2 47.5 C38.5 46.6 38.6 45.3 39.5 44.6 C45.8 39.4 48.3 33.7 48.7 29.1 C42.6 27.8 38 23.4 38 18 C38 11.373 43.373 6 50 6 Z" />
    </svg>
  );
}

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState<number>(1);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const total = TESTIMONIALS_DATA.length;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  // Subtle auto-rotate every 6.5 seconds when not interacting
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      handleNext();
    }, 6500);
    return () => clearInterval(timer);
  }, [isPaused, total]);

  const leftIndex = (currentIndex - 1 + total) % total;
  const centerIndex = currentIndex;
  const rightIndex = (currentIndex + 1) % total;

  const leftItem = TESTIMONIALS_DATA[leftIndex];
  const centerItem = TESTIMONIALS_DATA[centerIndex];
  const rightItem = TESTIMONIALS_DATA[rightIndex];

  const renderStars = (rating: number, isCenter: boolean) => (
    <div className={styles.starsRow} aria-label={`${rating} out of 5 stars`}>
      {[...Array(5)].map((_, i) => {
        const isFilled = i < rating;
        return (
          <Star
            key={i}
            size={18}
            className={`${styles.starIcon} ${
              isFilled
                ? isCenter
                  ? styles.starCenterFilled
                  : styles.starSideFilled
                : styles.starEmpty
            }`}
          />
        );
      })}
    </div>
  );

  return (
    <section className={styles.sectionWrapper} id="testimonials">
      <div className={styles.container}>
        {/* Section Header matching Image 2 */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.mainTitle}>Loved in Every Bloom</h2>
          <p className={styles.subtitle}>
            Real words from the people who received a little more happiness through our flowers.
          </p>
        </div>

        {/* 3-Card Carousel Container */}
        <div
          className={styles.carouselContainer}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Navigation Prev Button */}
          <button
            type="button"
            className={`${styles.navBtn} ${styles.navBtnLeft}`}
            onClick={handlePrev}
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={22} strokeWidth={2.4} />
          </button>

          {/* Cards Track */}
          <div className={styles.cardsTrack}>
            {/* Left Card */}
            <div
              className={`${styles.card} ${styles.sideCard} ${styles.leftCard}`}
              onClick={handlePrev}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handlePrev();
              }}
              aria-label={`View testimonial from ${leftItem.name}`}
            >
              {renderStars(leftItem.rating, false)}
              <p className={styles.cardQuote}>{leftItem.quote}</p>
              <div className={styles.authorName}>{leftItem.name}</div>
              <QuoteMarks className={`${styles.quoteMark} ${styles.quoteMarkLeft}`} />
            </div>

            {/* Center Card */}
            <div className={`${styles.card} ${styles.centerCard}`}>
              {renderStars(centerItem.rating, true)}
              {centerItem.headline && (
                <h3 className={styles.cardHeadline}>{centerItem.headline}</h3>
              )}
              <p className={styles.cardQuote}>{centerItem.quote}</p>
              <div className={styles.authorName}>{centerItem.name}</div>
              <QuoteMarks
                className={`${styles.quoteMark} ${styles.quoteMarkRight} ${styles.quoteMarkCenter}`}
              />
            </div>

            {/* Right Card */}
            <div
              className={`${styles.card} ${styles.sideCard} ${styles.rightCard}`}
              onClick={handleNext}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleNext();
              }}
              aria-label={`View testimonial from ${rightItem.name}`}
            >
              {renderStars(rightItem.rating, false)}
              <p className={styles.cardQuote}>{rightItem.quote}</p>
              <div className={styles.authorName}>{rightItem.name}</div>
              <QuoteMarks className={`${styles.quoteMark} ${styles.quoteMarkRight}`} />
            </div>
          </div>

          {/* Navigation Next Button */}
          <button
            type="button"
            className={`${styles.navBtn} ${styles.navBtnRight}`}
            onClick={handleNext}
            aria-label="Next testimonial"
          >
            <ChevronRight size={22} strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </section>
  );
}
