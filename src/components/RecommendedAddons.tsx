"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import AddonModal from "@/components/AddonModal";
import styles from "./RecommendedAddons.module.css";

import { AddonProduct, ADDON_PRODUCTS } from "@/data/addons";
export type { AddonProduct };
export { ADDON_PRODUCTS };

export interface RecommendedAddonsProps {
  selectedAddons?: Record<string, number>;
  onAddonChange?: (addons: Record<string, number>) => void;
  mainCategory?: string;
}

export const getAddonProducts = (category?: string) => {
  const norm = category?.toLowerCase() || "";
  if (norm === "wreaths" || norm === "wreath") {
    return [];
  }

  const cakes = ADDON_PRODUCTS.filter((p) => p.category === "Cakes");
  const chocolates = ADDON_PRODUCTS.filter((p) => p.category === "Chocolates");
  const softToys = ADDON_PRODUCTS.filter((p) => p.category === "Soft Toys");

  // If viewing a cake, prioritize chocolates and soft toys before cakes
  const groups = norm === "cakes"
    ? [chocolates, softToys, cakes]
    : [cakes, chocolates, softToys];

  const mixed: AddonProduct[] = [];
  const maxLen = Math.max(cakes.length, chocolates.length, softToys.length);

  for (let i = 0; i < maxLen; i++) {
    for (const grp of groups) {
      if (grp[i]) {
        mixed.push(grp[i]);
      }
    }
  }

  return mixed;
};

export default function RecommendedAddons({
  selectedAddons,
  onAddonChange,
  mainCategory,
}: RecommendedAddonsProps = {}) {
  const { addItem } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const filteredAddons = getAddonProducts(mainCategory);

  if (filteredAddons.length === 0) {
    return null;
  }

  const [localQuantities, setLocalQuantities] = useState<Record<string, number>>({});
  const quantities = selectedAddons !== undefined ? selectedAddons : localQuantities;

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

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
      <h2 className={styles.sectionTitle}>Recommended Addon Products</h2>

      {/* Large Pink Card Container matching target layout */}
      <div className={styles.addonsContainer}>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={styles.exploreMoreCircleBtn}
          aria-label="Explore More Addons"
        >
          <svg
            width="32"
            height="24"
            viewBox="0 0 32 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 12h28M23 5l7 7-7 7" />
          </svg>
        </button>
        <div className={styles.addonsTrack}>
          {filteredAddons.slice(0, 5).map((product) => {
            const qty = quantities[product.id] || 0;

            return (
              <div
                key={product.id}
                className={`${styles.addonCard} ${
                  qty > 0 ? styles.addonCardSelected : ""
                }`}
              >
                {/* Clean Image Container */}
                <div className={styles.imageContainer}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className={styles.cardImage}
                    loading="lazy"
                  />
                </div>

                {/* Card Details */}
                <div className={styles.cardContent}>
                  <h3 className={styles.productName} title={product.name}>
                    {product.name}
                  </h3>
                  <div className={styles.productPrice}>
                    ₹ {Math.round(product.price).toLocaleString("en-IN")}
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

      <AddonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedAddons={quantities}
        onAddonChange={updateQuantities}
        mainCategory={mainCategory}
        isBuyNow={false}
      />
    </section>
  );
}
