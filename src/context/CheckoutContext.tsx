"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface CheckoutItem {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
}

export interface CompletedOrder {
  orderId: string;
  productId: string;
  productName: string;
  productImage: string;
  productCategory: string;
  quantity: number;
  price: number;
  unitPrice: number;
  mobileNumber: string;
  paymentMethod: string;
  paymentStatus: "success";
  orderStatus: "confirmed";
  createdAt: string;
  estimatedDelivery: string;
}

interface CheckoutContextType {
  checkoutItem: CheckoutItem | null;
  mobileNumber: string;
  completedOrder: CompletedOrder | null;
  startBuyNow: (item: CheckoutItem) => void;
  setMobile: (mobile: string) => void;
  updateQuantity: (quantity: number) => void;
  completeOrder: (paymentMethod: string) => CompletedOrder | null;
  resetCheckout: () => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checkoutItem, setCheckoutItem] = useState<CheckoutItem | null>(null);
  const [mobileNumber, setMobileNumber] = useState<string>("");
  const [completedOrder, setCompletedOrder] = useState<CompletedOrder | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load state from localStorage on initial render
  useEffect(() => {
    try {
      const storedItem = localStorage.getItem("occassions_checkout_item");
      if (storedItem) {
        setCheckoutItem(JSON.parse(storedItem));
      }

      const storedMobile = localStorage.getItem("occassions_checkout_mobile");
      if (storedMobile) {
        setMobileNumber(storedMobile);
      }

      const storedOrder = localStorage.getItem("occassions_latest_order");
      if (storedOrder) {
        setCompletedOrder(JSON.parse(storedOrder));
      }
    } catch (e) {
      console.error("Failed to load checkout state:", e);
    }
    setIsLoaded(true);
  }, []);

  // Save checkout item to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      if (checkoutItem) {
        localStorage.setItem("occassions_checkout_item", JSON.stringify(checkoutItem));
      } else {
        localStorage.removeItem("occassions_checkout_item");
      }
    } catch (e) {
      console.error("Failed to persist checkout item:", e);
    }
  }, [checkoutItem, isLoaded]);

  // Save mobile to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      if (mobileNumber) {
        localStorage.setItem("occassions_checkout_mobile", mobileNumber);
      }
    } catch (e) {
      console.error("Failed to persist mobile:", e);
    }
  }, [mobileNumber, isLoaded]);

  // Save latest order to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      if (completedOrder) {
        localStorage.setItem("occassions_latest_order", JSON.stringify(completedOrder));
      }
    } catch (e) {
      console.error("Failed to persist order:", e);
    }
  }, [completedOrder, isLoaded]);

  const startBuyNow = (item: CheckoutItem) => {
    setCheckoutItem(item);
    try {
      localStorage.setItem("occassions_checkout_item", JSON.stringify(item));
    } catch (e) {
      console.error(e);
    }
    router.push("/checkout");
  };

  const setMobile = (mobile: string) => {
    setMobileNumber(mobile);
    try {
      localStorage.setItem("occassions_checkout_mobile", mobile);
    } catch (e) {
      console.error(e);
    }
  };

  const updateQuantity = (qty: number) => {
    if (qty < 1) return;
    setCheckoutItem((prev) => {
      if (!prev) return null;
      return { ...prev, quantity: qty };
    });
  };

  const completeOrder = (paymentMethod: string): CompletedOrder | null => {
    if (!checkoutItem) return null;

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const orderId = `ORD${randomSuffix}`;
    const totalPrice = checkoutItem.price * (checkoutItem.quantity || 1);

    const newOrder: CompletedOrder = {
      orderId,
      productId: checkoutItem.id,
      productName: checkoutItem.name,
      productImage: checkoutItem.image,
      productCategory: checkoutItem.category,
      quantity: checkoutItem.quantity || 1,
      price: totalPrice,
      unitPrice: checkoutItem.price,
      mobileNumber: mobileNumber.startsWith("+91")
        ? mobileNumber
        : `+91 ${mobileNumber}`,
      paymentMethod,
      paymentStatus: "success",
      orderStatus: "confirmed",
      createdAt: new Date().toISOString(),
      estimatedDelivery: "Today in 2–4 hours (Same-Day Express Delivery)",
    };

    setCompletedOrder(newOrder);
    try {
      localStorage.setItem("occassions_latest_order", JSON.stringify(newOrder));
      localStorage.removeItem("occassions_checkout_item");
    } catch (e) {
      console.error(e);
    }

    return newOrder;
  };

  const resetCheckout = () => {
    setCheckoutItem(null);
    setMobileNumber("");
    try {
      localStorage.removeItem("occassions_checkout_item");
      localStorage.removeItem("occassions_checkout_mobile");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <CheckoutContext.Provider
      value={{
        checkoutItem,
        mobileNumber,
        completedOrder,
        startBuyNow,
        setMobile,
        updateQuantity,
        completeOrder,
        resetCheckout,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return context;
}
