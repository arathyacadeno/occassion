"use client";

import React, { useState } from "react";
import {
  Star,
  ChevronDown,
  ChevronUp,
  MapPin,
  Info,
  Check,
  X,
  ShoppingCart,
} from "lucide-react";
import { Product } from "@/data/catalog";
import { useCart } from "@/context/CartContext";
import { useCheckout } from "@/context/CheckoutContext";
import styles from "./ProductInfo.module.css";

interface ProductInfoProps {
  product: Product;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const { addItem } = useCart();
  const { startBuyNow } = useCheckout();

  const [location, setLocation] = useState("673602, Kozhikode, Kerala");
  const [deliveryDate] = useState("Monday Oct 4");
  const [addedFeedback, setAddedFeedback] = useState(false);

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
        name: product.name,
        subtitle: product.categoryLabel,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        occasion: "celebration",
        rating: product.rating,
        reviewsCount: product.reviewsCount,
        stems: product.includes || [],
        description: product.description,
        flowerCount: `${product.includes?.length || 12} items`,
        scent: "Fresh & Green",
        badge: product.badge,
        dimensions: "45cm H × 35cm W",
      },
      "Signature",
      false
    );

    setAddedFeedback(true);
    setTimeout(() => {
      setAddedFeedback(false);
    }, 2200);
  };

  const handleBuyNow = () => {
    startBuyNow({
      id: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      quantity: 1,
    });
  };

  return (
    <div className={styles.infoWrapper}>
      {/* Title & Rating Badge Pill */}
      <div className={styles.titleRatingRow}>
        <h1 className={styles.productName}>{product.name}</h1>

        <div className={styles.ratingBadgePill}>
          <Star size={13} className={styles.starIconFilled} />
          <span className={styles.ratingValue}>{product.rating}</span>
          <span className={styles.ratingPipe}>|</span>
          <span className={styles.ratingCount}>{product.reviewsCount}</span>
        </div>
      </div>

      {/* Pricing Row: ₹999  ₹1,149  ⓘ */}
      <div className={styles.pricingRow}>
        <span className={styles.currentPrice}>
          ₹{product.price.toLocaleString("en-IN")}
        </span>
        {product.originalPrice && (
          <span className={styles.originalPrice}>
            ₹{product.originalPrice.toLocaleString("en-IN")}
          </span>
        )}
        <button
          type="button"
          className={styles.infoIconBtn}
          title="Inclusive of all taxes"
          aria-label="Price information"
        >
          <Info size={15} />
        </button>
      </div>

      {/* Choose Delivery Preference */}
      <div className={styles.preferenceSection}>
        <h3 className={styles.sectionHeading}>Choose Delivery Preference</h3>
        <div className={styles.locationSubtitle}>
          <MapPin size={15} className={styles.pinIcon} />
          <span>Delivery Location</span>
        </div>

        {/* 1. Location Pill: Home | 673602, Kozhikode, Kerala  (x) */}
        <div className={styles.deliveryPill}>
          <span className={styles.pillLabel}>Home</span>
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

      {/* Action Buttons: [ Add To Cart ] [ Buy Now ] */}
      <div className={styles.actionButtonsRow}>
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
            <>
              <ShoppingCart size={18} strokeWidth={1.8} />
              <span>Add To Cart</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleBuyNow}
          className={styles.buyNowBtn}
        >
          <ShoppingCart size={18} strokeWidth={1.8} />
          <span>Buy Now</span>
        </button>
      </div>
    </div>
  );
}
