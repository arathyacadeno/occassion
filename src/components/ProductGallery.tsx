"use client";

import React, { useState } from "react";
import { Maximize2, X } from "lucide-react";
import styles from "./ProductGallery.module.css";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductGallery({
  images,
  productName,
}: ProductGalleryProps) {
  // Ensure at least 6 thumbnails to match the reference layout
  let displayImages = images.length > 0 ? [...images] : ["/images/sunflower-bouquet.jpg"];
  while (displayImages.length < 6) {
    displayImages = [...displayImages, ...images].slice(0, 6);
  }

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  return (
    <>
      <div className={styles.galleryWrapper}>
        {/* Vertical 6-thumbnail column on the left */}
        <div
          className={styles.thumbnailList}
          role="tablist"
          aria-label="Product thumbnails"
        >
          {displayImages.slice(0, 6).map((img, idx) => (
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
                alt={`${productName} view ${idx + 1}`}
                className={styles.thumbnailImg}
              />
            </button>
          ))}
        </div>

        {/* Large Main Product Hero Image */}
        <div className={styles.mainImageContainer}>
          <img
            src={displayImages[selectedIndex]}
            alt={productName}
            className={styles.mainImage}
            onClick={() => setIsZoomOpen(true)}
          />

          {/* Bottom Right Expand / Zoom Icon */}
          <button
            type="button"
            onClick={() => setIsZoomOpen(true)}
            className={styles.expandBtn}
            aria-label="Zoom image preview"
            title="Full size preview"
          >
            <Maximize2 size={16} strokeWidth={2} />
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
              src={displayImages[selectedIndex]}
              alt={productName}
              className={styles.modalImage}
            />
          </div>
        </div>
      )}
    </>
  );
}
