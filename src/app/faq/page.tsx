import { Metadata } from "next";
import FaqClient from "./FaqClient";
import { SITE_URL, getBreadcrumbSchema, getFaqSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "FAQ - Gift Delivery in Calicut | Occasions",
  description:
    "Questions on same day gift delivery in Calicut? Find answers on flower and cake delivery in Calicut, custom gifting & delivery timings from Occasions Calicut.",
  keywords: [
    "same day gift delivery in Calicut",
    "flower and cake delivery Calicut",
    "gift delivery Kozhikode",
    "online florist FAQ Calicut",
    "Occasions Calicut FAQ",
  ],
  alternates: {
    canonical: `${SITE_URL}/faq`,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: `${SITE_URL}/faq`,
    siteName: "Occasions Calicut",
    title: "FAQ - Gift Delivery in Calicut | Occasions",
    description:
      "Questions on same day gift delivery in Calicut? Find answers on flower and cake delivery in Calicut, custom gifting & delivery timings from Occasions Calicut.",
    images: [
      {
        url: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647444/occasions/branding/uploads-pink-rose-bud-logo-icon.png",
        width: 1200,
        height: 630,
        alt: "Frequently Asked Questions - Occasions same day gift delivery in Calicut",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ - Gift Delivery in Calicut | Occasions",
    description:
      "Questions on same day gift delivery in Calicut? Answers on flower and cake delivery in Calicut & gifting from Occasions.",
    images: [
      "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647444/occasions/branding/uploads-pink-rose-bud-logo-icon.png",
    ],
  },
};

const FAQ_DATA = [
  {
    question: "Do you offer same day gift delivery in Calicut?",
    answer:
      "Yes, Occasions offers prompt same day gift delivery, fresh flower delivery, and cake delivery across Calicut (Kozhikode). Place your order before cutoff time for guaranteed same-day arrival.",
  },
  {
    question: "Can I customize flower bouquets, cakes, and gifts?",
    answer:
      "Yes, we provide bespoke customization for floral arrangements, personalized message ribbons, photo cakes, and gift hampers. Contact our floral concierge via WhatsApp (+91 86064 64700) for custom orders.",
  },
  {
    question: "Can I schedule delivery for a specific date and time?",
    answer:
      "Yes, you can choose your preferred date and time slot during checkout for birthdays, wedding anniversaries, midnight surprises, and festival celebrations.",
  },
  {
    question: "What payment methods are accepted at Occasions?",
    answer:
      "We accept all major payment methods including Google Pay, PhonePe, Paytm, UPI QR, Credit Cards, Debit Cards, Net Banking, and Razorpay secure checkout.",
  },
  {
    question: "Do you provide event decoration services in Calicut?",
    answer:
      "Yes, Occasions Calicut specializes in wedding car decorations, church wedding florals, traditional and modern stage decorations, and fresh flower garlands.",
  },
];

export default function FaqPage() {
  const breadcrumbJsonLd = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "FAQ", url: "/faq" },
  ]);
  const faqJsonLd = getFaqSchema(FAQ_DATA);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <FaqClient />
    </>
  );
}
