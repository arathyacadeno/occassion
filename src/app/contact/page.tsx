import { Metadata } from "next";
import ContactClient from "./ContactClient";
import { SITE_URL, getBreadcrumbSchema, getLocalBusinessSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Flower Shop Contact Calicut | Occasions Florist",
  description:
    "Flower shop contact Calicut. Visit Occasions flower shop near me in Calicut, get our Kozhikode shop address, send decoration enquiry or WhatsApp order flowers.",
  keywords: [
    "Flower Shop Contact Calicut",
    "flower shop near me Calicut",
    "address Kozhikode flower shop",
    "decoration enquiry Calicut",
    "WhatsApp order flowers Calicut",
    "Occasions Calicut",
  ],
  alternates: {
    canonical: `${SITE_URL}/contact`,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: `${SITE_URL}/contact`,
    siteName: "Occasions Calicut",
    title: "Flower Shop Contact Calicut | Occasions Florist",
    description:
      "Flower shop contact Calicut. Visit Occasions flower shop near me in Calicut, get our Kozhikode shop address, send decoration enquiry or WhatsApp order flowers.",
    images: [
      {
        url: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647444/occasions/branding/uploads-pink-rose-bud-logo-icon.png",
        width: 1200,
        height: 630,
        alt: "Contact Occasions Calicut - Flower shop address, phone, and WhatsApp in Calicut",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Flower Shop Contact Calicut | Occasions Florist",
    description:
      "Flower shop contact Calicut. Visit Occasions flower shop near me in Calicut, get Kozhikode shop address & WhatsApp flowers.",
    images: [
      "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647444/occasions/branding/uploads-pink-rose-bud-logo-icon.png",
    ],
  },
};

export default function ContactPage() {
  const breadcrumbJsonLd = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Contact Us", url: "/contact" },
  ]);
  const localBusinessJsonLd = getLocalBusinessSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <ContactClient />
    </>
  );
}
