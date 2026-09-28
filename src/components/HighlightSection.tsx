"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./HighlightSection.module.css";
import { MessageCircle, Phone, X, ArrowUpRight } from "lucide-react";

export interface HighlightCard {
  id: string;
  gridClass: string;
  tag: string;
  title: string;
  subtitle: string;
  image: string;
  desc: string;
  features: string[];
  whatsAppText: string;
  href?: string;
}

const highlightCards: HighlightCard[] = [
  {
    id: "table-arrangement",
    gridClass: styles.cardTallLeft, // Left Tall Card (Spanning full height)
    tag: "Decoration",
    title: "Table Arrangement",
    subtitle: "Opulent Banquet Centerpieces",
    image: "/images/highlight-table-arrangements.jpg",
    desc: "Elevate your reception dinner and VIP banquet tables with opulent elevated crystal centerpieces, lush cascading hydrangeas, blush roses, and glowing candlelight.",
    features: [
      "Elevated Crystal Centerpieces",
      "Lush Floral Banquet Runners",
      "Floating Candle & Glass Ambiance",
      "VIP Head Table Styling",
    ],
    whatsAppText:
      "Hello Occassions, I would like to inquire about wedding Table Arrangements.",
    href: "/table-arrangements",
  },
  {
    id: "car-decoration",
    gridClass: styles.cardWideTop, // Top-Right Wide Card
    tag: "Presents",
    title: "Car Decoration",
    subtitle: "VIP Bonnet Florals & Satin Posies",
    image: "/images/highlight-car-decorations.jpg",
    desc: "Transform your wedding arrival into an unforgettable spectacle with bespoke scratch-proof floral bonnets, door handle posies, and satin ribbons crafted with imported orchids and roses.",
    features: [
      "Imported Cymbidium Orchids",
      "Scratch-Proof Suction Mounting",
      "Door Posies & Satin Ribbons",
      "On-Site Venue Setup in Calicut",
    ],
    whatsAppText:
      "Hello Occassions, I would like to inquire about wedding Car Decoration.",
    href: "/car-decorations",
  },
  {
    id: "church-arrangement",
    gridClass: styles.cardBottomMid, // Bottom-Middle Card
    tag: "Wedding",
    title: "Church Arrangement",
    subtitle: "Grand Altar Arches & Aisle Florals",
    image: "/images/highlight-church-arrangements.jpg",
    desc: "Create a sacred, heavenly atmosphere for your wedding ceremony with grand cathedral altar arches, romantic candlelit pew decorations, and cascading aisle runners.",
    features: [
      "Grand Altar Floral Arch",
      "Romantic Candlelit Pew Posies",
      "Casablanca Lilies & Hydrangeas",
      "Parish Protocol Coordination",
    ],
    whatsAppText:
      "Hello Occassions, I would like to inquire about Church Arrangements and wedding altar florals.",
    href: "/church-arrangements",
  },
  {
    id: "garlands",
    gridClass: styles.cardBottomRight, // Bottom-Right Card
    tag: "Bouquet",
    title: "Garlands & Baskets",
    subtitle: "Fresh Jasmine Varmala & Gift Baskets",
    image: "/images/highlight-garlands.jpg",
    desc: "Handcrafted traditional and contemporary bridal garlands, reception varmalas, and auspicious gift flower baskets meticulously strung with fresh fragrant jasmine, lotus buds, and Dutch roses.",
    features: [
      "Fragrant Madurai Jasmine",
      "Feather-Light Ceremony Comfort",
      "Grade-A Dutch Rose Petals",
      "Traditional Uruli & Gift Baskets",
    ],
    whatsAppText:
      "Hello Occassions, I would like to inquire about fresh floral Garlands and wedding varmalas.",
    href: "/garlands-and-baskets",
  },
];

interface FallingPetal {
  id: number;
  src: string;
  left: string;
  size: number;
  delay: string;
  duration: string;
  swayDuration: string;
}

const fallingPetalsData: FallingPetal[] = [
  { id: 1, src: "/images/rose-petal.png", left: "5%", size: 30, delay: "-1.5s", duration: "8.5s", swayDuration: "3.2s" },
  { id: 2, src: "/images/jasmine-blossom.png", left: "14%", size: 34, delay: "-5.0s", duration: "9.2s", swayDuration: "4.0s" },
  { id: 3, src: "/images/rose-petal.png", left: "22%", size: 36, delay: "0.4s", duration: "8.0s", swayDuration: "3.5s" },
  { id: 4, src: "/images/jasmine-blossom.png", left: "32%", size: 28, delay: "-3.2s", duration: "8.8s", swayDuration: "3.8s" },
  { id: 5, src: "/images/rose-petal.png", left: "42%", size: 32, delay: "-6.8s", duration: "8.2s", swayDuration: "3.4s" },
  { id: 6, src: "/images/jasmine-blossom.png", left: "50%", size: 38, delay: "1.2s", duration: "9.6s", swayDuration: "4.2s" },
  { id: 7, src: "/images/rose-petal.png", left: "59%", size: 26, delay: "-4.4s", duration: "7.8s", swayDuration: "3.1s" },
  { id: 8, src: "/images/jasmine-blossom.png", left: "69%", size: 32, delay: "-2.0s", duration: "9.0s", swayDuration: "3.9s" },
  { id: 9, src: "/images/rose-petal.png", left: "78%", size: 35, delay: "2.0s", duration: "8.4s", swayDuration: "3.6s" },
  { id: 10, src: "/images/jasmine-blossom.png", left: "87%", size: 30, delay: "-6.0s", duration: "9.4s", swayDuration: "4.1s" },
  { id: 11, src: "/images/rose-petal.png", left: "95%", size: 32, delay: "-0.8s", duration: "8.6s", swayDuration: "3.3s" },
  { id: 12, src: "/images/rose-petal.png", left: "18%", size: 24, delay: "-7.5s", duration: "8.1s", swayDuration: "3.5s" },
  { id: 13, src: "/images/jasmine-blossom.png", left: "64%", size: 28, delay: "3.2s", duration: "8.9s", swayDuration: "3.7s" },
  { id: 14, src: "/images/rose-petal.png", left: "83%", size: 26, delay: "-3.8s", duration: "7.9s", swayDuration: "3.2s" },
];

export default function HighlightSection() {
  const router = useRouter();
  const [modalItem, setModalItem] = useState<HighlightCard | null>(null);
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: "60px 0px -20px 0px",
      }
    );

    const currentEl = sectionRef.current;
    if (currentEl) {
      observer.observe(currentEl);
    }

    return () => {
      if (currentEl) observer.unobserve(currentEl);
    };
  }, []);

  const getWhatsAppLink = (text: string) => {
    return `https://wa.me/918606464700?text=${encodeURIComponent(text)}`;
  };

  const handleCardClick = (card: HighlightCard) => {
    if (card.href) {
      router.push(card.href);
      return;
    }
    setModalItem(card);
  };

  const handleCloseModal = () => {
    setModalItem(null);
  };

  return (
    <section
      id="highlights"
      ref={sectionRef}
      className={`${styles.sectionWrapper} ${
        isInView ? styles.sectionInView : ""
      }`}
    >
      {/* ================= REALISTIC NATURE TRANSITION: FALLING FLOWERS ================= */}
      <div className={styles.petalsContainer} aria-hidden="true">
        {fallingPetalsData.map((petal) => (
          <div
            key={petal.id}
            className={styles.petalFallWrapper}
            style={{
              left: petal.left,
              animationDelay: petal.delay,
              animationDuration: petal.duration,
            }}
          >
            <div
              className={styles.petalSwayWrapper}
              style={{
                animationDuration: petal.swayDuration,
              }}
            >
              <img
                src={petal.src}
                alt=""
                className={styles.petalImg}
                style={{ width: `${petal.size}px` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ================= ROSE FLORAL ACCENT (LEFT SIDE ONLY) ================= */}
      <div className={styles.floralBgWrapper} aria-hidden="true">
        <img
          src="/images/highlight-roses-transparent-hd.png"
          alt=""
          className={styles.floralBgLeft}
        />
      </div>

      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionMainTitle}>Our Highlights</h2>
          <span className={styles.categoryTagline}>Exclusive Floristry</span>
        </div>

        {/* ================= CENTERED & LARGER 4-CARD BENTO GRID ================= */}
        <div className={styles.mosaicGrid}>
          {highlightCards.map((card) => (
            <div
              key={card.id}
              className={`${styles.mosaicCard} ${card.gridClass}`}
              onClick={() => handleCardClick(card)}
              role="button"
              tabIndex={0}
              aria-label={`View ${card.title}`}
            >
              <div className={styles.cardImgWrap}>
                {/* Photo with smooth scale transition */}
                <img
                  src={card.image}
                  alt={card.title}
                  className={styles.cardImg}
                  loading="lazy"
                />

                {/* Translucent overlay that deepens on hover */}
                <div className={styles.cardOverlay} />

                {/* Centered Typography */}
                <div className={styles.cardContentInner}>
                  <span className={styles.cardTag}>{card.tag}</span>
                  <h3 className={styles.cardTitle}>{card.title}</h3>
                  {card.href ? (
                    <Link
                      href={card.href}
                      className={styles.cardHoverBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <span>Explore</span>
                      <ArrowUpRight size={13} />
                    </Link>
                  ) : (
                    <span className={styles.cardHoverBtn}>
                      <span>Explore</span>
                      <ArrowUpRight size={13} />
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= FULL HIGH-RESOLUTION LIGHTBOX MODAL ================= */}
      {modalItem && (
        <div
          className={styles.modalBackdrop}
          onClick={handleCloseModal}
          role="dialog"
          aria-modal="true"
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              className={styles.modalCloseBtn}
              onClick={handleCloseModal}
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            {/* Left Column: Very Big High-Resolution Image */}
            <div className={styles.modalImageCol}>
              <img
                src={modalItem.image}
                alt={modalItem.title}
                className={styles.modalBigImg}
              />
            </div>

            {/* Right Column: Full Details, Floral Features & Direct WhatsApp Inquiry */}
            <div className={styles.modalDetailsCol}>
              <div>
                <span className={styles.modalTag}>{modalItem.tag}</span>
                <h3 className={styles.modalTitle}>{modalItem.title}</h3>
                <p className={styles.modalDesc}>{modalItem.desc}</p>

                <ul className={styles.modalFeaturesList}>
                  {modalItem.features.map((feat) => (
                    <li key={feat} className={styles.modalFeatureItem}>
                      <span className={styles.modalFeatureDot} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.modalActions}>
                <a
                  href={getWhatsAppLink(modalItem.whatsAppText)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.modalWhatsAppBtn}
                >
                  <MessageCircle size={16} />
                  <span>Inquire on WhatsApp (+91 8606 464 700)</span>
                </a>

                <a href="tel:+918606464700" className={styles.modalCallBtn}>
                  <Phone size={14} color="#ec4899" />
                  <span>Call Atelier Directly</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
