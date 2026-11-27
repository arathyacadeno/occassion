import type { Metadata } from "next";
import ServiceShowcaseView from "@/components/ServiceShowcaseView";
import { SITE_URL, getBreadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Wedding Car Decoration in Calicut | Occasions",
  description:
    "Wedding car decoration in Calicut. Bridal car decoration in Calicut, flower car decoration in Kozhikode & marriage car styling at best prices by Occasions.",
  keywords: [
    "wedding car decoration in Calicut",
    "flower car decoration Kozhikode",
    "bridal car decoration Calicut",
    "car decoration for marriage Kerala",
    "wedding car flower decoration",
    "wedding car decoration price in Calicut",
    "groom car decoration Kozhikode",
    "Occasions Calicut",
  ],
  alternates: {
    canonical: `${SITE_URL}/car-decoration`,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: `${SITE_URL}/car-decoration`,
    siteName: "Occasions Calicut",
    title: "Wedding Car Decoration in Calicut | Occasions",
    description:
      "Wedding car decoration in Calicut. Bridal car decoration in Calicut, flower car decoration in Kozhikode & marriage car styling at affordable prices by Occasions.",
    images: [
      {
        url: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647418/occasions/products/general/highlight-car-decorations.jpg",
        width: 1200,
        height: 630,
        alt: "Wedding car decoration in Calicut - Occasions luxury bridal car flower decorations",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wedding Car Decoration in Calicut | Occasions",
    description:
      "Wedding car decoration in Calicut. Bridal car decoration in Calicut, flower car decoration in Kozhikode & marriage car styling by Occasions.",
    images: [
      "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647418/occasions/products/general/highlight-car-decorations.jpg",
    ],
  },
};

export default function CarDecorationPage() {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Wedding Car Decoration", url: "/car-decoration" },
  ];
  const breadcrumbJsonLd = getBreadcrumbSchema(breadcrumbs);

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Wedding Car Decoration",
    name: "Wedding Car Decoration in Calicut",
    description:
      "Professional wedding car decoration in Calicut, bridal car decoration, and groom car floral arrangements across Kozhikode and Kerala.",
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
      price: "1800",
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
        slug="car-decoration"
        title="Wedding Car Decoration"
        badge="VIP Floristry"
        subtitle="Transform your wedding arrival with bespoke scratch-proof floral bonnets, door posies, and satin ribbons crafted with imported orchids and roses."
        description="Transform your wedding arrival into an unforgettable spectacle with bespoke scratch-proof floral bonnets, door handle posies, and satin ribbons crafted with imported orchids and roses."
        coverImage="https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647418/occasions/products/general/highlight-car-decorations.jpg"
        startingPrice={1800}
        features={[
          "Scratch-Proof Magnetic & Suction Mounting",
          "Imported Dutch Roses & Cymbidium Orchids",
          "Matching Door Handle Posies & Satin Ribbons",
          "On-Site Setup Anywhere Across Calicut & Kozhikode",
        ]}
        gallery={[
          {
            image_url: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647418/occasions/products/general/highlight-car-decorations.jpg",
            title: "Classic Bridal Bonnet Floral Cluster",
            alt_text: "Bridal car decoration Calicut with fresh roses and orchids",
          },
          {
            image_url: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647424/occasions/products/stage-decor/stage-decor-7.jpg",
            title: "Romantic Satin & Orchid Ribboning",
            alt_text: "Wedding car flower decoration in Kozhikode Kerala",
          },
        ]}
        whatsappText="Hello Occasions Florist Calicut, I would like to inquire about wedding car decoration in Calicut."
        seoH1="Wedding Car Decoration in Calicut"
        seoH2="Premium Bridal & Groom Car Flower Decoration in Kozhikode"
        seoContent={[
          "Make your wedding arrival grand and unforgettable with bespoke wedding car decoration in Calicut by Occasions. Whether you are looking for classic red rose bonnets, elegant imported white orchid cascades, or delicate satin ribbon trails, our floral artists handcraft each design with fresh premium blooms.",
          "We use certified scratch-proof suction mounts and magnetic bases that protect your vehicle's paintwork while ensuring the floral arrangement stays intact throughout your celebration drive across Calicut and Kerala.",
          "Our wedding car decoration price in Calicut starts from an affordable ₹1,800, with customized groom car decoration and bridal car packages available on-site at your home or wedding venue in Kozhikode.",
        ]}
        breadcrumbs={breadcrumbs}
      />
    </>
  );
}
