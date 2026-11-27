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
  const product = await getProduct("flower", resolvedParams.slug);

  if (!product) {
    return { title: "Product Not Found | Occasions Calicut" };
  }

  const title = `${product.name} | Buy Flowers in Calicut`;
  const trimmedTitle = title.length > 60 ? product.name.slice(0, 57) + "..." : title;
  const description =
    product.description && product.description.length >= 100
      ? (product.description.length > 160 ? product.description.slice(0, 157) + "..." : product.description)
      : `Order ${product.name} online from Occasions Calicut. Handcrafted fresh flower bouquet with same-day delivery across Calicut and Kozhikode.`;

  const canonicalUrl = `${SITE_URL}/flower/${encodeURIComponent(resolvedParams.slug)}`;
  const imageUrl = product.image || "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647380/occasions/products/flower-bouquet/flower-bouquet-rose-garden-bliss.png";

  return {
    title: trimmedTitle,
    description: description.slice(0, 160),
    keywords: [
      product.name,
      "buy flower bouquet online in Calicut",
      "flower delivery Calicut",
      "send flowers to Kozhikode",
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
          alt: `${product.name} - Occasions Calicut`,
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

export default async function FlowerProductDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const product = await getProduct("flower", resolvedParams.slug);

  if (!product) {
    notFound();
  }

  const productUrl = `${SITE_URL}/flower/${encodeURIComponent(resolvedParams.slug)}`;
  const productJsonLd = getProductSchema({
    name: product.name,
    description: product.description || `Handcrafted fresh flower arrangement by Occasions Calicut.`,
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
    { name: "Flower Bouquets", url: "/flower-bouquets" },
    { name: product.name, url: `/flower/${resolvedParams.slug}` },
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
