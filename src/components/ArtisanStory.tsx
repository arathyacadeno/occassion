"use client";

import React from "react";
import styles from "./ArtisanStory.module.css";
import { Sun, Heart, Sparkles, Truck } from "lucide-react";

export default function ArtisanStory() {
  return (
    <section className={styles.sectionWrapper} id="atelier-story">
      <div className="container">
        <div className={styles.grid}>
          {/* Image Side */}
          <div className={styles.imageSide}>
            <div className={styles.mainImageFrame}>
              <img
                src="/images/story-bg.jpg"
                alt="Florist artisan handcrafting bouquet"
                className={styles.mainImage}
                loading="lazy"
              />
            </div>
            <div className={styles.floatingCard}>
              <div className={styles.floatingCardScript}>Every Stem Tells a Story</div>
              <p className={styles.floatingCardText}>
                Hand-conditioned with botanical floral water and hand-tied using sustainable vintage looms.
              </p>
            </div>
          </div>

          {/* Content Side */}
          <div className={styles.contentSide}>
            <div className={styles.tagline}>The Atelier Philosophy</div>
            <h2 className={styles.title}>The Art of Floristry</h2>

            <p className={styles.leadParagraph}>
              “Flowers are the sweetest things God ever made, and forgot to put a soul into.”
            </p>

            <p className={styles.bodyParagraph}>
              Founded on the reverence of ephemeral natural beauty, Occasions Florist honors the heritage of European botanical artistry. Every morning before dawn, our floral curators select rare, peak-bloom cultivars from family-owned organic fields in Holland, France, and Ecuador.
            </p>

            <div className={styles.featuresGrid}>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <Sun size={20} />
                </div>
                <div>
                  <h4 className={styles.featureTitle}>Sunrise Harvest</h4>
                  <p className={styles.featureText}>
                    Cut and delivered within 24 hours for exceptional 10+ day vase life.
                  </p>
                </div>
              </div>

              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <Heart size={20} />
                </div>
                <div>
                  <h4 className={styles.featureTitle}>Hand-Tied Couture</h4>
                  <p className={styles.featureText}>
                    Arranged stem-by-stem with spiraled mechanics and French ribbons.
                  </p>
                </div>
              </div>

              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4 className={styles.featureTitle}>Wax-Sealed Notes</h4>
                  <p className={styles.featureText}>
                    Your custom sentiments calligraphed on handmade deckle-edge paper.
                  </p>
                </div>
              </div>

              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <Truck size={20} />
                </div>
                <div>
                  <h4 className={styles.featureTitle}>White-Glove Delivery</h4>
                  <p className={styles.featureText}>
                    Temperature-controlled hand courier directly to your doorstep.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <a href="#collections" className="btn-rosebud">
                Discover The Collections
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
