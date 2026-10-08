"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Heart, X } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { Product } from "@/data/catalog";
import styles from "./ProductGallery.module.css";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  product?: Product;
  selectedImageOverride?: string | null;
}

const FALLBACK_IMAGE = "/images/sunflower-bouquet.jpg";
const ZOOM_SCALE = 2.2;

export default function ProductGallery({
  images,
  productName,
  product,
  selectedImageOverride,
}: ProductGalleryProps) {
  // Always show exactly 4 thumbnails (repeat images if fewer are supplied)
  const thumbnails = useMemo(() => {
    let list = images && images.length > 0 ? [...images] : [FALLBACK_IMAGE];
    while (list.length < 4) list = [...list, ...list];
    return list.slice(0, 4);
  }, [images]);

  const total = thumbnails.length;

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoom, setZoom] = useState({ active: false, x: 50, y: 50 });
  const touchStartX = useRef<number | null>(null);

  const goTo = useCallback(
    (index: number) => setSelectedIndex((index + total) % total),
    [total]
  );
  const goPrev = useCallback(() => goTo(selectedIndex - 1), [goTo, selectedIndex]);
  const goNext = useCallback(() => goTo(selectedIndex + 1), [goTo, selectedIndex]);

  // Sync when a variant is picked in ProductInfo
  useEffect(() => {
    if (!selectedImageOverride) return;
    const idx = thumbnails.findIndex((img) => img === selectedImageOverride);
    if (idx !== -1) setSelectedIndex(idx);
  }, [selectedImageOverride, thumbnails]);

  // Lightbox: keyboard controls + lock page scroll
  useEffect(() => {
    if (!isZoomOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsZoomOpen(false);
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [isZoomOpen, goPrev, goNext]);

  // Wishlist
  const { isInWishlist, toggleItem } = useWishlist();
  const [localWishlisted, setLocalWishlisted] = useState(false);
  const isWishlisted = product ? isInWishlist(product.id) : localWishlisted;

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product) toggleItem(product);
    else setLocalWishlisted((prev) => !prev);
  };

  // Hover zoom (mouse devices only)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!window.matchMedia("(hover: hover)").matches) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoom({ active: true, x, y });
  };
  const handleMouseLeave = () => setZoom((z) => ({ ...z, active: false }));

  // Swipe (touch devices)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) > 40) (dx < 0 ? goNext : goPrev)();
  };

  const currentImage = thumbnails[selectedIndex];

  return (
    <>
      <div className={styles.galleryWrapper}>
        {/* Thumbnails: vertical strip on desktop, horizontal row on mobile */}
        <div
          className={styles.thumbnailList}
          role="tablist"
          aria-label="Product thumbnails"
        >
          {thumbnails.map((img, idx) => (
            <button
              key={idx}
              type="button"
              role="tab"
              aria-selected={selectedIndex === idx}
              aria-label={`Show image ${idx + 1} of ${total}`}
              onClick={() => setSelectedIndex(idx)}
              onMouseEnter={() => {
                if (window.matchMedia("(hover: hover)").matches) setSelectedIndex(idx);
              }}
              className={`${styles.thumbnailBtn} ${selectedIndex === idx ? styles.thumbnailActive : ""
                }`}
            >
              <img
                src={img}
                alt={`${productName} thumbnail ${idx + 1}`}
                className={styles.thumbnailImg}
              />
            </button>
          ))}
        </div>

        {/* Main image */}
        <div
          className={styles.mainImageContainer}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={() => setIsZoomOpen(true)}
        >
          <img
            src={currentImage}
            alt={productName}
            className={styles.mainImage}
            draggable={false}
            style={{
              transformOrigin: `${zoom.x}% ${zoom.y}%`,
              transform: zoom.active ? `scale(${ZOOM_SCALE})` : "scale(1)",
            }}
          />

          <button
            type="button"
            className={`${styles.wishlistBtn} ${isWishlisted ? styles.wishlistActive : ""
              }`}
            onClick={handleToggleWishlist}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart size={18} strokeWidth={1.8} className={styles.heartIcon} />
          </button>

          <button
            type="button"
            className={`${styles.arrowBtn} ${styles.arrowLeft}`}
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label="Previous image"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            className={`${styles.arrowBtn} ${styles.arrowRight}`}
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            aria-label="Next image"
          >
            <ChevronRight size={20} />
          </button>

          <span className={styles.counter}>
            {selectedIndex + 1} / {total}
          </span>
        </div>
      </div>

      {/* Fullscreen lightbox */}
      {isZoomOpen && typeof document !== "undefined" &&
        createPortal(
          <div
            className={styles.modalBackdrop}
            onClick={() => setIsZoomOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label={`${productName} image preview`}
          >
            <div
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
            <button
              type="button"
              onClick={() => setIsZoomOpen(false)}
              className={styles.closeModalBtn}
              aria-label="Close preview"
            >
              <X size={24} />
            </button>

            <button
              type="button"
              className={`${styles.modalArrow} ${styles.modalArrowLeft}`}
              onClick={goPrev}
              aria-label="Previous image"
            >
              <ChevronLeft size={26} />
            </button>

            <img src={currentImage} alt={productName} className={styles.modalImage} />

            <button
              type="button"
              className={`${styles.modalArrow} ${styles.modalArrowRight}`}
              onClick={goNext}
              aria-label="Next image"
            >
              <ChevronRight size={26} />
            </button>

            <div className={styles.modalThumbs}>
              {thumbnails.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedIndex(idx)}
                  aria-label={`Show image ${idx + 1}`}
                  className={`${styles.modalThumbBtn} ${selectedIndex === idx ? styles.modalThumbActive : ""
                    }`}
                >
                  <img src={img} alt="" className={styles.thumbnailImg} />
                </button>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}