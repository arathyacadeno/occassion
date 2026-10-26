"use client";

import React, { useState } from "react";

interface RazorpayPayButtonProps {
  amount: number; // in Rupees (e.g. 500 for ₹500)
  currency?: string;
  receipt?: string;
  name?: string;
  email?: string;
  contact?: string;
  appOrderId?: string;
  buttonText?: string;
  className?: string;
  disabled?: boolean;
  onSuccess?: (paymentResult: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  onFailure?: (error: any) => void;
}

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function RazorpayPayButton({
  amount,
  currency = "INR",
  receipt,
  name,
  email,
  contact,
  appOrderId,
  buttonText,
  className,
  disabled = false,
  onSuccess,
  onFailure,
}: RazorpayPayButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (disabled || loading) return;
    setLoading(true);

    try {
      // 1. Ensure checkout.js is loaded
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Unable to load Razorpay checkout script. Please check your internet connection.");
        setLoading(false);
        return;
      }

      // Convert rupees to paise (amount >= 100 paise)
      const amountInPaise = Math.max(100, Math.round(amount * 100));

      // 2. Call backend /api/create-order
      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: currency.toUpperCase(),
          receipt: receipt || `rcpt_${Date.now()}`,
          notes: {
            appOrderId: appOrderId || "",
          },
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.order_id) {
        throw new Error(orderData.error || "Failed to create payment order");
      }

      const keyId =
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";

      // 3. Open Razorpay Standard Checkout Modal
      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Occasions",
        description: "Floral & Gift Order",
        order_id: orderData.order_id,
        prefill: {
          name: name || "",
          email: email || "",
          contact: (contact || "").replace(/\D/g, "").slice(-10),
        },
        theme: {
          color: "#e11d48",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            console.log("Razorpay checkout modal dismissed by user");
          },
        },
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          try {
            // 4. Verify signature on backend
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                app_order_id: appOrderId,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error || "Signature verification failed");
            }

            if (onSuccess) {
              onSuccess(response);
            }
          } catch (err: any) {
            console.error("Signature verification error:", err);
            alert(`Payment verification error: ${err.message || "Failed to verify"}`);
            if (onFailure) {
              onFailure(err);
            }
          } finally {
            setLoading(false);
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);

      rzp.on("payment.failed", function (response: any) {
        console.error("Payment failed:", response.error);
        alert(`Payment failed: ${response.error?.description || response.error?.reason || "Declined"}`);
        if (onFailure) {
          onFailure(response.error);
        }
        setLoading(false);
      });

      rzp.open();
    } catch (err: any) {
      console.error("Razorpay initiation error:", err);
      alert(`Payment error: ${err.message || "Could not initiate payment"}`);
      if (onFailure) {
        onFailure(err);
      }
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handlePayment}
      disabled={disabled || loading}
      className={className}
      style={
        !className
          ? {
              backgroundColor: "#e11d48",
              color: "#ffffff",
              padding: "14px 28px",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "1rem",
              border: "none",
              cursor: disabled || loading ? "not-allowed" : "pointer",
              opacity: disabled || loading ? 0.7 : 1,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.2s ease",
            }
          : undefined
      }
    >
      {loading ? (
        <span>Processing...</span>
      ) : (
        buttonText || `Pay ₹${amount.toFixed(2)} with Razorpay`
      )}
    </button>
  );
}
