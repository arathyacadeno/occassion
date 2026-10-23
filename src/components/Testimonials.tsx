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
    headline: "“Fresh flowers & on-time delivery”",
    quote:
      "Amazing collection of fresh flowers and wonderful customer service. Ordered a bouquet for an anniversary and it was delivered right on time. Highly recommended florist in Calicut!",
    name: "RAHUL DAS",
    rating: 5,
    quotePosition: "left",
  },
  {
    id: 2,
    headline: "“Best flower shop in Kozhikode!”",
    quote:
      "Best flower shop in Kozhikode! The decoration for our event was breathtaking. Very professional, creative, and attentive team at Occasions. Will definitely choose them again.",
    name: "SNEHA MENON",
    rating: 5,
    quotePosition: "right",
  },
  {
    id: 3,
    headline: "“Quality blooms & polite staff”",
    quote:
      "Very good experience. Quality flowers, elegant packing, and polite staff. Sreejesh was extremely helpful and accommodating. They truly know how to make occasions special.",
    name: "MOHAMMED AFSAL",
    rating: 5,
    quotePosition: "right",
  },
  {
    id: 4,
    headline: "“Prompt delivery & fresh orchids”",
    quote:
      "Prompt delivery and fresh orchids! Ordered online and got it delivered in Calicut within hours. Truly impressed with their quick service, communication, and floral freshness.",
    name: "DIVYA NAIR",
    rating: 5,
    quotePosition: "right",
  },
  {
    id: 5,
    headline: "“Breathtaking wedding decor”",
    quote:
      "Exceptional floral arrangements for our wedding reception. Everyone praised the stage decor and fresh bloom bouquets. Thank you Occasions - Do It With Flowers!",
    name: "FATHIMA ZAHRA",
    rating: 5,
    quotePosition: "right",
  },
  {
    id: 6,
    headline: "“Exotic flowers & reasonable prices”",
    quote:
      "Great variety of exotic flowers and fresh roses. Prices are reasonable and their shop location at YMCA Cross Road is very accessible. Outstanding floral artistry!",
    name: "ARUN KUMAR",
    rating: 5,
    quotePosition: "right",
  },
  {
    id: 7,
    headline: "“Polite service & stunning flowers”",
    quote:
      "Wonderful experience with Occasions! Sreejesh was extremely polite and accommodating. The flower arrangement was fresh, beautifully styled, and delivered right on time in Calicut.",
    name: "ANANTHU KRISHNAN",
    rating: 5,
    quotePosition: "left",
  },
  {
    id: 8,
    headline: "“Gorgeous birthday bouquet surprise”",
    quote:
      "Ordered a birthday bouquet and cake surprise for my parents in Kozhikode. The flowers were gorgeous, vibrant, and lasted for days. Seamless communication via WhatsApp!",
    name: "DR. NEHA MATHEW",
    rating: 5,
    quotePosition: "right",
  },
  {
    id: 9,
    headline: "“Urgent delivery handled perfectly”",
    quote:
      "Needed urgent flower delivery near Beach Road. Sreejesh went out of his way to arrange a stunning fresh red roses basket within a couple of hours. Outstanding dedication!",
    name: "DEEPAK NAMBIAR",
    rating: 5,
    quotePosition: "right",
  },
  {
    id: 10,
    headline: "“Most reliable florist in Calicut”",
    quote:
      "Hands down the most reliable flower shop in Calicut. Their flower baskets and custom flower boxes are crafted with so much care and elegance. 10/10 service every time!",
    name: "AISWARYA RAJ",
    rating: 5,
    quotePosition: "right",
  },
  {
    id: 11,
    headline: "“Lush engagement stage backdrop”",
    quote:
      "Occasions designed our engagement stage floral backdrop and bridal bouquets. The blooms were lush, fragrant, and stayed fresh throughout the event. Best event florists in town!",
    name: "MIDHUN GEORGE",
    rating: 5,
    quotePosition: "left",
  },
  {
    id: 12,
    headline: "“Neat packaging & punctual delivery”",
    quote:
      "Beautifully arranged carnations and lilies for our housewarming celebration. The packaging was neat, and delivery was punctually handled. Highly recommended!",
    name: "ROSHNI P.",
    rating: 5,
    quotePosition: "right",
  },
  {
    id: 13,
    headline: "“Consistently fresh blooms”",
    quote:
      "Consistently great quality whenever I order flowers in Kozhikode. Very friendly service, prompt response on WhatsApp, and always fresh, fragrant blooms.",
    name: "GOKUL KRISHNA",
    rating: 5,
    quotePosition: "right",
  },
  {
    id: 14,
    headline: "“Top-notch florist in Kozhikode”",
    quote:
      "Top-notch florist in Kozhikode. Excellent variety of roses, orchids, and lilies, long-lasting freshness, and courteous staff. They make gifting so effortless.",
    name: "SREEJESH V.",
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

          {/* Dots showing all testimonials */}
          <div className={styles.paginationArea}>
            <div className={styles.dotsWrapper}>
              {TESTIMONIALS_DATA.map((item, i) => {
                const activeIndex = ((active % total) + total) % total;
                const isActive = i === activeIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`${styles.dot} ${isActive ? styles.activeDot : ""}`}
                    onClick={() => {
                      goTo((curr) => {
                        const currentMod = ((curr % total) + total) % total;
                        return curr + (i - currentMod);
                      });
                    }}
                    aria-label={`Go to review ${i + 1} of ${total} by ${item.name}`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}