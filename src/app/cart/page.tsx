"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import { useCart } from "@/context/CartContext";
import { useCheckout } from "@/context/CheckoutContext";
import {
  Trash2,
  Copy,
  Star,
  Check,
  ArrowRight,
  Minus,
  Plus,
} from "lucide-react";
import styles from "./cart.module.css";

// Fallback demo items with valid high-res image paths
const INITIAL_DEMO_ITEMS = [
  {
    bouquet: {
      id: "celebration-hamper",
      name: "Celebration Floral & Cake Hamper",
      subtitle: "Fresh flower arrangement",
      price: 158,
      originalPrice: 249,
      image: "/images/cat-flower-bouquet-luxe.jpg",
      rating: 4.4,
      deliveryDate: "Delivery by Oct 7, Wed",
    },
    quantity: 1,
  },
  {
    bouquet: {
      id: "classic-calicut-bridal",
      name: "Classic Calicut Bridal Bouquet",
      subtitle: "Fresh flower arrangement",
      price: 2809,
      originalPrice: 4990,
      image: "/images/farm-hand-bouquet-large.jpg",
      rating: 4.4,
      deliveryDate: "Delivery by Oct 8, Thu",
    },
    quantity: 1,
  },
];

export default function CartPage() {
  const router = useRouter();
  const { items, updateQty, removeItem } = useCart();
  const { startCartCheckout } = useCheckout();
  const [mounted, setMounted] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [copied, setCopied] = useState(false);

  // Demo list state so fallback items can be removed interactively
  const [demoList, setDemoList] = useState(INITIAL_DEMO_ITEMS);

  // Address state (matching reference mockup)
  const [recipientName, setRecipientName] = useState("Sameesha");
  const [addressLine, setAddressLine] = useState("Kozhikode , Pantheeramkav");

  const [hasLoadedRealCart, setHasLoadedRealCart] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (items.length > 0) {
      setHasLoadedRealCart(true);
    }
  }, [items]);

  if (!mounted) return null;

  // Use actual cart items if available or if user loaded real cart; otherwise show demo list
  const isUsingRealCart = hasLoadedRealCart || items.length > 0;
  const displayItems = isUsingRealCart ? items : demoList;

  // Handle Remove Item
  const handleRemoveItem = (idx: number) => {
    if (isUsingRealCart) {
      removeItem(idx);
    } else {
      setDemoList((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  // Handle Quantity Change
  const handleQuantityChange = (idx: number, val: number) => {
    if (isUsingRealCart) {
      updateQty(idx, val);
    } else {
      setDemoList((prev) => {
        const next = [...prev];
        if (next[idx]) {
          next[idx] = { ...next[idx], quantity: val };
        }
        return next;
      });
    }
  };

  // Compute pricing totals
  const totalMRP = displayItems.reduce((acc, item) => {
    const orig = item.bouquet.originalPrice || item.bouquet.price * 1.35;
    return acc + Math.round(orig) * item.quantity;
  }, 0);

  const totalCurrentPrice = displayItems.reduce((acc, item) => {
    return acc + item.bouquet.price * item.quantity;
  }, 0);

  const totalDiscount = Math.max(0, totalMRP - totalCurrentPrice);
  const finalTotal = totalCurrentPrice;

  // Proceed to Checkout
  const handleProceedToCheckout = () => {
    const checkoutPayload = displayItems.map((item) => ({
      id: item.bouquet.id,
      slug: item.bouquet.id,
      name: item.bouquet.name,
      subtitle: item.bouquet.subtitle || "Fresh flower arrangement",
      category: "flower",
      price: item.bouquet.price,
      originalPrice: item.bouquet.originalPrice,
      image: item.bouquet.image,
      quantity: item.quantity,
    }));

    startCartCheckout(checkoutPayload);
    router.push("/payment");
  };

  const handleCopyCoupon = () => {
    setCouponCode("FLOWER10");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <main className={styles.mainContainer}>
        {/* Breadcrumb Navigation: Home > Flowers > Shopping Cart */}
        <Breadcrumb
          items={[
            { label: "Flowers", href: "/flower" },
            { label: "Shopping Cart" },
          ]}
        />

        {/* Centered Heading */}
        <div className={styles.headerBlock}>
          <h1 className={styles.pageTitle}>Your Floral Selection</h1>
          <p className={styles.pageSubtitle}>
            The flowers you love, gathered in one beautiful place.
          </p>
        </div>

        {displayItems.length === 0 ? (
          /* Empty Cart State */
          <div className={styles.emptyCartCard}>
            <div className={styles.emptyImageWrap}>
              <img
                src="/images/basket-gerberas.jpg"
                alt="Empty Flower Cart"
                className={styles.emptyFlowerImg}
              />
            </div>
            <h2 className={styles.emptyHeading}>Your Cart is Empty</h2>
            <p className={styles.emptyDescription}>
              Looks like your floral collection is waiting for something beautiful.
            </p>
            <Link href="/flower" className={styles.exploreFlowersBtn}>
              <span>Explore Flowers</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          /* 2-Column Cart Grid */
          <div className={styles.cartGrid}>
            {/* ================= LEFT COLUMN ================= */}
            <div className={styles.leftColumn}>
              {/* Deliver to Card */}
              <div className={styles.addressCard}>
                <div className={styles.addressInfo}>
                  <div className={styles.addressTopRow}>
                    <span className={styles.deliverToLabel}>Deliver to:</span>
                    <span className={styles.recipientName}>{recipientName}</span>
                    <span className={styles.homeBadge}>HOME</span>
                  </div>
                  <div className={styles.addressSubtext}>{addressLine}</div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const newName = prompt("Enter recipient name:", recipientName);
                    if (newName) setRecipientName(newName);
                    const newAddr = prompt("Enter delivery address:", addressLine);
                    if (newAddr) setAddressLine(newAddr);
                  }}
                  className={styles.changeAddressBtn}
                >
                  Change
                </button>
              </div>

              {/* Cart Items List */}
              {displayItems.map((item, idx) => {
                const origPrice =
                  item.bouquet.originalPrice ||
                  Math.round(item.bouquet.price * 1.45);
                const hasDiscount = origPrice > item.bouquet.price;
                const discountPercent = hasDiscount
                  ? Math.round(
                      ((origPrice - item.bouquet.price) / origPrice) * 100
                    )
                  : 0;

                return (
                  <article
                    key={`${item.bouquet.id}-${idx}`}
                    className={styles.cartItemCard}
                  >
                    <div className={styles.itemMainRow}>
                      {/* Left: Thumbnail & Quantity Select */}
                      <div className={styles.itemThumbCol}>
                        <img
                          src={item.bouquet.image}
                          alt={item.bouquet.name}
                          className={styles.productImage}
                        />

                        <div className={styles.qtyStepperWrap}>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(idx, Math.max(1, item.quantity - 1))}
                            className={styles.qtyStepperBtn}
                            disabled={item.quantity <= 1}
                            aria-label={`Decrease quantity of ${item.bouquet.name}`}
                          >
                            <Minus size={13} strokeWidth={2.4} />
                          </button>
                          <span className={styles.qtyValue}>{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(idx, item.quantity + 1)}
                            className={styles.qtyStepperBtn}
                            aria-label={`Increase quantity of ${item.bouquet.name}`}
                          >
                            <Plus size={13} strokeWidth={2.4} />
                          </button>
                        </div>
                      </div>

                      {/* Right: Product Details */}
                      <div className={styles.itemDetailsCol}>
                        <div className={styles.itemTitleRow}>
                          <h2 className={styles.productName}>
                            {item.bouquet.name}
                          </h2>
                        </div>

                        {/* Star Rating Badge */}
                        <div className={styles.ratingPill}>
                          <Star size={10} fill="#ffffff" color="#ffffff" />
                          <span>{item.bouquet.rating || 4.4}</span>
                        </div>

                        {/* Price Row */}
                        <div className={styles.priceRow}>
                          {discountPercent > 0 && (
                            <span className={styles.discountBadge}>
                              ↓ {discountPercent}%
                            </span>
                          )}

                          {discountPercent > 0 && (
                            <span className={styles.originalPrice}>
                              ₹{origPrice.toLocaleString("en-IN")}
                            </span>
                          )}

                          <span className={styles.currentPrice}>
                            ₹{item.bouquet.price.toLocaleString("en-IN")}
                          </span>

                          {discountPercent > 0 && (
                            <span className={styles.freeDeliveryText}>
                              Free Delivery
                            </span>
                          )}
                        </div>

                        <div className={styles.deliveryDate}>
                          {("deliveryDate" in item.bouquet &&
                            Boolean((item.bouquet as { deliveryDate?: string }).deliveryDate))
                            ? (item.bouquet as { deliveryDate?: string }).deliveryDate
                            : `Delivery by ${new Date(
                                Date.now() + (idx + 2) * 86400000
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                weekday: "short",
                              })}`}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions Row: REMOVE only (BUY THIS NOW removed) */}
                    <div className={styles.itemDivider}>
                      <div className={styles.itemActionsRow}>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className={styles.removeActionBtn}
                          aria-label={`Remove ${item.bouquet.name}`}
                        >
                          <Trash2 size={15} />
                          <span>REMOVE</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* ================= RIGHT COLUMN: PRICE DETAILS ================= */}
            <aside className={styles.summaryColumn}>
              <div className={styles.summaryCard}>
                <h3 className={styles.summaryHeader}>PRICE DETAILS</h3>

                <div className={styles.summaryRows}>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Product Price</span>
                    <span className={styles.summaryValue}>
                      ₹{totalMRP.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Discounts</span>
                    <span className={styles.greenValue}>
                      - ₹{totalDiscount.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Delivery Charges</span>
                    <div className={styles.freeDeliveryWrap}>
                      <span className={styles.strikethroughDelivery}>₹80</span>
                      <span className={styles.greenValue}>FREE</span>
                    </div>
                  </div>
                </div>

                <hr className={styles.dashedDivider} />

                {/* Coupon Box */}
                <div className={styles.couponBox}>
                  <input
                    type="text"
                    placeholder="Apply coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className={styles.couponInput}
                  />
                  <button
                    type="button"
                    onClick={handleCopyCoupon}
                    title="Copy sample code FLOWER10"
                    style={{ background: "none", border: "none", padding: 0 }}
                  >
                    {copied ? (
                      <Check size={18} color="#16a34a" />
                    ) : (
                      <Copy size={18} className={styles.couponIcon} />
                    )}
                  </button>
                </div>

                <hr className={styles.solidDivider} />

                {/* Total Amount Row */}
                <div className={styles.totalRow}>
                  <span>Total Amount</span>
                  <span className={styles.totalPriceBig}>
                    ₹{finalTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Master Checkout button */}
              <button
                type="button"
                onClick={handleProceedToCheckout}
                className={styles.checkoutMasterBtn}
              >
                Checkout
              </button>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
