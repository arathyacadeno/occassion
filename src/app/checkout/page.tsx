"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import { useCheckout } from "@/context/CheckoutContext";
import {
  ShieldCheck,
  Truck,
  ArrowRight,
  Plus,
  Minus,
  Lock,
} from "lucide-react";
import styles from "./checkout.module.css";

export default function CheckoutPage() {
  const router = useRouter();
  const {
    checkoutItem,
    checkoutItems,
    totalAmount,
    updateQuantity,
  } = useCheckout();

  const [mounted, setMounted] = useState(false);

  const displayItems =
    checkoutItems.length > 0
      ? checkoutItems
      : checkoutItem
      ? [checkoutItem]
      : [];

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleProceedToPayment = () => {
    if (displayItems.length === 0) return;
    router.push("/payment");
  };

  if (!mounted) {
    return null;
  }

  // Guard: If no product selected, show friendly empty checkout banner
  if (displayItems.length === 0) {
    return (
      <div className={styles.pageWrapper}>
        <Navbar />
        <main className={styles.emptyContainer}>
          <div className={styles.emptyCard}>
            <div className={styles.emptyIconCircle}>
              <ShieldCheck size={38} className={styles.shieldIcon} />
            </div>
            <h1 className={styles.emptyTitle}>No Product Selected for Checkout</h1>
            <p className={styles.emptyDesc}>
              Please select a flower arrangement, cake, or gift and click &quot;Buy Now&quot;
              or proceed from your cart.
            </p>
            <Link href="/flower" className={styles.browseBtn}>
              Browse Flowers <ArrowRight size={16} />
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const finalTotal =
    totalAmount > 0
      ? totalAmount
      : displayItems.reduce(
          (acc, item) => acc + item.price * (item.quantity || 1),
          0
        );

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <main className={styles.mainContainer}>
        {/* Breadcrumb Navigation: Home > Flowers > Checkout */}
        <Breadcrumb
          items={[
            { label: "Flowers", href: "/flower" },
            { label: "Checkout" },
          ]}
        />

        <div className={styles.contentLayout}>
          {/* Left Column: Order Summary */}
          <div className={styles.leftColumn}>
            <div className={styles.cardBox}>
              <div className={styles.cardHeader}>
                <h2 className={styles.headingTitle}>Order Summary</h2>
              </div>

              {displayItems.map((item) => (
                <div key={item.id} className={styles.summaryItemRow}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className={styles.summaryProductImg}
                  />

                  <div className={styles.summaryItemDetails}>
                    <h3 className={styles.summaryProductName}>
                      {item.name}
                    </h3>
                    <div className={styles.summaryPriceUnit}>
                      ₹{item.price.toLocaleString("en-IN")} each
                    </div>

                    <div className={styles.qtyControlRow}>
                      <span className={styles.qtyLabel}>Quantity:</span>
                      <div className={styles.stepperContainer}>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              Math.max(1, (item.quantity || 1) - 1)
                            )
                          }
                          disabled={(item.quantity || 1) <= 1}
                          className={styles.stepperBtn}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={13} />
                        </button>
                        <span className={styles.qtyDisplay}>
                          {item.quantity || 1}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, (item.quantity || 1) + 1)
                          }
                          className={styles.stepperBtn}
                          aria-label="Increase quantity"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className={styles.itemTotalPrice}>
                    ₹{((item.price) * (item.quantity || 1)).toLocaleString("en-IN")}
                  </div>
                </div>
              ))}

              <div className={styles.summaryMetaList}>
                <div className={styles.metaRow}>
                  <span className={styles.metaTitle}>Delivery</span>
                  <span className={styles.freeDeliveryTag}>
                    <Truck size={14} /> Free Delivery
                  </span>
                </div>
              </div>

              <div className={styles.dividerLine} />

              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Total</span>
                <span className={styles.totalValue}>
                  ₹{finalTotal.toLocaleString("en-IN")}
                </span>
              </div>

              <button
                type="button"
                onClick={handleProceedToPayment}
                className={styles.continueToPaymentBtn}
              >
                <Lock size={16} />
                <span>Continue to Payment</span>
              </button>
            </div>
          </div>

          {/* Right Column: Trust & Order Preview Banner */}
          <div className={styles.rightColumn}>
            <div className={styles.sideSummaryCard}>
              <h3 className={styles.sideSummaryTitle}>Order Overview</h3>

              {displayItems.map((item) => (
                <div key={item.id} className={styles.sideProductMini}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className={styles.sideProductImg}
                  />
                  <div>
                    <h4 className={styles.sideProductName}>{item.name}</h4>
                    <p className={styles.sideProductPrice}>
                      Qty: {item.quantity || 1} × ₹{item.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              ))}

              <div className={styles.sideDivider} />

              <div className={styles.sideCostRow}>
                <span>Subtotal</span>
                <span>₹{finalTotal.toLocaleString("en-IN")}</span>
              </div>
              <div className={styles.sideCostRow}>
                <span>Delivery</span>
                <span className={styles.greenText}>FREE</span>
              </div>

              <div className={styles.sideDivider} />

              <div className={styles.sideTotalRow}>
                <span>Estimated Total</span>
                <span className={styles.sideTotalAmount}>
                  ₹{finalTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
