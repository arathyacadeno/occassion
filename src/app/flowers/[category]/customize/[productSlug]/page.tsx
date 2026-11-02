import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import FlowerCustomizer from "@/components/customization/FlowerCustomizer";
import { CATALOG_PRODUCTS, Product } from "@/data/catalog";
import { getCategoryInfo } from "@/data/flowerProducts";

interface PageProps {
  params: Promise<{
    category: string;
    productSlug: string;
  }>;
}

function findProduct(rawId: string): Product | undefined {
  const decoded = decodeURIComponent(rawId).toLowerCase().trim();
  return CATALOG_PRODUCTS.find(
    (p) =>
      p.id.toLowerCase() === decoded ||
      p.slug.toLowerCase() === decoded ||
      p.slug.toLowerCase().replace(/\s+/g, "-") === decoded ||
      p.id.replace(/\s+/g, "-") === decoded
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, productSlug } = await params;
  const product = findProduct(productSlug);

  if (!product) {
    return {
      title: "Customize Flower Bouquet | Occasions Flower Shop",
    };
  }

  const flowerInfo = getCategoryInfo(category);
  return {
    title: `Customize ${product.name} | ${flowerInfo.name || "Flower"} Atelier`,
    description: `Bespoke customization for ${product.name}. Tailor stems, sizes, wrapping paper and silk ribbon for Calicut delivery.`,
    openGraph: {
      title: `Customize ${product.name} - ₹${product.price}`,
      description: product.description,
      images: [{ url: product.image }],
    },
  };
}

export default async function FlowerCustomizationPage({ params }: PageProps) {
  const { category, productSlug } = await params;
  const product = findProduct(productSlug);

  if (!product) {
    notFound();
  }

  return (
    <FlowerCustomizer
      product={product}
      flowerCategory={category}
    />
  );
}

