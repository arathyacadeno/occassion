"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Bouquet, CartItem, ItemCustomization } from "@/types";
interface CartContextType {
  items: CartItem[];
  addItem: (
    bouquet: Bouquet,
    size?: "Petite" | "Signature" | "Grand Deluxe",
    vaseOption?: boolean,
    customNote?: string,
    qty?: number,
    customization?: ItemCustomization
  ) => void;
  updateQty: (index: number, newQty: number) => void;
  removeItem: (index: number) => void;
  updateItem: (index: number, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  subtotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper to detect any legacy hardcoded demo placeholder items
export const isLegacyDemoItem = (item: CartItem): boolean => {
  if (!item || !item.bouquet) return true;
  const b = item.bouquet;
  const id = String(b.id || "").toLowerCase().trim();
  const slug = String(b.slug || "").toLowerCase().trim();
  const name = String(b.name || "").toLowerCase().trim();
  const note = String(item.customNote || "").toLowerCase().trim();
  const img = String(b.image || "").toLowerCase().trim();

  // Known legacy demo IDs
  if (
    id === "celebration-hamper" ||
    id === "classic-calicut-bridal" ||
    id === "bouquet-1" ||
    id === "bouquet-2" ||
    id === "bouquet-3"
  ) {
    return true;
  }

  // Known legacy demo slugs
  if (
    slug === "celebration-cake-flower-hamper-luxe" ||
    slug === "classic-calicut-bridal-bouquet"
  ) {
    return true;
  }

  // Known legacy demo names
  if (
    name === "celebration floral & cake hamper" ||
    name === "classic calicut bridal bouquet" ||
    name === "exotic orchid cascade"
  ) {
    return true;
  }

  // Known legacy demo notes
  if (
    note.includes("wishing you a lifetime of love") ||
    note.includes("happy birthday! may your day be as sweet")
  ) {
    return true;
  }

  // Known legacy demo images
  if (
    img === "/images/cat-flower-bouquet-luxe.jpg" ||
    img === "/images/farm-hand-bouquet-large.jpg"
  ) {
    return true;
  }

  return false;
};

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
          // Strictly filter out all legacy hardcoded demo placeholder items
          const realItems = parsed.filter((item: CartItem) => !isLegacyDemoItem(item));
          setItems(realItems);
          // Overwrite localStorage immediately to purge demo items permanently
          localStorage.setItem("occassions_cart", JSON.stringify(realItems));
        } else {
          setItems([]);
          localStorage.setItem("occassions_cart", "[]");
        }
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
      try {
        localStorage.setItem("occassions_cart", "[]");
      } catch {}
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
    qty: number = 1,
    customization?: ItemCustomization
  ) => {
    const addQuantity = Math.max(1, qty);
    setItems((prev) => {
      const existingIdx = prev.findIndex((i) => {
        if (customization || i.customization) {
          return (
            i.bouquet.id === bouquet.id &&
            i.customization?.summaryText === customization?.summaryText &&
            i.customization?.finalPrice === customization?.finalPrice
          );
        }
        return (
          i.bouquet.id === bouquet.id &&
          i.selectedSize === size &&
          i.vaseOption === vaseOption
        );
      });
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
          customNote: customNote || customization?.customNote,
          customization,
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
    try {
      localStorage.setItem("occassions_cart", "[]");
    } catch (e) {
      console.error("Failed to clear cart in localStorage", e);
    }
  }, []);

  const subtotal = items.reduce((acc, item) => {
    let itemPrice = item.customization?.finalPrice ?? item.bouquet.price;
    if (!item.customization) {
      if (item.selectedSize === "Petite") itemPrice = Math.round(item.bouquet.price * 0.8);
      if (item.selectedSize === "Grand Deluxe") itemPrice = Math.round(item.bouquet.price * 1.35);
    }
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
