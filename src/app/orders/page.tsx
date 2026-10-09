"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCheckout, CompletedOrder } from "@/context/CheckoutContext";
import { CATALOG_PRODUCTS } from "@/data/catalog";
import {
  Package,
  Calendar,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ShoppingBag,
  Clock,
  Sparkles,
} from "lucide-react";
import styles from "./orders.module.css";

export default function OrdersPage() {
  const { orders: contextOrders, viewOrder } = useCheckout();
  const [dbOrders, setDbOrders] = useState<CompletedOrder[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch("/api/orders", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success && Array.isArray(data.orders)) {
          const mapped: CompletedOrder[] = data.orders.map((o: any) => {
            const firstItem = o.items?.[0];
            return {
              orderId: o.id,
              productId: firstItem?.product_id || "flower-item",
              productName: firstItem?.product_name || "Handcrafted Fresh Arrangement",
              productImage: firstItem?.product_image || "/images/lily-6-stems.png",
              productCategory: CATALOG_PRODUCTS.find((p) => p.id === firstItem?.product_id)?.categoryLabel || "Fresh Flowers",
              quantity: firstItem?.quantity || 1,
              price: o.final_amount,
              unitPrice: firstItem?.product_price || o.final_amount,
              mobileNumber: o.customer_phone || "+91 8606464700",
              paymentMethod: o.paymentMethod?.type || "Online Payment",
              paymentStatus: "success",
              orderStatus: o.order_status === "delivered" ? "delivered" : "confirmed",
              createdAt: o.created_at,
              estimatedDelivery: "Delivered to Calicut",
            };
          });
          setDbOrders(mapped);
        }
      })
      .catch((e) => console.warn("Failed to fetch live orders", e));
  }, []);

  // Merge DB orders and Context orders (deduplicating by orderId)
  const allOrdersMap = new Map<string, CompletedOrder>();
  for (const o of [...dbOrders, ...contextOrders]) {
    if (!allOrdersMap.has(o.orderId)) {
      allOrdersMap.set(o.orderId, o);
    }
  }
  const orders = Array.from(allOrdersMap.values());

  if (!mounted) {
    return null;
  }

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <main className={styles.mainContainer}>
        {/* Header */}
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.pageTitle}>My Orders</h1>
            <p className={styles.pageSubtitle}>
              {orders.length > 0
                ? `You have placed ${orders.length} ${
                    orders.length === 1 ? "order" : "orders"
                  } with Occassions Florist.`
                : "Track your past and active flower deliveries."}
            </p>
          </div>


        </div>

        {/* Orders List */}
        {orders.length > 0 ? (
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
                        <Package size={17} color="#686b2e" />
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
                  <div className={styles.cardBody}>
                    <div className={styles.productInfoBlock}>
                      <img
                        src={order.productImage}
                        alt={order.productName}
                        className={styles.productImage}
                      />
                      <div className={styles.detailsCol}>
                        <span className={styles.productCategoryTag}>
                          {order.productCategory || "Fresh Flowers"}
                        </span>
                        <h3 className={styles.productTitle}>
                          {order.productName}
                        </h3>
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

                        <Link href="/flower" className={styles.reorderBtn}>
                          Reorder
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className={styles.emptyStateCard}>
            <img
              src="https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80"
              alt="Empty orders"
              className={styles.emptyFloralImg}
            />
            <h2 className={styles.emptyTitle}>No Orders Yet</h2>
            <p className={styles.emptyDesc}>
              Looks like your flower journey hasn&apos;t started yet. Brighten someone&apos;s
              day with our handcrafted bouquets.
            </p>
            <Link href="/flower" className={styles.startShoppingBtn}>
              <Sparkles size={16} />
              <span>Explore Flowers</span>
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
