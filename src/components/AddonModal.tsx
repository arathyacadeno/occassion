"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Minus, Plus, X, ArrowRight } from "lucide-react";
import { ADDON_PRODUCTS, getAddonProducts } from "@/components/RecommendedAddons";
import styles from "./AddonModal.module.css";

export interface AddonModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAddons?: Record<string, number>;
  onAddonChange: (addons: Record<string, number>) => void;
  mainCategory?: string;
  isBuyNow?: boolean;
  basePrice?: number;
  quantity?: number;
  onProceed?: () => void;
  onSkip?: () => void;
  title?: string;
  subtitle?: string;
}

export default function AddonModal({
  isOpen,
  onClose,
  selectedAddons = {},
  onAddonChange,
  mainCategory,
  isBuyNow = false,
  basePrice,
  quantity = 1,
  onProceed,
  onSkip,
  title = "Choose Your Add-ons",
  subtitle = "Make the celebration extra special with thoughtful extras",
}: AddonModalProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const filteredAddons = useMemo(() => getAddonProducts(mainCategory), [mainCategory]);

  // Categories list with order: All, Cakes, Chocolates, Soft Toys
  const categories = useMemo(() => {
    const cats = Array.from(new Set(filteredAddons.map((p) => p.category)));
    const order = ["Cakes", "Chocolates", "Soft Toys"];
    cats.sort((a, b) => {
      const iA = order.indexOf(a);
      const iB = order.indexOf(b);
      if (iA !== -1 && iB !== -1) return iA - iB;
      if (iA !== -1) return -1;
      if (iB !== -1) return 1;
      return a.localeCompare(b);
    });
    return ["All", ...cats];
  }, [filteredAddons]);

  // Selected count per category
  const categorySelectedCounts = useMemo(() => {
    const counts: Record<string, number> = { All: 0 };
    Object.entries(selectedAddons).forEach(([id, qty]) => {
      if (qty > 0) {
        const item = ADDON_PRODUCTS.find((p) => p.id === id);
        counts.All = (counts.All || 0) + qty;
        if (item) {
          counts[item.category] = (counts[item.category] || 0) + qty;
        }
      }
    });
    return counts;
  }, [selectedAddons]);

  // Filtered addons to display
  const displayedAddons = useMemo(() => {
    if (activeCategory === "All") return filteredAddons;
    return filteredAddons.filter((p) => p.category === activeCategory);
  }, [filteredAddons, activeCategory]);

  if (!isOpen || filteredAddons.length === 0) return null;

  const handleIncrement = (id: string) => {
    const current = selectedAddons[id] || 0;
    const nextQuantities = {
      ...selectedAddons,
      [id]: current + 1,
    };
    onAddonChange(nextQuantities);
  };

  const handleDecrement = (id: string) => {
    const current = selectedAddons[id] || 0;
    const nextQuantities = { ...selectedAddons };
    if (current <= 1) {
      delete nextQuantities[id];
    } else {
      nextQuantities[id] = current - 1;
    }
    onAddonChange(nextQuantities);
  };

  // Add-ons total
  const addonsTotal = Object.entries(selectedAddons).reduce((sum, [id, qty]) => {
    const item = ADDON_PRODUCTS.find((p) => p.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const totalAddonCount = Object.values(selectedAddons).reduce(
    (sum, qty) => sum + qty,
    0
  );

  const grandTotal =
    (basePrice !== undefined ? basePrice * quantity : 0) + addonsTotal;

  return (
    <div
      className={styles.modalOverlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="addon-modal-title"
    >
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerText}>
            <h3 id="addon-modal-title" className={styles.modalTitle}>
              {title}
            </h3>
            <p className={styles.modalSubtitle}>{subtitle}</p>
          </div>
          <button
            type="button"
            className={styles.closeModalBtn}
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Category Tabs Section */}
        <div className={styles.categoryBar} role="tablist" aria-label="Add-on Categories">
          <div className={styles.categoryTabs}>
            {categories.map((cat) => {
              const selectedCount = categorySelectedCounts[cat] || 0;
              const isActive = activeCategory === cat;

              return (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`${styles.categoryTab} ${
                    isActive ? styles.categoryTabActive : ""
                  }`}
                  onClick={() => setActiveCategory(cat)}
                >
                  <span>{cat}</span>
                  {selectedCount > 0 && (
                    <span className={styles.categoryBadge}>{selectedCount}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Body / Products Grid */}
        <div className={styles.modalBody}>
          <div className={styles.modalGrid}>
            {displayedAddons.map((product) => {
              const qty = selectedAddons[product.id] || 0;
              const isSelected = qty > 0;

              return (
                <div
                  key={product.id}
                  className={`${styles.addonCard} ${
                    isSelected ? styles.addonCardSelected : ""
                  }`}
                >
                  {/* Card Image */}
                  <div className={styles.imageContainer}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className={styles.cardImage}
                      loading="lazy"
                    />
                  </div>

                  {/* Card Content */}
                  <div className={styles.cardContent}>
                    <h4 className={styles.productName} title={product.name}>
                      {product.name}
                    </h4>
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
                          <Minus size={14} strokeWidth={2.5} />
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
                          <Plus size={14} strokeWidth={2.5} />
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

        {/* Modal Footer */}
        <div className={styles.modalFooter}>
          {isBuyNow ? (
            <>
              <div className={styles.footerTotal}>
                <span className={styles.totalLabel}>Total Payable:</span>
                <div className={styles.totalAmountRow}>
                  <span className={styles.totalAmount}>
                    ₹{grandTotal.toLocaleString("en-IN")}
                  </span>
                  {totalAddonCount > 0 && (
                    <span className={styles.addonCountTag}>
                      +{totalAddonCount} {totalAddonCount === 1 ? "Add-on" : "Add-ons"}
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.footerActions}>
                <button
                  type="button"
                  className={styles.skipBtn}
                  onClick={onSkip || onProceed}
                >
                  Skip &amp; Continue
                </button>
                <button
                  type="button"
                  className={styles.proceedBtn}
                  onClick={onProceed}
                >
                  <span>Proceed to Buy</span>
                  <ArrowRight size={17} />
                </button>
              </div>
            </>
          ) : (
            <>
              <div className={styles.footerTotal}>
                <span className={styles.totalLabel}>Selection:</span>
                <div className={styles.totalAmountRow}>
                  <span className={styles.totalAmount}>
                    {totalAddonCount} {totalAddonCount === 1 ? "Item" : "Items"}
                  </span>
                  {addonsTotal > 0 && (
                    <span className={styles.addonCountTag}>
                      ₹{addonsTotal.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.footerActions}>
                <button
                  type="button"
                  className={styles.doneBtn}
                  onClick={onClose}
                >
                  Done
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
