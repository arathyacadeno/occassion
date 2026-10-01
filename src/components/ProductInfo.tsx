"use client";

import React, { useState } from "react";
import {
  Star,
  Truck,
  ShoppingCart,
  Percent,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  MapPin,
  Flame,
  Info,
  Check,
  CalendarCheck,
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

  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [offerIndex, setOfferIndex] = useState(0);

  // 3 independent accordion states
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

  const offersList = [
    {
      provider: "paytm",
      color: "#00baf2",
      text: "Get Cashback up to Rs.300 on a minimum transaction of Rs.799",
    },
    {
      provider: "airtel payments bank",
      color: "#e60000",
      text: "Flat 10% off up to Rs.200 on a minimum transaction of Rs.999",
    },
    {
      provider: "cred",
      color: "#111827",
      text: "Flat ₹150 off with CRED Pay on orders above ₹899",
    },
  ];

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode.trim()) {
      setPincodeStatus("Please enter your delivery pincode.");
      return;
    }
    setPincodeStatus("✓ Available for express delivery in your area!");
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

  const { startBuyNow } = useCheckout();

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

  const nextOffer = () => {
    setOfferIndex((prev) => (prev + 1) % offersList.length);
  };

  const skuCode = `EXFNP${product.id.replace(/\D/g, "") || "14723"}_OP_BD`;

  return (
    <div className={styles.infoWrapper}>
      {/* 2. Title & Rating Badge Pill */}
      <div className={styles.titleRatingRow}>
        <h1 className={styles.productName}>{product.name}</h1>

        <div className={styles.ratingBadgePill}>
          <Star size={13} className={styles.starIconFilled} />
          <span className={styles.ratingValue}>{product.rating}</span>
          <span className={styles.ratingPipe}>|</span>
          <span className={styles.ratingCount}>{product.reviewsCount}</span>
        </div>
      </div>

      {/* 3. FREE DELIVERY Badge */}
      <div className={styles.deliveryBadgeTag}>
        <span>FREE DELIVERY</span>
        <Truck size={14} className={styles.truckIcon} />
      </div>

      {/* 4. Pricing Row: ₹999  ₹1,149  ⓘ */}
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

      {/* 5. Social Proof: 🔥 Ordered 791+ times in Past Month */}
      <div className={styles.socialProofRow}>
        <Flame size={15} className={styles.flameIcon} />
        <span>Ordered 791+ times in Past Month</span>
      </div>

      {/* 6. Choose Delivery Preference */}
      <div className={styles.preferenceSection}>
        <h3 className={styles.sectionHeading}>Choose Delivery Preference</h3>
        <div className={styles.locationSubtitle}>
          <MapPin size={15} className={styles.pinIcon} />
          <span>Delivery Location</span>
        </div>

        <form onSubmit={handlePincodeCheck} className={styles.pincodeForm}>
          <div className={styles.countryPicker}>
            <span className={styles.countryFlag}>🇮🇳</span>
            <span className={styles.countryCode}>IND</span>
            <ChevronDown size={14} className={styles.dropdownChevron} />
          </div>

          <div className={styles.pincodeInputWrapper}>
            <input
              type="text"
              placeholder="Enter pincode, locality, etc"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              className={styles.pincodeInput}
            />
            <button type="submit" className={styles.checkBtn}>
              Check
            </button>
          </div>
        </form>

        {pincodeStatus && (
          <div className={styles.pincodeFeedback}>{pincodeStatus}</div>
        )}
      </div>

      {/* 7. Offers Available Carousel */}
      <div className={styles.offersContainer}>
        <h3 className={styles.sectionHeading}>Offers Available</h3>

        <div className={styles.offersSliderWrapper}>
          <div className={styles.offerCardsTrack}>
            {offersList.map((offer, idx) => {
              const isVisible =
                idx === offerIndex || idx === (offerIndex + 1) % offersList.length;
              if (!isVisible) return null;

              return (
                <div key={idx} className={styles.offerCard}>
                  <div className={styles.offerCardHeader}>
                    <span
                      className={styles.providerName}
                      style={{ color: offer.color }}
                    >
                      {offer.provider}
                    </span>
                    <span className={styles.percentBadge}>
                      <Percent size={12} strokeWidth={2.5} />
                    </span>
                  </div>
                  <p className={styles.offerText}>{offer.text}</p>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={nextOffer}
            className={styles.nextOfferBtn}
            aria-label="Next offers"
            title="Next offer"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Offer indicators bar */}
        <div className={styles.offerIndicators}>
          <span className={styles.indicatorBarActive} />
          <span className={styles.indicatorBarInactive} />
        </div>
      </div>

      {/* 8. About the product with 3 Accordions */}
      <div className={styles.aboutSection}>
        <div className={styles.aboutHeader}>
          <h3 className={styles.aboutTitle}>About the product</h3>
          <span className={styles.skuText}>{skuCode}</span>
        </div>

        {/* ACCORDION 1: Description */}
        <div className={styles.accordionItem}>
          <button
            type="button"
            onClick={() => toggleAccordion("description")}
            className={styles.accordionHeaderBtn}
            aria-expanded={openAccordions.description}
          >
            <div className={styles.accordionTitleLeft}>
              <Info size={16} className={styles.accordionIcon} />
              <span>Description</span>
            </div>
            {openAccordions.description ? (
              <ChevronUp size={16} className={styles.chevron} />
            ) : (
              <ChevronDown size={16} className={styles.chevron} />
            )}
          </button>

          {openAccordions.description && (
            <div className={styles.accordionBody}>
              <p className={styles.bodyParagraph}>
                Brighten their special day with the cheerful charm of radiant
                sunflowers beautifully arranged to spread happiness warmth and
                birthday joy. A vibrant bouquet perfect for making celebrations
                feel extra special.
              </p>

              <h4 className={styles.bodySubHeading}>Product Details:</h4>
              <ul className={styles.bulletList}>
                <li>Blue Color Aster|Stem 40 Cm :3</li>
                <li>Yellow Color Sunflower|Stem 60-80 Cm :2</li>
                <li>Green Murraya / Kamini Leaf Filler|Stem 50-60 Cm</li>
                <li>Off White Color Non Woven Wrapping Paper</li>
                <li>Brown Color Jute Packing Material Fabric</li>
                <li>Golden Happy Birthday Acrylic Topper</li>
                <li>FNP White Color Satin Ribbon</li>
                <li>Net quantity: 1 Set</li>
                <li>Dimensions 30 × 12 cm</li>
                <li>Weight: Approx 350 to 400 gms</li>
                <li>Country of origin: India</li>
              </ul>
            </div>
          )}
        </div>

        {/* ACCORDION 2: Instructions */}
        <div className={styles.accordionItem}>
          <button
            type="button"
            onClick={() => toggleAccordion("instructions")}
            className={styles.accordionHeaderBtn}
            aria-expanded={openAccordions.instructions}
          >
            <div className={styles.accordionTitleLeft}>
              <CalendarCheck size={16} className={styles.accordionIcon} />
              <span>Instructions</span>
            </div>
            {openAccordions.instructions ? (
              <ChevronUp size={16} className={styles.chevron} />
            ) : (
              <ChevronDown size={16} className={styles.chevron} />
            )}
          </button>

          {openAccordions.instructions && (
            <div className={styles.accordionBody}>
              <ul className={styles.bulletList}>
                <li>
                  When your flowers arrive, simply cut the stems and put them in
                  water.
                </li>
                <li>
                  Cut the stems at 45 degrees, about 1-2 inches from the bottom.
                </li>
                <li>Remove the leaves below the waterline.</li>
                <li>Check the water level every day and add more if necessary.</li>
                <li>
                  Don&apos;t place flowers in direct sunlight or near any other
                  source of excessive heat.
                </li>
                <li>All flowers benefit from a daily mist of water.</li>
                <li>Enjoy your flowers!</li>
              </ul>

              <h4 className={styles.bodySubHeading} style={{ marginTop: "16px" }}>
                Manufacturer Details:
              </h4>
              <ul className={styles.bulletList}>
                <li>Occassions Florist Pvt Ltd</li>
                <li>
                  Address: YMCA Junction, Kozhikode (Calicut), Kerala 673001, India
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* ACCORDION 3: Delivery Info */}
        <div className={styles.accordionItem}>
          <button
            type="button"
            onClick={() => toggleAccordion("delivery")}
            className={styles.accordionHeaderBtn}
            aria-expanded={openAccordions.delivery}
          >
            <div className={styles.accordionTitleLeft}>
              <Truck size={16} className={styles.accordionIcon} />
              <span>Delivery Info</span>
            </div>
            {openAccordions.delivery ? (
              <ChevronUp size={16} className={styles.chevron} />
            ) : (
              <ChevronDown size={16} className={styles.chevron} />
            )}
          </button>

          {openAccordions.delivery && (
            <div className={styles.accordionBody}>
              <ul className={styles.bulletList}>
                <li>The image displayed is indicative in nature.</li>
                <li>
                  Actual product may vary in shape or design as per the
                  availability.
                </li>
                <li>
                  Flowers may be delivered in fully bloomed, semi-bloomed or bud
                  stage.
                </li>
                <li>
                  The chosen delivery time is an estimate and depends on the
                  availability of the product and the destination to which you want
                  the product to be delivered.
                </li>
                <li>
                  Since flowers are perishable in nature, we will be able to
                  attempt delivery of your order only once.
                </li>
                <li>The delivery cannot be redirected to any other address.</li>
                <li>
                  This product is hand delivered and will not be delivered along
                  with courier products.
                </li>
                <li>
                  Occasionally, substitution of flowers is necessary due to
                  temporary and/or regional unavailability issues.
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* 9. Action Buttons: [ Add To Cart ] [ Buy Now ] */}
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
