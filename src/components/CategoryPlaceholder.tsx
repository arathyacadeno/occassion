"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, ArrowLeft, ArrowRight, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import styles from "./CategoryPlaceholder.module.css";

export interface CategoryPhotoItem {
  id: string;
  title: string;
  image: string;
  price: string;
  tag?: string;
  description: string;
}

interface CategoryPlaceholderProps {
  title: string;
  description: string;
  photos: CategoryPhotoItem[];
}

export default function CategoryPlaceholder({
  title,
  description,
  photos,
}: CategoryPlaceholderProps) {
  return (
    <div className={styles.pageWrapper}>
      <Header />

      <main className={styles.mainContent}>
        {/* Breadcrumb Navigation */}
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <Link href="/" className={styles.breadcrumbLink}>
            Home
          </Link>
          <ChevronRight size={14} />
          <Link href="/#categories" className={styles.breadcrumbLink}>
            Categories
          </Link>
          <ChevronRight size={14} />
          <span className={styles.breadcrumbCurrent}>{title}</span>
        </nav>

        {/* Hero Showcase Header Card */}
        <section className={styles.heroCard}>
          <h1 className={styles.categoryTitle}>{title}</h1>

          <p className={styles.categoryDescription}>{description}</p>

          <div className={styles.actionsRow}>
            <Link href="/#categories" className={styles.primaryBtn}>
              <ArrowLeft size={16} />
              <span>Back to Categories</span>
            </Link>
            <Link href="/" className={styles.secondaryBtn}>
              <span>Return to Home</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* Photo Gallery Grid */}
        {photos && photos.length > 0 && (
          <section className={styles.gallerySection} aria-label={`${title} arrangements`}>
            <div className={styles.galleryHeaderRow}>
              <h2 className={styles.galleryHeading}>Curated {title} Designs</h2>
              <span className={styles.galleryCount}>{photos.length} designs available</span>
            </div>

            <div className={styles.photoGrid}>
              {photos.map((item) => (
                <article key={item.id} className={styles.photoCard}>
                  <div className={styles.imageWrapper}>
                    <img
                      src={item.image}
                      alt={item.title}
                      className={styles.photoImg}
                      loading="lazy"
                    />
                    {item.tag && <span className={styles.photoTag}>{item.tag}</span>}
                  </div>

                  <div className={styles.photoInfo}>
                    <h3 className={styles.photoTitle}>{item.title}</h3>
                    <p className={styles.photoDesc}>{item.description}</p>

                    <div className={styles.cardFooterRow}>
                      <span className={styles.photoPrice}>{item.price}</span>
                      <a
                        href={`https://wa.me/918606464700?text=${encodeURIComponent(
                          `Hello Occassions Florist Calicut, I would like to order/inquire about "${item.title}" (${item.price}) from the ${title} collection.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.inquireBtn}
                        aria-label={`Order ${item.title} on WhatsApp`}
                      >
                        <MessageCircle size={14} />
                        <span>Order</span>
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
