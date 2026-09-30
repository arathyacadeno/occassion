"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { Heart, ShoppingBag, Trash2, ArrowRight, Sparkles } from "lucide-react";
import styles from "./wishlist.module.css";

export default function WishlistPage() {
  const { items, removeItem, clearWishlist, wishlistCount } = useWishlist();
  const { addItem } = useCart();

  const handleAddToCart = (product: (typeof items)[0]) => {
    addItem(
      {
        id: product.id,
        name: product.name,
        subtitle: product.categoryLabel,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        occasion: "celebration",
        rating: product.rating,
        reviewsCount: product.reviewsCount,
        stems: product.includes || [],
        description: product.description,
        flowerCount: `${product.includes?.length || 12} items`,
        scent: "Fresh & Green",
        badge: product.badge,
        dimensions: "45cm H × 35cm W",
      },
      "Signature",
      false
    );
  };

  const handleBuyNow = (product: (typeof items)[0]) => {
    handleAddToCart(product);
    if (typeof window !== "undefined") {
      window.location.href = "/cart";
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <main className={styles.mainContainer}>
        {/* Header Banner */}
        <div className={styles.headerRow}>
          <div>
            <div className={styles.tagline}>
              <Sparkles size={16} />
              <span>Saved Favorites</span>
            </div>
            <h1 className={styles.pageTitle}>
              My Wishlist{" "}
              {wishlistCount > 0 && (
                <span className={styles.countBadge}>({wishlistCount})</span>
              )}
            </h1>
            <p className={styles.pageSubtitle}>
              Handpicked flowers and gifts you&apos;ve saved for your special moments.
            </p>
          </div>

          {wishlistCount > 0 && (
            <button
              type="button"
              onClick={clearWishlist}
              className={styles.clearBtn}
              aria-label="Clear all wishlist items"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconCircle}>
              <Heart size={44} strokeWidth={1.5} className={styles.emptyHeartIcon} />
            </div>
            <h2 className={styles.emptyTitle}>Your Wishlist is Empty</h2>
            <p className={styles.emptyDesc}>
              Save your favorite flower bouquets, cakes, and event decor to view
              and order them anytime.
            </p>
            <div className={styles.emptyActions}>
              <Link href="/flower" className={styles.exploreBtn}>
                Explore Flowers <ArrowRight size={16} />
              </Link>
              <Link href="/cakes" className={styles.secondaryExploreBtn}>
                Browse Cakes
              </Link>
            </div>
          </div>
        ) : (
          <div className={styles.gridContainer}>
            {items.map((product) => {
              const discountPercent =
                product.originalPrice && product.originalPrice > product.price
                  ? Math.round(
                      ((product.originalPrice - product.price) /
                        product.originalPrice) *
                        100
                    )
                  : null;

              return (
                <div key={product.id} className={styles.wishlistCard}>
                  {/* Image container */}
                  <Link
                    href={`/${product.category}/${product.slug}`}
                    className={styles.cardImageLink}
                  >
                    <div className={styles.imageBox}>
                      <img
                        src={product.image}
                        alt={product.name}
                        className={styles.cardImg}
                      />
                      {product.badge && (
                        <span className={styles.badge}>{product.badge}</span>
                      )}
                    </div>
                  </Link>

                  {/* Card Info */}
                  <div className={styles.cardBody}>
                    <div className={styles.categoryLabel}>
                      {product.categoryLabel}
                    </div>

                    <Link
                      href={`/${product.category}/${product.slug}`}
                      className={styles.titleLink}
                    >
                      <h3 className={styles.productTitle}>{product.name}</h3>
                    </Link>

                    {/* Price Row */}
                    <div className={styles.priceRow}>
                      <span className={styles.currentPrice}>
                        ₹{product.price.toLocaleString("en-IN")}
                      </span>
                      {product.originalPrice && (
                        <span className={styles.originalPrice}>
                          ₹{product.originalPrice.toLocaleString("en-IN")}
                        </span>
                      )}
                      {discountPercent && (
                        <span className={styles.discountBadge}>
                          {discountPercent}% OFF
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className={styles.cardActions}>
                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        className={styles.addToCartBtn}
                        aria-label={`Add ${product.name} to cart`}
                      >
                        <ShoppingBag size={16} />
                        <span>Add To Cart</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleBuyNow(product)}
                        className={styles.buyNowBtn}
                        aria-label={`Buy ${product.name} now`}
                      >
                        Buy Now
                      </button>

                      <button
                        type="button"
                        onClick={() => removeItem(product.id)}
                        className={styles.removeBtn}
                        aria-label={`Remove ${product.name} from wishlist`}
                        title="Remove"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
