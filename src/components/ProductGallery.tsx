"use client";

import React, { useState } from "react";
import { Heart, X } from "lucide-react";
import styles from "./ProductGallery.module.css";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductGallery({
  images,
  productName,
}: ProductGalleryProps) {
  // Ensure we have valid images and slice exactly 4 thumbnails
  let displayImages =
    images && images.length > 0 ? [...images] : ["/images/sunflower-bouquet.jpg"];
  while (displayImages.length < 4) {
    displayImages = [...displayImages, ...displayImages];
  }
  const thumbnails = displayImages.slice(0, 4);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  return (
    <>
      <div className={styles.galleryWrapper}>
        {/* Left thumbnail column: exactly 4 thumbnails */}
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
              onClick={() => setSelectedIndex(idx)}
              className={`${styles.thumbnailBtn} ${
                selectedIndex === idx ? styles.thumbnailActive : ""
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

        {/* Right side: large main image */}
        <div className={styles.mainImageContainer}>
          <img
            src={thumbnails[selectedIndex] || displayImages[selectedIndex]}
            alt={productName}
            className={styles.mainImage}
            onClick={() => setIsZoomOpen(true)}
          />

          {/* Heart / Wishlist icon button in top-right corner (white circle) */}
          <button
            type="button"
            className={`${styles.wishlistBtn} ${
              isWishlisted ? styles.wishlistActive : ""
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setIsWishlisted((prev) => !prev);
            }}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart size={20} strokeWidth={1.8} className={styles.heartIcon} />
          </button>
        </div>
      </div>

      {/* Fullscreen Zoom Lightbox Modal */}
      {isZoomOpen && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setIsZoomOpen(false)}
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
            <img
              src={thumbnails[selectedIndex] || displayImages[selectedIndex]}
              alt={productName}
              className={styles.modalImage}
            />
          </div>
        </div>
      )}
    </>
  );
}
