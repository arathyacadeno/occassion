"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Star,
  ChevronDown,
  ChevronUp,
  MapPin,
  X,
  Truck,
  ShoppingCart,
  Check,
  Info,
  Minus,
  Plus,
  Heart,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { Product, isFlowerBouquet, getPricePerFlower } from "@/data/catalog";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCheckout, CheckoutItem } from "@/context/CheckoutContext";
import { ADDON_PRODUCTS } from "@/components/RecommendedAddons";
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
}

export default function ProductInfo({
  product,
  onVariantChange,
  selectedAddons,
}: ProductInfoProps) {
  const { addItem } = useCart();
  const { startBuyNow } = useCheckout();

  const isLily =
    (product.category as string) === "lilies" ||
    product.name.toLowerCase().includes("lily") ||
    product.name.toLowerCase().includes("lilies");

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

  // Resolve variants if explicitly defined or for lily products
  const variants: ProductVariant[] | null =
    product.variants && product.variants.length > 0
      ? product.variants
      : isLily
      ? [
          {
            id: "6-stems",
            name: "6 Stems",
            price: 695,
            originalPrice: 795,
            image: "/images/lily-6-stems.png",
          },
          {
            id: "12-stems",
            name: "12 Stems",
            price: 1195,
            originalPrice: 1395,
            image: "/images/lily-12-stems.png",
          },
          {
            id: "custom",
            name: "Custom",
            price: 695,
            originalPrice: 795,
            image: "/images/lily-custom-stems.png",
          },
        ]
      : null;

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    variants ? variants[0] : null
  );

  const handleSelectVariant = (v: ProductVariant) => {
    setSelectedVariant(v);
    onVariantChange?.(v);
  };

  const customBouquetPrice = pricePerFlower * customFlowerQty;

  const activePrice = isCustomMode && isBouquet
    ? customBouquetPrice
    : selectedVariant
    ? selectedVariant.id === "custom"
      ? customStems * 100
      : selectedVariant.price
    : product.price;

  const activeOriginalPrice = isCustomMode && isBouquet
    ? Math.round(customBouquetPrice * 1.15)
    : selectedVariant
    ? selectedVariant.id === "custom"
      ? Math.round(customStems * 100 * 1.15)
      : selectedVariant.originalPrice
    : product.originalPrice;

  const discountPercent =
    activeOriginalPrice && activeOriginalPrice > activePrice
      ? Math.round(((activeOriginalPrice - activePrice) / activeOriginalPrice) * 100)
      : 0;

  const [pinCode, setPinCode] = useState("673602");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Delivery check state
  const [deliveryStatus, setDeliveryStatus] = useState<{
    loading: boolean;
    serviceable: boolean | null;
    distance_km: number | null;
    delivery_charge: number | null;
    area: string | null;
    district: string | null;
    state: string | null;
    message: string | null;
    tier_label: string | null;
  }>({
    loading: false,
    serviceable: null,
    distance_km: null,
    delivery_charge: null,
    area: null,
    district: null,
    state: null,
    message: null,
    tier_label: null,
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkDelivery = useCallback((queryOrPin: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = queryOrPin.trim();

    if (!q) {
      setDeliveryStatus({
        loading: false,
        serviceable: null,
        distance_km: null,
        delivery_charge: null,
        area: null,
        district: null,
        state: null,
        message: null,
        tier_label: null,
      });
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
          loading: false,
          serviceable: false,
          distance_km: null,
          delivery_charge: null,
          area: null,
          district: null,
          state: null,
          message: "Unable to check delivery. Please try again.",
          tier_label: null,
        });
      }
    }, 350);
  }, []);

  const [isPinFocused, setIsPinFocused] = useState(false);
  const [typedInput, setTypedInput] = useState("");
  const [suggestions, setSuggestions] = useState<
    Array<{ pinCode: string; area: string; district: string; state: string }>
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchLocationQuery = useCallback((query: string) => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    const q = query.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    searchDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/delivery/check?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (data.suggestions && data.suggestions.length > 0) {
          setSuggestions(data.suggestions);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 150);
  }, []);

  const handleSelectLocation = (item: {
    pinCode: string;
    area: string;
    district: string;
    state: string;
  }) => {
    setPinCode(item.pinCode);
    setTypedInput("");
    setShowSuggestions(false);
    setIsPinFocused(false);
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

  const handleAddToCart = () => {
    if (isCustomMode && isBouquet) {
      addItem(
        {
          id: `${product.id}-custom-${customFlowerQty}`,
          slug: product.slug,
          category: product.category,
          name: `${product.name} (Custom Bouquet)`,
          subtitle: `${customFlowerQty} Flowers @ ₹${pricePerFlower}/flower`,
          price: activePrice,
          originalPrice: activeOriginalPrice,
          image: product.image,
          occasion: "celebration",
          rating: product.rating,
          reviewsCount: product.reviewsCount,
          stems: [`${customFlowerQty} Hand-Picked Fresh Blooms`],
          description: `Customized arrangement with ${customFlowerQty} flowers. (Price: ₹${pricePerFlower}/flower × ${customFlowerQty} = ₹${activePrice})`,
          flowerCount: `${customFlowerQty} Flowers`,
          scent: "Fresh & Green",
          badge: "Custom Bouquet",
          dimensions: "45cm H × 35cm W",
        },
        "Signature",
        false,
        undefined,
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
          originalPrice: activeOriginalPrice,
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
        undefined,
        quantity
      );
    }

    setAddedFeedback(true);
    setTimeout(() => {
      setAddedFeedback(false);
    }, 2200);
  };

  const handleBuyNow = () => {
    const mainItem: CheckoutItem = {
      id: isCustomMode && isBouquet ? `${product.id}-custom-${customFlowerQty}` : product.id,
      slug: product.slug,
      name: isCustomMode && isBouquet
        ? `${product.name} (Custom: ${customFlowerQty} Flowers)`
        : product.name,
      category: product.category,
      price: activePrice,
      originalPrice: activeOriginalPrice,
      image: selectedVariant ? selectedVariant.image : product.image,
      quantity: quantity,
    };

    const addonItems: CheckoutItem[] = [];
    if (selectedAddons) {
      Object.entries(selectedAddons).forEach(([addonId, qty]) => {
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
    }

    startBuyNow(mainItem, addonItems);
  };

  return (
    <div className={styles.infoWrapper}>
      {/* Title (22-24px, weight 500) */}
      <h1 className={styles.productName}>{product.name}</h1>

      {/* Rating & Delivery Row: ★ 4.4 [green badge] Free Delivery [truck] */}
      <div className={styles.ratingDeliveryRow}>
        <div className={styles.greenRatingBadge}>
          <Star size={9} fill="#ffffff" color="#ffffff" strokeWidth={0} />
          <span>{(product.rating || 4.4).toFixed(1)}</span>
        </div>
        <div className={styles.freeDeliveryCallout}>
          <span>Free Delivery</span>
          <Truck size={13} strokeWidth={1.5} className={styles.truckIcon} />
        </div>
      </div>

      {/* Price: ₹549 in bold with old price struck through in grey beside it */}
      <div className={styles.pricingRow}>
        <span className={styles.currentPrice}>
          ₹{activePrice.toLocaleString("en-IN")}
        </span>
        {activeOriginalPrice && (
          <span className={styles.originalPrice}>
            ₹{activeOriginalPrice.toLocaleString("en-IN")}
          </span>
        )}
      </div>

      {/* If customize mode is explicitly activated via ?customize=true, display customizer */}
      {isBouquet && isCustomMode && (
        <div className={styles.customBouquetSection}>
          <div className={styles.customHeaderRow}>
            <div className={styles.customHeaderTitleWrap}>
              <span className={styles.customBadge}>Custom Floral Arrangement</span>
              <h3 className={styles.customHeading}>Customize Bouquet</h3>
            </div>
            <button
              type="button"
              className={styles.customToggleBtn}
              onClick={() => setIsCustomMode(false)}
            >
              Reset to Standard
            </button>
          </div>

          <div className={styles.customPanel}>
            <div className={styles.customInfoRow}>
              <span className={styles.pricePerFlowerLabel}>Flower Unit Price:</span>
              <span className={styles.pricePerFlowerValue}>
                ₹ {pricePerFlower}{" "}
                <span className={styles.perUnitText}>/ flower</span>
              </span>
            </div>

            <div className={styles.stemStepperRow}>
              <span className={styles.stepperLabel}>Select Number of Flowers:</span>
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

            <div className={styles.formulaBanner}>
              <div className={styles.formulaEquation}>
                <span>Price per flower (<strong>₹{pricePerFlower}</strong>)</span>
                <span className={styles.formulaOperator}>×</span>
                <span>Quantity (<strong>{customFlowerQty}</strong>)</span>
                <span className={styles.formulaOperator}>=</span>
                <span className={styles.formulaTotal}>₹ {(pricePerFlower * customFlowerQty).toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Choose Delivery Preference */}
      <div className={styles.preferenceSection}>
        <h3 className={styles.sectionHeading}>Choose Delivery Preference</h3>

        {/* Free Slot banner when location is fetched */}
        {deliveryStatus.serviceable === true && (
          <div className={styles.freeSlotBanner}>
            <svg
              width="24"
              height="20"
              viewBox="0 0 24 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={styles.scooterIcon}
            >
              <rect x="1" y="4" width="7" height="7" rx="1.5" fill="#087f3b" />
              <path
                d="M7 11h4l3 4h4"
                stroke="#087f3b"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 8l2-4h3"
                stroke="#087f3b"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="6" cy="16" r="3" stroke="#087f3b" strokeWidth="2" fill="#e6f7ec" />
              <circle cx="18" cy="16" r="3" stroke="#087f3b" strokeWidth="2" fill="#e6f7ec" />
              <circle cx="6" cy="16" r="1.2" fill="#087f3b" />
              <circle cx="18" cy="16" r="1.2" fill="#087f3b" />
            </svg>
            <span>Want it free? Pick a slot with the FREE tag.</span>
          </div>
        )}

        <div className={styles.locationSubtitle}>
          <MapPin size={15} className={styles.pinIcon} />
          <span>Delivery Location</span>
        </div>

        {/* 1. Location Pill with Country Flag & Autocomplete for Location/PIN */}
        <div className={styles.deliveryPillWrapper}>
          <div
            className={`${styles.deliveryPill} ${
              deliveryStatus.serviceable === false ? styles.deliveryPillError : ""
            }`}
          >
            <div className={styles.countrySelector}>
              <span className={styles.flagIcon}>
                <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                  <rect width="20" height="4.67" fill="#FF9933" rx="1" />
                  <rect y="4.67" width="20" height="4.67" fill="#FFFFFF" />
                  <rect y="9.33" width="20" height="4.67" fill="#138808" rx="1" />
                  <circle cx="10" cy="7" r="1.8" stroke="#000080" strokeWidth="0.6" fill="none" />
                </svg>
              </span>
              <span className={styles.countryCode}>IND</span>
              <ChevronDown size={13} className={styles.countryChevron} />
            </div>

            <span className={styles.pillDivider} />

            <input
              type="text"
              value={
                isPinFocused
                  ? typedInput
                  : deliveryStatus.serviceable && deliveryStatus.area
                  ? `${pinCode}, ${deliveryStatus.area}, ${
                      deliveryStatus.district || deliveryStatus.state || "Kerala"
                    }, India`
                  : typedInput || pinCode
              }
              onFocus={() => {
                setIsPinFocused(true);
                setTypedInput(pinCode || "");
                if (pinCode) {
                  searchLocationQuery(pinCode);
                }
              }}
              onBlur={() => {
                setTimeout(() => {
                  setIsPinFocused(false);
                  setShowSuggestions(false);
                }, 200);
              }}
              onChange={(e) => {
                const val = e.target.value;
                setTypedInput(val);
                const cleanDigits = val.replace(/\D/g, "");
                if (/^\d{6}$/.test(cleanDigits)) {
                  setPinCode(cleanDigits);
                  checkDelivery(cleanDigits);
                  setShowSuggestions(false);
                } else {
                  searchLocationQuery(val);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (typedInput) {
                    checkDelivery(typedInput);
                    setShowSuggestions(false);
                  }
                }
              }}
              className={styles.pillInput}
              placeholder="Enter PIN code or Location"
              aria-label="Delivery Location"
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
                  setDeliveryStatus({
                    loading: false,
                    serviceable: null,
                    distance_km: null,
                    delivery_charge: null,
                    area: null,
                    district: null,
                    state: null,
                    message: null,
                    tier_label: null,
                  });
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
            <div className={styles.suggestionsDropdown}>
              {suggestions.map((item) => (
                <div
                  key={item.pinCode}
                  className={styles.suggestionItem}
                  onMouseDown={() => handleSelectLocation(item)}
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

        {/* Warning text matching reference 2nd image when location is unavailable */}
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
              This item isn't available at this location. Tap below to explore
              available gifts.
            </span>
          </div>
        )}

        {/* 2. Two-column row: Delivery Date (left) and Delivery Time Slot (right) */}
        <div className={styles.deliveryDropdownsRow}>
          <div className={styles.deliveryDropdownCol}>
            <label className={styles.dropdownLabel}>Delivery Date</label>
            <div className={styles.dropdownPill}>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={styles.dateInput}
                aria-label="Delivery Date"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          <div className={styles.deliveryDropdownCol}>
            <label className={styles.dropdownLabel}>Delivery Time Slot</label>
            <div className={styles.dropdownPill}>
              <select
                value={selectedTimeSlot}
                onChange={(e) => setSelectedTimeSlot(e.target.value)}
                className={styles.dropdownSelect}
                aria-label="Delivery Time Slot"
              >
                <option value="">Select Time</option>
                <optgroup label="Broad Slots">
                  <option value="morning-block">9:00 AM – 2:00 PM (FREE)</option>
                  <option value="afternoon-block">2:00 PM – 7:00 PM (FREE)</option>
                </optgroup>
                <optgroup label="1-Hour Slots">
                  <option value="slot-9-10">9:00 – 10:00 AM</option>
                  <option value="slot-10-11">10:00 – 11:00 AM</option>
                  <option value="slot-11-12">11:00 AM – 12:00 PM</option>
                  <option value="slot-12-1">12:00 – 1:00 PM</option>
                  <option value="slot-1-2">1:00 – 2:00 PM</option>
                  <option value="slot-2-3">2:00 – 3:00 PM</option>
                  <option value="slot-3-4">3:00 – 4:00 PM</option>
                  <option value="slot-4-5">4:00 – 5:00 PM</option>
                  <option value="slot-5-6">5:00 – 6:00 PM</option>
                  <option value="slot-6-7">6:00 – 7:00 PM</option>
                </optgroup>
              </select>
              <ChevronDown size={14} className={styles.dropdownChevron} />
            </div>
          </div>
        </div>
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
                    This product is hand delivered directly by our local florist team.
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
    </div>
  );
}
