"use client";

import React, { useState, useEffect, useRef } from "react";
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
  const [scrollProgress, setScrollProgress] = useState(0);
  const currentSlideRef = useRef(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const totalSlides = 3;

  // Slide content data
  const slidesData = [
    {
      id: 0,
      left: {
        type: "text" as const,
        tagline: "For flower lovers",
        title: "Everything You Need",
        description:
          "From handcrafted bridal bouquets to lavish floral stages, we craft exquisite bespoke arrangements using fresh premium blossoms to celebrate life’s most cherished celebrations.",
        btnText: "Explore More",
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
        title: "Perfect Choice",
        description:
          "Curated with passion and artistic finesse, our master florists hand-select every stem from trusted growers to create unforgettable impressions for weddings, anniversaries, and heartfelt gifts.",
        btnText: "Explore More",
        bgIllustration: "/images/slide2-art.jpg",
      },
    },
    {
      id: 2,
      left: {
        type: "text" as const,
        tagline: "For flower lovers",
        title: "For Every Occasion",
        description:
          "Whether adorning luxury wedding cars, sacred church altars, or intimate banquet tables, our signature floral designs bring timeless elegance, fragrance, and joy to every moment.",
        btnText: "Explore More",
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

  // Right panels arranged in reverse order [slide2, slide1, slide0]
  const reversedRightPanels = [
    slidesData[2].right,
    slidesData[1].right,
    slidesData[0].right,
  ];

  // Scroll smoothly to shop section on Explore More
  const handleExploreClick = () => {
    const nextEl =
      document.getElementById("category-section") ||
      document.getElementById("highlights");
    if (nextEl) {
      nextEl.scrollIntoView({ behavior: "smooth" });
    } else if (onOpenMenu) {
      onOpenMenu();
    }
  };

  // Video playback management: play active video, pause others, preload next
  useEffect(() => {
    videoRefs.current.forEach((vid, idx) => {
      if (!vid) return;
      if (idx === currentSlide) {
        vid.muted = true;
        vid.defaultMuted = true;
        const playPromise = vid.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {});
        }
      } else {
        vid.pause();
      }
    });
  }, [currentSlide]);

  // Passive native scroll handling with requestAnimationFrame
  useEffect(() => {
    let rafId: number | null = null;

    const handleScroll = () => {
      if (!wrapperRef.current) return;

      const rect = wrapperRef.current.getBoundingClientRect();
      const windowH = window.innerHeight;
      const totalScrollable = rect.height - windowH;

      if (totalScrollable <= 0) return;

      // Scrolled distance inside the wrapper
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / totalScrollable));
      setScrollProgress(progress);

      // Finish 3rd video at ~90% progress so the last 10% is a calm release
      const effectiveProgress = Math.min(1, progress / 0.9);
      const activeIndex = Math.min(
        totalSlides - 1,
        Math.floor(effectiveProgress * totalSlides)
      );

      if (activeIndex !== currentSlideRef.current) {
        currentSlideRef.current = activeIndex;
        setCurrentSlide(activeIndex);
        onSlideChange?.(activeIndex);
      }
    };

    const onScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        handleScroll();
        rafId = null;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [onSlideChange, totalSlides]);

  // Dot navigation: scrolls natively into the corresponding progress point
  const handleDotClick = (index: number) => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const wrapperTop = window.scrollY + rect.top;
    const totalScroll = rect.height - window.innerHeight;

    // Progress target for slide index (centered inside its third of 0-90%)
    const targetProgress = ((index + 0.5) / totalSlides) * 0.9;
    const targetY = wrapperTop + targetProgress * totalScroll;
    window.scrollTo({ top: targetY, behavior: "smooth" });
  };

  useEffect(() => {
    if (
      targetSlide !== undefined &&
      targetSlide >= 0 &&
      targetSlide < totalSlides
    ) {
      handleDotClick(targetSlide);
    }
  }, [targetSlide]);

  // Smooth exit at 90-100% progress: calm release into next section
  const exitFactor = Math.max(0, Math.min(1, (scrollProgress - 0.9) / 0.1));
  const exitStyle: React.CSSProperties = {
    opacity: 1 - exitFactor * 0.1,
    transform: `scale(${1 - exitFactor * 0.02})`,
    transformOrigin: "center bottom",
    transition: "opacity 0.2s ease-out, transform 0.2s ease-out",
  };

  // Transform tracks
  const leftTransform = `translateY(calc(-${currentSlide} * var(--slide-h, calc(100svh - 72px))))`;
  const rightTransform = `translateY(calc(-${
    totalSlides - 1 - currentSlide
  } * var(--slide-h, calc(100svh - 72px))))`;

  return (
    <section
      ref={wrapperRef}
      className={styles.heroScrollWrapper}
      id="hero-slider"
    >
      <div className={styles.heroSticky} style={exitStyle}>
        <div className={styles.splitContainer}>
          {/* Left Half */}
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
                  } ${
                    slide.left.type === "image"
                      ? styles.imagePanel
                      : styles.textPanel
                  }`}
                >
                  {slide.left.type === "image" ? (
                    <>
                      {slide.left.video && (
                        <video
                          ref={(el) => {
                            videoRefs.current[idx] = el;
                          }}
                          className={styles.slideVideo}
                          src={slide.left.video}
                          muted
                          loop
                          playsInline
                          preload="auto"
                        />
                      )}
                      <div className={styles.imageOverlayGradient} />
                      {slide.left.cursiveOverlay && (
                        <span className={styles.cursiveOverlay}>
                          {slide.left.cursiveOverlay}
                        </span>
                      )}
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

          {/* Right Half */}
          <div className={styles.rightColumn}>
            <div
              className={styles.rightTrack}
              style={{ transform: rightTransform }}
            >
              {reversedRightPanels.map((panel, revIdx) => {
                const originalSlideIdx = totalSlides - 1 - revIdx;
                const isActive = currentSlide === originalSlideIdx;

                return (
                  <div
                    key={`right-${revIdx}`}
                    className={`${styles.slidePanel} ${
                      isActive ? styles.activeSlide : ""
                    } ${
                      panel.type === "image"
                        ? styles.imagePanel
                        : styles.textPanel
                    }`}
                  >
                    {panel.type === "image" ? (
                      <>
                        {panel.video && (
                          <video
                            ref={(el) => {
                              videoRefs.current[originalSlideIdx] = el;
                            }}
                            className={styles.slideVideo}
                            src={panel.video}
                            muted
                            loop
                            playsInline
                            preload="auto"
                          />
                        )}
                        <div className={styles.imageOverlayGradient} />
                        {panel.cursiveOverlay && (
                          <span className={styles.cursiveOverlay}>
                            {panel.cursiveOverlay}
                          </span>
                        )}
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

        {/* Vertical Pagination Dots */}
        <div className={styles.paginationHolder} aria-label="Slider Pagination">
          {slidesData.map((s, idx) => (
            <button
              key={`dot-${s.id}`}
              className={`${styles.dotButton} ${
                currentSlide === idx ? styles.dotActive : ""
              }`}
              onClick={() => handleDotClick(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            >
              <span className={styles.dotCircle} />
              <span className={styles.dotTooltip}>
                0{idx + 1} {s.left.type === "text" ? s.left.title : s.right.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
