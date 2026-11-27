"use client";

import React, { useRef, useEffect } from "react";
import styles from "./SplitHero.module.css";

interface SplitHeroProps {
  onOpenMenu?: () => void;
  targetSlide?: number;
  onSlideChange?: (slide: number) => void;
}

export default function SplitHero({
  onOpenMenu,
}: SplitHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    // Ensure video is muted for mobile and desktop autoplay policy
    video.muted = true;

    let isSectionInView = false;
    let isPlayPending = false;

    const playVideo = () => {
      if (video.paused && !isPlayPending) {
        isPlayPending = true;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              isPlayPending = false;
              // If visibility changed while play promise was resolving, pause immediately
              if (!isSectionInView || document.hidden) {
                video.pause();
              }
            })
            .catch((err) => {
              isPlayPending = false;
              // Handle autoplay restrictions and scroll interruptions gracefully
              if (err?.name !== "AbortError") {
                // Autoplay policy or playback restriction handled gracefully
              }
            });
        } else {
          isPlayPending = false;
        }
      }
    };

    const pauseVideo = () => {
      if (!video.paused) {
        video.pause();
      }
    };

    // IntersectionObserver to detect when user enters or scrolls away from hero section
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Play when at least 50% of the section is visible; pause when below 50%
          const isAtLeastHalfVisible =
            entry.isIntersecting && entry.intersectionRatio >= 0.5;

          isSectionInView = isAtLeastHalfVisible;

          if (isAtLeastHalfVisible) {
            if (!document.hidden) {
              playVideo();
            }
          } else {
            pauseVideo();
          }
        });
      },
      {
        threshold: [0.5], // Exact 50% visibility threshold
      }
    );

    observer.observe(section);

    // Pause video when browser tab/window is hidden, resume when active and at least 50% visible
    const handleVisibilityChange = () => {
      if (document.hidden) {
        pauseVideo();
      } else if (isSectionInView) {
        playVideo();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handleHeroClick = () => {
    const nextEl =
      document.getElementById("categories") ||
      document.getElementById("shop-by-category") ||
      document.getElementById("highlights");
    if (nextEl) {
      nextEl.scrollIntoView({ behavior: "smooth" });
    } else if (onOpenMenu) {
      onOpenMenu();
    }
  };

  return (
    <section
      ref={sectionRef}
      className={styles.heroSection}
      id="hero-slider"
      onClick={handleHeroClick}
      aria-label="Occasions Floral Hero Video"
    >
      <h1
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: 0,
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        Flower Shop in Calicut | Occasions Calicut
      </h1>
      <div className={styles.videoContainer}>
        <video
          ref={videoRef}
          className={styles.heroVideo}
          src="/videos/heder-%20HSL%20Corrected.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          controlsList="nodownload noplaybackrate nofullscreen noremoteplayback"
        >
          <source src="/videos/heder-%20HSL%20Corrected.mp4" type="video/mp4" />
          <source src="/videos/heder- HSL Corrected.mp4" type="video/mp4" />
        </video>
      </div>
    </section>
  );
}

