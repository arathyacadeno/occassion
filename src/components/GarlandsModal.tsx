"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import styles from "./GarlandsModal.module.css";

export interface GarlandImageItem {
  src: string;
  alt: string;
  title: string;
  price: number;
  description: string;
}

export const GARLANDS_GALLERY: GarlandImageItem[] = [
  {
    src: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647414/occasions/products/garlands/garlands-1.webp",
    alt: "Handcrafted Sacred Pink Lotus Buds and Crimson Jasmine Wedding Varmala Pair",
    title: "Royal Sacred Lotus & Crimson Jasmine Varmala",
    price: 6000,
    description:
      "A regal ceremonial varmala pair harmonizing deep crimson folded rose petals, pristine white jasmine bud cylinders, gilded rosettes, and folded pink lotus bud centerpieces with golden bead drops.",
  },
  {
    src: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647415/occasions/products/garlands/garlands-2.webp",
    alt: "Full Magenta Rose Petal Cylindrical Varmala with Diagonal Gold Rosette Spirals",
    title: "Imperial Magenta Rose & Spiral Gold Varmala",
    price: 5200,
    description:
      "A showstopping royal varmala pair densely woven with vibrant magenta rose petals in an unbroken cylinder, wrapped in diagonal spirals of shimmering gold rosettes and completed with floral tassel drops.",
  },
  {
    src: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647415/occasions/products/garlands/garlands-3.jpg",
    alt: "Classic Scarlet Dutch Roses and Yellow Chrysanthemums with Beaded Gold Tassels",
    title: "Grand Marigold & Scarlet Rose Varmala",
    price: 4400,
    description:
      "A celebratory ceremonial varmala combining rich scarlet Dutch roses, golden-yellow chrysanthemums, delicate gypsophila sprigs, and ornate beaded gold chain accents.",
  },
  {
    src: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647415/occasions/products/garlands/garlands-4.jpg",
    alt: "Pristine White Jasmine Cylindrical Garland with Gold Accents and Rosebud Tassels",
    title: "Pure White Jasmine & Scarlet Cuff Varmala",
    price: 4200,
    description:
      "Classic bridal elegance handcrafted from pure white jasmine and chrysanthemum strands, accented by golden weave spacers, crimson rose bands, and floral cuffs with hanging jasmine tassels.",
  },
  {
    src: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647416/occasions/products/garlands/garlands-5.webp",
    alt: "South Indian Coral Pink Petal Weave Varmala with Jasmine Bands and Gold Rosettes",
    title: "South Indian Coral & Jasmine Petal Varmala",
    price: 5500,
    description:
      "Traditional South Indian craftsmanship featuring tightly folded ombre coral rose petals, fragrant white jasmine bands, golden embroidered rosettes, and beaded bell tassels.",
  },
  {
    src: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647416/occasions/products/garlands/garlands-6.webp",
    alt: "Pastel Pink Dutch Roses and White Sevanthi Varmala with Pearl String Tassels",
    title: "Heritage Pearl Tassel Blush Rose Varmala",
    price: 7000,
    description:
      "Graceful bridal varmalas intricately layered with fresh pastel pink roses, delicate white chrysanthemums, baby's breath, and majestic hanging pearl string tassels tipped with rose blossom pendants.",
  },
  {
    src: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647416/occasions/products/garlands/garlands-7.webp",
    alt: "Dense Cloud Gypsophila Baby's Breath and Pink Rose Wedding Garland Pair",
    title: "Ethereal Gypsophila & Pastel Rose Varmala",
    price: 6500,
    description:
      "A modern, feather-light wedding varmala crafted with continuous dense clouds of fresh white baby's breath (gypsophila) interspersed with clusters of tender blush pink roses and hanging rosebud finials.",
  },
  {
    src: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647416/occasions/products/garlands/garlands-8.webp",
    alt: "Sacred Pink Lotus Petal Buds and White Jasmine Varmala with Pearl and Flower Pendants",
    title: "Divine Lotus Bud & Fragrant Jasmine Varmala",
    price: 5500,
    description:
      "An auspicious, divine wedding varmala featuring sacred pink lotus petals (kamal / thamara), dense strands of aromatic jasmine buds, crimson petal spacers, and dangling triple lotus blossom pendants.",
  },
  {
    src: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647416/occasions/products/garlands/garlands-9.webp",
    alt: "Ceremonial Crimson Rose Petal and Jasmine Bud Varmala Pair with Gold Accents",
    title: "Ceremonial Crimson & Jasmine Rosette Varmala",
    price: 5200,
    description:
      "A stunning ceremonial wedding varmala pair featuring tightly layered crimson rose petals embedded with gilded miniature rosettes, contrasting white jasmine bud cylinders, and hanging floral cuffs.",
  },
  {
    src: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647415/occasions/products/garlands/garlands-10.webp",
    alt: "Auspicious White Jasmine and Deep Crimson Rose Petal Wedding Garland Pair",
    title: "Traditional Madurai Jasmine & Crimson Varmala",
    price: 5000,
    description:
      "Handwoven with fragrant Madurai jasmine buds and folded deep crimson rose petals, accented with gilded rosettes, pearl neckbands, and elegant hanging rose clusters.",
  },
  {
    src: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647415/occasions/products/garlands/garlands-11.webp",
    alt: "Full Crimson Red Folded Rose Petal Varmala with Diagonal Gold Rosette Spirals",
    title: "Imperial Crimson Rose & Gold Spiral Varmala",
    price: 4800,
    description:
      "A showstopping royal varmala densely woven with deep scarlet rose petals in an unbroken cylinder, wrapped in diagonal spirals of shimmering gold rosettes and completed with pearl cluster tassels.",
  },
  {
    src: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647415/occasions/products/garlands/garlands-12.webp",
    alt: "Pastel Pink Dutch Roses and White Chrysanthemum Wedding Varmala Pair",
    title: "Pastel Rose & Sevanthi Harmony Varmala",
    price: 4500,
    description:
      "An exquisite pair of handcrafted wedding varmalas woven with soft pink Dutch roses, fresh white chrysanthemums (sevanthi), delicate baby's breath, and subtle golden bead accents.",
  },
];

interface GarlandsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

export default function GarlandsModal({
  isOpen,
  onClose,
  initialIndex = 0,
}: GarlandsModalProps) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  // Keyboard navigation & body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        setActiveIndex((prev) =>
          prev === 0 ? GARLANDS_GALLERY.length - 1 : prev - 1
        );
      } else if (e.key === "ArrowRight") {
        setActiveIndex((prev) =>
          prev === GARLANDS_GALLERY.length - 1 ? 0 : prev + 1
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Scroll active thumbnail into view
  useEffect(() => {
    if (!trackRef.current) return;
    const track = trackRef.current;
    const activeThumb = track.children[activeIndex] as HTMLElement;
    if (activeThumb) {
      const scrollLeft =
        activeThumb.offsetLeft -
        track.offsetWidth / 2 +
        activeThumb.offsetWidth / 2;
      track.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
  }, [activeIndex]);

  if (!isOpen) return null;

  const currentItem = GARLANDS_GALLERY[activeIndex];

  const handlePrev = () => {
    setActiveIndex((prev) =>
      prev === 0 ? GARLANDS_GALLERY.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setActiveIndex((prev) =>
      prev === GARLANDS_GALLERY.length - 1 ? 0 : prev + 1
    );
  };

  const handleScrollThumbLeft = () => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: -220, behavior: "smooth" });
    }
  };

  const handleScrollThumbRight = () => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: 220, behavior: "smooth" });
    }
  };

  const formattedPrice = currentItem.price.toLocaleString("en-IN");
  const whatsAppHref = `https://wa.me/918606464700?text=${encodeURIComponent(
    `Hello Occasions Florist Calicut, I would like to inquire about wedding Garlands / Varmala pair (₹${formattedPrice}) - ${currentItem.title}.`
  )}`;

  return (
    <div
      className={styles.modalBackdrop}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Wedding Garlands Showcase"
    >
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        {/* ── Top Grid: Featured Image + Details ── */}
        <div className={styles.topGrid}>
          {/* Left Column: Hero Featured Image with Arrows */}
          <div className={styles.heroImageWrapper}>
            {/* Soft blurred background to provide rich atmospheric depth */}
            <img
              src={currentItem.src}
              alt=""
              aria-hidden="true"
              className={styles.heroBackdropBlur}
              key={`blur-${currentItem.src}`}
            />

            {/* Sharp foreground image: full garland completely visible */}
            <img
              src={currentItem.src}
              alt={currentItem.alt}
              className={styles.heroImage}
              key={currentItem.src}
            />

            {/* Counter Badge */}
            <span className={styles.counterBadge}>
              {activeIndex + 1} / {GARLANDS_GALLERY.length}
            </span>

            {/* Left Prev Arrow */}
            <button
              type="button"
              className={`${styles.navArrowBtn} ${styles.navArrowPrev}`}
              onClick={handlePrev}
              aria-label="Previous garland design"
            >
              <ChevronLeft size={22} strokeWidth={2.5} />
            </button>

            {/* Right Next Arrow */}
            <button
              type="button"
              className={`${styles.navArrowBtn} ${styles.navArrowNext}`}
              onClick={handleNext}
              aria-label="Next garland design"
            >
              <ChevronRight size={22} strokeWidth={2.5} />
            </button>
          </div>

          {/* Right Column: Description, Price, Action buttons */}
          <div className={styles.detailsCol}>

            <h3 className={styles.title} key={`title-${currentItem.src}`}>
              {currentItem.title}
            </h3>

            <p className={styles.description} key={`desc-${currentItem.src}`}>
              {currentItem.description}
            </p>

            <div className={styles.priceRow}>
              <div className={styles.priceTag} key={`price-${currentItem.src}`}>
                ₹ {formattedPrice}
              </div>
            </div>

            <div className={styles.actionButtons}>
              <a
                href={whatsAppHref}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.whatsappButton}
              >
                <MessageCircle size={16} />
                <span>Inquire on WhatsApp</span>
              </a>

              <a href="tel:+918606464700" className={styles.callButton}>
                <Phone size={14} color="#ec4899" />
                <span>Call Atelier Directly</span>
              </a>
            </div>

            <div className={styles.guaranteeBadge}>
              <span className={styles.guaranteeIcon}>
                <ShieldCheck size={16} strokeWidth={2.2} />
              </span>
              <span>100% Freshness Guarantee</span>
            </div>
          </div>
        </div>

        {/* ── Bottom Section: Thumbnail Carousel Strip ── */}
        <div className={styles.bottomThumbnailsRow}>
          <button
            type="button"
            className={styles.thumbScrollBtn}
            onClick={handleScrollThumbLeft}
            aria-label="Scroll garland thumbnails left"
          >
            <ChevronLeft size={18} strokeWidth={2.4} />
          </button>

          <div className={styles.thumbnailsTrack} ref={trackRef}>
            {GARLANDS_GALLERY.map((item, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  type="button"
                  key={item.src}
                  onClick={() => setActiveIndex(idx)}
                  className={`${styles.thumbCard} ${
                    isActive ? styles.thumbCardActive : ""
                  }`}
                  aria-label={`View ${item.title}`}
                >
                  <img
                    src={item.src}
                    alt={item.alt}
                    className={styles.thumbImg}
                    loading="lazy"
                  />
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className={styles.thumbScrollBtn}
            onClick={handleScrollThumbRight}
            aria-label="Scroll garland thumbnails right"
          >
            <ChevronRight size={18} strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </div>
  );
}
