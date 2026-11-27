import type { Metadata } from "next";
import ServiceShowcaseView from "@/components/ServiceShowcaseView";
import { SITE_URL, getBreadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Wedding Garlands in Calicut | Occasions Florist",
  description:
    "Fresh wedding garlands in Calicut. Handcrafted rose garland in Calicut, jasmine & bridal garland online in Kozhikode at transparent prices by Occasions Calicut.",
  keywords: [
    "wedding garlands in Calicut",
    "flower garland Kozhikode",
    "rose garland Calicut",
    "bridal garland online",
    "welcome garland Calicut",
    "jasmine garland Calicut",
    "Garlands price in calicut",
    "Occasions Calicut",
  ],
  alternates: {
    canonical: `${SITE_URL}/garlands`,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: `${SITE_URL}/garlands`,
    siteName: "Occasions Calicut",
    title: "Wedding Garlands in Calicut | Occasions Florist",
    description:
      "Fresh wedding garlands in Calicut. Handcrafted rose garland in Calicut, jasmine & bridal garland online in Kozhikode at transparent prices by Occasions Calicut.",
    images: [
      {
        url: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647414/occasions/products/garlands/garlands-1.webp",
        width: 1200,
        height: 630,
        alt: "Wedding garlands in Calicut - Handcrafted fresh jasmine and Dutch rose bridal garlands by Occasions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wedding Garlands in Calicut | Occasions Florist",
    description:
      "Fresh wedding garlands in Calicut. Handcrafted rose garland, jasmine & bridal garlands in Kozhikode by Occasions.",
    images: [
      "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647414/occasions/products/garlands/garlands-1.webp",
    ],
  },
};

export default function GarlandsPage() {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Wedding Garlands", url: "/garlands" },
  ];
  const breadcrumbJsonLd = getBreadcrumbSchema(breadcrumbs);

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Wedding Garlands",
    name: "Wedding Garlands in Calicut",
    description:
      "Handcrafted wedding garlands in Calicut, bridal varmala online, fragrant jasmine garlands, and welcome garlands in Kozhikode Kerala.",
    provider: {
      "@type": "LocalBusiness",
      name: "Occasions Calicut",
      url: SITE_URL,
    },
    areaServed: {
      "@type": "City",
      name: "Calicut",
    },
    offers: {
      "@type": "Offer",
      price: "2500",
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <ServiceShowcaseView
        slug="garlands"
        title="Wedding Garlands"
        badge="Tradition"
        subtitle="Handcrafted traditional and contemporary bridal garlands, reception varmalas, and welcome garlands meticulously strung with fresh fragrant jasmine, lotus buds, and Dutch roses."
        description="Handcrafted traditional and contemporary bridal garlands, reception varmalas, and auspicious gift flower baskets meticulously strung with fresh fragrant jasmine, lotus buds, and Dutch roses."
        coverImage="https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647414/occasions/products/garlands/garlands-1.webp"
        startingPrice={2500}
        features={[
          "Fresh Fragrant Madurai Jasmine & Lotus Buds",
          "Velvet Dutch Rose Petal Varmalas",
          "Lightweight Feather-Soft Threading for Comfort",
          "Custom Color Palette Matching Bridal Outfits",
        ]}
        gallery={[
          {
            image_url: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647414/occasions/products/garlands/garlands-1.webp",
            title: "Traditional Jasmine & Dutch Rose Petal Varmala",
            alt_text: "Rose garland Calicut for weddings and receptions",
          },
          {
            image_url: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647414/occasions/products/garlands/garlands-2.webp",
            title: "Pastel Lotus & Gypsophila Bridal Garland",
            alt_text: "Bridal garland online Kozhikode Kerala",
          },
        ]}
        whatsappText="Hello Occasions Florist Calicut, I would like to inquire about wedding garlands in Calicut."
        seoH1="Wedding Garlands in Calicut"
        seoH2="Artisanal Rose & Jasmine Bridal Garlands in Kozhikode"
        seoContent={[
          "Celebrate your sacred wedding vows with handcrafted wedding garlands in Calicut by Occasions. Our master garland stringers weave fresh fragrant Madurai jasmine, exotic lotus blossoms, orchids, and velvety Dutch rose petals into lightweight, breathtaking varmalas.",
          "Looking for transparent garlands price in Calicut? Our bridal garland pairs start from ₹2,500, offering both traditional South Indian kalyana maalai designs and contemporary pastel rose-petal collections customized to complement your bridal lehenga or silk saree.",
          "We also craft welcome garlands in Calicut for VIP inaugurations, guest receptions, and felicitation ceremonies, delivered fresh across Kozhikode on the morning of your event.",
        ]}
        breadcrumbs={breadcrumbs}
      />
    </>
  );
}
