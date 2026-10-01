"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Star, Heart, Truck } from "lucide-react";
import { FlowerProduct } from "@/types";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: FlowerProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const productUrl = `/flowers/${product.category}/${product.slug}`;

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) * 100
        )
      : null;

  return (
    <article className={styles.card}>
      {/* Top Image Container with Wave Scoop Cutout */}
      <div className={styles.imageContainer}>
        <Link
          href={productUrl}
          className={styles.imageLink}
          aria-label={product.name}
        >
          <img
            src={product.image}
            alt={product.name}
            className={styles.productImage}
            loading="lazy"
          />
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
          viewBox="0 0 300 48"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M -2,52 L -2,18 Q -2,0 16,0 L 202,0 C 224,0 234,34 258,34 L 304,34 L 304,52 Z"
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
          aria-label={`Rated ${(product.rating || 4.5).toFixed(1)} out of 5 stars`}
        >
          <Star size={10} fill="#ffffff" color="#ffffff" strokeWidth={0} />
          <span>{(product.rating || 4.5).toFixed(1)}</span>
        </div>

        {/* Price & Delivery Row */}
        <div className={styles.priceRow}>
          <span className={styles.currentPrice}>
            ₹{product.price.toLocaleString("en-IN")}
          </span>

          {product.originalPrice && (
            <span className={styles.originalPrice}>
              ₹{product.originalPrice.toLocaleString("en-IN")}
            </span>
          )}

          {discountPercent ? (
            <span className={styles.discountBadge}>{discountPercent}% off</span>
          ) : (
            <span className={styles.freeDeliveryBadge}>
              Free Delivery
              <Truck size={12} className={styles.truckIcon} />
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
