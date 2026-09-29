"use client";

import React, { useState, useEffect, useRef } from "react";
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

const OCCASIONS_DATA: OccasionCardItem[] = [
  {
    id: "birthday",
    name: "Birthday",
    image: "/images/occasion-birthday.jpg",
    href: "/flower-bouquets?occasion=birthday",
    staggerClass: styles.staggerLeft,
    delay: "0.08s",
    whatsappMessage:
      "Hello Occassions Florist Calicut, I would like to order fresh flowers for a Birthday celebration.",
  },
  {
    id: "anniversary",
    name: "Anniversary",
    image: "/images/occasion-congratulations.jpg",
    href: "/flower-bouquets?occasion=anniversary",
    staggerClass: styles.staggerCenter,
    delay: "0.22s",
    whatsappMessage:
      "Hello Occassions Florist Calicut, I would like to explore luxury flowers for an Anniversary.",
  },
  {
    id: "congratulations",
    name: "Congratulations",
    image: "/images/occasion-best-wishes.jpg",
    href: "/flower-bouquets?occasion=congratulations",
    staggerClass: styles.staggerRight,
    delay: "0.36s",
    whatsappMessage:
      "Hello Occassions Florist Calicut, I would like to send Congratulations flower bouquets.",
  },
];

export default function ShopByOccasion() {
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
          <h2 className={styles.mainHeading}>Shop by Occasion</h2>
          <p className={styles.subHeading}>Flowers for every special moment</p>
        </div>

        {/* 3 Staggered Occasion Cards Matching Reference */}
        <div className={styles.gridContainer}>
          {OCCASIONS_DATA.map((item) => (
            <OccasionCard key={item.id} item={item} isVisible={isVisible} />
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
        {/* Large Rectangular Image Frame with Softly Rounded Corners */}
        <div className={styles.imageFrame}>
          <img
            src={item.image}
            alt={item.name}
            className={styles.cardImage}
            loading="lazy"
          />
        </div>

        {/* Elegant Gold/Mustard Pill-Shaped Label with Dotted Rounded Outline */}
        <div className={styles.pillContainer}>
          <div className={styles.pillDottedOuter}>
            <span className={styles.pillSolidInner}>{item.name}</span>
          </div>
        </div>
      </article>
    </a>
  );
}
