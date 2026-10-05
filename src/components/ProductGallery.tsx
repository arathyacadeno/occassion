"use client";

import React, { useState } from "react";
import { Heart, X } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { Product } from "@/data/catalog";
import styles from "./ProductGallery.module.css";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  product?: Product;
  selectedImageOverride?: string | null;
}

export default function ProductGallery({
  images,
  productName,
  product,
  selectedImageOverride,
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

  // Synchronize when variant changes
  React.useEffect(() => {
    if (selectedImageOverride) {
      const idx = thumbnails.findIndex((img) => img === selectedImageOverride);
      if (idx !== -1) {
        setSelectedIndex(idx);
      }
    }
  }, [selectedImageOverride]);

  // Global Wishlist Context
  const { isInWishlist, toggleItem } = useWishlist();
  const [localWishlisted, setLocalWishlisted] = useState(false);
  const isWishlisted = product ? isInWishlist(product.id) : localWishlisted;

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product) {
      toggleItem(product);
    } else {
      setLocalWishlisted((prev) => !prev);
    }
  };

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

          {/* Heart / Wishlist icon button in top-right corner (white circle ~36px) */}
          <button
            type="button"
            className={`${styles.wishlistBtn} ${
              isWishlisted ? styles.wishlistActive : ""
            }`}
            onClick={handleToggleWishlist}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart size={18} strokeWidth={1.8} className={styles.heartIcon} />
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
