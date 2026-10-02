"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Bouquet, CartItem } from "@/types";
import { BOUQUETS_DATA } from "@/data/bouquets";

interface CartContextType {
  items: CartItem[];
  addItem: (
    bouquet: Bouquet,
    size?: "Petite" | "Signature" | "Grand Deluxe",
    vaseOption?: boolean,
    customNote?: string,
    qty?: number
  ) => void;
  updateQty: (index: number, newQty: number) => void;
  removeItem: (index: number) => void;
  updateItem: (index: number, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  subtotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize from localStorage or empty array
  useEffect(() => {
    try {
      const stored = localStorage.getItem("occassions_cart");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Filter out legacy hardcoded demo placeholder items if present
          const userItems = parsed.filter(
            (item: CartItem) =>
              item.customNote !==
              "Wishing you a lifetime of love and blooming happiness!" &&
              item.customNote !==
              "Happy Birthday! May your day be as sweet as these blooms."
          );
          setItems(userItems);
        } else {
          setItems([]);
        }
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("occassions_cart", JSON.stringify(items));
      } catch (e) {
        console.error("Failed to save cart to localStorage", e);
      }
    }
  }, [items, isLoaded]);

  const addItem = React.useCallback((
    bouquet: Bouquet,
    size: "Petite" | "Signature" | "Grand Deluxe" = "Signature",
    vaseOption: boolean = false,
    customNote?: string,
    qty: number = 1
  ) => {
    const addQuantity = Math.max(1, qty);
    setItems((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.bouquet.id === bouquet.id && i.selectedSize === size && i.vaseOption === vaseOption
      );
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx].quantity += addQuantity;
        return next;
      }
      return [
        ...prev,
        {
          bouquet,
          quantity: addQuantity,
          selectedSize: size,
          vaseOption,
          customNote,
        },
      ];
    });
  }, []);

  const updateQty = React.useCallback((index: number, newQty: number) => {
    if (newQty <= 0) {
      removeItem(index);
      return;
    }
    setItems((prev) => {
      const next = [...prev];
      if (next[index]) {
        next[index] = { ...next[index], quantity: newQty };
      }
      return next;
    });
  }, []);

  const removeItem = React.useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateItem = React.useCallback((index: number, updates: Partial<CartItem>) => {
    setItems((prev) => {
      const next = [...prev];
      if (next[index]) {
        next[index] = { ...next[index], ...updates };
      }
      return next;
    });
  }, []);

  const clearCart = React.useCallback(() => {
    setItems([]);
  }, []);

  const subtotal = items.reduce((acc, item) => {
    let itemPrice = item.bouquet.price;
    if (item.selectedSize === "Petite") itemPrice = Math.round(item.bouquet.price * 0.8);
    if (item.selectedSize === "Grand Deluxe") itemPrice = Math.round(item.bouquet.price * 1.35);
    const vasePrice = item.vaseOption ? 299 : 0;
    return acc + (itemPrice + vasePrice) * item.quantity;
  }, 0);

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQty,
        removeItem,
        updateItem,
        clearCart,
        subtotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
