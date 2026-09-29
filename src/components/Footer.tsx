"use client";

import React, { useState } from "react";
import styles from "./Footer.module.css";
import { Award, ArrowRight } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();

    if (email) {
      setSubscribed(true);

      setTimeout(() => {
        setSubscribed(false);
      }, 4000);

      setEmail("");
    }
  };

  return (
    <footer className={styles.footerWrapper} id="footer-contact">
      <div className={styles.footerCard}>

        {/* ================= TOP HEADER ================= */}
        <div className={styles.cardHeader}>

          {/* Logo */}
          <div className={styles.headerLogo}>
            <img
              src="/images/occasions-logo.png"
              alt="Occassions - Do it with flowers"
              className={styles.logoImg}
            />
          </div>

          {/* Support */}
          <div className={styles.contactItem}>
            <span className={styles.contactLabel}>
              Help support:
            </span>

            <a
              href="tel:+918606464700"
              className={styles.contactValue}
            >
              +91 8606 464 700
            </a>
          </div>

          {/* Email */}
          <div className={styles.contactItem}>
            <span className={styles.contactLabel}>
              Email us:
            </span>

            <a
              href="mailto:occasionscalicut@gmail.com"
              className={styles.contactValue}
            >
              occasionscalicut@gmail.com
            </a>
          </div>

          {/* Social */}
          <div className={styles.socialFollow}>
            <span className={styles.followLabel}>
              Follow us:
            </span>

            <div className={styles.socialIcons}>

              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className={styles.socialLink}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>

              {/* X */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X"
                className={styles.socialLink}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className={styles.socialLink}
              >
                <svg
                  width="15"
                  height="15"
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

              {/* Pinterest */}
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pinterest"
                className={styles.socialLink}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.334 1.372-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                </svg>
              </a>

            </div>
          </div>
        </div>

        <div className={styles.cardDivider} />

        {/* ================= MAIN BODY ================= */}
        <div className={styles.cardBody}>

          {/* Newsletter */}
          <div className={styles.newsletterCol}>

            <h3 className={styles.newsletterTitle}>
              Join our newsletter
            </h3>

            <p className={styles.newsletterDesc}>
              Subscribe for exclusive seasonal offers,
              bridal decor insights, and fresh florist
              inspirations delivered directly.
            </p>

            <form
              className={styles.newsletterForm}
              onSubmit={handleSubscribe}
            >
              <input
                type="email"
                placeholder="Your email..."
                className={styles.newsletterInput}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <button
                type="submit"
                className={styles.newsletterBtn}
              >
                <span>
                  {subscribed ? "Subscribed!" : "Subscribe"}
                </span>

                <ArrowRight size={15} />
              </button>
            </form>

            <div className={styles.certBadge}>
              <Award size={15} />

              <span>
                Certified Member: IFA (India Florist Association)
              </span>
            </div>

          </div>

          {/* ================= LINKS ================= */}
          <div className={styles.linksGrid}>

            {/* Services */}
            <div className={styles.linkColumn}>

              <h4 className={styles.colHeading}>
                Our Services
              </h4>

              <ul className={styles.linksList}>

                <li className={styles.linkItem}>
                  <a href="#highlights">
                    Car Decorations
                  </a>
                </li>

                <li className={styles.linkItem}>
                  <a href="#highlights">
                    Flower Baskets &amp; Garlands
                  </a>
                </li>

                <li className={styles.linkItem}>
                  <a href="#highlights">
                    Church Arrangements
                  </a>
                </li>

                <li className={styles.linkItem}>
                  <a href="#highlights">
                    Table Arrangements
                  </a>
                </li>

                <li className={styles.linkItem}>
                  <a href="#hero-slider">
                    Fresh Hand Bouquets
                  </a>
                </li>

                <li className={styles.linkItem}>
                  <a href="#hero-slider">
                    Celebration Cakes
                  </a>
                </li>

              </ul>

            </div>

            {/* Atelier */}
            <div className={styles.linkColumn}>

              <h4 className={styles.colHeading}>
                Atelier &amp; Decor
              </h4>

              <ul className={styles.linksList}>

                <li className={styles.linkItem}>
                  <a href="#highlights">
                    Signature Highlights
                  </a>
                </li>

                <li className={styles.linkItem}>
                  <a
                    href="https://wa.me/918606464700"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Direct WhatsApp Booking
                  </a>
                </li>

                <li className={styles.linkItem}>
                  <a href="#hero-slider">
                    Bridal Floral Consultation
                  </a>
                </li>

                <li className={styles.linkItem}>
                  <a href="#hero-slider">
                    Corporate &amp; Event Styling
                  </a>
                </li>

                <li className={styles.linkItem}>
                  <a href="#our-story">
                    Our Floral Story
                  </a>
                </li>

              </ul>

            </div>

            {/* Contact */}
            <div className={styles.linkColumn}>

              <h4 className={styles.colHeading}>
                Boutique &amp; Contact
              </h4>

              <div className={styles.contactInfo}>

                <p>
                  <strong>Proprietor:</strong>{" "}
                  Sreejesh K.V
                </p>

                <p className={styles.contactBlock}>
                  <strong>Location:</strong>
                  <br />
                  Near CH Flyover, Kannur Road,
                  <br />
                  Calicut (Kozhikode),
                  Kerala 673001
                </p>

                <p className={styles.contactBlock}>
                  <strong>Phone &amp; WhatsApp:</strong>
                  <br />

                  <a
                    href="tel:+918606464700"
                    className={styles.phoneLink}
                  >
                    +91 8606 464 700
                  </a>

                  <br />

                  <a
                    href="tel:04952760638"
                    className={styles.phoneLink}
                  >
                    0495 2760638
                  </a>

                  {" / "}

                  <a
                    href="tel:+919447217628"
                    className={styles.phoneLink}
                  >
                    9447 217 628
                  </a>
                </p>

              </div>

            </div>

          </div>
        </div>

        {/* ================= BOTTOM BAR ================= */}
        <div className={styles.bottomBar}>

          <div>
            © {new Date().getFullYear()} Occassions -
            Do it with flowers. All Rights Reserved.
          </div>

          <div>
            Near CH Flyover, Kannur Road, Calicut,
            Kerala. Express Floral Delivery Across
            Kozhikode &amp; Malabar.
          </div>

        </div>

      </div>
    </footer>
  );
}