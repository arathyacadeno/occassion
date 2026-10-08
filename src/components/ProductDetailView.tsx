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

  // Contextual Similar products logic
  const isChocolate =
    product.id.includes("chocolate") ||
    product.id.includes("dairy-milk") ||
    product.id.includes("cadbury") ||
    product.id.includes("galaxy") ||
    product.id.includes("ferrero") ||
    product.name.toLowerCase().includes("chocolate") ||
    product.name.toLowerCase().includes("dairy milk") ||
    product.name.toLowerCase().includes("silk") ||
    product.name.toLowerCase().includes("ferrero");

  const isCakeProduct =
    product.category === "cakes" ||
    product.id.includes("cake") ||
    product.name.toLowerCase().includes("cake") ||
    product.name.toLowerCase().includes("forest");

  const isSoftToy =
    product.id.includes("soft-toys") ||
    product.name.toLowerCase().includes("teddy") ||
    product.name.toLowerCase().includes("toy");

  let similarProducts: Product[] = [];

  if (isChocolate) {
    // Show strictly chocolates and confectionery (Dairy Milk Silk, Oreo, Galaxy, Fruit & Nut, Ferrero, etc.)
    // Exclude cakes so chocolate cakes don't crowd out the actual chocolates!
    similarProducts = CATALOG_PRODUCTS.filter(
      (p) =>
        p.id !== product.id &&
        p.category !== "cakes" &&
        !p.id.startsWith("cake-") &&
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
  } else if (isCakeProduct) {
    similarProducts = CATALOG_PRODUCTS.filter(
      (p) =>
        p.id !== product.id &&
        (p.category === "cakes" ||
          p.name.toLowerCase().includes("cake") ||
          p.name.toLowerCase().includes("forest"))
    );
  } else if (isSoftToy) {
    similarProducts = CATALOG_PRODUCTS.filter(
      (p) =>
        p.id !== product.id &&
        (p.id.includes("toy") ||
          p.name.toLowerCase().includes("toy") ||
          p.name.toLowerCase().includes("gift") ||
          p.category === "special-occasions")
    );
  } else {
    const categoryProducts = getProductsByCategory(product.category).filter(
      (p) => p.id !== product.id
    );
    similarProducts = categoryProducts;
  }

  // Fallback if less than 4 items (for non-chocolate products)
  if (!isChocolate && similarProducts.length < 4) {
    const fallbackProducts = CATALOG_PRODUCTS.filter(
      (p) => p.id !== product.id && !similarProducts.some((sp) => sp.id === p.id)
    );
    similarProducts = [...similarProducts, ...fallbackProducts];
  }

  similarProducts = similarProducts.slice(0, 10);

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
          {/* Sticky left column: thumbnails + main image */}
          <div className={styles.stickyGallery}>
            <ProductGallery
              images={product.images}
              productName={product.name}
              product={product}
              selectedImageOverride={selectedImageOverride}
            />
          </div>

          <ProductInfo
            product={product}
            onVariantChange={(variant) => setSelectedImageOverride(variant.image)}
            selectedAddons={selectedAddons}
          />
        </section>

        {/* Recommended Addon Products - only show when viewing flowers, cakes, or main items */}
        {(!isChocolate || isCakeProduct) && !isSoftToy && (
          <RecommendedAddons
            selectedAddons={selectedAddons}
            onAddonChange={setSelectedAddons}
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
              {isChocolate
                ? "Similar Chocolates & Treats"
                : isCakeProduct
                ? "Similar Celebration Cakes"
                : "Similar Product"}
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
