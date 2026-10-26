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
  price: number;
  description: string;
}

export const CAR_DECOR_GALLERY: CarDecorImageItem[] = [
  {
    src: "/images/car decor/WhatsApp_Image_2026-10-23_at_3.25.13_PM_2-remove-the-price-and-bottum-text.jpg",
    alt: "Yellow Mini Cooper Wedding Bonnet Floral Arrangement",
    title: "Mini Cooper Celebration Bonnet",
    price: 1500,
    description:
      "A stunning floral arrangement featuring elegant red roses, soft pink roses, delicate white blooms, and fresh greenery. Perfect for wedding car decorations, romantic surprises, and special celebrations, this beautiful combination adds a touch of elegance and love to every memorable moment.",
  },
  {
    src: "/images/car decor/Screenshot 2026-10-26 111726.png",
    alt: "White Mercedes Bonnet Red Rose Posy Arrangement",
    title: "Mercedes Signature Red Rose Posy",
    price: 1800,
    description:
      "A rich dome of premium velvety red Dutch roses framed with delicate evergreen foliage. Designed specifically for luxury sedan bonnets, this timeless arrangement brings royal romance and classic wedding prestige to your ceremonial arrival.",
  },
  {
    src: "/images/car decor/WhatsApp_Image_2026-10-23_at_3.25.15_PM_1-this-bocket-is-add-car-bonent-like-marriage-car-in-car-is.jpg",
    alt: "White BMW Luxury Wedding Floral Bonnet",
    title: "BMW Pastel Rose & Lily Symphony",
    price: 2200,
    description:
      "An opulent cluster of blush pink roses, pristine white oriental lilies, and baby's breath. Accented with lush eucalyptus leaves, this graceful design is crafted to complement luxury white BMW wedding cars with effortless elegance.",
  },
  {
    src: "/images/car decor/WhatsApp_Image_2026-10-23_at_3.25.14_PM_5-please-change-the-text-car-in-to-stright-this-image-to-cre.jpg",
    alt: "White Mercedes Luxury Wedding Ceremony Floral Decor",
    title: "Mercedes Grand Royal Cascade",
    price: 2500,
    description:
      "An elongated cascading arrangement combining exotic peach roses, crimson blossoms, and fragrant jasmine sprigs. Designed to create a showstopping entrance at grand wedding mandaps and banquet receptions across Calicut.",
  },
  {
    src: "/images/car decor/WhatsApp Image 2026-10-23 at 3.25.17 PM-remove-the-1500--text-make-this-silver-honda-neat-clean-and.jpg",
    alt: "Silver Honda City Marriage Arrival Floral Decor",
    title: "Honda City Elegance Posy",
    price: 1400,
    description:
      "A charming heart-shaped floral posy composed of soft blush roses, snow-white chrysanthemums, and fresh boxwood greens. Subtle yet striking, this design offers a neat and celebratory touch for wedding family arrivals.",
  },
  {
    src: "/images/car decor/WhatsApp Image 2026-10-23 at 3.25.15 PM-remove-the-text-and-i-need-car-view-in-marriage-fu-view-in-t.jpg",
    alt: "Black Audi A4 Nikah Mubarak Pink & White Floral Bonnet",
    title: "Audi Nikah Mubarak Royal Roses",
    price: 2400,
    description:
      "Exquisite contrast styling crafted with two-tone pastel pink and ivory white roses for sleek black luxury sedans. A regal centerpiece designed for auspicious Nikah ceremonies and evening celebrations under ambient lights.",
  },
  {
    src: "/images/car decor/WhatsApp_Image_2026-10-23_at_3.25.15_PM_3-change-in-to-car-bocket-the-car-is-innova-create-normal-in.jpg",
    alt: "White Toyota Innova Wedding Stage Car Decor",
    title: "Innova Crysta Grand Varmala Cascade",
    price: 1900,
    description:
      "A grand cascade arrangement crafted with deep red roses, fresh cream petals, and trailing floral greenery. Engineered with scratch-safe suction bases to withstand all-day wedding travel throughout Kerala.",
  },
  {
    src: "/images/car decor/WhatsApp_Image_2026-10-23_at_3.25.17_PM_1-remove-the-text-main-focus-is-flower-bocket-and-ma-change.jpg",
    alt: "Black Mahindra Thar Traditional Kerala Wedding Floral Decor",
    title: "Mahindra Thar Traditional White Posy",
    price: 1600,
    description:
      "A bold, majestic dome of fresh white chrysanthemums, ivory roses, and golden-accented greenery. Perfectly tailored to enhance the rugged elegance of black Mahindra Thar bride and groom procession vehicles.",
  },
  {
    src: "/images/car decor/WhatsApp_Image_2026-10-23_at_3.25.16_PM_1-remove-the-text-and-shutdown-the-wiper-in-the-car.jpg",
    alt: "White Hyundai Verna Fresh Rose Bonnet Cascade",
    title: "Hyundai Verna Rose & Gypsophila Garland",
    price: 1500,
    description:
      "A lush, spread-out floral bonnet featuring crimson and peach roses woven together with starry gypsophila and dark green ferns. Created for modern celebrations and memorable wedding send-offs.",
  },
  {
    src: "/images/car decor/WhatsApp_Image_2026-10-23_at_3.25.14_PM_7-remove-the-text-and-the-car-palaced-in-to-marriage-remove.jpg",
    alt: "Toyota Fortuner Wedding Entrance Car Decor",
    title: "Fortuner Executive Peach & Cream Bouquet",
    price: 2100,
    description:
      "A voluminous floral posy designed with premium peach roses, white Asiatic lilies, and tropical foliage. Bold and majestic, it creates a commanding VIP entrance for wedding couples.",
  },
  {
    src: "/images/car decor/WhatsApp_Image_2026-10-23_at_3.25.17_PM_2-change-background-in-make-the-marriage-background-a-minima.jpg",
    alt: "Classic Turquoise Maruti 800 Retro Red Rose Decor",
    title: "Retro Classic Scarlet Rose Centerpiece",
    price: 1200,
    description:
      "A vibrant circular cluster of deep red roses resting on fresh green cypress sprigs. Ideal for vintage bridal cars, photoshoot send-offs, and nostalgic retro wedding celebrations.",
  },
  {
    src: "/images/car decor/WhatsApp_Image_2026-10-23_at_3.25.15_PM_2-create-this-image-in-to-neat-and-clean-and-straigh-create.jpg",
    alt: "Mahindra XUV500 Wedding Convoy Car Decor",
    title: "XUV Luxury Convoy Floral Arrangement",
    price: 1750,
    description:
      "An elongated bridal bouquet featuring multi-colored roses, lilies, and ferns. Crafted for high-speed highway stability, making it the perfect choice for wedding party convoys and outstation bride arrivals.",
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
            <p className={styles.description} key={`desc-${currentItem.src}`}>
              {currentItem.description}
            </p>

            <div className={styles.priceTag} key={`price-${currentItem.src}`}>
              ₹ {currentItem.price}
            </div>

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
