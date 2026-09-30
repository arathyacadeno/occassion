"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCheckout } from "@/context/CheckoutContext";
import {
  Sparkles,
  Phone,
  CreditCard,
  Truck,
  CheckCircle,
  Calendar,
  ShoppingBag,
  ArrowRight,
  Heart,
} from "lucide-react";
import styles from "./thank-you.module.css";

export default function ThankYouPage() {
  const router = useRouter();
  const { completedOrder } = useCheckout();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Guard: If no completed order, redirect back to flowers catalog
  useEffect(() => {
    if (mounted && !completedOrder) {
      router.replace("/flower");
    }
  }, [mounted, completedOrder, router]);

  if (!mounted || !completedOrder) {
    return null;
  }

  // Format creation date
  const orderDate = new Date(completedOrder.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <main className={styles.mainContainer}>
        {/* Main 2-Column Hero Card */}
        <div className={styles.thankYouCard}>
          {/* Left Column: Large Floral Image Showcase */}
          <div className={styles.imageColumn}>
            <div className={styles.imageWrapper}>
              <img
                src={completedOrder.productImage}
                alt={completedOrder.productName}
                className={styles.heroFloralImg}
              />
              <div className={styles.imageOverlayGradient} />

              {/* Floating Handcrafted Floral Badge */}
              <div className={styles.floralFloatingBadge}>
                <Sparkles size={16} className={styles.sparkleIcon} />
                <span>Handcrafted Fresh in Calicut</span>
              </div>

              <div className={styles.productPill}>
                <span className={styles.pillCategory}>
                  {completedOrder.productCategory.toUpperCase()}
                </span>
                <h4 className={styles.pillName}>{completedOrder.productName}</h4>
              </div>
            </div>
          </div>

          {/* Right Column: Thank You Content & Order Details */}
          <div className={styles.detailsColumn}>
            {/* Floral Greeting Header */}
            <div className={styles.headerSection}>
              <div className={styles.floralEmblem}>
                <span className={styles.flowerEmoji} role="img" aria-label="blossom">
                  🌸
                </span>
              </div>

              <h1 className={styles.pageTitle}>Thank You for Your Order!</h1>
              <p className={styles.pageSubtitle}>
                Your order has been placed successfully.
              </p>
              <p className={styles.prepMessage}>
                We&apos;re preparing something beautiful just for you.
              </p>
            </div>

            {/* Order Confirmation Details Box */}
            <div className={styles.receiptBox}>
              <div className={styles.orderIdRow}>
                <div>
                  <span className={styles.idLabel}>Order ID</span>
                  <div className={styles.idCode}>#{completedOrder.orderId}</div>
                </div>

                <div className={styles.statusPill}>
                  <CheckCircle size={14} /> Confirmed
                </div>
              </div>

              <div className={styles.divider} />

              {/* Product and Price Row */}
              <div className={styles.productSummaryRow}>
                <div className={styles.productInfoLeft}>
                  <h3 className={styles.productNameTitle}>
                    {completedOrder.productName}
                  </h3>
                  <p className={styles.qtyText}>
                    Quantity: {completedOrder.quantity}
                  </p>
                </div>

                <div className={styles.productPriceAmount}>
                  ₹{completedOrder.price.toLocaleString("en-IN")}
                </div>
              </div>

              <div className={styles.divider} />

              {/* Metadata Attributes */}
              <div className={styles.metaGrid}>
                <div className={styles.metaCard}>
                  <div className={styles.metaIconCircle}>
                    <CreditCard size={16} />
                  </div>
                  <div>
                    <span className={styles.metaLabel}>Payment Method</span>
                    <span className={styles.metaValue}>
                      {completedOrder.paymentMethod}
                    </span>
                  </div>
                </div>

                <div className={styles.metaCard}>
                  <div className={styles.metaIconCircle}>
                    <Phone size={16} />
                  </div>
                  <div>
                    <span className={styles.metaLabel}>Contact Mobile</span>
                    <span className={styles.metaValue}>
                      {completedOrder.mobileNumber}
                    </span>
                  </div>
                </div>

                <div className={styles.metaCard}>
                  <div className={styles.metaIconCircle}>
                    <Truck size={16} />
                  </div>
                  <div>
                    <span className={styles.metaLabel}>Estimated Delivery</span>
                    <span className={styles.metaValue}>
                      {completedOrder.estimatedDelivery}
                    </span>
                  </div>
                </div>

                <div className={styles.metaCard}>
                  <div className={styles.metaIconCircle}>
                    <Calendar size={16} />
                  </div>
                  <div>
                    <span className={styles.metaLabel}>Order Placed</span>
                    <span className={styles.metaValue}>{orderDate}</span>
                  </div>
                </div>
              </div>

              {/* Delivery notice */}
              <div className={styles.registeredNotice}>
                <p>
                  We&apos;ll keep you updated on your registered mobile number{" "}
                  <strong>{completedOrder.mobileNumber}</strong> with live delivery
                  tracking.
                </p>
              </div>
            </div>

            {/* Action Buttons: Continue Shopping */}
            <div className={styles.buttonActionGroup}>
              <Link href="/flower" className={styles.continueShoppingBtn}>
                <ShoppingBag size={18} />
                <span>Continue Shopping</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
