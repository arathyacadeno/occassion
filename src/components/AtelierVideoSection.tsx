"use client";

import React, { useRef, useState, useEffect } from "react";
import styles from "./AtelierVideoSection.module.css";
import { Play, Pause, Volume2, VolumeX, Maximize2 } from "lucide-react";

export default function AtelierVideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Attempt auto-play when component mounts
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Fallback if browser requires user interaction for unmuted
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsMuted(true);
          videoRef.current.play().catch(() => {});
        }
      });
    }
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const duration = videoRef.current.duration || 1;
    setProgress((current / duration) * 100);
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newPercent = clickX / rect.width;
    videoRef.current.currentTime = newPercent * (videoRef.current.duration || 1);
  };

  const handleFullScreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <section
      className={`${styles.sectionWrapper || ""} atelier-section-wrapper`}
      id="atelier-film-showcase"
      aria-label="Occassions Atelier Film"
      style={{
        width: "100%",
        maxWidth: "1360px",
        margin: "60px auto 40px",
        padding: "0 24px",
      }}
    >
      <div className="container" style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* Section Header (Left-aligned) */}
        <div
          className={`${styles.headerArea || ""} atelier-header-area`}
          style={{
            textAlign: "left",
            maxWidth: "840px",
            margin: "0 0 32px 0",
          }}
        >
          <div
            className={`${styles.tagline || ""} atelier-tagline`}
            style={{
              fontFamily: "var(--font-script, 'Great Vibes', cursive)",
              fontSize: "clamp(2.2rem, 3.4vw, 3.2rem)",
              color: "#db2777",
              marginBottom: "6px",
              lineHeight: 1.1,
              textAlign: "left",
            }}
          >
            Behind the Blossoms
          </div>
          <h2
            className={`${styles.title || ""} atelier-title`}
            style={{
              fontFamily: "var(--font-heading, 'Manrope', sans-serif)",
              fontSize: "clamp(1.9rem, 2.9vw, 2.8rem)",
              fontWeight: 700,
              color: "#111827",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              margin: "0 0 14px",
              textAlign: "left",
            }}
          >
            The Art of Floral Crafting
          </h2>
          <p
            className={`${styles.subtitle || ""} atelier-subtitle`}
            style={{
              fontFamily: "var(--font-sans, 'Plus Jakarta Sans', sans-serif)",
              fontSize: "0.96rem",
              color: "#4b5563",
              lineHeight: 1.6,
              maxWidth: "760px",
              margin: "0",
              textAlign: "left",
            }}
          >
            Step inside our Kozhikode atelier where fresh morning-harvested blooms are conditioned, color-matched, and hand-tied stem by stem by Master Florist Sreejesh K.V.
          </p>
        </div>

        {/* Video Player Frame */}
        <div
          className={`${styles.videoCard || ""} atelier-video-card`}
          style={{
            background: "#ffffff",
            borderRadius: "28px",
            overflow: "hidden",
            border: "1px solid rgba(244, 114, 182, 0.35)",
            boxShadow: "0 20px 50px -15px rgba(219, 39, 119, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.8)",
          }}
        >
          <div
            className={`${styles.videoWrapper || ""} atelier-video-wrapper`}
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "16 / 9",
              background: "#000000",
              overflow: "hidden",
              cursor: "pointer",
            }}
          >
            <video
              ref={videoRef}
              src="/videos/hero-florist.mp4"
              className={`${styles.videoPlayer || ""} atelier-video-player`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
              playsInline
              loop
              muted={isMuted}
              autoPlay
              onTimeUpdate={handleTimeUpdate}
              onClick={togglePlay}
            />

            {/* Ambient Overlay Vignette */}
            <div
              className={`${styles.vignetteOverlay || ""} atelier-vignette-overlay`}
              style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(circle at center, transparent 40%, rgba(0, 0, 0, 0.3) 100%)",
                pointerEvents: "none",
              }}
            />

            {/* Play Button Overlay when paused */}
            {!isPlaying && (
              <button
                type="button"
                className={`${styles.centerPlayBtn || ""} atelier-center-play-btn`}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "76px",
                  height: "76px",
                  borderRadius: "50%",
                  background: "rgba(219, 39, 119, 0.88)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  border: "2px solid rgba(255, 255, 255, 0.85)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
                  zIndex: 5,
                }}
                onClick={togglePlay}
                aria-label="Play video"
              >
                <Play size={36} fill="#ffffff" color="#ffffff" style={{ marginLeft: "4px" }} />
              </button>
            )}

            {/* Video Controls Bar (Matches User Screenshot) */}
            <div
              className={`${styles.controlsBar || ""} atelier-controls-bar`}
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                background: "linear-gradient(to top, rgba(0, 0, 0, 0.88) 0%, rgba(0, 0, 0, 0.25) 70%, transparent 100%)",
                padding: "24px 24px 16px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                zIndex: 10,
              }}
            >
              <div
                className={`${styles.progressBarWrapper || ""} atelier-progress-track`}
                onClick={handleProgressBarClick}
                style={{
                  width: "100%",
                  height: "5px",
                  background: "rgba(255, 255, 255, 0.25)",
                  borderRadius: "999px",
                  overflow: "hidden",
                  cursor: "pointer",
                }}
              >
                <div
                  className={`${styles.progressBar || ""} atelier-progress-fill`}
                  style={{
                    width: `${progress}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #f472b6, #ec4899, #f43f5e)",
                  }}
                />
              </div>

              <div
                className={`${styles.buttonsRow || ""} atelier-buttons-row`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  className={`${styles.leftControls || ""} atelier-left-controls`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                  }}
                >
                  <button
                    type="button"
                    className={`${styles.ctrlBtn || ""} atelier-ctrl-btn`}
                    style={{
                      background: "rgba(255, 255, 255, 0.15)",
                      backdropFilter: "blur(4px)",
                      WebkitBackdropFilter: "blur(4px)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      color: "#ffffff",
                      width: "38px",
                      height: "38px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                    onClick={togglePlay}
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                  </button>

                  <button
                    type="button"
                    className={`${styles.ctrlBtn || ""} atelier-ctrl-btn`}
                    style={{
                      background: "rgba(255, 255, 255, 0.15)",
                      backdropFilter: "blur(4px)",
                      WebkitBackdropFilter: "blur(4px)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      color: "#ffffff",
                      width: "38px",
                      height: "38px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                    onClick={toggleMute}
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>

                  <span
                    className={`${styles.liveIndicator || ""} atelier-live-indicator`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      color: "#ffffff",
                      textShadow: "0 1px 3px rgba(0, 0, 0, 0.8)",
                      marginLeft: "4px",
                    }}
                  >
                    <span
                      className={`${styles.liveDot || ""} atelier-live-dot`}
                      style={{
                        width: "9px",
                        height: "9px",
                        backgroundColor: "#22c55e",
                        borderRadius: "50%",
                        boxShadow: "0 0 10px #22c55e, 0 0 4px #22c55e",
                      }}
                    />{" "}
                    LIVE ATELIER
                  </span>
                </div>

                <div className={`${styles.rightControls || ""} atelier-right-controls`}>
                  <button
                    type="button"
                    className={`${styles.ctrlBtn || ""} atelier-ctrl-btn`}
                    style={{
                      background: "rgba(255, 255, 255, 0.15)",
                      backdropFilter: "blur(4px)",
                      WebkitBackdropFilter: "blur(4px)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      color: "#ffffff",
                      width: "38px",
                      height: "38px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                    onClick={handleFullScreen}
                    aria-label="Full screen"
                  >
                    <Maximize2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
