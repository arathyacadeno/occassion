import type { Metadata } from "next";
import ServiceShowcaseView from "@/components/ServiceShowcaseView";
import { SITE_URL, getBreadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Stage Decoration in Calicut | Occasions Events",
  description:
    "Spectacular stage decoration in Calicut. Wedding stage decoration in Kozhikode, reception stage decor & floral stage styling by top event decorators in Calicut.",
  keywords: [
    "stage decoration in Calicut",
    "wedding stage decoration Kozhikode",
    "reception stage decoration Calicut",
    "engagement stage decoration",
    "Floral stage Decor",
    "event decorators Calicut",
    "Occasions Calicut",
  ],
  alternates: {
    canonical: `${SITE_URL}/stage-decoration`,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: `${SITE_URL}/stage-decoration`,
    siteName: "Occasions Calicut",
    title: "Stage Decoration in Calicut | Occasions Events",
    description:
      "Spectacular stage decoration in Calicut. Wedding stage decoration in Kozhikode, reception stage decor & floral stage styling by top event decorators in Calicut.",
    images: [
      {
        url: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647424/occasions/products/stage-decor/stage-decor-7.jpg",
        width: 1200,
        height: 630,
        alt: "Stage decoration in Calicut - Luxury wedding and reception floral backdrops by Occasions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stage Decoration in Calicut | Occasions Events",
    description:
      "Stage decoration in Calicut. Wedding stage decoration in Kozhikode, reception stage decor & floral stage styling by Occasions.",
    images: [
      "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647424/occasions/products/stage-decor/stage-decor-7.jpg",
    ],
  },
};

export default function StageDecorationPage() {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Stage Decoration", url: "/stage-decoration" },
  ];
  const breadcrumbJsonLd = getBreadcrumbSchema(breadcrumbs);

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Stage Decoration",
    name: "Stage Decoration in Calicut",
    description:
      "Opulent wedding stage decoration in Calicut, reception stage decor, engagement floral backdrops, and event decor styling across Kozhikode Kerala.",
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
      price: "18000",
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
        slug="stage-decoration"
        title="Stage Decoration"
        badge="Celebration"
        subtitle="Elevate your stage and banquet reception with opulent floral backdrops, elevated crystal centerpieces, blush roses, cascading hydrangeas, and glowing candlelight ambiance."
        description="Elevate your stage and banquet reception with opulent floral backdrops, elevated crystal centerpieces, blush roses, cascading hydrangeas, and glowing candlelight ambiance."
        coverImage="https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647424/occasions/products/stage-decor/stage-decor-7.jpg"
        startingPrice={18000}
        features={[
          "Lush Fresh Floral Backdrops & Cascading Hydrangeas",
          "Elevated Crystal Centerpieces & Candlelight Ambiance",
          "Custom Head Table & Couple Seating Florals",
          "Complete Concept Styling by Leading Event Decorators in Calicut",
        ]}
        gallery={[
          {
            image_url: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647424/occasions/products/stage-decor/stage-decor-7.jpg",
            title: "Royal Grand Stage Floral Backdrop",
            alt_text: "Wedding stage decoration Kozhikode with fresh roses",
          },
          {
            image_url: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647424/occasions/products/stage-decor/stage-decor-8.jpg",
            title: "Contemporary Minimalist Reception Stage",
            alt_text: "Reception stage decoration Calicut floral stage decor",
          },
        ]}
        whatsappText="Hello Occasions Florist Calicut, I would like to inquire about stage decoration in Calicut."
        seoH1="Stage Decoration in Calicut"
        seoH2="Opulent Wedding & Reception Floral Stage Decor in Kozhikode"
        seoContent={[
          "Create memories that shine forever with luxury stage decoration in Calicut designed by Occasions. From opulent wedding stage decoration in Kozhikode to modern engagement backdrops and corporate galas, our floral architects turn empty stages into enchanted wonderlands.",
          "As trusted event decorators in Calicut, we integrate fresh imported Dutch blooms, lush monstera and eucalyptus greens, cascading wisterias, custom warm ambient illumination, and bespoke couple thrones tailored to your theme.",
          "Whether you envision a grand royal palace aesthetic or contemporary pastel garden chic, our team manages end-to-end conceptualization, 3D visualization, and on-site setup at premier convention centers and hotel banquets throughout Calicut and Kerala.",
        ]}
        breadcrumbs={breadcrumbs}
      />
    </>
  );
}
