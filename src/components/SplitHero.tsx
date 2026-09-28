"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "./SplitHero.module.css";

interface SplitHeroProps {
  onOpenMenu?: () => void;
  targetSlide?: number;
  onSlideChange?: (slide: number) => void;
}

export default function SplitHero({
  onOpenMenu,
  targetSlide,
  onSlideChange,
}: SplitHeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const currentSlideRef = useRef(0);
  const isLockedRef = useRef(false);
  const touchStartY = useRef<number | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const totalSlides = 3;

  useEffect(() => {
    currentSlideRef.current = currentSlide;
  }, [currentSlide]);

  useEffect(() => {
    isLockedRef.current = isLocked;
  }, [isLocked]);

  // Video element ref to guarantee browser autoplay with muted sound
  const handleVideoRef = (el: HTMLVideoElement | null) => {
    if (el) {
      el.muted = true;
      el.defaultMuted = true;
      const playPromise = el.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    }
  };

  // Scroll smoothly to highlights on Explore More
  const handleExploreClick = () => {
    const highlightEl = document.getElementById("highlights");
    if (highlightEl) {
      highlightEl.scrollIntoView({ behavior: "smooth" });
    } else if (onOpenMenu) {
      onOpenMenu();
    }
  };

  const slidesData = [
    {
      id: 0,
      left: {
        type: "text" as const,
        tagline: "For flower lovers",
        title: "EVERYTHING YOU NEED",
        description:
          "From handcrafted bridal bouquets to lavish floral stages, we craft exquisite bespoke arrangements using fresh premium blossoms to celebrate life’s most cherished celebrations.",
        btnText: "EXPLORE MORE",
        bgIllustration: "/images/slide1-art.jpg",
      },
      right: {
        type: "image" as const,
        bgImage: "/images/slide1-flower.jpg",
        video: "/videos/hero-blooming.mp4",
        cursiveOverlay: "Wonderful gift",
      },
    },
    {
      id: 1,
      left: {
        type: "image" as const,
        bgImage: "/images/slide2-flower.jpg",
        video: "/videos/hero-florist.mp4",
        cursiveOverlay: "Flower power",
      },
      right: {
        type: "text" as const,
        tagline: "For flower lovers",
        title: "PERFECT CHOICE",
        description:
          "Curated with passion and artistic finesse, our master florists hand-select every stem from trusted growers to create unforgettable impressions for weddings, anniversaries, and heartfelt gifts.",
        btnText: "EXPLORE MORE",
        bgIllustration: "/images/slide2-art.jpg",
      },
    },
    {
      id: 2,
      left: {
        type: "text" as const,
        tagline: "For flower lovers",
        title: "FOR EVERY OCCASION",
        description:
          "Whether adorning luxury wedding cars, sacred church altars, or intimate banquet tables, our signature floral designs bring timeless elegance, fragrance, and joy to every moment.",
        btnText: "EXPLORE MORE",
        bgIllustration: "/images/slide3-art.jpg",
      },
      right: {
        type: "image" as const,
        bgImage: "/images/slide3-flower.jpg",
        video: "/videos/hero-blooming.mp4",
        cursiveOverlay: "Truly magical",
      },
    },
  ];

  // Navigate to slide with 1000ms animation lock
  const goToSlide = useCallback((index: number) => {
    if (index < 0 || index >= totalSlides) return;
    setIsLocked(true);
    isLockedRef.current = true;
    setCurrentSlide(index);
    currentSlideRef.current = index;
    onSlideChange?.(index);
    setTimeout(() => {
      setIsLocked(false);
      isLockedRef.current = false;
    }, 1000);
  }, [totalSlides, onSlideChange]);

  useEffect(() => {
    if (targetSlide !== undefined && targetSlide >= 0 && targetSlide < totalSlides) {
      goToSlide(targetSlide);
    }
  }, [targetSlide, goToSlide, totalSlides]);

  // Auto-play slideshow animation every 4.5 seconds (pauses on user hover)
  useEffect(() => {
    if (isHovered) return;

    const timer = setInterval(() => {
      if (!isLockedRef.current && typeof window !== "undefined" && window.scrollY <= 40) {
        const next = (currentSlideRef.current + 1) % totalSlides;
        goToSlide(next);
      }
    }, 4500);

    return () => clearInterval(timer);
  }, [isHovered, goToSlide, totalSlides]);

  // Handle Wheel Events: Strictly locks scroll in hero until all slides are fully animated
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const scrollY = window.scrollY;

      // When the user is at the top of the page (in the hero view)
      if (scrollY <= 15) {
        // User is scrolling DOWN
        if (e.deltaY > 0) {
          // If we haven't reached the final slide (Slide 0 or Slide 1):
          // Always prevent default native scroll so the hero cannot be bypassed!
          if (currentSlideRef.current < totalSlides - 1) {
            e.preventDefault();
            if (!isLockedRef.current && e.deltaY >= 8) {
              goToSlide(currentSlideRef.current + 1);
            }
            return;
          }

          // If we ARE on the final slide (Slide 2):
          // While the final slide is still animating in, keep scroll locked!
          if (isLockedRef.current) {
            e.preventDefault();
            return;
          }

          // Final slide is now FULLY ANIMATED!
          // Only now does scrolling down smoothly transition to the next section
          if (e.deltaY >= 12) {
            const highlightEl = document.getElementById("highlights");
            if (highlightEl) {
              e.preventDefault();
              highlightEl.scrollIntoView({ behavior: "smooth" });
            }
          }
          return;
        }

        // User is scrolling UP while in hero view
        if (e.deltaY < 0) {
          if (currentSlideRef.current > 0) {
            e.preventDefault();
            if (!isLockedRef.current && e.deltaY <= -8) {
              goToSlide(currentSlideRef.current - 1);
            }
          } else {
            // Already at slide 0, allow natural behavior
          }
          return;
        }
      } else {
        // User is further down the page (in highlights or footer)
        // If user scrolls UP and arrives back at the top:
        if (scrollY <= 25 && e.deltaY < -20 && !isLockedRef.current) {
          if (currentSlideRef.current > 0) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
            setTimeout(() => {
              goToSlide(currentSlideRef.current - 1);
            }, 300);
          }
        }
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [goToSlide, totalSlides]);

  // Touch Swipe Handling for Mobile / Tablet with non-passive touchmove listener
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartY.current === null) return;
      const currentY = e.touches[0].clientY;
      const diffY = touchStartY.current - currentY; // positive = swipe up (scroll down)

      if (window.scrollY <= 15) {
        // Lock native scroll if not on last slide or currently animating
        if (currentSlideRef.current < totalSlides - 1 || isLockedRef.current) {
          if (e.cancelable) e.preventDefault();
        } else if (diffY < 0 && currentSlideRef.current > 0) {
          if (e.cancelable) e.preventDefault();
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartY.current === null || window.scrollY > 15 || isLockedRef.current) {
        touchStartY.current = null;
        return;
      }
      const touchEndY = e.changedTouches[0].clientY;
      const diffY = touchStartY.current - touchEndY;
      touchStartY.current = null;

      if (diffY > 40) {
        // Swipe Up (Scroll Down)
        if (currentSlideRef.current < totalSlides - 1) {
          goToSlide(currentSlideRef.current + 1);
        } else {
          // Fully animated on last slide -> smoothly go to next section
          const highlightEl = document.getElementById("highlights");
          highlightEl?.scrollIntoView({ behavior: "smooth" });
        }
      } else if (diffY < -40) {
        // Swipe Down (Scroll Up)
        if (currentSlideRef.current > 0) {
          goToSlide(currentSlideRef.current - 1);
        }
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [goToSlide, totalSlides]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (window.scrollY > 15) return;

      if (e.key === "ArrowDown" || e.key === "PageDown") {
        if (currentSlideRef.current < totalSlides - 1) {
          e.preventDefault();
          if (!isLockedRef.current) goToSlide(currentSlideRef.current + 1);
        } else if (isLockedRef.current) {
          e.preventDefault();
        } else {
          // Fully animated on last slide
          const highlightEl = document.getElementById("highlights");
          if (highlightEl) {
            e.preventDefault();
            highlightEl.scrollIntoView({ behavior: "smooth" });
          }
        }
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        if (currentSlideRef.current > 0) {
          e.preventDefault();
          if (!isLockedRef.current) goToSlide(currentSlideRef.current - 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToSlide, totalSlides]);

  // Prevent any native page scrolling while hero slides are still in progress
  useEffect(() => {
    const handleScroll = () => {
      if (currentSlideRef.current < totalSlides - 1 && window.scrollY > 0) {
        window.scrollTo(0, 0);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [totalSlides]);

  // MultiScroll Counter-sliding Calculations:
  const leftTransform = `translateY(calc(-${currentSlide} * var(--slide-h, calc(100vh - 100px))))`;
  const rightTransform = `translateY(calc(-${totalSlides - 1 - currentSlide} * var(--slide-h, calc(100vh - 100px))))`;

  // Right panels arranged in reverse order [slide2, slide1, slide0] so index 2 is slide0, index 1 is slide1, index 0 is slide2
  const reversedRightPanels = [slidesData[2].right, slidesData[1].right, slidesData[0].right];

  return (
    <section
      ref={heroRef}
      className={styles.heroWrapper}
      id="hero-slider"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.splitContainer}>
        {/* Left Half (Slides UP) */}
        <div className={styles.leftColumn}>
          <div
            className={styles.leftTrack}
            style={{ transform: leftTransform }}
          >
            {slidesData.map((slide, idx) => (
              <div
                key={`left-${slide.id}`}
                className={`${styles.slidePanel} ${
                  currentSlide === idx ? styles.activeSlide : ""
                } ${slide.left.type === "image" ? styles.imagePanel : styles.textPanel}`}
                style={
                  slide.left.type === "image"
                    ? { backgroundImage: `url(${slide.left.bgImage})` }
                    : undefined
                }
              >
                {slide.left.type === "image" ? (
                  <>
                    {slide.left.video && (
                      <video
                        ref={handleVideoRef}
                        className={styles.slideVideo}
                        src={slide.left.video}
                        autoPlay
                        muted
                        loop
                        playsInline
                        poster={slide.left.bgImage}
                      />
                    )}
                    <div className={styles.imageOverlayGradient} />
                    <div className={styles.cursiveOverlay}>
                      {slide.left.cursiveOverlay}
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      className={styles.bgIllustration}
                      style={{
                        backgroundImage: `url(${slide.left.bgIllustration})`,
                      }}
                    />
                    <div className={styles.textContent}>
                      <div className={styles.tagline}>{slide.left.tagline}</div>
                      <h2 className={styles.title}>{slide.left.title}</h2>
                      <p className={styles.description}>
                        {slide.left.description}
                      </p>
                      <div className={styles.buttonWrapper}>
                        <button
                          className={styles.readMoreBtn}
                          onClick={handleExploreClick}
                        >
                          {slide.left.btnText}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Half (Slides DOWN - Counter Direction MultiScroll) */}
        <div className={styles.rightColumn}>
          <div
            className={styles.rightTrack}
            style={{ transform: rightTransform }}
          >
            {reversedRightPanels.map((panel, revIdx) => {
              // Map reverse index back to original slide index:
              // revIdx 0 -> slide 2
              // revIdx 1 -> slide 1
              // revIdx 2 -> slide 0
              const originalSlideIdx = totalSlides - 1 - revIdx;
              const isActive = currentSlide === originalSlideIdx;

              return (
                <div
                  key={`right-${revIdx}`}
                  className={`${styles.slidePanel} ${
                    isActive ? styles.activeSlide : ""
                  } ${panel.type === "image" ? styles.imagePanel : styles.textPanel}`}
                  style={
                    panel.type === "image"
                      ? { backgroundImage: `url(${panel.bgImage})` }
                      : undefined
                  }
                >
                  {panel.type === "image" ? (
                    <>
                      {panel.video && (
                        <video
                          ref={handleVideoRef}
                          className={styles.slideVideo}
                          src={panel.video}
                          autoPlay
                          muted
                          loop
                          playsInline
                          poster={panel.bgImage}
                        />
                      )}
                      <div className={styles.imageOverlayGradient} />
                      <div className={styles.cursiveOverlay}>
                        {panel.cursiveOverlay}
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        className={styles.bgIllustration}
                        style={{
                          backgroundImage: `url(${panel.bgIllustration})`,
                        }}
                      />
                      <div className={styles.textContent}>
                        <div className={styles.tagline}>{panel.tagline}</div>
                        <h2 className={styles.title}>{panel.title}</h2>
                        <p className={styles.description}>
                          {panel.description}
                        </p>
                        <div className={styles.buttonWrapper}>
                          <button
                            className={styles.readMoreBtn}
                            onClick={handleExploreClick}
                          >
                            {panel.btnText}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Vertical Pagination Dots (Matches Rosebud) */}
      <div className={styles.paginationHolder} aria-label="Slider Pagination">
        {slidesData.map((s, idx) => (
          <button
            key={`dot-${s.id}`}
            className={`${styles.dotButton} ${
              currentSlide === idx ? styles.dotActive : ""
            }`}
            onClick={() => goToSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          >
            <span className={styles.dotCircle} />
            <span className={styles.dotTooltip}>
              0{idx + 1} {s.left.type === "text" ? s.left.title : s.right.title}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
