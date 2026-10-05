"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Star, Heart, Truck, Sparkles } from "lucide-react";
import { FlowerProduct } from "@/types";
import { isFlowerBouquet } from "@/data/catalog";
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
  const isBouquet = isFlowerBouquet(product as any);

  const isLily =
    product.category === "lilies" ||
    product.name.toLowerCase().includes("lily") ||
    product.name.toLowerCase().includes("lilies");

  const [selectedStem, setSelectedStem] = useState<"6" | "12" | "custom">("6");
  const [customStems, setCustomStems] = useState<number>(8);

  const activePrice = isLily
    ? selectedStem === "6"
      ? 695
      : selectedStem === "12"
      ? 1195
      : customStems * 100
    : product.price;

  const activeOriginalPrice = isLily
    ? selectedStem === "6"
      ? 795
      : selectedStem === "12"
      ? 1395
      : Math.round(customStems * 100 * 1.15)
    : product.originalPrice;

  const activeImage = isLily
    ? selectedStem === "6"
      ? "/images/lily-6-stems.png"
      : selectedStem === "12"
      ? "/images/lily-12-stems.png"
      : "/images/lily-custom-stems.png"
    : product.image;

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const discountPercent =
    activeOriginalPrice && activeOriginalPrice > activePrice
      ? Math.round(
          ((activeOriginalPrice - activePrice) / activeOriginalPrice) * 100
        )
      : null;

  const cardDescription = (product as any).shortDescription;
  const deliveryText =
    (product as any).deliveryText ||
    (!discountPercent && (product.badge?.toLowerCase().includes("free delivery") || false)
      ? "Free Delivery"
      : null);

  return (
    <article
      className={`${styles.card} ${compact ? styles.compactCard : ""}`}
    >
      {/* Top Image Container with Wave Scoop Cutout */}
      <div className={styles.imageContainer}>
        <Link
          href={productUrl}
          className={styles.imageLink}
          aria-label={product.name}
        >
          <img
            src={activeImage}
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
          aria-label={`Rated ${(product.rating || 4.5).toFixed(1)} out of 5 stars`}
        >
          <Star size={9.5} fill="#ffffff" color="#ffffff" strokeWidth={0} />
          <span>{(product.rating || 4.5).toFixed(1)}</span>
        </div>

        {/* Lily Stem Pricing Selector */}
        {isLily && (
          <div className={styles.stemSelectorWrapper}>
            <div className={styles.stemPills}>
              <button
                type="button"
                className={`${styles.stemPill} ${
                  selectedStem === "6" ? styles.stemPillActive : ""
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedStem("6");
                }}
              >
                6 Stems
              </button>
              <button
                type="button"
                className={`${styles.stemPill} ${
                  selectedStem === "12" ? styles.stemPillActive : ""
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedStem("12");
                }}
              >
                12 Stems
              </button>
              <button
                type="button"
                className={`${styles.stemPill} ${
                  selectedStem === "custom" ? styles.stemPillActive : ""
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedStem("custom");
                }}
              >
                Custom
              </button>
            </div>

            {selectedStem === "custom" && (
              <div className={styles.customStemControls}>
                <span className={styles.customStemLabel}>Stems:</span>
                <div className={styles.customStepper}>
                  <button
                    type="button"
                    className={styles.customStepBtn}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCustomStems((prev) => Math.max(3, prev - 1));
                    }}
                    aria-label="Decrease stem count"
                  >
                    -
                  </button>
                  <span className={styles.customStepVal}>{customStems}</span>
                  <button
                    type="button"
                    className={styles.customStepBtn}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCustomStems((prev) => prev + 1);
                    }}
                    aria-label="Increase stem count"
                  >
                    +
                  </button>
                </div>
                <span className={styles.customRateHint}>₹100/stem</span>
              </div>
            )}
          </div>
        )}

        {/* Optional Description (max 2 lines) */}
        {!isLily && cardDescription && (
          <p className={styles.productDescription} title={cardDescription}>
            {cardDescription}
          </p>
        )}

        {/* Price & Delivery Row */}
        <div className={styles.priceRow}>
          <span className={styles.currentPrice}>
            ₹{activePrice.toLocaleString("en-IN")}
          </span>

          {activeOriginalPrice && (
            <span className={styles.originalPrice}>
              ₹{activeOriginalPrice.toLocaleString("en-IN")}
            </span>
          )}

          {discountPercent ? (
            <span className={styles.discountBadge}>{discountPercent}% off</span>
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

        {/* Add To Cart / Customize Button */}
        {shouldShowAddToCart && (
          <div className={styles.cartActionWrapper}>
            {isBouquet ? (
              <div className={styles.bouquetActionsRow}>
                <Link
                  href={`${productUrl}?customize=true`}
                  className={styles.customizeBtn}
                  aria-label={`Customize ${product.name}`}
                >
                  <Sparkles size={13} className={styles.sparkleIcon} />
                  <span>Customize</span>
                </Link>
                <AddToCartButton
                  product={{
                    ...(product as any),
                    price: activePrice,
                    originalPrice: activeOriginalPrice,
                    image: activeImage,
                    subtitle: isLily
                      ? `${
                          selectedStem === "custom"
                            ? `${customStems} Stems (Custom)`
                            : `${selectedStem} Stems`
                        } Arrangement`
                      : (product as any).subtitle,
                    flowerCount: isLily
                      ? `${
                          selectedStem === "custom"
                            ? customStems
                            : selectedStem
                        } Stems`
                      : (product as any).flowerCount,
                  }}
                  variant="pill"
                />
              </div>
            ) : (
              <AddToCartButton
                product={{
                  ...(product as any),
                  price: activePrice,
                  originalPrice: activeOriginalPrice,
                  image: activeImage,
                  subtitle: isLily
                    ? `${
                        selectedStem === "custom"
                          ? `${customStems} Stems (Custom)`
                          : `${selectedStem} Stems`
                      } Arrangement`
                    : (product as any).subtitle,
                  flowerCount: isLily
                    ? `${
                        selectedStem === "custom"
                          ? customStems
                          : selectedStem
                      } Stems`
                    : (product as any).flowerCount,
                }}
                variant="pill"
              />
            )}
          </div>
        )}
      </div>
    </article>
  );
}
