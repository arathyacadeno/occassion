"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCheckout, CompletedOrder } from "@/context/CheckoutContext";
import { CATALOG_PRODUCTS } from "@/data/catalog";
import { FLOWER_PRODUCTS } from "@/data/flowerProducts";
import {
  Package,
  Calendar,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ShoppingBag,
  Clock,
  Sparkles,
  Lock,
  Truck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import styles from "./orders.module.css";

function getOrderProductHref(order: CompletedOrder): string {
  const pId = (order.productId || "").toLowerCase().trim();
  const pSlug = (order.productSlug || "").toLowerCase().trim();
  const pName = (order.productName || "").toLowerCase().trim();
  const pImg = (order.productImage || "").trim();

  // 1. Direct match in CATALOG_PRODUCTS (/cakes, /flower, /table-decor, /wreaths, /special-occasions)
  const catalogMatch = CATALOG_PRODUCTS.find((p) => {
    const id = p.id.toLowerCase().trim();
    const slug = p.slug.toLowerCase().trim();
    const name = p.name.toLowerCase().trim();

    if (pId && (id === pId || slug === pId)) return true;
    if (pSlug && (slug === pSlug || id === pSlug)) return true;
    if (pImg && (p.image === pImg || (p.images && p.images.includes(pImg)))) return true;
    if (pName && (name === pName || name.includes(pName) || pName.includes(name))) return true;

    return false;
  });

  if (catalogMatch) {
    return `/${catalogMatch.category}/${catalogMatch.slug}`;
  }

  // 2. Direct match in FLOWER_PRODUCTS (/flowers/[category]/[slug])
  const flowerMatch = FLOWER_PRODUCTS.find((p) => {
    const id = p.id.toLowerCase().trim();
    const slug = p.slug.toLowerCase().trim();
    const name = p.name.toLowerCase().trim();

    if (pId && (id === pId || slug === pId)) return true;
    if (pSlug && (slug === pSlug || id === pSlug)) return true;
    if (pImg && (p.image === pImg || (p.images && p.images.includes(pImg)))) return true;
    if (pName && (name === pName || name.includes(pName) || pName.includes(name))) return true;

    return false;
  });

  if (flowerMatch) {
    return `/flowers/${flowerMatch.category}/${flowerMatch.slug}`;
  }

  // 3. Fallbacks to specific product pages based on category keywords
  if (pId.includes("cake") || pName.includes("cake")) {
    const slugCandidate = pId.replace(/^cake-/, "");
    const cakeMatch = CATALOG_PRODUCTS.find(
      (p) =>
        p.category === "cakes" &&
        (p.slug.toLowerCase().includes(slugCandidate) || slugCandidate.includes(p.slug.toLowerCase()))
    );
    if (cakeMatch) return `/cakes/${cakeMatch.slug}`;
    const anyCake = CATALOG_PRODUCTS.find((p) => p.category === "cakes");
    return anyCake ? `/cakes/${anyCake.slug}` : "/cakes";
  }

  if (
    pId.startsWith("bouquet-") ||
    pId.startsWith("flower-") ||
    pName.includes("rose") ||
    pName.includes("flower") ||
    pName.includes("bouquet") ||
    pName.includes("basket")
  ) {
    const slugCandidate = pId.replace(/^(bouquet-|flower-)/, "");
    const flowerSlugMatch = CATALOG_PRODUCTS.find(
      (p) =>
        p.category === "flower" &&
        (p.slug.toLowerCase().includes(slugCandidate) || slugCandidate.includes(p.slug.toLowerCase()))
    );
    if (flowerSlugMatch) return `/flower/${flowerSlugMatch.slug}`;
    const anyFlower = CATALOG_PRODUCTS.find((p) => p.category === "flower");
    return anyFlower ? `/flower/${anyFlower.slug}` : "/flower-bouquets";
  }

  if (pId.includes("wreath") || pName.includes("wreath")) {
    const wreathMatch = CATALOG_PRODUCTS.find((p) => p.category === "wreaths");
    return wreathMatch ? `/wreaths/${wreathMatch.slug}` : "/wreaths";
  }

  if (pId.includes("table") || pName.includes("table")) {
    const tableMatch = CATALOG_PRODUCTS.find((p) => p.category === "table-decor");
    return tableMatch ? `/table-decor/${tableMatch.slug}` : "/table-decor";
  }

  const defaultFlower = CATALOG_PRODUCTS.find((p) => p.category === "flower");
  return defaultFlower ? `/flower/${defaultFlower.slug}` : "/flower-bouquets";
}

export default function OrdersPage() {
  const { viewOrder } = useCheckout();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [dbOrders, setDbOrders] = useState<CompletedOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setDbOrders([]);
    if (!isAuthenticated || !user?.id) {
      setLoadingOrders(false);
      return;
    }

    setLoadingOrders(true);
    fetch("/api/orders", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success && Array.isArray(data.orders)) {
          const mapped: CompletedOrder[] = data.orders.map((o: any) => {
            const firstItem = o.items?.[0];
            const pId = (firstItem?.product_id || "").toLowerCase().trim();
            const pImg = (firstItem?.product_image || "").trim();
            const pName = (firstItem?.product_name || "").toLowerCase().trim();

            const matchedProduct =
              CATALOG_PRODUCTS.find(
                (p) =>
                  p.id.toLowerCase() === pId ||
                  p.slug.toLowerCase() === pId ||
                  (pImg && (p.image === pImg || (p.images && p.images.includes(pImg)))) ||
                  (pName && p.name.toLowerCase() === pName)
              ) ||
              FLOWER_PRODUCTS.find(
                (p) =>
                  p.id.toLowerCase() === pId ||
                  p.slug.toLowerCase() === pId ||
                  (pImg && (p.image === pImg || (p.images && p.images.includes(pImg)))) ||
                  (pName && p.name.toLowerCase() === pName)
              );

            const resolvedName =
              firstItem?.product_id === "cake-blue-floral" || pImg.includes("blue-floral")
                ? "Blue Floral Birthday Cake"
                : firstItem?.product_name || matchedProduct?.name || "Handcrafted Fresh Arrangement";

            return {
              orderId: o.id,
              productId: firstItem?.product_id || "flower-item",
              productSlug: matchedProduct?.slug,
              productName: resolvedName,
              productImage: firstItem?.product_image || "/images/lily-6-stems.png",
              productCategory:
                (matchedProduct && "categoryLabel" in matchedProduct
                  ? (matchedProduct as any).categoryLabel
                  : (matchedProduct as any)?.category) || "Fresh Flowers",
              quantity: firstItem?.quantity || 1,
              price: o.final_amount,
              unitPrice: firstItem?.product_price || o.final_amount,
              mobileNumber: o.customer_phone || o.deliveryAddress?.senderMobile || o.deliveryAddress?.receiverMobile || "",
              paymentMethod: o.paymentMethod?.type || "Online Payment",
              paymentStatus: "success",
              orderStatus: o.order_status === "delivered" ? "delivered" : "confirmed",
              createdAt: o.created_at,
              estimatedDelivery: "Delivered to Calicut",
            };
          });
          setDbOrders(mapped);
        } else {
          setDbOrders([]);
        }
      })
      .catch((e) => {
        console.warn("Failed to fetch live orders", e);
        setDbOrders([]);
      })
      .finally(() => setLoadingOrders(false));
  }, [isAuthenticated, user?.id]);

  const orders = dbOrders;

  if (!mounted) {
    return null;
  }

  if (authLoading) {
    return (
      <div className={styles.pageWrapper}>
        <Navbar />
        <main className={`${styles.mainContainer} ${styles.emptyMainContainer}`}>
          <div style={{ textAlign: "center", padding: "80px 20px", color: "#64748b" }}>
            <p>Checking account...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.pageWrapper}>
        <Navbar />
        <main className={`${styles.mainContainer} ${styles.emptyMainContainer}`}>
          <div className={styles.authRequiredCard}>
            <div className={styles.authIconWrap}>
              <Lock size={32} strokeWidth={2.2} />
            </div>
            <h1 className={styles.authTitle}>Sign In to View Your Orders</h1>
            <p className={styles.authDesc}>
              Please sign in or register to access your personalized order history, track live delivery status, and view invoices.
            </p>
            <div className={styles.authBtnGroup}>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("show-signin-modal"));
                  }
                }}
                className={styles.signInBtn}
              >
                <span>Sign In / Register</span>
              </button>
              <Link href="/" className={styles.browseBtn}>
                Explore Collection
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <main className={`${styles.mainContainer} ${orders.length === 0 ? styles.emptyMainContainer : ""}`}>
        {/* Header - only rendered when there are orders */}
        {orders.length > 0 && (
          <div className={styles.headerRow}>
            <div>
              <h1 className={styles.pageTitle}>My Orders</h1>
              <p className={styles.pageSubtitle}>
                {`Welcome back, ${user?.name || "Customer"}. You have placed ${orders.length} ${
                  orders.length === 1 ? "order" : "orders"
                } with Occassions Florist.`}
              </p>
            </div>
          </div>
        )}

        {/* Orders List or Empty State */}
        {loadingOrders ? (
          <div style={{ textAlign: "center", padding: "80px 20px", color: "#64748b" }}>
            <p>Loading your orders...</p>
          </div>
        ) : orders.length > 0 ? (
          <div className={styles.ordersList}>
            {orders.map((order) => {
              const formattedDate = new Date(order.createdAt).toLocaleDateString(
                "en-IN",
                {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }
              );

              const isConfirmed = order.orderStatus === "confirmed";

              return (
                <article key={order.orderId} className={styles.orderCard}>
                  {/* Card Header */}
                  <div className={styles.cardHeader}>
                    <div className={styles.headerLeft}>
                      <span className={styles.orderIdBadge}>
                        <Package size={17} color="#c21460" />
                        #{order.orderId}
                      </span>
                      <span className={styles.orderDateText}>
                        <Calendar size={14} />
                        Placed on {formattedDate}
                      </span>
                    </div>

                    <div className={styles.headerRight}>
                      {isConfirmed ? (
                        <span className={styles.statusConfirmed}>
                          <Clock size={13} /> Active / Confirmed
                        </span>
                      ) : (
                        <span className={styles.statusDelivered}>
                          <CheckCircle2 size={13} /> Delivered
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  {(() => {
                    const productHref = getOrderProductHref(order);
                    return (
                      <div className={styles.cardBody}>
                        <div className={styles.productInfoBlock}>
                          <Link
                            href={productHref}
                            className={styles.productImageLink}
                            title={`View ${order.productName}`}
                          >
                            <img
                              src={order.productImage}
                              alt={order.productName}
                              className={styles.productImage}
                            />
                          </Link>
                          <div className={styles.detailsCol}>
                            <Link href={productHref} className={styles.productTitleLink}>
                              <h3 className={styles.productTitle}>
                                {order.productName}
                              </h3>
                            </Link>
                            <p className={styles.itemSubtext}>
                              Quantity: {order.quantity || 1} &bull; Same-Day Express Delivery
                            </p>
                            <span className={styles.paymentTag}>
                              <CreditCard size={13} />
                              Paid via {order.paymentMethod}
                            </span>
                          </div>
                        </div>

                        {/* Price and Actions */}
                        <div className={styles.cardPriceAndActions}>
                          <div className={styles.priceBlock}>
                            <span className={styles.priceLabel}>Total Amount</span>
                            <span className={styles.priceValue}>
                              ₹{order.price.toLocaleString("en-IN")}
                            </span>
                          </div>

                          <div className={styles.actionsGroup}>
                            <button
                              type="button"
                              onClick={() => viewOrder(order)}
                              className={styles.viewDetailsBtn}
                              title="View receipt and order details"
                            >
                              <span>View Details</span>
                              <ArrowRight size={15} />
                            </button>

                            <Link
                              href={`/track-order?id=${encodeURIComponent(order.orderId)}`}
                              className={styles.trackOrderBtn}
                              title={`Track delivery of #${order.orderId}`}
                            >
                              <Truck size={14} />
                              <span>Track Order</span>
                            </Link>

                            <Link 
                              href={productHref} 
                              className={styles.reorderBtn}
                              title={`Reorder ${order.productName}`}
                            >
                              Reorder
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </article>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className={styles.emptyStateCard}>
            <img
              src="/images/no-orders.png"
              alt="No orders yet"
              className={styles.emptyStateIllustration}
            />
            <h2 className={styles.emptyTitle}>No Orders Yet</h2>
            <p className={styles.emptyDesc}>
              You haven&apos;t placed any orders yet. Explore our beautiful flowers and gifts to make someone&apos;s day special!
            </p>
            <Link href="/flower-bouquets" className={styles.startShoppingBtn}>
              Shop Now
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
