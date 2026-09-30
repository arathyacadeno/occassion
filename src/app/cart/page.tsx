"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useCheckout } from "@/context/CheckoutContext";
import { useWishlist } from "@/context/WishlistContext";
import {
  Minus,
  Plus,
  Heart,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
} from "lucide-react";
import styles from "./cart.module.css";

export default function CartPage() {
  const { items, updateQty, removeItem, subtotal, cartCount } = useCart();
  const { startCartCheckout } = useCheckout();
  const { toggleItem, isInWishlist } = useWishlist();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleProceedToCheckout = () => {
    if (items.length === 0) return;

    // Map cart items into CheckoutItems
    const checkoutPayload = items.map((item) => ({
      id: item.bouquet.id,
      slug: item.bouquet.id,
      name: item.bouquet.name,
      subtitle: item.bouquet.subtitle || "Fresh flower arrangement",
      category: "flower",
      price: item.bouquet.price,
      originalPrice: item.bouquet.originalPrice,
      image: item.bouquet.image,
      quantity: item.quantity,
    }));

    startCartCheckout(checkoutPayload);
  };

  return (
    <div className={styles.pageWrapper}>
      {/* 1. Official Header / Navbar */}
      <Navbar />

      <main className={styles.mainContainer}>
        {/* Page Title */}
        <div className={styles.headerBlock}>
          <h1 className={styles.pageTitle}>Shopping Cart</h1>
          {cartCount > 0 && (
            <p className={styles.itemCountText}>
              You have {cartCount} {cartCount === 1 ? "item" : "items"} in your cart
            </p>
          )}
        </div>

        {items.length === 0 ? (
          /* Empty Cart State */
          <div className={styles.emptyCartCard}>
            <div className={styles.emptyImageWrap}>
              <img
                src="/images/farm-hand-bouquet-large.jpg"
                alt="Empty Flower Cart"
                className={styles.emptyFlowerImg}
              />
            </div>
            <h2 className={styles.emptyHeading}>Your Cart is Empty</h2>
            <p className={styles.emptyDescription}>
              Looks like your flower collection is waiting for something beautiful.
            </p>
            <Link href="/flower" className={styles.exploreFlowersBtn}>
              <span>Explore Flowers</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          /* 2-Column Cart Layout */
          <div className={styles.cartLayout}>
            {/* Left: Cart Items List */}
            <div className={styles.itemsColumn}>
              {items.map((item, idx) => {
                const isItemWishlisted = isInWishlist(item.bouquet.id);

                return (
                  <article
                    key={`${item.bouquet.id}-${idx}`}
                    className={styles.cartItemCard}
                  >
                    {/* Flower Image with rounded corners */}
                    <div className={styles.imageBox}>
                      <img
                        src={item.bouquet.image}
                        alt={item.bouquet.name}
                        className={styles.productImage}
                      />
                    </div>

                    {/* Product Details & Actions */}
                    <div className={styles.itemContent}>
                      <div className={styles.itemTopRow}>
                        <div>
                          <h3 className={styles.productName}>
                            {item.bouquet.name}
                          </h3>
                          <p className={styles.productSubtitle}>
                            {item.bouquet.subtitle || "Fresh flower arrangement"}
                          </p>
                        </div>

                        <div className={styles.priceTag}>
                          ₹{item.bouquet.price.toLocaleString("en-IN")}
                        </div>
                      </div>

                      {/* Bottom Controls Row: Stepper + Wishlist + Remove */}
                      <div className={styles.controlsRow}>
                        {/* Quantity Stepper: − 1 + */}
                        <div className={styles.stepperWrap}>
                          <button
                            type="button"
                            onClick={() => updateQty(idx, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className={styles.stepperBtn}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span className={styles.stepperNumber}>
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQty(idx, item.quantity + 1)}
                            className={styles.stepperBtn}
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        {/* Right Actions: Wishlist + Remove */}
                        <div className={styles.actionLinks}>
                          <button
                            type="button"
                            onClick={() =>
                              toggleItem({
                                id: item.bouquet.id,
                                slug: item.bouquet.id,
                                name: item.bouquet.name,
                                price: item.bouquet.price,
                                originalPrice: item.bouquet.originalPrice,
                                category: "flower",
                                categoryLabel: "Flowers",
                                image: item.bouquet.image,
                                images: [item.bouquet.image],
                                rating: item.bouquet.rating || 5,
                                reviewsCount: item.bouquet.reviewsCount || 10,
                                description: item.bouquet.description,
                                deliveryInfo: "Same-day delivery in Calicut",
                                offers: [],
                                includes: item.bouquet.stems || [],
                              })
                            }
                            className={`${styles.wishlistBtn} ${
                              isItemWishlisted ? styles.wishlistBtnActive : ""
                            }`}
                            aria-label={
                              isItemWishlisted
                                ? "Remove from wishlist"
                                : "Save to wishlist"
                            }
                            title={
                              isItemWishlisted ? "In Wishlist" : "Save to Wishlist"
                            }
                          >
                            <Heart
                              size={18}
                              strokeWidth={1.8}
                              fill={isItemWishlisted ? "#ef4444" : "none"}
                              color={isItemWishlisted ? "#ef4444" : "currentColor"}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            className={styles.removeBtn}
                            aria-label={`Remove ${item.bouquet.name} from cart`}
                          >
                            <Trash2 size={16} />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Right: Order Summary Card */}
            <aside className={styles.summaryColumn}>
              <div className={styles.orderSummaryCard}>
                <h2 className={styles.summaryTitle}>Order Summary</h2>

                <div className={styles.costRows}>
                  <div className={styles.costRow}>
                    <span className={styles.costLabel}>Subtotal</span>
                    <span className={styles.costValue}>
                      ₹{subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className={styles.costRow}>
                    <span className={styles.costLabel}>Delivery</span>
                    <span className={styles.freeBadgeText}>FREE</span>
                  </div>
                </div>

                <div className={styles.divider} />

                <div className={styles.totalRow}>
                  <span className={styles.totalLabel}>Total</span>
                  <span className={styles.totalPrice}>
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  className={styles.checkoutBtn}
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={16} />
                </button>

                {/* Trust Badges */}
                <div className={styles.trustFooter}>
                  <div className={styles.trustItem}>
                    <Sparkles size={16} className={styles.trustIcon} />
                    <span>100% Fresh Handpicked Blooms</span>
                  </div>
                  <div className={styles.trustItem}>
                    <Truck size={16} className={styles.trustIcon} />
                    <span>Same-Day Delivery in 2–4 Hours</span>
                  </div>
                  <div className={styles.trustItem}>
                    <ShieldCheck size={16} className={styles.trustIcon} />
                    <span>Secure Encrypted Checkout</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
