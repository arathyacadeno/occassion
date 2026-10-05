"use client";

import React, { useState, useEffect, useRef } from "react";
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
      "Occasions made our wedding day magical. The bridal bouquet was so fresh and fragrant, and the custom orchids lasted for days after the event. Truly unmatched florist artistry in Kozhikode.",
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

const SLIDE_MS = 800;

function QuoteMarks({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <img src="/images/quote-mark.png" alt="" className={styles.quoteImg} />
      <img src="/images/quote-mark.png" alt="" className={styles.quoteImg} />
    </div>
  );
}

export default function Testimonials() {
  const total = TESTIMONIALS_DATA.length;

  // 3 copies for infinite loop: [clones][REAL][clones]
  const items = [
    ...TESTIMONIALS_DATA,
    ...TESTIMONIALS_DATA,
    ...TESTIMONIALS_DATA,
  ];

  // index of the active (focused) card inside the extended list
  const [active, setActive] = useState<number>(total + 1);
  const [animate, setAnimate] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // lock so rapid clicks can't push the track outside the cloned range
  const lockedRef = useRef<boolean>(false);
  const unlockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lockFor = () => {
    lockedRef.current = true;
    if (unlockTimer.current) clearTimeout(unlockTimer.current);
    // safety fallback in case transitionend never fires (e.g. hidden tab)
    unlockTimer.current = setTimeout(() => {
      lockedRef.current = false;
    }, SLIDE_MS + 150);
  };

  const goTo = (updater: (a: number) => number) => {
    if (lockedRef.current) return;
    lockFor();
    setActive(updater);
  };

  const handlePrev = () => goTo((a) => a - 1);
  const handleNext = () => goTo((a) => a + 1);

  // After the slide finishes, silently jump back into the middle copy
  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget || e.propertyName !== "transform") return;

    if (active >= total * 2) {
      setAnimate(false);
      setActive((a) => a - total);
    } else if (active < total) {
      setAnimate(false);
      setActive((a) => a + total);
    }

    lockedRef.current = false;
  };

  // Re-enable the transition after the silent jump
  useEffect(() => {
    if (animate) return;
    let id2 = 0;
    const id1 = requestAnimationFrame(() => {
      id2 = requestAnimationFrame(() => setAnimate(true));
    });
    return () => {
      cancelAnimationFrame(id1);
      cancelAnimationFrame(id2);
    };
  }, [animate]);

  // Auto-rotate every 6.5s (paused on hover)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      if (lockedRef.current) return;
      lockFor();
      setActive((a) => a + 1);
    }, 6500);
    return () => clearInterval(timer);
  }, [isPaused]);

  // Cleanup the unlock timer on unmount
  useEffect(() => {
    return () => {
      if (unlockTimer.current) clearTimeout(unlockTimer.current);
    };
  }, []);

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
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.mainTitle}>Loved in Every Bloom</h2>
          <p className={styles.subtitle}>
            Real words from the people who received a little more happiness
            through our flowers.
          </p>
        </div>

        {/* White Rounded Card */}
        <div className={styles.whiteCardWrapper}>
          <div
            className={styles.carouselContainer}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <button
              type="button"
              className={`${styles.navBtn} ${styles.navBtnLeft}`}
              onClick={handlePrev}
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={22} strokeWidth={2.4} />
            </button>

            {/* Clipping viewport */}
            <div className={styles.viewport}>
              <div
                className={`${styles.cardsTrack} ${animate ? "" : styles.noAnim}`}
                style={{ ["--active" as string]: active } as React.CSSProperties}
                onTransitionEnd={handleTransitionEnd}
              >
                {items.map((item, idx) => {
                  const isCenter = idx === active;
                  const position = isCenter
                    ? styles.activeCard
                    : idx < active
                    ? `${styles.inactiveCard} ${styles.leftCard}`
                    : `${styles.inactiveCard} ${styles.rightCard}`;

                  return (
                    <div
                      key={`${item.id}-${idx}`}
                      className={`${styles.card} ${position}`}
                      onClick={() => {
                        if (!isCenter) goTo(() => idx);
                      }}
                    >
                      {renderStars(item.rating, isCenter)}
                      {item.headline && (
                        <h3 className={styles.cardHeadline}>{item.headline}</h3>
                      )}
                      <p className={styles.cardQuote}>{item.quote}</p>
                      <div className={styles.authorName}>{item.name}</div>
                      <QuoteMarks
                        className={`${styles.quoteMark} ${styles.quoteMarkRight} ${
                          isCenter ? styles.quoteMarkCenter : ""
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

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
      </div>
    </section>
  );
}