"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AddonProduct, ADDON_PRODUCTS } from "@/data/addons";

interface AddonsContextType {
  addons: AddonProduct[];
  categories: string[];
  loading: boolean;
  refreshAddons: () => Promise<void>;
  getAddonById: (idOrSlug: string) => AddonProduct | undefined;
}

const DEFAULT_CATEGORIES = [
  "All",
  "Flower Bouquets",
  "Flower Baskets",
  "Cakes",
  "Chocolates",
  "Soft Toys",
];

const AddonsContext = createContext<AddonsContextType>({
  addons: ADDON_PRODUCTS,
  categories: DEFAULT_CATEGORIES,
  loading: false,
  refreshAddons: async () => {},
  getAddonById: (idOrSlug: string) =>
    ADDON_PRODUCTS.find((p) => p.id === idOrSlug || p.id === `addon-${idOrSlug}`),
});

export function AddonsProvider({ children }: { children: React.ReactNode }) {
  const [addons, setAddons] = useState<AddonProduct[]>(ADDON_PRODUCTS);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(false);

  const fetchAddons = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/addons?t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.success && Array.isArray(data.addons)) {
          setAddons(data.addons);
        }
        if (data?.success && Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories);
        }
      }
    } catch (e) {
      console.warn("Failed to load live addons, using default catalog:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddons();

    // Auto-refresh when tab gains focus or user returns to tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchAddons();
      }
    };
    window.addEventListener("focus", fetchAddons);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cross-tab sync: when admin saves/deletes in another tab, instantly refresh
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "occasions_catalog_updated" || e.key === "occasions_addons_updated") {
        fetchAddons();
      }
    };
    window.addEventListener("storage", handleStorage);

    // Same-tab custom event
    const handleCustomEvent = () => {
      fetchAddons();
    };
    window.addEventListener("occasions:addons-changed", handleCustomEvent);

    return () => {
      window.removeEventListener("focus", fetchAddons);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("occasions:addons-changed", handleCustomEvent);
    };
  }, [fetchAddons]);

  const getAddonById = useCallback(
    (idOrSlug: string): AddonProduct | undefined => {
      if (!idOrSlug) return undefined;
      const clean = idOrSlug.trim().toLowerCase();
      return addons.find((p) => {
        const pId = p.id.toLowerCase();
        const pHref = p.href.toLowerCase().replace(/^\//, "");
        const pSlug = pHref.split("/").pop() || "";
        return (
          pId === clean ||
          pId.replace(/^addon-/, "") === clean.replace(/^addon-/, "") ||
          pSlug === clean.replace(/^\//, "") ||
          p.name.toLowerCase() === clean
        );
      });
    },
    [addons]
  );

  return (
    <AddonsContext.Provider
      value={{
        addons,
        categories,
        loading,
        refreshAddons: fetchAddons,
        getAddonById,
      }}
    >
      {children}
    </AddonsContext.Provider>
  );
}

export function useAddons() {
  return useContext(AddonsContext);
}

