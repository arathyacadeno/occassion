"use client";

import React from "react";
import Link from "next/link";
import { Heart, Star, Truck } from "lucide-react";
import { Product } from "@/data/catalog";
import { useWishlist } from "@/context/WishlistContext";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export default function ProductCard({
  product,
  compact = false,
}: ProductCardProps) {
  const { isInWishlist, toggleItem } = useWishlist();
  const isWishlisted = isInWishlist(product.id);
  const productHref = `/${product.category}/${product.slug}`;

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
  };

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) * 100
        )
      : null;

  const cardDescription = product.shortDescription;
  const deliveryText =
    product.deliveryText ||
    (!discountPercent &&
    (product.badge?.toLowerCase().includes("free delivery") ||
      product.offers?.some((o) => o.toLowerCase().includes("free delivery")))
      ? "Free Delivery"
      : null);

  return (
    <article
      className={`${styles.card} ${compact ? styles.compactCard : ""}`}
    >
      {/* Top Image Container with Wave Scoop Cutout */}
      <div className={styles.imageContainer}>
        <Link
          href={productHref}
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

        {/* Floating Wishlist Button (White Circle with Thin Black Outline Heart) */}
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
            fill={isWishlisted ? "#E40345" : "none"}
            color={isWishlisted ? "#E40345" : "#1a1a1a"}
          />
        </button>

        {/* Signature Chamfered Ramp Cutout at bottom of image */}
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
          <Link href={productHref} className={styles.titleLink}>
            {product.name}
          </Link>
        </h3>

        {/* Green Rating Pill Badge (★ 4.5) */}
        <div
          className={styles.ratingBadge}
          aria-label={`Rated ${(product.rating || 4.5).toFixed(1)} out of 5 stars`}
        >
          <Star size={9.5} fill="#ffffff" color="#ffffff" strokeWidth={0} />
          <span>{(product.rating || 4.5).toFixed(1)}</span>
        </div>

        {/* Optional Description (max 2 lines) */}
        {cardDescription && (
          <p className={styles.productDescription} title={cardDescription}>
            {cardDescription}
          </p>
        )}

        {/* Price & Delivery Row */}
        <div className={styles.priceRow}>
          <span className={styles.currentPrice}>
            ₹{product.price}
          </span>

          {product.originalPrice && (
            <span className={styles.originalPrice}>
              ₹{product.originalPrice}
            </span>
          )}

          {discountPercent ? (
            <span className={styles.discountBadge}>
              {product.id === "flower-3" ? "10% off" : `${discountPercent}% off`}
            </span>
          ) : null}

          {deliveryText && (
            <span className={styles.deliveryBadge}>
              {deliveryText}
              {deliveryText.toLowerCase().includes("free") && (
                <Truck size={12} className={styles.truckIcon} />
              )}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
