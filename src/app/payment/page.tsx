"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import { useCheckout } from "@/context/CheckoutContext";
import { useCart } from "@/context/CartContext";
import {
  Smartphone,
  CreditCard,
  Building2,
  Star,
  Lock,
  CheckCircle2,
  AlertCircle,
  Truck,
} from "lucide-react";
import styles from "./payment.module.css";

type PaymentTabType = "upi" | "card" | "netbanking";

const KERALA_CITIES = [
  "Kozhikode (Calicut)",
  "Kochi (Cochin)",
  "Thiruvananthapuram",
  "Thrissur",
  "Kannur",
  "Kollam",
  "Palakkad",
  "Alappuzha",
  "Malappuram",
  "Kottayam",
  "Wayanad",
];

const POPULAR_BANKS = [
  "HDFC Bank",
  "State Bank of India (SBI)",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "Federal Bank",
  "Punjab National Bank",
  "Bank of Baroda",
];

export default function SinglePageCheckoutPayment() {
  const router = useRouter();
  const { clearCart } = useCart();
  const {
    checkoutItem,
    checkoutItems,
    completeOrder,
  } = useCheckout();

  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delivery Form State
  const [senderName, setSenderName] = useState("");
  const [senderMobile, setSenderMobile] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  
  const [receiverName, setReceiverName] = useState("");
  const [receiverMobile, setReceiverMobile] = useState("");
  const [houseBuilding, setHouseBuilding] = useState("");
  const [street, setStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("Kozhikode (Calicut)");
  const [state, setState] = useState("Kerala");
  const [pinCode, setPinCode] = useState("673602");

  // Payment Method State
  const [activeTab, setActiveTab] = useState<PaymentTabType>("card");
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [upiId, setUpiId] = useState("");
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(true);
  const [appliedCouponCode, setAppliedCouponCode] = useState("OCCASIONS");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(
    "Default discount ₹100.00 applied!"
  );

  // Load cart / product items or fallback to mockup reference
  const primaryItem =
    checkoutItems.length > 0
      ? checkoutItems[0]
      : checkoutItem || {
          id: "sunshine-rose-basket",
          name: "Sunshine Golden Rose Basket",
          subtitle: "Premium Preserved Roses · Limited Edition",
          price: 649,
          originalPrice: 749,
          image: "/images/artisanal-flower-basket.jpg",
          quantity: 1,
        };

  const quantity = primaryItem.quantity || 1;
  const unitPrice = primaryItem.price;
  const subtotal = unitPrice * quantity;

  // Delivery check state
  const [deliveryStatus, setDeliveryStatus] = useState<{
    loading: boolean;
    serviceable: boolean | null;
    distance_km: number | null;
    delivery_charge: number | null;
    area: string | null;
    district: string | null;
    message: string | null;
  }>({
    loading: false,
    serviceable: null,
    distance_km: null,
    delivery_charge: null,
    area: null,
    district: null,
    message: null,
  });

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkDeliveryPin = useCallback((pin: string) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    const cleanPin = pin.replace(/\D/g, "");

    if (cleanPin.length !== 6) {
      setDeliveryStatus({
        loading: false,
        serviceable: null,
        distance_km: null,
        delivery_charge: null,
        area: null,
        district: null,
        message: cleanPin.length > 0 ? "Please enter a valid 6-digit PIN code." : null,
      });
      return;
    }

    setDeliveryStatus((prev) => ({ ...prev, loading: true }));

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/delivery/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pinCode: cleanPin }),
        });
        const data = await res.json();
        setDeliveryStatus({
          loading: false,
          serviceable: data.serviceable,
          distance_km: data.distance_km,
          delivery_charge: data.delivery_charge,
          area: data.area,
          district: data.district,
          message: data.message,
        });
      } catch {
        setDeliveryStatus({
          loading: false,
          serviceable: false,
          distance_km: null,
          delivery_charge: null,
          area: null,
          district: null,
          message:
            "Sorry, delivery is not available to this location. Please enter another delivery location.",
        });
      }
    }, 350);
  }, []);

  // Check initial PIN code on mount
  useEffect(() => {
    setMounted(true);
    if (pinCode && pinCode.length === 6) {
      checkDeliveryPin(pinCode);
    }
  }, [checkDeliveryPin]);

  // Compute discount and final total with verified delivery charge
  const discountAmount = couponApplied ? 100 : 0;
  const deliveryCharge =
    deliveryStatus.serviceable && deliveryStatus.delivery_charge !== null
      ? deliveryStatus.delivery_charge
      : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount + deliveryCharge);

  // Format Card Number into groups of 4
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
    setCardNumber(formatted);
  };

  // Format Expiry as MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setCardExpiry(raw);
  };

  // Apply Coupon Logic
  const handleApplyCoupon = (e: React.MouseEvent) => {
    e.preventDefault();
    const clean = couponCode.trim().toUpperCase();

    if (!clean) {
      setCouponError("Please enter a coupon code.");
      setCouponSuccess(null);
      return;
    }

    if (
      clean === "OCCASIONS" ||
      clean === "OCCASIONS10" ||
      clean === "SAVE100" ||
      clean === "WELCOME" ||
      clean === "FLOWER10"
    ) {
      setCouponApplied(true);
      setAppliedCouponCode(clean);
      setCouponError(null);
      setCouponSuccess(`Coupon '${clean}' applied successfully!`);
    } else {
      setCouponError("Invalid coupon code. Try 'OCCASIONS' or 'SAVE100'.");
      setCouponSuccess(null);
    }
  };

  // Master Form Submission (Delivery + Payment)
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // Specific payment validations
    if (activeTab === "card") {
      const cleanDigits = cardNumber.replace(/\D/g, "");
      if (cleanDigits.length < 15) {
        alert("Please enter a valid 16-digit card number.");
        return;
      }
      if (!cardExpiry.includes("/") || cardExpiry.length < 5) {
        alert("Please enter a valid card expiry date (MM/YY).");
        return;
      }
      if (cardCvv.length < 3) {
        alert("Please enter a valid 3-digit CVV.");
        return;
      }
    }

    if (deliveryStatus.serviceable === false) {
      alert(
        deliveryStatus.message ||
          "Sorry, delivery is not available to this location. Please enter another delivery location."
      );
      return;
    }

    setIsSubmitting(true);

    const deliveryPayload = {
      senderName,
      senderMobile: `+91 ${senderMobile}`,
      senderEmail,
      receiverName,
      receiverMobile: `+91 ${receiverMobile}`,
      houseBuilding,
      street,
      landmark,
      city,
      state,
      pinCode,
    };

    const paymentPayload = {
      type: activeTab,
      bank: activeTab === "netbanking" ? selectedBank : undefined,
      upiId: activeTab === "upi" ? upiId : undefined,
      cardholder: activeTab === "card" ? cardHolder : undefined,
      cardLast4:
        activeTab === "card"
          ? cardNumber.replace(/\s/g, "").slice(-4)
          : undefined,
    };

    try {
      // POST to /api/orders
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          delivery: deliveryPayload,
          paymentMethod: paymentPayload,
          couponCode: couponApplied ? appliedCouponCode : null,
          total: finalTotal,
          items: (checkoutItems.length > 0 ? checkoutItems : [primaryItem]).map((it: any) => ({
            id: it.id,
            productId: it.id,
            name: it.name,
            quantity: it.quantity || 1,
            price: it.price,
            image: it.image,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(
          data.error ||
            "Sorry, delivery is not available to this location. Please enter another delivery location."
        );
        setIsSubmitting(false);
        return;
      }

      // Trigger Context completion
      const paymentMethodTitle =
        activeTab === "upi"
          ? "UPI"
          : activeTab === "card"
          ? "Credit / Debit Card"
          : `Net Banking (${selectedBank})`;

      completeOrder(paymentMethodTitle);
      clearCart();

      // Simulated Razorpay Gateway Handoff (0.8s)
      setTimeout(() => {
        setIsSubmitting(false);
        const orderIdParam = data.orderId ? `?orderId=${data.orderId}` : "";
        router.push(`/order-success${orderIdParam}`);
      }, 800);
    } catch (err) {
      console.error("Order submission error:", err);
      // Fallback completion even if fetch errors
      completeOrder("Online Payment");
      clearCart();
      setIsSubmitting(false);
      router.push("/order-success");
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <main className={styles.mainContainer}>
        {/* Breadcrumb Navigation: Home > Flowers > Delivery Information */}
        <Breadcrumb
          items={[
            { label: "Flowers", href: "/flower" },
            { label: "Delivery Information" },
          ]}
        />

        {/* Centered Heading */}
        <div className={styles.headerSection}>
          <h1 className={styles.pageTitle}>Delivery Information</h1>
          <p className={styles.pageSubtitle}>
            Where should we deliver your golden roses?
          </p>
        </div>

        {/* Unified Checkout Form */}
        <form onSubmit={handleSubmitOrder} className={styles.checkoutGrid}>
          {/* ================= LEFT COLUMN ================= */}
          <div className={styles.leftColumn}>
            {/* Sender Details */}
            <div className={styles.sectionHeader} style={{ marginTop: 0 }}>
              <h2 className={styles.sectionTitle}>Sender Details</h2>
            </div>
            
            <div className={`${styles.formRow} ${styles.threeCols}`}>
              <div className={styles.fieldGroup}>
                <label htmlFor="senderName" className={styles.fieldLabel}>
                  Sender Name
                </label>
                <input
                  id="senderName"
                  type="text"
                  required
                  placeholder="Your full name"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className={styles.inputField}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="senderMobile" className={styles.fieldLabel}>
                  Sender Mobile
                </label>
                <div className={styles.phoneInputWrapper}>
                  <span className={styles.phonePrefix}>+91</span>
                  <input
                    id="senderMobile"
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit mobile"
                    pattern="[6-9][0-9]{9}"
                    title="Enter a valid 10-digit Indian mobile number"
                    value={senderMobile}
                    onChange={(e) =>
                      setSenderMobile(e.target.value.replace(/\D/g, ""))
                    }
                    className={styles.phoneInputField}
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="senderEmail" className={styles.fieldLabel}>
                  Email Address
                </label>
                <input
                  id="senderEmail"
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  className={styles.inputField}
                />
              </div>
            </div>

            <hr className={styles.divider} />

            {/* Receiver Details */}
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Receiver Details & Address</h2>
            </div>

            <div className={`${styles.formRow} ${styles.twoCols}`}>
              <div className={styles.fieldGroup}>
                <label htmlFor="receiverName" className={styles.fieldLabel}>
                  Receiver Name
                </label>
                <input
                  id="receiverName"
                  type="text"
                  required
                  placeholder="Recipient's full name"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  className={styles.inputField}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="receiverMobile" className={styles.fieldLabel}>
                  Receiver Mobile
                </label>
                <div className={styles.phoneInputWrapper}>
                  <span className={styles.phonePrefix}>+91</span>
                  <input
                    id="receiverMobile"
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit mobile"
                    pattern="[6-9][0-9]{9}"
                    title="Enter a valid 10-digit Indian mobile number"
                    value={receiverMobile}
                    onChange={(e) =>
                      setReceiverMobile(e.target.value.replace(/\D/g, ""))
                    }
                    className={styles.phoneInputField}
                  />
                </div>
              </div>
            </div>

            <div className={`${styles.formRow} ${styles.threeCols}`}>
              <div className={styles.fieldGroup}>
                <label htmlFor="houseBuilding" className={styles.fieldLabel}>
                  House / Building Name
                </label>
                <input
                  id="houseBuilding"
                  type="text"
                  required
                  placeholder="Flat, House no., Apartment name"
                  value={houseBuilding}
                  onChange={(e) => setHouseBuilding(e.target.value)}
                  className={styles.inputField}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="street" className={styles.fieldLabel}>
                  Street
                </label>
                <input
                  id="street"
                  type="text"
                  required
                  placeholder="Street, Area name"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className={styles.inputField}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="landmark" className={styles.fieldLabel}>
                  Landmark
                </label>
                <input
                  id="landmark"
                  type="text"
                  placeholder="Near something (optional)"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className={styles.inputField}
                />
              </div>
            </div>

            <div className={`${styles.formRow} ${styles.threeCols}`}>
              <div className={styles.fieldGroup}>
                <label htmlFor="city" className={styles.fieldLabel}>
                  City
                </label>
                <select
                  id="city"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={styles.selectField}
                >
                  {KERALA_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="state" className={styles.fieldLabel}>
                  State
                </label>
                <input
                  id="state"
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className={styles.inputField}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="pinCode" className={styles.fieldLabel}>
                  PIN Code
                </label>
                <div className={styles.pinInputWrapper}>
                  <input
                    id="pinCode"
                    type="text"
                    required
                    maxLength={6}
                    pattern="[0-9]{6}"
                    title="Enter 6-digit postal PIN code"
                    placeholder="6 digits"
                    value={pinCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setPinCode(val);
                      checkDeliveryPin(val);
                    }}
                    className={`${styles.inputField} ${
                      deliveryStatus.serviceable === true
                        ? styles.inputSuccess
                        : deliveryStatus.serviceable === false
                        ? styles.inputError
                        : ""
                    }`}
                  />
                  {deliveryStatus.loading && (
                    <span className={styles.pinLoadingSpinner}>…</span>
                  )}
                </div>

                {/* Serviceability feedback note */}
                {deliveryStatus.loading && (
                  <p className={styles.pinCheckingText}>
                    Checking delivery serviceability...
                  </p>
                )}


                {!deliveryStatus.loading && deliveryStatus.serviceable === false && (
                  <div className={styles.pinErrorText} role="alert">
                    <AlertCircle size={14} className={styles.feedbackIcon} />
                    <span>
                      {deliveryStatus.message ||
                        "Sorry, delivery is not available to this location. Please enter another delivery location."}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method Section */}
            <div className={styles.paymentSection}>
              <h2 className={styles.paymentHeading}>Payment Method</h2>
              <p className={styles.paymentSubnote}>
                All transactions are encrypted and secure.
              </p>

              {/* 3 Tabs: UPI, Card, Net Bank */}
              <div className={styles.paymentTabsRow}>
                <button
                  type="button"
                  onClick={() => setActiveTab("upi")}
                  className={`${styles.paymentTabBtn} ${
                    activeTab === "upi" ? styles.activeTabBtn : ""
                  }`}
                  aria-label="Pay with UPI"
                >
                  <Smartphone size={20} className={styles.tabIcon} />
                  <span>UPI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("card")}
                  className={`${styles.paymentTabBtn} ${
                    activeTab === "card" ? styles.activeTabBtn : ""
                  }`}
                  aria-label="Pay with Credit or Debit Card"
                >
                  <CreditCard size={20} className={styles.tabIcon} />
                  <span>Card</span>
                </button>
              </div>

              {/* White Rounded Card showing fields for active tab */}
              <div className={styles.paymentCardBox}>
                {activeTab === "card" && (
                  <div>
                    <h3 className={styles.cardBoxHeader}>Credit / Debit Card</h3>

                    <div className={styles.formRow}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Cardholder Name</label>
                        <input
                          type="text"
                          required={activeTab === "card"}
                          placeholder="Name printed on card"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          className={styles.inputField}
                        />
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Card Number</label>
                        <div className={styles.cardInputWithIcon}>
                          <input
                            type="text"
                            required={activeTab === "card"}
                            maxLength={19}
                            placeholder="4532 •••• •••• 8892"
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            className={styles.inputField}
                          />
                          <CreditCard size={18} className={styles.cardBrandIcon} />
                        </div>
                      </div>
                    </div>

                    <div className={`${styles.formRow} ${styles.twoCols}`}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Expiry</label>
                        <input
                          type="text"
                          required={activeTab === "card"}
                          maxLength={5}
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          className={styles.inputField}
                        />
                      </div>

                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>CVV</label>
                        <input
                          type="password"
                          required={activeTab === "card"}
                          maxLength={4}
                          placeholder="•••"
                          value={cardCvv}
                          onChange={(e) =>
                            setCardCvv(e.target.value.replace(/\D/g, ""))
                          }
                          className={styles.inputField}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "upi" && (
                  <div>
                    <h3 className={styles.upiBoxHeader}>Pay by any UPI App</h3>
                    <div className={styles.upiInterfaceWrapper}>
                      <div className={styles.qrBox}>
                        <div className={styles.qrImagePlaceholder}>
                          <div className={styles.showQrOverlay}>
                            <button type="button" className={styles.showQrBtn}>SHOW QR</button>
                          </div>
                        </div>
                      </div>
                      <div className={styles.upiAppsSection}>
                        <p className={styles.upiAppsText}>
                          Scan QR code with any upi app to proceed with payment of ₹{finalTotal}
                        </p>
                        <div className={styles.upiAppsGrid}>
                          <div className={styles.upiAppIcon}><img src="/images/phonepe.png" alt="PhonePe" /></div>
                          <div className={styles.upiAppIcon}><img src="/images/gpay.png" alt="GPay" /></div>
                          <div className={styles.upiAppIcon}><img src="/images/paytm.png" alt="Paytm" /></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: STICKY ORDER SUMMARY ================= */}
          <aside className={styles.orderSummaryCard}>
            <h2 className={styles.summaryTitle}>Order Summary</h2>

            {/* Product Thumbnail & Details */}
            <div className={styles.productSnippet}>
              <img
                src={primaryItem.image}
                alt={primaryItem.name}
                className={styles.productThumbnail}
              />
              <div className={styles.productMeta}>
                <h3 className={styles.productName}>{primaryItem.name}</h3>
                <p className={styles.productSubtitle}>
                  {primaryItem.subtitle || "Premium Preserved Roses · Limited Edition"}
                </p>
                <div className={styles.ratingRow}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className={styles.starFilled}
                    />
                  ))}
                  <span className={styles.reviewCount}>(126 reviews)</span>
                </div>
              </div>
            </div>

            {/* Breakdown Rows */}
            <div className={styles.breakdownList}>
              <div className={styles.breakdownRow}>
                <span>Price</span>
                <span className={styles.breakdownValue}>
                  ₹{unitPrice.toFixed(2)}
                </span>
              </div>
              <div className={styles.breakdownRow}>
                <span>Quantity</span>
                <span className={styles.breakdownValue}>x {quantity}</span>
              </div>
              <div className={styles.breakdownRow}>
                <span>Delivery Charge</span>
                <span className={styles.breakdownValue}>
                  {deliveryStatus.loading ? (
                    <span className={styles.calculatingText}>Calculating...</span>
                  ) : deliveryStatus.serviceable === false ? (
                    <span className={styles.unavailableText}>Unavailable</span>
                  ) : deliveryCharge === 0 ? (
                    <span className={styles.freeDeliveryBadge}>Free</span>
                  ) : (
                    `₹${deliveryCharge.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className={styles.breakdownRow}>
                <span>Subtotal</span>
                <span className={styles.breakdownValue}>
                  ₹{subtotal.toFixed(2)}
                </span>
              </div>
              <div className={styles.breakdownRow}>
                <span>Discount</span>
                <span className={`${styles.breakdownValue} ${styles.greenDiscount}`}>
                  - ₹{discountAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className={styles.summaryDivider} />

            {/* Total Row */}
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Total</span>
              <div className={styles.totalPriceBlock}>
                <div className={styles.priceWithStrikethrough}>
                  <span className={styles.strikethroughPrice}>
                    ₹{subtotal.toFixed(2)}
                  </span>
                  <span className={styles.finalPriceBold}>
                    ₹{finalTotal.toFixed(2)}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <span className={styles.savingsBadge}>
                    You save ₹{discountAmount.toFixed(2)}
                  </span>
                )}
              </div>
            </div>


            {/* Master Place Order Button */}
            <button
              type="submit"
              disabled={
                isSubmitting ||
                deliveryStatus.serviceable === false ||
                deliveryStatus.loading
              }
              className={styles.placeOrderBtn}
              title={
                deliveryStatus.serviceable === false
                  ? "Sorry, delivery is not available to this location. Please enter another delivery location."
                  : undefined
              }
            >
              {isSubmitting ? (
                <>
                  <div className={styles.spinner} />
                  <span>Processing Payment...</span>
                </>
              ) : deliveryStatus.serviceable === false ? (
                <span>Location Not Serviceable</span>
              ) : (
                <>
                  <Lock size={16} />
                  <span>Place Order</span>
                </>
              )}
            </button>
          </aside>
        </form>
      </main>

      <Footer />
    </div>
  );
}
