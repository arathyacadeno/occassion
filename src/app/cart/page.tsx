"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart, isLegacyDemoItem } from "@/context/CartContext";
import { useCheckout } from "@/context/CheckoutContext";
import { useAuth } from "@/context/AuthContext";
import { ADDON_PRODUCTS } from "@/components/RecommendedAddons";
import { CATALOG_PRODUCTS } from "@/data/catalog";
import { FLOWER_PRODUCTS } from "@/data/flowerProducts";
import { CartItem } from "@/types";
import {
  Trash2,
  Star,
  Minus,
  Plus,
  Lock,
  MapPin,
  Calendar,
  Clock,
  AlertCircle,
} from "lucide-react";
import DateModal from "@/components/DateModal";
import {
  resolveDeliverySchedule,
  SUNDAY_REASON_MESSAGE,
  parseDateString,
} from "@/lib/delivery/schedule";
import CartItemAddons from "@/components/CartItemAddons";
import styles from "./cart.module.css";

// Helper to determine if an item is a recommended add-on product
const isAddonProduct = (item: any) => {
  const id = item.bouquet?.id || "";
  const name = (item.bouquet?.name || "").toLowerCase();
  const subtitle = (item.bouquet?.subtitle || "").toLowerCase();
  return (
    id.startsWith("addon") ||
    subtitle.includes("addon") ||
    name.includes("soft toy") ||
    name.includes("ferrero") ||
    name.includes("cadbury") ||
    name.includes("black forest") ||
    ADDON_PRODUCTS.some(
      (a) => a.id === id || a.name.toLowerCase() === name
    )
  );
};

// Helper to resolve the product details page URL for any cart item
const getItemHref = (bouquet: any): string => {
  if (!bouquet) return "/flower-bouquets";
  if (bouquet.href) return bouquet.href;

  // Direct category and slug match
  if (bouquet.category && bouquet.slug) {
    if (
      [
        "flower",
        "cakes",
        "special-occasions",
        "our-highlights",
        "table-decor",
        "wreaths",
      ].includes(bouquet.category)
    ) {
      return `/${bouquet.category}/${bouquet.slug}`;
    }
    return `/flowers/${bouquet.category}/${bouquet.slug}`;
  }

  const bId = (bouquet.id || "").toLowerCase().trim();
  const bSlug = (bouquet.slug || "").toLowerCase().trim();
  const bName = (bouquet.name || "").toLowerCase().trim();

  // Find in CATALOG_PRODUCTS
  const catalogMatch = CATALOG_PRODUCTS.find((p) => {
    const pId = p.id.toLowerCase();
    const pSlug = p.slug.toLowerCase();
    const pName = p.name.toLowerCase().trim();
    if (bId && (pId === bId || pSlug === bId)) return true;
    if (bSlug && (pSlug === bSlug || pId === bSlug)) return true;
    if (bName && (pName === bName || pName.includes(bName) || bName.includes(pName)))
      return true;
    return false;
  });

  if (catalogMatch) {
    return `/${catalogMatch.category}/${catalogMatch.slug}`;
  }

  // Find in FLOWER_PRODUCTS
  const flowerMatch = FLOWER_PRODUCTS.find((p) => {
    const pId = p.id.toLowerCase();
    const pSlug = p.slug.toLowerCase();
    const pName = p.name.toLowerCase().trim();
    if (bId && (pId === bId || pSlug === bId)) return true;
    if (bSlug && (pSlug === bSlug || pId === bSlug)) return true;
    if (bName && (pName === bName || pName.includes(bName) || bName.includes(pName)))
      return true;
    return false;
  });

  if (flowerMatch) {
    return `/flowers/${flowerMatch.category}/${flowerMatch.slug}`;
  }

  if (bouquet.slug) {
    return `/flower/${bouquet.slug}`;
  }

  if (
    bId.includes("cake") ||
    bName.includes("cake") ||
    bName.includes("black forest")
  ) {
    return "/cakes";
  }
  if (
    bId.includes("wreath") ||
    bName.includes("wreath")
  ) {
    return "/wreaths";
  }
  if (bId.includes("table") || bName.includes("table")) {
    return "/table-decor";
  }
  if (
    bId.includes("garland") ||
    bName.includes("garland") ||
    bId.includes("basket") ||
    bName.includes("basket")
  ) {
    return "/flower-baskets";
  }

  return "/flower-bouquets";
};

interface GroupedCartItem {
  mainItem: any;
  mainIndex: number;
  addons: {
    item: any;
    originalIndex: number;
  }[];
}

export default function CartPage() {
  const router = useRouter();
  const { items, updateQty, removeItem, clearCart } = useCart();
  const { startCartCheckout } = useCheckout();
  const { user, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [couponCode, setCouponCode] = useState("");

  // Authenticated user address state (no dummy placeholder for guests)
  const [savedAddress, setSavedAddress] = useState<any | null>(null);

  // Delivery PIN code & calculation state
  const [pinCode, setPinCode] = useState<string>("");
  const [tempPin, setTempPin] = useState<string>("");
  const [deliveryStatus, setDeliveryStatus] = useState<any | null>(null);
  const [deliveryLoading, setDeliveryLoading] = useState<boolean>(false);
  const [isEditingPin, setIsEditingPin] = useState<boolean>(false);
  const [pinInputError, setPinInputError] = useState<string | null>(null);

  // Delivery Date state
  const [deliveryDate, setDeliveryDate] = useState<string>("");
  const [sundayCartNotice, setSundayCartNotice] = useState<string | null>(null);
  const [showDateModal, setShowDateModal] = useState<boolean>(false);

  // Initialize delivery date from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedDate = localStorage.getItem("occassions_delivery_date");
        if (storedDate) {
          const schedule = resolveDeliverySchedule(storedDate);
          setDeliveryDate(schedule.effectiveDate);
          if (schedule.wasAutoAdjusted) {
            setSundayCartNotice(schedule.reason || SUNDAY_REASON_MESSAGE);
            localStorage.setItem("occassions_delivery_date", schedule.effectiveDate);
          }
        }
      } catch {}
    }
  }, []);

  const handleConfirmDate = (date: string) => {
    const schedule = resolveDeliverySchedule(date);
    setDeliveryDate(schedule.effectiveDate);
    if (schedule.wasAutoAdjusted) {
      setSundayCartNotice(schedule.reason || SUNDAY_REASON_MESSAGE);
    } else {
      setSundayCartNotice(null);
    }
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("occassions_delivery_date", schedule.effectiveDate);
      } catch {}
    }
    setShowDateModal(false);
  };

  const handleClearDate = () => {
    setDeliveryDate("");
    setSundayCartNotice(null);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("occassions_delivery_date");
      } catch {}
    }
  };

  const formatDisplayDate = (dateStr?: string | null): string => {
    if (!dateStr) return "";
    const clean = dateStr.trim();
    if (!clean) return "";
    if (clean.toLowerCase().startsWith("delivery by ")) {
      return clean.slice(12);
    }
    try {
      const d = clean.includes("T")
        ? new Date(clean)
        : new Date(`${clean}T00:00:00`);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
      }
    } catch {}
    return clean;
  };

  const checkDeliveryPin = useCallback(async (pin: string) => {
    const cleanPin = (pin || "").replace(/\D/g, "").trim();
    if (cleanPin.length !== 6) {
      setDeliveryStatus(null);
      setDeliveryLoading(false);
      return;
    }
    setDeliveryLoading(true);
    try {
      const res = await fetch(`/api/delivery/check?pinCode=${cleanPin}`);
      const data = await res.json();
      setDeliveryStatus(data);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("occassions_delivery_pincode", cleanPin);
        } catch {}
      }
    } catch {
      setDeliveryStatus({
        serviceable: false,
        message: "Unable to check delivery charges. Please try again.",
      });
    } finally {
      setDeliveryLoading(false);
    }
  }, []);

  // Initialize PIN from savedAddress if available, or localStorage
  useEffect(() => {
    if (savedAddress?.pinCode) {
      const addrPin = String(savedAddress.pinCode).replace(/\D/g, "");
      if (addrPin.length === 6) {
        setPinCode(addrPin);
        setTempPin(addrPin);
        checkDeliveryPin(addrPin);
      }
    } else if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("occassions_delivery_pincode");
        if (stored && /^\d{6}$/.test(stored)) {
          setPinCode(stored);
          setTempPin(stored);
          checkDeliveryPin(stored);
        }
      } catch {}
    }
  }, [savedAddress, checkDeliveryPin]);

  const handleApplyPin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = tempPin.replace(/\D/g, "");
    if (clean.length !== 6) {
      setPinInputError("Please enter a valid 6-digit PIN code.");
      return;
    }
    setPinInputError(null);
    setPinCode(clean);
    setIsEditingPin(false);
    checkDeliveryPin(clean);
  };

  const handleClearPin = () => {
    setPinCode("");
    setTempPin("");
    setPinInputError(null);
    setDeliveryStatus(null);
    setIsEditingPin(true);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("occassions_delivery_pincode");
      } catch {}
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetch("/api/addresses", { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.addresses) && data.addresses.length > 0) {
            setSavedAddress(data.addresses[0]);
          } else {
            setSavedAddress(null);
          }
        })
        .catch(() => setSavedAddress(null));
    } else {
      setSavedAddress(null);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Display only real cart items added by the customer, strictly filtering out any legacy demo items
  const displayItems = useMemo(
    () => items.filter((item) => !isLegacyDemoItem(item)),
    [items]
  );

  // Group add-on items inside their preceding main product card
  const groupedCartItems = useMemo(() => {
    const groups: GroupedCartItem[] = [];
    let currentGroup: GroupedCartItem | null = null;

    displayItems.forEach((item, idx) => {
      if (isAddonProduct(item)) {
        if (currentGroup) {
          currentGroup.addons.push({ item, originalIndex: idx });
        } else if (groups.length > 0) {
          groups[groups.length - 1].addons.push({ item, originalIndex: idx });
        } else {
          const group: GroupedCartItem = {
            mainItem: item,
            mainIndex: idx,
            addons: [],
          };
          currentGroup = group;
          groups.push(group);
        }
      } else {
        const group: GroupedCartItem = {
          mainItem: item,
          mainIndex: idx,
          addons: [],
        };
        currentGroup = group;
        groups.push(group);
      }
    });

    return groups;
  }, [displayItems]);

  // Handle Remove Item
  const handleRemoveItem = (idx: number) => {
    removeItem(idx);
  };

  // Handle Remove Entire Group (Main item + attached add-ons)
  const handleRemoveGroup = (group: GroupedCartItem) => {
    const indicesToRemove = [group.mainIndex, ...group.addons.map((a) => a.originalIndex)].sort(
      (a, b) => b - a
    );
    indicesToRemove.forEach((idx) => removeItem(idx));
  };

  // Handle Quantity Change
  const handleQuantityChange = (idx: number, val: number) => {
    updateQty(idx, val);
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

  // Delivery charge based on customer location (null if no pin code added)
  const deliveryCharge = useMemo(() => {
    if (!pinCode || pinCode.length !== 6) return null;
    if (!deliveryStatus || deliveryStatus.serviceable === false) return null;
    if (typeof deliveryStatus.delivery_charge === "number") {
      return deliveryStatus.delivery_charge;
    }
    return null;
  }, [pinCode, deliveryStatus]);

  const finalTotal =
    totalCurrentPrice + (deliveryCharge !== null && deliveryCharge > 0 ? deliveryCharge : 0);

  const [pendingCheckoutAfterLogin, setPendingCheckoutAfterLogin] = useState(false);

  // Proceed to Checkout
  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      setPendingCheckoutAfterLogin(true);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("show-signin-modal"));
      }
      return;
    }

    if (deliveryDate && typeof window !== "undefined") {
      try {
        localStorage.setItem("occassions_delivery_date", deliveryDate);
      } catch {}
    }

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

  // If user signed in after clicking checkout, automatically proceed
  useEffect(() => {
    if (isAuthenticated && pendingCheckoutAfterLogin) {
      setPendingCheckoutAfterLogin(false);
      handleProceedToCheckout();
    }
  }, [isAuthenticated, pendingCheckoutAfterLogin]);

  if (!mounted) return null;

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <main className={styles.mainContainer}>
        {/* Centered Heading: displayed when cart has items */}
        {displayItems.length > 0 && (
          <div className={styles.headerBlock}>
            <div className={styles.headerTitleRow}>
              <h1 className={styles.pageTitle}>Your Floral Selection</h1>
            </div>
            <p className={styles.pageSubtitle}>
              The flowers you love, gathered in one beautiful place.
            </p>
          </div>
        )}

        {displayItems.length === 0 ? (
          /* Empty Cart State */
          <div className={styles.emptyCartCard}>
            <div className={styles.emptyImageWrap}>
              <img
                src="/images/empty-cart-box.png"
                alt="Empty gift box illustration"
                className={styles.emptyBoxImg}
              />
            </div>

            <h1 className={styles.emptyHeading}>Your Gift box is empty</h1>
            <p className={styles.emptyDescription}>
              Explore amazing gifts and share your feeling
            </p>

            <Link href="/#categories" className={styles.exploreGiftsBtn}>
              Explore Gifts
            </Link>
          </div>
        ) : (
          /* 2-Column Cart Grid */
          <div className={styles.cartGrid}>
            {/* ================= LEFT COLUMN ================= */}
            <div className={styles.leftColumn}>
              {/* Deliver to Card: Shown for both authenticated users and guests to check/set PIN code */}
              <div className={styles.addressCard}>
                {!isEditingPin && (savedAddress || pinCode) ? (
                  <>
                    <div className={styles.addressInfo}>
                      <div className={styles.addressTopRow}>
                        <MapPin size={16} color="#E40345" />
                        <span className={styles.deliverToLabel}>Deliver to:</span>
                        <span className={styles.recipientName}>
                          {savedAddress?.fullName || user?.name || (deliveryStatus?.area ? `${deliveryStatus.area}` : "Your Location")}
                        </span>
                        {savedAddress?.type && (
                          <span className={styles.homeBadge}>{savedAddress.type}</span>
                        )}
                        {pinCode && (
                          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#111827" }}>
                            - {pinCode}
                          </span>
                        )}
                      </div>
                      <div className={styles.addressSubtext}>
                        {savedAddress
                          ? [
                              savedAddress.house,
                              savedAddress.street,
                              savedAddress.city,
                              savedAddress.pinCode,
                            ]
                              .filter(Boolean)
                              .join(", ")
                          : deliveryStatus?.area
                          ? `${deliveryStatus.area}, ${deliveryStatus.district || deliveryStatus.state || "Kerala"}`
                          : "Delivery PIN code active"}
                      </div>
                      {/* Serviceability note */}
                      {deliveryLoading ? (
                        <div className={styles.pinServiceText}>
                          <span style={{ color: "#6b7280" }}>Checking delivery fee...</span>
                        </div>
                      ) : deliveryStatus && deliveryStatus.serviceable === false ? (
                        <div className={styles.pinServiceText}>
                          <span className={styles.pinServiceError}>
                            ✕ Delivery not available to PIN {pinCode}
                          </span>
                        </div>
                      ) : deliveryCharge !== null ? (
                        <div className={styles.pinServiceText}>
                          <span className={styles.pinServiceSuccess}>
                            ✓ Delivery available • {deliveryCharge === 0 ? "Free Delivery" : `₹${deliveryCharge} Delivery Charge`}
                          </span>
                        </div>
                      ) : null}

                      {/* Delivery Date Selection Row */}
                      <div className={styles.cartDeliveryDateRow}>
                        <div className={styles.cartDeliveryDateLeft}>
                          <Calendar size={15} color="#E40345" />
                          <span className={styles.cartDeliveryDateLabel}>Delivery Date:</span>
                          {deliveryDate ? (
                            <span className={styles.cartDeliveryDateValue}>
                              {formatDisplayDate(deliveryDate)}
                            </span>
                          ) : (
                            <span className={styles.cartDeliveryDateEmpty}>
                              Not selected
                            </span>
                          )}
                        </div>
                        <div className={styles.cartDeliveryDateActions}>
                          {deliveryDate ? (
                            <>
                              <button
                                type="button"
                                onClick={() => setShowDateModal(true)}
                                className={styles.selectDateBtn}
                              >
                                Change Date
                              </button>
                              <button
                                type="button"
                                onClick={handleClearDate}
                                className={styles.clearDateBtn}
                                title="Remove delivery date"
                              >
                                Remove
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setShowDateModal(true)}
                              className={styles.selectDateBtn}
                            >
                              <Calendar size={13} />
                              <span>Select Date</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Sunday Reschedule Reason Alert */}
                      {sundayCartNotice && (
                        <div className={styles.sundayCartNotice}>
                          <AlertCircle size={14} className={styles.sundayCartNoticeIcon} />
                          <span>
                            <strong>Order Rescheduled to Monday:</strong> {sundayCartNotice}
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingPin(true);
                        setTempPin(pinCode || "");
                      }}
                      className={styles.changeAddressBtn}
                    >
                      Change PIN
                    </button>
                  </>
                ) : (
                  /* Form to enter / update 6-digit PIN code */
                  <div className={styles.addressInfo} style={{ width: "100%" }}>
                    <div className={styles.addressTopRow}>
                      <MapPin size={16} color="#E40345" />
                      <span className={styles.deliverToLabel} style={{ fontWeight: 600, color: "#111827" }}>
                        {pinCode ? "Change Delivery PIN Code" : "Delivery Location PIN Code"}
                      </span>
                    </div>
                    <p className={styles.addressSubtext}>
                      {pinCode
                        ? "Enter a 6-digit PIN code to recalculate delivery fee based on your location"
                        : "Enter your PIN code to check delivery availability and calculate delivery fee"}
                    </p>
                    <form onSubmit={handleApplyPin} className={styles.pinForm}>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="Enter 6-digit PIN"
                        value={tempPin}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                          setTempPin(v);
                          if (pinInputError) setPinInputError(null);
                        }}
                        className={styles.pinInput}
                        aria-label="Delivery PIN Code"
                      />
                      <button type="submit" className={styles.pinApplyBtn} disabled={deliveryLoading}>
                        {deliveryLoading ? "Checking..." : "Apply"}
                      </button>
                      {pinCode && (
                        <button
                          type="button"
                          onClick={handleClearPin}
                          className={styles.pinClearBtn}
                          title="Clear PIN code (charge will be empty)"
                        >
                          Clear PIN
                        </button>
                      )}
                      {(savedAddress || pinCode) && isEditingPin && (
                        <button
                          type="button"
                          onClick={() => setIsEditingPin(false)}
                          className={styles.pinClearBtn}
                        >
                          Cancel
                        </button>
                      )}
                    </form>
                    {pinInputError && (
                      <span style={{ fontSize: "0.8rem", color: "#e11d48", marginTop: "2px" }}>
                        {pinInputError}
                      </span>
                    )}
                    {deliveryStatus && deliveryStatus.serviceable === false && (
                      <span style={{ fontSize: "0.8rem", color: "#e11d48", marginTop: "2px" }}>
                        {deliveryStatus.message || "Sorry, delivery is not available to this location."}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Cart Items List: Groups Main Product and its Add-ons */}
              {groupedCartItems.map((group) => {
                const item = group.mainItem;
                const idx = group.mainIndex;
                const effectiveDeliveryDate =
                  item.deliveryDate ||
                  (item.bouquet as { deliveryDate?: string }).deliveryDate ||
                  deliveryDate;
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
                    {/* Main Product Row */}
                    <div className={styles.itemMainRow}>
                      {/* Left: Thumbnail & Quantity Stepper */}
                      <div className={styles.itemThumbCol}>
                        <Link
                          href={getItemHref(item.bouquet)}
                          className={styles.itemImageLink}
                          title={`View details for ${item.bouquet.name}`}
                        >
                          <img
                            src={item.bouquet.image}
                            alt={item.bouquet.name}
                            className={styles.productImage}
                          />
                        </Link>

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
                          <Link
                            href={getItemHref(item.bouquet)}
                            className={styles.itemTitleLink}
                            title={`View details for ${item.bouquet.name}`}
                          >
                            <h2 className={styles.productName}>
                              {item.bouquet.name}
                            </h2>
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleRemoveGroup(group)}
                            className={styles.removeActionBtn}
                            aria-label={`Remove ${item.bouquet.name}`}
                          >
                            <Trash2 size={15} />
                            <span>REMOVE</span>
                          </button>
                        </div>

                        {/* Star Rating Badge */}
                        <div className={styles.ratingPill}>
                          <Star size={10} fill="#ffffff" color="#ffffff" />
                          <span>{Number(item.bouquet.rating || 4.4).toFixed(1)}</span>
                        </div>

                        {/* Price Row */}
                        <div className={styles.priceRow}>
                          <span className={styles.currentPrice}>
                            ₹{(item.bouquet.price * item.quantity).toLocaleString("en-IN")}
                          </span>
                        </div>

                        {/* Delivery Date: Only show when entered/selected by user */}
                        {effectiveDeliveryDate ? (
                          <div className={styles.deliveryDate}>
                            <Calendar size={13} color="#E40345" />
                            <span>Delivery by {formatDisplayDate(effectiveDeliveryDate)}</span>
                            <button
                              type="button"
                              onClick={() => setShowDateModal(true)}
                              className={styles.inlineChangeDateBtn}
                              title="Change delivery date"
                            >
                              Change
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setShowDateModal(true)}
                            className={styles.inlineSelectDateBtn}
                            title="Select delivery date"
                          >
                            <Calendar size={13} />
                            <span>Select Delivery Date</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Nested Add-on Products Section (rendered inside main card) */}
                    {group.addons.length > 0 && (
                      <div className={styles.addonSection}>
                        {group.addons.map(({ item: addonItem, originalIndex: addonIdx }) => {
                          const addonOrig =
                            addonItem.bouquet.originalPrice ||
                            Math.round(addonItem.bouquet.price * 1.45);
                          const addonHasDiscount = addonOrig > addonItem.bouquet.price;
                          const addonDiscount = addonHasDiscount
                            ? Math.round(
                              ((addonOrig - addonItem.bouquet.price) / addonOrig) * 100
                            )
                            : 0;

                          return (
                            <div
                              key={`${addonItem.bouquet.id}-${addonIdx}`}
                              className={styles.addonRow}
                            >
                              <div className={styles.addonThumbCol}>
                                <Link
                                  href={getItemHref(addonItem.bouquet)}
                                  className={styles.itemImageLink}
                                  title={`View details for ${addonItem.bouquet.name}`}
                                >
                                  <img
                                    src={addonItem.bouquet.image}
                                    alt={addonItem.bouquet.name}
                                    className={styles.addonImage}
                                  />
                                </Link>

                                <div className={styles.qtyStepperWrap}>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleQuantityChange(
                                        addonIdx,
                                        Math.max(1, addonItem.quantity - 1)
                                      )
                                    }
                                    className={styles.qtyStepperBtn}
                                    disabled={addonItem.quantity <= 1}
                                    aria-label={`Decrease quantity of ${addonItem.bouquet.name}`}
                                  >
                                    <Minus size={12} strokeWidth={2.4} />
                                  </button>
                                  <span className={styles.qtyValue}>
                                    {addonItem.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleQuantityChange(
                                        addonIdx,
                                        addonItem.quantity + 1
                                      )
                                    }
                                    className={styles.qtyStepperBtn}
                                    aria-label={`Increase quantity of ${addonItem.bouquet.name}`}
                                  >
                                    <Plus size={12} strokeWidth={2.4} />
                                  </button>
                                </div>
                              </div>

                              <div className={styles.addonDetailsCol}>
                                <div className={styles.addonTitleRow}>
                                  <Link
                                    href={getItemHref(addonItem.bouquet)}
                                    className={styles.itemTitleLink}
                                    title={`View details for ${addonItem.bouquet.name}`}
                                  >
                                    <h3 className={styles.addonName}>
                                      {addonItem.bouquet.name}
                                    </h3>
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveItem(addonIdx)}
                                    className={styles.addonRemoveBtn}
                                    aria-label={`Remove add-on ${addonItem.bouquet.name}`}
                                    title="Remove add-on"
                                  >
                                    <Trash2 size={13} />
                                    <span>REMOVE</span>
                                  </button>
                                </div>

                                <div className={styles.ratingPill}>
                                  <Star size={9} fill="#ffffff" color="#ffffff" />
                                  <span>{Number(addonItem.bouquet.rating || 5).toFixed(1)}</span>
                                </div>

                                <div className={styles.priceRow}>
                                  <span className={styles.currentPrice}>
                                    ₹{(addonItem.bouquet.price * addonItem.quantity).toLocaleString("en-IN")}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Make It Extra Special! Add-ons Section */}
                    <CartItemAddons attachedAddons={group.addons} />
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
                      ₹{totalCurrentPrice.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Delivery Charges</span>
                    {deliveryLoading ? (
                      <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>Calculating...</span>
                    ) : deliveryCharge === null ? (
                      <span className={styles.deliveryEmptyText}>--</span>
                    ) : deliveryCharge === 0 ? (
                      <span className={styles.greenValue}>FREE</span>
                    ) : (
                      <span className={styles.summaryValue}>
                        ₹{deliveryCharge.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
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
              {!isAuthenticated && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    marginTop: "10px",
                    fontSize: "0.82rem",
                    color: "#64748b",
                  }}
                >
                  <Lock size={13} color="#94a3b8" />
                  <span>Login details requested at checkout</span>
                </div>
              )}
            </aside>
          </div>
        )}
      </main>

      {/* Date Modal for selecting delivery date */}
      <DateModal
        isOpen={showDateModal}
        onClose={() => setShowDateModal(false)}
        selectedDate={deliveryDate}
        onConfirm={handleConfirmDate}
      />

      <Footer />
    </div>
  );
}
