"use client";

import React, { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import styles from "./RecommendedAddons.module.css";

export interface AddonProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

export const ADDON_PRODUCTS: AddonProduct[] = [
  {
    id: "addon-ferrero",
    name: "Ferrero Rocher Chocolate",
    price: 80,
    image: "/images/addons/ferrero-rocher.jpg",
    category: "Chocolates",
  },
  {
    id: "addon-cadbury-silk",
    name: "Cadbury Dairy Milk Silk",
    price: 80,
    image: "/images/addons/dairy-milk-silk.jpg",
    category: "Chocolates",
  },
  {
    id: "addon-black-forest",
    name: "Black Forest",
    price: 80,
    image: "/images/addons/black-forest.jpg",
    category: "Cakes",
  },
  {
    id: "addon-soft-toys",
    name: "Soft Toys",
    price: 80,
    image: "/images/addons/soft-toys.jpg",
    category: "Gifts",
  },
];

export default function RecommendedAddons() {
  const { addItem } = useCart();

  // Initialized with Cadbury Silk at 4 to match reference image, others at 0
  const [quantities, setQuantities] = useState<Record<string, number>>({
    "addon-cadbury-silk": 4,
  });

  const handleIncrement = (id: string) => {
    setQuantities((prev) => {
      const current = prev[id] || 0;
      const next = current + 1;

      // Add to cart on first add
      if (current === 0) {
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
      }

      return {
        ...prev,
        [id]: next,
      };
    });
  };

  const handleDecrement = (id: string) => {
    setQuantities((prev) => {
      const current = prev[id] || 0;
      if (current <= 1) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return {
        ...prev,
        [id]: current - 1,
      };
    });
  };

  return (
    <section className={styles.addonsSection} aria-label="Recommended Addon Products">
      <h2 className={styles.sectionTitle}>Recommended Addon Products</h2>

      <div className={styles.addonsGrid}>
        {ADDON_PRODUCTS.map((product) => {
          const qty = quantities[product.id] || 0;

          return (
            <div key={product.id} className={styles.addonCard}>
              {/* Image with subtle organic wave cutout at bottom */}
              <div className={styles.imageContainer}>
                <img
                  src={product.image}
                  alt={product.name}
                  className={styles.cardImage}
                  loading="lazy"
                />
                <svg
                  viewBox="0 0 280 32"
                  preserveAspectRatio="none"
                  className={styles.waveSvg}
                  aria-hidden="true"
                >
                  <path
                    d="M0,14 C50,-2 110,-2 155,14 C190,26 235,28 280,18 L280,32 L0,32 Z"
                    fill="#ffffff"
                  />
                </svg>
              </div>

              {/* Card Details */}
              <div className={styles.cardContent}>
                <h3 className={styles.productName}>{product.name}</h3>
                <div className={styles.productPrice}>
                  ₹ {product.price.toFixed(2)}
                </div>

                {qty > 0 ? (
                  <div className={styles.qtyControl}>
                    <button
                      type="button"
                      onClick={() => handleDecrement(product.id)}
                      className={styles.qtyBtn}
                      aria-label={`Decrease ${product.name} quantity`}
                    >
                      <Minus size={16} strokeWidth={2.8} />
                    </button>
                    <span className={styles.qtyValue}>
                      {String(qty).padStart(2, "0")}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleIncrement(product.id)}
                      className={styles.qtyBtn}
                      aria-label={`Increase ${product.name} quantity`}
                    >
                      <Plus size={16} strokeWidth={2.8} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleIncrement(product.id)}
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
    </section>
  );
}
