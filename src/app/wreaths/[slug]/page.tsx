import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetailView from "@/components/ProductDetailView";
import { getProduct } from "@/lib/getProduct";
import { SITE_URL, getProductSchema, getBreadcrumbSchema } from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProduct("wreaths", resolvedParams.slug);

  if (!product) {
    return { title: "Wreath Not Found | Occasions Calicut" };
  }

  const title = `${product.name} | Funeral Wreath in Calicut`;
  const trimmedTitle = title.length > 60 ? product.name.slice(0, 57) + "..." : title;
  const description =
    product.description && product.description.length >= 100
      ? (product.description.length > 160 ? product.description.slice(0, 157) + "..." : product.description)
      : `Dignified floral tribute ${product.name} crafted by Occasions Calicut. Funeral wreath delivery in Kozhikode and sympathy flowers in Kerala.`;

  const canonicalUrl = `${SITE_URL}/wreaths/${encodeURIComponent(resolvedParams.slug)}`;
  const imageUrl = product.image || "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647385/occasions/products/wreaths/wreath-sacred-cross-peace.png";

  return {
    title: trimmedTitle,
    description: description.slice(0, 160),
    keywords: [
      product.name,
      "funeral wreath in Calicut",
      "condolence wreath Kozhikode",
      "funeral flowers Calicut",
      "Occasions Calicut",
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url: canonicalUrl,
      siteName: "Occasions Calicut",
      title: trimmedTitle,
      description: description.slice(0, 160),
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: `${product.name} - Occasions funeral wreath in Calicut`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: trimmedTitle,
      description: description.slice(0, 160),
      images: [imageUrl],
    },
  };
}

export default async function WreathDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const product = await getProduct("wreaths", resolvedParams.slug);

  if (!product) {
    notFound();
  }

  const productUrl = `${SITE_URL}/wreaths/${encodeURIComponent(resolvedParams.slug)}`;
  const productJsonLd = getProductSchema({
    name: product.name,
    description: product.description || `Handcrafted sympathy wreath by Occasions Calicut.`,
    image: product.image,
    images: product.images,
    price: product.price,
    rating: product.rating,
    reviewsCount: product.reviewsCount,
    url: productUrl,
    sku: product.id || resolvedParams.slug,
  });

  const breadcrumbJsonLd = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Funeral Wreaths", url: "/wreaths" },
    { name: product.name, url: `/wreaths/${resolvedParams.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductDetailView product={product} />
    </>
  );
}
