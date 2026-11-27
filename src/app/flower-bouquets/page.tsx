import type { Metadata } from "next";
import CategoryPage from "@/components/CategoryPage";
import { getStorefrontCategoryProducts } from "@/lib/getProduct";
import { SITE_URL, getBreadcrumbSchema } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Buy Flower Bouquet Online in Calicut | Occasions",
  description:
    "Buy flower bouquet online in Calicut. Fresh rose bouquet delivery in Calicut, birthday bouquets & send flowers to Kozhikode with express delivery by Occasions.",
  keywords: [
    "buy flower bouquet online in Calicut",
    "Flower bouquet Calicut",
    "flower bouquet delivery Kozhikode",
    "birthday bouquet Calicut",
    "send flowers to Calicut",
    "Valentines day flowers Kozhikode",
    "fresh rose bouquet delivery in Calicut",
    "Occasions Calicut",
  ],
  alternates: {
    canonical: `${SITE_URL}/flower-bouquets`,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: `${SITE_URL}/flower-bouquets`,
    siteName: "Occasions Calicut",
    title: "Buy Flower Bouquet Online in Calicut | Occasions",
    description:
      "Buy flower bouquet online in Calicut from Occasions. Fresh rose bouquet delivery in Calicut, birthday bouquets & send flowers to Kozhikode with same-day delivery.",
    images: [
      {
        url: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647380/occasions/products/flower-bouquet/flower-bouquet-rose-garden-bliss.png",
        width: 1200,
        height: 630,
        alt: "Buy flower bouquet online in Calicut - Occasions fresh rose and orchid bouquets",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Buy Flower Bouquet Online in Calicut | Occasions",
    description:
      "Buy flower bouquet online in Calicut. Fresh rose bouquet delivery in Calicut, birthday bouquets & flower delivery in Kozhikode.",
    images: [
      "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647380/occasions/products/flower-bouquet/flower-bouquet-rose-garden-bliss.png",
    ],
  },
};

const BOUQUET_TABS = [
  { id: "all", label: "All Items" },
  { id: "roses", label: "Roses" },
  { id: "orchids", label: "Orchids" },
  { id: "carnations", label: "Carnations" },
  { id: "sunflowers", label: "Sunflowers" },
  { id: "birthday", label: "Birthday" },
];

export default async function FlowerBouquetsPage() {
  const bouquetProducts = await getStorefrontCategoryProducts("flower-bouquets");
  const breadcrumbJsonLd = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Flower Bouquets", url: "/flower-bouquets" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <CategoryPage
        title="Buy Flower Bouquet Online in Calicut"
        description={"Handcrafted fresh floral bouquets featuring premium Dutch roses, orchids, sunflowers & seasonal blooms.\nOrder online for same-day flower bouquet delivery in Calicut & Kozhikode."}
        products={bouquetProducts}
        filterTabs={BOUQUET_TABS}
      />
    </>
  );
}
