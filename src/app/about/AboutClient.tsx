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
      title: "Fresh and Beautiful Flowers",
      desc: "Sourced with care and arranged to last.",
      icon: (
        <svg
          width="22"
          height="19"
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
      ),
    },
    {
      title: "Unique Bouquet Designs",
      desc: "Original styles you won't find elsewhere.",
      icon: (
        <svg
          width="18"
          height="20"
          viewBox="0 0 16 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M6.09258 1.125C4.90078 1.125 3.9375 2.08828 3.9375 3.28008V3.45234C3.9375 3.87422 4.05352 4.28555 4.26797 4.64766L4.92891 5.74805C4.96758 5.81133 4.97109 5.85703 4.96406 5.8957C4.95703 5.93789 4.93594 5.98359 4.89375 6.02227C4.85156 6.06094 4.80938 6.08555 4.76719 6.09258C4.73203 6.09961 4.68281 6.09609 4.61953 6.05742L3.51914 5.39648C3.15703 5.17852 2.7457 5.06602 2.32383 5.06602H2.15508C0.963281 5.0625 0 6.02578 0 7.21758C0 7.78711 0.228516 8.33555 0.629297 8.73984L0.671484 8.78203C0.791016 8.90156 0.791016 9.09844 0.671484 9.21797L0.629297 9.26016C0.228516 9.66445 0 10.2129 0 10.7824C0 11.9742 0.963281 12.9375 2.15508 12.9375H2.32734C2.74922 12.9375 3.16055 12.8215 3.52266 12.607L4.62305 11.9461C4.68633 11.9074 4.73203 11.9039 4.7707 11.9109C4.81289 11.918 4.85859 11.9391 4.89727 11.9812C4.93594 12.0234 4.96055 12.0656 4.96758 12.1078C4.97461 12.143 4.97109 12.1922 4.93242 12.2555L4.27148 13.3559C4.05352 13.718 3.94102 14.1293 3.94102 14.5512V14.7234C3.94102 15.9117 4.9043 16.8785 6.09609 16.8785C6.66562 16.8785 7.21406 16.65 7.61836 16.2492L7.66055 16.207C7.78008 16.0875 7.97695 16.0875 8.09648 16.207L8.13867 16.2492C8.54297 16.6535 9.09141 16.8785 9.66094 16.8785C10.8492 16.8785 11.816 15.9152 11.816 14.7234V14.5512C11.816 14.1293 11.7 13.718 11.4855 13.3559L10.8246 12.2555C10.7859 12.1922 10.7824 12.1465 10.7895 12.1078C10.7965 12.0656 10.8176 12.0199 10.8598 11.9812C10.902 11.9426 10.9441 11.918 10.9863 11.9109C11.0215 11.9039 11.0707 11.9074 11.134 11.9461L12.2344 12.607C12.5965 12.825 13.0078 12.9375 13.4297 12.9375H13.602C14.7902 12.9375 15.757 11.9742 15.757 10.7824C15.757 10.2129 15.5285 9.66445 15.1277 9.26016L15.0855 9.21797C14.966 9.09844 14.966 8.90156 15.0855 8.78203L15.1277 8.73984C15.532 8.33555 15.757 7.78711 15.757 7.21758C15.757 6.0293 14.7937 5.0625 13.602 5.0625H13.4297C13.0078 5.0625 12.5965 5.17852 12.2344 5.39297L11.134 6.05391C11.0707 6.09258 11.025 6.09609 10.9863 6.08906C10.9441 6.08203 10.8984 6.06094 10.8598 6.01875C10.8211 5.97656 10.7965 5.93438 10.7895 5.89219C10.7824 5.85703 10.7859 5.80781 10.8246 5.74453L11.4855 4.64414C11.7035 4.28203 11.816 3.8707 11.816 3.44883V3.28008C11.8125 2.08828 10.8492 1.125 9.65742 1.125C9.08789 1.125 8.53945 1.35352 8.13516 1.7543L8.09297 1.79648C7.97344 1.91602 7.77656 1.91602 7.65703 1.79648L7.61484 1.7543C7.21055 1.35352 6.66211 1.125 6.09258 1.125Z"
            fill="#15803D"
          />
        </svg>
      ),
    },
    {
      title: "Delicious Cakes",
      desc: "Sweet treats to make every celebration extra special.",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M11.875 2.00195C11.7057 2.00195 11.5592 1.9401 11.4355 1.81641C11.3118 1.69271 11.25 1.54622 11.25 1.37695C11.25 1.29883 11.276 1.19792 11.3281 1.07422C11.3802 0.950521 11.4388 0.820312 11.5039 0.683594C11.569 0.546875 11.6374 0.416667 11.709 0.292969C11.7806 0.169271 11.8359 0.0716146 11.875 0C11.9141 0.0716146 11.9661 0.169271 12.0312 0.292969C12.0964 0.416667 12.1647 0.546875 12.2363 0.683594C12.3079 0.820312 12.3698 0.950521 12.4219 1.07422C12.474 1.19792 12.5 1.29883 12.5 1.37695C12.5 1.54622 12.4382 1.69271 12.3145 1.81641C12.1908 1.9401 12.0443 2.00195 11.875 2.00195ZM20 8.25195V19.502H0V8.25195L11.25 4.50195V2.93945C11.25 2.88086 11.2728 2.83203 11.3184 2.79297C11.3639 2.75391 11.4225 2.72135 11.4941 2.69531C11.5658 2.66927 11.6341 2.65299 11.6992 2.64648C11.7643 2.63997 11.8229 2.63346 11.875 2.62695C11.9206 2.62695 11.9759 2.63021 12.041 2.63672C12.1061 2.64323 12.1745 2.65951 12.2461 2.68555C12.3177 2.71159 12.3763 2.74414 12.4219 2.7832C12.4674 2.82227 12.4935 2.87435 12.5 2.93945V4.08203L15 3.25195L20 8.25195ZM11.875 7.00195C11.8294 7.00195 11.7741 6.9987 11.709 6.99219C11.6439 6.98568 11.5755 6.9694 11.5039 6.94336C11.4323 6.91732 11.3737 6.88477 11.3281 6.8457C11.2826 6.80664 11.2565 6.75456 11.25 6.68945V5.82031L3.95508 8.25195H18.2324L14.6582 4.67773L12.5 5.40039V6.68945C12.5 6.74805 12.4772 6.79688 12.4316 6.83594C12.3861 6.875 12.3275 6.90755 12.2559 6.93359C12.1842 6.95964 12.1159 6.97591 12.0508 6.98242C11.9857 6.98893 11.9271 6.99544 11.875 7.00195ZM1.25 9.50195V13.252H18.75V9.50195H1.25ZM18.75 18.252V14.502H1.25V18.252H18.75Z"
            fill="#15803D"
          />
        </svg>
      ),
    },
    {
      title: "Easy Online Ordering",
      desc: "Pick, personalize, and pay in a few taps.",
      icon: (
        <svg
          width="13"
          height="22"
          viewBox="0 0 14 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M0.5625 6.5C0.5625 5.25898 1.57148 4.25 2.8125 4.25H10.6875C11.9285 4.25 12.9375 5.25898 12.9375 6.5V20C12.9375 21.241 11.9285 22.25 10.6875 22.25H2.8125C1.57148 22.25 0.5625 21.241 0.5625 20V6.5ZM5.0625 20C5.0625 20.3094 5.31563 20.5625 5.625 20.5625H7.875C8.18437 20.5625 8.4375 20.3094 8.4375 20C8.4375 19.6906 8.18437 19.4375 7.875 19.4375H5.625C5.31563 19.4375 5.0625 19.6906 5.0625 20ZM10.6875 6.5H2.8125V17.75H10.6875V6.5Z"
            fill="#15803D"
          />
        </svg>
      ),
    },
    {
      title: "Careful Packaging",
      desc: "Blooms arrive protected, fresh, and gift-ready.",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M1.78242 0.931641L0 4.5H7.3125V0H3.29414C2.6543 0 2.0707 0.362109 1.78242 0.931641ZM8.4375 4.5H15.75L13.9676 0.931641C13.6793 0.362109 13.0957 0 12.4559 0H8.4375V4.5ZM15.75 5.625H0V13.5C0 14.741 1.00898 15.75 2.25 15.75H13.5C14.741 15.75 15.75 14.741 15.75 13.5V5.625Z"
            fill="#15803D"
          />
        </svg>
      ),
    },
    {
      title: "Convenient Delivery",
      desc: "Choose the day and we'll bring it to the door.",
      icon: (
        <svg
          width="23"
          height="18"
          viewBox="0 0 23 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M1.6875 0C0.755859 0 0 0.755859 0 1.6875V12.9375C0 13.8691 0.755859 14.625 1.6875 14.625H2.25C2.25 16.4883 3.76172 18 5.625 18C7.48828 18 9 16.4883 9 14.625H13.5C13.5 16.4883 15.0117 18 16.875 18C18.7383 18 20.25 16.4883 20.25 14.625H21.375C21.9973 14.625 22.5 14.1223 22.5 13.5C22.5 12.8777 21.9973 12.375 21.375 12.375V10.125V9V8.34258C21.375 7.74492 21.1395 7.17188 20.7176 6.75L18 4.03242C17.5781 3.61055 17.0051 3.375 16.4074 3.375H14.625V1.6875C14.625 0.755859 13.8691 0 12.9375 0H1.6875ZM14.625 5.625H16.4074L19.125 8.34258V9H14.625V5.625ZM3.9375 14.625C3.9375 14.1774 4.11529 13.7482 4.43176 13.4318C4.74823 13.1153 5.17745 12.9375 5.625 12.9375C6.07255 12.9375 6.50178 13.1153 6.81824 13.4318C7.13471 13.7482 7.3125 14.1774 7.3125 14.625C7.3125 15.0726 7.13471 15.5018 6.81824 15.8182C6.50178 16.1347 6.07255 16.3125 5.625 16.3125C5.17745 16.3125 4.74823 16.1347 4.43176 15.8182C4.11529 15.5018 3.9375 15.0726 3.9375 14.625ZM16.875 12.9375C17.3226 12.9375 17.7518 13.1153 18.0682 13.4318C18.3847 13.7482 18.5625 14.1774 18.5625 14.625C18.5625 15.0726 18.3847 15.5018 18.0682 15.8182C17.7518 16.1347 17.3226 16.3125 16.875 16.3125C16.4274 16.3125 15.9982 16.1347 15.6818 15.8182C15.3653 15.5018 15.1875 15.0726 15.1875 14.625C15.1875 14.1774 15.3653 13.7482 15.6818 13.4318C15.9982 13.1153 16.4274 12.9375 16.875 12.9375Z"
            fill="#15803D"
          />
        </svg>
      ),
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
              {whyChooseFeatures.map((item, idx) => (
                <div key={idx} className={styles.whyItem}>
                  <div className={styles.whyIconCircle}>
                    {item.icon}
                  </div>
                  <div className={styles.whyTextWrap}>
                    <h3 className={styles.whyTitle}>{item.title}</h3>
                    <p className={styles.whyDesc}>{item.desc}</p>
                  </div>
                </div>
              ))}
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
                key={activeTab}
                src={
                  activeTab === "vision"
                    ? "/images/about/vission-interior.jpg"
                    : "/images/about/mission-interior.jpg"
                }
                alt={
                  activeTab === "vision"
                    ? "Occasions Vision - Floral boutique interior"
                    : "Occasions Mission - Luxury boutique shop interior"
                }
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
