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
  orderStatus: "confirmed" | "delivered";
  createdAt: string;
  estimatedDelivery: string;
  items?: CheckoutItem[];
}

const INITIAL_DEMO_ORDERS: CompletedOrder[] = [
  {
    orderId: "ORD893120",
    productId: "birthday-flower-basket",
    productName: "Birthday Flower Basket",
    productImage:
      "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80",
    productCategory: "Flower",
    quantity: 1,
    price: 999,
    unitPrice: 999,
    mobileNumber: "+91 9876543210",
    paymentMethod: "UPI",
    paymentStatus: "success",
    orderStatus: "confirmed",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    estimatedDelivery: "Delivered to Calicut",
  },
  {
    orderId: "ORD652419",
    productId: "pink-rose-delight",
    productName: "Pink Rose Delight Basket",
    productImage:
      "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80",
    productCategory: "Flower",
    quantity: 1,
    price: 1299,
    unitPrice: 1299,
    mobileNumber: "+91 9876543210",
    paymentMethod: "Credit / Debit Card",
    paymentStatus: "success",
    orderStatus: "delivered",
    createdAt: new Date(Date.now() - 9 * 86400000).toISOString(),
    estimatedDelivery: "Delivered to Calicut",
  },
];

interface CheckoutContextType {
  checkoutItem: CheckoutItem | null;
  checkoutItems: CheckoutItem[];
  totalAmount: number;
  mobileNumber: string;
  completedOrder: CompletedOrder | null;
  orders: CompletedOrder[];
  startBuyNow: (item: CheckoutItem, additionalItems?: CheckoutItem[]) => void;
  startCartCheckout: (items: CheckoutItem[]) => void;
  setMobile: (mobile: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  completeOrder: (paymentMethod: string) => CompletedOrder | null;
  viewOrder: (order: CompletedOrder) => void;
  resetCheckout: () => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([]);
  const [mobileNumber, setMobileNumber] = useState<string>("");
  const [completedOrder, setCompletedOrder] = useState<CompletedOrder | null>(null);
  const [orders, setOrders] = useState<CompletedOrder[]>(INITIAL_DEMO_ORDERS);
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

      const storedOrders = localStorage.getItem("occassions_order_history");
      if (storedOrders) {
        const parsed = JSON.parse(storedOrders);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setOrders(parsed);
        }
      } else if (storedOrder) {
        const parsed = JSON.parse(storedOrder);
        setOrders([parsed, ...INITIAL_DEMO_ORDERS]);
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

  // Save orders history to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      if (orders.length > 0) {
        localStorage.setItem("occassions_order_history", JSON.stringify(orders));
      }
    } catch (e) {
      console.error("Failed to persist order history:", e);
    }
  }, [orders, isLoaded]);

  const startBuyNow = (
    item: CheckoutItem,
    additionalItems: CheckoutItem[] = []
  ) => {
    const allItems = [item, ...additionalItems];
    setCheckoutItems(allItems);
    try {
      localStorage.setItem("occassions_checkout_items", JSON.stringify(allItems));
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
    setOrders((prev) => {
      const next = [newOrder, ...prev.filter((o) => o.orderId !== newOrder.orderId)];
      try {
        localStorage.setItem("occassions_order_history", JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });

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

  const viewOrder = (order: CompletedOrder) => {
    setCompletedOrder(order);
    try {
      localStorage.setItem("occassions_latest_order", JSON.stringify(order));
    } catch (e) {
      console.error(e);
    }
    router.push("/thank-you");
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
        orders,
        startBuyNow,
        startCartCheckout,
        setMobile,
        updateQuantity,
        completeOrder,
        viewOrder,
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
