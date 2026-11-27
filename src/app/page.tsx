import type { Metadata } from "next";
import HomeClient from "@/components/HomeClient";
import { SITE_URL, getLocalBusinessSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Flower Shop in Calicut | Occasions Calicut",
  description:
    "Premier flower shop in Calicut. Enjoy online flower and cake delivery in Kozhikode, luxury bouquets, gift shop items & event decoration by Occasions Calicut.",
  keywords: [
    "Flower shop in Calicut",
    "flower and cake delivery Calicut",
    "flower shop Kozhikode",
    "gift shop Calicut",
    "event decoration Calicut",
    "online flower delivery Kozhikode",
    "Occasions Calicut",
    "florist in Calicut",
  ],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "Occasions Calicut",
    title: "Flower Shop in Calicut | Occasions Calicut",
    description:
      "Premier flower shop in Calicut. Enjoy online flower and cake delivery in Kozhikode, luxury bouquets, gift shop items & event decoration by Occasions Calicut.",
    images: [
      {
        url: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647380/occasions/products/flower-bouquet/flower-bouquet-rose-garden-bliss.png",
        width: 1200,
        height: 630,
        alt: "Flower shop in Calicut - Occasions Calicut fresh flower bouquets and cakes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Flower Shop in Calicut | Occasions Calicut",
    description:
      "Premier flower shop in Calicut. Enjoy online flower and cake delivery in Kozhikode, luxury bouquets, gift shop items & event decoration by Occasions Calicut.",
    images: [
      "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647380/occasions/products/flower-bouquet/flower-bouquet-rose-garden-bliss.png",
    ],
  },
};

export default function HomePage() {
  const localBusinessJsonLd = getLocalBusinessSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <HomeClient />
    </>
  );
}
