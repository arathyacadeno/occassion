"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Star, Heart } from "lucide-react";
import { FlowerProduct } from "@/types";
import { AddToCartButton } from "@/components/Buttons";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: FlowerProduct;
  compact?: boolean;
  showAddToCart?: boolean;
}

export default function ProductCard({
  product,
  compact = false,
  showAddToCart,
}: ProductCardProps) {
  const shouldShowAddToCart = showAddToCart ?? !compact;
  const [isWishlisted, setIsWishlisted] = useState(false);
  const productUrl = `/flowers/${product.category}/${product.slug}`;

  const activePrice = product.price;
  const activeOriginalPrice = product.originalPrice;
  const activeImage = product.image;

  const [imgFailed, setImgFailed] = useState<boolean>(!activeImage || activeImage.trim() === "");

  React.useEffect(() => {
    setImgFailed(!activeImage || activeImage.trim() === "");
  }, [activeImage]);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const cardDescription = (product as any).shortDescription;

  return (
    <article
      className={`${styles.card} ${compact ? styles.compactCard : ""}`}
    >
      {/* Top Image Container with Wave Scoop Cutout */}
      <div
        className={`${styles.imageContainer} ${
          compact ? "similar-product-image-container" : ""
        }`}>
        <Link
          href={productUrl}
          className={styles.imageLink}
          aria-label={product.name}
        >
          {imgFailed || !activeImage ? (
            <div className={styles.placeholderContainer} aria-label={`${product.name} (Image Coming Soon)`}>
              <div className={styles.placeholderIconWrapper}>
                <svg
                  width="38"
                  height="38"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#db2777"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 7.5a4.5 4.5 0 1 1 4.5 4.5M12 7.5A4.5 4.5 0 1 0 7.5 12M12 7.5V12m0 0a4.5 4.5 0 1 0 4.5 4.5M12 12a4.5 4.5 0 1 1-4.5 4.5m4.5-4.5h.01" />
                  <circle cx="12" cy="12" r="1.5" fill="#db2777" />
                  <path d="M12 16.5V22" stroke="#db2777" strokeWidth="1.8" />
                </svg>
              </div>
              <span className={styles.placeholderBrand}>Occasions</span>
              <span className={styles.placeholderText}>Image Coming Soon</span>
            </div>
          ) : (
            <img
              src={activeImage}
              alt={product.name}
              className={`${styles.productImage} ${
                compact ? "similar-product-image" : ""
              }`}
              loading="lazy"
              onError={() => setImgFailed(true)}
            />
          )}
        </Link>

        {/* Floating Wishlist Button */}
        <button
          type="button"
          onClick={toggleWishlist}
          className={`${styles.wishlistBtn} ${
            isWishlisted ? styles.wishlistActive : ""
          }`}
          aria-label={
            isWishlisted ? "Remove from wishlist" : "Add to wishlist"
          }
          title={isWishlisted ? "In Wishlist" : "Add to Wishlist"}
        >
          <Heart
            size={18}
            strokeWidth={1.5}
            fill={isWishlisted ? "#db2777" : "none"}
            color={isWishlisted ? "#db2777" : "#1a1a1a"}
          />
        </button>

        {/* Characteristic Smooth Wave SVG Cutout at bottom of image */}
        <svg
          className={styles.waveDivider}
          viewBox="0 0 300 28"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M -2,32 L -2,12 Q -2,0 16,0 L 185,0 C 208,0 216,20 242,20 L 304,20 L 304,32 Z"
            fill="#ffffff"
          />
        </svg>
      </div>

      {/* Card Info Section */}
      <div className={styles.cardBody}>
        {/* Product Title */}
        <h3 className={styles.productTitle}>
          <Link href={productUrl} className={styles.titleLink}>
            {product.name}
          </Link>
        </h3>

        {/* Green Rating Pill Badge (★ 4.5) */}
        <div
          className={styles.ratingBadge}
          aria-label={`Rated ${Number(product.rating || 4.5).toFixed(1)} out of 5 stars`}
        >
          <Star size={9.5} fill="#ffffff" color="#ffffff" strokeWidth={0} />
          <span>{Number(product.rating || 4.5).toFixed(1)}</span>
        </div>

        {/* Optional Description (max 2 lines) */}
        {cardDescription && (
          <p className={styles.productDescription} title={cardDescription}>
            {cardDescription}
          </p>
        )}

        {/* Price Row */}
        <div className={styles.priceRow}>
          <span className={styles.currentPrice}>
            ₹{activePrice.toLocaleString("en-IN")}
          </span>
        </div>

        {/* Add To Cart Button */}
        {shouldShowAddToCart && (
          <div className={styles.cartActionWrapper}>
            <AddToCartButton
              product={{
                ...(product as any),
                price: activePrice,
                originalPrice: activeOriginalPrice,
                image: activeImage,
              }}
              variant="pill"
            />
          </div>
        )}
      </div>
    </article>
  );
}
