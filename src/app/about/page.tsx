import { Metadata } from "next";
import AboutClient from "./AboutClient";
import { SITE_URL, getBreadcrumbSchema, getLocalBusinessSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "About Occasions Calicut | Florist & Decorators",
  description:
    "Learn about Occasions Calicut. Premier florist and event decorators in Calicut & top flower shop in Kozhikode offering artisanal floral designs, cakes & decor.",
  keywords: [
    "Occasions Calicut",
    "flower shop in Kozhikode",
    "florist and event decorators Calicut",
    "about Occasions",
    "Occasions flower and cake shop Calicut",
    "flower shop Calicut",
  ],
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: `${SITE_URL}/about`,
    siteName: "Occasions Calicut",
    title: "About Occasions Calicut | Florist & Decorators",
    description:
      "Learn about Occasions Calicut. Premier florist and event decorators in Calicut & top flower shop in Kozhikode offering artisanal floral designs, cakes & decor.",
    images: [
      {
        url: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647444/occasions/branding/uploads-pink-rose-bud-logo-icon.png",
        width: 1200,
        height: 630,
        alt: "About Occasions Calicut - Premier florist and event decorators in Calicut",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Occasions Calicut | Florist & Decorators",
    description:
      "Learn about Occasions Calicut. Florist and event decorators in Calicut & flower shop in Kozhikode.",
    images: [
      "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647444/occasions/branding/uploads-pink-rose-bud-logo-icon.png",
    ],
  },
};

export default function AboutPage() {
  const breadcrumbJsonLd = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "About Us", url: "/about" },
  ]);
  const organizationJsonLd = getLocalBusinessSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <AboutClient />
    </>
  );
}
