"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCheckout } from "@/context/CheckoutContext";
import { Check, ArrowRight, Sparkles, PackageCheck } from "lucide-react";
import styles from "./order-success.module.css";

export default function OrderSuccessPage() {
  const router = useRouter();
  const { completedOrder } = useCheckout();
  const [mounted, setMounted] = useState(false);
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Guard: If no completed order, redirect to flower page
  useEffect(() => {
    if (mounted && !completedOrder) {
      router.replace("/flower");
    }
  }, [mounted, completedOrder, router]);

  // Countdown timer to automatically transition to /thank-you
  useEffect(() => {
    if (!mounted || !completedOrder) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/thank-you");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mounted, completedOrder, router]);

  if (!mounted || !completedOrder) {
    return null;
  }

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <main className={styles.mainContainer}>
        <div className={styles.successCard}>
          {/* Animated Glowing Checkmark Icon */}
          <div className={styles.iconContainer}>
            <div className={styles.outerPulse} />
            <div className={styles.innerCircle}>
              <Check size={44} strokeWidth={3} className={styles.checkIcon} />
            </div>
          </div>

          <div className={styles.badgeRow}>
            <span className={styles.successPill}>
              <Sparkles size={14} /> Confirmed Order
            </span>
          </div>

          <h1 className={styles.mainTitle}>Order Placed Successfully!</h1>
          <p className={styles.thankText}>Thank you for your order.</p>
          <p className={styles.descText}>
            Your order has been confirmed and our expert florists are now handcrafting
            your bouquet. We&apos;ll keep you updated via WhatsApp and SMS.
          </p>

          {/* Quick Summary Pill */}
          <div className={styles.orderSummaryPill}>
            <div className={styles.summaryItem}>
              <span className={styles.itemLabel}>Order ID</span>
              <span className={styles.itemValue}>#{completedOrder.orderId}</span>
            </div>
            <div className={styles.pillDivider} />
            <div className={styles.summaryItem}>
              <span className={styles.itemLabel}>Total Paid</span>
              <span className={styles.itemValue}>
                ₹{completedOrder.price.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Auto redirection notice & action buttons */}
          <div className={styles.actionsBox}>
            <Link href="/thank-you" className={styles.primaryBtn}>
              <PackageCheck size={18} />
              <span>View Order Details &amp; Receipt</span>
              <ArrowRight size={16} />
            </Link>

            <p className={styles.countdownNotice}>
              Redirecting to your order receipt in <strong>{countdown}s</strong>...
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
