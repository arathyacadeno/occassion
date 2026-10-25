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
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.6687 2.32548C12.9307 1.58618 12.0526 0.99997 11.0854 0.600797C10.1181 0.201625 9.08084 -0.00257541 8.03371 2.45181e-05C3.64281 2.45181e-05 0.0683305 3.55665 0.0665557 7.92847C0.0665557 9.32569 0.433055 10.6893 1.12967 11.8923L0 16L4.22318 14.8969C5.39162 15.5291 6.7002 15.8609 8.03016 15.8622H8.03371C12.4237 15.8622 15.9982 12.3056 16 7.93377C16.0028 6.89206 15.7982 5.86011 15.3981 4.89751C14.998 3.93491 14.4102 3.06074 13.6687 2.32548ZM8.03371 14.5242H8.03104C6.84506 14.5241 5.68093 14.2066 4.66067 13.6048L4.41929 13.4617L1.91325 14.1161L2.58147 11.6847L2.4244 11.4356C1.76141 10.385 1.4104 9.16916 1.41187 7.92847C1.41364 4.29501 4.3838 1.33895 8.03637 1.33895C8.90635 1.33639 9.76816 1.5059 10.5718 1.83764C11.3754 2.16938 12.1047 2.65673 12.7174 3.27138C13.3339 3.88259 13.8224 4.60933 14.1549 5.4096C14.4875 6.20986 14.6573 7.06778 14.6547 7.93377C14.6529 11.5672 11.6827 14.5242 8.03371 14.5242ZM11.6659 9.588C11.4662 9.4882 10.4883 9.00951 10.3055 8.94327C10.1227 8.87703 9.99133 8.84435 9.85822 9.04218C9.72511 9.24002 9.34352 9.68603 9.22727 9.81851C9.11102 9.95099 8.99477 9.96689 8.79599 9.86797C8.59721 9.76905 7.95562 9.55974 7.19511 8.88497C6.6032 8.35947 6.20387 7.71121 6.08762 7.51249C5.97137 7.31377 6.0752 7.2069 6.17547 7.10798C6.2651 7.01967 6.37425 6.87659 6.47364 6.76089C6.57303 6.64519 6.60587 6.56305 6.67242 6.43057C6.73898 6.29809 6.70614 6.18239 6.65556 6.08348C6.60587 5.98368 6.20742 5.00863 6.04148 4.61207C5.88085 4.22788 5.71668 4.27911 5.59422 4.27381C5.46739 4.26874 5.34046 4.26639 5.21352 4.26674C5.11262 4.26951 5.01337 4.29289 4.92193 4.33544C4.83049 4.37798 4.74881 4.43877 4.68197 4.51404C4.49916 4.71276 3.98535 5.19145 3.98535 6.1665C3.98535 7.14155 4.69883 8.08392 4.79822 8.2164C4.89761 8.34888 6.2021 10.3493 8.19876 11.2078C8.67442 11.4118 9.04535 11.5337 9.33376 11.6255C9.8103 11.7766 10.2442 11.7545 10.5877 11.7041C10.9701 11.6476 11.7653 11.2254 11.9312 10.7626C12.0971 10.2999 12.0971 9.9033 12.0475 9.82028C11.9978 9.73726 11.8638 9.68692 11.6659 9.588Z"
                      fillRule="evenodd"
                      clipRule="evenodd"
                      fill="#086123"
                    />
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
                    width="17"
                    height="17"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4.50898 0.673273C4.29844 0.164679 3.74336 -0.106024 3.21289 0.0388978L0.806641 0.695148C0.330859 0.826398 0 1.25843 0 1.75062C0 8.51546 5.48516 14.0006 12.25 14.0006C12.7422 14.0006 13.1742 13.6698 13.3055 13.194L13.9617 10.7877C14.1066 10.2573 13.8359 9.70218 13.3273 9.49163L10.7023 8.39788C10.2566 8.21194 9.73984 8.34046 9.43633 8.71507L8.33164 10.0631C6.40664 9.15257 4.84805 7.59398 3.9375 5.66898L5.28555 4.56702C5.66016 4.26077 5.78867 3.74671 5.60273 3.30101L4.50898 0.676007V0.673273Z"
                      fill="#086123"
                    />
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
                <span>occassions.flowers@gmail.com</span>
              </a>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
