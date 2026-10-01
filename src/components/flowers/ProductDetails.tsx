"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumb from "./Breadcrumb";
import ProductCard from "./ProductCard";
import RecommendedAddons from "@/components/RecommendedAddons";
import { FlowerProduct } from "@/types";
import { useCart } from "@/context/CartContext";
import {
  Star,
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Sparkles,
  Clock,
  Check,
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
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const [addedToast, setAddedToast] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"details" | "care" | "delivery">("details");

  // Price adjustment based on size
  const priceMultiplier =
    selectedSize === "Petite" ? 0.75 : selectedSize === "Grand Deluxe" ? 1.45 : 1;
  const currentPrice = Math.round(product.price * priceMultiplier);
  const currentOriginalPrice = product.originalPrice
    ? Math.round(product.originalPrice * priceMultiplier)
    : undefined;

  const galleryImages =
    product.images && product.images.length > 0 ? product.images : [product.image];

  const handleAddToCart = () => {
    // Add item to cart with quantity
    for (let i = 0; i < quantity; i++) {
      addItem(product, selectedSize, false);
    }
    setAddedToast(true);
    setTimeout(() => {
      setAddedToast(false);
    }, 2500);
  };

  const handleBuyNow = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product, selectedSize, false);
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
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
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

              {/* Size Selector */}
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

              {/* Quantity Selector & Add to Cart */}
              <div className={styles.purchaseControls}>
                <div className={styles.qtyControl}>
                  <button
                    type="button"
                    className={styles.qtyBtn}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className={styles.qtyVal}>{quantity}</span>
                  <button
                    type="button"
                    className={styles.qtyBtn}
                    onClick={() => setQuantity((q) => q + 1)}
                  >
                    +
                  </button>
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

                <button
                  type="button"
                  className={styles.buyNowBtn}
                  onClick={handleBuyNow}
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

          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <section className={styles.relatedSection}>
              <div className={styles.relatedHeader}>
                <div>
                  <span className={styles.relatedBadge}>Handpicked Suggestions</span>
                  <h2 className={styles.relatedTitle}>Related {categoryName} Collections</h2>
                </div>
                <Link href={`/flowers/${product.category}`} className={styles.viewCategoryLink}>
                  <span>Explore all {categoryName}</span>
                  <ChevronRight size={16} />
                </Link>
              </div>

              <div className={styles.relatedGrid}>
                {relatedProducts.slice(0, 3).map((rel) => (
                  <ProductCard key={rel.id} product={rel} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
