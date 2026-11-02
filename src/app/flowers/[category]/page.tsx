import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import CategoryPage from "@/components/CategoryPage";
import { getCategoryInfo, CATEGORIES_DATA } from "@/data/flowerProducts";
import { getProductsForFlower, getAllProducts } from "@/data/catalog";

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  if (category === "bouquets") {
    return {
      title: "Flower Bouquets | Occassions Florist Calicut",
      description: "Handcrafted fresh floral bouquets featuring premium Dutch roses, lilies, tulips & seasonal blooms.",
    };
  }
  if (category === "baskets" || category === "flower-baskets") {
    return {
      title: "Flower Baskets | Occassions Florist Calicut",
      description: "Artisanal hand-woven baskets brimming with fresh roses, peonies, baby's breath & fragrant greenery.",
    };
  }
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

export default async function FlowerTypeCategoryPage({ params }: PageProps) {
  const { category } = await params;

  if (category === "bouquets") {
    redirect("/flower-bouquets");
  }
  if (category === "baskets" || category === "flower-baskets") {
    redirect("/flower-baskets");
  }

  const info = getCategoryInfo(category);
  let products = getProductsForFlower(category);
  if (!products || products.length === 0) {
    // fallback if specific search yields none
    products = getAllProducts().filter(
      (p) =>
        p.category === "flower" &&
        (p.name.toLowerCase().includes(category.toLowerCase()) ||
          p.description?.toLowerCase().includes(category.toLowerCase()))
    );
  }

  const flowerName = info.name || "Flowers";
  const tabs = [
    { id: "all", label: `All ${flowerName}` },
    { id: "baskets", label: "Flower Baskets" },
    { id: "bouquets", label: "Flower Bouquets" },
      ];

  return (
    <CategoryPage
      title={`${flowerName} Collection`}
      description={
        info.description ||
        `Handcrafted fresh floral bouquets & artisanal baskets featuring premium ${flowerName.toLowerCase()}.`
      }
      products={products}
      filterTabs={tabs}
      flowerCategory={category}
    />
  );
}
