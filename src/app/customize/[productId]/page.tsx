import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import FlowerCustomizer from "@/components/customization/FlowerCustomizer";
import { CATALOG_PRODUCTS, Product } from "@/data/catalog";

interface PageProps {
  params: Promise<{
    productId: string;
  }>;
  searchParams?: Promise<{
    category?: string;
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
  const { productId } = await params;
  const product = findProduct(productId);

  if (!product) {
    return {
      title: "Customize Flower Bouquet | Occasions Flower Shop",
    };
  }

  return {
    title: `Customize ${product.name} | Occasions Florist Calicut`,
    description: `Personalize ${product.name} with custom flower varieties, sizes, premium wrapping and ribbons.`,
    openGraph: {
      title: `Customize ${product.name} - ₹${product.price}`,
      description: product.description,
      images: [{ url: product.image }],
    },
  };
}

export default async function DirectCustomizationPage({
  params,
  searchParams,
}: PageProps) {
  const { productId } = await params;
  const sp = searchParams ? await searchParams : {};
  const product = findProduct(productId);

  if (!product) {
    notFound();
  }

  const flowerCategory = sp?.category || product.category || "roses";

  return (
    <FlowerCustomizer
      product={product}
      flowerCategory={flowerCategory}
    />
  );
}

