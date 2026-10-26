"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Footer.module.css";
import { Send } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleScrollTo = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string
  ) => {
    if (pathname === "/") {
      e.preventDefault();
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", `/#${targetId}`);
      }
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 3500);
  };

  return (
    <footer className={styles.footerWrapper} id="footer-contact">
      {/* Fixed image layer: stays still while the card scrolls over it */}
      <div className={styles.bgLayer} aria-hidden="true" />

      <div className={styles.inner}>
        {/* ================= MAIN GRID ================= */}
        <div className={styles.mainGrid}>
          {/* Brand */}
          <div className={styles.brandCol}>
            <Link href="/" className={styles.logoLink} aria-label="Occasions Home">
              <img
                src="/images/occasions-logo.png"
                alt="Occasions - Do it with flowers"
                className={styles.logoImg}
              />
            </Link>
          </div>

          {/* Services */}
          <div className={styles.linksCol}>
            <h4 className={styles.colTitle}>Our Services</h4>
            <ul className={`${styles.linksList} ${styles.servicesList}`}>
              <li>
                <Link
                  href="/#shop-by-flowers"
                  className={styles.navLink}
                  onClick={(e) => handleScrollTo(e, "shop-by-flowers")}
                >
                  Flowers
                </Link>
              </li>
              <li>
                <Link href="/cakes" className={styles.navLink}>Cakes</Link>
              </li>
              <li>
                <Link
                  href="/#occasions"
                  className={styles.navLink}
                  onClick={(e) => handleScrollTo(e, "occasions")}
                >
                  Special Occasions
                </Link>
              </li>
              <li>
                <Link
                  href="/#highlights"
                  className={styles.navLink}
                  onClick={(e) => handleScrollTo(e, "highlights")}
                >
                  Our Highlights
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className={styles.linksCol}>
            <h4 className={styles.colTitle}>Connect</h4>
            <ul className={styles.linksList}>
              <li>
                <Link href="/contact" className={styles.navLink}>Contact Us</Link>
              </li>
              <li>
                <Link href="/about" className={styles.navLink}>About Us</Link>
              </li>
              <li>
                <Link href="/faq" className={styles.navLink}>FAQs</Link>
              </li>
              <li>
                <Link href="/privacy-policy" className={styles.navLink}>
                  Privacy &amp; Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Address */}
          <div className={styles.addressCol}>
            <h4 className={styles.colTitle}>Address</h4>
            <div className={styles.addressContent}>
              <p className={styles.addressText}>
                Near CH Flyover, Kannur Road
                <br />
                Calicut, Kerala, 673001
              </p>
              <p className={styles.helpText}>
                Help support:
                <a href="tel:+918606464700" className={styles.phoneLink}>
                  +91 8606 464 700
                </a>
              </p>
            </div>
          </div>

          {/* Newsletter + socials */}
          <div className={styles.newsletterCol}>
            <h4 className={styles.colTitle}>Newsletter</h4>

            <form className={styles.newsletterForm} onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder={subscribed ? "Thank you!" : "Your email..."}
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
                <Send size={16} strokeWidth={2.2} />
              </button>
            </form>

            <div className={styles.socialRow}>
              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className={styles.socialBtn}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
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
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/918606464700"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                title="Chat on WhatsApp"
                className={styles.socialBtn}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 20.15C10.57 20.15 9.12 19.75 7.85 19L7.55 18.82L4.43 19.64L5.26 16.59L5.07 16.29C4.24 14.97 3.81 13.46 3.81 11.91C3.81 7.37 7.5 3.68 12.05 3.68C14.25 3.68 16.32 4.54 17.88 6.1C19.43 7.66 20.29 9.72 20.28 11.92C20.28 16.46 16.59 20.15 12.05 20.15ZM16.57 14.41C16.32 14.28 15.1 13.68 14.87 13.6C14.64 13.52 14.48 13.48 14.31 13.73C14.15 13.98 13.67 14.54 13.52 14.71C13.38 14.88 13.23 14.9 12.98 14.77C12.73 14.65 11.93 14.38 10.98 13.54C10.24 12.88 9.74 12.07 9.6 11.82C9.45 11.57 9.58 11.44 9.71 11.31C9.82 11.2 9.96 11.02 10.08 10.87C10.21 10.73 10.25 10.63 10.33 10.46C10.41 10.3 10.37 10.15 10.31 10.03C10.25 9.9 9.75 8.68 9.55 8.18C9.35 7.7 9.14 7.76 8.99 7.75C8.83 7.74 8.67 7.74 8.51 7.74C8.35 7.74 8.08 7.8 7.85 8.05C7.62 8.3 6.97 8.91 6.97 10.14C6.97 11.37 7.87 12.56 8 12.72C8.12 12.89 9.76 15.41 12.26 16.49C12.86 16.75 13.32 16.9 13.69 17.02C14.29 17.21 14.83 17.18 15.26 17.12C15.74 17.05 16.74 16.51 16.95 15.93C17.16 15.34 17.16 14.84 17.1 14.73C17.03 14.63 16.87 14.54 16.57 14.41Z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* ================= COPYRIGHT ================= */}
        <div className={styles.copyrightRow}>
          © 2026 Occassions - Do it with flowers. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}