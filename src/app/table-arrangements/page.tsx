"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import styles from "./table-arrangements.module.css";
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

interface TableProductItem {
  id: string;
  title: string;
  category: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  image: string;
  tableType: string;
  flowerType: string;
  dimensions: string;
  stems: string[];
}

const ALL_TABLE_PRODUCTS: TableProductItem[] = [
  {
    id: "table-casablanca-candelabra",
    title: "ROYAL CASABLANCA CANDELABRA",
    category: "Elevated Centerpiece",
    price: 4800,
    originalPrice: 5800,
    discountPercent: 17,
    image: "/images/highlight-table-arrangements.jpg",
    tableType: "Round Tables",
    flowerType: "Lilies",
    dimensions: "75cm Height × 50cm Spread",
    stems: ["Casablanca Lilies", "Blush Avalanche Roses", "Hydrangeas", "Eucalyptus"],
  },
  {
    id: "table-tuscan-runner",
    title: "CASCADING TUSCAN BOTANICAL RUNNER",
    category: "Botanical Runner",
    price: 6500,
    originalPrice: 7800,
    discountPercent: 16,
    image: "/images/farm-hand-bouquet-large.jpg",
    tableType: "Long Banquet",
    flowerType: "Roses",
    dimensions: "8 Feet Length Runner",
    stems: ["Silver Dollar Eucalyptus", "Juliet Garden Roses", "Lisianthus", "Italian Ruscus"],
  },
  {
    id: "table-kerala-heritage-uruli",
    title: "MALABAR HERITAGE BRASS URULI",
    category: "Heritage Kerala",
    price: 3400,
    originalPrice: 4200,
    discountPercent: 19,
    image: "/images/highlight-garlands.jpg",
    tableType: "Round Tables",
    flowerType: "Jasmine",
    dimensions: "18-inch Diameter Brass Vessel",
    stems: ["Madurai Jasmine", "Dutch Rose Petals", "Pink Lotus", "Marigold Accents"],
  },
  {
    id: "table-crystal-rose-meadow",
    title: "THE CRYSTAL ROSE MEADOW",
    category: "Low Centerpiece",
    price: 3900,
    originalPrice: 4600,
    discountPercent: 15,
    image: "/images/flower-pink-roses.jpg",
    tableType: "Round Tables",
    flowerType: "Roses",
    dimensions: "35cm Diameter × 25cm Height",
    stems: ["Dutch Avalanche Roses", "Ranunculus", "Gypsophila", "Dusty Miller"],
  },
  {
    id: "table-vip-waterfall",
    title: "IMPERIAL VIP HEAD TABLE WATERFALL",
    category: "VIP Stage",
    price: 18500,
    originalPrice: 22000,
    discountPercent: 16,
    image: "/images/slide1-flower.jpg",
    tableType: "VIP Stage",
    flowerType: "Orchids",
    dimensions: "16 Feet Length Full Cascade",
    stems: ["Cymbidium Orchids", "Hydrangeas", "Avalanche Roses", "Gold Candelabras"],
  },
  {
    id: "table-modern-orchid-compote",
    title: "MINIMALIST MODERN ORCHID COMPOTE",
    category: "Contemporary",
    price: 2600,
    originalPrice: 3200,
    discountPercent: 18,
    image: "/images/flower-white-lilies.jpg",
    tableType: "Cocktail High-Top",
    flowerType: "Orchids",
    dimensions: "30cm Height × 30cm Spread",
    stems: ["Phalaenopsis Orchids", "Monstera Leaves", "Aspidistra Ribbons"],
  },
];

const CATEGORIES_NAV = [
  { name: "Car Decorations", href: "/car-decorations", count: 8, active: false },
  { name: "Table Arrangements", href: "/table-arrangements", count: 6, active: true },
  { name: "Church Arrangements", href: "/church-arrangements", count: 6, active: false },
  { name: "Garlands & Baskets", href: "/garlands-and-baskets", count: 6, active: false },
  { name: "Signature Bouquets", href: "/#shop", count: 12, active: false },
];

export default function TableArrangementsPage() {
  const { addItem } = useCart();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});

  // Filter States
  const [sortBy, setSortBy] = useState<"featured" | "lowToHigh" | "highToLow">("featured");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [selectedTableType, setSelectedTableType] = useState<string>("all");
  const [selectedFlower, setSelectedFlower] = useState<string>("all");

  // Accordion States
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    sort: true,
    price: true,
    table: true,
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
    setSelectedTableType("all");
    setSelectedFlower("all");
  };

  const filteredProducts = useMemo(() => {
    return ALL_TABLE_PRODUCTS.filter((item) => {
      // Price Filter
      if (priceRange === "under4k" && item.price >= 4000) return false;
      if (priceRange === "4kto7k" && (item.price < 4000 || item.price > 7000)) return false;
      if (priceRange === "above7k" && item.price <= 7000) return false;

      // Table Type
      if (selectedTableType !== "all" && item.tableType !== selectedTableType) return false;

      // Flower Type
      if (selectedFlower !== "all" && item.flowerType !== selectedFlower) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === "lowToHigh") return a.price - b.price;
      if (sortBy === "highToLow") return b.price - a.price;
      return 0;
    });
  }, [priceRange, selectedTableType, selectedFlower, sortBy]);

  const handleAddToCart = (item: TableProductItem) => {
    const bouquetAdapter: Bouquet = {
      id: item.id,
      name: item.title,
      subtitle: `${item.category} • ${item.dimensions}`,
      price: item.price,
      originalPrice: item.originalPrice,
      image: item.image,
      occasion: "wedding",
      rating: 5.0,
      reviewsCount: 39,
      stems: item.stems,
      description: `Bespoke centerpiece arrangement for event dining in Kozhikode.`,
      flowerCount: item.dimensions,
      scent: "Subtle & Sweet",
      badge: `${item.discountPercent}% OFF`,
      dimensions: item.dimensions,
    };

    addItem(bouquetAdapter, "Signature", true, `Table arrangement for venue banquet`);
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
            {/* Breadcrumbs */}
            <nav className={styles.cinematicBreadcrumbs} aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <ChevronRight size={13} />
              <Link href="/#highlights">Exclusive Floristry</Link>
              <ChevronRight size={13} />
              <span className={styles.cinematicBreadcrumbActive}>Table Arrangements</span>
            </nav>

            {/* Script Tagline */}
            <div className={styles.cinematicTagline}>Behind the Bouquet</div>

            {/* Grand Title */}
            <h1 className={styles.cinematicTitle}>
              Opulent Table<br />
              Arrangements &<br />
              Centerpieces
            </h1>

            {/* Subtle Gold Divider */}
            <div className={styles.cinematicDivider} />

            {/* Description */}
            <p className={styles.cinematicDescription}>
              From intimate candlelit dinners to grand wedding celebrations, our florists create sophisticated centerpieces and floral tablescapes designed to transform every celebration.
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
                          checked={priceRange === "4kto7k"}
                          onChange={() => setPriceRange("4kto7k")}
                          className={styles.filterRadio}
                        />
                        <span>₹4,000 - ₹7,000</span>
                      </label>
                      <label className={styles.filterOptionLabel}>
                        <input
                          type="radio"
                          name="price"
                          checked={priceRange === "above7k"}
                          onChange={() => setPriceRange("above7k")}
                          className={styles.filterRadio}
                        />
                        <span>Above ₹7,000</span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Table Type */}
                <div className={styles.filterAccordionItem}>
                  <button
                    type="button"
                    className={styles.filterAccordionHeader}
                    onClick={() => toggleSection("table")}
                  >
                    <div className={styles.filterHeaderLeft}>
                      <span>🍽</span>
                      <span>Table Setting</span>
                    </div>
                    {openSections.table ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {openSections.table && (
                    <div className={styles.filterAccordionContent}>
                      {["all", "Round Tables", "Long Banquet", "VIP Stage", "Cocktail High-Top"].map(
                        (tab) => (
                          <label key={tab} className={styles.filterOptionLabel}>
                            <input
                              type="radio"
                              name="table"
                              checked={selectedTableType === tab}
                              onChange={() => setSelectedTableType(tab)}
                              className={styles.filterRadio}
                            />
                            <span>{tab === "all" ? "All Table Formats" : tab}</span>
                          </label>
                        )
                      )}
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
                      <span>🌸</span>
                      <span>Flower Variety</span>
                    </div>
                    {openSections.flower ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {openSections.flower && (
                    <div className={styles.filterAccordionContent}>
                      {["all", "Roses", "Lilies", "Orchids", "Jasmine"].map((flw) => (
                        <label key={flw} className={styles.filterOptionLabel}>
                          <input
                            type="radio"
                            name="flower"
                            checked={selectedFlower === flw}
                            onChange={() => setSelectedFlower(flw)}
                            className={styles.filterRadio}
                          />
                          <span>{flw === "all" ? "All Flower Types" : flw}</span>
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
                Centerpiece Designs
              </div>

              {/* Active Filter Chips */}
              <div className={styles.activeFiltersPills}>
                {selectedTableType !== "all" && (
                  <span className={styles.activeFilterPill}>
                    {selectedTableType}
                    <X
                      size={12}
                      className={styles.removeFilterIcon}
                      onClick={() => setSelectedTableType("all")}
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
                      : priceRange === "4kto7k"
                      ? "₹4,000 - ₹7,000"
                      : "Above ₹7,000"}
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
                            `Hello Occassions Florist, I would like to book or inquire about "${item.title}" (₹${item.price}) for our table decor.`
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
