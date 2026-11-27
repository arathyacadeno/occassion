import type { Metadata } from "next";
import CategoryPage from "@/components/CategoryPage";
import { getStorefrontCategoryProducts } from "@/lib/getProduct";
import { SITE_URL, getBreadcrumbSchema } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Funeral Wreath in Calicut | Occasions Florist",
  description:
    "Order funeral wreath in Calicut with graceful sympathy designs. Condolence wreath in Kozhikode, funeral flowers in Calicut & RIP wreath delivery across Kerala.",
  keywords: [
    "funeral wreath in Calicut",
    "condolence wreath Kozhikode",
    "funeral flowers Calicut",
    "wreath online Kerala",
    "RIP wreath Calicut",
    "Occasions Calicut",
  ],
  alternates: {
    canonical: `${SITE_URL}/wreaths`,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: `${SITE_URL}/wreaths`,
    siteName: "Occasions Calicut",
    title: "Funeral Wreath in Calicut | Occasions Florist",
    description:
      "Order funeral wreath in Calicut with graceful sympathy designs. Condolence wreath in Kozhikode, funeral flowers in Calicut & RIP wreath delivery across Kerala.",
    images: [
      {
        url: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647385/occasions/products/wreaths/wreath-sacred-cross-peace.png",
        width: 1200,
        height: 630,
        alt: "Funeral wreath in Calicut - Handcrafted tribute wreaths and condolence flowers by Occasions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Funeral Wreath in Calicut | Occasions Florist",
    description:
      "Funeral wreath in Calicut. Condolence wreath in Kozhikode, funeral flowers in Calicut & RIP wreaths across Kerala.",
    images: [
      "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647385/occasions/products/wreaths/wreath-sacred-cross-peace.png",
    ],
  },
};

const WREATH_TABS = [
  { id: "all", label: "All Items" },
  { id: "cross", label: "Cross Wreaths" },
  { id: "circular", label: "Circular Rings" },
  { id: "easel", label: "Standing Easels" },
];

export default async function WreathsPage() {
  const wreathProducts = await getStorefrontCategoryProducts("wreaths");
  const breadcrumbJsonLd = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Funeral Wreaths", url: "/wreaths" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <CategoryPage
        title="Funeral Wreath in Calicut"
        description={"Handcrafted tribute wreaths, standing easels & sacred cross floral tributes crafted with utmost grace & devotion.\nPrompt and dignified sympathy flower delivery across Calicut and Kerala."}
        products={wreathProducts}
        filterTabs={WREATH_TABS}
      />
    </>
  );
}
