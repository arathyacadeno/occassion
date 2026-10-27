"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCheckout, CompletedOrder } from "@/context/CheckoutContext";
import { useCart } from "@/context/CartContext";
import { CATALOG_PRODUCTS } from "@/data/catalog";
import { ADDON_PRODUCTS } from "@/data/addons";
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
  MessageCircle,
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

function getCategoryMainPhoto(order: CompletedOrder): string {
  const pName = (order.productName || "").toLowerCase().trim();

  // 1. Try matching against CATALOG_PRODUCTS
  const catalogMatch = CATALOG_PRODUCTS.find((p) => {
    if (order.productId && p.id === order.productId) return true;
    if (order.productSlug && p.slug === order.productSlug) return true;
    const catName = p.name.toLowerCase().trim();
    return catName === pName || pName.startsWith(catName) || catName.startsWith(pName);
  });
  if (catalogMatch && catalogMatch.image) {
    return catalogMatch.image;
  }

  // 2. Try matching against ADDON_PRODUCTS
  const addonMatch = ADDON_PRODUCTS.find((a) => {
    if (order.productId && a.id === order.productId) return true;
    const aName = a.name.toLowerCase().trim();
    return aName === pName || pName.startsWith(aName) || aName.startsWith(pName);
  });
  if (addonMatch && addonMatch.image) {
    return addonMatch.image;
  }

  // 3. Strip any side-view slice directory or prefix
  if (order.productImage && order.productImage.includes("/side-view/")) {
    return order.productImage
      .replace(/\/side-view\/[0-9]+-/, "/")
      .replace(/\/side-view\/[0-9]+\//, "/")
      .replace(/\/side-view\//, "/");
  }

  return order.productImage || fallbackOrder.productImage;
}

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
              estimatedDelivery: "Today in 2–4 hours (Same-Day Express Delivery)",
            });
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

  const activeOrder = order.orderId !== fallbackOrder.orderId ? order : (completedOrder || order || fallbackOrder);
  const displayImage = getCategoryMainPhoto(activeOrder);

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
                src={displayImage}
                alt={activeOrder.productName}
                className={styles.heroFloralImg}
              />
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
                    {activeOrder.paymentMethod ? activeOrder.paymentMethod.toUpperCase() : "UPI"}
                  </span>
                </div>
              </div>

              <div className={styles.divider} />

              {/* Metadata Attributes */}
              <div className={styles.metaGrid}>
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

              {/* WhatsApp Notification confirmation to Owner */}
              <div className={styles.whatsappNotice}>
                <div className={styles.whatsappIconCircle}>
                  <MessageCircle size={18} color="#15803d" />
                </div>
                <div>
                  <div className={styles.whatsappNoticeTitle}>
                    Order Dispatched to WhatsApp
                  </div>
                  <p className={styles.whatsappNoticeText}>
                    Complete order details, recipient location &amp; contact info have been sent to Occasions business WhatsApp at <strong>+91 9447446008</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons: WhatsApp chat & Continue Shopping */}
            <div className={styles.buttonActionGroup}>
              <a
                href={`https://api.whatsapp.com/send?phone=919447446008&text=${encodeURIComponent(
                  `Hi Occasions! I placed Order #${activeOrder.orderId} for ₹${activeOrder.price}. Could you please confirm the delivery details?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.whatsappChatBtn}
              >
                <MessageCircle size={18} />
                <span>Message Owner on WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => router.push("/#categories")}
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
