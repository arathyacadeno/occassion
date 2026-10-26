"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import TimeSlotModal from "@/components/TimeSlotModal";
import DateModal from "@/components/DateModal";
import { useCheckout } from "@/context/CheckoutContext";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import Script from "next/script";
import { loadRazorpayScript } from "@/components/RazorpayPayButton";
import {
  Smartphone,
  CreditCard,
  Building2,
  Star,
  Lock,
  CheckCircle2,
  AlertCircle,
  Truck,
  ChevronDown,
  Clock,
  Calendar,
  MapPin,
  Home,
  Plus,
  ExternalLink,
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
  const { user, isAuthenticated } = useAuth();
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
  const [senderHouseBuilding, setSenderHouseBuilding] = useState("");
  const [senderStreet, setSenderStreet] = useState("");
  const [senderLandmark, setSenderLandmark] = useState("");
  const [senderCity, setSenderCity] = useState("Kozhikode (Calicut)");
  const [senderState, setSenderState] = useState("Kerala");
  const [senderPinCode, setSenderPinCode] = useState("673602");

  const [receiverName, setReceiverName] = useState("");
  const [receiverMobile, setReceiverMobile] = useState("");
  const [houseBuilding, setHouseBuilding] = useState("");
  const [street, setStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("Kozhikode (Calicut)");
  const [state, setState] = useState("Kerala");
  const [pinCode, setPinCode] = useState("673602");

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [saveToProfile, setSaveToProfile] = useState<boolean>(true);
  const [loadingAddresses, setLoadingAddresses] = useState<boolean>(false);

  const handleSelectSavedAddress = (addr: any) => {
    setSelectedAddressId(addr.id);
    setReceiverName(addr.fullName || "");
    setReceiverMobile((addr.phone || "").replace(/^\+91\s*/, ""));
    setHouseBuilding(addr.house || "");
    setStreet(addr.street || "");
    setLandmark(addr.area || "");
    setCity(addr.city || "Kozhikode (Calicut)");
    setState(addr.state || "Kerala");
    setPinCode(addr.pinCode || "673602");
    if (addr.pinCode) {
      checkDeliveryPin(addr.pinCode);
    }
  };

  const handleUseNewAddress = () => {
    setSelectedAddressId("new");
    setReceiverName("");
    setReceiverMobile("");
    setHouseBuilding("");
    setStreet("");
    setLandmark("");
    setCity("Kozhikode (Calicut)");
    setState("Kerala");
    setPinCode("673602");
    checkDeliveryPin("673602");
  };

  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [deliveryPrefError, setDeliveryPrefError] = useState<{ date?: string; time?: string } | null>(null);

  // Payment Method State
  const [activeTab, setActiveTab] = useState<PaymentTabType>("card");
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [upiId, setUpiId] = useState("");
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");
  const [showQrCode, setShowQrCode] = useState(false);

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [appliedCouponCode, setAppliedCouponCode] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

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

  const displayCheckoutItems =
    checkoutItems.length > 0 ? checkoutItems : [primaryItem];

  const totalItemCount = displayCheckoutItems.reduce(
    (acc, it) => acc + (it.quantity || 1),
    0
  );
  const subtotal = displayCheckoutItems.reduce(
    (acc, it) => acc + (it.price || 0) * (it.quantity || 1),
    0
  );
  const quantity = totalItemCount;
  const unitPrice = primaryItem.price;

  // Order summary dropdown expansion state
  const [showAllItems, setShowAllItems] = useState(false);
  const visibleCheckoutItems = showAllItems
    ? displayCheckoutItems
    : displayCheckoutItems.slice(0, 2);

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
    try {
      const storedPin = localStorage.getItem("occassions_delivery_pincode");
      if (storedPin && storedPin.length === 6) {
        setPinCode(storedPin);
        checkDeliveryPin(storedPin);
        return;
      }
    } catch {}
    if (pinCode && pinCode.length === 6) {
      checkDeliveryPin(pinCode);
    }
  }, [checkDeliveryPin]);

  // Auto-populate sender details from authenticated user profile
  useEffect(() => {
    if (user) {
      if (!senderName && user.name) {
        setSenderName(user.name);
      }
      if (!senderEmail && user.email && !user.email.endsWith("@phone.occasions.in")) {
        setSenderEmail(user.email);
      }
      if (!senderMobile && user.phone) {
        setSenderMobile(user.phone.replace(/^\+91\s*/, ""));
      }
    }
  }, [user]);

  // Load saved addresses and populate receiver details
  useEffect(() => {
    if (isAuthenticated) {
      setLoadingAddresses(true);
      fetch("/api/addresses", { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.success && Array.isArray(data.addresses) && data.addresses.length > 0) {
            setSavedAddresses(data.addresses);
            const defaultAddr = data.addresses.find((a: any) => a.isDefault) || data.addresses[0];
            if (defaultAddr) {
              setSelectedAddressId(defaultAddr.id);
              setReceiverName(defaultAddr.fullName || "");
              setReceiverMobile((defaultAddr.phone || "").replace(/^\+91\s*/, ""));
              setHouseBuilding(defaultAddr.house || "");
              setStreet(defaultAddr.street || "");
              setLandmark(defaultAddr.area || "");
              setCity(defaultAddr.city || "Kozhikode (Calicut)");
              setState(defaultAddr.state || "Kerala");
              setPinCode(defaultAddr.pinCode || "673602");
              if (defaultAddr.pinCode) {
                checkDeliveryPin(defaultAddr.pinCode);
              }
            }
          }
        })
        .catch((err) => console.warn("Failed to load saved addresses in payment:", err))
        .finally(() => setLoadingAddresses(false));
    }
  }, [isAuthenticated, checkDeliveryPin]);

  // Compute discount and final total with verified delivery charge
  const discountAmount = 0;
  const deliveryCharge =
    deliveryStatus.serviceable && deliveryStatus.delivery_charge !== null
      ? deliveryStatus.delivery_charge
      : 0;
  const finalTotal = subtotal + deliveryCharge;

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

    // Request login details if not authenticated at the final checkout stage
    if (!isAuthenticated) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("show-signin-modal"));
      }
      return;
    }

    // Specific payment validations
    if (activeTab === "card" && cardNumber.trim().length > 0) {
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

    // Delivery Preference validations (Mandatory Date & Time Slot)
    const prefErrors: { date?: string; time?: string } = {};
    if (!deliveryDate) {
      prefErrors.date = "Delivery date is mandatory. Please select a date.";
    }
    if (!deliveryTime) {
      prefErrors.time = "Delivery time slot is mandatory. Please select a time slot.";
    }

    if (prefErrors.date || prefErrors.time) {
      setDeliveryPrefError(prefErrors);
      const prefSection = document.getElementById("delivery-preference-section");
      if (prefSection) {
        prefSection.scrollIntoView({ behavior: "smooth", block: "center" });
      }
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
      deliveryDate,
      deliveryTime,
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

      // Trigger Context completion with real orderId & formatted delivery slot
      const paymentMethodTitle =
        activeTab === "upi"
          ? "UPI"
          : activeTab === "card"
            ? "Credit / Debit Card"
            : `Net Banking (${selectedBank})`;

      const formattedDelivery =
        deliveryDate && deliveryTime
          ? `${new Date(deliveryDate).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })} (${deliveryTime})`
          : undefined;

      // Sync address to user profile if logged in and saveToProfile is enabled
      if (isAuthenticated && saveToProfile) {
        try {
          const addrPayload = {
            fullName: receiverName,
            phone: `+91 ${receiverMobile}`,
            house: houseBuilding,
            street,
            area: landmark,
            city,
            state,
            pinCode,
            type: "Home",
            isDefault: savedAddresses.length === 0,
          };
          if (selectedAddressId && selectedAddressId !== "new") {
            fetch(`/api/addresses/${selectedAddressId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify(addrPayload),
            }).catch(() => { });
          } else {
            fetch("/api/addresses", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify(addrPayload),
            }).catch(() => { });
          }
        } catch (e) {
          console.warn("Could not sync address to profile:", e);
        }
      }

      // 1. Create Razorpay order on backend (/api/create-order)
      const rzpOrderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(finalTotal * 100), // amount in paise
          currency: "INR",
          receipt: `rcpt_${data.orderId}`,
          notes: {
            appOrderId: data.orderId,
          },
        }),
      });

      const rzpOrderData = await rzpOrderRes.json();
      if (!rzpOrderRes.ok || !rzpOrderData.order_id) {
        throw new Error(rzpOrderData.error || "Failed to initialize Razorpay payment order");
      }

      // 2. Ensure Razorpay checkout script is loaded
      await loadRazorpayScript();

      // 3. Open Razorpay Standard Checkout Modal
      const keyId =
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";

      const rzpOptions = {
        key: keyId,
        amount: rzpOrderData.amount,
        currency: rzpOrderData.currency,
        name: "Occasions Flowers & Gifts",
        description: "Floral Arrangement & Gift Delivery",
        order_id: rzpOrderData.order_id,
        prefill: {
          name: senderName || receiverName,
          email: senderEmail,
          contact: (senderMobile || receiverMobile || "").replace(/\D/g, "").slice(-10),
        },
        theme: {
          color: "#e11d48",
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
            console.log("Razorpay checkout modal closed by user");
          },
        },
        handler: async function (paymentResponse: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          try {
            // 4. Verify payment signature on backend (/api/verify-payment)
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
                app_order_id: data.orderId,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              alert(verifyData.error || "Payment signature verification failed. Please contact support.");
              setIsSubmitting(false);
              return;
            }

            // Successfully paid and verified!
            completeOrder(paymentMethodTitle, data.orderId, formattedDelivery);
            clearCart();
            setIsSubmitting(false);
            const orderIdParam = data.orderId ? `?orderId=${data.orderId}` : "";
            router.push(`/thank-you${orderIdParam}`);
          } catch (verErr: any) {
            console.error("Signature verification error:", verErr);
            alert(`Payment verification failed: ${verErr.message || "Failed to verify signature"}`);
            setIsSubmitting(false);
          }
        },
      };

      const rzp = new (window as any).Razorpay(rzpOptions);
      rzp.on("payment.failed", function (response: any) {
        console.error("Payment failed:", response.error);
        alert(`Payment failed: ${response.error?.description || "Transaction declined"}`);
        setIsSubmitting(false);
      });

      rzp.open();
    } catch (err: any) {
      console.error("Order submission error:", err);
      alert(`Payment error: ${err.message || "Could not process order"}`);
      setIsSubmitting(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className={styles.pageWrapper}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Navbar />

      <main className={styles.mainContainer}>
        {/* Breadcrumb Navigation: Home > Flowers > Delivery Information */}
        <Breadcrumb
          items={[
            { label: "Flowers", href: "/flower-bouquets" },
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
            {!isAuthenticated && (
              <div className={styles.authNoticeBanner}>
                <div className={styles.authNoticeLeft}>
                  <div className={styles.authNoticeIconWrap}>
                    <Lock size={18} className={styles.authNoticeIcon} />
                  </div>
                  <div>
                    <h3 className={styles.authNoticeTitle}>Checkout as Member or Guest</h3>
                    <p className={styles.authNoticeSub}>
                      Sign in to auto-fill your details, track real-time delivery, and earn rewards.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(new CustomEvent("show-signin-modal"));
                    }
                  }}
                  className={styles.authNoticeBtn}
                >
                  Sign In
                </button>
              </div>
            )}

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

            <div className={`${styles.formRow} ${styles.threeCols}`}>
              <div className={styles.fieldGroup}>
                <label htmlFor="senderHouseBuilding" className={styles.fieldLabel}>
                  House / Building Name
                </label>
                <input
                  id="senderHouseBuilding"
                  type="text"
                  required
                  placeholder="Flat, House no."
                  value={senderHouseBuilding}
                  onChange={(e) => setSenderHouseBuilding(e.target.value)}
                  className={styles.inputField}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="senderStreet" className={styles.fieldLabel}>
                  Street
                </label>
                <input
                  id="senderStreet"
                  type="text"
                  required
                  placeholder="Street, Area name"
                  value={senderStreet}
                  onChange={(e) => setSenderStreet(e.target.value)}
                  className={styles.inputField}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="senderLandmark" className={styles.fieldLabel}>
                  Landmark
                </label>
                <input
                  id="senderLandmark"
                  type="text"
                  placeholder="Near something (optional)"
                  value={senderLandmark}
                  onChange={(e) => setSenderLandmark(e.target.value)}
                  className={styles.inputField}
                />
              </div>
            </div>

            <div className={`${styles.formRow} ${styles.threeCols}`}>
              <div className={styles.fieldGroup}>
                <label htmlFor="senderCity" className={styles.fieldLabel}>
                  City
                </label>
                <select
                  id="senderCity"
                  required
                  value={senderCity}
                  onChange={(e) => setSenderCity(e.target.value)}
                  className={styles.selectField}
                >
                  {KERALA_CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="senderState" className={styles.fieldLabel}>
                  State
                </label>
                <input
                  id="senderState"
                  type="text"
                  required
                  value={senderState}
                  readOnly
                  className={`${styles.inputField} ${styles.readOnlyField}`}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="senderPinCode" className={styles.fieldLabel}>
                  PIN Code
                </label>
                <input
                  id="senderPinCode"
                  type="text"
                  required
                  maxLength={6}
                  pattern="[0-9]{6}"
                  title="6-digit PIN code"
                  placeholder="e.g. 673602"
                  value={senderPinCode}
                  onChange={(e) => setSenderPinCode(e.target.value.replace(/\D/g, ""))}
                  className={styles.inputField}
                />
              </div>
            </div>

            <hr className={styles.divider} />

            {/* Receiver Details */}
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Receiver Details & Address</h2>
            </div>

            {/* Saved Delivery Addresses Selector */}
            {savedAddresses.length > 0 && (
              <div className={styles.savedAddressSection}>
                <div className={styles.savedAddressHeader}>
                  <div className={styles.savedAddressTitle}>
                    <MapPin size={18} color="#e4004b" />
                    <span>Select Saved Delivery Address</span>
                  </div>
                  <Link href="/profile" className={styles.savedAddressManageLink}>
                    <span>Manage in Profile</span>
                    <ExternalLink size={13} />
                  </Link>
                </div>

                <div className={styles.savedAddressGrid}>
                  {savedAddresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => handleSelectSavedAddress(addr)}
                        className={`${styles.savedAddressCard} ${isSelected ? styles.savedAddressCardActive : ""
                          }`}
                      >
                        <div className={styles.savedAddressCardTop}>
                          <span className={styles.savedAddressBadge}>
                            {addr.type || "Home"} {addr.isDefault ? "• Default" : ""}
                          </span>
                          <input
                            type="radio"
                            name="selectedSavedAddress"
                            checked={isSelected}
                            onChange={() => handleSelectSavedAddress(addr)}
                            className={styles.savedAddressRadio}
                          />
                        </div>
                        <p className={styles.savedAddressName}>{addr.fullName}</p>
                        <p className={styles.savedAddressText}>
                          {addr.house}, {addr.street}
                          {addr.area ? `, ${addr.area}` : ""}
                        </p>
                        <p className={styles.savedAddressText}>
                          {addr.city}, {addr.state} - {addr.pinCode}
                        </p>
                        <p className={styles.savedAddressPhone}>{addr.phone}</p>
                      </div>
                    );
                  })}

                  <div
                    onClick={handleUseNewAddress}
                    className={`${styles.savedAddressCard} ${styles.newAddressCard} ${selectedAddressId === "new" ? styles.newAddressCardActive : ""
                      }`}
                  >
                    <Plus size={16} />
                    <span>Enter New Address</span>
                  </div>
                </div>
              </div>
            )}

            <div style={{ backgroundColor: "#fdf2f5", padding: "12px 16px", borderRadius: "8px", marginBottom: "24px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.95rem", cursor: "pointer", color: "#3b2a22", fontWeight: 500 }}>
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setReceiverName(senderName);
                      setReceiverMobile(senderMobile);
                      setHouseBuilding(senderHouseBuilding);
                      setStreet(senderStreet);
                      setLandmark(senderLandmark);
                      setCity(senderCity);
                      setState(senderState);
                      setPinCode(senderPinCode);
                    } else {
                      setReceiverName("");
                      setReceiverMobile("");
                      setHouseBuilding("");
                      setStreet("");
                      setLandmark("");
                      setCity("Kozhikode (Calicut)");
                      setState("Kerala");
                      setPinCode("673602");
                    }
                  }}
                  style={{ accentColor: "#e4004b", width: "18px", height: "18px", cursor: "pointer" }}
                />
                Same as Sender
              </label>
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
                    className={`${styles.inputField} ${deliveryStatus.serviceable === true
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

            {isAuthenticated && (
              <label className={styles.saveAddressCheckboxRow}>
                <input
                  type="checkbox"
                  checked={saveToProfile}
                  onChange={(e) => setSaveToProfile(e.target.checked)}
                  style={{ accentColor: "#e4004b", width: "18px", height: "18px", cursor: "pointer" }}
                />
                <span>Save / update this delivery address in My Profile for express checkout next time</span>
              </label>
            )}

            {/* Delivery Date & Time (Mandatory) */}
            <div id="delivery-preference-section" className={styles.deliveryTimeSection}>
              <h2 className={styles.deliveryTimeHeading}>
                Delivery Preference <span className={styles.requiredStar}>*</span>
              </h2>
              <div className={styles.deliveryDropdownsRow}>
                <div className={styles.deliveryDropdownCol}>
                  <label className={styles.dropdownLabel}>
                    Delivery Date <span className={styles.requiredStar}>*</span>
                  </label>
                  <div
                    className={`${styles.dropdownPill} ${deliveryPrefError?.date ? styles.dropdownPillError : ""
                      }`}
                    onClick={() => {
                      setShowDateModal(true);
                      if (deliveryPrefError?.date) {
                        setDeliveryPrefError((prev) => (prev ? { ...prev, date: undefined } : null));
                      }
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <div className={styles.dropdownSelect} style={{ display: "flex", alignItems: "center" }}>
                      {deliveryDate
                        ? new Date(deliveryDate).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                        : "Select Date"}
                    </div>
                    <Calendar size={14} className={styles.dropdownChevron} />
                  </div>
                  {deliveryPrefError?.date && (
                    <span className={styles.fieldErrorText}>
                      <AlertCircle size={13} />
                      {deliveryPrefError.date}
                    </span>
                  )}
                </div>

                <div className={styles.deliveryDropdownCol}>
                  <label className={styles.dropdownLabel}>
                    Delivery Time Slot <span className={styles.requiredStar}>*</span>
                  </label>
                  <div
                    className={`${styles.dropdownPill} ${deliveryPrefError?.time ? styles.dropdownPillError : ""
                      }`}
                    onClick={() => {
                      setShowTimeSlotModal(true);
                      if (deliveryPrefError?.time) {
                        setDeliveryPrefError((prev) => (prev ? { ...prev, time: undefined } : null));
                      }
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <div className={styles.dropdownSelect} style={{ display: "flex", alignItems: "center" }}>
                      {deliveryTime ? deliveryTime : "Select Time"}
                    </div>
                    <Clock size={14} className={styles.dropdownChevron} />
                  </div>
                  {deliveryPrefError?.time && (
                    <span className={styles.fieldErrorText}>
                      <AlertCircle size={13} />
                      {deliveryPrefError.time}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Time Slot Modal */}
            <TimeSlotModal
              isOpen={showTimeSlotModal}
              onClose={() => setShowTimeSlotModal(false)}
              selectedDate={deliveryDate}
              onConfirm={(deliveryType, slot, price) => {
                setDeliveryTime(slot);
                setDeliveryPrefError((prev) => (prev ? { ...prev, time: undefined } : null));
                setShowTimeSlotModal(false);
              }}
            />

            {/* Date Modal */}
            <DateModal
              isOpen={showDateModal}
              onClose={() => setShowDateModal(false)}
              selectedDate={deliveryDate}
              onConfirm={(date) => {
                setDeliveryDate(date);
                setDeliveryPrefError((prev) => (prev ? { ...prev, date: undefined } : null));
                setShowDateModal(false);
              }}
            />

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
                  className={`${styles.paymentTabBtn} ${activeTab === "upi" ? styles.activeTabBtn : ""
                    }`}
                  aria-label="Pay with UPI"
                >
                  <Smartphone size={20} className={styles.tabIcon} />
                  <span>UPI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("card")}
                  className={`${styles.paymentTabBtn} ${activeTab === "card" ? styles.activeTabBtn : ""
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
                        {showQrCode ? (
                          <img
                            src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg"
                            alt="Scan QR"
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          />
                        ) : (
                          <div className={styles.qrImagePlaceholder}>
                            <div className={styles.showQrOverlay}>
                              <button
                                type="button"
                                className={styles.showQrBtn}
                                onClick={() => setShowQrCode(true)}
                              >
                                SHOW QR
                              </button>
                            </div>
                          </div>
                        )}
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
            <div className={styles.productSnippetList}>
              {visibleCheckoutItems.map((item, idx) => (
                <div key={`${item.id}-${idx}`} className={styles.productSnippet}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className={styles.productThumbnail}
                  />
                  <div className={styles.productMeta}>
                    <h3 className={styles.productName}>{item.name}</h3>
                    <p className={styles.productSubtitle}>
                      {item.subtitle || "Premium Preserved Item"} {item.quantity && item.quantity > 1 ? `· Qty: ${item.quantity}` : ""}
                    </p>
                    <div className={styles.itemPriceRow}>
                      <span className={styles.itemPriceVal}>
                        ₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {displayCheckoutItems.length > 2 && (
              <div className={styles.viewMoreContainer}>
                <button
                  type="button"
                  className={styles.viewMoreDropdownBtn}
                  onClick={() => setShowAllItems((prev) => !prev)}
                  aria-expanded={showAllItems}
                >
                  <span>
                    {showAllItems
                      ? "Show Less"
                      : `View More (${displayCheckoutItems.length - 2} more item${displayCheckoutItems.length - 2 > 1 ? "s" : ""})`}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`${styles.viewMoreChevron} ${showAllItems ? styles.chevronRotated : ""}`}
                  />
                </button>
              </div>
            )}

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
              </div>
            <div className={styles.summaryDivider} />

            {/* Total Row */}
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Total</span>
              <div className={styles.totalPriceBlock}>
                <span className={styles.finalPriceBold}>
                  ₹{finalTotal.toFixed(2)}
                </span>
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
              ) : !isAuthenticated ? (
                <>
                  <Lock size={16} />
                  <span>Sign In & Place Order</span>
                </>
              ) : (
                <>
                  <Lock size={16} />
                  <span>Place Order</span>
                </>
              )}
            </button>
            {!isAuthenticated && (
              <div className={styles.authNoticeFooterNote}>
                <Lock size={13} color="#94a3b8" />
                <span>Login details requested at checkout</span>
              </div>
            )}
          </aside>
        </form>
      </main>

      <Footer />
    </div>
  );
}
