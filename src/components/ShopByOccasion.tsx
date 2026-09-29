"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, MessageCircle } from "lucide-react";
import styles from "./ShopByOccasion.module.css";

interface OccasionCardItem {
  id: string;
  name: string;
  emoji: string;
  subtitle?: string;
  description: string;
  image: string;
  tag: string;
  delay: string;
  whatsappMessage: string;
}

const OCCASIONS_DATA: OccasionCardItem[] = [
  {
    id: "anniversary",
    name: "Anniversary",
    emoji: "💕",
    subtitle: "Celebrate Timeless Love",
    description: "Romantic scarlet roses, luxury champagne silk wraps, and bespoke celebration cakes.",
    image: "/images/cake-anniversary-maroon-gold.png",
    tag: "Romantic Keepsake",
    delay: "60ms",
    whatsappMessage: "Hello Occassions Florist Calicut, I would like to explore your Anniversary flowers and cakes collection.",
  },
  {
    id: "birthday",
    name: "Birthday",
    emoji: "🎂",
    subtitle: "Make Their Day Sparkle",
    description: "Cheerful pastel butterfly cakes, vibrant gerbera baskets, and festive designer bouquets.",
    image: "/images/cake-pink-butterfly-birthday.png",
    tag: "Celebration Favorite",
    delay: "130ms",
    whatsappMessage: "Hello Occassions Florist Calicut, I would like to order a Birthday bouquet and cake.",
  },
  {
    id: "wedding",
    name: "Wedding",
    emoji: "💍",
    subtitle: "Elegance for the Big Day",
    description: "Fairytale ceremony arches, fairy-lit banquet runners, and bespoke bridal party florals.",
    image: "/images/table-decor-wedding-fairy-lights.jpg",
    tag: "Bespoke Styling",
    delay: "200ms",
    whatsappMessage: "Hello Occassions Florist Calicut, I would like to consult regarding Wedding floral decor and styling.",
  },
  {
    id: "valentines",
    name: "Valentine’s Day",
    emoji: "🌹",
    subtitle: "Pure Unconditional Passion",
    description: "Velvety grade-A Dutch scarlet roses draped in noir wrapping and French satin ribbons.",
    image: "/images/red-rose-bouquet.jpg",
    tag: "Romantic Bestseller",
    delay: "270ms",
    whatsappMessage: "Hello Occassions Florist Calicut, I would like to pre-order Valentine's Day rose bouquets.",
  },
  {
    id: "housewarming",
    name: "Housewarming",
    emoji: "🏠",
    subtitle: "Blessings & New Beginnings",
    description: "Radiant golden sunflowers, lush botanical table arrangements, and auspicious floral hampers.",
    image: "/images/sunflower-bouquet.jpg",
    tag: "Warm & Auspicious",
    delay: "340ms",
    whatsappMessage: "Hello Occassions Florist Calicut, I would like to inquire about Housewarming flowers and planters.",
  },
  {
    id: "just-because",
    name: "Just Because",
    emoji: "🎉",
    subtitle: "Surprise someone special, anytime",
    description: "No special date needed. Brighten someone's afternoon with spontaneous, hand-picked blooms.",
    image: "/images/basket-gerberas.jpg",
    tag: "Daily Surprise",
    delay: "410ms",
    whatsappMessage: "Hello Occassions Florist Calicut, I want to send a spontaneous 'Just Because' surprise today!",
  },
];

export default function ShopByOccasion() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < 30) {
        setIsVisible(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const target = sectionRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else if (entry.boundingClientRect.top > 0) {
          setIsVisible(false);
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
        <div className={`${styles.sectionHeader} ${isVisible ? styles.headerInView : ""}`}>
          <span className={styles.eyebrow}>CELEBRATE EVERY MOMENT</span>
          <h2 className={styles.mainHeading}>Shop by Occasion</h2>
          <p className={styles.subHeading}>
            Find the perfect fresh flowers, cakes, and artisanal arrangements handcrafted for life’s most cherished celebrations.
          </p>
        </div>

        {/* Occasion Cards Grid */}
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
  const whatsappUrl = `https://wa.me/918606464700?text=${encodeURIComponent(item.whatsappMessage)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.cardLink}
      aria-label={`Order or inquire for ${item.name}`}
    >
      <article
        className={`${styles.card} ${isVisible ? styles.cardVisible : ""}`}
        style={{ "--anim-delay": item.delay } as React.CSSProperties}
      >
        {/* Image Frame */}
        <div className={styles.imageFrame}>
          <img
            src={item.image}
            alt={item.name}
            className={styles.cardImage}
            loading="lazy"
          />
          {/* Badge with Emoji */}
          <span className={styles.emojiBadge}>
            <span className={styles.emojiIcon}>{item.emoji}</span>
            <span className={styles.emojiText}>{item.name}</span>
          </span>
          <div className={styles.hoverOverlay} />
        </div>

        {/* Content */}
        <div className={styles.cardContent}>
          {item.subtitle && <span className={styles.subtitle}>{item.subtitle}</span>}
          <h3 className={styles.cardTitle}>
            {item.emoji} {item.name}
          </h3>
          <p className={styles.cardDesc}>{item.description}</p>

          <div className={styles.ctaRow}>
            <span className={styles.ctaText}>Surprise Now</span>
            <MessageCircle size={14} className={styles.ctaIcon} />
          </div>
        </div>
      </article>
    </a>
  );
}
