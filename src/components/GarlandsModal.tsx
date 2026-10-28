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
    src: "/images/garlands/1.jpg",
    alt: "Pastel Pink Dutch Roses and White Chrysanthemum Wedding Varmala Pair",
    title: "Royal Pastel Rose & White Sevanthi Varmala",
    price: 3500,
    description:
      "An exquisite pair of handcrafted wedding varmalas woven with soft pink Dutch roses, fresh white chrysanthemums (sevanthi), and subtle golden bead accents. Perfect for elegant Hindu and Christian weddings, temple rituals, and reception ceremonies.",
  },
  {
    src: "/images/garlands/2.jpg",
    alt: "Pastel Pink Roses and White Sevanthi Varmala with Pearl String Tassels",
    title: "Heritage Pearl Tassel Pink Rose Varmala",
    price: 4200,
    description:
      "Graceful bridal varmalas intricately layered with fresh pastel pink roses, delicate white chrysanthemums, and majestic hanging pearl string tassels tipped with rose blossom pendants for a regal royal look.",
  },
  {
    src: "/images/garlands/3.jpg",
    alt: "Dense Cloud Gypsophila Baby's Breath and Pink Rose Wedding Garland Pair",
    title: "Ethereal Gypsophila & Pastel Rose Varmala",
    price: 4800,
    description:
      "A modern, feather-light wedding varmala crafted with continuous dense clouds of fresh white baby's breath (gypsophila) interspersed with clusters of tender blush pink roses and hanging rosebud finials.",
  },
  {
    src: "/images/garlands/4.jpg",
    alt: "Dual-Tone Pink Rose Petal Weave Varmala with Jasmine Bands and Golden Rosettes",
    title: "South Indian Rose Petal Weave Varmala",
    price: 3800,
    description:
      "Traditional South Indian craftsmanship featuring tightly woven ombre pink rose petals, fragrant white jasmine bands, golden embroidered rosettes, and beaded bell tassels.",
  },
  {
    src: "/images/garlands/5.jpg",
    alt: "Dense Fragrant Madurai Jasmine and Crimson Red Rose Petal Varmala with Golden Ruffles",
    title: "Royal Jasmine & Crimson Petal Varmala",
    price: 4500,
    description:
      "A majestic traditional Kerala wedding varmala blending aromatic Madurai jasmine coils, textured crimson rose petal weaves adorned with pearl droplets, and golden ribbon spacers.",
  },
  {
    src: "/images/garlands/6.jpg",
    alt: "Auspicious White Jasmine and Deep Crimson Rose Petal Wedding Garland Pair",
    title: "Traditional Madurai Jasmine & Rose Garland",
    price: 4500,
    description:
      "Handwoven with fragrant Madurai jasmine buds and folded deep crimson rose petals, accented with gilded rosettes and elegant hanging rose clusters. Designed for sacred mangalyam ceremonies.",
  },
  {
    src: "/images/garlands/7.jpg",
    alt: "Crimson Petal and White Jasmine Varmala with Fresh Rose Chrysanthemum Medallion",
    title: "Crimson & Jasmine Medallion Varmala",
    price: 4200,
    description:
      "A magnificent ceremonial garland showcasing alternating bands of folded red rose petals and pristine jasmine, finished with an ornate floral medallion of scarlet roses, white chrysanthemums, and fresh asparagus greens.",
  },
  {
    src: "/images/garlands/8.jpg",
    alt: "Full Crimson Red Folded Rose Petal Varmala with Diagonal Gold Rosette Spirals",
    title: "Imperial Crimson Rose & Gold Spiral Varmala",
    price: 4900,
    description:
      "A showstopping royal varmala densely woven with deep scarlet rose petals in an unbroken cylinder, wrapped in diagonal spirals of shimmering gold rosettes and completed with pearl cluster tassels.",
  },
  {
    src: "/images/garlands/9.jpg",
    alt: "Vibrant Fuchsia Magenta Rose Petal Garland with Spiral Gold Ribbon and Pom-Pom Center",
    title: "Magenta Bliss Gold Ribbon Varmala",
    price: 3600,
    description:
      "A vibrant celebratory garland woven from vivid magenta rose petals accented with delicate golden ribbons and crowned with a plush floral pom-pom pendant and scarlet satin ties.",
  },
  {
    src: "/images/garlands/10.jpg",
    alt: "Sacred Pink Lotus Petal Buds and White Jasmine Varmala with Pearl Pendants",
    title: "Divine Lotus Bud & Fragrant Jasmine Varmala",
    price: 5500,
    description:
      "An auspicious, divine wedding varmala featuring sacred pink lotus petals (kamal / thamara), dense strands of aromatic jasmine buds, crimson petal spacers, and dangling triple lotus blossom pendants.",
  },
  {
    src: "/images/garlands/11.jpg",
    alt: "Pristine White Tuberose Jasmine Garland with Scarlet Rose Clusters and Gold Bands",
    title: "Pure Tuberose & Scarlet Rosebud Varmala",
    price: 3800,
    description:
      "Classic bridal elegance handcrafted from pure white tuberose and jasmine buds, punctuated by vibrant scarlet rose clusters, metallic gold ribbon rings, and fresh tuberose pendant tassels.",
  },
  {
    src: "/images/garlands/12.jpg",
    alt: "Classic Scarlet Dutch Roses and Golden Yellow Chrysanthemums with Beaded Gold Chains",
    title: "Grand Marigold & Scarlet Rose Varmala",
    price: 3200,
    description:
      "A traditional celebratory varmala combining rich scarlet Dutch roses, golden-yellow chrysanthemums, delicate gypsophila sprigs, and ornate beaded gold chain accents.",
  },
  {
    src: "/images/garlands/13.jpg",
    alt: "Traditional Crimson Rose Petal Weave and White Jasmine Varmala with Folded Lotus Finials",
    title: "Royal Lotus & Crimson Petal Weave Varmala",
    price: 5200,
    description:
      "A regal ceremonial garland harmonizing deep crimson folded petals, white jasmine bud cylinders, gilded rosettes, and folded pink lotus bud centerpieces with golden bead drops.",
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
