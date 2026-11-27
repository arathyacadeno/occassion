import type { Metadata } from "next";
import ServiceShowcaseView from "@/components/ServiceShowcaseView";
import { SITE_URL, getBreadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Church Decoration in Calicut | Occasions Decor",
  description:
    "Sacred church decoration in Calicut. Church wedding decoration in Kozhikode, altar flower decoration & christening decor by expert church decorators in Kerala.",
  keywords: [
    "church decoration in Calicut",
    "church wedding decoration Kozhikode",
    "church flower decoration Calicut",
    "christening church decoration",
    "church decorators in Kerala",
    "Christmas church decoration Calicut",
    "Occasions Calicut",
  ],
  alternates: {
    canonical: `${SITE_URL}/church-decoration`,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: `${SITE_URL}/church-decoration`,
    siteName: "Occasions Calicut",
    title: "Church Decoration in Calicut | Occasions Decor",
    description:
      "Sacred church decoration in Calicut. Church wedding decoration in Kozhikode, altar flower decoration & christening decor by expert church decorators in Kerala.",
    images: [
      {
        url: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647418/occasions/products/general/highlight-church-arrangements.jpg",
        width: 1200,
        height: 630,
        alt: "Church decoration in Calicut - Cathedral altar arches and aisle pew flowers by Occasions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Church Decoration in Calicut | Occasions Decor",
    description:
      "Church decoration in Calicut. Church wedding decoration in Kozhikode, altar florals & christening decor by Occasions.",
    images: [
      "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647418/occasions/products/general/highlight-church-arrangements.jpg",
    ],
  },
};

export default function ChurchDecorationPage() {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Church Decoration", url: "/church-decoration" },
  ];
  const breadcrumbJsonLd = getBreadcrumbSchema(breadcrumbs);

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Church Decoration",
    name: "Church Decoration in Calicut",
    description:
      "Sacred church wedding decoration in Calicut, altar arch floral arrangements, aisle pew decorations, and christening decor in Kozhikode Kerala.",
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
      price: "16500",
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
        slug="church-decoration"
        title="Church Decoration"
        badge="Ceremony"
        subtitle="Create a sacred, heavenly atmosphere for your wedding ceremony with grand cathedral altar arches, romantic candlelit pew decorations, and cascading aisle runners."
        description="Create a sacred, heavenly atmosphere for your wedding ceremony with grand cathedral altar arches, romantic candlelit pew decorations, and cascading aisle runners."
        coverImage="https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647418/occasions/products/general/highlight-church-arrangements.jpg"
        startingPrice={16500}
        features={[
          "Grand Cathedral Altar Floral Arch",
          "Romantic Candlelit Pew Posies & Runners",
          "Casablanca Lilies, Orchids & Hydrangeas",
          "Parish Protocol Coordination Across Kerala",
        ]}
        gallery={[
          {
            image_url: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647418/occasions/products/general/highlight-church-arrangements.jpg",
            title: "Cathedral Altar Arch with Lilies and Roses",
            alt_text: "Church flower decoration Calicut altar arches",
          },
          {
            image_url: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647424/occasions/products/stage-decor/stage-decor-7.jpg",
            title: "Church Aisle Pew Decoration",
            alt_text: "Church wedding decoration Kozhikode pew florals",
          },
        ]}
        whatsappText="Hello Occasions Florist Calicut, I would like to inquire about church decoration in Calicut."
        seoH1="Church Decoration in Calicut"
        seoH2="Sacred Church Wedding Decoration & Altar Flowers in Kozhikode"
        seoContent={[
          "Occasions Calicut crafts dignified, sacred church decoration in Calicut for holy matrimony, christenings, and Christmas celebrations. Our master florists specialize in cathedral altar arches, candlelit pew posies, and aisle floral cascades that honor sacred traditions.",
          "We work closely with church decorators in Kerala and parish coordinators to ensure all floral setups strictly adhere to cathedral guidelines while creating a breathtaking, divine ambiance for your wedding ceremony.",
          "From classic white Casablanca lilies and gypsophila to soft pink roses and fragrant orchids, our church flower decoration in Calicut brings serene beauty to churches across Kozhikode and North Kerala.",
        ]}
        breadcrumbs={breadcrumbs}
      />
    </>
  );
}
