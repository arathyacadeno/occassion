"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  Gift,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { ADDON_PRODUCTS, AddonProduct } from "@/data/addons";
import styles from "./CartItemAddons.module.css";

// Dynamic categories built from ADDON_PRODUCTS with "All" first
const CATEGORIES: string[] = [
  "All",
  ...Array.from(new Set(ADDON_PRODUCTS.map((p) => p.category))),
];

export interface AttachedAddon {
  item: any;
  originalIndex: number;
}

interface CartItemAddonsProps {
  attachedAddons: AttachedAddon[];
}

export default function CartItemAddons({ attachedAddons }: CartItemAddonsProps) {
  const { addItem, removeItem } = useCart();
  // 1) Starts collapsed on page load
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(true);
  const trackRef = useRef<HTMLDivElement | null>(null);

  // Filter products by selected category
  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All") return ADDON_PRODUCTS;
    return ADDON_PRODUCTS.filter((p) => p.category === selectedCategory);
  }, [selectedCategory]);

  // Set of attached addon IDs for rapid check
  const attachedIdsSet = useMemo(() => {
    return new Set(attachedAddons.map((a) => a.item.bouquet.id));
  }, [attachedAddons]);

  // Check scroll bounds to enable/disable floating arrows
  const updateScrollBounds = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateScrollBounds();
    el.addEventListener("scroll", updateScrollBounds, { passive: true });
    window.addEventListener("resize", updateScrollBounds);
    return () => {
      el.removeEventListener("scroll", updateScrollBounds);
      window.removeEventListener("resize", updateScrollBounds);
    };
  }, [filteredProducts, updateScrollBounds, isExpanded]);

  const handleScroll = (direction: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    const distance = Math.max(220, Math.floor(el.clientWidth * 0.75));
    const target =
      direction === "left" ? el.scrollLeft - distance : el.scrollLeft + distance;
    el.scrollTo({ left: target, behavior: "smooth" });
    setTimeout(updateScrollBounds, 350);
  };

  const handleToggleAddon = (addon: AddonProduct) => {
    const existing = attachedAddons.find((a) => a.item.bouquet.id === addon.id);

    if (existing) {
      removeItem(existing.originalIndex);
    } else {
      addItem(
        {
          id: addon.id,
          slug: addon.id,
          name: addon.name,
          subtitle: "Recommended Addon",
          price: addon.price,
          originalPrice: (addon as any).originalPrice,
          image: addon.image,
          rating: 4.9,
          reviewsCount: 15,
          stems: [],
          occasion: "celebration",
          description: addon.name,
          flowerCount: "1",
          category: addon.category.toLowerCase(),
        } as any,
        "Signature",
        false,
        "",
        1
      );
    }
  };

  const attachedCount = attachedAddons.length;

  return (
    <div className={styles.addonsWrapper}>
      {/* 1) Entire bar is a single button toggling collapsed/expanded */}
      <button
        type="button"
        className={styles.headerBar}
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
        aria-label={isExpanded ? "Collapse add-ons" : "Expand add-ons"}
      >
        <div className={styles.titleArea}>
          <span className={styles.giftIconWrap}>
            <Gift size={20} strokeWidth={1.8} />
          </span>
          <span className={styles.sectionTitle}>Make It Extra Special!</span>
          {attachedCount > 0 && (
            <span className={styles.itemCountBadge}>
              {attachedCount} added
            </span>
          )}
        </div>

        <span className={styles.chevronWrap}>
          {isExpanded ? (
            <ChevronUp size={20} strokeWidth={2} />
          ) : (
            <ChevronDown size={20} strokeWidth={2} />
          )}
        </span>
      </button>

      {/* 2) Expanded State: Category Pills + Horizontal Cards Carousel */}
      {isExpanded && (
        <div className={styles.expandedContent}>
          {/* Category Filter Pills */}
          <div className={styles.categoryPillsTrack}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`${styles.pillBtn} ${
                  selectedCategory === cat ? styles.pillBtnActive : ""
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Carousel Viewport with Floating Navigation Buttons */}
          <div className={styles.carouselViewport}>
            {canScrollLeft && (
              <button
                type="button"
                onClick={() => handleScroll("left")}
                className={`${styles.floatingArrowBtn} ${styles.floatingArrowLeft}`}
                aria-label="Previous add-ons"
                title="Previous add-ons"
              >
                <ChevronLeft size={18} strokeWidth={2.4} />
              </button>
            )}

            {canScrollRight && (
              <button
                type="button"
                onClick={() => handleScroll("right")}
                className={`${styles.floatingArrowBtn} ${styles.floatingArrowRight}`}
                aria-label="Next add-ons"
                title="More add-ons"
              >
                <ChevronRight size={18} strokeWidth={2.4} />
              </button>
            )}

            <div ref={trackRef} className={styles.cardsTrack}>
              {filteredProducts.map((addon) => {
                const isAdded = attachedIdsSet.has(addon.id);
                const originalPrice = (addon as any).originalPrice as
                  | number
                  | undefined;

                return (
                  <div
                    key={addon.id}
                    className={`${styles.addonCard} ${
                      isAdded ? styles.addonCardAdded : ""
                    }`}
                  >
                    <div className={styles.addonImageWrap}>
                      <img
                        src={addon.image}
                        alt={addon.name}
                        className={styles.addonImg}
                        loading="lazy"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleAddon(addon);
                        }}
                        className={`${styles.quickAddBtn} ${
                          isAdded ? styles.quickAddBtnAdded : ""
                        }`}
                        title={isAdded ? "Remove from cart" : "Add to cart"}
                        aria-label={`${isAdded ? "Remove" : "Add"} ${addon.name}`}
                      >
                        {isAdded ? (
                          <Check size={15} strokeWidth={2.6} />
                        ) : (
                          <Plus size={16} strokeWidth={2.2} />
                        )}
                      </button>
                    </div>

                    <div className={styles.cardContent}>
                      <div className={styles.addonTitle} title={addon.name}>
                        {addon.name}
                      </div>

                      <div className={styles.priceContainer}>
                        <span className={styles.priceCurrent}>
                          ₹{addon.price.toLocaleString("en-IN")}
                        </span>
                        {originalPrice && originalPrice > addon.price && (
                          <span className={styles.priceOriginal}>
                            ₹{originalPrice.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
