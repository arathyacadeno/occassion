"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./VideoModal.module.css";
import { X, Play, Pause, Volume2, VolumeX, Maximize2, Sparkles } from "lucide-react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc?: string;
  title?: string;
  subtitle?: string;
}

export default function VideoModal({
  isOpen,
  onClose,
  videoSrc = "/videos/hero-florist.mp4",
  title = "The Atelier Floristry Film",
  subtitle = "Behind the scenes at Occassions Luxury Floral Boutique, Calicut",
}: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        // Autoplay may need muted
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsMuted(true);
          videoRef.current.play().catch(() => {});
        }
      });
      setIsPlaying(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

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

  const handleFullScreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Top Header */}
        <div className={styles.header}>
          <div className={styles.badge}>
            <Sparkles size={14} className={styles.sparkleIcon} />
            <span>CINEMATIC ATELIER</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close video">
            <X size={20} />
          </button>
        </div>

        {/* Video Container */}
        <div className={styles.videoWrapper}>
          <video
            ref={videoRef}
            src={videoSrc}
            className={styles.videoPlayer}
            playsInline
            loop
            onTimeUpdate={handleTimeUpdate}
            onClick={togglePlay}
          />

          {/* Video Overlay Controls */}
          <div className={styles.controlsBar}>
            <div className={styles.progressBarWrapper}>
              <div className={styles.progressBar} style={{ width: `${progress}%` }} />
            </div>

            <div className={styles.buttonsRow}>
              <div className={styles.leftControls}>
                <button
                  type="button"
                  className={styles.ctrlBtn}
                  onClick={togglePlay}
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                </button>

                <button
                  type="button"
                  className={styles.ctrlBtn}
                  onClick={toggleMute}
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>

                <span className={styles.liveIndicator}>
                  <span className={styles.liveDot} /> LIVE ATELIER
                </span>
              </div>

              <div className={styles.rightControls}>
                <button
                  type="button"
                  className={styles.ctrlBtn}
                  onClick={handleFullScreen}
                  aria-label="Full screen"
                >
                  <Maximize2 size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Details */}
        <div className={styles.infoArea}>
          <h3 className={styles.videoTitle}>{title}</h3>
          <p className={styles.videoSubtitle}>{subtitle}</p>
          <div className={styles.tagsRow}>
            <span className={styles.tag}>Fresh Morning Harvest</span>
            <span className={styles.tag}>Hand-Tied Couture</span>
            <span className={styles.tag}>Calicut Studio</span>
          </div>
        </div>
      </div>
    </div>
  );
}
