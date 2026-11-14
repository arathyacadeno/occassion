"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./ShopByOccasion.module.css";

interface OccasionCardItem {
  id: string;
  name: string;
  image: string;
  href: string;
  whatsappMessage: string;
}

const OCCASIONS_ITEMS: OccasionCardItem[] = [
  {
    id: "birthday",
    name: "Birthday",
    image: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647420/occasions/branding/occasion-birthday.png",
    href: "/flower-bouquets?occasion=birthday",
    whatsappMessage:
      "Hello Occassions Florist Calicut, I would like to order fresh flowers for a Birthday celebration.",
  },
  {
    id: "anniversary",
    name: "Anniversary",
    image: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647420/occasions/branding/occasion-anniversary.jpg",
    href: "/flower-bouquets?occasion=anniversary",
    whatsappMessage:
      "Hello Occassions Florist Calicut, I would like to explore luxury flowers for an Anniversary.",
  },
  {
    id: "get-well-soon",
    name: "Get Well Soon",
    image: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647421/occasions/branding/occasion-get-well-soon.jpg",
    href: "/flower-bouquets?occasion=get-well-soon",
    whatsappMessage:
      "Hello Occassions Florist Calicut, I would like to order cheerful Get Well Soon flowers.",
  },
  {
    id: "condolences",
    name: "Condolences",
    image: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647420/occasions/branding/occasion-condolences.jpg",
    href: "/flower-bouquets?occasion=condolences",
    whatsappMessage:
      "Hello Occassions Florist Calicut, I would like to inquire about sympathy and Condolences flowers.",
  },
  {
    id: "best-wishes",
    name: "Best Wishes",
    image: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647420/occasions/branding/occasion-best-wishes.jpg",
    href: "/flower-bouquets?occasion=best-wishes",
    whatsappMessage:
      "Hello Occassions Florist Calicut, I would like to order cheerful Best Wishes flowers.",
  },
  {
    id: "thank-you",
    name: "Thank You",
    image: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647421/occasions/branding/occasion-thank-you.jpg",
    href: "/flower-bouquets?occasion=thank-you",
    whatsappMessage:
      "Hello Occassions Florist Calicut, I would like to send a Thank You flower arrangement.",
  },
  {
    id: "wedding",
    name: "Wedding",
    image: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647421/occasions/branding/occasion-wedding.jpg",
    href: "/flower-bouquets?occasion=wedding",
    whatsappMessage:
      "Hello Occassions Florist Calicut, I would like to inquire about Wedding floral decor and bridal bouquets.",
  },
  {
    id: "congratulations",
    name: "Congratulations",
    image: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647421/occasions/branding/occasion-congratulations.png",
    href: "/flower-bouquets?occasion=congratulations",
    whatsappMessage:
      "Hello Occassions Florist Calicut, I would like to send Congratulations flower bouquets.",
  },
];

const ORIGINAL_COUNT = OCCASIONS_ITEMS.length;

interface ShopByOccasionProps {
  targetOccasion?: string;
}

export default function ShopByOccasion({ targetOccasion }: ShopByOccasionProps = {}) {
  const [occasions, setOccasions] = useState<OccasionCardItem[]>(OCCASIONS_ITEMS);
  const originalCount = occasions.length || 1;
  const startIndex = originalCount;

  const [index, setIndex] = useState(startIndex);
  const [withTransition, setWithTransition] = useState(true);
  const [visibleCount, setVisibleCount] = useState(3);
  const [isVisible, setIsVisible] = useState(false);

  const sectionRef = useRef<HTMLElement | null>(null);
  const isTransitioningRef = useRef(false);
  const pointerStartX = useRef<number | null>(null);
  const isPointerDown = useRef(false);

  // Dynamic fetch from API
  useEffect(() => {
    let isMounted = true;
    fetch("/api/occasions")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.occasions) && data.occasions.length > 0) {
          const activeList = data.occasions
            .filter((o: any) => o.active !== 0 && o.active !== false)
            .map((o: any) => ({
              id: o.slug || o.id,
              name: o.name,
              image: o.image || "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647420/occasions/branding/occasion-birthday.png",
              href: o.href || `/flower-bouquets?occasion=${o.slug}`,
              whatsappMessage:
                o.whatsapp_message ||
                `Hello Occassions Florist Calicut, I would like to order fresh flowers for ${o.name}.`,
            }));
          if (activeList.length > 0) {
            setOccasions(activeList);
            setIndex(activeList.length);
          }
        }
      })
      .catch((err) => console.warn("Dynamic occasions notice:", err));

    return () => {
      isMounted = false;
    };
  }, []);

  const extendedItems = [
    ...occasions.map((item, idx) => ({ ...item, uniqueKey: `pre-${idx}` })),
    ...occasions.map((item, idx) => ({ ...item, uniqueKey: `orig-${idx}` })),
    ...occasions.map((item, idx) => ({ ...item, uniqueKey: `post-${idx}` })),
  ];

  const findOccasionIndex = (idOrName: string) => {
    const target = idOrName.toLowerCase().trim().replace(/[-\s_]/g, "");
    return occasions.findIndex((item) => {
      const itemCleanId = item.id.toLowerCase().replace(/[-\s_]/g, "");
      const itemCleanName = item.name.toLowerCase().replace(/[-\s_]/g, "");
      return (
        itemCleanId === target ||
        itemCleanName === target ||
        itemCleanId.replace(/s$/, "") === target.replace(/s$/, "") ||
        itemCleanName.replace(/s$/, "") === target.replace(/s$/, "")
      );
    });
  };

  // Center a specific occasion card in the middle of the carousel
  const centerOccasion = (idOrName: string) => {
    if (!idOrName) return;
    const targetIdx = findOccasionIndex(idOrName);
    if (targetIdx === -1) return;

    isTransitioningRef.current = false;
    setWithTransition(true);

    setIndex((prevIndex) => {
      // On 3-card layout (desktop), center card is index + 1
      // On 1-card layout (mobile), center card is index
      const centerOffset = visibleCount === 3 ? 1 : 0;
      let currentCenter = (prevIndex + centerOffset) % originalCount;
      if (currentCenter < 0) currentCenter += originalCount;

      // Circular shortest distance delta (mod originalCount)
      let delta = (targetIdx - currentCenter) % originalCount;
      if (delta > originalCount / 2) delta -= originalCount;
      if (delta < -originalCount / 2) delta += originalCount;

      return prevIndex + delta;
    });
  };

  // Listen to prop changes
  useEffect(() => {
    if (targetOccasion) {
      centerOccasion(targetOccasion);
    }
  }, [targetOccasion, visibleCount]);

  // Listen to custom window events & URL query/hash changes
  useEffect(() => {
    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ occasion: string }>;
      if (customEvent.detail?.occasion) {
        centerOccasion(customEvent.detail.occasion);
      }
    };
    window.addEventListener("centerOccasionCard", handleCustomEvent);

    const checkUrlOccasion = () => {
      if (typeof window === "undefined") return;
      const urlParams = new URLSearchParams(window.location.search);
      let occ = urlParams.get("occasion");
      if (!occ && window.location.hash) {
        const hash = window.location.hash.replace("#", "");
        if (hash.includes("occasion=")) {
          const match = hash.match(/occasion=([^&]+)/);
          if (match) occ = decodeURIComponent(match[1]);
        }
      }
      if (occ) {
        centerOccasion(occ);
      }
    };

    checkUrlOccasion();
    window.addEventListener("hashchange", checkUrlOccasion);

    return () => {
      window.removeEventListener("centerOccasionCard", handleCustomEvent);
      window.removeEventListener("hashchange", checkUrlOccasion);
    };
  }, [visibleCount]);

  // Responsive visible count
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 680) {
        setVisibleCount(1);
      } else if (window.innerWidth < 960) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Intersection observer for section entrance animation
  useEffect(() => {
    const target = sectionRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -30px 0px",
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  // Infinite Navigation: Next
  const handleNext = () => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setWithTransition(true);
    setIndex((prev) => prev + 1);
  };

  // Infinite Navigation: Prev
  const handlePrev = () => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setWithTransition(true);
    setIndex((prev) => prev - 1);
  };

  // Handle loop wrap-around on transition end without visual jump
  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    isTransitioningRef.current = false;

    if (index >= startIndex + originalCount) {
      // Reached post clones: teleport back by originalCount items instantly
      setWithTransition(false);
      setIndex((prev) => prev - originalCount);
    } else if (index < startIndex - 4) {
      // Reached pre clones: teleport forward by originalCount items instantly
      setWithTransition(false);
      setIndex((prev) => prev + originalCount);
    }
  };

  // Re-enable transition after teleporting
  useEffect(() => {
    if (!withTransition) {
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setWithTransition(true);
        });
      });
      return () => cancelAnimationFrame(id);
    }
  }, [withTransition]);

  // Pointer / Touch Swipe Events
  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStartX.current = e.clientX;
    isPointerDown.current = true;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isPointerDown.current || pointerStartX.current === null) return;
    const diff = pointerStartX.current - e.clientX;
    isPointerDown.current = false;
    pointerStartX.current = null;

    if (diff > 45) {
      handleNext();
    } else if (diff < -45) {
      handlePrev();
    }
  };

  return (
    <section
      ref={sectionRef}
      className={styles.sectionWrapper}
      id="occasions"
      aria-label="Shop by Occasion"
    >
      <div className={styles.container}>
        {/* Section Header with Floral Divider */}
        <div
          className={`${styles.sectionHeader} ${isVisible ? styles.headerInView : ""
            }`}
        >
          <span className={styles.subtitle}>Special Moments</span>
          <h2 className={styles.mainTitle}>Shop By Occasion</h2>

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

        {/* White Rounded Card Container (same as Shop By Category) */}
        <div className={styles.whiteCardWrapper}>
          {/* Carousel Container with Always-Active Infinite Arrows */}
          <div className={styles.carouselContainer}>
            {/* Previous Button */}
            <button
              type="button"
              className={`${styles.navBtn} ${styles.prevBtn}`}
              onClick={handlePrev}
              aria-label="Previous occasion cards"
            >
              <ChevronLeft size={22} strokeWidth={2} />
            </button>

            {/* Viewport with generous padding so pill labels & shadows are never clipped */}
            <div
              className={styles.viewport}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
            >
              <div
                className={styles.track}
                onTransitionEnd={handleTransitionEnd}
                style={
                  {
                    "--index": index,
                    "--visible-count": visibleCount,
                    transform: `translateX(calc(-1 * ${index} * ((100% + var(--gap, 128px)) / var(--visible-count, 3))))`,
                    transition: withTransition
                      ? "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
                      : "none",
                  } as React.CSSProperties
                }
              >
                {extendedItems.map((item, cardIdx) => {
                  // When 3 cards are visible, the center card is lowered
                  const visiblePos = cardIdx - index;
                  const isCenter = visibleCount === 3 && visiblePos === 1;

                  return (
                    <div
                      key={item.uniqueKey}
                      className={`${styles.cardWrapper} ${isCenter ? styles.staggerCenter : styles.staggerSide
                        }`}
                    >
                      <OccasionCard item={item} isVisible={isVisible} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Next Button */}
            <button
              type="button"
              className={`${styles.navBtn} ${styles.nextBtn}`}
              onClick={handleNext}
              aria-label="Next occasion cards"
            >
              <ChevronRight size={22} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function OccasionCard({
  item,
  isVisible,
}: {
  item: OccasionCardItem;
  isVisible: boolean;
}) {
  const whatsappUrl = `https://wa.me/918606464700?text=${encodeURIComponent(
    item.whatsappMessage
  )}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.cardLink}
      aria-label={`Shop flowers for ${item.name}`}
    >
      <article
        className={`${styles.card} ${isVisible ? styles.cardVisible : ""}`}
      >
        {/* Large Rounded Image Frame */}
        <div className={styles.imageFrame}>
          <img
            src={item.image}
            alt={item.name}
            className={styles.cardImage}
            loading="lazy"
          />
        </div>

        {/* Pill Label with Dotted Rounded Outline */}
        <div className={styles.pillContainer}>
          <div className={styles.pillDottedOuter}>
            <span className={styles.pillSolidInner}>{item.name}</span>
          </div>
        </div>
      </article>
    </a>
  );
}