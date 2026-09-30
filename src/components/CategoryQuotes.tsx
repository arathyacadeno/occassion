"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./CategoryQuotes.module.css";

export interface CategoryQuoteItem {
  id: number;
  title: string;
  body: string;
  author: string;
  rating: number;
}

const DEFAULT_QUOTES: CategoryQuoteItem[] = [
  {
    id: 1,
    title: "“Absolutely beautiful flowers!”",
    body: "The bouquet was even more beautiful in person. Every flower looked fresh and carefully arranged. The packaging was elegant, and the delivery was right on time. It made the birthday celebration extra special.",
    author: "ANANYA R.",
    rating: 5,
  },
  {
    id: 2,
    title: "“Exceeded all expectations!”",
    body: "I ordered these for our anniversary and couldn't have been happier. The flowers were fresh, vibrant, and arranged beautifully. My wife absolutely loved them! Will order again soon.",
    author: "RAHUL M.",
    rating: 5,
  },
  {
    id: 3,
    title: "“Pure elegance & prompt service”",
    body: "The quality was amazing. The colors were soft and beautiful, and the arrangement looked very premium. Everything arrived safely and exactly as shown on the website.",
    author: "MEERA S.",
    rating: 4,
  },
  {
    id: 4,
    title: "“The freshest blooms in town”",
    body: "Every single stem lasted over a week and filled our entire living room with a lovely sweet fragrance. Outstanding florist artistry and attentive support when ordering.",
    author: "PRIYA K.",
    rating: 5,
  },
  {
    id: 5,
    title: "“A delightful surprise gift”",
    body: "Sent this arrangement to my mother for her retirement celebration. She was moved to tears by how grand and cheerful the design was. Truly a five-star experience!",
    author: "VIKRAM S.",
    rating: 5,
  },
];

interface CategoryQuotesProps {
  title?: string;
  subtitle?: string;
  quotes?: CategoryQuoteItem[];
}

export default function CategoryQuotes({
  title = "Loved in Every Bloom",
  subtitle = "Real words from the people who received a little more happiness through our flowers.",
  quotes = DEFAULT_QUOTES,
}: CategoryQuotesProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const total = quotes.length;

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  }, [total]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  // Auto-advance every 5.5s unless hovered
  useEffect(() => {
    if (isPaused || total <= 1) return;
    const interval = setInterval(handleNext, 5500);
    return () => clearInterval(interval);
  }, [isPaused, total, handleNext]);

  // Indices for 3 visible cards: left, center, right
  const prevIndex = (activeIndex === 0 ? total - 1 : activeIndex - 1) % total;
  const nextIndex = (activeIndex + 1) % total;

  const prevItem = quotes[prevIndex];
  const activeItem = quotes[activeIndex];
  const nextItem = quotes[nextIndex];

  return (
    <section
      className={styles.sectionWrapper}
      aria-label="Customer Testimonials"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>

        {/* Carousel */}
        <div className={styles.carouselWrapper}>
          {/* Previous Arrow Button */}
          <button
            type="button"
            className={`${styles.navBtn} ${styles.prevBtn}`}
            onClick={handlePrev}
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={22} strokeWidth={2.2} />
          </button>

          {/* 3-Card Layout */}
          <div className={styles.cardsTrack}>
            {/* Left Card (clickable to cycle) */}
            <div
              className={`${styles.card} ${styles.sideCard}`}
              onClick={handlePrev}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handlePrev()}
              aria-label={`View review by ${prevItem.author}`}
            >
              <div className={styles.starsRow} aria-hidden="true">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < prevItem.rating ? styles.starFilled : styles.starEmpty
                    }
                  />
                ))}
              </div>
              <p className={styles.cardBody}>{prevItem.body}</p>
              <span className={styles.cardAuthor}>{prevItem.author}</span>
              <span className={styles.quoteMarkBottomLeft} aria-hidden="true">
                “
              </span>
            </div>

            {/* Center Active Card */}
            <article className={`${styles.card} ${styles.activeCard}`}>
              <div
                className={styles.starsRow}
                aria-label={`Rated ${activeItem.rating} out of 5 stars`}
              >
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={
                      i < activeItem.rating
                        ? styles.starFilled
                        : styles.starEmpty
                    }
                  />
                ))}
              </div>

              {activeItem.title && (
                <h3 className={styles.cardTitle}>{activeItem.title}</h3>
              )}

              <p className={styles.cardBody}>{activeItem.body}</p>

              <span className={styles.cardAuthor}>{activeItem.author}</span>

              {/* Decorative vibrant pink quotation marks at bottom right */}
              <span
                className={styles.quoteMarkBottomRight}
                aria-hidden="true"
              >
                ”
              </span>
            </article>

            {/* Right Card (clickable to cycle) */}
            <div
              className={`${styles.card} ${styles.sideCard}`}
              onClick={handleNext}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleNext()}
              aria-label={`View review by ${nextItem.author}`}
            >
              <div className={styles.starsRow} aria-hidden="true">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < nextItem.rating ? styles.starFilled : styles.starEmpty
                    }
                  />
                ))}
              </div>
              <p className={styles.cardBody}>{nextItem.body}</p>
              <span className={styles.cardAuthor}>{nextItem.author}</span>
              <span className={styles.quoteMarkBottomRight} aria-hidden="true">
                ”
              </span>
            </div>
          </div>

          {/* Next Arrow Button */}
          <button
            type="button"
            className={`${styles.navBtn} ${styles.nextBtn}`}
            onClick={handleNext}
            aria-label="Next testimonial"
          >
            <ChevronRight size={22} strokeWidth={2.2} />
          </button>
        </div>

        {/* Pagination Dots */}
        <div className={styles.dotsRow} role="tablist" aria-label="Testimonial slides">
          {quotes.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={idx === activeIndex}
              aria-label={`Go to slide ${idx + 1}`}
              className={`${styles.dot} ${
                idx === activeIndex ? styles.activeDot : ""
              }`}
              onClick={() => setActiveIndex(idx)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
