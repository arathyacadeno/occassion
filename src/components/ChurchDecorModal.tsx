"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import styles from "./ChurchDecorModal.module.css";

export interface ChurchDecorImageItem {
  src: string;
  alt: string;
  title: string;
  price: number;
  description: string;
}

export const CHURCH_DECOR_GALLERY: ChurchDecorImageItem[] = [
  {
    src: "/images/highlight-church-arrangements.jpg",
    alt: "Grand Cathedral Altar Floral Arch and Pew Decoration",
    title: "Cathedral Grand Altar Floral Arch & Ceremony Decor",
    price: 16500,
    description:
      "Create a sacred, heavenly atmosphere for your wedding ceremony with grand cathedral altar arches, romantic candlelit pew decorations, Casablanca lilies, avalanche white roses, and cascading aisle runners meticulously styled to honor your parish traditions.",
  },
];

interface ChurchDecorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChurchDecorModal({ isOpen, onClose }: ChurchDecorModalProps) {
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
      } else if (e.key === "ArrowLeft" && CHURCH_DECOR_GALLERY.length > 1) {
        handlePrev();
      } else if (e.key === "ArrowRight" && CHURCH_DECOR_GALLERY.length > 1) {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, activeIndex, onClose]);

  if (!isOpen) return null;

  const currentItem = CHURCH_DECOR_GALLERY[activeIndex] || CHURCH_DECOR_GALLERY[0];

  const handlePrev = () => {
    setActiveIndex((prev) =>
      prev === 0 ? CHURCH_DECOR_GALLERY.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setActiveIndex((prev) =>
      prev === CHURCH_DECOR_GALLERY.length - 1 ? 0 : prev + 1
    );
  };

  const formattedPrice = currentItem.price.toLocaleString("en-IN");
  const whatsAppHref = `https://wa.me/918606464700?text=${encodeURIComponent(
    `Hello Occasions Florist Calicut, I would like to inquire about wedding Church Decoration package (₹${formattedPrice}) - ${currentItem.title}.`
  )}`;

  const hasMultipleImages = CHURCH_DECOR_GALLERY.length > 1;

  return (
    <div
      className={styles.modalBackdrop}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Church Decor Showcase"
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
          {/* Left Column: Big Featured Image with Prev/Next arrows if multiple */}
          <div className={styles.heroImageWrapper}>
            <img
              src={currentItem.src}
              alt={currentItem.alt}
              className={styles.heroImage}
            />

            {hasMultipleImages && (
              <>
                <button
                  type="button"
                  className={`${styles.navArrowBtn} ${styles.navArrowPrev}`}
                  onClick={handlePrev}
                  aria-label="Previous church design"
                >
                  <ChevronLeft size={22} />
                </button>

                <button
                  type="button"
                  className={`${styles.navArrowBtn} ${styles.navArrowNext}`}
                  onClick={handleNext}
                  aria-label="Next church design"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}
          </div>

          {/* Right Column: Description, Price, Action buttons (matching StageDecorModal / CarDecorModal) */}
          <div className={styles.detailsCol}>
            <p className={styles.description}>{currentItem.description}</p>

            <div className={styles.priceTag}>
              ₹{formattedPrice}/-
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

        {/* ── Bottom: Thumbnail Row matching Highlights modal aesthetic ── */}
        <div className={styles.bottomThumbnailsRow}>
          <div className={styles.thumbnailsTrack} ref={trackRef}>
            {CHURCH_DECOR_GALLERY.map((item, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={item.src}
                  type="button"
                  className={`${styles.thumbCard} ${
                    isActive ? styles.thumbCardActive : ""
                  }`}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`View church decor design ${index + 1}`}
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
        </div>
      </div>
    </div>
  );
}
