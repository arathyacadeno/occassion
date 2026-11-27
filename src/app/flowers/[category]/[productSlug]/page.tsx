import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetails from "@/components/flowers/ProductDetails";
import {
  getProductBySlug,
  getRelatedProducts,
  getCategoryInfo,
  FLOWER_PRODUCTS,
} from "@/data/flowerProducts";
import { SITE_URL, getProductSchema, getBreadcrumbSchema } from "@/lib/seo";

interface PageProps {
  params: Promise<{
    category: string;
    productSlug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, productSlug } = await params;
  const product = getProductBySlug(productSlug);

  if (!product) {
    return {
      title: "Product Not Found | Occasions Calicut",
    };
  }

  const title = `${product.name} | Flowers in Calicut`;
  const trimmedTitle = title.length > 60 ? product.name.slice(0, 57) + "..." : title;
  const description =
    product.description && product.description.length >= 100
      ? (product.description.length > 160 ? product.description.slice(0, 157) + "..." : product.description)
      : `Order ${product.name} online from Occasions Calicut. Handcrafted fresh blooms with express same-day delivery in Kozhikode.`;

  const canonicalUrl = `${SITE_URL}/flowers/${category}/${productSlug}`;

  return {
    title: trimmedTitle,
    description: description.slice(0, 160),
    keywords: [
      product.name,
      "buy flower bouquet online in Calicut",
      "flower delivery Calicut",
      "florist in Kozhikode",
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
          url: product.image,
          width: 800,
          height: 800,
          alt: `${product.name} - Occasions flower delivery in Calicut`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: trimmedTitle,
      description: description.slice(0, 160),
      images: [product.image],
    },
  };
}

export async function generateStaticParams() {
  return FLOWER_PRODUCTS.map((p) => ({
    category: p.category,
    productSlug: p.slug,
  }));
}

export default async function ProductPage({ params }: PageProps) {
  const { category, productSlug } = await params;
  const product = getProductBySlug(productSlug);

  if (!product) {
    notFound();
  }

  const categoryInfo = getCategoryInfo(product.category || category);
  const relatedProducts = getRelatedProducts(product.slug, product.category, 3);
  const productUrl = `${SITE_URL}/flowers/${category}/${productSlug}`;

  const productJsonLd = getProductSchema({
    name: product.name,
    description: product.description || `Fresh flowers by Occasions Calicut.`,
    image: product.image,
    price: product.price,
    rating: product.rating,
    reviewsCount: product.reviewsCount,
    url: productUrl,
    sku: product.id || productSlug,
  });

  const breadcrumbJsonLd = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: categoryInfo.name || "Flowers", url: `/flowers/${category}` },
    { name: product.name, url: `/flowers/${category}/${productSlug}` },
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
      <ProductDetails
        product={product}
        relatedProducts={relatedProducts}
        categoryName={categoryInfo.name}
      />
    </>
  );
}
