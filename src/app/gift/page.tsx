import type { Metadata } from "next";
import CategoryPage from "@/components/CategoryPage";
import { getStorefrontCategoryProducts } from "@/lib/getProduct";
import { SITE_URL, getBreadcrumbSchema } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gift Delivery in Calicut | Occasions Gifts",
  description:
    "Same-day gift delivery in Calicut by Occasions. Top gift shop in Calicut for flower and cake combos, luxury hampers & online gift delivery across Kozhikode.",
  keywords: [
    "gift delivery in Calicut",
    "gift shop Calicut",
    "same day gift delivery in Calicut",
    "online gift delivery Kozhikode",
    "combo gifts Calicut",
    "Occasions Calicut",
  ],
  alternates: {
    canonical: `${SITE_URL}/gift`,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: `${SITE_URL}/gift`,
    siteName: "Occasions Calicut",
    title: "Gift Delivery in Calicut | Occasions Gifts",
    description:
      "Same-day gift delivery in Calicut by Occasions. Top gift shop in Calicut for flower and cake combos, luxury hampers & online gift delivery across Kozhikode.",
    images: [
      {
        url: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647380/occasions/products/flower-bouquet/flower-bouquet-rose-garden-bliss.png",
        width: 1200,
        height: 630,
        alt: "Gift delivery in Calicut - Occasions luxury celebration gifts and hampers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gift Delivery in Calicut | Occasions Gifts",
    description:
      "Same-day gift delivery in Calicut by Occasions. Top gift shop in Calicut for flower and cake combos & gift delivery in Kozhikode.",
    images: [
      "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647380/occasions/products/flower-bouquet/flower-bouquet-rose-garden-bliss.png",
    ],
  },
};

const GIFT_TABS = [
  { id: "all", label: "All Gifts" },
  { id: "combos", label: "Flowers & Cakes" },
  { id: "birthday", label: "Birthday Gifts" },
  { id: "anniversary", label: "Anniversary Gifts" },
];

export default async function GiftPage() {
  const giftProducts = await getStorefrontCategoryProducts("special-occasions");
  const breadcrumbJsonLd = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Gifts", url: "/gift" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <CategoryPage
        title="Gift Delivery in Calicut"
        description={"Delight your loved ones with express same-day gift delivery in Calicut.\nExplore curated flower and cake combos, premium chocolate boxes, and bespoke celebration hampers across Kozhikode."}
        products={giftProducts}
        filterTabs={GIFT_TABS}
      />
    </>
  );
}
