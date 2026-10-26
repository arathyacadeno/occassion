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

export interface CarDecorImageItem {
  src: string;
  alt: string;
  title: string;
}

export const CAR_DECOR_GALLERY: CarDecorImageItem[] = [
  {
    src: "/images/car decor/WhatsApp_Image_2026-10-23_at_3.25.13_PM_2-remove-the-price-and-bottum-text.jpg",
    alt: "Yellow Mini Cooper Wedding Bonnet Floral Arrangement",
    title: "Mini Cooper VIP Floral Bonnet",
  },
  {
    src: "/images/car decor/Screenshot 2026-10-26 111726.png",
    alt: "White Mercedes Bonnet Red Rose Posy Arrangement",
    title: "Mercedes Red Rose Bonnet Posy",
  },
  {
    src: "/images/car decor/WhatsApp_Image_2026-10-23_at_3.25.15_PM_1-this-bocket-is-add-car-bonent-like-marriage-car-in-car-is.jpg",
    alt: "White BMW Luxury Wedding Floral Bonnet",
    title: "White BMW Ceremony Posy",
  },
  {
    src: "/images/car decor/WhatsApp_Image_2026-10-23_at_3.25.14_PM_5-please-change-the-text-car-in-to-stright-this-image-to-cre.jpg",
    alt: "White Mercedes Luxury Wedding Ceremony Floral Decor",
    title: "Mercedes Grand Varmala Bonnet",
  },
  {
    src: "/images/car decor/WhatsApp Image 2026-10-23 at 3.25.17 PM-remove-the-1500--text-make-this-silver-honda-neat-clean-and.jpg",
    alt: "Silver Honda City Marriage Arrival Floral Decor",
    title: "Silver Honda City Elegance",
  },
  {
    src: "/images/car decor/WhatsApp Image 2026-10-23 at 3.25.15 PM-remove-the-text-and-i-need-car-view-in-marriage-fu-view-in-t.jpg",
    alt: "Black Audi A4 Nikah Mubarak Pink & White Floral Bonnet",
    title: "Black Audi Nikah Mubarak Roses",
  },
  {
    src: "/images/car decor/WhatsApp_Image_2026-10-23_at_3.25.15_PM_3-change-in-to-car-bocket-the-car-is-innova-create-normal-in.jpg",
    alt: "White Toyota Innova Wedding Stage Car Decor",
    title: "White Innova Crysta Styling",
  },
  {
    src: "/images/car decor/WhatsApp_Image_2026-10-23_at_3.25.17_PM_1-remove-the-text-main-focus-is-flower-bocket-and-ma-change.jpg",
    alt: "Black Mahindra Thar Traditional Kerala Wedding Floral Decor",
    title: "Black Mahindra Thar Tradition",
  },
  {
    src: "/images/car decor/WhatsApp_Image_2026-10-23_at_3.25.16_PM_1-remove-the-text-and-shutdown-the-wiper-in-the-car.jpg",
    alt: "White Hyundai Verna Fresh Rose Bonnet Cascade",
    title: "White Hyundai Verna Cascade",
  },
  {
    src: "/images/car decor/WhatsApp_Image_2026-10-23_at_3.25.14_PM_7-remove-the-text-and-the-car-palaced-in-to-marriage-remove.jpg",
    alt: "Toyota Fortuner Wedding Entrance Car Decor",
    title: "Toyota Fortuner Grand Arrival",
  },
  {
    src: "/images/car decor/WhatsApp_Image_2026-10-23_at_3.25.17_PM_2-change-background-in-make-the-marriage-background-a-minima.jpg",
    alt: "Classic Turquoise Maruti 800 Retro Red Rose Decor",
    title: "Classic Turquoise Retro Roses",
  },
  {
    src: "/images/car decor/WhatsApp_Image_2026-10-23_at_3.25.15_PM_2-create-this-image-in-to-neat-and-clean-and-straigh-create.jpg",
    alt: "Mahindra XUV500 Wedding Convoy Car Decor",
    title: "Mahindra XUV Convoy Styling",
  },
];

interface CarDecorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CarDecorModal({ isOpen, onClose }: CarDecorModalProps) {
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
  }, [isOpen, activeIndex]);

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

  const currentItem = CAR_DECOR_GALLERY[activeIndex];

  const handlePrev = () => {
    setActiveIndex((prev) =>
      prev === 0 ? CAR_DECOR_GALLERY.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setActiveIndex((prev) =>
      prev === CAR_DECOR_GALLERY.length - 1 ? 0 : prev + 1
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

  const whatsAppHref = `https://wa.me/918606464700?text=${encodeURIComponent(
    `Hello Occasions Florist Calicut, I would like to inquire about wedding Car Decoration arrangement (₹1500) - ${currentItem.title}.`
  )}`;

  return (
    <div
      className={styles.modalBackdrop}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="car-decor-modal-title"
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
              src={encodeURI(currentItem.src)}
              alt={currentItem.alt}
              className={styles.heroImage}
              key={currentItem.src}
            />

            {/* Left Prev Arrow */}
            <button
              type="button"
              className={`${styles.navArrowBtn} ${styles.navArrowPrev}`}
              onClick={handlePrev}
              aria-label="Previous car decoration image"
            >
              <ChevronLeft size={22} strokeWidth={2.5} />
            </button>

            {/* Right Next Arrow */}
            <button
              type="button"
              className={`${styles.navArrowBtn} ${styles.navArrowNext}`}
              onClick={handleNext}
              aria-label="Next car decoration image"
            >
              <ChevronRight size={22} strokeWidth={2.5} />
            </button>
          </div>

          {/* Right Column: Description, Price, CTAs */}
          <div className={styles.detailsCol}>
            <p className={styles.description}>
              A stunning floral arrangement featuring elegant red roses, soft
              pink roses, delicate white blooms, and fresh greenery. Perfect for
              wedding car decorations, romantic surprises, and special
              celebrations, this beautiful combination adds a touch of elegance
              and love to every memorable moment.
            </p>

            <div className={styles.priceTag}>₹ 1500</div>

            <div className={styles.actionButtons}>
              <a href="tel:+918606464700" className={styles.callButton}>
                <Phone size={16} strokeWidth={2.5} />
                <span>Call Us Directly</span>
              </a>

              <a
                href={whatsAppHref}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.whatsappButton}
              >
                <MessageCircle size={17} strokeWidth={2.4} />
                <span>Enquiry On Whatsapp</span>
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
            aria-label="Scroll car thumbnails left"
          >
            <ChevronLeft size={18} strokeWidth={2.4} />
          </button>

          <div className={styles.thumbnailsTrack} ref={trackRef}>
            {CAR_DECOR_GALLERY.map((item, idx) => {
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
                    src={encodeURI(item.src)}
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
            aria-label="Scroll car thumbnails right"
          >
            <ChevronRight size={18} strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </div>
  );
}
