"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./faq.module.css";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "place-order",
    question: "How can I place an order on Occasion?",
    answer:
      "Simply browse our collection of cakes, flowers, and gifts, select your desired items, and add them to your cart. Proceed to checkout, provide the delivery details, and complete your payment to place the order.",
  },
  {
    id: "same-day-delivery",
    question: "Do you offer same-day cake and flower delivery?",
    answer:
      "Yes, same-day delivery may be available for selected products and delivery locations. Availability depends on the product, order time, and delivery area. Please check the delivery options at checkout before placing your order.",
  },
  {
    id: "customization",
    question: "Can I customize cakes, flowers, and gifts?",
    answer:
      "We offer customization options for selected products, including cake messages, flower arrangements, and personalized gifts. Available options may vary by product. Check the product page or contact our support team for assistance.",
  },
  {
    id: "scheduled-delivery",
    question: "Can I schedule delivery for a specific date?",
    answer:
      "Yes, you may select a preferred delivery date from the available options during checkout. Delivery slots depend on the product, location, and availability. We recommend placing your order in advance for birthdays, anniversaries, and other special occasions.",
  },
  {
    id: "payment-methods",
    question: "How can I track my order?",
    answer:
      "Once your order is confirmed, you can use the tracking link or order-tracking section on our website, if available, to check its status. You may also contact our customer support team with your order number for assistance.",
  },
  {
    id: "delivery-coverage",
    question: "What payment methods do you accept?",
    answer:
      "You can pay using the payment methods displayed at checkout, which may include UPI, credit cards, debit cards, net banking, and other supported payment options. Your order will be processed according to the payment confirmation status.",
  },
  {
    id: "flower-freshness",
    question: "Can I cancel or modify my order?",
    answer:
      "Cancellation or modification requests depend on the order status and product preparation stage. Since cakes, flowers, and personalized gifts may be prepared specifically for your order, some requests may not be possible once preparation or dispatch has begun. Please contact our support team as soon as possible.",
  },
  {
    id: "greeting-cards",
    question: "What happens if my order arrives damaged or incorrect?",
    answer:
      "We are committed to providing a pleasant gifting experience. If your order arrives damaged, incorrect, or significantly different from what you ordered, please contact our customer support team promptly with your order number and clear photographs of the issue. We will review the request and explain the available resolution according to our policy.",
  },
];

export default function FaqClient() {
  // Cards 0, 2, and 3 open initially matching the reference design
  const [openItems, setOpenItems] = useState<number[]>([0, 2, 3]);

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          {/* Header Title */}
          <h1 className={styles.pageTitle}>Frequently Asked Questions</h1>

          {/* FAQ Accordion List */}
          <div className={styles.faqList} role="region" aria-label="FAQ Accordion">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openItems.includes(index);
              return (
                <div
                  key={item.id}
                  className={`${styles.faqCard} ${isOpen ? styles.faqCardOpen : ""}`}
                >
                  <button
                    type="button"
                    className={styles.faqQuestionBtn}
                    onClick={() => toggleItem(index)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${item.id}`}
                  >
                    <span className={styles.questionText}>{item.question}</span>
                    <span
                      className={`${styles.iconPill} ${isOpen ? styles.iconPillOpen : ""}`}
                      aria-hidden="true"
                    >
                      {isOpen ? (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          stroke="#ffffff"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                        >
                          <line x1="2" y1="6" x2="10" y2="6" />
                        </svg>
                      ) : (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          stroke="#ffffff"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                        >
                          <line x1="6" y1="2" x2="6" y2="10" />
                          <line x1="2" y1="6" x2="10" y2="6" />
                        </svg>
                      )}
                    </span>
                  </button>

                  {isOpen && (
                    <>
                      <div className={styles.divider} aria-hidden="true" />
                      <div
                        id={`faq-answer-${item.id}`}
                        className={styles.answerWrapper}
                        role="region"
                      >
                        <p className={styles.answerText}>{item.answer}</p>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Need More Help CTA */}
          <div className={styles.supportBox}>
            <h2 className={styles.supportTitle}>Still have questions?</h2>
            <p className={styles.supportDesc}>
              Can&apos;t find the answer you&apos;re looking for? Chat with our friendly team on WhatsApp or drop us a message.
            </p>
            <div className={styles.supportActions}>
              <a
                href="https://wa.me/918606464700?text=Hello%20Occasions,%20I%20have%20a%20question%20about%20my%20order."
                target="_blank"
                rel="noopener noreferrer"
                className={styles.whatsappBtn}
              >
                Chat on WhatsApp
              </a>
              <Link href="/contact" className={styles.contactBtn}>
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
