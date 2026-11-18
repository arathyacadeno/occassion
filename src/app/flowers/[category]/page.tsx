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
  const normSingular = normalizedCategory.replace(/s$/, "");
  const isKnownCategory = Boolean(CATEGORIES_DATA[normalizedCategory] || CATEGORIES_DATA[normSingular]);

  // 1. Check DB for flower type
  let dbFlower: any = null;
  try {
    const fRows = await sql`
      SELECT * FROM flower_types 
      WHERE slug = ${normalizedCategory}
         OR slug = ${normSingular}
         OR id = ${normalizedCategory}
         OR id = ${"ft-" + normalizedCategory}
         OR id = ${"ft-" + normSingular}
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
        (p.name.toLowerCase().includes(normSingular) ||
          p.slug.toLowerCase().includes(normSingular))
    );
  }

  const filteredCatalogProducts = (products || []).filter((p) => {
    const cat = (p.category || "").toLowerCase();
    const name = (p.name || "").toLowerCase();
    const id = (p.id || "").toLowerCase();
    if (cat === "cakes" || name.includes("cake") || id.includes("cake")) return false;
    if (cat === "addons" || id.startsWith("addon-")) return false;
    if (id === "flower-11" || id === "flower-12") return false;
    return true;
  });

  // 2. Query Neon PostgreSQL for flower products associated with this flower type
  let dbProducts: any[] = [];
  try {
    const rawRows = await sql`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN flower_types ft ON p.flower_type_id = ft.id
      WHERE p.active = 1
        AND (p.status = 'published' OR p.status IS NULL OR p.status = '')
        AND (
          p.category_id IN ('cat-flower-bouquet', 'cat-flower-basket', 'flower-bouquet', 'flower-basket')
          OR p.type = 'flower'
          OR c.slug IN ('flower-bouquet', 'flower-basket')
        )
        AND (p.category_id NOT IN ('cat-cakes', 'cat-addons', 'cat-table-decor', 'cat-wreath'))
        AND (p.type != 'cake')
        AND (p.name NOT ILIKE '%cake%')
        AND (p.id NOT LIKE 'addon-%')
        AND (p.id NOT IN ('flower-11', 'flower-12'))
        AND (
          ft.slug = ${normalizedCategory}
          OR ft.slug = ${normSingular}
          OR p.flower_type_id = ${normalizedCategory}
          OR p.flower_type_id = ${"ft-" + normalizedCategory}
          OR p.flower_type_id = ${"ft-" + normSingular}
          OR LOWER(p.name) LIKE ${"%" + normSingular + "%"}
          OR LOWER(COALESCE(p.includes, '')) LIKE ${"%" + normSingular + "%"}
        )
      ORDER BY p.featured DESC, p.created_at DESC
    `;
    dbProducts = (rawRows || []).map(mapDbToProduct);
  } catch (e) {
    console.error("DB products for flower search error:", e);
  }

  // Merge products without duplicates, strictly excluding non-flower items
  const seen = new Set<string>();
  const allProducts: any[] = [];
  for (const p of [...filteredCatalogProducts, ...dbProducts]) {
    const cat = ((p as any).category_id || p.category || "").toLowerCase();
    const type = ((p as any).type || "").toLowerCase();
    const name = (p.name || "").toLowerCase();
    const id = (p.id || "").toLowerCase();

    // Strictly reject any cakes, add-ons, table decor, wreaths, or dummy mock items
    if (cat.includes("cake") || type === "cake" || name.includes("cake") || id.includes("cake")) continue;
    if (cat === "cat-addons" || cat === "addons" || id.startsWith("addon-")) continue;
    if (cat.includes("table-decor") || cat.includes("wreath")) continue;
    if (id === "flower-11" || id === "flower-12") continue;

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
