"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./ShopByOccasion.module.css";

interface OccasionItem {
  id: string;
  name: string;
  image: string;
  href: string;
  staggerClass: string;
  delay: string;
  whatsappMessage: string;
}

const OCCASIONS: OccasionItem[] = [
  {
    id: "birthday",
    name: "Birthday",
    image: "/images/occasion-birthday.jpg",
    href: "/flower-bouquets?occasion=birthday",
    staggerClass: styles.staggerCard0,
    delay: "0.05s",
    whatsappMessage:
      "Hello Occassions Florist Calicut, I would like to order fresh flowers for a Birthday celebration.",
  },
  {
    id: "anniversary",
    name: "Anniversary",
    image: "/images/occasion-anniversary.jpg",
    href: "/flower-bouquets?occasion=anniversary",
    staggerClass: styles.staggerCard1,
    delay: "0.15s",
    whatsappMessage:
      "Hello Occassions Florist Calicut, I would like to explore luxury flowers for an Anniversary.",
  },
  {
    id: "congratulations",
    name: "Congratulations",
    image: "/images/occasion-congratulations.jpg",
    href: "/flower-bouquets?occasion=congratulations",
    staggerClass: styles.staggerCard2,
    delay: "0.25s",
    whatsappMessage:
      "Hello Occassions Florist Calicut, I would like to send Congratulations flower bouquets.",
  },
  {
    id: "best-wishes",
    name: "Best Wishes",
    image: "/images/occasion-best-wishes-sun.jpg",
    href: "/flower-bouquets?occasion=best-wishes",
    staggerClass: styles.staggerCard3,
    delay: "0.35s",
    whatsappMessage:
      "Hello Occassions Florist Calicut, I would like to order cheerful Best Wishes flowers.",
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
          <h2 className={styles.mainHeading}>Shop By Occasion</h2>
          <p className={styles.subHeading}>Flowers for every special moment</p>
        </div>

        {/* 4-Card Staggered Floral Grid */}
        <div className={styles.gridContainer}>
          {OCCASIONS.map((item) => (
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
  item: OccasionItem;
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
