"use client";

import React from "react";
import Link from "next/link";
import { Heart, Star, Trash2 } from "lucide-react";
import { Product } from "@/data/catalog";
import { useWishlist } from "@/context/WishlistContext";
import { AddToCartButton } from "@/components/Buttons";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: Product;
  compact?: boolean;
  showDelete?: boolean;
  onDelete?: () => void;
  showAddToCart?: boolean;
  imageFit?: "cover" | "contain";
  actionType?: "cart" | "customize";
  customizeHref?: string;
}

export default function ProductCard({
  product,
  compact = false,
  showDelete = false,
  onDelete,
  showAddToCart,
  imageFit,
  actionType = "cart",
  customizeHref,
}: ProductCardProps) {
  const isFlowerBasket =
    imageFit === "contain" ||
    Boolean(
      product.basketType ||
      product.id.startsWith("flower-basket-") ||
      (product.image && product.image.includes("/flower-basket/")) ||
      (product.category === "flower" && (product.id === "flower-9" || product.id === "flower-10"))
    );
  const shouldShowAddToCart = showAddToCart ?? !compact;
  const { isInWishlist, toggleItem } = useWishlist();
  const isWishlisted = isInWishlist(product.id);
  const productHref = `/${product.category}/${product.slug}`;

  const [imgFailed, setImgFailed] = React.useState<boolean>(!product.image || product.image.trim() === "");

  React.useEffect(() => {
    setImgFailed(!product.image || product.image.trim() === "");
  }, [product.image]);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete();
    } else {
      toggleItem(product);
    }
  };

  const cardDescription = product.shortDescription;

  return (
    <article
      className={`${styles.card} ${compact ? styles.compactCard : ""}`}
    >
      {/* Top Image Container with Wave Scoop Cutout */}
      <div
        className={`${styles.imageContainer} ${
          isFlowerBasket ? styles.basketImageContainer : ""
        } ${
          compact ? "similar-product-image-container" : ""
        }`}>
        <Link
          href={productHref}
          className={`${styles.imageLink} ${isFlowerBasket ? styles.basketImageLink : ""}`}
          aria-label={product.name}
        >
          {imgFailed || !product.image ? (
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
              src={product.image}
              alt={product.name}
              className={`${styles.productImage} ${
                isFlowerBasket ? styles.basketProductImage : ""
              } ${
                compact ? "similar-product-image" : ""
              }`}
              loading="lazy"
              onError={() => setImgFailed(true)}
            />
          )}
        </Link>

        {/* Floating Action Button (Delete Button or Wishlist Heart) */}
        {showDelete ? (
          <button
            type="button"
            onClick={handleDelete}
            className={`${styles.wishlistBtn} ${styles.deleteBtn}`}
            aria-label="Remove from wishlist"
            title="Remove from wishlist"
          >
            <Trash2
              size={17}
              strokeWidth={1.8}
              className={styles.deleteIcon}
            />
          </button>
        ) : (
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
        )}

        {/* Signature Chamfered Ramp Cutout at bottom of image */}
        {!compact && (
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
        )}
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
            ₹{product.price}
          </span>
        </div>

        {/* Optional Add To Cart or Customize Button */}
        {shouldShowAddToCart && (
          <div className={styles.cartActionWrapper}>
            {actionType === "customize" ? (
              <Link
                href={customizeHref || `/customize/${product.id}`}
                className={styles.customizePillBtn}
                aria-label={`Customize ${product.name}`}
              >
                Customize
              </Link>
            ) : (
              <AddToCartButton product={product} variant="pill" />
            )}
          </div>
        )}
      </div>
    </article>
  );
}
