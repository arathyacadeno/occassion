import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "../privacy-policy/privacy.module.css";

export const metadata: Metadata = {
  title: "Terms of Service | Occasions Premier Florist & Event Decor, Calicut",
  description:
    "Review the Terms of Service for Occasions - Do it with flowers, Calicut. Ordering, fresh flower availability, delivery timelines, payment, and refund policies.",
  openGraph: {
    title: "Terms of Service | Occasions Florist, Calicut",
    description:
      "Terms of Service governing online purchases, fresh flower bouquets, delivery, and services in Calicut.",
  },
};

export default function TermsOfServicePage() {
  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <main className={styles.mainContent}>
        {/* ================= PAGE HEADER ================= */}
        <header className={styles.headerSection}>
          <h1 className={styles.pageTitle}>Terms of Service</h1>
        </header>

        {/* ================= TERMS DOCUMENT ================= */}
        <div className={styles.contentContainer}>
          {/* Section 1 */}
          <section className={styles.policySection} aria-labelledby="section-1">
            <h2 id="section-1" className={styles.sectionHeading}>
              1. Acceptance of Terms
            </h2>
            <p className={styles.paragraph}>
              Welcome to Occassions (&ldquo;Occasions - Do it with flowers&rdquo;). By accessing or using our
              website, mobile platform, or purchasing fresh floral arrangements, cakes, hampers, or event decor services,
              you agree to be bound by these Terms of Service and our Privacy Policy.
            </p>
            <p className={styles.paragraph}>
              If you do not agree to all terms and conditions outlined herein, please refrain from using our website or ordering services.
            </p>
          </section>

          {/* Section 2 */}
          <section className={styles.policySection} aria-labelledby="section-2">
            <h2 id="section-2" className={styles.sectionHeading}>
              2. Products, Seasonality &amp; Substitutions
            </h2>
            <p className={styles.paragraph}>
              Fresh flowers are perishable and subject to seasonal and market availability across Kozhikode (Calicut) and our grower network:
            </p>
            <ul className={styles.bulletList}>
              <li className={styles.bulletItem}>
                <strong>Artisanal Craftsmanship:</strong> Every bouquet, basket, garland, and table arrangement is individually handcrafted by experienced florists. Slight natural variations in bloom shade, size, and wrap style occur naturally.
              </li>
              <li className={styles.bulletItem}>
                <strong>Substitutions:</strong> In the rare event that a specific flower or foliage variety is unavailable due to seasonality or climate conditions, our florists reserve the right to substitute with blooms of equal or higher value, maintaining the overall color palette and aesthetics of the selected design.
              </li>
              <li className={styles.bulletItem}>
                <strong>Cakes &amp; Add-ons:</strong> Cake designs, flavors, and decorative garnishes are freshly prepared. Perishable add-ons should be refrigerated upon receipt.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className={styles.policySection} aria-labelledby="section-3">
            <h2 id="section-3" className={styles.sectionHeading}>
              3. Delivery Logistics &amp; Time Slots
            </h2>
            <p className={styles.paragraph}>
              We proudly provide same-day, express, and scheduled delivery across Kozhikode (Calicut) within our designated delivery zones:
            </p>
            <ul className={styles.bulletList}>
              <li className={styles.bulletItem}>
                <strong>Delivery Addresses:</strong> Customers are responsible for providing complete and accurate recipient details, landmark references, and valid contact telephone numbers.
              </li>
              <li className={styles.bulletItem}>
                <strong>Time Slots:</strong> We make every reasonable effort to deliver within your selected delivery window. However, peak festive seasons, severe weather, or unforeseen traffic conditions in Calicut may occasionally affect transit times.
              </li>
              <li className={styles.bulletItem}>
                <strong>Recipient Unavailability:</strong> If the recipient is unavailable at the delivery address, our courier will attempt to contact the sender/recipient to leave the floral package with security, neighbors, or arrange an immediate handoff.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className={styles.policySection} aria-labelledby="section-4">
            <h2 id="section-4" className={styles.sectionHeading}>
              4. Pricing, Payments &amp; Taxes
            </h2>
            <p className={styles.paragraph}>
              All prices displayed on the Occassions website are in Indian National Rupees (₹) and include applicable taxes unless specifically stated otherwise.
            </p>
            <ul className={styles.bulletList}>
              <li className={styles.bulletItem}>
                Payment can be completed securely via UPI (Google Pay, PhonePe, Paytm), credit/debit cards, Net Banking, or Cash on Delivery where applicable.
              </li>
              <li className={styles.bulletItem}>
                Orders will be confirmed and scheduled for floral crafting once payment authorization is received or COD is verified.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className={styles.policySection} aria-labelledby="section-5">
            <h2 id="section-5" className={styles.sectionHeading}>
              5. Cancellation, Replacement &amp; Refunds
            </h2>
            <p className={styles.paragraph}>
              Due to the perishable nature of freshly cut flowers and custom-baked cakes, special cancellation guidelines apply:
            </p>
            <ul className={styles.bulletList}>
              <li className={styles.bulletItem}>
                <strong>Order Cancellation:</strong> Cancellations must be communicated at least 4 hours before the scheduled delivery slot. Once floral crafting has begun or the courier is dispatched, orders cannot be cancelled.
              </li>
              <li className={styles.bulletItem}>
                <strong>Quality Assurance:</strong> If your flowers or arrangement arrive damaged, please notify our boutique support team within 3 hours of delivery with photographic evidence. Valid claims will be promptly compensated with an immediate replacement or full refund.
              </li>
              <li className={styles.bulletItem}>
                <strong>Refund Processing:</strong> Approved refunds will be processed to the original payment source within 3 to 5 business days.
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className={styles.policySection} aria-labelledby="section-6">
            <h2 id="section-6" className={styles.sectionHeading}>
              6. Contact &amp; Boutique Inquiries
            </h2>
            <p className={styles.paragraph}>
              For questions regarding our terms, custom floral commissions, or event decor consultations, contact us directly:
            </p>
            <p className={styles.paragraph}>
              <strong>Occassions - Do it with flowers</strong><br />
              Near Y.M.C.A. Junction, Opp. HDFC Bank, Kannur Road, Calicut - 673001, Kerala, India<br />
              Phone / WhatsApp: <a href="https://wa.me/918606464700" target="_blank" rel="noopener noreferrer" style={{ color: "#db2777", fontWeight: 600 }}>+91 8606 464 700</a><br />
              Email: <a href="mailto:occassions.flowers@gmail.com" style={{ color: "#db2777", fontWeight: 600 }}>occassions.flowers@gmail.com</a>
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

