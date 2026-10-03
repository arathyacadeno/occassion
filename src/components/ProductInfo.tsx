"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { Product } from "@/data/catalog";
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

  const activePrice = selectedVariant
    ? selectedVariant.id === "custom"
      ? customStems * 100
      : selectedVariant.price
    : product.price;

  const activeOriginalPrice = selectedVariant
    ? selectedVariant.id === "custom"
      ? Math.round(customStems * 100 * 1.15)
      : selectedVariant.originalPrice
    : product.originalPrice;

  const discountPercent =
    activeOriginalPrice && activeOriginalPrice > activePrice
      ? Math.round(((activeOriginalPrice - activePrice) / activeOriginalPrice) * 100)
      : 0;

  const [location, setLocation] = useState("673602, Kozhikode, Kerala");
  const [deliveryDate] = useState("Monday Oct 4");
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [quantity, setQuantity] = useState(1);

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

    setAddedFeedback(true);
    setTimeout(() => {
      setAddedFeedback(false);
    }, 2200);
  };

  const handleBuyNow = () => {
    const mainItem: CheckoutItem = {
      id: product.id,
      slug: product.slug,
      name: product.name,
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
      {/* Title */}
      <h1 className={styles.productName}>{product.name}</h1>

      {/* Rating Badge */}
      <div className={styles.ratingDeliveryRow}>
        <div className={styles.greenRatingBadge}>
          <Star size={11} className={styles.whiteStarIcon} />
          <span>{(product.rating || 4.9).toFixed(1)}</span>
        </div>
      </div>

      {/* Pricing Row: ₹ 2245  ₹ 2514  11% OFF  (i) */}
      <div className={styles.pricingRow}>
        <span className={styles.currentPrice}>
          ₹ {activePrice.toLocaleString("en-IN")}
        </span>
        {activeOriginalPrice && (
          <span className={styles.originalPrice}>
            ₹ {activeOriginalPrice.toLocaleString("en-IN")}
          </span>
        )}
        {discountPercent > 0 && (
          <span className={styles.discountPercentBadge}>
            {discountPercent}% OFF
          </span>
        )}
        <button
          type="button"
          className={styles.infoCircleBtn}
          title="Price inclusive of applicable discounts and taxes"
          aria-label="Price details"
        >
          <Info size={18} strokeWidth={2} />
        </button>
      </div>

      {/* Make this gift extra special section */}
      {variants && variants.length > 0 && (
        <div className={styles.giftExtraSection}>
          <h3 className={styles.giftExtraTitle}>
            {isLily ? "Select Stems / Arrangement" : "Make this gift extra special"}
          </h3>
          <div className={styles.giftVariantCards}>
            {variants.map((v) => {
              const isSelected = selectedVariant?.id === v.id;
              const displayPrice = v.id === "custom" ? customStems * 100 : v.price;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => handleSelectVariant(v)}
                  className={`${styles.giftVariantCard} ${
                    isSelected ? styles.giftVariantCardSelected : ""
                  }`}
                >
                  <div className={styles.giftCardThumbWrap}>
                    <img
                      src={v.image}
                      alt={v.name}
                      className={styles.giftCardThumbImg}
                    />
                  </div>
                  <div className={styles.giftCardInfo}>
                    <span className={styles.giftCardName}>{v.name}</span>
                    <span className={styles.giftCardPrice}>
                      ₹ {displayPrice.toLocaleString("en-IN")}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {isLily && selectedVariant?.id === "custom" && (
            <div style={{ marginTop: 12, padding: "12px 16px", background: "#fdf2f8", borderRadius: 14, border: "1px dashed #f472b6", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: "#831843" }}>Choose Stems:</span>
                <div style={{ display: "inline-flex", alignItems: "center", background: "#ffffff", border: "1px solid #fbcfe8", borderRadius: 999, padding: "3px 8px", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setCustomStems((prev) => Math.max(3, prev - 1))}
                    style={{ background: "none", border: "none", width: 22, height: 22, borderRadius: "50%", cursor: "pointer", fontWeight: 700, fontSize: 15, color: "#ff4770" }}
                    aria-label="Decrease stem count"
                  >
                    -
                  </button>
                  <span style={{ fontWeight: 700, fontSize: 13, color: "#1f2937", minWidth: 26, textAlign: "center" }}>
                    {customStems}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCustomStems((prev) => prev + 1)}
                    style={{ background: "none", border: "none", width: 22, height: 22, borderRadius: "50%", cursor: "pointer", fontWeight: 700, fontSize: 15, color: "#ff4770" }}
                    aria-label="Increase stem count"
                  >
                    +
                  </button>
                </div>
              </div>
              <span style={{ fontSize: 12, color: "#9d174d", fontWeight: 600 }}>₹100 per stem</span>
            </div>
          )}
        </div>
      )}

      {/* Choose Delivery Preference */}
      <div className={styles.preferenceSection}>
        <h3 className={styles.sectionHeading}>Choose Delivery Preference</h3>
        <div className={styles.locationSubtitle}>
          <MapPin size={15} className={styles.pinIcon} />
          <span>Delivery Location</span>
        </div>

        {/* 1. Location Pill: Pincode | 673602, Kozhikode, Kerala  (x) */}
        <div className={styles.deliveryPill}>
          <span className={styles.pillLabel}>Pincode</span>
          <span className={styles.pillDivider}>|</span>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={styles.pillInput}
            placeholder="Enter location, pincode"
            aria-label="Delivery Location"
          />
          {location && (
            <button
              type="button"
              onClick={() => setLocation("")}
              className={styles.clearCircleBtn}
              aria-label="Clear location"
            >
              <X size={11} strokeWidth={2.6} />
            </button>
          )}
        </div>

        {/* 2. Delivery By Pill: Delivery by | Monday Oct 4 */}
        <div className={styles.deliveryPill}>
          <span className={styles.pillLabel}>Delivery by</span>
          <span className={styles.pillDivider}>|</span>
          <span className={styles.pillValue}>{deliveryDate}</span>
        </div>
      </div>

      {/* 3 Standalone White Rounded Accordions: Description, Instructions, Delivery Info */}
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
              <ChevronUp size={18} className={styles.accordionChevron} />
            ) : (
              <ChevronDown size={18} className={styles.accordionChevron} />
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
              <ChevronUp size={18} className={styles.accordionChevron} />
            ) : (
              <ChevronDown size={18} className={styles.accordionChevron} />
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
              <ChevronUp size={18} className={styles.accordionChevron} />
            ) : (
              <ChevronDown size={18} className={styles.accordionChevron} />
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

      {/* Purchase Controls: Quantity Selector + Add to Cart (Row 1), Buy Now (Row 2) */}
      <div className={styles.purchaseControlsWrapper}>
        {/* Row 1: Quantity on Left + Add to Cart on Right */}
        <div className={styles.qtyAndCartRow}>
          <div className={styles.quantitySection}>
            <div className={styles.quantityStepper}>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className={styles.qtyStepperBtn}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                <Minus size={15} strokeWidth={2.4} />
              </button>
              <span className={styles.qtyValue}>{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className={styles.qtyStepperBtn}
                aria-label="Increase quantity"
              >
                <Plus size={15} strokeWidth={2.4} />
              </button>
            </div>
          </div>

          <div className={styles.addToCartCol}>
            <button
              type="button"
              onClick={handleAddToCart}
              className={`${styles.addToCartBtn} ${
                addedFeedback ? styles.addedSuccess : ""
              }`}
            >
              {addedFeedback ? (
                <>
                  <Check size={18} strokeWidth={2.5} />
                  <span>Added to Cart!</span>
                </>
              ) : (
                <span>Add to Cart</span>
              )}
            </button>
          </div>
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
