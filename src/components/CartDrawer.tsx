"use client";

import React, { useState } from "react";
import styles from "./CartDrawer.module.css";
import { CartItem } from "@/types";
import { X, Trash2, ArrowRight } from "lucide-react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQty: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
}: CartDrawerProps) {
  const [isOrdered, setIsOrdered] = useState(false);

  const subtotal = items.reduce(
    (acc, item) => acc + item.bouquet.price * item.quantity,
    0
  );

  const freeShippingThreshold = 150;
  const progressPercent = Math.min(
    100,
    (subtotal / freeShippingThreshold) * 100
  );
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleCheckout = () => {
    setIsOrdered(true);
    setTimeout(() => {
      onClearCart();
      setIsOrdered(false);
      onClose();
    }, 2800);
  };

  return (
    <div className={`${styles.overlay} ${isOpen ? styles.open : ""}`} onClick={onClose}>
      <aside className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h3 className={styles.title}>Your Floral Basket</h3>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close cart">
            <X size={22} />
          </button>
        </div>

        {/* Free Shipping Progress */}
        <div className={styles.shippingBar}>
          {remainingForFreeShipping > 0 ? (
            <span>
              Add <strong>${remainingForFreeShipping.toFixed(2)}</strong> more to receive <strong>Complimentary White-Glove Hand Courier</strong>
            </span>
          ) : (
            <span style={{ color: "var(--color-rose-dark)", fontWeight: 600 }}>
              🎉 You unlocked Complimentary White-Glove Delivery!
            </span>
          )}
          <div className={styles.progressBarTrack}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className={styles.itemsList}>
          {items.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyScript}>Your Basket is Empty</div>
              <p>Discover our poetic flower bouquet creations and bring nature’s romance to your home.</p>
              <button
                className="btn-rosebud"
                onClick={() => {
                  onClose();
                  const catalog = document.getElementById("collections");
                  if (catalog) catalog.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Explore Bouquets
              </button>
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={`${item.bouquet.id}-${idx}`} className={styles.itemCard}>
                <img
                  src={item.bouquet.image}
                  alt={item.bouquet.name}
                  className={styles.itemImg}
                />
                <div className={styles.itemInfo}>
                  <h4 className={styles.itemName}>{item.bouquet.name}</h4>
                  <div className={styles.itemDetail}>
                    {item.selectedSize} • {item.bouquet.flowerCount}
                  </div>
                  {item.customNote && (
                    <div className={styles.itemDetail} style={{ fontStyle: "italic" }}>
                      Card: &quot;{item.customNote.slice(0, 32)}...&quot;
                    </div>
                  )}

                  <div className={styles.itemRow}>
                    <div className={styles.qtyControl}>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => onUpdateQty(idx, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span className={styles.qtyNum}>{item.quantity}</span>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => onUpdateQty(idx, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>

                    <span className={styles.itemPrice}>
                      ${item.bouquet.price * item.quantity}
                    </span>

                    <button
                      className={styles.removeBtn}
                      onClick={() => onRemoveItem(idx)}
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.subtotalRow}>
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            {isOrdered ? (
              <div className={styles.orderSuccess}>
                🌸 Thank you! Your luxury bouquet order has been received. Our florist will begin hand-arranging your stems shortly.
              </div>
            ) : (
              <button className={styles.checkoutBtn} onClick={handleCheckout}>
                Proceed to Checkout (${subtotal.toFixed(2)})
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
