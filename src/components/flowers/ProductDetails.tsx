"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumb from "./Breadcrumb";
import ProductCard from "./ProductCard";
import RecommendedAddons from "@/components/RecommendedAddons";
import { FlowerProduct } from "@/types";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Product } from "@/data/catalog";
import {
  Star,
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Sparkles,
  Clock,
  Check,
  ChevronLeft,
  ChevronRight,
  Info,
  Droplets,
  Ruler,
  Wind,
} from "lucide-react";
import styles from "./ProductDetails.module.css";

interface ProductDetailsProps {
  product: FlowerProduct;
  relatedProducts: FlowerProduct[];
  categoryName: string;
}

export default function ProductDetails({
  product,
  relatedProducts,
  categoryName,
}: ProductDetailsProps) {
  const router = useRouter();
  const { addItem } = useCart();

  const [selectedImage, setSelectedImage] = useState<string>(product.image);
  const [selectedSize, setSelectedSize] = useState<"Petite" | "Signature" | "Grand Deluxe">("Signature");
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors && product.colors.length > 0 ? product.colors[0] : "Standard"
  );
  const [quantity, setQuantity] = useState<number>(1);
  const { isInWishlist, toggleItem } = useWishlist();
  const isWishlisted = isInWishlist(product.id);

  const handleToggleWishlist = () => {
    const catalogProduct: Product = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      category: "flower",
      categoryLabel: "Flowers",
      image: product.image,
      images: product.images || [product.image],
      rating: product.rating,
      reviewsCount: product.reviewsCount,
      description: product.description,
      deliveryInfo: "Same-day delivery in Calicut",
      offers: [],
      includes: product.stems || [],
      badge: product.badge,
    };
    toggleItem(catalogProduct);
  };

  const [addedToast, setAddedToast] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"details" | "care" | "delivery">("details");

  const similarScrollRef = useRef<HTMLDivElement>(null);

  const scrollSimilar = (direction: "left" | "right") => {
    if (similarScrollRef.current) {
      const scrollAmount = direction === "left" ? -420 : 420;
      similarScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Price adjustment based on size or variant
  const variants = product.variants;
  const isLily =
    product.category === "lilies" ||
    product.name.toLowerCase().includes("lily") ||
    product.name.toLowerCase().includes("lilies");

  const [customStems, setCustomStems] = useState<number>(8);
  const [selectedVariant, setSelectedVariant] = useState(
    variants && variants.length > 0 ? variants[0] : null
  );

  const priceMultiplier =
    selectedSize === "Petite" ? 0.75 : selectedSize === "Grand Deluxe" ? 1.45 : 1;
  const currentPrice = selectedVariant
    ? selectedVariant.id === "custom"
      ? customStems * 100
      : selectedVariant.price
    : Math.round(product.price * priceMultiplier);
  const currentOriginalPrice = selectedVariant
    ? selectedVariant.id === "custom"
      ? Math.round(customStems * 100 * 1.15)
      : selectedVariant.originalPrice
    : product.originalPrice
    ? Math.round(product.originalPrice * priceMultiplier)
    : undefined;

  const galleryImages =
    product.images && product.images.length > 0 ? product.images : [product.image];

  const handleAddToCart = () => {
    const itemToAdd = selectedVariant
      ? {
          ...product,
          price: currentPrice,
          originalPrice: currentOriginalPrice,
          image: selectedVariant.image,
          subtitle: selectedVariant.id === "custom"
            ? `${customStems} Stems (Custom Arrangement)`
            : `${selectedVariant.name} Arrangement`,
          flowerCount: selectedVariant.id === "custom"
            ? `${customStems} Custom Stems`
            : selectedVariant.name,
        }
      : product;

    // Add item to cart with quantity
    addItem(itemToAdd, selectedSize, false, undefined, quantity);
    setAddedToast(true);
    setTimeout(() => {
      setAddedToast(false);
    }, 2500);
  };

  const handleBuyNow = () => {
    const itemToAdd = selectedVariant
      ? {
          ...product,
          price: currentPrice,
          originalPrice: currentOriginalPrice,
          image: selectedVariant.image,
          subtitle: selectedVariant.id === "custom"
            ? `${customStems} Stems (Custom Arrangement)`
            : `${selectedVariant.name} Arrangement`,
          flowerCount: selectedVariant.id === "custom"
            ? `${customStems} Custom Stems`
            : selectedVariant.name,
        }
      : product;

    for (let i = 0; i < quantity; i++) {
      addItem(itemToAdd, selectedSize, false);
    }
    router.push("/cart");
  };

  return (
    <div className={styles.pageContainer}>
      <Header />

      <main className={styles.mainContent}>
        <div className={styles.contentInner}>
          {/* Breadcrumb: Home / Flowers / Category / Product */}
          <Breadcrumb
            items={[
              { label: categoryName, href: `/flowers/${product.category}` },
              { label: product.name },
            ]}
          />

          {/* Product Hero Section */}
          <div className={styles.productLayout}>
            {/* Left: Product Gallery */}
            <div className={styles.galleryColumn}>
              <div className={styles.mainImageWrap}>
                <img
                  src={selectedImage}
                  alt={product.name}
                  className={styles.mainImage}
                />
                {product.badge && (
                  <span className={styles.imageBadge}>{product.badge}</span>
                )}
                <button
                  type="button"
                  className={`${styles.wishlistFloatBtn} ${
                    isWishlisted ? styles.wishlistFloatActive : ""
                  }`}
                  onClick={handleToggleWishlist}
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart size={20} strokeWidth={2} fill={isWishlisted ? "#db2777" : "none"} />
                </button>
              </div>

              {/* Thumbnails */}
              {galleryImages.length > 1 && (
                <div className={styles.thumbnailsRow}>
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`${styles.thumbBtn} ${
                        selectedImage === img ? styles.thumbActive : ""
                      }`}
                      onClick={() => setSelectedImage(img)}
                    >
                      <img src={img} alt={`Thumbnail ${idx + 1}`} className={styles.thumbImage} />
                    </button>
                  ))}
                </div>
              )}

              {/* Delivery Assurance Callout */}
              <div className={styles.guaranteeBox}>
                <div className={styles.guaranteeItem}>
                  <Truck size={20} className={styles.guaranteeIcon} />
                  <div>
                    <strong>Same-Day Calicut Delivery</strong>
                    <span>Hand-delivered in specialized water wrap to keep blooms fresh.</span>
                  </div>
                </div>
                <div className={styles.guaranteeItem}>
                  <ShieldCheck size={20} className={styles.guaranteeIcon} />
                  <div>
                    <strong>7-Day Freshness Promise</strong>
                    <span>Direct-harvested highland stems guaranteed to open beautifully.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Product Info & Buy Box */}
            <div className={styles.infoColumn}>
              {/* Category & Rating */}
              <div className={styles.metaRow}>
                <Link href={`/flowers/${product.category}`} className={styles.categoryPill}>
                  {categoryName}
                </Link>
                <div className={styles.ratingBadge}>
                  <Star size={14} fill="#f59e0b" color="#f59e0b" />
                  <span className={styles.ratingScore}>{product.rating.toFixed(1)}</span>
                  <span className={styles.reviewsText}>({product.reviewsCount} verified reviews)</span>
                </div>
              </div>

              {/* Title & Subtitle */}
              <h1 className={styles.title}>{product.name}</h1>
              <p className={styles.subtitle}>{product.subtitle}</p>

              {/* Pricing */}
              <div className={styles.priceRow}>
                <span className={styles.currentPrice}>₹{currentPrice.toLocaleString("en-IN")}</span>
                {currentOriginalPrice && (
                  <span className={styles.originalPrice}>
                    ₹{currentOriginalPrice.toLocaleString("en-IN")}
                  </span>
                )}
                {currentOriginalPrice && (
                  <span className={styles.discountPill}>
                    {Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)}% OFF
                  </span>
                )}
                <span className={styles.taxNote}>Inclusive of all taxes</span>
              </div>

              {/* Description */}
              <p className={styles.description}>{product.description}</p>

              {/* Available Colors/Variants */}
              {product.colors && product.colors.length > 0 && (
                <div className={styles.selectorSection}>
                  <label className={styles.selectorLabel}>
                    Color Palette: <strong>{selectedColor}</strong>
                  </label>
                  <div className={styles.colorOptions}>
                    {product.colors.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={`${styles.colorChip} ${selectedColor === c ? styles.colorChipActive : ""}`}
                        onClick={() => setSelectedColor(c)}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Make this gift extra special or Size Selector */}
              {variants && variants.length > 0 ? (
                <div className={styles.selectorSection}>
                  <label className={styles.selectorLabel}>
                    {isLily ? "Select Stems / Arrangement" : "Make this gift extra special"}
                  </label>
                  <div className={styles.giftVariantCards}>
                    {variants.map((v) => {
                      const isSelected = selectedVariant?.id === v.id;
                      const displayPrice =
                        v.id === "custom" ? customStems * 100 : v.price;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          className={`${styles.giftVariantCard} ${
                            isSelected ? styles.giftVariantCardSelected : ""
                          }`}
                          onClick={() => {
                            setSelectedVariant(v);
                            setSelectedImage(v.image);
                          }}
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
                              ₹{displayPrice.toLocaleString("en-IN")}
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
              ) : (
                <div className={styles.selectorSection}>
                  <label className={styles.selectorLabel}>
                    Bouquet Size: <strong>{selectedSize}</strong>
                  </label>
                  <div className={styles.sizeOptions}>
                    {(["Petite", "Signature", "Grand Deluxe"] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={`${styles.sizeOption} ${selectedSize === s ? styles.sizeActive : ""}`}
                        onClick={() => setSelectedSize(s)}
                      >
                        <span className={styles.sizeName}>{s}</span>
                        <span className={styles.sizeNote}>
                          {s === "Petite" ? "12-16 stems" : s === "Signature" ? "20-25 stems" : "32+ stems"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector & Add to Cart */}
              <div className={styles.purchaseControlsWrapper}>
                <div className={styles.qtyAndCartRow}>
                  <div className={styles.quantitySection}>
                    <div className={styles.qtyControl}>
                      <button
                        type="button"
                        className={styles.qtyBtn}
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className={styles.qtyVal}>{quantity}</span>
                      <button
                        type="button"
                        className={styles.qtyBtn}
                        onClick={() => setQuantity((q) => q + 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`${styles.addToCartBtn} ${addedToast ? styles.addedActive : ""}`}
                    onClick={handleAddToCart}
                  >
                    {addedToast ? (
                      <Check size={18} strokeWidth={2.4} />
                    ) : (
                      <ShoppingBag size={18} strokeWidth={2} />
                    )}
                    <span>
                      {addedToast
                        ? "Added to Basket!"
                        : `Add to Cart • ₹${(currentPrice * quantity).toLocaleString("en-IN")}`}
                    </span>
                  </button>
                </div>

                {/* Row 2: Buy Now Button */}
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className={styles.buyNowBtn}
                >
                  Buy Now
                </button>
              </div>

              {/* Delivery Timing Pill */}
              <div className={styles.deliveryBadge}>
                <Clock size={16} className={styles.deliveryIcon} />
                <span>
                  Order within <strong>3 hrs 24 mins</strong> for Guaranteed Same-Day Delivery in Kozhikode.
                </span>
              </div>

              {/* Tabs: Details, Care, Delivery */}
              <div className={styles.tabsSection}>
                <div className={styles.tabHeaders}>
                  <button
                    type="button"
                    className={`${styles.tabBtn} ${activeTab === "details" ? styles.tabBtnActive : ""}`}
                    onClick={() => setActiveTab("details")}
                  >
                    Arrangement Details
                  </button>
                  <button
                    type="button"
                    className={`${styles.tabBtn} ${activeTab === "care" ? styles.tabBtnActive : ""}`}
                    onClick={() => setActiveTab("care")}
                  >
                    Flower Care Guide
                  </button>
                  <button
                    type="button"
                    className={`${styles.tabBtn} ${activeTab === "delivery" ? styles.tabBtnActive : ""}`}
                    onClick={() => setActiveTab("delivery")}
                  >
                    Calicut Delivery
                  </button>
                </div>

                <div className={styles.tabContent}>
                  {activeTab === "details" && (
                    <div className={styles.tabPane}>
                      <ul className={styles.detailsList}>
                        <li>
                          <Ruler size={16} className={styles.detailIcon} />
                          <div>
                            <strong>Dimensions & Count:</strong> {product.dimensions} ({product.flowerCount})
                          </div>
                        </li>
                        <li>
                          <Wind size={16} className={styles.detailIcon} />
                          <div>
                            <strong>Scent Profile:</strong> {product.scent}
                          </div>
                        </li>
                        {product.stems && (
                          <li>
                            <Sparkles size={16} className={styles.detailIcon} />
                            <div>
                              <strong>Featured Stems:</strong> {product.stems.join(", ")}
                            </div>
                          </li>
                        )}
                        {product.details?.map((d, i) => (
                          <li key={i}>
                            <Check size={16} className={styles.detailCheckIcon} />
                            <div>{d}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {activeTab === "care" && (
                    <div className={styles.tabPane}>
                      <ol className={styles.careSteps}>
                        <li>
                          <strong>Trim Stems:</strong> Cut 2-3 cm diagonally at a 45-degree angle under running water.
                        </li>
                        <li>
                          <strong>Cold Fresh Water:</strong> Place in a thoroughly washed vase filled with cold water.
                        </li>
                        <li>
                          <strong>Flower Food:</strong> Dissolve the complimentary flower food sachet into the vase.
                        </li>
                        <li>
                          <strong>Optimal Location:</strong> Keep away from direct afternoon sun, air conditioners, and ripening fruits.
                        </li>
                      </ol>
                    </div>
                  )}

                  {activeTab === "delivery" && (
                    <div className={styles.tabPane}>
                      <p className={styles.deliveryInfoText}>
                        Hand-delivered by our professional Occasions flower couriers in temperature-conditioned vans. Available across all areas in Calicut including Mavoor Road, Beach Road, Nadakkavu, Pottammal, Chevayur, and Beypore.
                      </p>
                      <p className={styles.deliveryInfoText}>
                        Complimentary greeting card included with your custom handwritten message.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Addon Products */}
          <RecommendedAddons />

          {/* ================= RATINGS AND REVIEWS SECTION ================= */}
          <section className={styles.reviewsSection} aria-label="Ratings and Reviews">
            <h2 className={styles.sectionHeading}>Ratings and Reviews</h2>

            {/* Rating Summary Row */}
            <div className={styles.ratingSummaryRow}>
              <div className={styles.starsGroup}>
                {[...Array(4)].map((_, i) => (
                  <Star key={i} size={18} className={styles.starFilledGreen} />
                ))}
                <Star size={18} className={styles.starHalfGreen} />
              </div>
              <span className={styles.ratingScore}>{product.rating || 4.2}</span>
              <span className={styles.ratingTagline}>Beautiful &amp; Elegant Gift</span>
            </div>

            {/* Featured Review Card */}
            <div className={styles.reviewItemCard}>
              <img
                src={product.image || "/images/basket-gerberas.jpg"}
                alt="Customer Review Photo"
                className={styles.reviewerImg}
              />
              <div className={styles.reviewContent}>
                <h3 className={styles.reviewerName}>Ashna</h3>
                <p className={styles.reviewText}>
                  The {product.name} was absolutely beautiful. The roses were
                  fresh, neatly arranged, and the presentation looked elegant and
                  premium. A perfect choice for gifting and making any occasion
                  special.
                </p>
                <div className={styles.reviewMeta}>
                  Anniversary · Oct 3 · Calicut
                </div>
              </div>
            </div>

            <hr className={styles.sectionDivider} />
          </section>

          {/* ================= SIMILAR PRODUCT SECTION ================= */}
          <section className={styles.similarSection} aria-label="Similar Products">
            <div className={styles.similarHeaderRow}>
              <h2 className={styles.sectionHeading}>Similar Product</h2>
              <div className={styles.scrollButtons}>
                <button
                  type="button"
                  onClick={() => scrollSimilar("left")}
                  className={styles.scrollBtn}
                  aria-label="Scroll left"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollSimilar("right")}
                  className={styles.scrollBtn}
                  aria-label="Scroll right"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div ref={similarScrollRef} className={styles.similarScrollRow}>
              {relatedProducts.slice(0, 6).map((p) => (
                <ProductCard key={p.id} product={p} compact />
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
