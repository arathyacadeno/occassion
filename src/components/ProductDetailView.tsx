"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import ProductGallery from "@/components/ProductGallery";
import ProductInfo from "@/components/ProductInfo";
import RecommendedAddons from "@/components/RecommendedAddons";
import { Product, getProductsByCategory, CATALOG_PRODUCTS } from "@/data/catalog";
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

  // Similar products (up to 6 items matching reference design)
  const categoryProducts = getProductsByCategory(product.category).filter(
    (p) => p.id !== product.id
  );
  const fallbackProducts = CATALOG_PRODUCTS.filter((p) => p.id !== product.id);
  const similarProducts = (
    categoryProducts.length >= 6
      ? categoryProducts
      : [...categoryProducts, ...fallbackProducts]
  ).slice(0, 6);

  const categoryLabel =
    product.category === "cakes"
      ? "Cakes"
      : product.category === "special-occasions"
      ? "Special Occasions"
      : product.category === "our-highlights"
      ? "Our Highlights"
      : "Flowers";

  const categoryHref =
    product.category === "cakes"
      ? "/cakes"
      : product.category === "special-occasions"
      ? "/special-occasions"
      : product.category === "our-highlights"
      ? "/our-highlights"
      : "/flower";

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
          <ProductGallery
            images={product.images}
            productName={product.name}
            product={product}
            selectedImageOverride={selectedImageOverride}
          />

          <ProductInfo
            product={product}
            onVariantChange={(variant) => setSelectedImageOverride(variant.image)}
            selectedAddons={selectedAddons}
          />
        </section>

        {/* Recommended Addon Products */}
        <RecommendedAddons
          selectedAddons={selectedAddons}
          onAddonChange={setSelectedAddons}
        />

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
            {similarProducts.map((p) => (
              <ProductCard key={p.id} product={p} compact />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
