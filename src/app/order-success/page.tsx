"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCheckout } from "@/context/CheckoutContext";
import { useCart } from "@/context/CartContext";
import { Check, ArrowRight, ShoppingBag } from "lucide-react";
import styles from "./order-success.module.css";

export default function OrderSuccessPage() {
  const router = useRouter();
  const { completedOrder } = useCheckout();
  const { clearCart } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    clearCart();
    try {
      localStorage.removeItem("occassions_cart");
    } catch (e) {
      console.error(e);
    }
  }, [clearCart]);

  // Guard: If no completed order, redirect to flower page
  useEffect(() => {
    if (mounted && !completedOrder) {
      router.replace("/flower");
    }
  }, [mounted, completedOrder, router]);

  if (!mounted || !completedOrder) {
    return null;
  }

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <main className={styles.mainContainer}>
        <div className={styles.successCard}>
          {/* Clean Checkmark Icon */}
          <div className={styles.iconContainer}>
            <div className={styles.outerPulse} />
            <div className={styles.innerCircle}>
              <Check size={40} strokeWidth={2.8} className={styles.checkIcon} />
            </div>
          </div>

          <h1 className={styles.mainTitle}>Order Placed Successfully!</h1>
          <p className={styles.descText}>Your order has been confirmed.</p>

          {/* Clean Order Detail Card */}
          <div className={styles.orderSummaryPill}>
            <div className={styles.summaryItem}>
              <span className={styles.itemLabel}>Order ID</span>
              <span className={styles.itemValue}>#{completedOrder.orderId}</span>
            </div>
            <div className={styles.pillDivider} />
            <div className={styles.summaryItem}>
              <span className={styles.itemLabel}>Payment</span>
              <span className={styles.itemValue}>{completedOrder.paymentMethod}</span>
            </div>
            <div className={styles.pillDivider} />
            <div className={styles.summaryItem}>
              <span className={styles.itemLabel}>Total</span>
              <span className={styles.itemValue}>
                ₹{completedOrder.price.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className={styles.actionsBox}>
            <Link href="/thank-you" className={styles.primaryBtn}>
              <span>View Thank You &amp; Order Details</span>
              <ArrowRight size={16} />
            </Link>

            <Link href="/flower" className={styles.secondaryLink}>
              <ShoppingBag size={16} />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
