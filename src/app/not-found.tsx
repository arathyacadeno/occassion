import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Home, ShoppingBag, Sparkles, Package, Cake, PhoneCall } from "lucide-react";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <div className={styles.pageWrapper}>
      <title>404 - Page Not Found | Occasions Florist Calicut</title>
      <meta name="description" content="Oops! The page you're looking for cannot be found. Explore fresh flowers, cakes, and gifts at Occasions Florist Calicut." />

      <Navbar />

      <main className={styles.mainContainer} role="main">
        <div className={styles.card}>


          <h1 className={styles.errorCode}>404</h1>

          <h2 className={styles.title}>
            Oops! The page you&apos;re looking for cannot be found.
          </h2>

          <div className={styles.actionsGroup}>
            <Link href="/" className={styles.primaryBtn} aria-label="Back to Home">
              <Home size={18} aria-hidden="true" />
              <span>Back to Home</span>
            </Link>

            <Link href="/flower-bouquets" className={styles.secondaryBtn} aria-label="Continue Shopping">
              <ShoppingBag size={18} aria-hidden="true" />
              <span>Continue Shopping</span>
            </Link>
          </div>

          <div className={styles.quickLinksSection}>
            <span className={styles.quickLinksLabel}>Looking for something else?</span>
            <div className={styles.quickLinksList}>
              <Link href="/flower-bouquets" className={styles.quickLink}>
                Flower Bouquets
              </Link>
              <Link href="/flower-baskets" className={styles.quickLink}>
                Flower Baskets
              </Link>
              <Link href="/cakes" className={styles.quickLink}>
                {/* <Cake size={14} aria-hidden="true" /> */}
                Cakes
              </Link>
              <Link href="/track-order" className={styles.quickLink}>
                {/* <Package size={14} aria-hidden="true" /> */}
                Track Order
              </Link>
              <Link href="/contact" className={styles.quickLink}>
                <PhoneCall size={14} aria-hidden="true" />
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
