"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface StoreSettings {
  store_name: string;
  store_tagline: string;
  store_logo: string;
  header_logo: string;
  footer_logo: string;
  store_favicon: string;
  brand_description: string;
  primary_color: string;
  secondary_color: string;
  store_phone: string;
  store_whatsapp: string;
  store_email: string;
  store_address: string;
  opening_hours: string;
  currency_symbol: string;
  [key: string]: string | undefined;
}

const defaultSettings: StoreSettings = {
  store_name: "Occassions",
  store_tagline: "Luxury Florist & Celebration Atelier",
  store_logo: "/images/occasions-logo.png",
  header_logo: "/images/occasions-logo.png",
  footer_logo: "/images/occasions-logo.png",
  store_favicon: "/favicon.ico",
  brand_description: "Bespoke floral arrangements, fresh bouquets, luxury cakes, and festive decor crafted in Calicut with love and precision.",
  primary_color: "#be185d",
  secondary_color: "#831843",
  store_phone: "+91 8606464700",
  store_whatsapp: "918606464700",
  store_email: "occassions.flowers@gmail.com",
  store_address: "Mavoor Road, Kozhikode (Calicut), Kerala 673004",
  opening_hours: "9:00 AM - 9:00 PM Daily",
  currency_symbol: "₹",
};

interface StoreSettingsContextType {
  settings: StoreSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  updateLocalSettings: (newSettings: Partial<StoreSettings>) => void;
}

const StoreSettingsContext = createContext<StoreSettingsContextType>({
  settings: defaultSettings,
  loading: false,
  refreshSettings: async () => {},
  updateLocalSettings: () => {},
});

export function StoreSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings((prev) => ({
          ...prev,
          ...data.settings,
        }));
      }
    } catch (err) {
      console.warn("Failed to fetch store settings, using defaults", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Dynamically apply primary/secondary colors and favicon
  useEffect(() => {
    if (typeof document !== "undefined") {
      // Dynamic colors
      if (settings.primary_color) {
        document.documentElement.style.setProperty("--brand-primary", settings.primary_color);
        document.documentElement.style.setProperty("--color-rose-dark", settings.primary_color);
        document.documentElement.style.setProperty("--color-rose", settings.primary_color);
      }
      if (settings.secondary_color) {
        document.documentElement.style.setProperty("--brand-secondary", settings.secondary_color);
      }

      // Dynamic favicon
      if (settings.store_favicon) {
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!link) {
          link = document.createElement("link");
          link.rel = "icon";
          document.head.appendChild(link);
        }
        link.href = settings.store_favicon;
      }
    }
  }, [settings.primary_color, settings.secondary_color, settings.store_favicon]);

  const updateLocalSettings = useCallback((newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
    }));
  }, []);

  return (
    <StoreSettingsContext.Provider
      value={{
        settings,
        loading,
        refreshSettings: fetchSettings,
        updateLocalSettings,
      }}
    >
      {children}
    </StoreSettingsContext.Provider>
  );
}

export function useStoreSettings() {
  return useContext(StoreSettingsContext);
}
