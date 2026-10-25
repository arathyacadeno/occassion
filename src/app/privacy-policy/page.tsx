import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./privacy.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy | Occasions Premier Florist & Event Decor, Calicut",
  description:
    "Read the Occasions Privacy Policy. Learn how we collect, use, protect, and handle your personal and order information for cakes, flowers, and gifts in Calicut.",
  openGraph: {
    title: "Privacy Policy | Occasions Florist, Calicut",
    description:
      "Information on how Occasions collects, uses, and safeguards customer data for orders and deliveries.",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <main className={styles.mainContent}>
        {/* ================= PAGE HEADER ================= */}
        <header className={styles.headerSection}>
          <h1 className={styles.pageTitle}>Privacy Policy</h1>
        </header>

        {/* ================= POLICY DOCUMENT ================= */}
        <div className={styles.contentContainer}>
          {/* Section 1 */}
          <section className={styles.policySection} aria-labelledby="section-1">
            <h2 id="section-1" className={styles.sectionHeading}>
              1. Information We Collect
            </h2>
            <p className={styles.paragraph}>
              To operate our e-commerce services and provide a smooth customer experience,
              Occassion may collect different categories of personal and technical information.
              The information collected depends on the services you use and the details you
              choose to provide.
            </p>

            <h3 className={styles.subsectionHeading}>Personal Information</h3>
            <ul className={styles.bulletList}>
              <li className={styles.bulletItem}>Full name</li>
              <li className={styles.bulletItem}>Email address</li>
              <li className={styles.bulletItem}>Mobile number</li>
              <li className={styles.bulletItem}>Billing and delivery address</li>
              <li className={styles.bulletItem}>Account login information</li>
            </ul>

            <h3 className={styles.subsectionHeading}>Order Information</h3>
            <ul className={styles.bulletList}>
              <li className={styles.bulletItem}>
                Products purchased, including cakes, flowers, and gifts
              </li>
              <li className={styles.bulletItem}>Order number and purchase history</li>
              <li className={styles.bulletItem}>Preferred delivery date and time</li>
              <li className={styles.bulletItem}>Recipient name and contact details</li>
              <li className={styles.bulletItem}>
                Gift messages and special delivery instructions
              </li>
            </ul>

            <h3 className={styles.subsectionHeading}>Payment Information</h3>
            <p className={styles.paragraph}>
              Payments may be processed through third-party payment providers. Occassion may
              receive transaction references, payment status, and limited payment-related
              details required to manage your orders and refunds. Technical Information. We
              may collect your IP address, browser type, device information, pages visited,
              and website interaction data through cookies and similar technologies.
            </p>
          </section>

          {/* Section 2 */}
          <section className={styles.policySection} aria-labelledby="section-2">
            <h2 id="section-2" className={styles.sectionHeading}>
              2. How We Use Your Information
            </h2>
            <p className={styles.paragraph}>
              Occassion uses collected information for legitimate business purposes, subject to
              applicable legal requirements and any consent that may be necessary. We may use
              your information to:
            </p>
            <ul className={styles.bulletList}>
              <li className={styles.bulletItem}>
                <strong className={styles.bulletLabel}>Process orders:</strong> Confirm
                purchases, manage shopping carts, calculate applicable charges, and provide
                order receipts.
              </li>
              <li className={styles.bulletItem}>
                <strong className={styles.bulletLabel}>Arrange deliveries:</strong> Coordinate
                with delivery partners to ensure cakes, flowers, and gifts reach the correct
                destination.
              </li>
              <li className={styles.bulletItem}>
                <strong className={styles.bulletLabel}>Provide customer support:</strong> Answer
                questions, resolve complaints, and assist with order changes or delivery issues.
              </li>
              <li className={styles.bulletItem}>
                <strong className={styles.bulletLabel}>Manage payments:</strong> Verify
                transactions, identify payment issues, and process eligible refunds.
              </li>
              <li className={styles.bulletItem}>
                <strong className={styles.bulletLabel}>Personalize shopping:</strong> Remember
                relevant preferences and recommend products that may suit your interests.
              </li>
              <li className={styles.bulletItem}>
                <strong className={styles.bulletLabel}>Improve our website:</strong> Analyze
                product engagement, navigation patterns, and website performance.
              </li>
              <li className={styles.bulletItem}>
                <strong className={styles.bulletLabel}>Communicate updates:</strong> Send order
                confirmations, dispatch notifications, delivery updates, and important service
                announcements.
              </li>
              <li className={styles.bulletItem}>
                <strong className={styles.bulletLabel}>Support promotions:</strong> Share
                offers, seasonal collections, and special occasion recommendations where
                permitted by law.
              </li>
              <li className={styles.bulletItem}>
                <strong className={styles.bulletLabel}>Protect our services:</strong> Detect
                fraud, investigate suspicious transactions, prevent abuse, and protect customer
                accounts.
              </li>
              <li className={styles.bulletItem}>
                <strong className={styles.bulletLabel}>Meet legal obligations:</strong> Maintain
                required records and respond to lawful requests from competent authorities.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className={styles.policySection} aria-labelledby="section-3">
            <h2 id="section-3" className={styles.sectionHeading}>
              3. Sharing of Information
            </h2>
            <ul className={styles.bulletList}>
              <li className={styles.bulletItem}>
                Delivery partners for order fulfilment.
              </li>
              <li className={styles.bulletItem}>
                Payment providers for payment processing and refunds.
              </li>
              <li className={styles.bulletItem}>
                Technology providers for website hosting and maintenance.
              </li>
              <li className={styles.bulletItem}>
                Customer support services for resolving customer enquiries.
              </li>
              <li className={styles.bulletItem}>
                Analytics and marketing providers for permitted measurement and promotional
                activities.
              </li>
              <li className={styles.bulletItem}>
                Legal authorities when disclosure is required by applicable law.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className={styles.policySection} aria-labelledby="section-4">
            <h2 id="section-4" className={styles.sectionHeading}>
              4. Cookies and Tracking Technologies
            </h2>
            <ul className={styles.bulletList}>
              <li className={styles.bulletItem}>
                Occassion may use cookies and similar technologies to remember shopping
                preferences, maintain shopping carts, improve website functionality, understand
                visitor behaviour, and measure advertising performance.
              </li>
              <li className={styles.bulletItem}>
                You can manage or disable cookies through your browser settings and, where
                available, our cookie preference controls. Some website features may not function
                correctly if certain cookies are disabled.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className={styles.policySection} aria-labelledby="section-5">
            <h2 id="section-5" className={styles.sectionHeading}>
              5. Data Security
            </h2>
            <ul className={styles.bulletList}>
              <li className={styles.bulletItem}>
                Occassion uses reasonable technical and organisational safeguards to protect
                personal information against unauthorized access, disclosure, alteration, loss, or
                misuse.
              </li>
              <li className={styles.bulletItem}>
                However, no method of online transmission or electronic storage is completely
                secure. We encourage customers to protect their account credentials and avoid
                sharing sensitive information through unsecured channels.
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className={styles.policySection} aria-labelledby="section-6">
            <h2 id="section-6" className={styles.sectionHeading}>
              6. Third–Party Websites and Services
            </h2>
            <ul className={styles.bulletList}>
              <li className={styles.bulletItem}>
                Our website may contain links to third-party websites, payment gateways, and
                social media platforms. These services have their own privacy policies and
                practices.
              </li>
              <li className={styles.bulletItem}>
                We encourage you to review their policies before providing personal information.
                Occassion is not responsible for the privacy practices of third-party websites
                that we do not control.
              </li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className={styles.policySection} aria-labelledby="section-7">
            <h2 id="section-7" className={styles.sectionHeading}>
              7. Data Retention
            </h2>
            <ul className={styles.bulletList}>
              <li className={styles.bulletItem}>
                Occassion retains personal information for as long as reasonably necessary to
                fulfil orders, provide customer support, maintain business records, resolve
                disputes, and meet applicable legal obligations.
              </li>
              <li className={styles.bulletItem}>
                When personal information is no longer required, we take appropriate steps to
                delete it or securely dispose of it, subject to legal requirements.
              </li>
            </ul>
          </section>

          {/* Section 8 */}
          <section className={styles.policySection} aria-labelledby="section-8">
            <h2 id="section-8" className={styles.sectionHeading}>
              8. Marketing Communications
            </h2>
            <ul className={styles.bulletList}>
              <li className={styles.bulletItem}>
                Occassion may send promotional emails or messages about seasonal collections,
                birthday surprises, anniversary gifts, cake offers, flower arrangements, and
                special occasions where permitted by law.
              </li>
              <li className={styles.bulletItem}>
                You can opt out of promotional emails through the unsubscribe link or contact
                our support team. Essential service messages, such as order confirmations and
                delivery notifications, may still be sent.
              </li>
            </ul>
          </section>

          {/* Section 9 */}
          <section className={styles.policySection} aria-labelledby="section-9">
            <h2 id="section-9" className={styles.sectionHeading}>
              9. Contact Us
            </h2>
            <ul className={styles.bulletList}>
              <li className={styles.bulletItem}>
                If you have questions, concerns, or requests regarding this Privacy Policy or your
                personal information, please contact us.
              </li>
            </ul>

            <h3 className={styles.brandName}>Occassions</h3>

            <div className={styles.contactRow} aria-label="Contact Channels">
              {/* WhatsApp */}
              <a
                href="https://wa.me/919447446008"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.contactLink}
                aria-label="WhatsApp: +91 9447446008"
              >
                <span className={styles.contactIcon} aria-hidden="true">
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="#16a34a"
                  >
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 20.15C10.57 20.15 9.12 19.75 7.85 19L7.55 18.82L4.43 19.64L5.26 16.6L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.68 12.04 3.68C14.25 3.68 16.31 4.54 17.87 6.1C19.42 7.66 20.28 9.72 20.28 11.92C20.28 16.46 16.59 20.15 12.05 20.15Z" />
                  </svg>
                </span>
                <span>+91 9447446008</span>
              </a>

              {/* Phone */}
              <a
                href="tel:+918606464700"
                className={styles.contactLink}
                aria-label="Call: +91 8606464700"
              >
                <span className={styles.contactIcon} aria-hidden="true">
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <span>+91 8606464700</span>
              </a>

              {/* Email */}
              <a
                href="mailto:occasions.flowers@gmail.com"
                className={styles.contactLink}
                aria-label="Email: occasions.flowers@gmail.com"
              >
                <span className={styles.contactIcon} aria-hidden="true">
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </span>
                <span>occassions.floowers@gmail.com</span>
              </a>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
