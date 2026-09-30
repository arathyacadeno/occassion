"use client";

import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CategoryProduct } from "@/data/categoryProducts";
import styles from "./CategoryCatalog.module.css";
import { MessageCircle } from "lucide-react";

interface CategoryCatalogProps {
  title: string;
  subtitle: string;
  products: CategoryProduct[];
}

export default function CategoryCatalog({
  title,
  subtitle,
  products,
}: CategoryCatalogProps) {
  return (
    <div className={styles.pageWrapper}>
      <Header />

      <main className={styles.mainContainer}>
        {/* Centered Page Heading and Subtitle */}
        <section className={styles.headerSection}>
          <h1 className={styles.categoryTitle}>{title}</h1>
          <p className={styles.categorySubtitle}>{subtitle}</p>
        </section>

        {/* Responsive Product Cards Grid (4 per row on desktop, 2 tablet, 1 mobile) */}
        <section className={styles.productGrid} aria-label={`${title} Products`}>
          {products.map((item) => {
            const whatsappText = encodeURIComponent(
              `Hello Occassions Florist, I would like to order "${item.title}" (${item.price}) from the ${title} collection.`
            );

            return (
              <article key={item.id} className={styles.card}>
                <div className={styles.imageFrame}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className={styles.productImg}
                    loading="lazy"
                  />
                  {item.tag && <span className={styles.tagBadge}>{item.tag}</span>}
                </div>

                {/* Subtle organic contour transition matching reference mockup */}
                <div className={styles.waveContainer} aria-hidden="true">
                  <svg
                    viewBox="0 0 400 30"
                    preserveAspectRatio="none"
                    className={styles.waveSvg}
                  >
                    <path
                      d="M 0 16 Q 120 32 240 10 T 400 24 L 400 30 L 0 30 Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>

                {/* Lower Light-Gray Card Body */}
                <div className={styles.cardBody}>
                  <div className={styles.bodyTop}>
                    <h2 className={styles.itemTitle}>{item.title}</h2>
                    <p className={styles.itemDesc}>{item.description}</p>
                  </div>

                  <div className={styles.bodyFooter}>
                    <span className={styles.priceTag}>{item.price}</span>
                    <a
                      href={`https://wa.me/918606464700?text=${whatsappText}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.orderBtn}
                      aria-label={`Order ${item.title} on WhatsApp`}
                    >
                      <MessageCircle size={15} strokeWidth={2} />
                      <span>Order</span>
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </main>

      <Footer />
    </div>
  );
}
