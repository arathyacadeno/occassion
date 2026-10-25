"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Star,
  Heart,
  Leaf,
  Sparkles,
  Cake,
  Smartphone,
  Package,
  Truck,
  Check,
} from "lucide-react";
import styles from "./about.module.css";

export default function AboutClient() {
  const [activeTab, setActiveTab] = useState<"mission" | "vision">("mission");

  const whyChooseFeatures = [
    {
      icon: Leaf,
      title: "Fresh and Beautiful Flowers",
      desc: "Sourced with care and arranged to last.",
    },
    {
      icon: Sparkles,
      title: "Unique Bouquet Designs",
      desc: "Original styles you won't find elsewhere.",
    },
    {
      icon: Cake,
      title: "Delicious Cakes",
      desc: "Sweet treats to make every celebration extra special.",
    },
    {
      icon: Smartphone,
      title: "Easy Online Ordering",
      desc: "Pick, personalize, and pay in a few taps.",
    },
    {
      icon: Package,
      title: "Careful Packaging",
      desc: "Blooms arrive protected, fresh, and gift-ready.",
    },
    {
      icon: Truck,
      title: "Convenient Delivery",
      desc: "Choose the day and we'll bring it to the door.",
    },
  ];

  return (
    <div className={styles.aboutPage}>
      {/* Existing Shared Navbar */}
      <Navbar />

      <main className={styles.mainContent}>
        {/* ================= SECTION 1: HERO BANNER ================= */}
        <section className={styles.heroBanner} aria-label="About Us Hero">
          <div className={styles.heroOverlay} />
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>About Us</h1>
          </div>
        </section>

        {/* ================= SECTION 2: OUR STORY ================= */}
        <section className={styles.storySection} aria-label="Our Story">
          <div className={styles.storyContainer}>
            {/* Left Column: Overlapping Images + Rating Card */}
            <div className={styles.storyImagesWrapper}>
              <div className={styles.storyMainImageCard}>
                <img
                  src="/images/about/story-workshop.jpg"
                  alt="Occasions pastry chefs decorating celebration cakes"
                  className={styles.storyMainImg}
                  loading="lazy"
                />
              </div>

              {/* Floating Rating Badge Card */}
              <div className={styles.ratingFloatingCard} aria-label="Rating 4.9 out of 5 stars">
                <div className={styles.ratingContentWrap}>
                  <div className={styles.ratingStarsRow}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className={styles.starIcon} />
                    ))}
                  </div>
                  <span className={styles.ratingValueText}>4.9/5</span>
                </div>
              </div>

              <div className={styles.storySubImageCard}>
                <img
                  src="/images/about/story-florists.jpg"
                  alt="Occasions florists arranging fresh bouquets"
                  className={styles.storySubImg}
                  loading="lazy"
                />
              </div>
            </div>

            {/* Right Column: Story Copy */}
            <div className={styles.storyTextColumn}>
              <span className={styles.sectionBadgeLabel}>Our Story</span>
              <h2 className={styles.storyHeading}>
                <span className={styles.headingLineOne}>
                  &ldquo;Bringing Happiness, One Bloom &amp; Bite
                </span>
                <br className={styles.headingBr} />
                at a Time&rdquo;
              </h2>
              <p className={styles.storyParagraph}>
                At Occasions, we believe life&apos;s most beautiful moments deserve
                something special. From fresh flower bouquets to delicious cakes,
                we bring together thoughtful gifts that express love, celebrate
                milestones, and create lasting memories. Whether it&apos;s a
                birthday, anniversary, wedding, or a simple surprise, we&apos;re
                here to make every occasion unforgettable.
              </p>
              <blockquote className={styles.storyItalicQuote}>
                &ldquo;Every bloom has a feeling. Every occasion has a story.&rdquo;
              </blockquote>

              <div className={styles.storyFeaturesGrid}>
                {/* Made with Love */}
                <div className={styles.storyFeatureCard}>
                  <div className={styles.featureIconWrapper}>
                    <Heart size={18} className={styles.featureIconHeart} />
                  </div>
                  <div className={styles.featureTextWrap}>
                    <h3 className={styles.featureTitle}>Made with Love</h3>
                    <p className={styles.featureDesc}>
                      Beautiful flowers and delicious cakes, made with care..
                    </p>
                  </div>
                </div>

                {/* Sustainably Sourced */}
                <div className={styles.storyFeatureCard}>
                  <div className={styles.featureIconWrapper}>
                    <svg
                      width="20"
                      height="18"
                      viewBox="0 0 24 21"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M12.75 3.00353C9.06563 3.00353 5.94844 5.41759 4.88906 8.74572C6.46406 7.94884 8.24063 7.50353 10.125 7.50353H14.25C14.6625 7.50353 15 7.84103 15 8.25353C15 8.66603 14.6625 9.00353 14.25 9.00353H13.5H10.125C9.34688 9.00353 8.59219 9.09259 7.86563 9.25665C6.65156 9.53322 5.52187 10.0254 4.51875 10.6957C1.79531 12.5098 0 15.6082 0 19.1285V19.8785C0 20.502 0.501562 21.0035 1.125 21.0035C1.74844 21.0035 2.25 20.502 2.25 19.8785V19.1285C2.25 16.8457 3.22031 14.7926 4.77188 13.3535C5.7 16.8926 8.92031 19.5035 12.75 19.5035H12.7969C18.9891 19.4707 24 13.3676 24 5.84415C24 3.84728 23.6484 1.94884 23.0109 0.237904C22.8891 -0.0855338 22.4156 -0.0714712 22.2516 0.233216C21.3703 1.88322 19.6266 3.00353 17.625 3.00353H12.75Z"
                        fill="#087A19"
                      />
                    </svg>
                  </div>
                  <div className={styles.featureTextWrap}>
                    <h3 className={styles.featureTitle}>Sustainably Sourced</h3>
                    <p className={styles.featureDesc}>
                      Partnering with local flower farms for a greener future
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SECTION 3: WHY CHOOSE OCCASIONS? ================= */}
        <section className={styles.whyChooseSection} aria-label="Why Choose Occasions">
          <div className={styles.whyChooseContainer}>
            <h2 className={styles.whyChooseHeading}>Why Choose Occasions?</h2>

            <div className={styles.whyGrid}>
              {whyChooseFeatures.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div key={idx} className={styles.whyItem}>
                    <div className={styles.whyIconCircle}>
                      <IconComponent size={22} strokeWidth={1.8} />
                    </div>
                    <div className={styles.whyTextWrap}>
                      <h3 className={styles.whyTitle}>{item.title}</h3>
                      <p className={styles.whyDesc}>{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= SECTION 4: MISSION & VISION ================= */}
        <section className={styles.missionSection} aria-label="Our Mission and Vision">
          <div className={styles.missionContainer}>
            {/* Left Column: Heading + Tabs + Content */}
            <div className={styles.missionLeftCol}>
              <h2 className={styles.missionHeading}>
                Making Every Moment More Meaningful.
              </h2>

              {/* Tab Controls */}
              <div className={styles.tabsRow} role="tablist" aria-label="Mission and Vision Tabs">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "mission"}
                  onClick={() => setActiveTab("mission")}
                  className={`${styles.tabBtn} ${
                    activeTab === "mission" ? styles.tabBtnActive : ""
                  }`}
                >
                  Our Mission
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "vision"}
                  onClick={() => setActiveTab("vision")}
                  className={`${styles.tabBtn} ${
                    activeTab === "vision" ? styles.tabBtnActive : ""
                  }`}
                >
                  Our Vision
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === "mission" ? (
                <div key="mission" className={styles.tabContent}>
                  <p className={styles.missionQuote}>
                    &ldquo;To bloom where love is planted and provide the most exquisite floral experiences.&rdquo;
                  </p>
                  <p className={styles.missionParagraph}>
                    Our mission is to empower people to express their deepest feelings
                    through the timeless beauty of nature. We strive to provide exceptional
                    quality, unparalleled creativity, and a service that makes gifting as
                    joyful as receiving.
                  </p>
                  <div className={styles.checkList}>
                    <div className={styles.checkItem}>
                      <span className={styles.checkIconCircle}>
                        <Check size={14} strokeWidth={2.8} />
                      </span>
                      <span>Excellence in every petal</span>
                    </div>
                    <div className={styles.checkItem}>
                      <span className={styles.checkIconCircle}>
                        <Check size={14} strokeWidth={2.8} />
                      </span>
                      <span>Ethical and sustainable floral sourcing</span>
                    </div>
                    <div className={styles.checkItem}>
                      <span className={styles.checkIconCircle}>
                        <Check size={14} strokeWidth={2.8} />
                      </span>
                      <span>Customer-centric celebration approach</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div key="vision" className={styles.tabContent}>
                  <p className={styles.missionQuote}>
                    &ldquo;To be the most cherished destination for heartfelt celebrations, blooming across every memory.&rdquo;
                  </p>
                  <p className={styles.missionParagraph}>
                    Our vision is to become the trusted destination for fresh floral artistry,
                    gourmet cakes, and unforgettable celebrations across Calicut and beyond.
                    We aim to bring communities closer by curating moments of pure joy,
                    guided by craftsmanship, creativity, and sustainability.
                  </p>
                  <div className={styles.checkList}>
                    <div className={styles.checkItem}>
                      <span className={styles.checkIconCircle}>
                        <Check size={14} strokeWidth={2.8} />
                      </span>
                      <span>Inspiring connections through floral artistry</span>
                    </div>
                    <div className={styles.checkItem}>
                      <span className={styles.checkIconCircle}>
                        <Check size={14} strokeWidth={2.8} />
                      </span>
                      <span>Eco-friendly and sustainable celebration practices</span>
                    </div>
                    <div className={styles.checkItem}>
                      <span className={styles.checkIconCircle}>
                        <Check size={14} strokeWidth={2.8} />
                      </span>
                      <span>Delivering joy and smiles across generations</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Large Interior Image */}
            <div className={styles.missionImageCard}>
              <img
                src="/images/about/mission-interior.jpg"
                alt="Occasions luxury boutique flower shop interior"
                className={styles.missionInteriorImg}
                loading="lazy"
              />
            </div>
          </div>
        </section>
      </main>

      {/* Existing Shared Footer */}
      <Footer />
    </div>
  );
}
