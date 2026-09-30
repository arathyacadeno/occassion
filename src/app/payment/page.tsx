"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCheckout } from "@/context/CheckoutContext";
import { useCart } from "@/context/CartContext";
import {
  CreditCard,
  QrCode,
  Building2,
  Banknote,
  ShieldCheck,
  Lock,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import styles from "./payment.module.css";

type PaymentMethodType = "upi" | "card" | "netbanking" | "cod";

export default function PaymentPage() {
  const router = useRouter();
  const { clearCart } = useCart();
  const {
    checkoutItem,
    checkoutItems,
    totalAmount,
    mobileNumber,
    completeOrder,
  } = useCheckout();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>("upi");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");
  const [isProcessing, setIsProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);

  const displayItems =
    checkoutItems.length > 0
      ? checkoutItems
      : checkoutItem
      ? [checkoutItem]
      : [];

  useEffect(() => {
    setMounted(true);
    // Guard: If no checkout item or mobile number, redirect to checkout
    if (displayItems.length === 0 || !mobileNumber) {
      router.replace("/checkout");
    }
  }, [displayItems.length, mobileNumber, router]);

  if (!mounted || displayItems.length === 0) {
    return null;
  }

  const finalTotal =
    totalAmount > 0
      ? totalAmount
      : displayItems.reduce(
          (acc, item) => acc + item.price * (item.quantity || 1),
          0
        );

  // Simulate payment processing flow
  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const methodNames: Record<PaymentMethodType, string> = {
      upi: "UPI",
      card: "Credit / Debit Card",
      netbanking: `Net Banking (${selectedBank})`,
      cod: "Cash on Delivery",
    };

    // Simulate gateway handoff & verification (1.8s)
    setTimeout(() => {
      const order = completeOrder(methodNames[selectedMethod]);
      clearCart();
      if (order) {
        router.push("/order-success");
      }
    }, 1800);
  };

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <main className={styles.mainContainer}>
        {/* Stepper */}
        <div className={styles.stepperWrapper}>
          <div className={`${styles.stepItem} ${styles.stepCompleted}`}>
            <span className={styles.stepNum}>✓</span>
            <span className={styles.stepLabel}>Details</span>
          </div>
          <div className={`${styles.stepDivider} ${styles.stepDividerActive}`} />
          <div className={`${styles.stepItem} ${styles.stepActive}`}>
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
          {/* Main Payment Options Column */}
          <div className={styles.mainPaymentColumn}>
            <div className={styles.backLinkRow}>
              <Link href="/checkout" className={styles.backLink}>
                <ArrowLeft size={16} /> Back to details
              </Link>
            </div>

            <div className={styles.headerBlock}>
              <h1 className={styles.pageHeading}>Choose Payment Method</h1>
              <p className={styles.pageSubheading}>
                Select a trusted and secure payment method to complete your flower delivery.
              </p>
            </div>

            <form onSubmit={handlePayment} className={styles.paymentMethodsList}>
              {/* Option 1: UPI */}
              <div
                className={`${styles.paymentOptionCard} ${
                  selectedMethod === "upi" ? styles.selectedCard : ""
                }`}
                onClick={() => setSelectedMethod("upi")}
              >
                <div className={styles.optionHeader}>
                  <div className={styles.radioWrapper}>
                    <input
                      type="radio"
                      id="method-upi"
                      name="paymentMethod"
                      value="upi"
                      checked={selectedMethod === "upi"}
                      onChange={() => setSelectedMethod("upi")}
                      className={styles.radioInput}
                    />
                    <label htmlFor="method-upi" className={styles.radioLabel}>
                      <span className={styles.optionTitle}>UPI</span>
                      <span className={styles.optionSubtitle}>
                        Google Pay, PhonePe, Paytm, BHIM
                      </span>
                    </label>
                  </div>
                  <QrCode size={22} className={styles.optionIcon} />
                </div>

                {selectedMethod === "upi" && (
                  <div
                    className={styles.expandedDetails}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <label className={styles.inputLabel}>UPI ID</label>
                    <div className={styles.upiInputRow}>
                      <input
                        type="text"
                        placeholder="e.g. mobile@upi or username@okhdfcbank"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className={styles.textInput}
                        required={selectedMethod === "upi"}
                      />
                    </div>
                    <p className={styles.upiHint}>
                      A payment request will be sent to your UPI app.
                    </p>

                    <button
                      type="submit"
                      disabled={isProcessing}
                      className={styles.payNowBtn}
                    >
                      <Lock size={16} />
                      <span>Pay ₹{finalTotal.toLocaleString("en-IN")}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Option 2: Credit / Debit Card */}
              <div
                className={`${styles.paymentOptionCard} ${
                  selectedMethod === "card" ? styles.selectedCard : ""
                }`}
                onClick={() => setSelectedMethod("card")}
              >
                <div className={styles.optionHeader}>
                  <div className={styles.radioWrapper}>
                    <input
                      type="radio"
                      id="method-card"
                      name="paymentMethod"
                      value="card"
                      checked={selectedMethod === "card"}
                      onChange={() => setSelectedMethod("card")}
                      className={styles.radioInput}
                    />
                    <label htmlFor="method-card" className={styles.radioLabel}>
                      <span className={styles.optionTitle}>Credit / Debit Card</span>
                      <span className={styles.optionSubtitle}>
                        Visa, MasterCard, RuPay, Maestro
                      </span>
                    </label>
                  </div>
                  <CreditCard size={22} className={styles.optionIcon} />
                </div>

                {selectedMethod === "card" && (
                  <div
                    className={styles.expandedDetails}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className={styles.cardForm}>
                      <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Card Number</label>
                        <input
                          type="text"
                          maxLength={19}
                          placeholder="4532 •••• •••• 8892"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className={styles.textInput}
                          required={selectedMethod === "card"}
                        />
                      </div>

                      <div className={styles.cardMetaRow}>
                        <div className={styles.inputGroup}>
                          <label className={styles.inputLabel}>Expiry Date</label>
                          <input
                            type="text"
                            maxLength={5}
                            placeholder="MM / YY"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className={styles.textInput}
                            required={selectedMethod === "card"}
                          />
                        </div>

                        <div className={styles.inputGroup}>
                          <label className={styles.inputLabel}>CVV</label>
                          <input
                            type="password"
                            maxLength={4}
                            placeholder="•••"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            className={styles.textInput}
                            required={selectedMethod === "card"}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isProcessing}
                        className={styles.payNowBtn}
                      >
                        <Lock size={16} />
                        <span>Pay ₹{finalTotal.toLocaleString("en-IN")}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Option 3: Net Banking */}
              <div
                className={`${styles.paymentOptionCard} ${
                  selectedMethod === "netbanking" ? styles.selectedCard : ""
                }`}
                onClick={() => setSelectedMethod("netbanking")}
              >
                <div className={styles.optionHeader}>
                  <div className={styles.radioWrapper}>
                    <input
                      type="radio"
                      id="method-netbanking"
                      name="paymentMethod"
                      value="netbanking"
                      checked={selectedMethod === "netbanking"}
                      onChange={() => setSelectedMethod("netbanking")}
                      className={styles.radioInput}
                    />
                    <label htmlFor="method-netbanking" className={styles.radioLabel}>
                      <span className={styles.optionTitle}>Net Banking</span>
                      <span className={styles.optionSubtitle}>
                        All major Indian banks supported
                      </span>
                    </label>
                  </div>
                  <Building2 size={22} className={styles.optionIcon} />
                </div>

                {selectedMethod === "netbanking" && (
                  <div
                    className={styles.expandedDetails}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <label className={styles.inputLabel}>Select Bank</label>
                    <div className={styles.bankGrid}>
                      {[
                        "HDFC Bank",
                        "State Bank of India",
                        "ICICI Bank",
                        "Axis Bank",
                        "Kotak Bank",
                        "Federal Bank",
                      ].map((bank) => (
                        <button
                          key={bank}
                          type="button"
                          onClick={() => setSelectedBank(bank)}
                          className={`${styles.bankBtn} ${
                            selectedBank === bank ? styles.bankBtnActive : ""
                          }`}
                        >
                          {bank}
                        </button>
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={isProcessing}
                      className={styles.payNowBtn}
                    >
                      <Lock size={16} />
                      <span>Pay ₹{finalTotal.toLocaleString("en-IN")}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Option 4: Cash on Delivery */}
              <div
                className={`${styles.paymentOptionCard} ${
                  selectedMethod === "cod" ? styles.selectedCard : ""
                }`}
                onClick={() => setSelectedMethod("cod")}
              >
                <div className={styles.optionHeader}>
                  <div className={styles.radioWrapper}>
                    <input
                      type="radio"
                      id="method-cod"
                      name="paymentMethod"
                      value="cod"
                      checked={selectedMethod === "cod"}
                      onChange={() => setSelectedMethod("cod")}
                      className={styles.radioInput}
                    />
                    <label htmlFor="method-cod" className={styles.radioLabel}>
                      <span className={styles.optionTitle}>Cash on Delivery</span>
                      <span className={styles.optionSubtitle}>
                        Pay with cash or UPI at the time of delivery
                      </span>
                    </label>
                  </div>
                  <Banknote size={22} className={styles.optionIcon} />
                </div>

                {selectedMethod === "cod" && (
                  <div
                    className={styles.expandedDetails}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className={styles.codMessageBox}>
                      <CheckCircle2 size={18} className={styles.codIcon} />
                      <p className={styles.codText}>
                        Pay when your order is delivered to your doorstep in Calicut.
                        Our delivery associate will bring change or a QR code.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isProcessing}
                      className={styles.placeOrderBtn}
                    >
                      <Sparkles size={16} />
                      <span>Pay ₹{finalTotal.toLocaleString("en-IN")} (COD)</span>
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Right Column: Order Summary Sidebar */}
          <div className={styles.sidebarColumn}>
            <div className={styles.summaryBox}>
              <h3 className={styles.summaryTitle}>Order Summary</h3>

              <div className={styles.productsList}>
                {displayItems.map((item, index) => (
                  <div key={item.id || index} className={styles.productRow}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className={styles.productImg}
                    />
                    <div className={styles.productInfo}>
                      <h4 className={styles.productName}>{item.name}</h4>
                      <p className={styles.productSubtext}>
                        Qty: {item.quantity || 1} × ₹{item.price.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.divider} />

              <div className={styles.costLine}>
                <span>Subtotal</span>
                <span>₹{finalTotal.toLocaleString("en-IN")}</span>
              </div>
              <div className={styles.costLine}>
                <span>Delivery</span>
                <span className={styles.greenCost}>FREE</span>
              </div>

              <div className={styles.divider} />

              <div className={styles.totalLine}>
                <span>Total</span>
                <span className={styles.totalAmount}>
                  ₹{finalTotal.toLocaleString("en-IN")}
                </span>
              </div>

              <div className={styles.mobileVerifiedBox}>
                <span className={styles.mobileTag}>Updates sent to:</span>
                <span className={styles.mobileNum}>+91 {mobileNumber}</span>
              </div>

              <div className={styles.securityBox}>
                <ShieldCheck size={20} className={styles.secShield} />
                <span>256-bit SSL Encrypted &amp; PCI-DSS Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Payment Processing Modal Animation */}
      {isProcessing && (
        <div className={styles.processingBackdrop}>
          <div className={styles.processingCard}>
            <div className={styles.spinnerWrapper}>
              <div className={styles.spinnerRing} />
              <Lock size={26} className={styles.spinnerCenterIcon} />
            </div>

            <h3 className={styles.processingTitle}>Processing Payment</h3>
            <p className={styles.processingDesc}>
              Please wait while we securely process your payment.
            </p>

            <div className={styles.processingPill}>
              <ShieldCheck size={16} />
              <span>Verifying payment with bank...</span>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
