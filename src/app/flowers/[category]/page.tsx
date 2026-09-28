import React from "react";
import { Metadata } from "next";
import FlowerCategoryPage from "@/components/flowers/FlowerCategoryPage";
import { getCategoryInfo, getProductsByCategory, CATEGORIES_DATA } from "@/data/flowerProducts";

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const info = getCategoryInfo(category);
  return {
    title: `${info.name} Collection | Occasions Flower Shop Calicut`,
    description: info.description,
    openGraph: {
      title: `${info.title} - Occasions Flowers`,
      description: info.headline,
      images: info.heroImage ? [{ url: info.heroImage }] : undefined,
    },
  };
}

export async function generateStaticParams() {
  return Object.keys(CATEGORIES_DATA).map((slug) => ({
    category: slug,
  }));
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  const info = getCategoryInfo(category);
  const products = getProductsByCategory(category);

  return <FlowerCategoryPage category={info} products={products} />;
}
