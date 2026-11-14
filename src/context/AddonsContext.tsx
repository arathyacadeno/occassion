"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AddonProduct, ADDON_PRODUCTS } from "@/data/addons";

interface AddonsContextType {
  addons: AddonProduct[];
  loading: boolean;
  refreshAddons: () => Promise<void>;
  getAddonById: (idOrSlug: string) => AddonProduct | undefined;
}

const AddonsContext = createContext<AddonsContextType>({
  addons: ADDON_PRODUCTS,
  loading: false,
  refreshAddons: async () => {},
  getAddonById: (idOrSlug: string) =>
    ADDON_PRODUCTS.find((p) => p.id === idOrSlug || p.id === `addon-${idOrSlug}`),
});

export function AddonsProvider({ children }: { children: React.ReactNode }) {
  const [addons, setAddons] = useState<AddonProduct[]>(ADDON_PRODUCTS);
  const [loading, setLoading] = useState(false);

  const fetchAddons = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/addons", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (data?.success && Array.isArray(data.addons) && data.addons.length > 0) {
          setAddons(data.addons);
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
