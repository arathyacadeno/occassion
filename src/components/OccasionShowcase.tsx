"use client";

import React from "react";
import styles from "./OccasionShowcase.module.css";
import { OCCASIONS_LIST } from "@/data/bouquets";
import { ArrowRight } from "lucide-react";

interface OccasionShowcaseProps {
  onSelectOccasion?: (occasionId: string) => void;
}

export default function OccasionShowcase({ onSelectOccasion }: OccasionShowcaseProps) {
  const handleClick = (id: string) => {
    if (onSelectOccasion) {
      onSelectOccasion(id);
    }
    const catalog = document.getElementById("collections");
    if (catalog) {
      catalog.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className={styles.sectionWrapper} id="occasions">
      <div className="container">
        <div className={styles.headerArea}>
          <div className={styles.tagline}>Moments in Bloom</div>
          <h2 className={styles.title}>For Every Occasion</h2>
          <p className={styles.desc}>
            Whether honoring a milestone, professing deep devotion, or elevating an intimate dinner, our floral atelier crafts the quintessential bespoke tribute.
          </p>
        </div>

        <div className={styles.grid}>
          {OCCASIONS_LIST.map((item) => (
            <div
              key={item.id}
              className={styles.card}
              onClick={() => handleClick(item.id)}
              role="button"
              tabIndex={0}
              aria-label={`Explore ${item.name}`}
            >
              <img src={item.image} alt={item.name} className={styles.image} loading="lazy" />
              <div className={styles.gradientOverlay} />

              <div className={styles.content}>
                <span className={styles.count}>{item.count}</span>
                <h3 className={styles.cardTitle}>{item.name}</h3>
                <p className={styles.cardTagline}>{item.tagline}</p>
                <span className={styles.exploreLink}>
                  Explore Arrangements <ArrowRight size={13} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
