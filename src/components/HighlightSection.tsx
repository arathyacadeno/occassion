"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { MessageCircle, Phone, X, ArrowUpRight } from "lucide-react";
import BloomingFlowerAnimation from "./BloomingFlowerAnimation";
import styles from "./HighlightSection.module.css";

export interface HighlightCard {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  image: string;
  desc: string;
  features: string[];
  whatsAppText: string;
  href: string;
}

const highlightCards: HighlightCard[] = [
  {
    id: "car-decor",
    tag: "VIP Floristry",
    title: "Car Decor",
    subtitle: "VIP Bonnet Florals and Satin Posies",
    image: "/images/highlight-car-decorations.jpg",
    desc: "Transform your wedding arrival into an unforgettable spectacle with bespoke scratch-proof floral bonnets, door handle posies, and satin ribbons crafted with imported orchids and roses.",
    features: [
      "Imported Cymbidium Orchids",
      "Scratch-Proof Suction Mounting",
      "Door Posies and Satin Ribbons",
      "On-Site Venue Setup in Calicut",
    ],
    whatsAppText: "Hello Occassions Florist Calicut, I would like to inquire about wedding Car Decoration.",
    href: "/car-decorations",
  },
  {
    id: "stage-decor",
    tag: "Celebration",
    title: "Stage Decor",
    subtitle: "Opulent Banquet & Centerpiece Styling",
    image: "/images/highlight-table-arrangements.jpg",
    desc: "Elevate your stage and banquet reception with opulent floral backdrops, elevated crystal centerpieces, blush roses, cascading hydrangeas, and glowing candlelight ambiance.",
    features: [
      "Elevated Crystal Centerpieces",
      "Lush Floral Banquet Runners",
      "Floating Candle & Glass Ambiance",
      "VIP Head Table Styling",
    ],
    whatsAppText: "Hello Occassions Florist Calicut, I would like to inquire about wedding Table & Stage Arrangements.",
    href: "/table-arrangements",
  },
  {
    id: "church-arrangement",
    tag: "Ceremony",
    title: "Church Decor",
    subtitle: "Grand Altar Arches and Aisle Florals",
    image: "/images/highlight-church-arrangements.jpg",
    desc: "Create a sacred, heavenly atmosphere for your wedding ceremony with grand cathedral altar arches, romantic candlelit pew decorations, and cascading aisle runners.",
    features: [
      "Grand Altar Floral Arch",
      "Romantic Candlelit Pew Posies",
      "Casablanca Lilies and Hydrangeas",
      "Parish Protocol Coordination",
    ],
    whatsAppText: "Hello Occassions Florist Calicut, I would like to inquire about Church Arrangements and wedding altar florals.",
    href: "/church-arrangements",
  },
  {
    id: "garlands",
    tag: "Tradition",
    title: "Garlands",
    subtitle: "Fresh Jasmine Varmala and Gift Baskets",
    image: "/images/highlight-garlands.jpg",
    desc: "Handcrafted traditional and contemporary bridal garlands, reception varmalas, and auspicious gift flower baskets meticulously strung with fresh fragrant jasmine, lotus buds, and Dutch roses.",
    features: [
      "Fragrant Madurai Jasmine",
      "Feather-Light Ceremony Comfort",
      "Grade-A Dutch Rose Petals",
      "Traditional Uruli and Gift Baskets",
    ],
    whatsAppText: "Hello Occassions Florist Calicut, I would like to inquire about fresh floral Garlands and wedding varmalas.",
    href: "/garlands-and-baskets",
  },
];

export default function HighlightSection() {
  const [modalItem, setModalItem] = useState<HighlightCard | null>(null);
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const getWhatsAppLink = (text: string) =>
    `https://wa.me/918606464700?text=${encodeURIComponent(text)}`;

  return (
    <section
      id="highlights"
      ref={sectionRef}
      className={`${styles.sectionWrapper} ${isInView ? styles.sectionInView : ""}`}
    >
      {/* Corner animated blooming flower */}
      <div className={styles.bloomingFlowerWrap} aria-hidden="true">
        <BloomingFlowerAnimation />
      </div>

      <div className={styles.container}>
        <div className={styles.splitLayout}>
          {/* Left Column: Heading, Description */}
          <div className={styles.leftCol}>
            <div className={styles.textContent}>
              <h2 className={styles.heading}>
                Make Every<br />
                Moment Bloom
              </h2>
              <p className={styles.description}>
                Explore fresh seasonal flowers and elegant bouquets, carefully crafted
                to bring beauty, warmth, and joy to every moment.
              </p>
            </div>
          </div>

          {/* Right Column: 2x2 Grid of Cards */}
          <div className={styles.rightCol}>
            <div className={styles.cardsGrid}>
              {highlightCards.map((card, idx) => (
                <div
                  key={card.id}
                  className={styles.card}
                  style={{ animationDelay: `${0.1 + idx * 0.1}s` }}
                  onClick={() => setModalItem(card)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${card.title}`}
                  onKeyDown={(e) => e.key === "Enter" && setModalItem(card)}
                >
                  <div className={styles.cardImgWrap}>
                    <img
                      src={card.image}
                      alt={card.title}
                      className={styles.cardImg}
                      loading="lazy"
                    />
                    <div className={styles.cardOverlay}>
                      <span className={styles.cardTitle}>{card.title}</span>
                      <Link
                        href={card.href}
                        className={styles.cardArrowBtn}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Explore ${card.title}`}
                      >
                        <ArrowUpRight size={17} strokeWidth={2.4} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {modalItem && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setModalItem(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.modalCloseBtn}
              onClick={() => setModalItem(null)}
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
            <div className={styles.modalImageCol}>
              <img
                src={modalItem.image}
                alt={modalItem.title}
                className={styles.modalBigImg}
              />
            </div>
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
