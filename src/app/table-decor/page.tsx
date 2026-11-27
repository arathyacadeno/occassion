import type { Metadata } from "next";
import CategoryPage from "@/components/CategoryPage";
import { getStorefrontCategoryProducts } from "@/lib/getProduct";
import { SITE_URL, getBreadcrumbSchema } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Table Decoration in Calicut | Occasions Decor",
  description:
    "Table decoration in Calicut by Occasions. Elegant flower table centrepiece in Calicut, wedding table decoration in Kozhikode & party decor for all celebrations.",
  keywords: [
    "table decoration in Calicut",
    "birthday table decoration Calicut",
    "wedding table decoration Kozhikode",
    "flower table centrepiece Calicut",
    "reception table decor Kozhikode",
    "party table decoration",
    "Occasions Calicut",
  ],
  alternates: {
    canonical: `${SITE_URL}/table-decor`,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: `${SITE_URL}/table-decor`,
    siteName: "Occasions Calicut",
    title: "Table Decoration in Calicut | Occasions Decor",
    description:
      "Table decoration in Calicut by Occasions. Elegant flower table centrepiece in Calicut, wedding table decoration in Kozhikode & party decor for all celebrations.",
    images: [
      {
        url: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647385/occasions/products/table-decor/table-decor-crystal-grandeur.png",
        width: 1200,
        height: 630,
        alt: "Table decoration in Calicut - Luxury wedding table centerpieces by Occasions Calicut",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Table Decoration in Calicut | Occasions Decor",
    description:
      "Table decoration in Calicut by Occasions. Elegant floral centerpieces, wedding table decoration in Kozhikode & banquet styling.",
    images: [
      "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647385/occasions/products/table-decor/table-decor-crystal-grandeur.png",
    ],
  },
};

const TABLE_DECOR_TABS = [
  { id: "all", label: "All Items" },
  { id: "centerpiece", label: "Centerpieces" },
  { id: "runner", label: "Runners & Banquets" },
  { id: "heart", label: "Heart Arrangements" },
  { id: "wedding", label: "Wedding & Ceremonies" },
];

export default async function TableDecorCategoryPage() {
  const tableProducts = await getStorefrontCategoryProducts("table-decor");
  const breadcrumbJsonLd = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Table Decoration", url: "/table-decor" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <CategoryPage
        title="Table Decoration in Calicut"
        description={"Stunning floral centerpieces, banquet runners & bespoke table arrangements handcrafted for memorable celebrations.\nAvailable for weddings, reception banquets, and birthday parties in Calicut."}
        products={tableProducts}
        filterTabs={TABLE_DECOR_TABS}
      />
    </>
  );
}
