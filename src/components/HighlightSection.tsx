"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  MessageCircle,
  Phone,
  X,
  ArrowUpRight,
} from "lucide-react";
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

/* -------------------------------------------------------
   Floating petals
------------------------------------------------------- */

const fallingPetalsData = [
  {
    id: 1,
    src: "/images/rose-petal.png",
    left: "6%",
    size: 28,
    delay: "-2s",
    duration: "10s",
    swayDuration: "4s",
  },
  {
    id: 2,
    src: "/images/jasmine-blossom.png",
    left: "18%",
    size: 25,
    delay: "-5s",
    duration: "11s",
    swayDuration: "4.5s",
  },
  {
    id: 3,
    src: "/images/rose-petal.png",
    left: "34%",
    size: 30,
    delay: "-1s",
    duration: "9.5s",
    swayDuration: "3.8s",
  },
  {
    id: 4,
    src: "/images/jasmine-blossom.png",
    left: "52%",
    size: 24,
    delay: "-6s",
    duration: "10.5s",
    swayDuration: "4.2s",
  },
  {
    id: 5,
    src: "/images/rose-petal.png",
    left: "70%",
    size: 29,
    delay: "-3s",
    duration: "9.8s",
    swayDuration: "4s",
  },
  {
    id: 6,
    src: "/images/jasmine-blossom.png",
    left: "88%",
    size: 25,
    delay: "-7s",
    duration: "11.2s",
    swayDuration: "4.6s",
  },
];

/* -------------------------------------------------------
   Position classes
------------------------------------------------------- */

const positionClass: Record<
  HighlightCard["position"],
  string
> = {
  topLeft: styles.cardTopLeft,
  topRight: styles.cardTopRight,
  bottomLeft: styles.cardBottomLeft,
  bottomRight: styles.cardBottomRight,
};

/* -------------------------------------------------------
   Animation delays
------------------------------------------------------- */

const cardDelay: Record<
  HighlightCard["position"],
  string
> = {
  topLeft: "0.05s",
  topRight: "0.15s",
  bottomLeft: "0.35s",
  bottomRight: "0.45s",
};

/* -------------------------------------------------------
   Component
------------------------------------------------------- */

export default function HighlightSection() {
  const [modalItem, setModalItem] =
    useState<HighlightCard | null>(null);

  const [isInView, setIsInView] = useState(false);
  const [cardsInView, setCardsInView] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  /* -------------------------------------------------------
     Section observer
  ------------------------------------------------------- */

  useEffect(() => {
    if (typeof window === "undefined") return;

    const element = sectionRef.current;

    if (!element) return;

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

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  /* -------------------------------------------------------
     Card observer
  ------------------------------------------------------- */

  useEffect(() => {
    if (typeof window === "undefined") return;

    const element = gridRef.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCardsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  /* -------------------------------------------------------
     WhatsApp
  ------------------------------------------------------- */

  const getWhatsAppLink = (text: string) => {
    return `https://wa.me/918606464700?text=${encodeURIComponent(
      text
    )}`;
  };

  return (
    <section
      id="highlights"
      ref={sectionRef}
      className={`${styles.sectionWrapper} ${
        isInView ? styles.sectionInView : ""
      }`}
    >
      {/* -------------------------------------------------
          Floating petals
      ------------------------------------------------- */}

      <div
        className={styles.petalsContainer}
        aria-hidden="true"
      >
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
                style={{
                  width: `${petal.size}px`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className={styles.container}>

        {/* -------------------------------------------------
            Section heading
        ------------------------------------------------- */}

        <div
          className={`${styles.sectionHeader} ${
            isInView ? styles.headerInView : ""
          }`}
        >
          <span className={styles.subtitle}>
            Exclusive Floristry
          </span>

          <h2 className={styles.mainTitle}>
            Our Highlights
          </h2>

          <div
            className={styles.floralDivider}
            aria-hidden="true"
          >
            <span className={styles.dividerLine} />

            <span className={styles.dividerIcon}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="2"
                  fill="#ec4899"
                />

                <path
                  d="M12 3.8C12 3.8 9.5 7 9.5 9.2C9.5 10.6 10.6 11.5 12 11.5C13.4 11.5 14.5 10.6 14.5 9.2C14.5 7 12 3.8 12 3.8Z"
                  fill="#fbcfe8"
                  stroke="#ec4899"
                  strokeWidth="0.8"
                />

                <path
                  d="M12 20.2C12 20.2 9.5 17 9.5 14.8C9.5 13.4 10.6 12.5 12 12.5C13.4 12.5 14.5 13.4 14.5 14.8C14.5 17 12 20.2 12 20.2Z"
                  fill="#fbcfe8"
                  stroke="#ec4899"
                  strokeWidth="0.8"
                />

                <path
                  d="M3.8 12C3.8 12 7 9.5 9.2 9.5C10.6 9.5 11.5 10.6 11.5 12C11.5 13.4 10.6 14.5 9.2 14.5C7 14.5 3.8 12 3.8 12Z"
                  fill="#fbcfe8"
                  stroke="#ec4899"
                  strokeWidth="0.8"
                />

                <path
                  d="M20.2 12C20.2 12 17 9.5 14.8 9.5C13.4 9.5 12.5 10.6 12.5 12C12.5 13.4 13.4 14.5 14.8 14.5C17 14.5 20.2 12 20.2 12Z"
                  fill="#fbcfe8"
                  stroke="#ec4899"
                  strokeWidth="0.8"
                />
              </svg>
            </span>

            <span className={styles.dividerLine} />
          </div>
        </div>

        {/* -------------------------------------------------
            Editorial layout
        ------------------------------------------------- */}

        <div
          className={styles.editorialGrid}
          ref={gridRef}
        >
          {highlightCards.map((card) => (
            <EditorialCard
              key={card.id}
              card={card}
              isInView={cardsInView}
              posClass={positionClass[card.position]}
              delay={cardDelay[card.position]}
              onOpen={() => setModalItem(card)}
            />
          ))}

          {/* -------------------------------------------------
              Center content
          ------------------------------------------------- */}

          <div
            className={`${styles.centerPanel} ${
              cardsInView
                ? styles.centerPanelInView
                : ""
            }`}
          >
            <div className={styles.centerTopDecoration}>
              <span />
              <span className={styles.centerFlower}>
                ✦
              </span>
              <span />
            </div>

            <h3 className={styles.centerHeading}>
              <span>Make Every</span>
              <span>Moment Bloom</span>
            </h3>

            <span
              className={styles.centerRule}
              aria-hidden="true"
            />

            <p className={styles.centerBody}>
              Beautiful floral creations for
              <br />
              life&apos;s most special moments.
            </p>

            <div className={styles.centerBottomDecoration}>
              <span />
              <span className={styles.centerMiniFlower}>
                ✿
              </span>
              <span />
            </div>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------
          Modal
      ------------------------------------------------- */}

      {modalItem && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setModalItem(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`${modalItem.title} details`}
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
                <span className={styles.modalTag}>
                  {modalItem.tag}
                </span>

                <h3 className={styles.modalTitle}>
                  {modalItem.title}
                </h3>

                <p className={styles.modalDesc}>
                  {modalItem.desc}
                </p>

                <ul className={styles.modalFeaturesList}>
                  {modalItem.features.map((feature) => (
                    <li
                      key={feature}
                      className={
                        styles.modalFeatureItem
                      }
                    >
                      <span
                        className={
                          styles.modalFeatureDot
                        }
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.modalActions}>
                <a
                  href={getWhatsAppLink(
                    modalItem.whatsAppText
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={
                    styles.modalWhatsAppBtn
                  }
                >
                  <MessageCircle size={16} />

                  <span>
                    Inquire on WhatsApp
                  </span>
                </a>

                <a
                  href="tel:+918606464700"
                  className={styles.modalCallBtn}
                >
                  <Phone
                    size={14}
                    color="#ec4899"
                  />

                  <span>
                    Call Atelier Directly
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* ==========================================================
   Editorial Card
========================================================== */

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
      className={`${styles.editorialCard} ${posClass} ${
        isInView ? styles.cardInView : ""
      }`}
      style={
        {
          "--card-delay": delay,
        } as React.CSSProperties
      }
      onClick={onOpen}
      role="button"
      tabIndex={0}
      aria-label={`View ${card.title}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      <div className={styles.cardImgWrap}>
        <img
          src={card.image}
          alt={card.title}
          className={styles.cardImg}
          loading="lazy"
        />

        <div className={styles.cardGradient} />

        <div className={styles.cardLabel}>
          <span className={styles.cardTag}>
            {card.tag}
          </span>

          <span className={styles.cardTitle}>
            {card.title}
          </span>
        </div>

        {card.href ? (
          <Link
            href={card.href}
            className={styles.cardBtn}
            aria-label={`Explore ${card.title}`}
            onClick={(e) => e.stopPropagation()}
          >
            <ArrowUpRight size={17} strokeWidth={1.8} />
          </Link>
        ) : (
          <button
            type="button"
            className={styles.cardBtn}
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
            aria-label={`Explore ${card.title}`}
          >
            <ArrowUpRight
              size={17}
              strokeWidth={1.8}
            />
          </button>
        )}
      </div>
    </div>
  );
}