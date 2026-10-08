"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
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
    id: "addon-ferrero-rocher-heart",
    name: "Ferrero Rocher Heart",
    price: 150,
    image: "/images/addons/ferrero-rocher-heart.jpg",
    category: "Chocolates",
    href: "/special-occasions/ferrero-rocher-heart",
    sectionHref: "/special-occasions",
  },
  {
    id: "addon-kitkat",
    name: "KitKat",
    price: 40,
    image: "/images/addons/kitkat.jpg",
    category: "Chocolates",
    href: "/special-occasions/kitkat",
    sectionHref: "/special-occasions",
  },
    {
    id: "addon-golden-crumb-chocolate-drizzle-cake",
    name: "Golden Crumb Chocolate Drizzle Cake",
    price: 1200,
    image: "/images/cakes/golden-crumb-chocolate-drizzle-cake.png",
    category: "Cakes",
    href: "/cakes/golden-crumb-chocolate-drizzle-cake",
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
  {
    id: "addon-cadbury-silk-oreo",
    name: "Cadbury Dairy Milk Silk Oreo",
    price: 80,
    image: "/images/addons/cadbury-silk-oreo.jpg",
    category: "Chocolates",
    href: "/special-occasions/cadbury-silk-oreo",
    sectionHref: "/special-occasions",
  },
  {
    id: "addon-toblerone",
    name: "Toblerone",
    price: 100,
    image: "/images/addons/toblerone.jpg",
    category: "Chocolates",
    href: "/special-occasions/toblerone",
    sectionHref: "/special-occasions",
  },
  {
    id: "addon-galaxy-smooth-milk",
    name: "Galaxy Smooth Milk",
    price: 80,
    image: "/images/addons/galaxy-smooth-milk.jpg",
    category: "Chocolates",
    href: "/special-occasions/galaxy-smooth-milk",
    sectionHref: "/special-occasions",
  },
  {
    id: "addon-cadbury-dairy-milk",
    name: "Cadbury Dairy Milk Bubbly",
    price: 80,
    image: "/images/addons/dairy-milk-bubbly.jpg",
    category: "Chocolates",
    href: "/special-occasions/cadbury-dairy-bubbly",
    sectionHref: "/special-occasions",
  },
  {
    id: "addon-cadbury-fruit-nut",
    name: "Cadbury Dairy Milk Fruit & Nut",
    price: 80,
    image: "/images/addons/dairy-milk-fruit-nut.jpg",
    category: "Chocolates",
    href: "/special-occasions/cadbury-fruit-nut",
    sectionHref: "/special-occasions",
  },
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
    id: "addon-elegant-red-heart-anniversary-cake",
    name: "Elegant Red Heart Anniversary Cake",
    price: 1200,
    image: "/images/cakes/elegant-red-heart-anniversary-cake.png",
    category: "Cakes",
    href: "/cakes/elegant-red-heart-anniversary-cake",
    sectionHref: "/cakes",
  },

];

export interface RecommendedAddonsProps {
  selectedAddons?: Record<string, number>;
  onAddonChange?: (addons: Record<string, number>) => void;
  mainCategory?: string;
}

const getAddonProducts = (category?: string) => {
  const norm = category?.toLowerCase() || "";
  if (norm === "cakes") {
    return ADDON_PRODUCTS.filter(p => p.category === "Chocolates" || p.category === "Gifts");
  }
  if (norm === "flower" || norm === "basket") {
    const valid = ADDON_PRODUCTS.filter(p => p.category === "Cakes" || p.category === "Chocolates" || p.category === "Gifts");
    const cakes = valid.filter(p => p.category === "Cakes");
    const gifts = valid.filter(p => p.category === "Gifts");
    const chocolates = valid.filter(p => p.category === "Chocolates");
    // Bring cakes and gifts to the front so they are visible in the initial 6 slots
    return [...cakes, ...gifts, ...chocolates];
  }
  return ADDON_PRODUCTS;
};

export default function RecommendedAddons({
  selectedAddons,
  onAddonChange,
  mainCategory,
}: RecommendedAddonsProps = {}) {
  const { addItem } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const filteredAddons = getAddonProducts(mainCategory);

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
      <h2 className={styles.sectionTitle}>Recommended Addon Products</h2>

      {/* Large Pink Card Container matching target layout */}
      <div className={styles.addonsContainer}>
        <button type="button" onClick={() => setIsModalOpen(true)} className={styles.exploreMoreCircleBtn} aria-label="Explore More Addons">
          <svg width="32" height="24" viewBox="0 0 32 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12h28M23 5l7 7-7 7" />
          </svg>
        </button>
        <div className={styles.addonsTrack}>
          {filteredAddons.slice(0, 6).map((product) => {
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

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Choose Your Add-ons</h3>
              <button className={styles.closeModalBtn} onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <div className={styles.modalGrid}>
              {filteredAddons.map((product) => {
                const qty = quantities[product.id] || 0;

                return (
                  <div key={product.id} className={styles.addonCard}>
                    <div className={styles.imageContainer}>
                      <img
                        src={product.image}
                        alt={product.name}
                        className={styles.cardImage}
                        loading="lazy"
                      />
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

                    <div className={styles.cardContent}>
                      <h3 className={styles.productName} title={product.name}>
                        {product.name}
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
        </div>
      )}
    </section>
  );
}
