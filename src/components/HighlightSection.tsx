"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { MessageCircle, Phone, X, ArrowUpRight } from "lucide-react";
import styles from "./HighlightSection.module.css";

export interface HighlightCard {
  id: string;
  position: "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
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
    id: "stage-decor",
    position: "topLeft",
    tag: "Event",
    title: "Stage Decor",
    subtitle: "Grand Wedding & Event Stages",
    image: "/images/highlight-table-arrangements.jpg",
    desc: "Transform any stage into a breathtaking floral masterpiece. From grand wedding backdrops to elegant event stages, we craft immersive floral installations with cascading blooms, draping greens, and luminous lighting.",
    features: [
      "Custom Floral Backdrop Installations",
      "Cascading Bloom Arches",
      "Ambient Lighting Coordination",
      "On-Site Calicut Venue Setup",
    ],
    whatsAppText:
      "Hello Occassions Florist Calicut, I would like to inquire about Stage Decor for my event.",
    href: "/table-arrangements",
  },
  {
    id: "car-decor",
    position: "topRight",
    tag: "Presents",
    title: "Car Decor",
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
      "Hello Occassions Florist Calicut, I would like to inquire about wedding Car Decoration.",
    href: "/car-decorations",
  },
  {
    id: "garlands",
    position: "bottomLeft",
    tag: "Bouquet",
    title: "Garlands",
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
      "Hello Occassions Florist Calicut, I would like to inquire about fresh floral Garlands and wedding varmalas.",
    href: "/garlands-and-baskets",
  },
  {
    id: "church-arrangement",
    position: "bottomRight",
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
      "Hello Occassions Florist Calicut, I would like to inquire about Church Arrangements and wedding altar florals.",
    href: "/church-arrangements",
  },
];

const fallingPetalsData = [
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
];

const positionClass: Record<HighlightCard["position"], string> = {
  topLeft: styles.cardTopLeft,
  topRight: styles.cardTopRight,
  bottomLeft: styles.cardBottomLeft,
  bottomRight: styles.cardBottomRight,
};

const cardDelay: Record<HighlightCard["position"], string> = {
  topLeft: "0.1s",
  topRight: "0.22s",
  bottomLeft: "0.34s",
  bottomRight: "0.46s",
};

export default function HighlightSection() {
  const [modalItem, setModalItem] = useState<HighlightCard | null>(null);
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setIsInView(true);
        });
      },
      { threshold: 0.05, rootMargin: "60px 0px -20px 0px" }
    );
    const el = sectionRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, []);

  const getWhatsAppLink = (text: string) =>
    `https://wa.me/918606464700?text=${encodeURIComponent(text)}`;

  return (
    <section
      id="highlights"
      ref={sectionRef}
      className={`${styles.sectionWrapper} ${isInView ? styles.sectionInView : ""}`}
    >
      {/* Falling petals */}
      <div className={styles.petalsContainer} aria-hidden="true">
        {fallingPetalsData.map((petal) => (
          <div
            key={petal.id}
            className={styles.petalFallWrapper}
            style={{ left: petal.left, animationDelay: petal.delay, animationDuration: petal.duration }}
          >
            <div className={styles.petalSwayWrapper} style={{ animationDuration: petal.swayDuration }}>
              <img src={petal.src} alt="" className={styles.petalImg} style={{ width: `${petal.size}px` }} />
            </div>
          </div>
        ))}
      </div>


      <div className={styles.container}>
        {/* Section header */}
        <div className={`${styles.sectionHeader} ${isInView ? styles.headerInView : ""}`}>
          <span className={styles.subtitle}>Exclusive Floristry</span>
          <h2 className={styles.mainTitle}>Our Highlights</h2>
          <div className={styles.floralDivider} aria-hidden="true">
            <span className={styles.dividerLine} />
            <span className={styles.dividerIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="2.2" fill="#db2777" />
                <path d="M12 4.5C12 4.5 10 7.5 10 9.5C10 10.6 10.9 11.5 12 11.5C13.1 11.5 14 10.6 14 9.5C14 7.5 12 4.5 12 4.5Z" fill="#fbcfe8" stroke="#db2777" strokeWidth="0.8" />
                <path d="M12 19.5C12 19.5 10 16.5 10 14.5C10 13.4 10.9 12.5 12 12.5C13.1 12.5 14 13.4 14 14.5C14 16.5 12 19.5 12 19.5Z" fill="#fbcfe8" stroke="#db2777" strokeWidth="0.8" />
                <path d="M4.5 12C4.5 12 7.5 10 9.5 10C10.6 10 11.5 10.9 11.5 12C11.5 13.1 10.6 14 9.5 14C7.5 14 4.5 12 4.5 12Z" fill="#fbcfe8" stroke="#db2777" strokeWidth="0.8" />
                <path d="M19.5 12C19.5 12 16.5 10 14.5 10C13.4 10 12.5 10.9 12.5 12C12.5 13.1 13.4 14 14.5 14C16.5 14 19.5 12 19.5 12Z" fill="#fbcfe8" stroke="#db2777" strokeWidth="0.8" />
              </svg>
            </span>
            <span className={styles.dividerLine} />
          </div>
        </div>

        {/* Editorial 4-card + center composition */}
        <div className={styles.editorialGrid}>
          {highlightCards.map((card) => (
            <EditorialCard
              key={card.id}
              card={card}
              isInView={isInView}
              posClass={positionClass[card.position]}
              delay={cardDelay[card.position]}
              onOpen={() => setModalItem(card)}
            />
          ))}

          {/* Central text panel */}
          <div className={`${styles.centerPanel} ${isInView ? styles.centerPanelInView : ""}`}>
            <div className={styles.centerOrnament} aria-hidden="true">
              <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                <circle cx="26" cy="26" r="4.5" fill="#ec4899" />
                <ellipse cx="26" cy="13" rx="5.5" ry="10" fill="#fce7f3" stroke="#db2777" strokeWidth="1.2" />
                <ellipse cx="26" cy="39" rx="5.5" ry="10" fill="#fce7f3" stroke="#db2777" strokeWidth="1.2" />
                <ellipse cx="13" cy="26" rx="10" ry="5.5" fill="#fce7f3" stroke="#db2777" strokeWidth="1.2" />
                <ellipse cx="39" cy="26" rx="10" ry="5.5" fill="#fce7f3" stroke="#db2777" strokeWidth="1.2" />
              </svg>
            </div>

            <span className={styles.centerEyebrow}>OUR HIGHLIGHTS</span>
            <h3 className={styles.centerHeading}>
              Make Every<br />Moment Bloom
            </h3>
            <span className={styles.centerRule} aria-hidden="true" />
            <p className={styles.centerBody}>
              Beautiful floral creations for<br />life&apos;s most special moments.
            </p>
            <div className={styles.centerDots} aria-hidden="true">
              <span className={styles.dot} />
              <span className={`${styles.dot} ${styles.dotLarge}`} />
              <span className={styles.dot} />
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalItem && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setModalItem(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.modalCloseBtn}
              onClick={() => setModalItem(null)}
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
            <div className={styles.modalImageCol}>
              <img src={modalItem.image} alt={modalItem.title} className={styles.modalBigImg} />
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

function EditorialCard({
  card,
  isInView,
  posClass,
  delay,
  onOpen,
}: {
  card: HighlightCard;
  isInView: boolean;
  posClass: string;
  delay: string;
  onOpen: () => void;
}) {
  return (
    <div
      className={`${styles.editorialCard} ${posClass} ${isInView ? styles.cardInView : ""}`}
      style={{ "--card-delay": delay } as React.CSSProperties}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      aria-label={`View ${card.title}`}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
    >
      <div className={styles.cardImgWrap}>
        <img src={card.image} alt={card.title} className={styles.cardImg} loading="lazy" />
        <div className={styles.cardOverlay} />
        <div className={styles.cardLabel}>
          <span className={styles.cardTag}>{card.tag}</span>
          <span className={styles.cardTitle}>{card.title}</span>
          {card.href ? (
            <Link href={card.href} className={styles.cardBtn} onClick={(e) => e.stopPropagation()}>
              <span>Explore</span>
              <ArrowUpRight size={12} />
            </Link>
          ) : (
            <button type="button" className={styles.cardBtn} onClick={onOpen}>
              <span>Explore</span>
              <ArrowUpRight size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
