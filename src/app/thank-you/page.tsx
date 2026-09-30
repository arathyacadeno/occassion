"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCheckout, CompletedOrder } from "@/context/CheckoutContext";
import { useCart } from "@/context/CartContext";
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

const fallbackOrder: CompletedOrder = {
  orderId: "ORD123456",
  productId: "birthday-basket",
  productName: "Birthday Flower Basket",
  productImage:
    "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80",
  productCategory: "Flower",
  quantity: 1,
  price: 999,
  unitPrice: 999,
  mobileNumber: "+91 9876543210",
  paymentMethod: "UPI",
  paymentStatus: "success",
  orderStatus: "confirmed",
  createdAt: new Date().toISOString(),
  estimatedDelivery: "Today in 2–4 hours (Same-Day Express Delivery)",
};

export default function ThankYouPage() {
  const router = useRouter();
  const { completedOrder } = useCheckout();
  const { clearCart } = useCart();
  const [mounted, setMounted] = useState(false);
  const [order, setOrder] = useState<CompletedOrder>(completedOrder || fallbackOrder);
  const hasRunRef = React.useRef(false);

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    setMounted(true);
    clearCart();
    try {
      localStorage.removeItem("occassions_cart");
      if (!completedOrder) {
        const stored = localStorage.getItem("occassions_latest_order");
        if (stored) {
          setOrder(JSON.parse(stored));
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const activeOrder = completedOrder || order || fallbackOrder;

  // Format creation date
  const orderDate = new Date(activeOrder.createdAt).toLocaleDateString("en-IN", {
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
                src={activeOrder.productImage}
                alt={activeOrder.productName}
                className={styles.heroFloralImg}
              />
              <div className={styles.imageOverlayGradient} />

              <div className={styles.productPill}>
                <span className={styles.pillCategory}>
                  {(activeOrder.productCategory || "Flower").toUpperCase()}
                </span>
                <h4 className={styles.pillName}>{activeOrder.productName}</h4>
              </div>
            </div>
          </div>

          {/* Right Column: Thank You Content & Order Details */}
          <div className={styles.detailsColumn}>
            {/* Floral Greeting Header */}
            <div className={styles.headerSection}>
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
              <div className={styles.orderInfoList}>
                <div className={styles.infoRowItem}>
                  <span className={styles.infoRowLabel}>Product</span>
                  <span className={styles.infoRowValueBold}>
                    {activeOrder.productName}
                  </span>
                </div>

                <div className={styles.infoRowItem}>
                  <span className={styles.infoRowLabel}>Order ID</span>
                  <span className={styles.infoRowValue}>
                    #{activeOrder.orderId}
                  </span>
                </div>

                <div className={styles.infoRowItem}>
                  <span className={styles.infoRowLabel}>Total</span>
                  <span className={styles.infoRowValuePrice}>
                    ₹{activeOrder.price.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className={styles.infoRowItem}>
                  <span className={styles.infoRowLabel}>Payment</span>
                  <span className={styles.infoRowValue}>
                    {activeOrder.paymentMethod}
                  </span>
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
                      {activeOrder.paymentMethod}
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
                      {activeOrder.mobileNumber}
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
                      {activeOrder.estimatedDelivery}
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
                  <strong>{activeOrder.mobileNumber}</strong> with live delivery
                  tracking.
                </p>
              </div>
            </div>

            {/* Action Buttons: Continue Shopping */}
            <div className={styles.buttonActionGroup}>
              <button
                type="button"
                onClick={() => router.push("/flower")}
                className={styles.continueShoppingBtn}
              >
                <ShoppingBag size={18} />
                <span>Continue Shopping</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
