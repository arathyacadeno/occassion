"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Star,
  ChevronDown,
  ChevronUp,
  MapPin,
  X,
  Check,
  Minus,
  Plus,
  AlertTriangle,
} from "lucide-react";
import { Product, isFlowerBouquet, getPricePerFlower } from "@/data/catalog";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCheckout, CheckoutItem } from "@/context/CheckoutContext";
import { useAuth } from "@/context/AuthContext";
import { ADDON_PRODUCTS } from "@/components/RecommendedAddons";
import AddonModal from "@/components/AddonModal";
import styles from "./ProductInfo.module.css";

interface ProductVariant {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
}

interface ProductInfoProps {
  product: Product;
  onVariantChange?: (variant: ProductVariant) => void;
  selectedAddons?: Record<string, number>;
  onAddonChange?: (addons: Record<string, number>) => void;
}

type LocationSuggestion = {
  pinCode: string;
  area: string;
  district: string;
  state: string;
};

const EMPTY_DELIVERY_STATUS = {
  loading: false,
  serviceable: null as boolean | null,
  distance_km: null as number | null,
  delivery_charge: null as number | null,
  area: null as string | null,
  district: null as string | null,
  state: null as string | null,
  message: null as string | null,
  tier_label: null as string | null,
};

export default function ProductInfo({
  product,
  onVariantChange,
  selectedAddons = {},
  onAddonChange,
}: ProductInfoProps) {
  const { addItem } = useCart();
  const { startBuyNow } = useCheckout();
  const { isAuthenticated } = useAuth();

  const isLily =
    (product.category as string) === "lilies" ||
    (product.category as string) === "lily" ||
    product.name.toLowerCase().includes("lily") ||
    product.name.toLowerCase().includes("lilies") ||
    product.name.toLowerCase().includes("lilium");

  const isOrchid =
    (product.category as string) === "orchids" ||
    product.name.toLowerCase().includes("orchid") ||
    product.name.toLowerCase().includes("orchids");

  const isChrysanthemum =
    (product.category as string) === "chrysanthemums" ||
    (product.category as string) === "chrysanthemum" ||
    product.name.toLowerCase().includes("chrysanthemum") ||
    product.name.toLowerCase().includes("chrysanthemums");

  const isSunflower =
    (product.category as string) === "sunflowers" ||
    (product.category as string) === "sunflower" ||
    product.name.toLowerCase().includes("sunflower") ||
    product.name.toLowerCase().includes("sunflowers");

  const isRose =
    (product.category as string) === "roses" ||
    (product.category as string) === "rose" ||
    product.name.toLowerCase().includes("rose") ||
    product.name.toLowerCase().includes("roses");

  const isCarnation =
    (product.category as string) === "carnations" ||
    (product.category as string) === "carnation" ||
    product.name.toLowerCase().includes("carnation") ||
    product.name.toLowerCase().includes("carnations");

  const isGladiolus =
    (product.category as string) === "gladiolus" ||
    (product.category as string) === "gladioli" ||
    product.name.toLowerCase().includes("gladiol") ||
    (product.description && product.description.toLowerCase().includes("gladiol"));

  const isRajnigandha =
    (product.category as string) === "rajnigandha" ||
    (product.category as string) === "tuberose" ||
    product.name.toLowerCase().includes("rajnigandha") ||
    product.name.toLowerCase().includes("tuberose") ||
    (product.description && (product.description.toLowerCase().includes("rajnigandha") || product.description.toLowerCase().includes("tuberose")));

  const isStemBased = isOrchid || isChrysanthemum || isSunflower || isRose || isCarnation || isLily || isGladiolus || isRajnigandha;

  const isBouquet = isFlowerBouquet(product);
  const pricePerFlower = getPricePerFlower(product);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customFlowerQty, setCustomFlowerQty] = useState<number>(12);

  // Auto-activate customize mode if URL has ?customize=true
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("customize") === "true" && isBouquet) {
        setIsCustomMode(true);
      }
    }
  }, [isBouquet]);

  const [customStems, setCustomStems] = useState<number>(8);

  const isCake = product.category === "cakes";
  const isFlower = product.category === "flower" || isBouquet;
  const isWreath =
    product.category === "wreaths" ||
    product.id.includes("wreath") ||
    product.slug?.includes("wreath") ||
    product.name.toLowerCase().includes("wreath");

  // Resolve variants if explicitly defined, for cakes (weight options), or for lily products
  const variants: ProductVariant[] | null =
    product.variants && product.variants.length > 0
      ? product.variants
      : isCake
      ? [
          {
            id: "500g",
            name: "500g",
            price: Math.round(product.price * 0.55),
            image: product.image,
          },
          {
            id: "1kg",
            name: "1 KG",
            price: product.price,
            image: product.image,
          },
          {
            id: "1.5kg",
            name: "1.5 KG",
            price: Math.round(product.price * 1.45),
            image: product.image,
          },
          {
            id: "2kg",
            name: "2 KG",
            price: Math.round(product.price * 1.9),
            image: product.image,
          },
        ]
      : isStemBased
      ? [
          {
            id: "6-stems",
            name: "6 Stems",
            price: pricePerFlower * 6,
            image: product.images?.[0] || product.image,
          },
          {
            id: "12-stems",
            name: "12 Stems",
            price: pricePerFlower * 12,
            image: product.images?.[0] || product.image,
          },
          {
            id: "custom",
            name: "Custom",
            price: pricePerFlower * 12,
            image: product.images?.[0] || product.image,
          },
        ]
      : isBouquet
      ? [
          {
            id: "classic",
            name: "Classic",
            price: product.price,
            image: product.images?.[0] || product.image,
          },
          {
            id: "custom",
            name: "Customize",
            price: pricePerFlower * 12,
            image: product.images?.[0] || product.image,
          },
        ]
      : null;

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    variants
      ? isCake
        ? variants[1] || variants[0] // Default 1kg for cakes
        : variants[0]
      : null
  );

  const handleSelectVariant = (v: ProductVariant) => {
    setSelectedVariant(v);
    if (v.id === "custom") {
      setIsCustomMode(true);
    } else {
      setIsCustomMode(false);
    }
    onVariantChange?.(v);
  };

  const customBouquetPrice = pricePerFlower * customFlowerQty;

  const activePrice = isCustomMode
    ? customBouquetPrice
    : selectedVariant
    ? selectedVariant.price
    : product.price;

  const activeOriginalPrice = isCustomMode
    ? Math.round(customBouquetPrice * 1.15)
    : selectedVariant
    ? selectedVariant.originalPrice
    : product.originalPrice;

  const discountPercent =
    activeOriginalPrice && activeOriginalPrice > activePrice
      ? Math.round(((activeOriginalPrice - activePrice) / activeOriginalPrice) * 100)
      : 0;

  const [pinCode, setPinCode] = useState("");
  const [cakeMessage, setCakeMessage] = useState("");
  const [cardMessage, setCardMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState<{
    location?: string;
  }>({});
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Delivery check state
  const [deliveryStatus, setDeliveryStatus] = useState(EMPTY_DELIVERY_STATUS);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkDelivery = useCallback((queryOrPin: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = queryOrPin.trim();

    if (!q) {
      setDeliveryStatus(EMPTY_DELIVERY_STATUS);
      return;
    }

    setDeliveryStatus((prev) => ({ ...prev, loading: true }));

    debounceRef.current = setTimeout(async () => {
      try {
        const isSixDigits = /^\d{6}$/.test(q);
        const bodyPayload = isSixDigits ? { pinCode: q } : { query: q };
        const res = await fetch("/api/delivery/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyPayload),
        });
        const data = await res.json();
        if (data.pinCode) {
          setPinCode(data.pinCode);
        }
        setDeliveryStatus({
          loading: false,
          serviceable: data.serviceable,
          distance_km: data.distance_km,
          delivery_charge: data.delivery_charge,
          area: data.area,
          district: data.district,
          state: data.state,
          message: data.message,
          tier_label: data.tier_label,
        });
      } catch {
        setDeliveryStatus({
          ...EMPTY_DELIVERY_STATUS,
          serviceable: false,
          message: "Unable to check delivery. Please try again.",
        });
      }
    }, 350);
  }, []);

  const [isPinFocused, setIsPinFocused] = useState(false);
  const [typedInput, setTypedInput] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchAbortRef = useRef<AbortController | null>(null);
  const suggestionsListRef = useRef<HTMLDivElement>(null);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const deliveryWrapperRef = useRef<HTMLDivElement>(null);
  const pinInputRef = useRef<HTMLInputElement>(null);

  // Close country dropdown on outside click
  useEffect(() => {
    if (!showCountryDropdown) return;
    const handler = (e: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target as Node)) {
        setShowCountryDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showCountryDropdown]);

  // Close location suggestions on outside click
  useEffect(() => {
    if (!showSuggestions) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (deliveryWrapperRef.current && !deliveryWrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
        setIsPinFocused(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [showSuggestions]);

  // Reset highlight whenever a new list arrives
  useEffect(() => {
    setActiveIndex(-1);
  }, [suggestions]);

  // Keep highlighted item visible while using arrow keys
  useEffect(() => {
    if (activeIndex < 0 || !suggestionsListRef.current) return;
    const el = suggestionsListRef.current.querySelector<HTMLElement>(
      `[data-index="${activeIndex}"]`
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const searchLocationQuery = useCallback((query: string) => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchAbortRef.current?.abort();

    const q = query.trim();
    if (q.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    searchDebounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      searchAbortRef.current = controller;
      try {
        const res = await fetch(
          `/api/delivery/check?q=${encodeURIComponent(q)}`,
          { signal: controller.signal, cache: "no-store" }
        );
        if (!res.ok) throw new Error("Bad response");
        const data = await res.json();
        const list: LocationSuggestion[] = Array.isArray(data.suggestions)
          ? data.suggestions
          : [];
        setSuggestions(list);
        setShowSuggestions(list.length > 0);
        if (list.length === 0 && q.length >= 2) {
          checkDelivery(q);
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setSuggestions([]);
        setShowSuggestions(false);
        if (q.length >= 2) {
          checkDelivery(q);
        }
      }
    }, 150);
  }, [checkDelivery]);

  const handleSelectLocation = (item: LocationSuggestion) => {
    // Cancel any pending search so it can't reopen the dropdown
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchAbortRef.current?.abort();

    setPinCode(item.pinCode);
    const formatted = `${item.pinCode}, ${item.area}, ${item.district || item.state || "Kerala"}, India`;
    setTypedInput(formatted);
    setValidationErrors((prev) => ({ ...prev, location: undefined }));
    setShowSuggestions(false);
    setIsPinFocused(false);
    setActiveIndex(-1);
    setDeliveryStatus((prev) => ({
      ...prev,
      loading: true,
      area: item.area,
      district: item.district,
      state: item.state,
    }));
    checkDelivery(item.pinCode);
  };

  // Automatically fetch location on mount if PIN is set
  useEffect(() => {
    if (pinCode) {
      checkDelivery(pinCode);
    }
  }, [checkDelivery]);

  const { isInWishlist, toggleItem } = useWishlist();
  const isWishlisted = isInWishlist(product.id);

  const handleToggleWishlist = () => {
    toggleItem(product);
  };

  // 3 independent accordion states (default closed matching design)
  const [openAccordions, setOpenAccordions] = useState<{
    description: boolean;
    instructions: boolean;
    delivery: boolean;
  }>({
    description: false,
    instructions: false,
    delivery: false,
  });

  const toggleAccordion = (key: "description" | "instructions" | "delivery") => {
    setOpenAccordions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const validateForm = () => {
    const errors: { location?: string } = {};
    let isValid = true;

    if (!pinCode) {
      errors.location = "Please enter a valid Delivery Location pincode before proceeding.";
      isValid = false;
    } else if (deliveryStatus.serviceable === false) {
      errors.location = "Sorry, we cannot deliver to this location.";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleAddToCart = () => {
    if (!validateForm()) return;

    if (isCustomMode && (isBouquet || isStemBased)) {
      addItem(
        {
          id: `${product.id}-custom-${customFlowerQty}`,
          slug: product.slug,
          category: product.category,
          name: `${product.name} (Custom Bouquet)`,
          subtitle: `${customFlowerQty} ${isStemBased ? "Stems" : "Flowers"} @ ₹${pricePerFlower}/${isStemBased ? "stem" : "flower"}`,
          price: activePrice,
          image: product.image,
          occasion: "celebration",
          rating: product.rating,
          reviewsCount: product.reviewsCount,
          stems: [`${customFlowerQty} Hand-Picked Fresh ${isOrchid ? "Orchid Stems" : isChrysanthemum ? "Chrysanthemum Stems" : isSunflower ? "Sunflower Stems" : isRose ? "Rose Stems" : isCarnation ? "Carnation Stems" : isLily ? "Lily Stems" : isGladiolus ? "Gladiolus Stems" : isRajnigandha ? "Rajnigandha Stems" : "Blooms"}`],
          description: `Customized arrangement with ${customFlowerQty} ${isStemBased ? "stems" : "flowers"}. (Price: ₹${pricePerFlower}/${isStemBased ? "stem" : "flower"} × ${customFlowerQty} = ₹${activePrice})`,
          flowerCount: `${customFlowerQty} ${isStemBased ? "Stems" : "Flowers"}`,
          scent: "Fresh & Green",
          badge: "Custom Bouquet",
          dimensions: "45cm H × 35cm W",
        },
        "Signature",
        false,
        cardMessage ? `Message on Card: ${cardMessage}` : undefined,
        quantity
      );
    } else {
      addItem(
        {
          id: product.id,
          slug: product.slug,
          category: product.category,
          name: product.name,
          subtitle: selectedVariant
            ? selectedVariant.id === "custom"
              ? `${customStems} Stems (Custom Arrangement)`
              : `${selectedVariant.name} Arrangement`
            : product.categoryLabel,
          price: activePrice,
          image: selectedVariant ? selectedVariant.image : product.image,
          occasion: "celebration",
          rating: product.rating,
          reviewsCount: product.reviewsCount,
          stems: product.includes || [],
          description: product.description,
          flowerCount: selectedVariant
            ? selectedVariant.id === "custom"
              ? `${customStems} Stems`
              : `${selectedVariant.name}`
            : `${product.includes?.length || 12} items`,
          scent: "Fresh & Green",
          badge: product.badge,
          dimensions: "45cm H × 35cm W",
        },
        "Signature",
        false,
        isCake && cakeMessage ? `Message on Cake: ${cakeMessage}` : (isFlower && cardMessage ? `Message on Card: ${cardMessage}` : undefined),
        quantity
      );
    }

    // Add selected addons
    if (selectedAddons) {
      Object.entries(selectedAddons).forEach(([addonId, qty]) => {
        if (qty > 0) {
          const addon = ADDON_PRODUCTS.find((p) => p.id === addonId);
          if (addon) {
            addItem(
              {
                id: addon.id,
                name: addon.name,
                subtitle: "Recommended Addon",
                price: addon.price,
                image: addon.image,
                occasion: "celebration",
                rating: 5.0,
                reviewsCount: 42,
                stems: [],
                flowerCount: "1 item",
                description: addon.name,
                scent: "Fresh & Green",
                dimensions: "Standard",
              },
              "Signature",
              false,
              undefined,
              qty
            );
          }
        }
      });
      if (onAddonChange) {
        onAddonChange({});
      }
    }

    setAddedFeedback(true);
    setTimeout(() => {
      setAddedFeedback(false);
    }, 2200);
  };

  const [isBuyNowAddonOpen, setIsBuyNowAddonOpen] = useState(false);

  const handleBuyNow = () => {
    if (!validateForm()) return;
    if (isWreath) {
      proceedToCheckout({});
      return;
    }
    setIsBuyNowAddonOpen(true);
  };

  const proceedToCheckout = (customAddons?: Record<string, number>) => {
    setIsBuyNowAddonOpen(false);

    const activeAddonsMap = customAddons !== undefined ? customAddons : (selectedAddons || {});

    const mainItem: CheckoutItem = {
      id: isCustomMode && (isBouquet || isStemBased) ? `${product.id}-custom-${customFlowerQty}` : product.id,
      slug: product.slug,
      name: isCustomMode && (isBouquet || isStemBased)
        ? `${product.name} (Custom: ${customFlowerQty} ${isStemBased ? "Stems" : "Flowers"})`
        : product.name,
      category: product.category,
      price: activePrice,
      image: selectedVariant ? selectedVariant.image : product.image,
      quantity: quantity,
      subtitle: isCake && cakeMessage ? `Message on Cake: ${cakeMessage}` : (isFlower && cardMessage ? `Message on Card: ${cardMessage}` : undefined),
    };

    const addonItems: CheckoutItem[] = [];
    Object.entries(activeAddonsMap).forEach(([addonId, qty]) => {
      if (qty > 0) {
        const addon = ADDON_PRODUCTS.find((p) => p.id === addonId);
        if (addon) {
          addonItems.push({
            id: addon.id,
            slug: addon.id,
            name: addon.name,
            category: addon.category,
            price: addon.price,
            image: addon.image,
            quantity: qty,
            subtitle: "Recommended Addon",
          });
        }
      }
    });

    startBuyNow(mainItem, addonItems);
  };

  return (
    <div className={styles.infoWrapper}>
      {/* Title (22-24px, weight 500) */}
      <h1 className={styles.productName}>{product.name}</h1>

      {/* Rating Badge */}
      <div className={styles.ratingDeliveryRow}>
        <div className={styles.greenRatingBadge}>
          <Star size={9} fill="#ffffff" color="#ffffff" strokeWidth={0} />
          <span>{(product.rating || 4.4).toFixed(1)}</span>
        </div>
      </div>

      {/* Price: ₹549 in bold with old price struck through in grey beside it */}
      <div className={styles.pricingRow}>
          <span className={styles.currentPrice}>
            ₹{activePrice.toLocaleString("en-IN")}
          </span>
        </div>

      {/* Available Combos / Weight options for Cakes & Variants */}
      {variants && variants.length > 0 && (
        <div className={styles.giftExtraSection}>
          <h3 className={styles.giftExtraTitle}>
            {isCake ? "Available Combos" : "Make this gift extra special"}
          </h3>
          <div className={styles.giftVariantCards}>
            {variants.map((v) => {
              const isSelected = selectedVariant?.id === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => handleSelectVariant(v)}
                  className={`${styles.giftVariantCard} ${
                    isSelected ? styles.giftVariantCardSelected : ""
                  }`}
                  aria-pressed={isSelected}
                >
                  <div className={styles.giftCardThumbWrap}>
                    <img
                      src={v.image || product.image}
                      alt={v.name}
                      className={styles.giftCardThumbImg}
                    />
                  </div>
                  <div className={styles.giftCardInfo}>
                    <span className={styles.giftCardName}>{v.name}</span>
                    <span className={styles.giftCardPrice}>
                      ₹{(v.id === "custom" && isCustomMode ? customBouquetPrice : v.price).toLocaleString("en-IN")}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* If customize mode is explicitly activated via ?customize=true, display customizer */}
      {isCustomMode && (
        <div className={styles.customBouquetSection}>
          <div className={styles.customPanel}>
            <div className={styles.customInfoRow}>
              <span className={styles.pricePerFlowerLabel}>{isStemBased ? "Price per Stem:" : "Flower Unit Price:"}</span>
              <span className={styles.pricePerFlowerValue}>
                ₹ {pricePerFlower}{" "}
                <span className={styles.perUnitText}>{isStemBased ? "/ stem" : "/ flower"}</span>
              </span>
            </div>

            <div className={styles.stemStepperRow}>
              <span className={styles.stepperLabel}>{isStemBased ? "Select Number of Stems:" : "Select Number of Flowers:"}</span>
              <div className={styles.stepperControls}>
                <button
                  type="button"
                  className={styles.stepperBtn}
                  onClick={() => setCustomFlowerQty((prev) => Math.max(3, prev - 1))}
                  disabled={customFlowerQty <= 3}
                  aria-label="Decrease flower quantity"
                >
                  <Minus size={14} />
                </button>
                <input
                  type="number"
                  min={3}
                  max={100}
                  value={customFlowerQty}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) {
                      setCustomFlowerQty(Math.max(1, Math.min(100, val)));
                    }
                  }}
                  className={styles.stepperInput}
                  aria-label="Flower quantity"
                />
                <button
                  type="button"
                  className={styles.stepperBtn}
                  onClick={() => setCustomFlowerQty((prev) => Math.min(100, prev + 1))}
                  disabled={customFlowerQty >= 100}
                  aria-label="Increase flower quantity"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Choose Delivery Preference */}
      <div className={styles.preferenceSection}>
        <h3 className={styles.sectionHeading}>Choose Delivery Preference</h3>

        <div className={styles.locationSubtitle}>
          <MapPin size={15} className={styles.pinIcon} />
          <span>Delivery Location</span>
        </div>

        {/* 1. Location Pill with Country Flag & Autocomplete for Location/PIN */}
        <div className={styles.deliveryPillWrapper} ref={deliveryWrapperRef}>
          <div
            className={`${styles.deliveryPill} ${
              deliveryStatus.serviceable === false ? styles.deliveryPillError : ""
            }`}
            onClick={(e) => {
              if (countryDropdownRef.current?.contains(e.target as Node)) return;
              pinInputRef.current?.focus();
            }}
          >
            {/* Country Selector with dropdown */}
            <div className={styles.countrySelectorWrapper} ref={countryDropdownRef}>
              <button
                type="button"
                className={styles.countrySelector}
                onClick={() => setShowCountryDropdown((v) => !v)}
                aria-label="Select delivery country"
                aria-expanded={showCountryDropdown}
              >
                <span className={styles.flagIcon}>
                  <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                    <rect width="20" height="4.67" fill="#FF9933" rx="1" />
                    <rect y="4.67" width="20" height="4.67" fill="#FFFFFF" />
                    <rect y="9.33" width="20" height="4.67" fill="#138808" rx="1" />
                    <circle cx="10" cy="7" r="1.8" stroke="#000080" strokeWidth="0.6" fill="none" />
                  </svg>
                </span>
                <span className={styles.countryCode}>IND</span>
                <ChevronDown
                  size={13}
                  className={`${styles.countryChevron} ${
                    showCountryDropdown ? styles.countryChevronOpen : ""
                  }`}
                />
              </button>

              {/* Country Dropdown Popover */}
              {showCountryDropdown && (
                <div className={styles.countryDropdown}>
                  <div className={styles.countryDropdownHeader}>Delivery Region</div>
                  <div className={styles.countryDropdownItem}>
                    <span className={styles.countryDropdownFlag}>
                      <svg width="22" height="15" viewBox="0 0 20 14" fill="none">
                        <rect width="20" height="4.67" fill="#FF9933" rx="1" />
                        <rect y="4.67" width="20" height="4.67" fill="#FFFFFF" />
                        <rect y="9.33" width="20" height="4.67" fill="#138808" rx="1" />
                        <circle cx="10" cy="7" r="1.8" stroke="#000080" strokeWidth="0.6" fill="none" />
                      </svg>
                    </span>
                    <div className={styles.countryDropdownInfo}>
                      <span className={styles.countryDropdownName}>India</span>
                      <span className={styles.countryDropdownSub}>Currently delivering across Kerala</span>
                    </div>
                    <span className={styles.countryDropdownActive}>✓</span>
                  </div>
                  <div className={styles.countryDropdownDivider} />
                  <div className={styles.countryDropdownFooter}>More regions coming soon</div>
                </div>
              )}
            </div>

            <span className={styles.pillDivider} />

            <input
              ref={pinInputRef}
              type="text"
              value={
                isPinFocused
                  ? typedInput
                  : pinCode && deliveryStatus.area
                  ? `${pinCode}, ${deliveryStatus.area}, ${
                      deliveryStatus.district || deliveryStatus.state || "Kerala"
                    }, India`
                  : typedInput || pinCode
              }
              onFocus={() => {
                setIsPinFocused(true);
                const q = typedInput || pinCode;
                if (q && q.length >= 1) {
                  searchLocationQuery(q);
                }
              }}
              onBlur={() => {
                setTimeout(() => {
                  setIsPinFocused(false);
                  setShowSuggestions(false);
                  const trimmed = typedInput.trim();
                  if (trimmed && trimmed.length >= 2 && !pinCode) {
                    checkDelivery(trimmed);
                  }
                }, 200);
              }}
              onChange={(e) => {
                let val = e.target.value;
                const cleanDigits = val.replace(/\D/g, "");

                // If editing a formatted string and digits changed, strip the old city text
                if (val.includes(",") && cleanDigits !== pinCode) {
                  val = cleanDigits;
                }

                setTypedInput(val);
                setValidationErrors((prev) => ({ ...prev, location: undefined }));

                if (!val.trim()) {
                  setDeliveryStatus(EMPTY_DELIVERY_STATUS);
                  setPinCode("");
                  setSuggestions([]);
                  setShowSuggestions(false);
                  return;
                }

                searchLocationQuery(val);

                if (/^\d{6}$/.test(cleanDigits)) {
                  setPinCode(cleanDigits);
                  checkDelivery(cleanDigits);
                } else if (pinCode) {
                  setPinCode("");
                }
              }}
              onKeyDown={(e) => {
                const hasList = showSuggestions && suggestions.length > 0;

                if (e.key === "ArrowDown") {
                  if (suggestions.length === 0) return;
                  e.preventDefault();
                  if (!showSuggestions) {
                    setShowSuggestions(true);
                    setActiveIndex(0);
                    return;
                  }
                  setActiveIndex((i) => (i + 1) % suggestions.length);
                  return;
                }

                if (e.key === "ArrowUp") {
                  if (!hasList) return;
                  e.preventDefault();
                  setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
                  return;
                }

                if (e.key === "Escape") {
                  setShowSuggestions(false);
                  setActiveIndex(-1);
                  return;
                }

                if (e.key === "Enter") {
                  e.preventDefault();
                  if (hasList) {
                    // Pick the highlighted one, or the first if none is highlighted
                    handleSelectLocation(suggestions[activeIndex >= 0 ? activeIndex : 0]);
                  } else if (typedInput) {
                    checkDelivery(typedInput);
                    setShowSuggestions(false);
                  }
                }
              }}
              className={styles.pillInput}
              placeholder="Enter PIN code or Location"
              aria-label="Delivery Location"
              role="combobox"
              aria-expanded={showSuggestions}
              aria-controls="location-suggestions"
              aria-autocomplete="list"
              aria-activedescendant={
                activeIndex >= 0 ? `location-option-${activeIndex}` : undefined
              }
              autoComplete="off"
            />

            {deliveryStatus.loading && (
              <span className={styles.deliveryLoading}>…</span>
            )}

            {!deliveryStatus.loading && (pinCode || typedInput) && (
              <button
                type="button"
                onClick={() => {
                  setPinCode("");
                  setTypedInput("");
                  setIsPinFocused(true);
                  setSuggestions([]);
                  setShowSuggestions(false);
                  setActiveIndex(-1);
                  setValidationErrors((prev) => ({ ...prev, location: undefined }));
                  setDeliveryStatus(EMPTY_DELIVERY_STATUS);
                }}
                className={styles.clearCircleBtn}
                aria-label="Clear location"
              >
                <X size={11} strokeWidth={2.6} />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown for Location / PIN */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              id="location-suggestions"
              ref={suggestionsListRef}
              role="listbox"
              className={styles.suggestionsDropdown}
              onMouseDown={(e) => e.preventDefault()}
            >
              {suggestions.map((item, idx) => (
                <div
                  key={`${item.pinCode}-${item.area}-${idx}`}
                  id={`location-option-${idx}`}
                  data-index={idx}
                  role="option"
                  aria-selected={idx === activeIndex}
                  className={`${styles.suggestionItem} ${
                    idx === activeIndex ? styles.suggestionItemActive : ""
                  }`}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelectLocation(item);
                  }}
                >
                  <MapPin size={13} className={styles.suggestionIcon} />
                  <div className={styles.suggestionInfo}>
                    <span className={styles.suggestionArea}>{item.area}</span>
                    <span className={styles.suggestionDistrict}>
                      {item.district ? `, ${item.district}` : ""}
                    </span>
                  </div>
                  <span className={styles.suggestionPin}>{item.pinCode}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {validationErrors.location && (
          <div className={styles.validationError}>
            <AlertTriangle size={13} strokeWidth={2.5} color="#d9381e" />
            <span>{validationErrors.location}</span>
          </div>
        )}

        {/* Warning text when location is unavailable */}
        {!deliveryStatus.loading && deliveryStatus.serviceable === false && (
          <div
            className={styles.unavailableWarning}
            onClick={() => {
              document
                .getElementById("similar-products")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            role="alert"
          >
            <AlertTriangle
              size={13}
              className={styles.warningIcon}
              fill="#d9381e"
              stroke="#d9381e"
              color="#ffffff"
            />
            <span>
              This item isn&apos;t available at this location. Tap below to explore
              available gifts.
            </span>
          </div>
        )}


        {/* Cake Message Input (Only for cakes) */}
        {isCake && (
          <div className={styles.cakeMessageRow}>
            <label className={styles.dropdownLabel}>Message on Cake</label>
            <div className={styles.dropdownPill}>
              <input
                type="text"
                value={cakeMessage}
                onChange={(e) => setCakeMessage(e.target.value)}
                placeholder="e.g. Happy Birthday!"
                className={styles.cakeMessageInput}
                maxLength={40}
                aria-label="Message on Cake"
              />
            </div>
          </div>
        )}

        {/* Card Message Input (Only for flowers) */}
        {isFlower && (
          <div className={styles.cakeMessageRow}>
            <label className={styles.dropdownLabel}>Message on Card</label>
            <div className={styles.dropdownPill}>
              <input
                type="text"
                value={cardMessage}
                onChange={(e) => setCardMessage(e.target.value)}
                placeholder="e.g. With love on your special day!"
                className={styles.cakeMessageInput}
                maxLength={100}
                aria-label="Message on Card"
              />
            </div>
          </div>
        )}
      </div>

      {/* About the product heading + 3 Standalone White Rounded Accordions */}
      <div className={styles.aboutProductSection}>
        <h3 className={styles.sectionHeading}>About the product</h3>
        <div className={styles.accordionContainer}>
          {/* Accordion 1: Description */}
          <div className={styles.accordionCard}>
            <button
              type="button"
              onClick={() => toggleAccordion("description")}
              className={styles.accordionBtn}
              aria-expanded={openAccordions.description}
            >
              <span className={styles.accordionTitle}>Description</span>
              {openAccordions.description ? (
                <ChevronUp size={14} className={styles.accordionChevron} />
              ) : (
                <ChevronDown size={14} className={styles.accordionChevron} />
              )}
            </button>

            {openAccordions.description && (
              <div className={styles.accordionBody}>
                <p className={styles.bodyParagraph}>
                  {product.description ||
                    "Brighten their special day with the cheerful charm of radiant flowers beautifully arranged to spread happiness, warmth, and joy. A vibrant bouquet perfect for making celebrations feel extra special."}
                </p>

                {product.includes && product.includes.length > 0 && (
                  <>
                    <h4 className={styles.bodySubHeading}>Product Details:</h4>
                    <ul className={styles.bulletList}>
                      {product.includes.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Accordion 2: Instructions */}
          <div className={styles.accordionCard}>
            <button
              type="button"
              onClick={() => toggleAccordion("instructions")}
              className={styles.accordionBtn}
              aria-expanded={openAccordions.instructions}
            >
              <span className={styles.accordionTitle}>Instructions</span>
              {openAccordions.instructions ? (
                <ChevronUp size={14} className={styles.accordionChevron} />
              ) : (
                <ChevronDown size={14} className={styles.accordionChevron} />
              )}
            </button>

            {openAccordions.instructions && (
              <div className={styles.accordionBody}>
                <ul className={styles.bulletList}>
                  <li>
                    When your flowers arrive, simply cut the stems and put them in fresh water.
                  </li>
                  <li>
                    Cut the stems at 45 degrees, about 1-2 inches from the bottom.
                  </li>
                  <li>Remove the leaves below the waterline.</li>
                  <li>Check the water level every day and add more if necessary.</li>
                  <li>Do not place flowers in direct sunlight or near excessive heat.</li>
                  <li>All flowers benefit from a daily mist of fresh water.</li>
                  <li>Enjoy your flowers!</li>
                </ul>
                <h4 className={styles.bodySubHeading} style={{ marginTop: "14px" }}>
                  Care &amp; Delivery:
                </h4>
                <p className={styles.bodyParagraph} style={{ marginBottom: 0 }}>
                  Handcrafted fresh floral arrangements by Occassions Florist, Calicut.
                </p>
              </div>
            )}
          </div>

          {/* Accordion 3: Delivery Info */}
          <div className={styles.accordionCard}>
            <button
              type="button"
              onClick={() => toggleAccordion("delivery")}
              className={styles.accordionBtn}
              aria-expanded={openAccordions.delivery}
            >
              <span className={styles.accordionTitle}>Delivery Info</span>
              {openAccordions.delivery ? (
                <ChevronUp size={14} className={styles.accordionChevron} />
              ) : (
                <ChevronDown size={14} className={styles.accordionChevron} />
              )}
            </button>

            {openAccordions.delivery && (
              <div className={styles.accordionBody}>
                <ul className={styles.bulletList}>
                  <li>
                    The image displayed is indicative in nature. Actual product may vary in design based on availability.
                  </li>
                  <li>
                    Flowers may be delivered in fully bloomed, semi-bloomed, or bud stage for maximum vase life.
                  </li>
                  <li>
                    The chosen delivery time is an estimate and depends on local availability and distance.
                  </li>
                  <li>
                    Since fresh flowers are perishable, we attempt delivery of your order once to the designated location.
                  </li>
                  <li>
                    This product is hand delivered directly By Occasions.
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Purchase Controls: Quantity Selector + Add to Cart (Row 1), Buy Now (Row 2) */}
      <div className={styles.purchaseControlsWrapper}>
        {/* Row 1: Quantity on Left + Add to Cart on Right */}
        <div className={styles.qtyAndCartRow}>
          <div className={styles.quantityStepper}>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className={styles.qtyStepperBtn}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
            >
              <Minus size={13} strokeWidth={2.2} />
            </button>
            <span className={styles.qtyValue}>{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className={styles.qtyStepperBtn}
              aria-label="Increase quantity"
            >
              <Plus size={13} strokeWidth={2.2} />
            </button>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className={`${styles.addToCartBtn} ${
              addedFeedback ? styles.addedSuccess : ""
            }`}
          >
            {addedFeedback ? (
              <>
                <Check size={15} strokeWidth={2.5} />
                <span>Added to Cart!</span>
              </>
            ) : (
              <span>Add to Cart</span>
            )}
          </button>
        </div>

        {/* Row 2: Buy Now Button */}
        <button
          type="button"
          onClick={handleBuyNow}
          className={styles.buyNowBtn}
        >
          <span>Buy Now</span>
        </button>
      </div>

      {/* Buy Now Add-on Products Modal Popup */}
      <AddonModal
        isOpen={isBuyNowAddonOpen}
        onClose={() => setIsBuyNowAddonOpen(false)}
        selectedAddons={selectedAddons}
        onAddonChange={onAddonChange || (() => {})}
        mainCategory={product.category}
        isBuyNow={true}
        basePrice={activePrice}
        quantity={quantity}
        onProceed={() => proceedToCheckout(selectedAddons)}
        onSkip={() => proceedToCheckout({})}
      />
    </div>
  );
}