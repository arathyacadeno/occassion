"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCheckout, CompletedOrder } from "@/context/CheckoutContext";
import { useCart } from "@/context/CartContext";
import { Check, ArrowRight, ShoppingBag } from "lucide-react";
import styles from "./order-success.module.css";

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

export default function OrderSuccessPage() {
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

    const params = new URLSearchParams(window.location.search);
    const qOrderId = params.get("orderId");

    if (qOrderId) {
      fetch(`/api/orders?id=${encodeURIComponent(qOrderId)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.success && data.order) {
            const o = data.order;
            const firstItem = o.items?.[0];
            setOrder({
              orderId: o.id,
              productId: firstItem?.product_id || "flower-item",
              productName: firstItem?.product_name || "Celebration Flower Arrangement",
              productImage: firstItem?.product_image || fallbackOrder.productImage,
              productCategory: "Fresh Flowers",
              quantity: firstItem?.quantity || 1,
              price: o.final_amount,
              unitPrice: firstItem?.product_price || o.final_amount,
              mobileNumber: o.customer_phone || "+91 8606464700",
              paymentMethod: o.paymentMethod?.type || "Online Payment",
              paymentStatus: "success",
              orderStatus: "confirmed",
              createdAt: o.created_at,
              estimatedDelivery: "Delivered to Calicut (Same-Day Express)",
            });
            return;
          }
        })
        .catch((e) => console.warn("Could not fetch order by query param", e));
    }

    try {
      localStorage.removeItem("occassions_cart");
      if (!completedOrder && !qOrderId) {
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
              <span className={styles.itemValue}>#{activeOrder.orderId}</span>
            </div>
            <div className={styles.pillDivider} />
            <div className={styles.summaryItem}>
              <span className={styles.itemLabel}>Payment</span>
              <span className={styles.itemValue}>{activeOrder.paymentMethod}</span>
            </div>
            <div className={styles.pillDivider} />
            <div className={styles.summaryItem}>
              <span className={styles.itemLabel}>Total</span>
              <span className={styles.itemValue}>
                ₹{activeOrder.price.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className={styles.actionsBox}>
            <button
              type="button"
              onClick={() => router.push("/thank-you")}
              className={styles.primaryBtn}
            >
              <span>View Thank You &amp; Order Details</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={() => router.push("/flower")}
              className={styles.secondaryLink}
            >
              <ShoppingBag size={16} />
              <span>Continue Shopping</span>
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
