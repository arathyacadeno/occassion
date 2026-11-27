import type { Metadata } from "next";
import CategoryPage from "@/components/CategoryPage";
import { getStorefrontCategoryProducts } from "@/lib/getProduct";
import { SITE_URL, getBreadcrumbSchema } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Special Occasion Flowers & Gifts in Calicut | Occasions",
  description:
    "Celebration flowers and gifts in Calicut. Handcrafted birthday surprises, anniversary flowers & celebration gift hampers with express same-day delivery by Occasions.",
  keywords: [
    "Special Occasions Calicut",
    "birthday flowers Calicut",
    "anniversary flowers Calicut",
    "gift delivery in Calicut",
    "flower and cake delivery Calicut",
    "Occasions Calicut",
  ],
  alternates: {
    canonical: `${SITE_URL}/special-occasions`,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: `${SITE_URL}/special-occasions`,
    siteName: "Occasions Calicut",
    title: "Special Occasion Flowers & Gifts in Calicut | Occasions",
    description:
      "Celebration flowers and gifts in Calicut. Handcrafted birthday surprises, anniversary flowers & celebration gift hampers with express same-day delivery.",
    images: [
      {
        url: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647380/occasions/products/flower-bouquet/flower-bouquet-rose-garden-bliss.png",
        width: 1200,
        height: 630,
        alt: "Special occasion flowers and gifts in Calicut - Occasions Calicut",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Special Occasion Flowers & Gifts in Calicut | Occasions",
    description:
      "Celebration flowers and gifts in Calicut. Handcrafted birthday surprises, anniversary flowers & gift delivery by Occasions.",
    images: [
      "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647380/occasions/products/flower-bouquet/flower-bouquet-rose-garden-bliss.png",
    ],
  },
};

export default async function SpecialOccasionsCategoryPage() {
  const occasionProducts = await getStorefrontCategoryProducts("special-occasions");
  const breadcrumbJsonLd = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Special Occasions", url: "/special-occasions" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <CategoryPage
        title="Special Occasion Flowers &amp; Gifts in Calicut"
        description="Beautiful gifts and arrangements created for life's most memorable moments across Calicut and Kozhikode."
        products={occasionProducts}
      />
    </>
  );
}
