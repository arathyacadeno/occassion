"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageCircle,
} from "lucide-react";
import styles from "./StageDecorModal.module.css";

export interface StageDecorImageItem {
  src: string;
  alt: string;
  price: number;
  description: string;
}

export const STAGE_DECOR_GALLERY: StageDecorImageItem[] = [
  {
    src: "/images/stage decor/1.jpg",
    alt: "Imperial Marble Arch and Bloom Wall Wedding Stage",
    price: 28000,
    description:
      "An architectural masterpiece featuring sleek Italian-veined marble panels framing two dense floral garden alcoves in soft pink, lavender, and ivory blooms. Complete with an overhead arch floral swag, plush gold velvet chaise lounge, and gilded ruffled stage skirting with matching front posies.",
  },
  {
    src: "/images/stage decor/2.jpg",
    alt: "Enchanted Circular Golden Ring Arch Wedding Stage",
    price: 24000,
    description:
      "A contemporary circular metallic gold floral ring intertwined with fresh blush garden roses, custom couple monogram medallion, romantic golden tubular candlelight pillars, and a tufted mauve velvet loveseat resting over rich crimson carpets.",
  },
  {
    src: "/images/stage decor/3.jpg",
    alt: "Royal Victorian White Chaise and Crystal Candelabra Stage",
    price: 32000,
    description:
      "A regal wedding stage styled with an antique white tufted scroll-arm chaise, suspended rustic wooden floral beams, multi-tier crystal candelabras, and opulent golden satin stage borders adorned with wild baby's breath and pastel peach Dutch roses.",
  },
  {
    src: "/images/stage decor/4.jpeg",
    alt: "Warm Filament Light and Peach Drape Wedding Stage Decor",
    price: 18000,
    description:
      "An intimate, atmospheric wedding ambiance blending gentle pleated ivory drapes, suspended warm Edison filament bulbs, asymmetric peach and magenta floral swags, and elegant white ceramic floor urns with fresh blossoms.",
  },
  {
    src: "/images/stage decor/5.jpg",
    alt: "Grand Celestial Fairy Light Canopy Multi-Arch Wedding Stage",
    price: 38000,
    description:
      "A breathtaking ballroom installation featuring a sprawling starry fairy light ceiling canopy, cascading sheer drapery, five interlocking golden floral arches with warm hanging chandeliers, and a traditional hand-carved Kerala teak diwan.",
  },
  {
    src: "/images/stage decor/6.jpeg",
    alt: "Geometric Suspended Golden Rings Wedding Stage",
    price: 22000,
    description:
      "Modern symmetry meets botanical luxury with tiered suspended golden ring lights, lush rose and carnation mini-swags, glowing geometric side towers with miniature lanterns, and a comfortable contemporary couple sofa.",
  },
  {
    src: "/images/stage decor/7.jpg",
    alt: "Heritage Rosewood Bench and Pristine White Floral Arch Stage",
    price: 25000,
    description:
      "Honoring Kerala tradition with an authentic antique carved rosewood tharavadu bench set against a minimalist circular arch of pure white chrysanthemums, ivory Dutch roses, and cascading English ivy on an all-white carpeted platform.",
  },
  {
    src: "/images/stage decor/8.jpg",
    alt: "Majestic Grand Palace Five Arch Wedding Stage Decor",
    price: 36000,
    description:
      "A grand palace-inspired stage facade featuring five monumental architectural white arches, two floor-to-ceiling multi-color flower walls, a couple monogram crest, and shimmering gold satin pleated borders with lush stage-front floral clusters.",
  },
  {
    src: "/images/stage decor/9.jpg",
    alt: "Golden Sunburst Floral Arch and Hanging Rings Stage",
    price: 23000,
    description:
      "A radiant circular golden arch densely garlanded in coral roses, pastel daisies, and eucalyptus, complemented by floating floral hoops and warm Edison pendants that create magical, bokeh-filled wedding photographs.",
  },
];

interface StageDecorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StageDecorModal({ isOpen, onClose }: StageDecorModalProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

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
          prev === 0 ? STAGE_DECOR_GALLERY.length - 1 : prev - 1
        );
      } else if (e.key === "ArrowRight") {
        setActiveIndex((prev) =>
          prev === STAGE_DECOR_GALLERY.length - 1 ? 0 : prev + 1
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, activeIndex, onClose]);

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

  const currentItem = STAGE_DECOR_GALLERY[activeIndex];

  const handlePrev = () => {
    setActiveIndex((prev) =>
      prev === 0 ? STAGE_DECOR_GALLERY.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setActiveIndex((prev) =>
      prev === STAGE_DECOR_GALLERY.length - 1 ? 0 : prev + 1
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
    `Hello Occasions Florist Calicut, I would like to inquire about wedding Stage Decoration package (₹${formattedPrice}) - ${currentItem.alt}.`
  )}`;

  return (
    <div
      className={styles.modalBackdrop}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Stage Decor Showcase"
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
          {/* Left Column: Big Featured Image with Prev/Next arrows */}
          <div className={styles.heroImageWrapper}>
            <img
              src={currentItem.src}
              alt={currentItem.alt}
              className={styles.heroImage}
            />

            <button
              type="button"
              className={`${styles.navArrowBtn} ${styles.navArrowPrev}`}
              onClick={handlePrev}
              aria-label="Previous stage design"
            >
              <ChevronLeft size={22} />
            </button>

            <button
              type="button"
              className={`${styles.navArrowBtn} ${styles.navArrowNext}`}
              onClick={handleNext}
              aria-label="Next stage design"
            >
              <ChevronRight size={22} />
            </button>
          </div>

          {/* Right Column: Description, Price, Action buttons */}
          <div className={styles.detailsCol}>
            <p className={styles.description}>{currentItem.description}</p>

            <div className={styles.priceTag}>
              Starts at ₹{formattedPrice}/-
            </div>

            <div className={styles.actionButtons}>
              <a href="tel:+918606464700" className={styles.callButton}>
                <Phone size={13} />
                <span>Call Us (+91 8606464700)</span>
              </a>

              <a
                href={whatsAppHref}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.whatsappButton}
              >
                <MessageCircle size={13} />
                <span>Inquire on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* ── Bottom: Scrollable Thumbnail Row with Arrows ── */}
        <div className={styles.bottomThumbnailsRow}>
          <button
            type="button"
            className={styles.thumbScrollBtn}
            onClick={handleScrollThumbLeft}
            aria-label="Scroll thumbnails left"
          >
            <ChevronLeft size={16} />
          </button>

          <div className={styles.thumbnailsTrack} ref={trackRef}>
            {STAGE_DECOR_GALLERY.map((item, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={item.src}
                  type="button"
                  className={`${styles.thumbCard} ${
                    isActive ? styles.thumbCardActive : ""
                  }`}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`View stage decor design ${index + 1}`}
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
            aria-label="Scroll thumbnails right"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
