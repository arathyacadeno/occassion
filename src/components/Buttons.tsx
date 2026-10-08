"use client";

import React, { useState } from "react";
import { ShoppingBag, Check, Minus, Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Product } from "@/data/catalog";
import styles from "./Buttons.module.css";

interface AddToCartButtonProps {
  product: Product;
  className?: string;
  size?: "small" | "large";
  variant?: "default" | "pill";
}

export function AddToCartButton({
  product,
  className = "",
  size = "small",
  variant = "default",
}: AddToCartButtonProps) {
  const { addItem, items, updateQty } = useCart();
  const { isAuthenticated } = useAuth();
  const [added, setAdded] = useState(false);

  const cartItemIndex = items.findIndex((i) => i.bouquet.id === product.id);
  const cartItem = cartItemIndex > -1 ? items[cartItemIndex] : null;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("show-signin-modal"));
      }
      return;
    }

    // Map Product into Bouquet format expected by CartContext
    addItem(
      {
        id: product.id,
        slug: product.slug,
        category: product.category,
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

    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 1800);
  };

  if (cartItem) {
    return (
      <div
        className={`${styles.qtySelector} ${
          variant === "pill" ? styles.qtyPill : ""
        } ${size === "large" ? styles.qtyLarge : ""} ${className}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <button
          type="button"
          className={styles.qtyBtn}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            updateQty(cartItemIndex, cartItem.quantity - 1);
          }}
          aria-label="Decrease quantity"
        >
          <Minus size={16} strokeWidth={3} />
        </button>
        <span className={styles.qtyText}>{cartItem.quantity}</span>
        <button
          type="button"
          className={styles.qtyBtn}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            updateQty(cartItemIndex, cartItem.quantity + 1);
          }}
          aria-label="Increase quantity"
        >
          <Plus size={16} strokeWidth={3} />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${styles.addToCartBtn} ${
        variant === "pill" ? styles.pillBtn : ""
      } ${size === "large" ? styles.largeBtn : ""} ${
        added ? styles.addedState : ""
      } ${className}`}
      aria-label={`Add ${product.name} to cart`}
    >
      {added ? (
        <>
          <Check size={16} strokeWidth={2.5} />
          <span>Added to Cart</span>
        </>
      ) : (
        <>
          {variant !== "pill" && <ShoppingBag size={16} strokeWidth={1.8} />}
          <span>Add to Cart</span>
        </>
      )}
    </button>
  );
}

import { useCheckout } from "@/context/CheckoutContext";

export function BuyNowButton({ product }: { product: Product }) {
  const { startBuyNow } = useCheckout();

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    startBuyNow({
      id: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      quantity: 1,
    });
  };

  return (
    <button
      type="button"
      onClick={handleBuyNow}
      className={styles.buyNowBtn}
      aria-label={`Buy ${product.name} now`}
    >
      Buy Now
    </button>
  );
}
