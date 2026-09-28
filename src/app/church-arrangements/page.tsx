"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import styles from "./church-arrangements.module.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { Bouquet } from "@/types";
import {
  ChevronRight,
  ShoppingBag,
  MessageCircle,
  Heart,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  X,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

interface ChurchProductItem {
  id: string;
  title: string;
  category: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  image: string;
  areaType: string;
  flowerType: string;
  dimensions: string;
  stems: string[];
}

const ALL_CHURCH_PRODUCTS: ChurchProductItem[] = [
  {
    id: "church-grand-altar-arch",
    title: "CATHEDRAL GRAND ALTAR FLORAL ARCH",
    category: "Altar Arch",
    price: 16500,
    originalPrice: 19500,
    discountPercent: 15,
    image: "/images/highlight-church-arrangements.jpg",
    areaType: "Altar Sanctuary",
    flowerType: "Lilies",
    dimensions: "9ft Height × 8ft Width Grand Arch",
    stems: ["Casablanca Lilies", "Avalanche Roses", "White Hydrangeas", "Italian Ruscus"],
  },
  {
    id: "church-pew-posies-set",
    title: "ROMANTIC CANDLELIT PEW POSIES (16 PEWS)",
    category: "Aisle Pews",
    price: 6800,
    originalPrice: 8200,
    discountPercent: 17,
    image: "/images/flower-white-lilies.jpg",
    areaType: "Central Aisle",
    flowerType: "Roses",
    dimensions: "16 Matching Pew Clusters with Satin Ribbons",
    stems: ["White Spray Roses", "Million-Star Gypsophila", "Duchess Satin Ribbons"],
  },
  {
    id: "church-casablanca-meadow",
    title: "CASABLANCA LILY & HYDRANGEA AISLE MEADOW",
    category: "Aisle Runner",
    price: 9200,
    originalPrice: 11000,
    discountPercent: 16,
    image: "/images/farm-peonies-tall-large.jpg",
    areaType: "Central Aisle",
    flowerType: "Lilies",
    dimensions: "30-Foot Continuous Processional Meadow",
    stems: ["Casablanca Lilies", "White Peonies", "Glass Hurricane Lanterns"],
  },
  {
    id: "church-kneeler-garland",
    title: "SANCTUARY ALTAR RAIL & KNEELER POSIES",
    category: "Kneeler & Rails",
    price: 4500,
    originalPrice: 5400,
    discountPercent: 16,
    image: "/images/slide1-flower.jpg",
    areaType: "Sanctuary Rails",
    flowerType: "Roses",
    dimensions: "Altar Communion Rail + 2 Prie-Dieu Kneelers",
    stems: ["White Dutch Roses", "Fragrant Tuberoses", "Eucalyptus Greens"],
  },
  {
    id: "church-entrance-arch",
    title: "GRAND CATHEDRAL FACADE & ENTRANCE ARCH",
    category: "Entrance Arch",
    price: 18000,
    originalPrice: 21500,
    discountPercent: 16,
    image: "/images/slide3-flower.jpg",
    areaType: "Main Entrance",
    flowerType: "Roses",
    dimensions: "10ft Exterior Stone Portal Arch",
    stems: ["Avalanche Roses", "Bells of Ireland", "Monstera Leaves", "Hydrangeas"],
  },
  {
    id: "church-full-sanctuary-suite",
    title: "COMPLETE SACRED SANCTUARY FLORAL SUITE",
    category: "Full Sanctuary Suite",
    price: 42000,
    originalPrice: 49000,
    discountPercent: 14,
    image: "/images/highlight-church-arrangements.jpg",
    areaType: "Full Sanctuary Suite",
    flowerType: "Lilies",
    dimensions: "Complete 360° Church Transformation",
    stems: ["Premium Import White Lilies", "Avalanche Roses", "50+ Hurricane Lamps"],
  },
];

const CATEGORIES_NAV = [
  { name: "Car Decorations", href: "/car-decorations", count: 8, active: false },
  { name: "Table Arrangements", href: "/table-arrangements", count: 6, active: false },
  { name: "Church Arrangements", href: "/church-arrangements", count: 6, active: true },
  { name: "Garlands & Baskets", href: "/garlands-and-baskets", count: 6, active: false },
  { name: "Signature Bouquets", href: "/#shop", count: 12, active: false },
];

export default function ChurchArrangementsPage() {
  const { addItem } = useCart();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});

  // Filter States
  const [sortBy, setSortBy] = useState<"featured" | "lowToHigh" | "highToLow">("featured");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [selectedArea, setSelectedArea] = useState<string>("all");
  const [selectedFlower, setSelectedFlower] = useState<string>("all");

  // Accordion States
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    sort: true,
    price: true,
    area: true,
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
    setSelectedArea("all");
    setSelectedFlower("all");
  };

  const filteredProducts = useMemo(() => {
    return ALL_CHURCH_PRODUCTS.filter((item) => {
      // Price Filter
      if (priceRange === "under7k" && item.price >= 7000) return false;
      if (priceRange === "7kto17k" && (item.price < 7000 || item.price > 17000)) return false;
      if (priceRange === "above17k" && item.price <= 17000) return false;

      // Area Filter
      if (selectedArea !== "all" && item.areaType !== selectedArea) return false;

      // Flower Filter
      if (selectedFlower !== "all" && item.flowerType !== selectedFlower) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === "lowToHigh") return a.price - b.price;
      if (sortBy === "highToLow") return b.price - a.price;
      return 0;
    });
  }, [priceRange, selectedArea, selectedFlower, sortBy]);

  const handleAddToCart = (item: ChurchProductItem) => {
    const bouquetAdapter: Bouquet = {
      id: item.id,
      name: item.title,
      subtitle: `${item.category} • ${item.dimensions}`,
      price: item.price,
      originalPrice: item.originalPrice,
      image: item.image,
      occasion: "wedding",
      rating: 5.0,
      reviewsCount: 47,
      stems: item.stems,
      description: `Bespoke cathedral floral design in Kozhikode with ${item.stems.join(", ")}.`,
      flowerCount: item.dimensions,
      scent: "Fresh & Green",
      badge: `${item.discountPercent}% OFF`,
      dimensions: item.dimensions,
    };

    addItem(bouquetAdapter, "Signature", true, `Church wedding arrangement`);
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
              <span className={styles.cinematicBreadcrumbActive}>Church Arrangements</span>
            </nav>

            {/* Script Tagline */}
            <div className={styles.cinematicTagline}>Sacred & Heavenly</div>

            {/* Grand Title */}
            <h1 className={styles.cinematicTitle}>
              Grand Cathedral &<br />
              Church Floral<br />
              Arrangements
            </h1>

            {/* Subtle Gold Divider */}
            <div className={styles.cinematicDivider} />

            {/* Description */}
            <p className={styles.cinematicDescription}>
              Create a sublime, reverent atmosphere for your holy matrimony ceremony with elegant cathedral floral arrangements curated with care and devotion.
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

            {/* 2. Filters Card with Solid Red Header */}
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
                          checked={priceRange === "under7k"}
                          onChange={() => setPriceRange("under7k")}
                          className={styles.filterRadio}
                        />
                        <span>Under ₹7,000</span>
                      </label>
                      <label className={styles.filterOptionLabel}>
                        <input
                          type="radio"
                          name="price"
                          checked={priceRange === "7kto17k"}
                          onChange={() => setPriceRange("7kto17k")}
                          className={styles.filterRadio}
                        />
                        <span>₹7,000 - ₹17,000</span>
                      </label>
                      <label className={styles.filterOptionLabel}>
                        <input
                          type="radio"
                          name="price"
                          checked={priceRange === "above17k"}
                          onChange={() => setPriceRange("above17k")}
                          className={styles.filterRadio}
                        />
                        <span>Above ₹17,000</span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Sanctuary Area */}
                <div className={styles.filterAccordionItem}>
                  <button
                    type="button"
                    className={styles.filterAccordionHeader}
                    onClick={() => toggleSection("area")}
                  >
                    <div className={styles.filterHeaderLeft}>
                      <span>⛪</span>
                      <span>Sanctuary Area</span>
                    </div>
                    {openSections.area ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {openSections.area && (
                    <div className={styles.filterAccordionContent}>
                      {[
                        "all",
                        "Altar Sanctuary",
                        "Central Aisle",
                        "Sanctuary Rails",
                        "Main Entrance",
                        "Full Sanctuary Suite",
                      ].map((area) => (
                        <label key={area} className={styles.filterOptionLabel}>
                          <input
                            type="radio"
                            name="area"
                            checked={selectedArea === area}
                            onChange={() => setSelectedArea(area)}
                            className={styles.filterRadio}
                          />
                          <span>{area === "all" ? "All Sanctuary Areas" : area}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Flower Variety */}
                <div className={styles.filterAccordionItem}>
                  <button
                    type="button"
                    className={styles.filterAccordionHeader}
                    onClick={() => toggleSection("flower")}
                  >
                    <div className={styles.filterHeaderLeft}>
                      <span>🌸</span>
                      <span>Flower Variety</span>
                    </div>
                    {openSections.flower ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {openSections.flower && (
                    <div className={styles.filterAccordionContent}>
                      {["all", "Lilies", "Roses"].map((flw) => (
                        <label key={flw} className={styles.filterOptionLabel}>
                          <input
                            type="radio"
                            name="flower"
                            checked={selectedFlower === flw}
                            onChange={() => setSelectedFlower(flw)}
                            className={styles.filterRadio}
                          />
                          <span>{flw === "all" ? "All Liturgical Blooms" : flw}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
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
                Sanctuary Designs
              </div>

              {/* Active Filter Chips */}
              <div className={styles.activeFiltersPills}>
                {selectedArea !== "all" && (
                  <span className={styles.activeFilterPill}>
                    {selectedArea}
                    <X
                      size={12}
                      className={styles.removeFilterIcon}
                      onClick={() => setSelectedArea("all")}
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
                    {priceRange === "under7k"
                      ? "Under ₹7,000"
                      : priceRange === "7kto17k"
                      ? "₹7,000 - ₹17,000"
                      : "Above ₹17,000"}
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

                      {/* Solid Red Add to Cart Button + WhatsApp */}
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
                            `Hello Occassions Florist, I would like to book or inquire about "${item.title}" (₹${item.price}) for our church wedding.`
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
