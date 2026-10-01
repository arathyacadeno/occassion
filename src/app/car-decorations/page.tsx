"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import styles from "./car-decorations.module.css";
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
  ShieldCheck,
  Clock,
  Car,
  Heart,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface CarProductItem {
  id: string;
  title: string;
  category: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  image: string;
  vehicleType: string;
  flowerType: string;
  dimensions: string;
  stems: string[];
}

const ALL_CAR_PRODUCTS: CarProductItem[] = [
  {
    id: "car-imperial-cascading-bonnet",
    title: "IMPERIAL CASCADING BONNET ARCH",
    category: "Luxury Bonnet",
    price: 6800,
    originalPrice: 7999,
    discountPercent: 15,
    image: "/images/highlight-car-decorations.jpg",
    vehicleType: "Sedans",
    flowerType: "Roses",
    dimensions: "120cm Bonnet Crescent",
    stems: ["Avalanche Roses", "Blush Ranunculus", "Baby's Breath", "Eucalyptus"],
  },
  {
    id: "car-minimalist-orchid-posy",
    title: "MINIMALIST ROYAL ORCHID POSIES",
    category: "Minimalist Posy",
    price: 3800,
    originalPrice: 4500,
    discountPercent: 16,
    image: "/images/flower-white-roses.jpg",
    vehicleType: "Sedans",
    flowerType: "Orchids",
    dimensions: "45cm Cluster + 4 Posies",
    stems: ["Cymbidium Orchids", "White Spray Roses", "Italian Ruscus"],
  },
  {
    id: "car-full-bridal-suite",
    title: "FULL BRIDAL CAR GRANDEUR SUITE",
    category: "Complete Suite",
    price: 9800,
    originalPrice: 11999,
    discountPercent: 18,
    image: "/images/highlight-car-decorations.jpg",
    vehicleType: "Sedans",
    flowerType: "Roses",
    dimensions: "Full Vehicle 360° Installation",
    stems: ["Dutch Roses", "Hydrangeas", "Lisianthus", "Satin Bows"],
  },
  {
    id: "car-vintage-rolls-royce",
    title: "VINTAGE ROLLS ROYCE GARLAND WRAP",
    category: "Vintage Grandeur",
    price: 8900,
    originalPrice: 10500,
    discountPercent: 15,
    image: "/images/farm-tulips-wrap-large.jpg",
    vehicleType: "Vintage",
    flowerType: "Jasmine",
    dimensions: "Fender & Radiator Hugging",
    stems: ["Fragrant Jasmine", "Scarlet Rose Buds", "Gold Cord Ribbons"],
  },
  {
    id: "car-pastel-rose-cloud",
    title: "PASTEL ROSE & GYPSOPHILA CLOUD",
    category: "Pastel Cloud",
    price: 5200,
    originalPrice: 6200,
    discountPercent: 16,
    image: "/images/flower-pink-roses.jpg",
    vehicleType: "SUVs",
    flowerType: "Roses",
    dimensions: "90cm Front Cloud",
    stems: ["Pink Dutch Roses", "Million-Star Gypsophila", "Silver Dollar Foliage"],
  },
  {
    id: "car-sunroof-cascade",
    title: "OPEN ROOF TROPICAL ORCHID CASCADE",
    category: "Convertible & Sunroof",
    price: 7200,
    originalPrice: 8500,
    discountPercent: 15,
    image: "/images/slide2-flower.jpg",
    vehicleType: "Convertible",
    flowerType: "Orchids",
    dimensions: "Panoramic Roof Surround",
    stems: ["Dendrobium Orchids", "Asparagus Fern", "Peach Roses"],
  },
  {
    id: "car-white-lily-elegance",
    title: "CASABLANCA WHITE LILY HOOD DRAPE",
    category: "Luxury Bonnet",
    price: 6400,
    originalPrice: 7500,
    discountPercent: 15,
    image: "/images/flower-white-lilies.jpg",
    vehicleType: "Sedans",
    flowerType: "Lilies",
    dimensions: "100cm Diagonal Drape",
    stems: ["Casablanca Lilies", "White Roses", "Trailing Ivy"],
  },
  {
    id: "car-suv-regal-front-grille",
    title: "REGAL SUV FRONT GRILLE & MIRROR SET",
    category: "Complete Suite",
    price: 7800,
    originalPrice: 9200,
    discountPercent: 15,
    image: "/images/farm-peonies-tall-large.jpg",
    vehicleType: "SUVs",
    flowerType: "Roses",
    dimensions: "Grille + Mirrors + 4 Doors",
    stems: ["Red Dutch Roses", "Eucalyptus", "Gold Organza"],
  },
];

const CATEGORIES_NAV = [
  { name: "Car Decorations", href: "/car-decorations", count: 8, active: true },
  { name: "Table Arrangements", href: "/table-arrangements", count: 6, active: false },
  { name: "Church Arrangements", href: "/church-arrangements", count: 6, active: false },
  { name: "Garlands & Baskets", href: "/garlands-and-baskets", count: 6, active: false },
  { name: "Signature Bouquets", href: "/#shop", count: 12, active: false },
];

export default function CarDecorationsPage() {
  const { addItem } = useCart();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});

  // Filter States
  const [sortBy, setSortBy] = useState<"featured" | "lowToHigh" | "highToLow">("featured");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [selectedVehicle, setSelectedVehicle] = useState<string>("all");
  const [selectedFlower, setSelectedFlower] = useState<string>("all");

  // Accordion Collapse States
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    sort: true,
    price: true,
    vehicle: true,
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
    setSelectedVehicle("all");
    setSelectedFlower("all");
  };

  const filteredProducts = useMemo(() => {
    return ALL_CAR_PRODUCTS.filter((item) => {
      // Price Filter
      if (priceRange === "under5k" && item.price >= 5000) return false;
      if (priceRange === "5kto8k" && (item.price < 5000 || item.price > 8000)) return false;
      if (priceRange === "above8k" && item.price <= 8000) return false;

      // Vehicle Filter
      if (selectedVehicle !== "all" && item.vehicleType !== selectedVehicle) return false;

      // Flower Filter
      if (selectedFlower !== "all" && item.flowerType !== selectedFlower) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === "lowToHigh") return a.price - b.price;
      if (sortBy === "highToLow") return b.price - a.price;
      return 0;
    });
  }, [priceRange, selectedVehicle, selectedFlower, sortBy]);

  const handleAddToCart = (item: CarProductItem) => {
    const bouquetAdapter: Bouquet = {
      id: item.id,
      name: item.title,
      subtitle: `${item.category} • ${item.vehicleType}`,
      price: item.price,
      originalPrice: item.originalPrice,
      image: item.image,
      occasion: "wedding",
      rating: 5.0,
      reviewsCount: 48,
      stems: item.stems,
      description: `Bespoke scratch-proof car decoration in Kozhikode with ${item.stems.join(", ")}.`,
      flowerCount: item.dimensions,
      scent: "Subtle & Sweet",
      badge: `${item.discountPercent}% OFF`,
      dimensions: item.dimensions,
    };

    addItem(bouquetAdapter, "Signature", true, `Wedding car styling package`);
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
              <span className={styles.cinematicBreadcrumbActive}>Car Decoration</span>
            </nav>

            {/* Script Tagline */}
            <div className={styles.cinematicTagline}>The Grand Arrival</div>

            {/* Grand Title */}
            <h1 className={styles.cinematicTitle}>
              Bespoke Wedding Car<br />
              Floral Styling
            </h1>

            {/* Subtle Gold Divider */}
            <div className={styles.cinematicDivider} />

            {/* Description */}
            <p className={styles.cinematicDescription}>
              Transform your bridal arrival with elegant floral styling, graceful ribbons and fresh blooms crafted especially for your wedding day.
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
                          checked={priceRange === "under5k"}
                          onChange={() => setPriceRange("under5k")}
                          className={styles.filterRadio}
                        />
                        <span>Under ₹5,000</span>
                      </label>
                      <label className={styles.filterOptionLabel}>
                        <input
                          type="radio"
                          name="price"
                          checked={priceRange === "5kto8k"}
                          onChange={() => setPriceRange("5kto8k")}
                          className={styles.filterRadio}
                        />
                        <span>₹5,000 - ₹8,000</span>
                      </label>
                      <label className={styles.filterOptionLabel}>
                        <input
                          type="radio"
                          name="price"
                          checked={priceRange === "above8k"}
                          onChange={() => setPriceRange("above8k")}
                          className={styles.filterRadio}
                        />
                        <span>Above ₹8,000</span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Vehicle Type */}
                <div className={styles.filterAccordionItem}>
                  <button
                    type="button"
                    className={styles.filterAccordionHeader}
                    onClick={() => toggleSection("vehicle")}
                  >
                    <div className={styles.filterHeaderLeft}>
                      <span>🚗</span>
                      <span>Vehicle Type</span>
                    </div>
                    {openSections.vehicle ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {openSections.vehicle && (
                    <div className={styles.filterAccordionContent}>
                      {["all", "Sedans", "SUVs", "Vintage", "Convertible"].map((veh) => (
                        <label key={veh} className={styles.filterOptionLabel}>
                          <input
                            type="radio"
                            name="vehicle"
                            checked={selectedVehicle === veh}
                            onChange={() => setSelectedVehicle(veh)}
                            className={styles.filterRadio}
                          />
                          <span>{veh === "all" ? "All Vehicle Types" : veh}</span>
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
                      <span>🌸</span>
                      <span>Flower Type</span>
                    </div>
                    {openSections.flower ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {openSections.flower && (
                    <div className={styles.filterAccordionContent}>
                      {["all", "Roses", "Orchids", "Lilies", "Jasmine"].map((flw) => (
                        <label key={flw} className={styles.filterOptionLabel}>
                          <input
                            type="radio"
                            name="flower"
                            checked={selectedFlower === flw}
                            onChange={() => setSelectedFlower(flw)}
                            className={styles.filterRadio}
                          />
                          <span>{flw === "all" ? "All Flower Varieties" : flw}</span>
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
                Car Floral Designs
              </div>

              {/* Active Filter Chips */}
              <div className={styles.activeFiltersPills}>
                {selectedVehicle !== "all" && (
                  <span className={styles.activeFilterPill}>
                    {selectedVehicle}
                    <X
                      size={12}
                      className={styles.removeFilterIcon}
                      onClick={() => setSelectedVehicle("all")}
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
                    {priceRange === "under5k"
                      ? "Under ₹5,000"
                      : priceRange === "5kto8k"
                      ? "₹5,000 - ₹8,000"
                      : "Above ₹8,000"}
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
                            `Hello Occassions Florist, I would like to book or inquire about "${item.title}" (₹${item.price}) for our wedding car.`
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
