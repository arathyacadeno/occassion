"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import BloomingFlowerAnimation from "./BloomingFlowerAnimation";
import HighlightGalleryModal from "./HighlightGalleryModal";
import { Highlight } from "./admin/HighlightManager";
import styles from "./HighlightSection.module.css";

// Initial default highlights for instant SSR & fast initial render before API responds
const DEFAULT_HIGHLIGHTS: Highlight[] = [
  {
    id: "car-decor",
    slug: "car-decor",
    tag: "VIP Floristry",
    title: "Car Decor",
    subtitle: "VIP Bonnet Florals and Satin Posies",
    cover_image: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647418/occasions/products/general/highlight-car-decorations.jpg",
    description: "Transform your wedding arrival into an unforgettable spectacle with bespoke scratch-proof floral bonnets, door handle posies, and satin ribbons crafted with imported orchids and roses.",
    starting_price: 1800,
    price_display: "₹ 1,800",
    whatsapp_number: "918606464700",
    whatsapp_text: "Hello Occasions Florist Calicut, I would like to inquire about wedding Car Decoration.",
    call_number: "+918606464700",
    call_text: "Call Atelier Directly",
    guarantee_text: "100% Freshness Guarantee",
    features: [
      "Imported Cymbidium Orchids",
      "Scratch-Proof Suction Mounting",
      "Door Posies and Satin Ribbons",
      "On-Site Venue Setup in Calicut",
    ],
    active: 1,
    display_order: 1,
  },
  {
    id: "stage-decor",
    slug: "stage-decor",
    tag: "Celebration",
    title: "Stage Decor",
    subtitle: "Opulent Banquet & Centerpiece Styling",
    cover_image: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647424/occasions/products/stage-decor/stage-decor-7.jpg",
    description: "Elevate your stage and banquet reception with opulent floral backdrops, elevated crystal centerpieces, blush roses, cascading hydrangeas, and glowing candlelight ambiance.",
    starting_price: 18000,
    price_display: "₹ 18,000",
    whatsapp_number: "918606464700",
    whatsapp_text: "Hello Occasions Florist Calicut, I would like to inquire about wedding Table & Stage Arrangements.",
    call_number: "+918606464700",
    call_text: "Call Atelier Directly",
    guarantee_text: "100% Freshness Guarantee",
    features: [
      "Elevated Crystal Centerpieces",
      "Lush Floral Banquet Runners",
      "Floating Candle & Glass Ambiance",
      "VIP Head Table Styling",
    ],
    active: 1,
    display_order: 2,
  },
  {
    id: "church-decor",
    slug: "church-decor",
    tag: "Ceremony",
    title: "Church Decor",
    subtitle: "Grand Altar Arches and Aisle Florals",
    cover_image: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647418/occasions/products/general/highlight-church-arrangements.jpg",
    description: "Create a sacred, heavenly atmosphere for your wedding ceremony with grand cathedral altar arches, romantic candlelit pew decorations, and cascading aisle runners.",
    starting_price: 16500,
    price_display: "₹ 16,500",
    whatsapp_number: "918606464700",
    whatsapp_text: "Hello Occasions Florist Calicut, I would like to inquire about Church Arrangements and wedding altar florals.",
    call_number: "+918606464700",
    call_text: "Call Atelier Directly",
    guarantee_text: "100% Freshness Guarantee",
    features: [
      "Grand Altar Floral Arch",
      "Romantic Candlelit Pew Posies",
      "Casablanca Lilies and Hydrangeas",
      "Parish Protocol Coordination",
    ],
    active: 1,
    display_order: 3,
  },
  {
    id: "garlands",
    slug: "garlands",
    tag: "Tradition",
    title: "Garlands",
    subtitle: "Fresh Jasmine Varmala and Gift Baskets",
    cover_image: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647414/occasions/products/garlands/garlands-1.webp",
    description: "Handcrafted traditional and contemporary bridal garlands, reception varmalas, and auspicious gift flower baskets meticulously strung with fresh fragrant jasmine, lotus buds, and Dutch roses.",
    starting_price: 2500,
    price_display: "₹ 2,500",
    whatsapp_number: "918606464700",
    whatsapp_text: "Hello Occasions Florist Calicut, I would like to inquire about fresh floral Garlands and wedding varmalas.",
    call_number: "+918606464700",
    call_text: "Call Atelier Directly",
    guarantee_text: "100% Freshness Guarantee",
    features: [
      "Fragrant Madurai Jasmine",
      "Feather-Light Ceremony Comfort",
      "Grade-A Dutch Rose Petals",
      "Traditional Uruli and Gift Baskets",
    ],
    active: 1,
    display_order: 4,
  },
];

export default function HighlightSection() {
  const [highlights, setHighlights] = useState<Highlight[]>(DEFAULT_HIGHLIGHTS);
  const [selectedHighlight, setSelectedHighlight] = useState<Highlight | null>(null);
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Fetch highlights dynamically from Neon PostgreSQL
  useEffect(() => {
    let isMounted = true;
    fetch("/api/highlights", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.success && Array.isArray(data.highlights) && data.highlights.length > 0) {
          setHighlights(data.highlights);
        }
      })
      .catch((err) => {
        console.error("Failed to load highlights from DB:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCardClick = (item: Highlight) => {
    // If the highlight object doesn't have its full gallery loaded, fetch it
    if (!item.gallery || item.gallery.length === 0) {
      fetch(`/api/highlights?id=${encodeURIComponent(item.id)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.success && d.highlight) {
            setSelectedHighlight(d.highlight);
          } else {
            setSelectedHighlight(item);
          }
        })
        .catch(() => setSelectedHighlight(item));
    } else {
      setSelectedHighlight(item);
    }
  };

  // URL Hash & Custom event navigation support
  useEffect(() => {
    if (typeof window === "undefined") return;

    const openBySlug = (slugOrId: string) => {
      const match = highlights.find(
        (h) =>
          h.slug === slugOrId ||
          h.id === slugOrId ||
          (slugOrId === "church-arrangement" && (h.slug === "church-decor" || h.id === "church-decor"))
      );
      if (match) {
        handleCardClick(match);
      }
    };

    const checkHash = () => {
      const hash = window.location.hash.replace(/^#/, "");
      if (hash) {
        openBySlug(hash);
      }
    };

    checkHash();
    window.addEventListener("hashchange", checkHash);

    const handleCarOpen = () => openBySlug("car-decor");
    const handleStageOpen = () => openBySlug("stage-decor");
    const handleGarlandsOpen = () => openBySlug("garlands");
    const handleChurchOpen = () => openBySlug("church-decor");

    window.addEventListener("open-car-decor-modal", handleCarOpen);
    window.addEventListener("open-stage-decor-modal", handleStageOpen);
    window.addEventListener("open-garlands-modal", handleGarlandsOpen);
    window.addEventListener("open-church-decor-modal", handleChurchOpen);

    return () => {
      window.removeEventListener("hashchange", checkHash);
      window.removeEventListener("open-car-decor-modal", handleCarOpen);
      window.removeEventListener("open-stage-decor-modal", handleStageOpen);
      window.removeEventListener("open-garlands-modal", handleGarlandsOpen);
      window.removeEventListener("open-church-decor-modal", handleChurchOpen);
    };
  }, [highlights]);

  // Viewport animation observer
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

  const handleCloseModal = () => {
    setSelectedHighlight(null);
    if (typeof window !== "undefined" && window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  };

  return (
    <section
      id="highlights"
      ref={sectionRef}
      className={`${styles.sectionWrapper} ${isInView ? styles.sectionInView : ""}`}
    >
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <span className={styles.subtitle}>Signature Collection</span>
          <h2 className={styles.mainTitle}>Our Highlights</h2>

          {/* Decorative floral icon with thin horizontal lines */}
          <div className={styles.floralDivider} aria-hidden="true">
            <span className={styles.dividerLine} />
            <span className={styles.dividerIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="2.2" fill="#db2777" />
                <path
                  d="M12 4.5C12 4.5 10 7.5 10 9.5C10 10.6 10.9 11.5 12 11.5C13.1 11.5 14 10.6 14 9.5C14 7.5 12 4.5 12 4.5Z"
                  fill="#fbcfe8"
                  stroke="#db2777"
                  strokeWidth="0.8"
                />
                <path
                  d="M12 19.5C12 19.5 10 16.5 10 14.5C10 13.4 10.9 12.5 12 12.5C13.1 12.5 14 13.4 14 14.5C14 16.5 12 19.5 12 19.5Z"
                  fill="#fbcfe8"
                  stroke="#db2777"
                  strokeWidth="0.8"
                />
                <path
                  d="M4.5 12C4.5 12 7.5 10 9.5 10C10.6 10 11.5 10.9 11.5 12C11.5 13.1 10.6 14 9.5 14C7.5 14 4.5 12 4.5 12Z"
                  fill="#fbcfe8"
                  stroke="#db2777"
                  strokeWidth="0.8"
                />
                <path
                  d="M19.5 12C19.5 12 16.5 10 14.5 10C13.4 10 12.5 10.9 12.5 12C12.5 13.1 13.4 14 14.5 14C16.5 14 19.5 12 19.5 12Z"
                  fill="#fbcfe8"
                  stroke="#db2777"
                  strokeWidth="0.8"
                />
              </svg>
            </span>
            <span className={styles.dividerLine} />
          </div>
        </div>

        {/* White Rounded Card (1654 x 1002) */}
        <div className={styles.whiteCardWrapper}>
          {/* Animated blooming flower: bottom-left corner inside the white card */}
          <div className={styles.bloomingFlowerWrap} aria-hidden="true">
            <BloomingFlowerAnimation />
          </div>

          <div className={styles.splitLayout}>
            {/* Left Column: Heading, Description */}
            <div className={styles.leftCol}>
              <div className={styles.textContent}>
                <h3 className={styles.heading}>
                  Make Every<br />
                  Moment Bloom
                </h3>
                <p className={styles.description}>
                  Explore fresh seasonal flowers and elegant bouquets, carefully crafted
                  to bring beauty, warmth, and joy to every moment.
                </p>
              </div>
            </div>

            {/* Right Column: Dynamic Grid of Cards */}
            <div className={styles.rightCol}>
              <div className={styles.cardsGrid}>
                {highlights.map((card, idx) => (
                  <div
                    key={card.id}
                    className={styles.card}
                    style={{ animationDelay: `${0.1 + idx * 0.1}s` }}
                    onClick={() => handleCardClick(card)}
                    role="button"
                    tabIndex={0}
                    aria-label={`View ${card.title}`}
                    onKeyDown={(e) => e.key === "Enter" && handleCardClick(card)}
                  >
                    <div className={styles.cardImgWrap}>
                      <img
                        src={card.cover_image}
                        alt={card.title}
                        className={styles.cardImg}
                        loading="lazy"
                      />
                      <div className={styles.cardOverlay}>
                        <span className={styles.cardTitle}>{card.title}</span>
                        <button
                          type="button"
                          className={styles.cardArrowBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCardClick(card);
                          }}
                          aria-label={`View ${card.title} details`}
                        >
                          <ArrowUpRight size={17} strokeWidth={2.4} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Unified Dynamic Showcase Modal */}
      <HighlightGalleryModal
        isOpen={!!selectedHighlight}
        onClose={handleCloseModal}
        highlight={selectedHighlight}
      />
    </section>
  );
}
