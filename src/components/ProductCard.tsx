"use client";

import React from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Product } from "@/data/catalog";
import { useWishlist } from "@/context/WishlistContext";
import { AddToCartButton } from "./Buttons";
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
      {/* Top Product Image (Clicking navigates to product detail page) */}
      <Link href={productHref} className={styles.imageLink} aria-label={product.name}>
        <img
          src={product.image}
          alt={product.name}
          className={styles.productImage}
          loading="lazy"
        />
        {product.badge && <span className={styles.badgeTag}>{product.badge}</span>}
      </Link>

      {/* Lower Product Info Section */}
      <div className={styles.cardBody}>
        <div>
          {/* Product Name + Wishlist Icon */}
          <div className={styles.headerRow}>
            <Link href={productHref} className={styles.productTitle}>
              {product.name}
            </Link>
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
                size={19}
                strokeWidth={1.8}
                fill={isWishlisted ? "currentColor" : "none"}
              />
            </button>
          </div>

          {/* Price & Original Price */}
          <div className={styles.priceRow}>
            <span className={styles.currentPrice}>₹{product.price.toLocaleString("en-IN")}</span>
            {product.originalPrice && (
              <span className={styles.originalPrice}>
                ₹{product.originalPrice.toLocaleString("en-IN")}
              </span>
            )}
            {discountPercent && (
              <span className={styles.discountBadge}>{discountPercent}% OFF</span>
            )}
          </div>
        </div>

        {/* [ Add to Cart ] Button */}
        <div className={styles.actionArea}>
          <AddToCartButton product={product} />
        </div>
      </div>
    </article>
  );
}
