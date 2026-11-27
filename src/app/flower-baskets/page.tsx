import type { Metadata } from "next";
import CategoryPage from "@/components/CategoryPage";
import { getStorefrontCategoryProducts } from "@/lib/getProduct";
import { SITE_URL, getBreadcrumbSchema } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Flower Basket Online in Calicut | Occasions",
  description:
    "Flower basket online in Calicut. Fresh flower basket delivery in Kozhikode for gifts, birthdays & inaugurations with express same-day delivery from Occasions.",
  keywords: [
    "flower basket online in Calicut",
    "flower basket delivery Kozhikode",
    "fresh flower basket",
    "flower basket for gift",
    "flower basket for inauguration",
    "flower basket for birthday",
    "Occasions Calicut",
  ],
  alternates: {
    canonical: `${SITE_URL}/flower-baskets`,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: `${SITE_URL}/flower-baskets`,
    siteName: "Occasions Calicut",
    title: "Flower Basket Online in Calicut | Occasions",
    description:
      "Flower basket online in Calicut. Fresh flower basket delivery in Kozhikode for gifts, birthdays & inaugurations with express same-day delivery from Occasions.",
    images: [
      {
        url: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647381/occasions/products/flower-basket/flower-basket-blush-romance.png",
        width: 1200,
        height: 630,
        alt: "Flower basket online in Calicut - Handcrafted fresh flower baskets for inaugurations and gifts",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Flower Basket Online in Calicut | Occasions",
    description:
      "Flower basket online in Calicut. Handcrafted fresh flower basket delivery in Kozhikode for gifts, birthdays & inaugurations.",
    images: [
      "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647381/occasions/products/flower-basket/flower-basket-blush-romance.png",
    ],
  },
};

const BASKET_TABS = [
  { id: "all", label: "All" },
  { id: "cane", label: "Flowers in Cane Basket" },
  { id: "bamboo", label: "Flowers in Bamboo Basket" },
  { id: "container", label: "Flowers in Container" },
];

export default async function FlowerBasketsPage() {
  const basketProducts = await getStorefrontCategoryProducts("flower-baskets");
  const breadcrumbJsonLd = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Flower Baskets", url: "/flower-baskets" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <CategoryPage
        title="Flower Basket Online in Calicut"
        description={"Artisanal hand-woven cane & bamboo baskets brimming with fresh roses, lilies, orchids & baby's breath.\nPerfect for inauguration gifts, celebrations, and express delivery across Kozhikode."}
        products={basketProducts}
        filterTabs={BASKET_TABS}
      />
    </>
  );
}
