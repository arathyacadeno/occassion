"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Check,
  ShoppingBag,
  Star,
  ShieldCheck,
  Truck,
  Heart,
  ChevronRight,
  Minus,
  Plus,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Product } from "@/data/catalog";
import { useCart } from "@/context/CartContext";
import { useCheckout } from "@/context/CheckoutContext";
import {
  getCustomizationConfigForProduct,
  calculateCustomizationPrice,
  normalizeCategorySlug,
} from "@/data/customizationConfig";
import {
  BouquetSizeOption,
  FlowerVarietyOption,
  ItemCustomization,
} from "@/types/customization";
import styles from "./FlowerCustomizer.module.css";

interface FlowerCustomizerProps {
  product: Product;
  flowerCategory?: string;
}

export default function FlowerCustomizer({
  product,
  flowerCategory = "chrysanthemums",
}: FlowerCustomizerProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { startBuyNow } = useCheckout();

  const config = useMemo(
    () => getCustomizationConfigForProduct(product, flowerCategory),
    [product, flowerCategory]
  );

  // States
  const [selectedVariety, setSelectedVariety] = useState<FlowerVarietyOption>(
    config.flowerOptions[0]
  );
  const [selectedSize, setSelectedSize] = useState<BouquetSizeOption>(
    config.sizes[0]
  );
        const [customNote, setCustomNote] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [added, setAdded] = useState<boolean>(false);

  // Perspective Views / Image Variant handling
  // If product has multiple perspective images in product.images, provide interactive thumbnails
  const allImages = useMemo(() => {
    const list = [product.image];
    if (Array.isArray(product.images)) {
      product.images.forEach((img) => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    return list;
  }, [product]);

  const [varietyImage, setVarietyImage] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const activeImage = varietyImage || allImages[activeImageIndex] || product.image;

  
  // Price calculations
  const priceBreakdown = useMemo(() => {
    return calculateCustomizationPrice(
      product.price,
      selectedSize.id,
      undefined,
      undefined,
      [],
      selectedVariety?.id,
      flowerCategory
    );
  }, [product.price, selectedSize, selectedVariety, flowerCategory]);

  const finalUnitPrice = priceBreakdown.finalPrice;
  const grandTotal = finalUnitPrice * quantity;

  // Build Summary Text
  const summaryText = useMemo(() => {
    const parts = [
      selectedSize.name,
    ];
    if (selectedVariety && selectedVariety.name !== config.flowerOptions[0]?.name) {
      parts.unshift(selectedVariety.name);
    }
    return parts.join(" • ");
  }, [selectedSize, selectedVariety, config]);

  // Construct item customization
  const customPayload: ItemCustomization = useMemo(() => {
    return {
      isCustomized: true,
      productId: product.id,
      productName: product.name,
      productImage: activeImage,
      flowerCategory: normalizeCategorySlug(flowerCategory),
      flowerVariety: selectedVariety,
      size: selectedSize,
      decorations: [],
      basePrice: product.price,
      customizationCharges: priceBreakdown.customizationCharges,
      finalPrice: finalUnitPrice,
      customNote: customNote.trim() || undefined,
      summaryText,
    };
  }, [product, activeImage, flowerCategory, selectedVariety, selectedSize, priceBreakdown, finalUnitPrice, customNote, summaryText]);

  // Add to Cart
  const handleAddToCart = () => {
    addItem(
      {
        id: product.id,
        slug: product.slug,
        category: product.category,
        name: product.name,
        subtitle: summaryText,
        price: finalUnitPrice,
        originalPrice: product.originalPrice,
        image: activeImage,
        occasion: "celebration",
        rating: product.rating,
        reviewsCount: product.reviewsCount,
        stems: product.includes || [],
        description: product.description,
        flowerCount: selectedSize.stemsText,
        scent: "Fresh & Green",
        badge: "Custom Curated",
        dimensions: "45cm H × 35cm W",
      },
      "Signature",
      false,
      customNote.trim() || undefined,
      quantity,
      customPayload
    );

    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  // Buy Now
  const handleBuyNow = () => {
    startBuyNow({
      id: product.id,
      slug: product.slug,
      name: product.name,
      subtitle: summaryText,
      category: "flower",
      price: finalUnitPrice,
      originalPrice: product.originalPrice,
      image: activeImage,
      quantity: quantity,
      customization: customPayload,
    });
    router.push("/payment");
  };

  const categoryName = flowerCategory.charAt(0).toUpperCase() + flowerCategory.slice(1);

  return (
    <div className={styles.customizerWrapper}>
      <Navbar />
      <main className={styles.mainContent}>
        {/* ================= BREADCRUMBS ================= */}
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <Link href="/" className={styles.breadcrumbLink}>
            Home
          </Link>
          <ChevronRight size={14} className={styles.breadcrumbSep} />
          <Link href="/#shop-by-flowers" className={styles.breadcrumbLink}>
            Shop by Flowers
          </Link>
          <ChevronRight size={14} className={styles.breadcrumbSep} />
          <Link href={`/flowers/${flowerCategory}`} className={styles.breadcrumbLink}>
            {categoryName}
          </Link>
          <ChevronRight size={14} className={styles.breadcrumbSep} />
          <span className={styles.breadcrumbCurrent}>Customize: {product.name}</span>
        </nav>

        {/* ================= 2-COLUMN CUSTOMIZER ================= */}
        <div className={styles.customizerGrid}>
          {/* ================= LEFT SECTION: PRODUCT PREVIEW ================= */}
          <div className={styles.previewColumn}>
            <div className={styles.imageCard}>
              <span className={styles.badgeOverlay}>
                <Sparkles size={12} style={{ display: "inline", marginRight: "4px" }} />
                Customizable Arrangement
              </span>

              <span className={styles.perspectiveBadge}>
                Perspective View
              </span>

              <div className={styles.mainImageFrame}>
                <img
                  src={activeImage}
                  alt={`${product.name} perspective preview`}
                  className={styles.previewImage}
                />
              </div>

              {/* Perspective Views Thumbnails if available */}
              {allImages.length > 1 && (
                <div className={styles.thumbnailStrip}>
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`${styles.thumbnailBtn} ${
                        activeImageIndex === idx ? styles.thumbnailActive : ""
                      }`}
                      onClick={() => {
                        setActiveImageIndex(idx);
                        setVarietyImage(null);
                      }}
                      aria-label={`View perspective angle ${idx + 1}`}
                    >
                      <img src={img} alt="" className={styles.thumbnailImg} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Summary Card */}
            <div className={styles.productInfoCard}>
              <h1 className={styles.productTitle}>{product.name}</h1>
              <div className={styles.metaRow}>
                <div className={styles.ratingPill}>
                  <Star size={11} fill="#ffffff" color="#ffffff" strokeWidth={0} />
                  <span>{(product.rating || 4.8).toFixed(1)}</span>
                </div>
                <span className={styles.reviewsCount}>
                  ({product.reviewsCount || 24} Verified Reviews)
                </span>
                <span className={styles.basePriceTag}>
                  Base Price: <strong className={styles.basePriceHighlight}>₹{product.price}</strong>
                </span>
              </div>

              <p className={styles.productDesc}>
                {product.description ||
                  `Hand-selected fresh ${flowerCategory} curated with artisan precision. Tailor every stem, size, luxury wrapping paper and silk ribbon below.`}
              </p>

              <div className={styles.trustList}>
                <div className={styles.trustItem}>
                  <ShieldCheck size={16} className={styles.trustIcon} />
                  <span>Handcrafted by Master Calicut Florists</span>
                </div>
                <div className={styles.trustItem}>
                  <Truck size={16} className={styles.trustIcon} />
                  <span>Same-Day White-Glove Calicut Delivery Available</span>
                </div>
                <div className={styles.trustItem}>
                  <Heart size={16} className={styles.trustIcon} />
                  <span>100% Farm-Fresh Premium Bloom Guarantee</span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT SECTION: CUSTOMIZATION OPTIONS ================= */}
          <div className={styles.optionsColumn}>
            <div className={styles.optionsCard}>
              <div className={styles.sectionHeadingRow}>
                <h2 className={styles.stepTitle}>Tailor Your Creation</h2>
                <p className={styles.stepSubtitle}>
                  Choose your preferred bloom varieties and bouquet scale.
                </p>
              </div>

              {/* A. FLOWER VARIETY / PALETTE */}
              {config.flowerOptions.length > 0 && (
                <div className={styles.optionBlock}>
                  <div className={styles.optionHeader}>
                    <label className={styles.optionLabel}>
                      A. Select Flower Variety / Blend
                    </label>
                    <span className={styles.optionSelectedPreview}>
                      {selectedVariety?.name}
                    </span>
                  </div>
                  <div className={styles.varietyList}>
                    {config.flowerOptions.map((variety) => {
                      const isSelected = selectedVariety?.id === variety.id;
                      return (
                        <div
                          key={variety.id}
                          className={`${styles.varietyCard} ${
                            isSelected ? styles.varietyCardActive : ""
                          }`}
                          onClick={() => {
                            setSelectedVariety(variety);
                            if (variety.image) {
                              setVarietyImage(variety.image);
                            }
                          }}
                          role="button"
                          tabIndex={0}
                        >
                          <div className={styles.varietyThumbWrapper}>
                            <img
                              src={variety.image || product.image}
                              alt={variety.name}
                              className={styles.varietyThumbImg}
                            />
                          </div>
                          <div className={styles.varietyInfo}>
                            <span className={styles.varietyName}>{variety.name}</span>
                            {variety.description && (
                              <span className={styles.varietyDesc}>{variety.description}</span>
                            )}
                          </div>
                          <span className={styles.varietyExtra}>
                            {variety.extraPrice > 0 ? `+₹${variety.extraPrice}` : "Included"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* B. BOUQUET SIZE */}
              <div className={styles.optionBlock}>
                <div className={styles.optionHeader}>
                  <label className={styles.optionLabel}>B. Bouquet Size</label>
                  <span className={styles.optionSelectedPreview}>
                    {selectedSize.name} ({selectedSize.stemsText})
                  </span>
                </div>
                <div className={styles.sizeGrid}>
                  {config.sizes.map((size) => {
                    const isSelected = selectedSize.id === size.id;
                    return (
                      <div
                        key={size.id}
                        className={`${styles.sizeCard} ${
                          isSelected ? styles.sizeCardActive : ""
                        }`}
                        onClick={() => setSelectedSize(size)}
                        role="button"
                        tabIndex={0}
                      >
                        <div>
                          <div className={styles.sizeName}>{size.name}</div>
                          <div className={styles.sizeStems}>{size.stemsText}</div>
                        </div>
                        <div className={styles.sizePriceTag}>
                          {size.extraPrice > 0 ? `+₹${size.extraPrice}` : "Included"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* F. COMPLIMENTARY GREETING NOTE */}
              <div className={styles.optionBlock}>
                <div className={styles.optionHeader}>
                  <label className={styles.optionLabel} htmlFor="custom-gift-note">
                    C. Complimentary Gift Card Message (Optional)
                  </label>
                  <span className={styles.optionSelectedPreview}>
                    {customNote.length} / 200
                  </span>
                </div>
                <textarea
                  id="custom-gift-note"
                  className={styles.noteInputArea}
                  placeholder="E.g. Dearest Amma, wishing you a joyous and blessed celebration with all our love! ❤️"
                  maxLength={200}
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                />
              </div>

              {/* ================= DYNAMIC PRICE BREAKDOWN ================= */}
              <div className={styles.priceBreakdownCard}>
                <h3 className={styles.breakdownTitle}>
                  <Sparkles size={14} color="#be185d" />
                  Live Price Breakdown
                </h3>
                <div className={styles.breakdownTable}>
                  <div className={styles.breakdownRow}>
                    <span className={styles.breakdownRowLabel}>Base Flower Price</span>
                    <span>₹{priceBreakdown.basePrice}</span>
                  </div>

                  {priceBreakdown.varietyCharge > 0 && (
                    <div className={styles.breakdownRow}>
                      <span className={styles.breakdownRowLabel}>
                        Flower Variety ({selectedVariety.name})
                      </span>
                      <span>+₹{priceBreakdown.varietyCharge}</span>
                    </div>
                  )}

                  {priceBreakdown.sizeCharge > 0 && (
                    <div className={styles.breakdownRow}>
                      <span className={styles.breakdownRowLabel}>
                        Size Upgrade ({selectedSize.name})
                      </span>
                      <span>+₹{priceBreakdown.sizeCharge}</span>
                    </div>
                  )}

                  
                  <div className={styles.breakdownDivider} />

                  <div className={styles.totalRow}>
                    <span>Final Custom Price</span>
                    <span className={styles.totalPriceValue}>
                      ₹{grandTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* QUANTITY & ACTIONS */}
              <div className={styles.actionArea}>
                <div className={styles.qtyStepper}>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className={styles.qtyBtn}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} strokeWidth={2.5} />
                  </button>
                  <span className={styles.qtyNum}>{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className={styles.qtyBtn}
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} strokeWidth={2.5} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`${styles.addToCartBtn} ${added ? styles.addToCartBtnAdded : ""}`}
                >
                  {added ? (
                    <>
                      <Check size={18} strokeWidth={2.5} />
                      <span>Added to Basket!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={18} />
                      <span>Add to Cart • ₹{grandTotal.toLocaleString("en-IN")}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className={styles.buyNowBtn}
                >
                  Buy Now
                </button>
              </div>

              {/* Success Feedback Alert */}
              {added && (
                <div className={styles.successBanner}>
                  <span className={styles.successText}>
                    🎉 Custom arrangement added to your floral basket!
                  </span>
                  <Link href="/cart" className={styles.viewCartLink}>
                    View Cart &amp; Checkout →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

