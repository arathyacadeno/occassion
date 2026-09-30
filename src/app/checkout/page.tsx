"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCheckout } from "@/context/CheckoutContext";
import {
  Phone,
  ShieldCheck,
  Truck,
  ArrowRight,
  Edit2,
  Plus,
  Minus,
  CheckCircle2,
  Lock,
} from "lucide-react";
import styles from "./checkout.module.css";

export default function CheckoutPage() {
  const router = useRouter();
  const {
    checkoutItem,
    checkoutItems,
    totalAmount,
    mobileNumber,
    setMobile,
    updateQuantity,
  } = useCheckout();

  const [inputMobile, setInputMobile] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSummaryStep, setIsSummaryStep] = useState(false);
  const [mounted, setMounted] = useState(false);

  const displayItems =
    checkoutItems.length > 0
      ? checkoutItems
      : checkoutItem
      ? [checkoutItem]
      : [];

  useEffect(() => {
    setMounted(true);
    if (mobileNumber) {
      const cleaned = mobileNumber.replace(/\D/g, "").slice(-10);
      setInputMobile(cleaned);
      if (cleaned.length === 10) {
        setIsSummaryStep(true);
      }
    }
  }, [mobileNumber]);

  // Validation for Indian 10-digit mobile number starting with 6, 7, 8, or 9
  const validateMobile = (value: string): boolean => {
    const cleanDigits = value.replace(/\D/g, "");
    return /^[6-9]\d{9}$/.test(cleanDigits);
  };

  const handleMobileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDigits = inputMobile.replace(/\D/g, "");

    if (!cleanDigits) {
      setError("Please enter your mobile number.");
      return;
    }

    if (!validateMobile(cleanDigits)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setError(null);
    setMobile(cleanDigits);
    setIsSummaryStep(true);
  };

  const handleProceedToPayment = () => {
    if (displayItems.length === 0) return;
    router.push("/payment");
  };

  if (!mounted) {
    return null;
  }

  // Guard: If no product selected, show friendly empty checkout banner
  if (displayItems.length === 0) {
    return (
      <div className={styles.pageWrapper}>
        <Navbar />
        <main className={styles.emptyContainer}>
          <div className={styles.emptyCard}>
            <div className={styles.emptyIconCircle}>
              <ShieldCheck size={38} className={styles.shieldIcon} />
            </div>
            <h1 className={styles.emptyTitle}>No Product Selected for Checkout</h1>
            <p className={styles.emptyDesc}>
              Please select a flower arrangement, cake, or gift and click &quot;Buy Now&quot;
              or proceed from your cart.
            </p>
            <Link href="/flower" className={styles.browseBtn}>
              Browse Flowers <ArrowRight size={16} />
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const finalTotal =
    totalAmount > 0
      ? totalAmount
      : displayItems.reduce(
          (acc, item) => acc + item.price * (item.quantity || 1),
          0
        );

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <main className={styles.mainContainer}>
        {/* Progress Stepper */}
        <div className={styles.stepperWrapper}>
          <div className={`${styles.stepItem} ${styles.stepActive}`}>
            <span className={styles.stepNum}>1</span>
            <span className={styles.stepLabel}>Details</span>
          </div>
          <div className={styles.stepDivider} />
          <div className={styles.stepItem}>
            <span className={styles.stepNum}>2</span>
            <span className={styles.stepLabel}>Payment</span>
          </div>
          <div className={styles.stepDivider} />
          <div className={styles.stepItem}>
            <span className={styles.stepNum}>3</span>
            <span className={styles.stepLabel}>Confirmation</span>
          </div>
        </div>

        <div className={styles.contentLayout}>
          {/* Left Column: Form / Steps */}
          <div className={styles.leftColumn}>
            {/* Step 1: Mobile Number Input */}
            <div className={styles.cardBox}>
              <div className={styles.cardHeader}>
                <div className={styles.stepBadge}>Step 1</div>
                <h2 className={styles.headingTitle}>Enter Your Mobile Number</h2>
                <p className={styles.headingDesc}>
                  We&apos;ll use your number to confirm your order and keep you
                  updated about your delivery.
                </p>
              </div>

              {!isSummaryStep ? (
                <form onSubmit={handleMobileSubmit} className={styles.formContent}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="mobile" className={styles.inputLabel}>
                      Mobile Number
                    </label>
                    <div
                      className={`${styles.phoneInputContainer} ${
                        error ? styles.inputError : ""
                      }`}
                    >
                      <div className={styles.countryCodeBadge}>
                        <span className={styles.flagIcon}>🇮🇳</span>
                        <span className={styles.countryCodeText}>+91</span>
                      </div>
                      <input
                        id="mobile"
                        type="tel"
                        maxLength={10}
                        placeholder="Enter mobile number"
                        value={inputMobile}
                        onChange={(e) => {
                          const digitsOnly = e.target.value.replace(/\D/g, "");
                          setInputMobile(digitsOnly);
                          if (error) setError(null);
                        }}
                        className={styles.phoneInputField}
                        autoFocus
                      />
                    </div>
                    {error && <p className={styles.errorText}>{error}</p>}
                  </div>

                  <button type="submit" className={styles.continueBtn}>
                    Continue
                  </button>
                </form>
              ) : (
                <div className={styles.confirmedMobileRow}>
                  <div className={styles.confirmedMobileLeft}>
                    <CheckCircle2 size={20} className={styles.checkSuccessIcon} />
                    <div>
                      <span className={styles.confirmedMobileLabel}>
                        Registered Mobile:
                      </span>
                      <span className={styles.confirmedMobileNumber}>
                        +91 {inputMobile.slice(0, 5)} {inputMobile.slice(5)}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSummaryStep(false)}
                    className={styles.editBtn}
                    aria-label="Edit mobile number"
                  >
                    <Edit2 size={14} />
                    <span>Change</span>
                  </button>
                </div>
              )}
            </div>

            {/* Step 2: Order Summary (Revealed or emphasized after mobile number) */}
            {isSummaryStep && (
              <div className={styles.cardBox}>
                <div className={styles.cardHeader}>
                  <div className={styles.stepBadge}>Step 2</div>
                  <h2 className={styles.headingTitle}>Order Summary</h2>
                </div>

                {displayItems.map((item) => (
                  <div key={item.id} className={styles.summaryItemRow}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className={styles.summaryProductImg}
                    />

                    <div className={styles.summaryItemDetails}>
                      <span className={styles.summaryCategory}>
                        {item.category.toUpperCase()}
                      </span>
                      <h3 className={styles.summaryProductName}>
                        {item.name}
                      </h3>
                      <div className={styles.summaryPriceUnit}>
                        ₹{item.price.toLocaleString("en-IN")} each
                      </div>

                      <div className={styles.qtyControlRow}>
                        <span className={styles.qtyLabel}>Quantity:</span>
                        <div className={styles.stepperContainer}>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                Math.max(1, (item.quantity || 1) - 1)
                              )
                            }
                            disabled={(item.quantity || 1) <= 1}
                            className={styles.stepperBtn}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={13} />
                          </button>
                          <span className={styles.qtyDisplay}>
                            {item.quantity || 1}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.id, (item.quantity || 1) + 1)
                            }
                            className={styles.stepperBtn}
                            aria-label="Increase quantity"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className={styles.itemTotalPrice}>
                      ₹{((item.price) * (item.quantity || 1)).toLocaleString("en-IN")}
                    </div>
                  </div>
                ))}

                <div className={styles.summaryMetaList}>
                  <div className={styles.metaRow}>
                    <span className={styles.metaTitle}>Delivery</span>
                    <span className={styles.freeDeliveryTag}>
                      <Truck size={14} /> Free Delivery
                    </span>
                  </div>

                  <div className={styles.metaRow}>
                    <span className={styles.metaTitle}>Mobile</span>
                    <span className={styles.metaValue}>
                      +91 {inputMobile.slice(0, 5)} {inputMobile.slice(5)}
                    </span>
                  </div>
                </div>

                <div className={styles.dividerLine} />

                <div className={styles.totalRow}>
                  <span className={styles.totalLabel}>Total</span>
                  <span className={styles.totalValue}>
                    ₹{finalTotal.toLocaleString("en-IN")}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  className={styles.continueToPaymentBtn}
                >
                  <Lock size={16} />
                  <span>Continue to Payment</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Trust & Order Preview Banner */}
          <div className={styles.rightColumn}>
            <div className={styles.sideSummaryCard}>
              <h3 className={styles.sideSummaryTitle}>Order Overview</h3>

              {displayItems.map((item) => (
                <div key={item.id} className={styles.sideProductMini}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className={styles.sideProductImg}
                  />
                  <div>
                    <h4 className={styles.sideProductName}>{item.name}</h4>
                    <p className={styles.sideProductPrice}>
                      Qty: {item.quantity || 1} × ₹{item.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              ))}

              <div className={styles.sideDivider} />

              <div className={styles.sideCostRow}>
                <span>Subtotal</span>
                <span>₹{finalTotal.toLocaleString("en-IN")}</span>
              </div>
              <div className={styles.sideCostRow}>
                <span>Delivery</span>
                <span className={styles.greenText}>FREE</span>
              </div>

              <div className={styles.sideDivider} />

              <div className={styles.sideTotalRow}>
                <span>Estimated Total</span>
                <span className={styles.sideTotalAmount}>
                  ₹{finalTotal.toLocaleString("en-IN")}
                </span>
              </div>

              {/* Trust Badges */}
              <div className={styles.trustBadgesBox}>
                <div className={styles.trustItem}>
                  <ShieldCheck size={18} className={styles.trustIcon} />
                  <span>100% Fresh Flower Guarantee</span>
                </div>
                <div className={styles.trustItem}>
                  <Truck size={18} className={styles.trustIcon} />
                  <span>Calicut Same-Day Delivery in 2–4 Hours</span>
                </div>
                <div className={styles.trustItem}>
                  <Phone size={18} className={styles.trustIcon} />
                  <span>Real-Time WhatsApp & SMS Order Updates</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
