"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import styles from "./page.module.css";
import {
  Search,
  Package,
  CheckCircle,
  Truck,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  LucideIcon,
  ShoppingBag,
  Lock,
  ShieldAlert,
} from "lucide-react";

type OrderStatus = "placed" | "confirmed" | "preparing" | "out_for_delivery" | "delivered";

interface OrderData {
  id: string;
  status: OrderStatus;
  product: string;
  image: string;
  placedAt: string;
  deliveryDate: string;
  timeSlot: string;
  address: string;
  price: number;
  deliveryCharge: number;
  rider?: string;
  riderPhone?: string;
}

interface StatusStep {
  key: OrderStatus;
  label: string;
  icon: LucideIcon;
  desc: string;
}

const STATUS_STEPS: StatusStep[] = [
  { key: "placed",           label: "Order Placed",      icon: Package,     desc: "We received your order" },
  { key: "confirmed",        label: "Confirmed",         icon: CheckCircle, desc: "Occasions confirmed your order" },
  { key: "preparing",        label: "Preparing",         icon: RefreshCw,   desc: "Your arrangement is being prepared" },
  { key: "out_for_delivery", label: "Out for Delivery",  icon: Truck,       desc: "Your order is on the way" },
  { key: "delivered",        label: "Delivered",         icon: CheckCircle, desc: "Delivered successfully" },
];

const STATUS_ORDER: OrderStatus[] = [
  "placed", "confirmed", "preparing", "out_for_delivery", "delivered",
];

function statusLabel(status: OrderStatus): string {
  if (status === "out_for_delivery") return "Out for Delivery";
  if (status === "delivered") return "Delivered";
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function TrackOrderPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("");
  const [searched, setSearched] = useState(false);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [lookupError, setLookupError] = useState<{
    type: "notFound" | "forbidden" | "unauthorized" | "error";
    message: string;
  } | null>(null);
  const [customerOrders, setCustomerOrders] = useState<OrderData[]>([]);
  const [loadingCustomerOrders, setLoadingCustomerOrders] = useState(false);

  // Fetch only the authenticated customer's own orders
  useEffect(() => {
    setCustomerOrders([]);
    if (!isAuthenticated || !user?.id) {
      setLoadingCustomerOrders(false);
      return;
    }

    setLoadingCustomerOrders(true);
    fetch("/api/orders", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success && Array.isArray(data.orders)) {
          const mapped: OrderData[] = data.orders.map((o: any) => {
            const firstItem = o.items?.[0];
            const addr = o.deliveryAddress;
            const addrParts = [
              addr?.houseBuilding || addr?.house,
              addr?.street,
              addr?.landmark,
              addr?.area,
              addr?.city || "Calicut",
              addr?.pinCode ? `- ${addr.pinCode}` : "",
            ].filter(Boolean);
            const addrStr = addrParts.length > 0 ? addrParts.join(", ") : "Calicut, Kerala";

            const mappedStatus: OrderStatus =
              o.order_status === "confirmed"
                ? "confirmed"
                : o.order_status === "preparing"
                ? "preparing"
                : o.order_status === "out_for_delivery"
                ? "out_for_delivery"
                : o.order_status === "delivered"
                ? "delivered"
                : "placed";

            return {
              id: o.id.startsWith("#") ? o.id : `#${o.id}`,
              status: mappedStatus,
              product:
                firstItem?.product_id === "cake-blue-floral" || firstItem?.product_image?.includes("blue-floral")
                  ? "Blue Floral Birthday Cake"
                  : firstItem?.product_name || "Handcrafted Fresh Arrangement",
              image: firstItem?.product_image || "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647384/occasions/products/flower-bouquet/flower-bouquet-white-casablanca-lilies.jpg",
              placedAt: new Date(o.created_at).toLocaleDateString("en-IN", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              deliveryDate: addr?.deliveryDate
                ? new Date(addr.deliveryDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Today",
              timeSlot: addr?.deliveryTime || "Express Calicut Delivery",
              address: addrStr,
              price: Number(o.final_amount) || Number(o.subtotal) || 0,
              deliveryCharge: Number(o.delivery_charge) || 0,
              rider: "Occasions Floral Dispatch",
              riderPhone: "+91 8606 464 700",
            };
          });
          setCustomerOrders(mapped);
        } else {
          setCustomerOrders([]);
        }
      })
      .catch((err) => {
        console.warn("Failed to load customer orders for tracking:", err);
        setCustomerOrders([]);
      })
      .finally(() => setLoadingCustomerOrders(false));
  }, [isAuthenticated, user?.id]);

  const executeLookup = async (searchId: string) => {
    const rawKey = searchId.trim();
    if (!rawKey) return;
    const cleanKey = rawKey.replace(/^#+/, "").trim();
    setSearched(true);
    setLookupError(null);

    try {
      const res = await fetch(`/api/orders?id=${encodeURIComponent(cleanKey)}`, {
        credentials: "include",
      });
      const data = await res.json();

      if (res.status === 401 || data.requiresAuth) {
        setOrder(null);
        setLookupError({
          type: "unauthorized",
          message: data.error || "Please sign in to track this order.",
        });
        return;
      }

      if (res.status === 403) {
        setOrder(null);
        setLookupError({
          type: "forbidden",
          message: "Access Denied: This order belongs to another account.",
        });
        return;
      }

      if (!res.ok || !data.success || !data.order) {
        setOrder(null);
        setLookupError({
          type: "notFound",
          message: `No order found matching "${searchId.trim()}". Please check your Order ID and try again.`,
        });
        return;
      }

      const o = data.order;
      const firstItem = o.items?.[0];
      const addr = o.deliveryAddress;
      const addrParts = [
        addr?.houseBuilding || addr?.house,
        addr?.street,
        addr?.landmark,
        addr?.area,
        addr?.city || "Calicut",
        addr?.pinCode ? `- ${addr.pinCode}` : "",
      ].filter(Boolean);
      const addrStr = addrParts.length > 0 ? addrParts.join(", ") : "Calicut, Kerala";

      const mappedStatus: OrderStatus =
        o.order_status === "confirmed"
          ? "confirmed"
          : o.order_status === "preparing"
          ? "preparing"
          : o.order_status === "out_for_delivery"
          ? "out_for_delivery"
          : o.order_status === "delivered"
          ? "delivered"
          : "placed";

      setOrder({
        id: o.id.startsWith("#") ? o.id : `#${o.id}`,
        status: mappedStatus,
        product:
          firstItem?.product_id === "cake-blue-floral" || firstItem?.product_image?.includes("blue-floral")
            ? "Blue Floral Birthday Cake"
            : firstItem?.product_name || "Handcrafted Fresh Arrangement",
        image: firstItem?.product_image || "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647384/occasions/products/flower-bouquet/flower-bouquet-white-casablanca-lilies.jpg",
        placedAt: new Date(o.created_at).toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        deliveryDate: addr?.deliveryDate
          ? new Date(addr.deliveryDate).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "Today",
        timeSlot: addr?.deliveryTime || "Express Calicut Delivery",
        address: addrStr,
        price: Number(o.final_amount) || Number(o.subtotal) || 0,
        deliveryCharge: Number(o.delivery_charge) || 0,
        rider: "Occasions Floral Dispatch",
        riderPhone: "+91 8606 464 700",
      });
      setLookupError(null);
    } catch (err) {
      console.warn("Live order lookup error", err);
      setOrder(null);
      setLookupError({
        type: "error",
        message: "An error occurred while looking up the order. Please try again.",
      });
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    executeLookup(input);
  };

  const handleSelectOrder = (orderId: string) => {
    const clean = orderId.replace(/^#+/, "").trim();
    setInput(clean);
    executeLookup(clean);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlId = params.get("orderId") || params.get("id");
      if (urlId) {
        setInput(urlId);
        executeLookup(urlId);
      } else {
        // Auto-focus the input field when entering this page so the text cursor appears immediately
        inputRef.current?.focus();
      }
    }
  }, []);

  const currentStepIndex = order ? STATUS_ORDER.indexOf(order.status) : -1;

  return (
    <div className={styles.pageWrapper}>
      <Navbar />
      <main className={styles.main}>
        {/* ── Hero Banner ── */}
        <section className={styles.heroBanner}>
          <div className={styles.heroBadge}>
            <Truck size={13} />
            <span>Live Tracking</span>
          </div>
          <h1 className={styles.heroTitle}>Track Your Order</h1>
          <p className={styles.heroSubtitle}>Enter your order ID to get real-time delivery updates</p>

          <form onSubmit={handleSearch} className={styles.searchForm}>
            <label
              htmlFor="trackOrderIdInput"
              className={styles.searchBox}
              onClick={() => inputRef.current?.focus()}
            >
              <Search
                size={18}
                className={styles.searchIcon}
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.focus();
                }}
              />
              <input
                ref={inputRef}
                id="trackOrderIdInput"
                type="text"
                autoFocus
                className={styles.searchInput}
                placeholder="Enter Order ID e.g. 178505"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                aria-label="Order ID"
                autoComplete="off"
              />
            </label>
            <button type="submit" className={styles.searchBtn}>
              Track Now <ChevronRight size={17} strokeWidth={2.5} />
            </button>
          </form>

          {/* Quick-Track: Only this customer's own recent orders */}
          {isAuthenticated && customerOrders.length > 0 && (
            <div className={styles.quickTrackRow}>
              <span className={styles.quickTrackLabel}>Your Recent Orders:</span>
              <div className={styles.quickTrackChips}>
                {customerOrders.slice(0, 4).map((o) => {
                  const isCur = input.trim().replace(/^#+/, "").toUpperCase() === o.id.replace(/^#+/, "").toUpperCase();
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => handleSelectOrder(o.id)}
                      className={`${styles.quickChip} ${isCur ? styles.quickChipActive : ""}`}
                      title={`Track Order ${o.id}`}
                    >
                      <Package size={12} />
                      <span>{o.id}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <p className={styles.heroHint}>Your Order ID is in your confirmation email or SMS</p>
        </section>

        {/* ── Result Section ── */}
        {searched && (
          <section className={styles.resultSection}>
            {!order && (
              <>
                {lookupError?.type === "unauthorized" ? (
                  <div className={styles.authRequiredBox}>
                    <Lock size={44} className={styles.authRequiredIcon} />
                    <h2 className={styles.notFoundTitle}>Sign In Required</h2>
                    <p className={styles.notFoundDesc}>
                      {lookupError.message}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== "undefined") {
                          window.dispatchEvent(new CustomEvent("show-signin-modal"));
                        }
                      }}
                      className={styles.errorActionBtn}
                    >
                      Sign In to Account
                    </button>
                  </div>
                ) : lookupError?.type === "forbidden" ? (
                  <div className={styles.forbiddenBox}>
                    <ShieldAlert size={44} className={styles.forbiddenIcon} />
                    <h2 className={styles.notFoundTitle}>Access Denied</h2>
                    <p className={styles.notFoundDesc}>
                      This order was placed by another customer account and cannot be viewed. Please check the Order ID or sign in to the matching account.
                    </p>
                    <a
                      href="https://wa.me/918606464700"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.whatsappLink}
                    >
                      Need help? Chat with Occasions Support
                    </a>
                  </div>
                ) : (
                  <div className={styles.notFound}>
                    <AlertCircle size={44} className={styles.notFoundIcon} />
                    <h2 className={styles.notFoundTitle}>Order not found</h2>
                    <p className={styles.notFoundDesc}>
                      {lookupError?.message || `No order found for "${input.trim()}". Please check the ID and try again.`}
                    </p>
                    <a
                      href="https://wa.me/918606464700"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.whatsappLink}
                    >
                      Chat on WhatsApp for help
                    </a>
                  </div>
                )}
              </>
            )}

            {order && (
              <div className={styles.orderCard}>
                {/* Card header */}
                <div className={styles.orderCardHeader}>
                  <div className={styles.orderIdRow}>
                    <Package size={16} className={styles.orderIdIcon} />
                    <span className={styles.orderIdLabel}>Order ID</span>
                    <strong className={styles.orderIdValue}>{order.id}</strong>
                  </div>
                  <span
                    className={`${styles.statusBadge} ${
                      order.status === "delivered"
                        ? styles.statusDelivered
                        : order.status === "out_for_delivery"
                        ? styles.statusOutForDelivery
                        : styles.statusActive
                    }`}
                  >
                    {statusLabel(order.status)}
                  </span>
                </div>

                {/* Product row */}
                <div className={styles.productRow}>
                  <div className={styles.productImageWrap}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={order.image}
                      alt={order.product}
                      className={styles.productImage}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "https://placehold.co/80x80/F9D7E0/E6004C?text=🌸";
                      }}
                    />
                  </div>
                  <div className={styles.productInfo}>
                    <p className={styles.productName}>{order.product}</p>
                    <p className={styles.productMeta}>Placed: {order.placedAt}</p>
                    <p className={styles.productMeta}>
                      <strong>₹{(order.price + order.deliveryCharge).toLocaleString("en-IN")}</strong>
                      {order.deliveryCharge === 0 ? (
                        <span className={styles.freeDeliveryBadge}>Free Delivery</span>
                      ) : (
                        <span className={styles.chargeBadge}>+₹{order.deliveryCharge} delivery</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Delivery details */}
                <div className={styles.deliveryDetails}>
                  <div className={styles.deliveryDetailRow}>
                    <Clock size={14} className={styles.detailIcon} />
                    <span>
                      <strong>Slot:</strong> {order.deliveryDate} · {order.timeSlot}
                    </span>
                  </div>
                  <div className={styles.deliveryDetailRow}>
                    <MapPin size={14} className={styles.detailIcon} />
                    <span>
                      <strong>Delivering to:</strong> {order.address}
                    </span>
                  </div>
                  {order.rider && (
                    <div className={styles.deliveryDetailRow}>
                      <Truck size={14} className={styles.detailIcon} />
                      <span>
                        <strong>Delivery Partner:</strong> {order.rider}
                      </span>
                      {order.riderPhone && (
                        <a href={`tel:${order.riderPhone}`} className={styles.riderCall}>
                          <Phone size={12} /> Call
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Timeline */}
                <div className={styles.timeline}>
                  {STATUS_STEPS.map((step, idx) => {
                    const Icon = step.icon;
                    const isPast = idx < currentStepIndex;
                    const isCurrent = idx === currentStepIndex;
                    const isFuture = idx > currentStepIndex;
                    return (
                      <div key={step.key} className={styles.timelineStep}>
                        {idx > 0 && (
                          <div
                            className={`${styles.timelineLine} ${
                              isPast || isCurrent ? styles.timelineLineActive : ""
                            }`}
                          />
                        )}
                        <div
                          className={`${styles.timelineNode} ${
                            isPast
                              ? styles.nodeCompleted
                              : isCurrent
                              ? styles.nodeCurrent
                              : styles.nodeFuture
                          }`}
                        >
                          <Icon size={14} strokeWidth={isCurrent ? 2.5 : 2} />
                        </div>
                        <div className={`${styles.timelineLabel} ${isFuture ? styles.labelFuture : ""}`}>
                          <strong>{step.label}</strong>
                          {isCurrent && <span className={styles.timelineSub}>{step.desc}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Support */}
                <div className={styles.supportRow}>
                  <a
                    href="https://wa.me/918606464700"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.supportBtn}
                  >
                    <MessageCircle size={15} /> WhatsApp Support
                  </a>
                  <a href="tel:+918606464700" className={styles.supportBtn}>
                    <Phone size={15} /> Call Us
                  </a>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── Customer Orders Section / Empty State / Auth Prompt ── */}
        {isAuthenticated ? (
          loadingCustomerOrders ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
              <p>Loading your orders...</p>
            </div>
          ) : customerOrders.length > 0 ? (
            <section className={styles.availableSection}>
              <div className={styles.availableSectionHeader}>
                <div className={styles.availableTitleWrap}>
                  <div className={styles.availableIconWrap}>
                    <Package size={22} color="#E6004C" />
                  </div>
                  <div>
                    <h2 className={styles.availableTitle}>Your Orders to Track</h2>
                    <p className={styles.availableSubtitle}>
                      Select any order below to view its live delivery updates and status
                    </p>
                  </div>
                </div>
                <span className={styles.availableBadge}>
                  {customerOrders.length} {customerOrders.length === 1 ? "Order" : "Orders"}
                </span>
              </div>

              <div className={styles.availableGrid}>
                {customerOrders.map((o) => {
                  const isSelected =
                    order && order.id.replace(/^#+/, "").toUpperCase() === o.id.replace(/^#+/, "").toUpperCase();
                  return (
                    <article
                      key={o.id}
                      className={`${styles.availableCard} ${isSelected ? styles.availableCardSelected : ""}`}
                      onClick={() => handleSelectOrder(o.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleSelectOrder(o.id);
                        }
                      }}
                    >
                      <div className={styles.availableCardTop}>
                        <div className={styles.availableIdBadge}>
                          <Package size={14} color="#E6004C" />
                          <span>{o.id}</span>
                        </div>
                        <span
                          className={`${styles.statusPill} ${
                            o.status === "delivered"
                              ? styles.pillDelivered
                              : o.status === "out_for_delivery"
                              ? styles.pillOutForDelivery
                              : styles.pillConfirmed
                          }`}
                        >
                          {statusLabel(o.status)}
                        </span>
                      </div>

                      <div className={styles.availableCardBody}>
                        <div className={styles.availableImgWrap}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={o.image}
                            alt={o.product}
                            className={styles.availableImg}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                "https://placehold.co/80x80/F9D7E0/E6004C?text=🌸";
                            }}
                          />
                        </div>
                        <div className={styles.availableInfo}>
                          <h3 className={styles.availableProductName}>{o.product}</h3>
                          <p className={styles.availableDate}>Placed: {o.placedAt}</p>
                          <div className={styles.availablePriceRow}>
                            <span className={styles.availablePrice}>
                              ₹{o.price.toLocaleString("en-IN")}
                            </span>
                            <span className={styles.trackActionBtn}>
                              Track Order <ChevronRight size={14} />
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ) : (
            /* New Customer Empty State (Requirement 5) */
            <section className={styles.emptyOrdersSection}>
              <div className={styles.emptyOrdersCard}>
                <div className={styles.emptyIconWrap}>
                  <Package size={36} color="#E6004C" />
                </div>
                <h2 className={styles.emptyTitle}>No Orders Yet</h2>
                <p className={styles.emptyDesc}>
                  You haven&apos;t placed any orders yet. Explore our beautiful flowers and gifts to make someone&apos;s day special!
                </p>
                <Link href="/flower-bouquets" className={styles.shopNowBtn}>
                  <ShoppingBag size={16} />
                  <span>Shop Now</span>
                </Link>
              </div>
            </section>
          )
        ) : (
          /* Unauthenticated Visitor Prompt */
          <section className={styles.authPromptSection}>
            <div className={styles.authPromptCard}>
              <div className={styles.authPromptIconWrap}>
                <Lock size={30} color="#E6004C" />
              </div>
              <h2 className={styles.authPromptTitle}>Sign In to View Your Orders</h2>
              <p className={styles.authPromptDesc}>
                Sign in to your account to view and track your orders automatically, or enter your Order ID above.
              </p>
              <div className={styles.authPromptBtnGroup}>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(new CustomEvent("show-signin-modal"));
                    }
                  }}
                  className={styles.signInBtn}
                >
                  Sign In / Register
                </button>
                <Link href="/flower-bouquets" className={styles.exploreBtn}>
                  Browse Collection
                </Link>
              </div>
            </div>
          </section>
        )}
       </main>
      <Footer />
    </div>
  );
}
