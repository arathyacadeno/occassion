"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import styles from "./RecommendedAddons.module.css";

export interface AddonProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  href: string;
  sectionHref: string;
}

export const ADDON_PRODUCTS: AddonProduct[] = [

  {
    id: "addon-cadbury-silk",
    name: "Cadbury Dairy Milk Silk",
    price: 80,
    image: "/images/addons/dairy-milk-silk.jpg",
    category: "Chocolates",
    href: "/special-occasions/cadbury-dairy-milk-silk",
    sectionHref: "/special-occasions",
  },
  {
    id: "addon-black-forest",
    name: "Black Forest",
    price: 80,
    image: "/images/addons/black-forest.jpg",
    category: "Cakes",
    href: "/cakes/black-forest",
    sectionHref: "/cakes",
  },
  {
    id: "addon-soft-toys",
    name: "Soft Toys",
    price: 80,
    image: "/images/addons/soft-toys.jpg",
    category: "Gifts",
    href: "/special-occasions/soft-toys",
    sectionHref: "/special-occasions",
  },
];

export interface RecommendedAddonsProps {
  selectedAddons?: Record<string, number>;
  onAddonChange?: (addons: Record<string, number>) => void;
}

export default function RecommendedAddons({
  selectedAddons,
  onAddonChange,
}: RecommendedAddonsProps = {}) {
  const { addItem } = useCart();

  const [localQuantities, setLocalQuantities] = useState<Record<string, number>>({});
  const quantities = selectedAddons !== undefined ? selectedAddons : localQuantities;

  const updateQuantities = (next: Record<string, number>) => {
    if (onAddonChange) {
      onAddonChange(next);
    }
    setLocalQuantities(next);
  };

  const handleIncrement = (id: string) => {
    const current = quantities[id] || 0;
    const next = current + 1;
    const nextQuantities = {
      ...quantities,
      [id]: next,
    };

    updateQuantities(nextQuantities);

    // Add to cart safely outside state updater
    const addon = ADDON_PRODUCTS.find((p) => p.id === id);
    if (addon) {
      addItem(
        {
          id: addon.id,
          name: addon.name,
          subtitle: "Recommended Addon",
          price: addon.price,
          image: addon.image,
          occasion: "celebration",
          rating: 5.0,
          reviewsCount: 42,
          stems: [],
          flowerCount: "1 item",
          description: addon.name,
          scent: "Fresh & Green",
          dimensions: "Standard",
        },
        "Signature",
        false
      );
    }
  };

  const handleDecrement = (id: string) => {
    const current = quantities[id] || 0;
    const nextQuantities = { ...quantities };
    if (current <= 1) {
      delete nextQuantities[id];
    } else {
      nextQuantities[id] = current - 1;
    }
    updateQuantities(nextQuantities);
  };

  return (
    <section className={styles.addonsSection} aria-label="Recommended Addon Products">
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Recommended Addon Products</h2>
        <Link href="/special-occasions" className={styles.exploreMoreBtn}>
          Explore More
        </Link>
      </div>

      {/* Large Pink Card Container matching target layout */}
      <div className={styles.addonsContainer}>
        <div className={styles.addonsTrack}>
          {ADDON_PRODUCTS.map((product) => {
            const qty = quantities[product.id] || 0;

            return (
              <div key={product.id} className={styles.addonCard}>
                {/* Image Container with signature chamfered ramp wave cutout */}
                <div className={styles.imageContainer}>
                  <Link
                    href={product.href}
                    className={styles.imageLink}
                    aria-label={`View ${product.name}`}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className={styles.cardImage}
                      loading="lazy"
                    />
                  </Link>
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

                {/* Card Details */}
                <div className={styles.cardContent}>
                  <h3 className={styles.productName} title={product.name}>
                    <Link href={product.href} className={styles.titleLink}>
                      {product.name}
                    </Link>
                  </h3>
                  <div className={styles.productPrice}>
                    ₹ {product.price.toFixed(2)}
                  </div>

                  {qty > 0 ? (
                    <div className={styles.qtyControl}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDecrement(product.id);
                        }}
                        className={styles.qtyBtn}
                        aria-label={`Decrease ${product.name} quantity`}
                      >
                        <Minus size={14} strokeWidth={2.6} />
                      </button>
                      <span className={styles.qtyValue}>
                        {String(qty).padStart(2, "0")}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleIncrement(product.id);
                        }}
                        className={styles.qtyBtn}
                        aria-label={`Increase ${product.name} quantity`}
                      >
                        <Plus size={14} strokeWidth={2.6} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleIncrement(product.id);
                      }}
                      className={styles.addBtn}
                    >
                      ADD
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
