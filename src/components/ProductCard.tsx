"use client";

import React from "react";
import Link from "next/link";
import { Heart, Star, Truck } from "lucide-react";
import { Product } from "@/data/catalog";
import { useWishlist } from "@/context/WishlistContext";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
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

  return (
    <article className={styles.card}>
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

        {/* Badge */}
        {product.badge && (
          <span className={styles.badgeTag}>{product.badge}</span>
        )}

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
            strokeWidth={1.8}
            fill={isWishlisted ? "#db2777" : "none"}
            color={isWishlisted ? "#db2777" : "#4b5563"}
          />
        </button>

        {/* Characteristic Smooth Wave SVG Cutout at bottom of image */}
        <svg
          className={styles.waveDivider}
          viewBox="0 0 300 36"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M -4,0 C 100,0 180,36 304,36 L 304,48 L -4,48 Z"
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

        {/* Green Rating Pill Badge */}
        <div
          className={styles.ratingBadge}
          aria-label={`Rated ${product.rating || 4.5} out of 5 stars`}
        >
          <Star size={11} fill="#ffffff" color="#ffffff" strokeWidth={0} />
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
          ) : null}

          <span className={styles.freeDeliveryBadge}>
            Free Delivery
            <Truck size={13} className={styles.truckIcon} />
          </span>
        </div>
      </div>
    </article>
  );
}
