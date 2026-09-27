"use client";

import React, { useState } from "react";
import styles from "./QuickViewModal.module.css";
import { Bouquet } from "@/types";
import { X, ShoppingBag } from "lucide-react";

interface QuickViewModalProps {
  bouquet: Bouquet | null;
  onClose: () => void;
  onAddToCart: (bouquet: Bouquet, quantity: number) => void;
}

export default function QuickViewModal({
  bouquet,
  onClose,
  onAddToCart,
}: QuickViewModalProps) {
  const [qty, setQty] = useState(1);

  if (!bouquet) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <div className={styles.imageSide}>
          <img src={bouquet.image} alt={bouquet.name} className={styles.image} />
        </div>

        <div className={styles.detailsSide}>
          <div className={styles.modalTagline}>Handcrafted Floral Art</div>
          <h2 className={styles.modalTitle}>{bouquet.name}</h2>
          <div className={styles.modalSubtitle}>{bouquet.subtitle}</div>

          <div className={styles.priceRow}>
            <span className={styles.price}>${bouquet.price}</span>
            {bouquet.originalPrice && (
              <span className={styles.originalPrice}>${bouquet.originalPrice}</span>
            )}
          </div>

          <p className={styles.description}>{bouquet.description}</p>

          <div className={styles.stemsSection}>
            <h4 className={styles.sectionHeading}>Featured Botanicals:</h4>
            <ul className={styles.stemList}>
              {bouquet.stems.map((stem, idx) => (
                <li key={idx}>{stem}</li>
              ))}
            </ul>
          </div>

          <div className={styles.specsGrid}>
            <div>
              <span>Scent Profile</span>
              <strong>{bouquet.scent}</strong>
            </div>
            <div>
              <span>Stem Count</span>
              <strong>{bouquet.flowerCount}</strong>
            </div>
            <div>
              <span>Vase Height</span>
              <strong>{bouquet.dimensions}</strong>
            </div>
            <div>
              <span>Vase Life</span>
              <strong>8 - 12 Days</strong>
            </div>
          </div>

          <div className={styles.actionsRow}>
            <div className={styles.quantitySelector}>
              <button
                className={styles.qtyBtn}
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                -
              </button>
              <span className={styles.qtyVal}>{qty}</span>
              <button className={styles.qtyBtn} onClick={() => setQty((q) => q + 1)}>
                +
              </button>
            </div>

            <button
              className={styles.modalAddBtn}
              onClick={() => {
                onAddToCart(bouquet, qty);
                onClose();
              }}
            >
              <ShoppingBag size={16} />
              Add To Cart (${bouquet.price * qty})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
