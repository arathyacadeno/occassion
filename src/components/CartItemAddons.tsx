"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  Gift,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Plus,
  Check,
  Maximize2,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { ADDON_PRODUCTS, AddonProduct } from "@/data/addons";
import AddonModal from "@/components/AddonModal";
import styles from "./CartItemAddons.module.css";

// Category options
const CATEGORIES = ["All", "Cakes", "Chocolates", "Gifts"] as const;

export interface AttachedAddon {
  item: any;
  originalIndex: number;
}

interface CartItemAddonsProps {
  attachedAddons: AttachedAddon[];
}

export default function CartItemAddons({ attachedAddons }: CartItemAddonsProps) {
  const { addItem, removeItem, updateQty } = useCart();
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(true);
  const trackRef = useRef<HTMLDivElement | null>(null);

  // Filter products by category tab
  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All") return ADDON_PRODUCTS;
    return ADDON_PRODUCTS.filter((p) => p.category === selectedCategory);
  }, [selectedCategory]);

  // Set of attached addon IDs for rapid check
  const attachedIdsSet = useMemo(() => {
    return new Set(attachedAddons.map((a) => a.item.bouquet.id));
  }, [attachedAddons]);

  // Map of addon id -> quantity for AddonModal
  const selectedAddonsMap = useMemo<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    attachedAddons.forEach(({ item }) => {
      const id = item.bouquet?.id;
      if (id) {
        map[id] = item.quantity || 1;
      }
    });
    return map;
  }, [attachedAddons]);

  // Handle addon changes coming from the full-screen-width AddonModal
  const handleModalAddonChange = (nextQuantities: Record<string, number>) => {
    // 1. Process items in nextQuantities (add new or update quantity)
    Object.entries(nextQuantities).forEach(([addonId, targetQty]) => {
      const existing = attachedAddons.find((a) => a.item.bouquet.id === addonId);
      if (existing) {
        if (targetQty <= 0) {
          removeItem(existing.originalIndex);
        } else if (existing.item.quantity !== targetQty) {
          updateQty(existing.originalIndex, targetQty);
        }
      } else if (targetQty > 0) {
        const addonProduct = ADDON_PRODUCTS.find((p) => p.id === addonId);
        if (addonProduct) {
          addItem(
            {
              id: addonProduct.id,
              slug: addonProduct.id,
              name: addonProduct.name,
              subtitle: "Recommended Addon",
              price: addonProduct.price,
              originalPrice:
                (addonProduct as any).originalPrice ||
                Math.round(addonProduct.price * 1.35),
              image: addonProduct.image,
              rating: 4.9,
              reviewsCount: 15,
              stems: [],
              occasion: "celebration",
              description: addonProduct.name,
              flowerCount: "1",
              category: addonProduct.category.toLowerCase(),
            } as any,
            "Signature",
            false,
            "",
            targetQty
          );
        }
      }
    });

    // 2. Process items removed (present in attachedAddons but not in nextQuantities)
    attachedAddons.forEach(({ item, originalIndex }) => {
      const id = item.bouquet?.id;
      if (id && (!nextQuantities[id] || nextQuantities[id] <= 0)) {
        removeItem(originalIndex);
      }
    });
  };

  // Check scroll bounds to enable/disable buttons
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

  // Handle horizontal scroll
  const handleScroll = (direction: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    const distance = Math.max(220, Math.floor(el.clientWidth * 0.75));
    const target = direction === "left" ? el.scrollLeft - distance : el.scrollLeft + distance;
    el.scrollTo({ left: target, behavior: "smooth" });
    setTimeout(updateScrollBounds, 350);
  };

  // Toggle or add addon directly from compact card
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
          originalPrice:
            (addon as any).originalPrice || Math.round(addon.price * 1.35),
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
      {/* Header Bar - Clicking anywhere opens the full screen-width AddonModal */}
      <div
        className={styles.headerRow}
        onClick={() => setIsModalOpen(true)}
        role="button"
        tabIndex={0}
        title="Click to open add-ons screen"
        aria-label="Open Make It Extra Special add-ons screen"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsModalOpen(true);
          }
        }}
      >
        <div className={styles.titleArea}>
          <span className={styles.giftIconBadge}>
            <Gift size={15} strokeWidth={2.4} />
          </span>
          <h4 className={styles.sectionTitle}>Make It Extra Special!</h4>
          {attachedCount > 0 && (
            <span className={styles.itemCountBadge}>
              {attachedCount} {attachedCount === 1 ? "added" : "added"}
            </span>
          )}
        </div>

        <div className={styles.headerControls}>
          {/* View Screen Pill button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
            className={styles.openScreenBtn}
            title="Open full screen add-ons"
            aria-label="Open add-ons screen"
          >
            <Maximize2 size={12} strokeWidth={2.4} />
            <span>Explore All</span>
          </button>

          {/* Dropdown Chevron button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
            className={styles.toggleExpandBtn}
            aria-label="Open add-ons screen"
            title="Open add-ons screen"
          >
            <ChevronDown size={18} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {/* Inline Compact Carousel Preview */}
      {isExpanded && (
        <>
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

          {/* Horizontal Add-on Cards Carousel with Floating Side Arrows */}
          <div className={styles.carouselViewport}>
            {/* Floating Left Arrow */}
            {canScrollLeft && (
              <button
                type="button"
                onClick={() => handleScroll("left")}
                className={`${styles.floatingArrowBtn} ${styles.floatingArrowLeft}`}
                aria-label="Scroll left"
                title="Previous add-ons"
              >
                <ChevronLeft size={16} strokeWidth={2.4} />
              </button>
            )}

            {/* Floating Right Arrow */}
            {canScrollRight && (
              <button
                type="button"
                onClick={() => handleScroll("right")}
                className={`${styles.floatingArrowBtn} ${styles.floatingArrowRight}`}
                aria-label="Scroll right"
                title="More add-ons"
              >
                <ChevronRight size={16} strokeWidth={2.4} />
              </button>
            )}

            <div ref={trackRef} className={styles.cardsTrack}>
              {filteredProducts.map((addon) => {
                const isAdded = attachedIdsSet.has(addon.id);

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
                          <Check size={13} strokeWidth={3} />
                        ) : (
                          <Plus size={13} strokeWidth={2.6} />
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
                        {addon.price && (
                          <span className={styles.priceOriginal}>
                            ₹{Math.round(addon.price * 1.35).toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>

                      {isAdded && (
                        <div className={styles.addedStatusBadge}>
                          <Check size={9} strokeWidth={3} />
                          <span>Added</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* The full screen-width Add-ons Modal dialog */}
      <AddonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedAddons={selectedAddonsMap}
        onAddonChange={handleModalAddonChange}
        isBuyNow={false}
        title="Make It Extra Special!"
        subtitle="Select special add-ons to accompany your gift"
      />
    </div>
  );
}
