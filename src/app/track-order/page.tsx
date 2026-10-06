"use client";

import React, { useState } from "react";
import Link from "next/link";
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

interface StatusStep {
  key: OrderStatus;
  label: string;
  icon: LucideIcon;
  desc: string;
}

const STATUS_STEPS: StatusStep[] = [
  { key: "placed",            label: "Order Placed",      icon: Package,    desc: "We received your order" },
  { key: "confirmed",         label: "Confirmed",         icon: CheckCircle, desc: "Our florist confirmed your order" },
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
  const [input, setInput]       = useState("");
  const [searched, setSearched] = useState(false);
  const [order, setOrder]       = useState<OrderData | null>(null);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const key = input.trim().toUpperCase();
    setSearched(true);
    try {
      const res = await fetch(`/api/orders?id=${encodeURIComponent(key)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.order) {
          const o = data.order;
          const firstItem = o.items?.[0];
          const addr = o.deliveryAddress;
          const addrStr = addr
            ? `${addr.house || ""} ${addr.street || ""}, ${addr.area || ""}, ${addr.city || "Calicut"} - ${addr.pinCode || ""}`.trim()
            : "Calicut, Kerala";
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
            id: o.id,
            status: mappedStatus,
            product: firstItem?.product_name || "Handcrafted Flower Arrangement",
            image: firstItem?.product_image || "/images/lily-6-stems.png",
            placedAt: new Date(o.created_at).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            deliveryDate: "Today",
            timeSlot: "Express Calicut Delivery",
            address: addrStr,
            price: o.final_amount,
            deliveryCharge: o.delivery_charge,
            rider: "Occasions Floral Dispatch",
            riderPhone: "+91 8606 464 700",
          });
          return;
        }
      }
    } catch (err) {
      console.warn("Live order lookup fallback", err);
    }
    setOrder(DUMMY_ORDERS[key] ?? null);
  };

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
            <div className={styles.searchBox}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Enter Order ID  e.g. OCC-100123"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                aria-label="Order ID"
                autoComplete="off"
              />
            </div>
            <button type="submit" className={styles.searchBtn}>
              Track Now <ChevronRight size={17} strokeWidth={2.5} />
            </button>
          </form>
          <p className={styles.heroHint}>Your Order ID is in your confirmation email or SMS</p>
        </section>

        {/* ── Result ── */}
        <section className={styles.resultSection}>
          {!searched && (
            <div className={styles.howItWorks}>
              <h2 className={styles.howTitle}>How it works</h2>
              <div className={styles.howSteps}>
                {[
                  { icon: "📋", label: "Enter Order ID",      desc: "Use the ID from your confirmation" },
                  { icon: "🔍", label: "Instant Search",      desc: "We fetch your live order status" },
                  { icon: "🚚", label: "Track in Real Time",  desc: "See exactly where your flowers are" },
                ].map((step) => (
                  <div key={step.label} className={styles.howStep}>
                    <span className={styles.howEmoji}>{step.icon}</span>
                    <strong className={styles.howLabel}>{step.label}</strong>
                    <span className={styles.howDesc}>{step.desc}</span>
                  </div>
                ))}
              </div>
              <div className={styles.demoHint}>
                <strong>Try demo IDs:</strong> <code>OCC-100123</code> &nbsp;or&nbsp; <code>OCC-100098</code>
              </div>
            </div>
          )}

          {searched && !order && (
            <div className={styles.notFound}>
              <AlertCircle size={44} className={styles.notFoundIcon} />
              <h2 className={styles.notFoundTitle}>Order not found</h2>
              <p className={styles.notFoundDesc}>
                No order found for <strong>&ldquo;{input.trim()}&rdquo;</strong>. Please check the ID and try again.
              </p>
              <a href="https://wa.me/918606464700" target="_blank" rel="noopener noreferrer" className={styles.whatsappLink}>
                💬 Chat on WhatsApp for help
              </a>
              <div className={styles.demoHint}>
                <strong>Demo:</strong> Try <code>OCC-100123</code> or <code>OCC-100098</code>
              </div>
            </div>
          )}

          {searched && order && (
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

        {/* ── Help Banner ── */}
        <section className={styles.helpBanner}>
          <div className={styles.helpContent}>
            <h3 className={styles.helpTitle}>Need help with your order?</h3>
            <p className={styles.helpDesc}>Our floral team is available 8 AM – 8 PM every day</p>
          </div>
          <div className={styles.helpActions}>
            <a href="https://wa.me/918606464700" target="_blank" rel="noopener noreferrer" className={styles.helpBtnPrimary}>
              💬 WhatsApp Us
            </a>
            <Link href="/orders" className={styles.helpBtnSecondary}>My Orders</Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
