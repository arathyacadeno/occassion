import type { Metadata } from "next";
import CategoryPage from "@/components/CategoryPage";
import { getStorefrontCategoryProducts } from "@/lib/getProduct";
import { SITE_URL, getBreadcrumbSchema } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Online Cake Delivery in Calicut | Occasions",
  description:
    "Online cake delivery in Calicut by Occasions. Top cake shop in Kozhikode for birthday cake, photo cake & custom cakes with same-day delivery across Calicut.",
  keywords: [
    "online cake delivery in Calicut",
    "birthday cake in Calicut",
    "cake shop in Kozhikode",
    "customizable cake shop in Calicut",
    "cake delivery Calicut",
    "photo cake Kozhikode",
    "Occasions Calicut",
  ],
  alternates: {
    canonical: `${SITE_URL}/cakes`,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: `${SITE_URL}/cakes`,
    siteName: "Occasions Calicut",
    title: "Online Cake Delivery in Calicut | Occasions",
    description:
      "Online cake delivery in Calicut by Occasions. Top cake shop in Kozhikode for birthday cake, photo cake & custom cakes with same-day delivery across Calicut.",
    images: [
      {
        url: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647382/occasions/products/cakes/cake-belgian-chocolate-truffle.png",
        width: 1200,
        height: 630,
        alt: "Online cake delivery in Calicut - Occasions birthday and custom cakes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Online Cake Delivery in Calicut | Occasions",
    description:
      "Online cake delivery in Calicut by Occasions. Top cake shop in Kozhikode for birthday cake, photo cake & custom cakes with same-day delivery.",
    images: [
      "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647382/occasions/products/cakes/cake-belgian-chocolate-truffle.png",
    ],
  },
};

const CAKE_TABS = [
  { id: "all", label: "All Items" },
  { id: "birthday", label: "Birthday" },
  { id: "anniversary", label: "Anniversary" },
  { id: "chocolate", label: "Chocolate Cakes" },
];

export default async function CakesCategoryPage() {
  const cakeProducts = await getStorefrontCategoryProducts("cakes");
  const breadcrumbJsonLd = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Cakes", url: "/cakes" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <CategoryPage
        title="Online Cake Delivery in Calicut"
        description="Freshly baked artisan birthday cakes, decadent chocolate truffles, and customized photo cakes delivered same-day across Calicut."
        products={cakeProducts}
        filterTabs={CAKE_TABS}
      />
    </>
  );
}
