"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FlowerProduct } from "@/types";
import { useCart } from "@/context/CartContext";
import { Star, Heart, ShoppingBag, ArrowRight, Check, Truck } from "lucide-react";
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

      {/* Content */}
      <div className={styles.content}>
        {/* Title */}
        <h3 className={styles.productTitle}>
          <Link href={productUrl} className={styles.titleLink}>
            {product.name}
          </Link>
        </h3>

        {/* Green Rating Pill Badge */}
        <div
          className={styles.ratingBadge}
          aria-label={`Rated ${product.rating} out of 5 stars`}
        >
          <Star size={11} fill="#ffffff" color="#ffffff" strokeWidth={0} />
          <span>{product.rating.toFixed(1)}</span>
        </div>

        {/* Price & Delivery */}
        <div className={styles.footerRow}>
          <div className={styles.priceGroup}>
            <span className={styles.price}>₹{product.price.toLocaleString("en-IN")}</span>
            {product.originalPrice && (
              <span className={styles.originalPrice}>
                ₹{product.originalPrice.toLocaleString("en-IN")}
              </span>
            )}
            <span className={styles.freeDeliveryBadge}>
              Free Delivery
              <Truck size={13} className={styles.truckIcon} />
            </span>
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
