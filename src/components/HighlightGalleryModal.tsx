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
import styles from "./CarDecorModal.module.css";
import { Highlight, HighlightGalleryItem } from "./admin/HighlightManager";

interface HighlightGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  highlight: Highlight | null;
}

export default function HighlightGalleryModal({
  isOpen,
  onClose,
  highlight,
}: HighlightGalleryModalProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  // Reset active index when highlight changes
  useEffect(() => {
    setActiveIndex(0);
  }, [highlight?.id]);

  // Keyboard navigation & body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, activeIndex, highlight]);

  if (!isOpen || !highlight) return null;

  // Build unified gallery list from highlight
  const galleryItems: HighlightGalleryItem[] =
    Array.isArray(highlight.gallery) && highlight.gallery.length > 0
      ? highlight.gallery
      : [
          {
            image_url: highlight.cover_image,
            title: highlight.title,
            alt_text: highlight.title,
            description: highlight.description,
            price: Number(highlight.starting_price) || 0,
          },
        ];

  const currentItem = galleryItems[activeIndex] || galleryItems[0];
  const itemCount = galleryItems.length;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : itemCount - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < itemCount - 1 ? prev + 1 : 0));
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

  // WhatsApp CTA link
  const whatsAppNumber = (highlight.whatsapp_number || "918606464700").replace(/[^0-9]/g, "");
  const currentPrice = currentItem.price || highlight.starting_price || 0;
  const priceSnippet = currentPrice > 0 ? ` (₹${currentPrice.toLocaleString("en-IN")})` : "";
  const whatsAppMessage =
    highlight.whatsapp_text ||
    `Hello Occasions Florist Calicut, I would like to inquire about ${currentItem.title || highlight.title}${priceSnippet}.`;
  const whatsAppHref = `https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(whatsAppMessage)}`;

  // Phone Call CTA link
  const callNumber = highlight.call_number || "+918606464700";
  const callText = highlight.call_text || "Call Atelier Directly";
  const guaranteeText = highlight.guarantee_text || "100% Freshness Guarantee";

  return (
    <div
      className={styles.modalBackdrop}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="highlight-modal-title"
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
            <img
              src={currentItem.image_url}
              alt={currentItem.alt_text || currentItem.title || highlight.title}
              className={styles.heroImage}
              key={currentItem.image_url}
            />

            {/* Left Prev Arrow */}
            {itemCount > 1 && (
              <button
                type="button"
                className={`${styles.navArrowBtn} ${styles.navArrowPrev}`}
                onClick={handlePrev}
                aria-label="Previous image"
              >
                <ChevronLeft size={22} strokeWidth={2.5} />
              </button>
            )}

            {/* Right Next Arrow */}
            {itemCount > 1 && (
              <button
                type="button"
                className={`${styles.navArrowBtn} ${styles.navArrowNext}`}
                onClick={handleNext}
                aria-label="Next image"
              >
                <ChevronRight size={22} strokeWidth={2.5} />
              </button>
            )}
          </div>

          {/* Right Column: Description, Price, CTAs */}
          <div className={styles.detailsCol}>
            <p className={styles.description} key={`desc-${currentItem.image_url}`}>
              {currentItem.description || highlight.description}
            </p>

            <div className={styles.priceTag} key={`price-${currentItem.image_url}`}>
              {currentPrice > 0 ? `₹ ${currentPrice.toLocaleString("en-IN")}` : highlight.price_display || "Inquire"}
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

              <a href={`tel:${callNumber}`} className={styles.callButton}>
                <Phone size={14} color="#ec4899" />
                <span>{callText}</span>
              </a>
            </div>

            <div className={styles.guaranteeBadge}>
              <span className={styles.guaranteeIcon}>
                <ShieldCheck size={16} strokeWidth={2.2} />
              </span>
              <span>{guaranteeText}</span>
            </div>
          </div>
        </div>

        {/* ── Bottom Section: Thumbnail Carousel Strip ── */}
        {itemCount > 1 && (
          <div className={styles.bottomThumbnailsRow}>
            <button
              type="button"
              className={styles.thumbScrollBtn}
              onClick={handleScrollThumbLeft}
              aria-label="Scroll thumbnails left"
            >
              <ChevronLeft size={18} strokeWidth={2.4} />
            </button>

            <div className={styles.thumbnailsTrack} ref={trackRef}>
              {galleryItems.map((item, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <button
                    type="button"
                    key={item.id || item.image_url || `thumb-${idx}`}
                    onClick={() => setActiveIndex(idx)}
                    className={`${styles.thumbCard} ${
                      isActive ? styles.thumbCardActive : ""
                    }`}
                    aria-label={`View ${item.title || highlight.title}`}
                  >
                    <img
                      src={item.image_url}
                      alt={item.alt_text || item.title || highlight.title}
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
              <ChevronRight size={18} strokeWidth={2.4} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
