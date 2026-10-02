"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useWishlist } from "@/context/WishlistContext";
import { Heart, ArrowRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import styles from "./wishlist.module.css";

export default function WishlistPage() {
  const { items, clearWishlist, wishlistCount } = useWishlist();

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <main className={styles.mainContainer}>
        {/* Header Banner */}
        <div className={styles.headerRow}>
          <div className={styles.headerTextContainer}>
            <h1 className={styles.pageTitle}>My Wishlist</h1>
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
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
