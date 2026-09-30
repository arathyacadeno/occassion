"use client";

import React, { useState, useEffect, useCallback } from "react";
import styles from "./Testimonials.module.css";
import { Star, ArrowLeft, ArrowRight } from "lucide-react";

export interface TestimonialItem {
  id: number;
  quote: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
}

const TESTIMONIALS_DATA: TestimonialItem[] = [
  {
    id: 1,
    quote:
      "“I Had Such A Wonderful Experience At This Flower Shop. The Flowers Were Fresh, Beautifully Arranged, And Lasted Much Longer Than I Expected! The Staff Was Friendly, Attentive, And Helped Me Choose The Perfect Bouquet. I'll Definitely Come Back Again For Future Occasions!”",
    name: "James Anderson",
    role: "Architect",
    avatar: "/images/avatar-1.jpg",
    rating: 5,
  },
  {
    id: 2,
    quote:
      "“I Recently Bought Flowers From This Shop And Was Amazed By The Quality. The Bouquets Were Fresh, Beautifully Arranged, And Lasted Much Longer Than I Expected! The Staff Was Friendly, Helpful, And Truly Cared About Making Sure I Found The Perfect Flowers...”",
    name: "Oliver Watkins",
    role: "Architect",
    avatar: "/images/avatar-2.jpg",
    rating: 5,
  },
  {
    id: 3,
    quote:
      "“The Bouquets Here Are Always Fresh, Elegant, And Artfully Arranged For Every Occasion. I Really Appreciated The Friendly Service And The Expert Advice Provided By The Staff. I Will Definitely Be Coming Back And Recommending This Place To All My Friends!”",
    name: "John McGinn",
    role: "Architect",
    avatar: "/images/avatar-1.jpg",
    rating: 5,
  },
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [fadeState, setFadeState] = useState<"in" | "out">("in");
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const total = TESTIMONIALS_DATA.length;

  const changeSlide = useCallback(
    (newIndex: number) => {
      setFadeState("out");
      setTimeout(() => {
        setCurrentIndex(newIndex);
        setFadeState("in");
      }, 220);
    },
    []
  );

  const handleNext = useCallback(() => {
    changeSlide((currentIndex + 1) % total);
  }, [changeSlide, currentIndex, total]);

  const handlePrev = useCallback(() => {
    changeSlide((currentIndex - 1 + total) % total);
  }, [changeSlide, currentIndex, total]);

  // Gentle auto-slide every 7 seconds, pauses on hover
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      handleNext();
    }, 7000);

    return () => clearInterval(timer);
  }, [handleNext, isPaused]);

  const current = TESTIMONIALS_DATA[currentIndex];

  return (
    <section className={styles.sectionWrapper} id="testimonials">
      {/* Vertical meadow wildflowers along the left flank */}
      <div className={styles.meadowBgLeft} aria-hidden="true" />

      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <span className={styles.subtitle}>Kind Words</span>
          <h2 className={styles.mainTitle}>Testimonials</h2>

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

        <div
          className={styles.showcaseLayout}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Left Circular Dashed Arrow Button (←) */}
          <button
            type="button"
            className={styles.navBtnLeft}
            onClick={handlePrev}
            aria-label="Previous testimonial"
          >
            <ArrowLeft size={18} strokeWidth={1.8} />
          </button>

          {/* ================= CENTRAL OVAL CARD (FROM USER VIDEO) ================= */}
          <div className={styles.ovalCard}>
            {/* Watermark Quote Icon */}
            <span className={styles.quoteMarkWatermark} aria-hidden="true">
              “
            </span>

            {/* Active Testimonial Slide with Smooth Dissolve Animation */}
            <div
              className={`${styles.slideWrapper} ${
                fadeState === "in" ? styles.slideFadeIn : styles.slideFadeOut
              }`}
            >
              <p className={styles.quoteText}>{current.quote}</p>

              {/* Avatar with Gold Border */}
              <div className={styles.avatarWrap}>
                <img
                  src={current.avatar}
                  alt={current.name}
                  className={styles.avatarImg}
                />
              </div>

              {/* 5 Golden Amber Stars */}
              <div className={styles.starsRow} aria-label={`${current.rating} out of 5 stars`}>
                {[...Array(current.rating)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={styles.starIcon}
                  />
                ))}
              </div>

              {/* Author Name and Designation */}
              <div className={styles.authorMeta}>
                <span className={styles.authorName}>{current.name}</span>
                <span className={styles.authorDivider}>–</span>
                <span className={styles.authorRole}>{current.role}</span>
              </div>
            </div>
          </div>

          {/* Right Circular Filled Gold Arrow Button (→) */}
          <button
            type="button"
            className={styles.navBtnRight}
            onClick={handleNext}
            aria-label="Next testimonial"
          >
            <ArrowRight size={18} strokeWidth={2} />
          </button>
        </div>
      </div>
    </section>
  );
}
