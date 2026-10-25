"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./contact.module.css";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

// Configurable contact details
export const CONTACT_CONFIG = {
  address: "Near CH Flyover, Kannur Road Calicut, Kerala, 673001",
  mapUrl: "https://maps.google.com/?q=Occasions+Florist+Near+CH+Flyover+Kannur+Road+Calicut+Kerala+673001",
  phone1: {
    display: "+91 8606646700",
    raw: "+918606646700",
    whatsappUrl: "https://wa.me/918606464700?text=Hello%20Occasions%20Florist,%20I%20would%20like%20to%20inquire%20about%20flowers.",
  },
  phone2: {
    display: "+91 9447446008",
    raw: "+919447446008",
  },
  email: {
    display: "occasions.flowers@gmail.com",
    referenceDisplay: "occassions.flowers@gmail.com",
    mailto: "mailto:occasions.flowers@gmail.com",
  },
  workingHours: [
    { day: "Monday — Saturday", hours: "09:00 AM — 6:30 PM" },
    { day: "Sunday", hours: "09:00 AM — 10:00 AM" },
  ],
  socials: {
    facebook: "https://facebook.com/occasionsfloristcalicut",
    instagram: "https://instagram.com/occasions_florist",
    whatsapp: "https://wa.me/918606464700",
  },
};

export default function ContactClient() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    message?: string;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validate = () => {
    const newErrors: { name?: string; email?: string; message?: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Please enter your name";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email address";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address (e.g. name@example.com)";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Please enter your message";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitSuccess(false);
    setSubmitError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          message: formData.message.trim(),
          subject: "Contact Form Inquiry from Website",
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitSuccess(true);
        setFormData({ name: "", email: "", message: "" });
        setErrors({});
      } else {
        setSubmitError(
          data.error || "Unable to send your message at this time. Please try calling us directly."
        );
      }
    } catch (err: any) {
      setSubmitError(
        "Network connection issue. Please verify your connection or reach us via WhatsApp."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <main className={styles.mainContent}>
        {/* ================= PAGE HEADER ================= */}
        <section className={styles.pageHeader} aria-labelledby="contact-heading">
          <h1 id="contact-heading" className={styles.pageTitle}>
            Connect with us
          </h1>
          <p className={styles.pageSubtitle}>
            Fill out the form below and our concierge will respond within 24 hours. For urgent matters, please use our priority phone line.
          </p>
        </section>

        {/* ================= MAIN CONTACT SECTION ================= */}
        <div className={styles.container}>
          <section className={styles.pinkContainer} aria-label="Contact Form and Business Information">
            {/* Left Column: Form */}
            <div className={styles.formColumn}>
              <form onSubmit={handleSubmit} noValidate className={styles.form}>
                {submitSuccess && (
                  <div className={styles.alertSuccess} role="alert">
                    <CheckCircle2 size={18} className={styles.alertIcon} />
                    <div>
                      <strong>Message received!</strong> Thank you for contacting Occasions.
                      Our team in Calicut will respond shortly.
                    </div>
                  </div>
                )}

                {submitError && (
                  <div className={styles.alertError} role="alert">
                    <AlertCircle size={18} className={styles.alertIcon} />
                    <div>{submitError}</div>
                  </div>
                )}

                <div className={styles.formRow}>
                  {/* Name field */}
                  <div className={styles.fieldGroup}>
                    <label htmlFor="contact-name" className={styles.fieldLabel}>
                      Name
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder=""
                      required
                      aria-required="true"
                      className={`${styles.pillInput} ${
                        errors.name ? styles.inputError : ""
                      }`}
                      disabled={isSubmitting}
                    />
                    {errors.name && (
                      <span className={styles.errorText} role="alert">
                        {errors.name}
                      </span>
                    )}
                  </div>

                  {/* Email field */}
                  <div className={styles.fieldGroup}>
                    <label htmlFor="contact-email" className={styles.fieldLabel}>
                      Email Address
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder=""
                      required
                      aria-required="true"
                      className={`${styles.pillInput} ${
                        errors.email ? styles.inputError : ""
                      }`}
                      disabled={isSubmitting}
                    />
                    {errors.email && (
                      <span className={styles.errorText} role="alert">
                        {errors.email}
                      </span>
                    )}
                  </div>
                </div>

                {/* Message field */}
                <div className={styles.fieldGroup}>
                  <label htmlFor="contact-message" className={styles.fieldLabel}>
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="HOW MAY WE ASSIST YOU?"
                    required
                    aria-required="true"
                    rows={6}
                    className={`${styles.messageTextarea} ${
                      errors.message ? styles.inputError : ""
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.message && (
                    <span className={styles.errorText} role="alert">
                      {errors.message}
                    </span>
                  )}
                </div>

                {/* Submit button */}
                <div className={styles.submitRow}>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={styles.sendButton}
                    aria-label="Send Message"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className={styles.spinner} />
                        <span>SENDING...</span>
                      </>
                    ) : (
                      <>
                        <span>SEND MESSAGE</span>
                        <span className={styles.arrowIcon}>→</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Sweet Moments Section with Social Media Icons */}
              <div className={styles.sharedSection}>
                <h2 className={styles.sharedTitle}>Sweet Moments, Shared Together</h2>
                <div className={styles.socialRow} aria-label="Social Media Links">
                  {/* Facebook */}
                  <a
                    href={CONTACT_CONFIG.socials.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialBtn}
                    aria-label="Visit Occasions on Facebook"
                    title="Facebook"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  </a>

                  {/* Instagram */}
                  <a
                    href={CONTACT_CONFIG.socials.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialBtn}
                    aria-label="Visit Occasions on Instagram"
                    title="Instagram"
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
                      aria-hidden="true"
                    >
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                  </a>

                  {/* WhatsApp */}
                  <a
                    href={CONTACT_CONFIG.socials.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialBtn}
                    aria-label="Chat with Occasions on WhatsApp"
                    title="WhatsApp"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 20.15C10.57 20.15 9.12 19.75 7.85 19L7.55 18.82L4.43 19.64L5.26 16.6L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.68 12.04 3.68C14.25 3.68 16.31 4.54 17.87 6.1C19.42 7.66 20.28 9.72 20.28 11.92C20.28 16.46 16.59 20.15 12.05 20.15Z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Contact Information Card */}
            <aside className={styles.infoCard} aria-label="Store Information">
              {/* Location */}
              <div className={styles.locationGroup}>
                <div className={styles.pinIconWrap} aria-hidden="true">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div className={styles.locationContent}>
                  <p className={styles.locationText}>{CONTACT_CONFIG.address}</p>
                  <a
                    href={CONTACT_CONFIG.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.viewMapLink}
                  >
                    View on map
                  </a>
                </div>
              </div>

              {/* Let's Connect */}
              <div className={styles.connectGroup}>
                <h3 className={styles.cardSectionHeading}>Let's Connect</h3>
                <div className={styles.connectList}>
                  {/* WhatsApp Line */}
                  <a
                    href={CONTACT_CONFIG.phone1.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.connectItem}
                    aria-label={`Chat with ${CONTACT_CONFIG.phone1.display} on WhatsApp`}
                  >
                    <span className={styles.connectIcon} aria-hidden="true">
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="#16a34a"
                      >
                        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 20.15C10.57 20.15 9.12 19.75 7.85 19L7.55 18.82L4.43 19.64L5.26 16.6L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.68 12.04 3.68C14.25 3.68 16.31 4.54 17.87 6.1C19.42 7.66 20.28 9.72 20.28 11.92C20.28 16.46 16.59 20.15 12.05 20.15Z" />
                      </svg>
                    </span>
                    <span>{CONTACT_CONFIG.phone1.display}</span>
                  </a>

                  {/* Alternate Phone */}
                  <a
                    href={`tel:${CONTACT_CONFIG.phone2.raw}`}
                    className={styles.connectItem}
                    aria-label={`Call ${CONTACT_CONFIG.phone2.display}`}
                  >
                    <span className={styles.connectIcon} aria-hidden="true">
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#16a34a"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </span>
                    <span>{CONTACT_CONFIG.phone2.display}</span>
                  </a>

                  {/* Email */}
                  <a
                    href={CONTACT_CONFIG.email.mailto}
                    className={styles.connectItem}
                    aria-label={`Email ${CONTACT_CONFIG.email.display}`}
                  >
                    <span className={styles.connectIcon} aria-hidden="true">
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#16a34a"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </span>
                    <span className={styles.emailText}>
                      {CONTACT_CONFIG.email.referenceDisplay}
                    </span>
                  </a>
                </div>
              </div>

              {/* Working Hours */}
              <div className={styles.hoursGroup}>
                <h3 className={styles.cardSectionHeading}>Working Hours</h3>
                <div className={styles.hoursList}>
                  {CONTACT_CONFIG.workingHours.map((item, index) => (
                    <div key={index} className={styles.hoursRow}>
                      <span className={styles.hoursDay}>{item.day}</span>
                      <span className={styles.hoursTime}>{item.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
