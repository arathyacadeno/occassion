import React from "react";
import { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import CategoryPage from "@/components/CategoryPage";
import { getCategoryInfo, CATEGORIES_DATA } from "@/data/flowerProducts";
import { getProductsForFlower, getAllProducts } from "@/data/catalog";
import { sql } from "@/lib/db/neon";
import { mapDbToProduct } from "@/lib/getProduct";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

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

  // Check DB for flower type info
  let dbName = "";
  let dbDesc = "";
  try {
    const norm = category.toLowerCase().trim();
    const rows = await sql`
      SELECT name, description, image FROM flower_types 
      WHERE slug = ${norm} OR id = ${norm} OR id = ${"ft-" + norm} 
      LIMIT 1
    `;
    if (rows && rows.length > 0) {
      dbName = rows[0].name;
      dbDesc = rows[0].description;
    }
  } catch {
    // ignore
  }

  const info = getCategoryInfo(category);
  const titleName = dbName || info.name || (category.charAt(0).toUpperCase() + category.slice(1));
  const descText = dbDesc || info.description || `Handcrafted fresh floral bouquets featuring premium ${titleName}.`;

  return {
    title: `${titleName} Collection | Occasions Flower Shop Calicut`,
    description: descText,
    openGraph: {
      title: `${titleName} - Occasions Flowers`,
      description: descText,
      images: info.heroImage ? [{ url: info.heroImage }] : undefined,
    },
  };
}

export default async function FlowerTypeCategoryPage({ params }: PageProps) {
  const { category } = await params;

  if (category === "bouquets") {
    redirect("/flower-bouquets");
  }
  if (category === "baskets" || category === "flower-baskets") {
    redirect("/flower-baskets");
  }

  const normalizedCategory = category.toLowerCase().trim();
  const isKnownCategory = Boolean(CATEGORIES_DATA[normalizedCategory]);

  // 1. Check DB for flower type
  let dbFlower: any = null;
  try {
    const fRows = await sql`
      SELECT * FROM flower_types 
      WHERE slug = ${normalizedCategory} OR id = ${normalizedCategory} OR id = ${"ft-" + normalizedCategory}
      LIMIT 1
    `;
    if (fRows && fRows.length > 0) {
      dbFlower = fRows[0];
    }
  } catch (e) {
    console.error("DB flower lookup error:", e);
  }

  const info = getCategoryInfo(category);
  let products = getProductsForFlower(category);
  if (!products || products.length === 0) {
    // fallback if specific catalog search yields none
    products = getAllProducts().filter(
      (p) =>
        p.category === "flower" &&
        (p.name.toLowerCase().includes(category.toLowerCase()) ||
          p.description?.toLowerCase().includes(category.toLowerCase()))
    );
  }

  // 2. Query Neon PostgreSQL for products associated with this flower type
  let dbProducts: any[] = [];
  try {
    const rawRows = await sql`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN flower_types ft ON p.flower_type_id = ft.id
      WHERE p.active = 1
        AND (
          ft.slug = ${normalizedCategory}
          OR p.flower_type_id = ${normalizedCategory}
          OR p.flower_type_id = ${"ft-" + normalizedCategory}
          OR LOWER(p.name) LIKE ${"%" + normalizedCategory + "%"}
          OR LOWER(p.description) LIKE ${"%" + normalizedCategory + "%"}
        )
      ORDER BY p.featured DESC, p.created_at DESC
    `;
    dbProducts = (rawRows || []).map(mapDbToProduct);
  } catch (e) {
    console.error("DB products for flower search error:", e);
  }

  // Merge products without duplicates
  const seen = new Set<string>();
  const allProducts: any[] = [];
  for (const p of [...products, ...dbProducts]) {
    if (!seen.has(p.id) && !seen.has(p.slug)) {
      seen.add(p.id);
      seen.add(p.slug);
      allProducts.push(p);
    }
  }

  if (!isKnownCategory && !dbFlower && allProducts.length === 0) {
    notFound();
  }

  const flowerName = dbFlower?.name || info.name || (category.charAt(0).toUpperCase() + category.slice(1));
  const tabs = [
    { id: "all", label: `All ${flowerName}` },
    { id: "baskets", label: "Flower Baskets" },
    { id: "bouquets", label: "Flower Bouquets" },
  ];

  return (
    <CategoryPage
      title={`${flowerName} Collection`}
      description={
        dbFlower?.description ||
        info.description ||
        `Handcrafted fresh floral bouquets & artisanal baskets featuring premium ${flowerName.toLowerCase()}.`
      }
      products={allProducts}
      filterTabs={tabs}
      flowerCategory={category}
    />
  );
}
