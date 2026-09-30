"use client";

import React, { useState } from "react";
import Link from "next/link";
import styles from "./Footer.module.css";
import { Send } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();

    if (email.trim()) {
      setSubscribed(true);

      setTimeout(() => {
        setSubscribed(false);
      }, 3500);

      setEmail("");
    }
  };

  return (
    <footer className={styles.footerWrapper} id="footer-contact">
      <div className={styles.footerCard}>

        {/* ================= MAIN GRID ================= */}
        <div className={styles.mainGrid}>

          {/* ================= BRAND ================= */}
          <div className={styles.brandCol}>
            <Link
              href="/"
              className={styles.logoLink}
              aria-label="Occasions Home"
            >
              <img
                src="/images/occasions-logo.png"
                alt="Occasions - Do it with flowers"
                className={styles.logoImg}
              />
            </Link>

            <p className={styles.brandQuote}>
              &ldquo;Thoughtfully curated floral arrangements using fresh,
              premium blooms to bring beauty, emotion, and elegance to every
              special moment.&rdquo;
            </p>

            <div className={styles.socialRow}>

              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className={styles.socialBtn}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className={styles.socialBtn}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect
                    width="20"
                    height="20"
                    x="2"
                    y="2"
                    rx="5"
                    ry="5"
                  />

                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />

                  <line
                    x1="17.5"
                    x2="17.51"
                    y1="6.5"
                    y2="6.5"
                  />
                </svg>
              </a>

              {/* X */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X"
                className={styles.socialBtn}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

            </div>
          </div>

          {/* ================= SERVICES ================= */}
          <div className={styles.linksCol}>
            <h4 className={styles.colTitle}>
              Our Services
            </h4>

            <ul className={styles.linksList}>
              <li>
                <Link href="/#flowers" className={styles.navLink}>
                  Flowers
                </Link>
              </li>

              <li>
                <Link href="/occasions" className={styles.navLink}>
                  Cakes
                </Link>
              </li>

              <li>
                <Link href="/occasions" className={styles.navLink}>
                  Special occasions
                </Link>
              </li>

              <li>
                <Link href="/#highlights" className={styles.navLink}>
                  Our highlights
                </Link>
              </li>
            </ul>
          </div>

          {/* ================= CONNECT ================= */}
          <div className={styles.linksCol}>
            <h4 className={styles.colTitle}>
              Connect
            </h4>

            <ul className={styles.linksList}>
              <li>
                <a
                  href="#footer-contact"
                  className={styles.navLink}
                >
                  Contact Us
                </a>
              </li>

              <li>
                <a
                  href="#our-story"
                  className={styles.navLink}
                >
                  About Us
                </a>
              </li>

              <li>
                <a
                  href="#faq"
                  className={styles.navLink}
                >
                  FAQs
                </a>
              </li>

              <li>
                <Link
                  href="/privacy-policy"
                  className={styles.navLink}
                >
                  Privacy &amp; Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* ================= ADDRESS ================= */}
          <div className={styles.addressCol}>
            <h4 className={styles.colTitle}>
              Address
            </h4>

            <div className={styles.addressContent}>
              <p className={styles.addressText}>
                Near CH Flyover, Kannur Road
                <br />
                Calicut, Kerala, 673001
              </p>

              <p className={styles.helpText}>
                Help support:
                <a
                  href="tel:+918606464700"
                  className={styles.phoneLink}
                >
                  +91 8606 464 700
                </a>
              </p>
            </div>
          </div>

          {/* ================= NEWSLETTER ================= */}
          <div className={styles.newsletterCol}>
            <h4 className={styles.colTitle}>
              Newsletter
            </h4>

            <form
              className={styles.newsletterForm}
              onSubmit={handleSubscribe}
            >
              <input
                type="email"
                placeholder={
                  subscribed
                    ? "Thank you!"
                    : "Your email......"
                }
                className={styles.newsletterInput}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Email address for newsletter"
              />

              <button
                type="submit"
                className={styles.sendBtn}
                aria-label="Subscribe to newsletter"
              >
                <Send
                  size={16}
                  strokeWidth={2.4}
                />
              </button>
            </form>
          </div>

        </div>

        {/* ================= COPYRIGHT ================= */}
        <div className={styles.copyrightRow}>
          <p className={styles.copyrightText}>
            &copy; 2026 Occassions - Do it with flowers. All Rights Reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}