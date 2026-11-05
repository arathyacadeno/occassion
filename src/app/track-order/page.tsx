"use client";

import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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

const DUMMY_ORDERS: Record<string, OrderData> = {
  "181573": {
    id: "181573",
    status: "confirmed",
    product: "Chocolate Birthday Cake for Amma",
    image: "/images/cakes/chocolate-birthday-cake-for-amma.png",
    placedAt: "22 Oct 2026 · 1:30 PM",
    deliveryDate: "Today",
    timeSlot: "Express Calicut Delivery",
    address: "Mavoor Road, Kozhikode – 673004",
    price: 1450,
    deliveryCharge: 0,
    rider: "Occasions Floral Dispatch",
    riderPhone: "+91 8606 464 700",
  },
  "874941": {
    id: "874941",
    status: "out_for_delivery",
    product: "1kg Premium Belgium Chocolate Cake",
    image: "/images/cakes/decadent-chocolate-shavings-cake.png",
    placedAt: "22 Oct 2026 · 10:16 AM",
    deliveryDate: "Today",
    timeSlot: "2:00 – 4:00 PM",
    address: "Palayam, Kozhikode – 673002",
    price: 2600,
    deliveryCharge: 0,
    rider: "Rajan K.",
    riderPhone: "+91 8606 464 700",
  },
  "178505": {
    id: "178505",
    status: "confirmed",
    product: "Chocolate Truffle Cake",
    image: "/images/cakes/chocolate-birthday-cake-for-amma.png",
    placedAt: "15 Oct 2026 · 4:07 PM",
    deliveryDate: "Today",
    timeSlot: "4:00 – 6:00 PM",
    address: "Mavoor Road, Kozhikode – 673004",
    price: 1450,
    deliveryCharge: 0,
    rider: "Occasions Floral Dispatch",
    riderPhone: "+91 8606 464 700",
  },
  "OCC-100123": {
    id: "OCC-100123",
    status: "out_for_delivery",
    product: "Wildflower Basket",
    image: "/images/wildflower-basket.jpg",
    placedAt: "Today, 9:15 AM",
    deliveryDate: "Today",
    timeSlot: "10:00 – 11:00 AM",
    address: "12, Beach Road, Kozhikode – 673001",
    price: 2300,
    deliveryCharge: 0,
    rider: "Rajan K.",
    riderPhone: "+91 9447 446 008",
  },
  "OCC-100098": {
    id: "OCC-100098",
    status: "delivered",
    product: "Rose Bouquet",
    image: "/images/roses-bouquet.jpg",
    placedAt: "Oct 3, 2026 · 2:45 PM",
    deliveryDate: "Oct 3, 2026",
    timeSlot: "4:00 – 5:00 PM",
    address: "45, Palayam, Kozhikode – 673002",
    price: 1299,
    deliveryCharge: 150,
  },
};

interface AvailableOrderItem {
  id: string;
  status: OrderStatus;
  product: string;
  image: string;
  placedAt: string;
  price: number;
}

const DEFAULT_AVAILABLE_ORDERS: AvailableOrderItem[] = [
  {
    id: "181573",
    status: "confirmed",
    product: "Chocolate Birthday Cake for Amma",
    image: "/images/cakes/chocolate-birthday-cake-for-amma.png",
    placedAt: "22 Oct 2026",
    price: 1450,
  },
  {
    id: "874941",
    status: "out_for_delivery",
    product: "1kg Premium Belgium Chocolate Cake",
    image: "/images/cakes/decadent-chocolate-shavings-cake.png",
    placedAt: "22 Oct 2026",
    price: 2600,
  },
  {
    id: "178505",
    status: "confirmed",
    product: "Chocolate Truffle Cake",
    image: "/images/cakes/chocolate-birthday-cake-for-amma.png",
    placedAt: "15 Oct 2026",
    price: 1450,
  },
  {
    id: "OCC-100123",
    status: "out_for_delivery",
    product: "Wildflower Basket",
    image: "/images/wildflower-basket.jpg",
    placedAt: "Today, 9:15 AM",
    price: 2300,
  },
  {
    id: "OCC-100098",
    status: "delivered",
    product: "Rose Bouquet",
    image: "/images/roses-bouquet.jpg",
    placedAt: "03 Oct 2026",
    price: 1449,
  },
];

interface StatusStep {
  key: OrderStatus;
  label: string;
  icon: LucideIcon;
  desc: string;
}

const STATUS_STEPS: StatusStep[] = [
  { key: "placed",            label: "Order Placed",      icon: Package,    desc: "We received your order" },
  { key: "confirmed",         label: "Confirmed",         icon: CheckCircle, desc: "Occasions confirmed your order" },
  { key: "preparing",         label: "Preparing",         icon: RefreshCw,  desc: "Your arrangement is being prepared" },
  { key: "out_for_delivery",  label: "Out for Delivery",  icon: Truck,      desc: "Your order is on the way" },
  { key: "delivered",         label: "Delivered",         icon: CheckCircle, desc: "Delivered successfully" },
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
  const inputRef                = useRef<HTMLInputElement>(null);
  const [input, setInput]       = useState("");
  const [searched, setSearched] = useState(false);
  const [order, setOrder]       = useState<OrderData | null>(null);
  const [availableOrders, setAvailableOrders] = useState<AvailableOrderItem[]>(DEFAULT_AVAILABLE_ORDERS);

  const executeLookup = async (searchId: string) => {
    const rawKey = searchId.trim();
    if (!rawKey) return;
    const cleanKey = rawKey.replace(/^#+/, "").trim();
    const key = cleanKey.toUpperCase();
    setSearched(true);

    try {
      const res = await fetch(`/api/orders?id=${encodeURIComponent(cleanKey)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.order) {
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
            image: firstItem?.product_image || "/images/lily-6-stems.png",
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
          return;
        }
      }
    } catch (err) {
      console.warn("Live order lookup fallback", err);
    }

    // Fallback 1: LocalStorage for recent guest orders
    if (typeof window !== "undefined") {
      try {
        const storedLatest = localStorage.getItem("occassions_latest_order");
        const storedHistory = localStorage.getItem("occassions_order_history");
        const localOrders: any[] = [];
        if (storedLatest) localOrders.push(JSON.parse(storedLatest));
        if (storedHistory) localOrders.push(...JSON.parse(storedHistory));

        const matchedLocal = localOrders.find(
          (lo) =>
            lo.orderId === cleanKey ||
            lo.orderId === rawKey ||
            `#${lo.orderId}` === rawKey ||
            `#${lo.orderId}` === `#${cleanKey}`
        );
        if (matchedLocal) {
          setOrder({
            id: matchedLocal.orderId.startsWith("#") ? matchedLocal.orderId : `#${matchedLocal.orderId}`,
            status: matchedLocal.orderStatus || "confirmed",
            product: matchedLocal.productName,
            image: matchedLocal.productImage,
            placedAt: new Date(matchedLocal.createdAt).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            deliveryDate: "Today",
            timeSlot: matchedLocal.estimatedDelivery || "Express Calicut Delivery",
            address: "Calicut, Kerala",
            price: matchedLocal.price,
            deliveryCharge: 0,
            rider: "Occasions Floral Dispatch",
            riderPhone: "+91 8606 464 700",
          });
          return;
        }
      } catch (localErr) {
        console.warn("LocalStorage fallback check error:", localErr);
      }
    }

    // Fallback 2: DUMMY_ORDERS
    setOrder(
      DUMMY_ORDERS[cleanKey] ??
        DUMMY_ORDERS[`#${cleanKey}`] ??
        DUMMY_ORDERS[rawKey.toUpperCase()] ??
        null
    );
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
      }
    }
  }, []);

  // Fetch available orders on mount
  useEffect(() => {
    let isMounted = true;

    async function loadAvailableOrders() {
      const ordersList: AvailableOrderItem[] = [];

      // 1. Check LocalStorage for recent user orders
      if (typeof window !== "undefined") {
        try {
          const storedLatest = localStorage.getItem("occassions_latest_order");
          const storedHistory = localStorage.getItem("occassions_order_history");
          const locals: any[] = [];
          if (storedLatest) locals.push(JSON.parse(storedLatest));
          if (storedHistory) locals.push(...JSON.parse(storedHistory));

          locals.forEach((lo) => {
            if (lo && lo.orderId) {
              const cleanId = String(lo.orderId).replace(/^#+/, "");
              if (!ordersList.some((x) => x.id === cleanId)) {
                ordersList.push({
                  id: cleanId,
                  status: (lo.orderStatus || "confirmed") as OrderStatus,
                  product: lo.productName || "Handcrafted Fresh Arrangement",
                  image: lo.productImage || "/images/cakes/chocolate-birthday-cake-for-amma.png",
                  placedAt: lo.createdAt
                    ? new Date(lo.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "Recent Order",
                  price: Number(lo.price) || 0,
                });
              }
            }
          });
        } catch (e) {
          console.warn("Failed to parse local orders:", e);
        }
      }

      // 2. Fetch available orders from API
      try {
        const res = await fetch("/api/orders?type=available");
        if (res.ok) {
          const data = await res.json();
          if (data && data.success && Array.isArray(data.orders)) {
            data.orders.forEach((o: any) => {
              const cleanId = String(o.id).replace(/^#+/, "");
              if (!ordersList.some((x) => x.id === cleanId)) {
                const firstItem = o.items?.[0];
                ordersList.push({
                  id: cleanId,
                  status: (o.order_status || "confirmed") as OrderStatus,
                  product: firstItem?.product_name || "Handcrafted Fresh Arrangement",
                  image: firstItem?.product_image || "/images/cakes/chocolate-birthday-cake-for-amma.png",
                  placedAt: o.created_at
                    ? new Date(o.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "Recent Order",
                  price: Number(o.final_amount) || Number(firstItem?.product_price) || 0,
                });
              }
            });
          }
        }
      } catch (err) {
        console.warn("Available orders API fetch fallback:", err);
      }

      // 3. Fallback to default available orders for any missing items
      DEFAULT_AVAILABLE_ORDERS.forEach((def) => {
        if (!ordersList.some((x) => x.id === def.id)) {
          ordersList.push(def);
        }
      });

      if (isMounted && ordersList.length > 0) {
        setAvailableOrders(ordersList);
      }
    }

    loadAvailableOrders();

    return () => {
      isMounted = false;
    };
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
                className={styles.searchInput}
                placeholder="Enter Order ID  e.g. 178505"
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

          {/* Quick-Track Available Order IDs */}
          {availableOrders.length > 0 && (
            <div className={styles.quickTrackRow}>
              <span className={styles.quickTrackLabel}>Available Order IDs:</span>
              <div className={styles.quickTrackChips}>
                {availableOrders.slice(0, 5).map((o) => {
                  const isCur = input.trim().replace(/^#+/, "").toUpperCase() === o.id.toUpperCase();
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => handleSelectOrder(o.id)}
                      className={`${styles.quickChip} ${isCur ? styles.quickChipActive : ""}`}
                      title={`Track Order #${o.id}`}
                    >
                      <Package size={12} />
                      <span>#{o.id}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <p className={styles.heroHint}>Your Order ID is in your confirmation email or SMS</p>
        </section>

        {/* ── Result ── */}
        {searched && (
          <section className={styles.resultSection}>
            {!order && (
              <div className={styles.notFound}>
                <AlertCircle size={44} className={styles.notFoundIcon} />
                <h2 className={styles.notFoundTitle}>Order not found</h2>
                <p className={styles.notFoundDesc}>
                  No order found for <strong>&ldquo;{input.trim()}&rdquo;</strong>. Please check the ID and try again.
                </p>
                <a href="https://wa.me/918606464700" target="_blank" rel="noopener noreferrer" className={styles.whatsappLink}>
                  Chat on WhatsApp for help
                </a>
              </div>
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
                  <span className={`${styles.statusBadge} ${
                    order.status === "delivered"        ? styles.statusDelivered      :
                    order.status === "out_for_delivery" ? styles.statusOutForDelivery :
                    styles.statusActive
                  }`}>
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
                      {order.deliveryCharge === 0
                        ? <span className={styles.freeDeliveryBadge}>Free Delivery</span>
                        : <span className={styles.chargeBadge}>+₹{order.deliveryCharge} delivery</span>}
                    </p>
                  </div>
                </div>

                {/* Delivery details */}
                <div className={styles.deliveryDetails}>
                  <div className={styles.deliveryDetailRow}>
                    <Clock size={14} className={styles.detailIcon} />
                    <span><strong>Slot:</strong> {order.deliveryDate} · {order.timeSlot}</span>
                  </div>
                  <div className={styles.deliveryDetailRow}>
                    <MapPin size={14} className={styles.detailIcon} />
                    <span><strong>Delivering to:</strong> {order.address}</span>
                  </div>
                  {order.rider && (
                    <div className={styles.deliveryDetailRow}>
                      <Truck size={14} className={styles.detailIcon} />
                      <span><strong>Delivery Partner:</strong> {order.rider}</span>
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
                    const Icon     = step.icon;
                    const isPast    = idx < currentStepIndex;
                    const isCurrent = idx === currentStepIndex;
                    const isFuture  = idx > currentStepIndex;
                    return (
                      <div key={step.key} className={styles.timelineStep}>
                        {idx > 0 && (
                          <div className={`${styles.timelineLine} ${isPast || isCurrent ? styles.timelineLineActive : ""}`} />
                        )}
                        <div className={`${styles.timelineNode} ${isPast ? styles.nodeCompleted : isCurrent ? styles.nodeCurrent : styles.nodeFuture}`}>
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
                  <a href="https://wa.me/918606464700" target="_blank" rel="noopener noreferrer" className={styles.supportBtn}>
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

        {/* ── Available Orders to Track ── */}
        <section className={styles.availableSection}>
          <div className={styles.availableSectionHeader}>
            <div className={styles.availableTitleWrap}>
              <div className={styles.availableIconWrap}>
                <Package size={22} color="#E6004C" />
              </div>
              <div>
                <h2 className={styles.availableTitle}>Available Orders to Track</h2>
                <p className={styles.availableSubtitle}>
                  Select any order with its Order ID below to view live tracking updates
                </p>
              </div>
            </div>
            <span className={styles.availableBadge}>
              {availableOrders.length} {availableOrders.length === 1 ? "Order" : "Orders"}
            </span>
          </div>

          <div className={styles.availableGrid}>
            {availableOrders.map((o) => {
              const isSelected =
                order && order.id.replace(/^#+/, "").toUpperCase() === o.id.toUpperCase();
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
                      <span>#{o.id}</span>
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
      </main>
      <Footer />
    </div>
  );
}
