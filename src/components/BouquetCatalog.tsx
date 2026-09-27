"use client";

import React, { useState } from "react";
import styles from "./BouquetCatalog.module.css";
import { BOUQUETS_DATA } from "@/data/bouquets";
import { Bouquet } from "@/types";
import { Star, ShoppingBag, Eye } from "lucide-react";

interface BouquetCatalogProps {
  onAddToCart: (bouquet: Bouquet) => void;
  onQuickView: (bouquet: Bouquet) => void;
}

export default function BouquetCatalog({ onAddToCart, onQuickView }: BouquetCatalogProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "All Flowers & Decor" },
    { id: "wedding", label: "Bridal Bouquets & Car Decor" },
    { id: "celebration", label: "Bouquet & Cake Delivery" },
    { id: "curated", label: "Exotic Orchids & Assorted" },
    { id: "sympathy", label: "Grace & Solace" },
  ];

  const filteredBouquets =
    activeCategory === "all"
      ? BOUQUETS_DATA
      : BOUQUETS_DATA.filter((b) => b.occasion === activeCategory);

  return (
    <section className={styles.sectionWrapper} id="collections">
      <div className="container">
        {/* Header Title */}
        <div className={styles.headerArea}>
          <div className={styles.sectionTagline}>Do it with flowers</div>
          <h2 className={styles.sectionTitle}>Occassions Signature Collection</h2>
          <p className={styles.sectionDesc}>
            From fairy-tale bridal bouquets to grand stage floral backdrops and online cake delivery across Calicut — curated with fresh daily blooms by Sreejesh K.V.
          </p>
        </div>

        {/* Filter Category Tabs */}
        <div className={styles.filterTabs}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`${styles.filterBtn} ${
                activeCategory === cat.id ? styles.filterBtnActive : ""
              }`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Bouquet Cards Grid */}
        <div className={styles.bouquetGrid}>
          {filteredBouquets.map((bouquet) => (
            <article key={bouquet.id} className={styles.card}>
              <div className={styles.imageContainer}>
                {bouquet.badge && (
                  <div className={styles.badge}>{bouquet.badge}</div>
                )}

                <img
                  src={bouquet.image}
                  alt={bouquet.name}
                  className={styles.cardImage}
                  loading="lazy"
                />

                <div className={styles.hoverActions}>
                  <button
                    className={styles.quickActionBtn}
                    onClick={() => onQuickView(bouquet)}
                    aria-label={`Quick view ${bouquet.name}`}
                  >
                    <Eye size={15} />
                    Quick View
                  </button>
                </div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.ratingRow}>
                  <Star size={13} className={styles.starFilled} />
                  <span>{bouquet.rating.toFixed(1)}</span>
                  <span>({bouquet.reviewsCount} reviews)</span>
                  <span>•</span>
                  <span>Calicut Delivery</span>
                </div>

                <h3 className={styles.cardTitle}>{bouquet.name}</h3>
                <div className={styles.cardSubtitle}>{bouquet.subtitle}</div>

                <div className={styles.stemTags}>
                  {bouquet.stems.slice(0, 3).map((stem, sIdx) => (
                    <span key={sIdx} className={styles.stemTag}>
                      {stem}
                    </span>
                  ))}
                  {bouquet.stems.length > 3 && (
                    <span className={styles.stemTag}>
                      +{bouquet.stems.length - 3} more
                    </span>
                  )}
                </div>

                <div className={styles.cardFooter}>
                  <div className={styles.priceWrapper}>
                    <span className={styles.price}>₹{bouquet.price.toLocaleString("en-IN")}</span>
                    {bouquet.originalPrice && (
                      <span className={styles.originalPrice}>
                        ₹{bouquet.originalPrice.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <a
                      href={`https://wa.me/918606464700?text=Hello%20Occassions%2C%20I%20would%20like%20to%20order%20${encodeURIComponent(bouquet.name)}%20(Rs%20${bouquet.price})`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: "#1e6b37",
                        color: "#fff",
                        padding: "10px 12px",
                        fontSize: "0.68rem",
                        fontWeight: 600,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 4
                      }}
                      aria-label="Order on WhatsApp"
                    >
                      WhatsApp
                    </a>

                    <button
                      className={styles.addToCartBtn}
                      onClick={() => onAddToCart(bouquet)}
                      aria-label={`Add ${bouquet.name} to cart`}
                    >
                      <ShoppingBag size={14} />
                      Cart
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
