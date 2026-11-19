import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import categoryStyles from "@/components/CategoryPage.module.css";
import styles from "./loading.module.css";

export default function LoadingFlowerCategory() {
  return (
    <div className={categoryStyles.pageWrapper}>
      <Navbar />
      <main className={categoryStyles.mainContent}>
        {/* Skeleton Heading */}
        <header className={categoryStyles.pageHeader}>
          <div className={styles.titleSkeleton} />
          <div className={styles.descSkeleton} />
        </header>

        {/* Skeleton Pink Panel */}
        <section className={categoryStyles.categoryPanel}>
          <div className={styles.tabsSkeletonRow}>
            <div className={styles.pillSkeleton} />
            <div className={styles.pillSkeleton} />
            <div className={styles.pillSkeleton} />
          </div>

          <div className={categoryStyles.gridContainer}>
            <div className={categoryStyles.productGrid}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className={styles.cardSkeleton}>
                  <div className={styles.imageSkeleton} />
                  <div className={styles.bodySkeleton}>
                    <div className={styles.textLineShort} />
                    <div className={styles.textLineLong} />
                    <div className={styles.priceSkeleton} />
                    <div className={styles.btnSkeleton} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
