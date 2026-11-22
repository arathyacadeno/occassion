"use client";

import React, { useState, useEffect } from "react";
import styles from "./Testimonials.module.css";
import { Star, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import type { GoogleReview, GoogleReviewsApiResponse } from "@/app/api/google-reviews/route";

const GOOGLE_REVIEW_URL =
  "https://www.google.com/search?q=occasions+calicut#lrd=0x3ba65930d81cc1ef:0xc1726494649efc9d,1";

function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.27 21.43 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.27 2.57 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export default function Testimonials() {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<GoogleReviewsApiResponse | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;

    async function loadGoogleReviews() {
      try {
        setLoading(true);
        const res = await fetch("/api/google-reviews", {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`);
        }
        const json: GoogleReviewsApiResponse = await res.json();
        if (isMounted) {
          setData(json);
        }
      } catch (err) {
        console.warn("Failed to load Google reviews:", err);
        if (isMounted) {
          setData({
            success: false,
            available: false,
            businessName: "Occasions Calicut",
            placeId: "ChIJ78EY0zBZozsRz85plGQpYsE",
            rating: null,
            userRatingsTotal: null,
            googleReviewUrl: GOOGLE_REVIEW_URL,
            reviews: [],
            error: "Google reviews are temporarily unavailable.",
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadGoogleReviews();

    return () => {
      isMounted = false;
    };
  }, []);

  const reviews = data?.reviews || [];
  const hasReviews = reviews.length > 0;
  const reviewUrl = data?.googleReviewUrl || GOOGLE_REVIEW_URL;

  const handlePrev = () => {
    if (reviews.length === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (reviews.length === 0) return;
    setCurrentIndex((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
  };

  const renderStars = (rating: number) => (
    <div className={styles.starsRow} aria-label={`${rating} out of 5 stars`}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={16}
          className={i < rating ? styles.starFilled : styles.starEmpty}
        />
      ))}
    </div>
  );

  return (
    <section className={styles.sectionWrapper} id="testimonials" aria-label="Google Customer Reviews">
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <div className={styles.googleBadgeRow}>
            <GoogleIcon size={22} />
            <span className={styles.googleBadgeText}>Google Reviews</span>
            {data?.rating !== null && data?.rating !== undefined && (
              <span className={styles.ratingBadge}>
                ★ {data.rating.toFixed(1)}
                {data.userRatingsTotal ? ` (${data.userRatingsTotal}+)` : ""}
              </span>
            )}
          </div>

          <h2 className={styles.mainTitle}>Loved in Every Bloom</h2>
          <p className={styles.subtitle}>
            Genuine reviews and experiences from Occasions Calicut customers.
          </p>
        </div>

        {/* Reviews Container Card */}
        <div className={styles.whiteCardWrapper}>
          {loading ? (
            /* Loading State */
            <div className={styles.loadingContainer}>
              <div className={styles.spinner} />
              <p className={styles.loadingText}>Loading genuine Google reviews...</p>
            </div>
          ) : hasReviews ? (
            /* Genuine Reviews Display */
            <div className={styles.reviewsDisplay}>
              {/* Carousel Controls */}
              {reviews.length > 1 && (
                <div className={styles.controlsBar}>
                  <button
                    type="button"
                    onClick={handlePrev}
                    className={styles.navBtn}
                    aria-label="Previous review"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className={styles.counterText}>
                    {currentIndex + 1} of {reviews.length}
                  </span>
                  <button
                    type="button"
                    onClick={handleNext}
                    className={styles.navBtn}
                    aria-label="Next review"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}

              {/* Active Review Card */}
              <div className={styles.singleReviewCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.authorMeta}>
                    {reviews[currentIndex].profile_photo_url ? (
                      <img
                        src={reviews[currentIndex].profile_photo_url}
                        alt={reviews[currentIndex].author_name}
                        className={styles.authorPhoto}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className={styles.authorAvatar}>
                        {reviews[currentIndex].author_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className={styles.authorName}>
                        {reviews[currentIndex].author_name}
                      </h3>
                      <span className={styles.reviewTime}>
                        {reviews[currentIndex].relative_time_description}
                      </span>
                    </div>
                  </div>

                  <div className={styles.reviewCardRating}>
                    {renderStars(reviews[currentIndex].rating)}
                    <span className={styles.verifiedTag}>
                      <GoogleIcon size={14} />
                      Verified
                    </span>
                  </div>
                </div>

                {/* Original Review Text */}
                <p className={styles.reviewText}>
                  &ldquo;{reviews[currentIndex].text}&rdquo;
                </p>
              </div>

              {/* Grid / Dots indicator if multiple reviews */}
              {reviews.length > 1 && (
                <div className={styles.dotsRow}>
                  {reviews.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`${styles.dot} ${idx === currentIndex ? styles.activeDot : ""}`}
                      aria-label={`Go to review ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Clean Unavailable State (NO FAKE DATA) */
            <div className={styles.unavailableContainer}>
              <div className={styles.unavailableIconCircle}>
                <GoogleIcon size={32} />
              </div>
              <h3 className={styles.unavailableTitle}>
                Google reviews are temporarily unavailable.
              </h3>
              <p className={styles.unavailableSubtitle}>
                Read genuine customer ratings and reviews directly on our verified Google Business Profile.
              </p>
            </div>
          )}

          {/* Authoritative "View All Reviews on Google" Button */}
          <div className={styles.actionRow}>
            <a
              href={reviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.viewGoogleBtn}
              aria-label="View All Reviews on Google (opens in a new tab)"
            >
              <GoogleIcon size={18} />
              <span>View All Reviews on Google</span>
              <ExternalLink size={15} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
