"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import styles from "./garlands-and-baskets.module.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryQuotes from "@/components/CategoryQuotes";
import { useCart } from "@/context/CartContext";
import { Bouquet } from "@/types";
import {
  ChevronRight,
  ShoppingBag,
  MessageCircle,
  Phone,
  CheckCircle2,
  Clock,
  Heart,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  Award,
  ArrowRight,
} from "lucide-react";

interface GarlandProductItem {
  id: string;
  title: string;
  category: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  image: string;
  itemType: string;
  flowerType: string;
  dimensions: string;
  stems: string[];
}

const ALL_GARLAND_PRODUCTS: GarlandProductItem[] = [
  {
    id: "garland-madurai-jasmine-lotus",
    title: "ROYAL MADURAI JASMINE & LOTUS VARMALA",
    category: "Bridal Varmala",
    price: 4800,
    originalPrice: 5800,
    discountPercent: 17,
    image: "/images/highlight-garlands.jpg",
    itemType: "Wedding Varmala",
    flowerType: "Jasmine",
    dimensions: "Matching Pair • 36-inch Length",
    stems: ["Madurai Jasmine", "Pink Lotus Buds", "Dutch Rose Petals", "Gold Zari Cords"],
  },
  {
    id: "garland-dutch-rose-petal",
    title: "DUTCH ROSE PETAL & GOLD THREAD GARLAND",
    category: "Rose Petal Varmala",
    price: 5600,
    originalPrice: 6600,
    discountPercent: 15,
    image: "/images/cat-congratulations.jpg",
    itemType: "Wedding Varmala",
    flowerType: "Roses",
    dimensions: "Matching Pair • 38-inch Length",
    stems: ["Grade-A Dutch Rose Petals", "Gold Zari Threads", "Pearl Pendants"],
  },
  {
    id: "garland-pastel-orchid-lightweight",
    title: "PASTEL CARNATION & ORCHID VARMALA",
    category: "Modern Lightweight",
    price: 4200,
    originalPrice: 5000,
    discountPercent: 16,
    image: "/images/cat-seasonal-flowers.jpg",
    itemType: "Wedding Varmala",
    flowerType: "Orchids",
    dimensions: "Matching Pair • 32-inch Length",
    stems: ["Pink Carnations", "Dendrobium Orchids", "Gypsophila", "Satin Ties"],
  },
  {
    id: "basket-auspicious-brass-uruli",
    title: "KERALA BRASS URULI FLOWER BASKET",
    category: "Heritage Uruli Basket",
    price: 3200,
    originalPrice: 3800,
    discountPercent: 16,
    image: "/images/highlight-garlands.jpg",
    itemType: "Gift Baskets",
    flowerType: "Jasmine",
    dimensions: "16-inch Diameter Solid Brass Vessel",
    stems: ["Jasmine Loops", "Sacred Lotus", "Marigold Blossoms", "Brass Diyas"],
  },
  {
    id: "basket-signature-velvet-hamper",
    title: "SIGNATURE VELVET FLORAL GIFT HAMPER",
    category: "Gift Hamper",
    price: 4500,
    originalPrice: 5300,
    discountPercent: 15,
    image: "/images/bouquet-2.jpg",
    itemType: "Gift Baskets",
    flowerType: "Roses",
    dimensions: "Handcrafted Luxury Gift Crate",
    stems: ["Avalanche Roses", "Ferrero Chocolates", "Botanical Candle", "Gourmet Dry Fruits"],
  },
  {
    id: "basket-thamboolam-ceremony-set",
    title: "TRADITIONAL JASMINE THAMBOOLAM BASKETS (10 PCS)",
    category: "Ceremony Favor Baskets",
    price: 6000,
    originalPrice: 7200,
    discountPercent: 17,
    image: "/images/bouquet-3.jpg",
    itemType: "Ceremony Favors",
    flowerType: "Jasmine",
    dimensions: "Set of 10 Handwoven Gift Baskets",
    stems: ["Jasmine Strands", "Betel Leaves", "Golden Organza Bags"],
  },
];

const CATEGORIES_NAV = [
  { name: "Car Decorations", href: "/car-decorations", count: 8, active: false },
  { name: "Table Arrangements", href: "/table-arrangements", count: 6, active: false },
  { name: "Church Arrangements", href: "/church-arrangements", count: 6, active: false },
  { name: "Garlands & Baskets", href: "/garlands-and-baskets", count: 6, active: true },
  { name: "Signature Bouquets", href: "/#shop", count: 12, active: false },
];

export default function GarlandsAndBasketsPage() {
  const { addItem } = useCart();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});

  // Filter States
  const [sortBy, setSortBy] = useState<"featured" | "lowToHigh" | "highToLow">("featured");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [selectedItemType, setSelectedItemType] = useState<string>("all");
  const [selectedFlower, setSelectedFlower] = useState<string>("all");

  // Accordion States
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    sort: true,
    price: true,
    itemType: true,
    flower: true,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist((prev) => {
      const nextState = !prev[id];
      if (nextState) {
        setToastMessage("Added item to Wishlist!");
        setTimeout(() => setToastMessage(null), 3000);
      }
      return { ...prev, [id]: nextState };
    });
  };

  const clearAllFilters = () => {
    setSortBy("featured");
    setPriceRange("all");
    setSelectedItemType("all");
    setSelectedFlower("all");
  };

  const filteredProducts = useMemo(() => {
    return ALL_GARLAND_PRODUCTS.filter((item) => {
      // Price Filter
      if (priceRange === "under4k" && item.price >= 4000) return false;
      if (priceRange === "4kto5k" && (item.price < 4000 || item.price > 5000)) return false;
      if (priceRange === "above5k" && item.price <= 5000) return false;

      // Item Type
      if (selectedItemType !== "all" && item.itemType !== selectedItemType) return false;

      // Flower Type
      if (selectedFlower !== "all" && item.flowerType !== selectedFlower) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === "lowToHigh") return a.price - b.price;
      if (sortBy === "highToLow") return b.price - a.price;
      return 0;
    });
  }, [priceRange, selectedItemType, selectedFlower, sortBy]);

  const handleAddToCart = (item: GarlandProductItem) => {
    const bouquetAdapter: Bouquet = {
      id: item.id,
      name: item.title,
      subtitle: `${item.category} • ${item.dimensions}`,
      price: item.price,
      originalPrice: item.originalPrice,
      image: item.image,
      occasion: "wedding",
      rating: 5.0,
      reviewsCount: 52,
      stems: item.stems,
      description: `Handcrafted garland or gift basket in Kozhikode with ${item.stems.join(", ")}.`,
      flowerCount: item.dimensions,
      scent: "Subtle & Sweet",
      badge: `${item.discountPercent}% OFF`,
      dimensions: item.dimensions,
    };

    addItem(bouquetAdapter, "Signature", true, `Wedding garland or auspicious basket`);
    setToastMessage(`Added "${item.title}" to your Cart!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Universal Header */}
      <Header />

      {/* ================= CINEMATIC FULL-BLEED HERO (MATCHING USER SCREENSHOT) ================= */}
      <section className={styles.cinematicHero}>
        <div className={styles.cinematicOverlay} />
        <div className={styles.cinematicContent}>
          <div className={styles.cinematicTextGroup}>
            {/* Breadcrumbs in clean white */}
            <nav className={styles.cinematicBreadcrumbs} aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <ChevronRight size={13} />
              <Link href="/#highlights">Exclusive Floristry</Link>
              <ChevronRight size={13} />
              <span className={styles.cinematicBreadcrumbActive}>Garlands & Baskets</span>
            </nav>

            {/* Script Tagline */}
            <div className={styles.cinematicTagline}>Auspicious & Fragrant</div>

            {/* Grand Title */}
            <h1 className={styles.cinematicTitle}>
              Bridal Varmalas,<br />
              Sacred Garlands &<br />
              Gift Baskets
            </h1>

            {/* Subtle Gold Divider */}
            <div className={styles.cinematicDivider} />

            {/* Description */}
            <p className={styles.cinematicDescription}>
              Handcrafted traditional varmalas, fragrant floral garlands and elegant presentation baskets, carefully prepared for unforgettable wedding celebrations.
            </p>

            {/* Pill Button */}
            <a href="#arrangements" className={styles.cinematicBtn}>
              <span>View Arrangements</span>
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* ================= MAIN CATALOG WITH LEFT SIDEBAR ================= */}
      <main className={styles.mainContainer} id="arrangements">
        <div className={styles.catalogLayout}>
          {/* ================= LEFT SIDEBAR (MATCHING 2ND IMAGE) ================= */}
          <aside className={styles.sidebar}>
            {/* 1. Browse Other Categories Card */}
            <div className={styles.categoryNavCard}>
              <div className={styles.categoryNavHeader}>Other Categories</div>
              <ul className={styles.categoryNavList}>
                {CATEGORIES_NAV.map((cat) => (
                  <li key={cat.name}>
                    <Link
                      href={cat.href}
                      className={`${styles.categoryNavItem} ${
                        cat.active ? styles.categoryNavItemActive : ""
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className={styles.categoryItemCount}>{cat.count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* 2. Filters Card with Solid Red Header (Exact 2nd Image Reference) */}
            <div className={styles.filterCard}>
              <div className={styles.filterCardHeader}>
                <SlidersHorizontal size={18} />
                <span>Filters</span>
              </div>

              <div className={styles.filterAccordionGroup}>
                {/* Sort By */}
                <div className={styles.filterAccordionItem}>
                  <button
                    type="button"
                    className={styles.filterAccordionHeader}
                    onClick={() => toggleSection("sort")}
                  >
                    <div className={styles.filterHeaderLeft}>
                      <span>⇅</span>
                      <span>Sort By</span>
                    </div>
                    {openSections.sort ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {openSections.sort && (
                    <div className={styles.filterAccordionContent}>
                      <label className={styles.filterOptionLabel}>
                        <input
                          type="radio"
                          name="sort"
                          checked={sortBy === "featured"}
                          onChange={() => setSortBy("featured")}
                          className={styles.filterRadio}
                        />
                        <span>Featured & Recommended</span>
                      </label>
                      <label className={styles.filterOptionLabel}>
                        <input
                          type="radio"
                          name="sort"
                          checked={sortBy === "lowToHigh"}
                          onChange={() => setSortBy("lowToHigh")}
                          className={styles.filterRadio}
                        />
                        <span>Price: Low to High</span>
                      </label>
                      <label className={styles.filterOptionLabel}>
                        <input
                          type="radio"
                          name="sort"
                          checked={sortBy === "highToLow"}
                          onChange={() => setSortBy("highToLow")}
                          className={styles.filterRadio}
                        />
                        <span>Price: High to Low</span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Price Range */}
                <div className={styles.filterAccordionItem}>
                  <button
                    type="button"
                    className={styles.filterAccordionHeader}
                    onClick={() => toggleSection("price")}
                  >
                    <div className={styles.filterHeaderLeft}>
                      <span>₹</span>
                      <span>Price Range</span>
                    </div>
                    {openSections.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {openSections.price && (
                    <div className={styles.filterAccordionContent}>
                      <label className={styles.filterOptionLabel}>
                        <input
                          type="radio"
                          name="price"
                          checked={priceRange === "all"}
                          onChange={() => setPriceRange("all")}
                          className={styles.filterRadio}
                        />
                        <span>All Prices</span>
                      </label>
                      <label className={styles.filterOptionLabel}>
                        <input
                          type="radio"
                          name="price"
                          checked={priceRange === "under4k"}
                          onChange={() => setPriceRange("under4k")}
                          className={styles.filterRadio}
                        />
                        <span>Under ₹4,000</span>
                      </label>
                      <label className={styles.filterOptionLabel}>
                        <input
                          type="radio"
                          name="price"
                          checked={priceRange === "4kto5k"}
                          onChange={() => setPriceRange("4kto5k")}
                          className={styles.filterRadio}
                        />
                        <span>₹4,000 - ₹5,000</span>
                      </label>
                      <label className={styles.filterOptionLabel}>
                        <input
                          type="radio"
                          name="price"
                          checked={priceRange === "above5k"}
                          onChange={() => setPriceRange("above5k")}
                          className={styles.filterRadio}
                        />
                        <span>Above ₹5,000</span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Item Type */}
                <div className={styles.filterAccordionItem}>
                  <button
                    type="button"
                    className={styles.filterAccordionHeader}
                    onClick={() => toggleSection("itemType")}
                  >
                    <div className={styles.filterHeaderLeft}>
                      <span>🌸</span>
                      <span>Format</span>
                    </div>
                    {openSections.itemType ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {openSections.itemType && (
                    <div className={styles.filterAccordionContent}>
                      {["all", "Wedding Varmala", "Gift Baskets", "Ceremony Favors"].map((type) => (
                        <label key={type} className={styles.filterOptionLabel}>
                          <input
                            type="radio"
                            name="itemType"
                            checked={selectedItemType === type}
                            onChange={() => setSelectedItemType(type)}
                            className={styles.filterRadio}
                          />
                          <span>{type === "all" ? "All Formats" : type}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Flower Type */}
                <div className={styles.filterAccordionItem}>
                  <button
                    type="button"
                    className={styles.filterAccordionHeader}
                    onClick={() => toggleSection("flower")}
                  >
                    <div className={styles.filterHeaderLeft}>
                      <span>💐</span>
                      <span>Flower Variety</span>
                    </div>
                    {openSections.flower ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {openSections.flower && (
                    <div className={styles.filterAccordionContent}>
                      {["all", "Jasmine", "Roses", "Orchids"].map((flw) => (
                        <label key={flw} className={styles.filterOptionLabel}>
                          <input
                            type="radio"
                            name="flower"
                            checked={selectedFlower === flw}
                            onChange={() => setSelectedFlower(flw)}
                            className={styles.filterRadio}
                          />
                          <span>{flw === "all" ? "All Flowers" : flw}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons (Apply & Clear) */}
              <div className={styles.filterActionsArea}>
                <button
                  type="button"
                  className={styles.applyFiltersBtn}
                  onClick={() => {
                    setToastMessage("Filters applied successfully!");
                    setTimeout(() => setToastMessage(null), 2500);
                  }}
                >
                  Apply Filters
                </button>
                <button
                  type="button"
                  className={styles.clearFiltersBtn}
                  onClick={clearAllFilters}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </aside>

          {/* ================= RIGHT MAIN: PRODUCT GRID (MATCHING 2ND IMAGE) ================= */}
          <div className={styles.productsMainCol}>
            {/* Top Bar with Counts & Active Filters */}
            <div className={styles.productsTopBar}>
              <div className={styles.productsFoundText}>
                Showing <span className={styles.productsFoundBold}>{filteredProducts.length}</span>{" "}
                Garlands & Baskets
              </div>

              {/* Active Filter Chips */}
              <div className={styles.activeFiltersPills}>
                {selectedItemType !== "all" && (
                  <span className={styles.activeFilterPill}>
                    {selectedItemType}
                    <X
                      size={12}
                      className={styles.removeFilterIcon}
                      onClick={() => setSelectedItemType("all")}
                    />
                  </span>
                )}
                {selectedFlower !== "all" && (
                  <span className={styles.activeFilterPill}>
                    {selectedFlower}
                    <X
                      size={12}
                      className={styles.removeFilterIcon}
                      onClick={() => setSelectedFlower("all")}
                    />
                  </span>
                )}
                {priceRange !== "all" && (
                  <span className={styles.activeFilterPill}>
                    {priceRange === "under4k"
                      ? "Under ₹4,000"
                      : priceRange === "4kto5k"
                      ? "₹4,000 - ₹5,000"
                      : "Above ₹5,000"}
                    <X
                      size={12}
                      className={styles.removeFilterIcon}
                      onClick={() => setPriceRange("all")}
                    />
                  </span>
                )}
              </div>
            </div>

            {/* Product Cards Grid */}
            <div className={styles.productsGrid}>
              {filteredProducts.map((item) => {
                const isLiked = !!wishlist[item.id];

                return (
                  <article key={item.id} className={styles.productCard}>
                    {/* Image Area with Floating Wishlist Heart Button */}
                    <div className={styles.cardImgWrap}>
                      <img
                        src={item.image}
                        alt={item.title}
                        className={styles.productImg}
                        loading="lazy"
                      />
                      <button
                        type="button"
                        className={styles.wishlistBtn}
                        onClick={(e) => toggleWishlist(item.id, e)}
                        aria-label={`Add ${item.title} to wishlist`}
                      >
                        <Heart
                          size={17}
                          className={
                            isLiked
                              ? styles.wishlistHeartFilled
                              : styles.wishlistHeartDefault
                          }
                        />
                      </button>
                    </div>

                    {/* Card Content (Title, Price, Discount, Add to Cart) */}
                    <div className={styles.cardInfo}>
                      <span className={styles.cardCategory}>{item.category}</span>
                      <h2 className={styles.cardTitle} title={item.title}>
                        {item.title}
                      </h2>

                      {/* Pricing Row with Green Price, Strikethrough & Red % Badge */}
                      <div className={styles.cardPriceRow}>
                        <span className={styles.currentPrice}>
                          ₹{item.price.toLocaleString("en-IN")}
                        </span>
                        <span className={styles.originalPrice}>
                          ₹{item.originalPrice.toLocaleString("en-IN")}
                        </span>
                        <span className={styles.discountBadge}>
                          {item.discountPercent}% OFF
                        </span>
                      </div>

                      {/* Solid Red Add to Cart Button (from 2nd image) + WhatsApp */}
                      <div className={styles.cardButtonsRow}>
                        <button
                          type="button"
                          className={styles.addToCartBtn}
                          onClick={() => handleAddToCart(item)}
                          aria-label={`Add ${item.title} to cart`}
                        >
                          <ShoppingBag size={15} />
                          <span>Add to Cart</span>
                        </button>
                        <a
                          href={`https://wa.me/918606464700?text=${encodeURIComponent(
                            `Hello Occassions Florist, I would like to book or inquire about "${item.title}" (₹${item.price}) for our celebration.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.whatsAppQuickBtn}
                          aria-label={`WhatsApp inquiry for ${item.title}`}
                        >
                          <MessageCircle size={16} />
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Cart Toast Notification */}
      {toastMessage && (
        <aside className={styles.toast} role="status">
          <CheckCircle2 size={18} color="#10b981" />
          <span>{toastMessage}</span>
          <Link href="/cart" className={styles.toastLink}>
            View Cart →
          </Link>
        </aside>
      )}

      {/* Universal Footer */}
      <Footer />
    </div>
  );
}
