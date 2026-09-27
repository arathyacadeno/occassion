"use client";

import React from "react";
import styles from "./StorySection.module.css";

export default function StorySection() {
  return (
    <section className={styles.storyWrapper} id="our-story" aria-label="Our Story">
      <div className={styles.storyCard}>
        {/* Crystal Clear 2x HD Background Asset:
            Authentic Florist Photograph, Swooping Organic Waves, Cherry Blossom Branch, and Botanical Leaf Branch */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/story-bg-hd.png"
          alt="Artisan florist arranging fresh bouquet inside floral boutique"
          className={styles.bgImage}
          loading="eager"
        />

        {/* Razor-Sharp Vector Typography Overlay */}
        <div className={styles.contentArea}>
          <div className={styles.headingGroup}>
            <span className={styles.headingTop}>FLOWERS THAT TELL</span>
            <div className={styles.headingBottomRow}>
              <span className={styles.headingBottom}>BEAUTIFUL STORIES</span>
              <svg
                className={styles.heartIcon}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          <p className={styles.description}>
            We source the finest blooms and design each bouquet with care to bring beauty, joy and meaning to every moment.
          </p>

          <a href="#shop-by-flowers" className={styles.storyBtn}>
            <span>OUR STORY</span>
            <span className={styles.arrow} aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
