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
  subtitle?: string;
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
  items?: CheckoutItem[];
}

interface CheckoutContextType {
  checkoutItem: CheckoutItem | null;
  checkoutItems: CheckoutItem[];
  totalAmount: number;
  mobileNumber: string;
  completedOrder: CompletedOrder | null;
  startBuyNow: (item: CheckoutItem) => void;
  startCartCheckout: (items: CheckoutItem[]) => void;
  setMobile: (mobile: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  completeOrder: (paymentMethod: string) => CompletedOrder | null;
  resetCheckout: () => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([]);
  const [mobileNumber, setMobileNumber] = useState<string>("");
  const [completedOrder, setCompletedOrder] = useState<CompletedOrder | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load state from localStorage on initial render
  useEffect(() => {
    try {
      const storedItems = localStorage.getItem("occassions_checkout_items");
      if (storedItems) {
        setCheckoutItems(JSON.parse(storedItems));
      } else {
        const storedSingle = localStorage.getItem("occassions_checkout_item");
        if (storedSingle) {
          setCheckoutItems([JSON.parse(storedSingle)]);
        }
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

  // Save checkout items to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      if (checkoutItems.length > 0) {
        localStorage.setItem("occassions_checkout_items", JSON.stringify(checkoutItems));
        localStorage.setItem("occassions_checkout_item", JSON.stringify(checkoutItems[0]));
      } else {
        localStorage.removeItem("occassions_checkout_items");
        localStorage.removeItem("occassions_checkout_item");
      }
    } catch (e) {
      console.error("Failed to persist checkout items:", e);
    }
  }, [checkoutItems, isLoaded]);

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
    setCheckoutItems([item]);
    try {
      localStorage.setItem("occassions_checkout_items", JSON.stringify([item]));
      localStorage.setItem("occassions_checkout_item", JSON.stringify(item));
    } catch (e) {
      console.error(e);
    }
    router.push("/checkout");
  };

  const startCartCheckout = (items: CheckoutItem[]) => {
    if (items.length === 0) return;
    setCheckoutItems(items);
    try {
      localStorage.setItem("occassions_checkout_items", JSON.stringify(items));
      localStorage.setItem("occassions_checkout_item", JSON.stringify(items[0]));
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

  const updateQuantity = (id: string, qty: number) => {
    if (qty < 1) return;
    setCheckoutItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: qty } : item))
    );
  };

  const totalAmount = checkoutItems.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );

  const completeOrder = (paymentMethod: string): CompletedOrder | null => {
    if (checkoutItems.length === 0) return null;

    const primaryItem = checkoutItems[0];
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const orderId = `ORD${randomSuffix}`;

    const newOrder: CompletedOrder = {
      orderId,
      productId: primaryItem.id,
      productName:
        checkoutItems.length > 1
          ? `${primaryItem.name} + ${checkoutItems.length - 1} more items`
          : primaryItem.name,
      productImage: primaryItem.image,
      productCategory: primaryItem.category,
      quantity: checkoutItems.reduce((acc, i) => acc + (i.quantity || 1), 0),
      price: totalAmount,
      unitPrice: primaryItem.price,
      mobileNumber: mobileNumber.startsWith("+91")
        ? mobileNumber
        : `+91 ${mobileNumber}`,
      paymentMethod,
      paymentStatus: "success",
      orderStatus: "confirmed",
      createdAt: new Date().toISOString(),
      estimatedDelivery: "Today in 2–4 hours (Same-Day Express Delivery)",
      items: checkoutItems,
    };

    setCompletedOrder(newOrder);
    try {
      localStorage.setItem("occassions_latest_order", JSON.stringify(newOrder));
      localStorage.removeItem("occassions_checkout_items");
      localStorage.removeItem("occassions_checkout_item");
      localStorage.removeItem("occassions_cart");
    } catch (e) {
      console.error(e);
    }

    return newOrder;
  };

  const resetCheckout = () => {
    setCheckoutItems([]);
    setMobileNumber("");
    try {
      localStorage.removeItem("occassions_checkout_items");
      localStorage.removeItem("occassions_checkout_item");
      localStorage.removeItem("occassions_checkout_mobile");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <CheckoutContext.Provider
      value={{
        checkoutItem: checkoutItems[0] || null,
        checkoutItems,
        totalAmount,
        mobileNumber,
        completedOrder,
        startBuyNow,
        startCartCheckout,
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
