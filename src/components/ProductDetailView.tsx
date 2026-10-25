"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import ProductGallery from "@/components/ProductGallery";
import ProductInfo from "@/components/ProductInfo";
import RecommendedAddons from "@/components/RecommendedAddons";
import {
  Product,
  getProductsByCategory,
  getFlowerBaskets,
  getFlowerBouquets,
  getTableDecorProducts,
  getWreathProducts,
  CATALOG_PRODUCTS,
} from "@/data/catalog";
import ProductCard from "@/components/ProductCard";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./ProductDetailView.module.css";

interface ProductDetailViewProps {
  product: Product;
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const similarScrollRef = useRef<HTMLDivElement>(null);
  const [selectedImageOverride, setSelectedImageOverride] = React.useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = React.useState<Record<string, number>>({});

  const scrollSimilar = (direction: "left" | "right") => {
    if (similarScrollRef.current) {
      const scrollAmount = direction === "left" ? -460 : 460;
      similarScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Contextual Similar products logic - strictly category-isolated
  const isCakeProduct =
    product.category === "cakes" || product.id.startsWith("cake-");

  const isWreath =
    product.category === "wreaths" ||
    product.id.startsWith("wreath-") ||
    product.slug?.includes("wreath") ||
    product.name.toLowerCase().includes("wreath");

  const isTableDecor =
    product.category === "table-decor" ||
    product.id.startsWith("table-decor-") ||
    product.slug?.includes("table-decor") ||
    product.name.toLowerCase().includes("table decor") ||
    product.name.toLowerCase().includes("centerpiece");

  const isFlowerBasket =
    product.category === "flower" &&
    (product.basketType !== undefined ||
      product.id.startsWith("flower-basket-") ||
      product.id === "flower-9" ||
      product.id === "flower-10" ||
      product.slug?.toLowerCase().includes("basket") ||
      product.name?.toLowerCase().includes("basket") ||
      product.slug?.toLowerCase().includes("container") ||
      product.name?.toLowerCase().includes("container"));

  const isFlowerBouquet =
    product.category === "flower" && !isFlowerBasket;

  const isChocolate =
    product.category === "special-occasions" &&
    (product.id.includes("chocolate") ||
      product.id.includes("dairy-milk") ||
      product.id.includes("cadbury") ||
      product.id.includes("galaxy") ||
      product.id.includes("ferrero") ||
      product.name.toLowerCase().includes("chocolate") ||
      product.name.toLowerCase().includes("dairy milk") ||
      product.name.toLowerCase().includes("silk") ||
      product.name.toLowerCase().includes("ferrero"));

  const isSoftToy =
    product.category === "special-occasions" &&
    (product.id.includes("soft-toys") ||
      product.name.toLowerCase().includes("teddy") ||
      product.name.toLowerCase().includes("toy"));

  let similarProducts: Product[] = [];

  if (isFlowerBouquet) {
    // Strictly show ONLY flower bouquets
    similarProducts = getFlowerBouquets().filter((p) => p.id !== product.id);
  } else if (isFlowerBasket) {
    // Strictly show ONLY flower baskets
    similarProducts = getFlowerBaskets().filter((p) => p.id !== product.id);
  } else if (isCakeProduct) {
    // Strictly show ONLY cakes
    similarProducts = CATALOG_PRODUCTS.filter(
      (p) => p.id !== product.id && p.category === "cakes"
    );
  } else if (isWreath) {
    // Strictly show ONLY wreaths
    similarProducts = getWreathProducts().filter((p) => p.id !== product.id);
  } else if (isTableDecor) {
    // Strictly show ONLY table decor
    similarProducts = getTableDecorProducts().filter((p) => p.id !== product.id);
  } else if (isChocolate) {
    similarProducts = CATALOG_PRODUCTS.filter(
      (p) =>
        p.id !== product.id &&
        p.category === "special-occasions" &&
        (p.id.includes("chocolate") ||
          p.id.includes("dairy-milk") ||
          p.id.includes("cadbury") ||
          p.id.includes("galaxy") ||
          p.id.includes("ferrero") ||
          p.id.includes("silk") ||
          p.name.toLowerCase().includes("dairy milk") ||
          p.name.toLowerCase().includes("silk") ||
          p.name.toLowerCase().includes("galaxy") ||
          p.name.toLowerCase().includes("ferrero") ||
          p.name.toLowerCase().includes("chocolate"))
    );
  } else if (isSoftToy) {
    similarProducts = CATALOG_PRODUCTS.filter(
      (p) =>
        p.id !== product.id &&
        p.category === "special-occasions" &&
        (p.id.includes("toy") ||
          p.name.toLowerCase().includes("teddy") ||
          p.name.toLowerCase().includes("toy") ||
          p.name.toLowerCase().includes("gift"))
    );
  } else {
    similarProducts = getProductsByCategory(product.category as any).filter(
      (p) => p.id !== product.id
    );
  }

  // Strictly keep similar products within their own category
  similarProducts = similarProducts.slice(0, 10);

  const categoryLabel =
    product.category === "cakes"
      ? "Cakes"
      : product.category === "table-decor"
      ? "Table Decor"
      : product.category === "wreaths"
      ? "Wreaths"
      : product.category === "special-occasions"
      ? "Special Occasions"
      : product.category === "our-highlights"
      ? "Our Highlights"
      : "Flowers";

  const categoryHref =
    product.category === "cakes"
      ? "/cakes"
      : product.category === "table-decor"
      ? "/table-decor"
      : product.category === "wreaths"
      ? "/wreaths"
      : product.category === "special-occasions"
      ? "/special-occasions"
      : product.category === "our-highlights"
      ? "/#highlights"
      : product.slug?.includes("basket") || product.name?.toLowerCase().includes("basket")
      ? "/flower-baskets"
      : "/flower-bouquets";

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <main className={styles.mainContainer}>
        {/* Breadcrumb Navigation: Home > Flowers > Product Name */}
        <Breadcrumb
          items={[
            { label: categoryLabel, href: categoryHref },
            { label: product.name },
          ]}
        />

        {/* Main 2-column Product Detail Layout */}
        <section className={styles.productLayout}>
          {/* Sticky left column: thumbnails + main image */}
          <div className={styles.stickyGallery}>
            <ProductGallery
              images={
                product.images && product.images.length > 0
                  ? product.images
                  : product.image
                  ? [product.image]
                  : []
              }
              productName={product.name}
              product={product}
              selectedImageOverride={selectedImageOverride}
            />
          </div>

          <ProductInfo
            product={product}
            onVariantChange={(variant) => setSelectedImageOverride(variant.image)}
            selectedAddons={selectedAddons}
            onAddonChange={setSelectedAddons}
          />
        </section>

        {/* Recommended Addon Products - only show when viewing flowers, cakes, or main items (never for wreaths, chocolates, or soft toys) */}
        {(!isChocolate || isCakeProduct) && !isSoftToy && !isWreath && (
          <RecommendedAddons
            selectedAddons={selectedAddons}
            onAddonChange={setSelectedAddons}
            mainCategory={product.category}
          />
        )}

        {/* ================= RATINGS AND REVIEWS SECTION ================= */}
        <section className={styles.reviewsSection} aria-label="Ratings and Reviews">
          <h2 className={styles.sectionHeading}>Ratings and Reviews</h2>

          {/* Large Pink Card Container matching design */}
          <div className={styles.reviewsContainer}>
            {/* Rating Summary Row */}
            <div className={styles.ratingSummaryRow}>
              <div className={styles.starsGroup}>
                {[...Array(4)].map((_, i) => (
                  <Star key={i} size={18} className={styles.starFilledGreen} />
                ))}
                <Star size={18} className={styles.starHalfGreen} />
              </div>
              <span className={styles.ratingTagline}>Beautiful &amp; Elegant Gift</span>
            </div>

            {/* Featured Review Card */}
            <div className={styles.reviewItemCard}>
              <img
                src={product.image || "/images/basket-yellow-roses.jpg"}
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
                  Anniversary . Oct 3 . Calicut
                </div>
              </div>
            </div>

            <hr className={styles.sectionDivider} />
          </div>
        </section>

        {/* ================= SIMILAR PRODUCT SECTION ================= */}
        <section
          id="similar-products"
          className={styles.similarSection}
          aria-label="Similar Products"
        >
          <div className={styles.similarHeaderRow}>
            <h2 className={styles.sectionHeading}>
              {isFlowerBouquet
                ? "Similar Flower Bouquets"
                : isFlowerBasket
                ? "Similar Flower Basket"
                : isCakeProduct
                ? "Similar Cakes"
                : isWreath
                ? "Similar Wreath"
                : isTableDecor
                ? "Similar Table Decor"
                : isChocolate
                ? "Similar Chocolates & Treats"
                : isSoftToy
                ? "Similar Soft Toys & Gifts"
                : "Similar Products"}
            </h2>
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

          <div className={styles.similarContainer}>
            <div ref={similarScrollRef} className={styles.similarScrollRow}>
              {similarProducts.map((p) => (
                <ProductCard key={p.id} product={p} compact />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
