"use client";

import React, { useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSearchRoute } from "@/lib/searchRoutes";
import { Search, ArrowLeft, Flower2 } from "lucide-react";
import styles from "./search.module.css";

function SearchResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawQ = searchParams.get("q") || searchParams.get("query") || searchParams.get("search") || "";
  const query = rawQ.trim();

  // If query matches a known search route upon landing on /search, immediately redirect
  useEffect(() => {
    if (query) {
      const match = getSearchRoute(query);
      if (match) {
        router.replace(match);
      }
    }
  }, [query, router]);

  const displayQuery = query || "what you are looking for";

  return (
    <div className={styles.contentCard}>
      {/* Search Icon Circle */}
      <div className={styles.iconCircle} aria-hidden="true">
        <Search size={36} strokeWidth={1.8} className={styles.searchIconSvg} />
      </div>

      <h1 className={styles.title}>
        Sorry, we couldn&apos;t find &ldquo;<span className={styles.queryHighlight}>{displayQuery}</span>&rdquo;
      </h1>

      <p className={styles.description}>
        We&apos;ll be coming soon with more flowers! In the meantime, explore our fresh daily arrangements and popular collections.
      </p>

      {/* Action Buttons */}
      <div className={styles.actionRow}>
        <Link href="/" className={styles.primaryHomeBtn}>
          <ArrowLeft size={16} strokeWidth={2.2} />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Suggested Categories */}
      <div className={styles.popularSection}>
        <h2 className={styles.popularHeading}>Or explore our popular collections</h2>
        <div className={styles.categoryPills}>
          <Link href="/flowers/roses" className={styles.pillLink}>
           Fresh Roses
          </Link>
          <Link href="/flowers/lilies" className={styles.pillLink}>
            Asiatic &amp; Oriental Lilies
          </Link>
          <Link href="/flower-bouquets" className={styles.pillLink}>
            Flower Bouquets
          </Link>
          <Link href="/flower-baskets" className={styles.pillLink}>
           Flowers in Basket
          </Link>
          <Link href="/cakes" className={styles.pillLink}>
            Birthday &amp; Celebration Cakes
          </Link>
          <Link href="/table-decor" className={styles.pillLink}>
            Table Decor
          </Link>
          <Link href="/wreaths" className={styles.pillLink}>
            Wreaths
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className={styles.pageWrapper}>
      <Header />
      <main className={styles.mainContainer}>
        <Suspense
          fallback={
            <div className={styles.loadingWrapper}>
              <div className={styles.loadingSpinner} />
              <p>Searching collections...</p>
            </div>
          }
        >
          <SearchResultContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
