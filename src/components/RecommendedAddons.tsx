"use client";

import React, { useState, useRef, useEffect } from "react";
import { Minus, Plus, ChevronLeft, ChevronRight } from "lucide-react";
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
  {
    id: "addon-red-velvet",
    name: "Red Velvet Cake",
    price: 80,
    image: "/images/addons/red-velvet.jpg",
    category: "Cakes",
  },
  {
    id: "addon-heart-balloons",
    name: "Heart Foil Balloons",
    price: 80,
    image: "/images/addons/heart-balloons.jpg",
    category: "Gifts",
  },
];

export default function RecommendedAddons() {
  const { addItem } = useCart();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Initialized with Cadbury Silk at 4 to match reference image, others at 0
  const [quantities, setQuantities] = useState<Record<string, number>>({
    "addon-cadbury-silk": 4,
  });

  const checkScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const cardWidth = 204; // 190px card + 14px gap
      const scrollAmount = direction === "left" ? -cardWidth * 2 : cardWidth * 2;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      setTimeout(checkScroll, 350);
    }
  };

  const handleIncrement = (id: string) => {
    setQuantities((prev) => {
      const current = prev[id] || 0;
      const next = current + 1;

      // Add to cart on initial addition
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
      {/* Header Row: Title on Left, Carousel Navigation Arrows on Right */}
      <div className={styles.headerRow}>
        <h2 className={styles.sectionTitle}>Recommended Addon Products</h2>

        <div className={styles.carouselControls}>
          <button
            type="button"
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={`${styles.carouselArrowBtn} ${
              !canScrollLeft ? styles.disabledArrow : ""
            }`}
            aria-label="Previous addon products"
          >
            <ChevronLeft size={20} strokeWidth={2.2} />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={`${styles.carouselArrowBtn} ${
              !canScrollRight ? styles.disabledArrow : ""
            }`}
            aria-label="Next addon products"
          >
            <ChevronRight size={20} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {/* Smooth Horizontal Carousel Track */}
      <div
        ref={carouselRef}
        onScroll={checkScroll}
        className={styles.carouselTrack}
      >
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
