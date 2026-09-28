"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FlowerProduct } from "@/types";
import { useCart } from "@/context/CartContext";
import { Star, Heart, ShoppingBag, ArrowRight, Check } from "lucide-react";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: FlowerProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const productUrl = `/flowers/${product.category}/${product.slug}`;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, "Signature", false);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
    }, 2000);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <article className={styles.card}>
      {/* Image Wrap */}
      <div className={styles.imageContainer}>
        <Link href={productUrl} className={styles.imageLink} aria-label={`View ${product.name}`}>
          <img
            src={product.image}
            alt={product.name}
            className={styles.productImage}
            loading="lazy"
          />
        </Link>

        {/* Badge */}
        {product.badge && (
          <span className={styles.badge}>{product.badge}</span>
        )}

        {/* Wishlist Button */}
        <button
          type="button"
          className={`${styles.wishlistBtn} ${isWishlisted ? styles.wishlistActive : ""}`}
          onClick={handleWishlistToggle}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={17} strokeWidth={2} fill={isWishlisted ? "#db2777" : "none"} />
        </button>

        {/* Quick View overlay link */}
        <Link href={productUrl} className={styles.quickViewOverlay}>
          <span>View Details</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Rating & Reviews */}
        <div className={styles.ratingRow}>
          <div className={styles.stars}>
            <Star size={13} fill="#f59e0b" color="#f59e0b" />
            <span className={styles.ratingScore}>{product.rating.toFixed(1)}</span>
          </div>
          <span className={styles.reviewsCount}>({product.reviewsCount} reviews)</span>
        </div>

        {/* Title */}
        <h3 className={styles.productTitle}>
          <Link href={productUrl} className={styles.titleLink}>
            {product.name}
          </Link>
        </h3>

        {/* Subtitle */}
        <p className={styles.subtitle}>{product.subtitle}</p>

        {/* Price & Actions */}
        <div className={styles.footerRow}>
          <div className={styles.priceGroup}>
            <span className={styles.price}>₹{product.price.toLocaleString("en-IN")}</span>
            {product.originalPrice && (
              <span className={styles.originalPrice}>
                ₹{product.originalPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={`${styles.cartBtn} ${justAdded ? styles.cartBtnAdded : ""}`}
              onClick={handleAddToCart}
              aria-label={`Add ${product.name} to cart`}
            >
              {justAdded ? (
                <Check size={15} strokeWidth={2.4} />
              ) : (
                <ShoppingBag size={15} strokeWidth={1.8} />
              )}
              <span>{justAdded ? "Added" : "Add"}</span>
            </button>

            <Link href={productUrl} className={styles.viewBtn} aria-label={`View ${product.name}`}>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
