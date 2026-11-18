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

interface FlowerConfig {
  id: string;
  slug: string;
  singular: string;
  plural: string;
  name: string;
  aliases: string[];
  namePattern: RegExp;
  excludePattern?: RegExp;
}

const FLOWER_CONFIGS: Record<string, FlowerConfig> = {
  lilies: {
    id: "ft-lilies",
    slug: "lilies",
    singular: "lily",
    plural: "lilies",
    name: "Lilies",
    aliases: ["lily", "lilies", "lilly", "lillies", "oriental-lily"],
    namePattern: /\b(lily|lilies|lilly|oriental lily|casablanca|stargazer)\b/i,
  },
  roses: {
    id: "ft-roses",
    slug: "roses",
    singular: "rose",
    plural: "roses",
    name: "Roses",
    aliases: ["rose", "roses"],
    namePattern: /\brose(s)?\b/i,
    excludePattern: /\b(tuberose|rajnigandha)\b/i,
  },
  orchids: {
    id: "ft-orchids",
    slug: "orchids",
    singular: "orchid",
    plural: "orchids",
    name: "Orchids",
    aliases: ["orchid", "orchids"],
    namePattern: /\borchid(s)?\b/i,
  },
  sunflowers: {
    id: "ft-sunflowers",
    slug: "sunflowers",
    singular: "sunflower",
    plural: "sunflowers",
    name: "Sunflowers",
    aliases: ["sunflower", "sunflowers"],
    namePattern: /\bsunflower(s)?\b/i,
  },
  jasmine: {
    id: "ft-jasmine",
    slug: "jasmine",
    singular: "jasmine",
    plural: "jasmines",
    name: "Jasmine",
    aliases: ["jasmine", "jasmines"],
    namePattern: /\bjasmine(s)?\b/i,
  },
  carnations: {
    id: "ft-carnations",
    slug: "carnations",
    singular: "carnation",
    plural: "carnations",
    name: "Carnations",
    aliases: ["carnation", "carnations"],
    namePattern: /\bcarnation(s)?\b/i,
  },
  gerberas: {
    id: "ft-gerberas",
    slug: "gerberas",
    singular: "gerbera",
    plural: "gerberas",
    name: "Gerberas",
    aliases: ["gerbera", "gerberas"],
    namePattern: /\bgerbera(s)?\b/i,
  },
  gladiolus: {
    id: "ft-gladiolus",
    slug: "gladiolus",
    singular: "gladiolus",
    plural: "gladiolus",
    name: "Gladiolus",
    aliases: ["gladiolus", "gladioli", "gladiola"],
    namePattern: /\bgladiol(us|i|a)?\b/i,
  },
  rajnigandha: {
    id: "ft-rajnigandha",
    slug: "rajnigandha",
    singular: "rajnigandha",
    plural: "rajnigandha",
    name: "Rajnigandha",
    aliases: ["rajnigandha", "tuberose"],
    namePattern: /\b(rajnigandha|tuberose)\b/i,
  },
  heliconia: {
    id: "ft-heliconia",
    slug: "heliconia",
    singular: "heliconia",
    plural: "heliconias",
    name: "Heliconia",
    aliases: ["heliconia", "heliconias"],
    namePattern: /\bheliconia(s)?\b/i,
  },
  chrysanthemums: {
    id: "ft-chrysanthemums",
    slug: "chrysanthemums",
    singular: "chrysanthemum",
    plural: "chrysanthemums",
    name: "Chrysanthemums",
    aliases: ["chrysanthemum", "chrysanthemums"],
    namePattern: /\bchrysanthemum(s)?\b/i,
  },
  tulips: {
    id: "ft-tulips",
    slug: "tulips",
    singular: "tulip",
    plural: "tulips",
    name: "Tulips",
    aliases: ["tulip", "tulips"],
    namePattern: /\btulip(s)?\b/i,
  },
};

function resolveFlowerConfig(rawCategory: string): FlowerConfig {
  const norm = rawCategory.toLowerCase().trim();
  if (FLOWER_CONFIGS[norm]) {
    return FLOWER_CONFIGS[norm];
  }
  for (const config of Object.values(FLOWER_CONFIGS)) {
    if (config.aliases.includes(norm)) {
      return config;
    }
  }
  // Generic fallback
  const singular = norm.endsWith("ies")
    ? norm.slice(0, -3) + "y"
    : norm.endsWith("s") && !norm.endsWith("us")
    ? norm.slice(0, -1)
    : norm;
  return {
    id: `ft-${norm}`,
    slug: norm,
    singular,
    plural: norm.endsWith("s") ? norm : `${norm}s`,
    name: norm.charAt(0).toUpperCase() + norm.slice(1),
    aliases: [norm, singular],
    namePattern: new RegExp(`\\b${singular}\\b`, "i"),
  };
}

interface PageProps {
  params: Promise<{ category: string }>;
  searchParams?: Promise<{ tab?: string; flower?: string; search?: string }>;
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

  const flowerConfig = resolveFlowerConfig(category);

  // Check DB for flower type info
  let dbName = "";
  let dbDesc = "";
  try {
    const rows = await sql`
      SELECT name, description, image FROM flower_types 
      WHERE slug = ${flowerConfig.slug} 
         OR slug = ${category.toLowerCase().trim()} 
         OR id = ${flowerConfig.id}
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
  const titleName = dbName || flowerConfig.name || info.name || (category.charAt(0).toUpperCase() + category.slice(1));
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

export default async function FlowerTypeCategoryPage({ params, searchParams }: PageProps) {
  const { category } = await params;
  const sp = searchParams ? await searchParams : {};
  const activeTab = sp.tab || sp.flower || "all";

  if (category === "bouquets") {
    redirect("/flower-bouquets");
  }
  if (category === "baskets" || category === "flower-baskets") {
    redirect("/flower-baskets");
  }

  const flowerConfig = resolveFlowerConfig(category);
  const normalizedCategory = category.toLowerCase().trim();
  const isKnownCategory = Boolean(
    CATEGORIES_DATA[normalizedCategory] ||
    CATEGORIES_DATA[flowerConfig.slug] ||
    CATEGORIES_DATA[flowerConfig.singular]
  );

  // 1. Check DB for flower type
  let dbFlower: any = null;
  try {
    const fRows = await sql`
      SELECT * FROM flower_types 
      WHERE slug = ${flowerConfig.slug}
         OR slug = ${normalizedCategory}
         OR id = ${flowerConfig.id}
         OR id = ${"ft-" + normalizedCategory}
      LIMIT 1
    `;
    if (fRows && fRows.length > 0) {
      dbFlower = fRows[0];
    }
  } catch (e) {
    console.error("DB flower lookup error:", e);
  }

  const info = getCategoryInfo(category);

  // 2. Query Neon PostgreSQL for flower products associated strictly with this flower type
  let dbProducts: any[] = [];
  try {
    const rawRows = await sql`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN flower_types ft ON p.flower_type_id = ft.id
      WHERE p.active = 1
        AND (p.status = 'published' OR p.status IS NULL OR p.status = '')
        -- Must be a flower bouquet or flower basket
        AND (
          p.category_id IN ('cat-flower-bouquet', 'cat-flower-basket', 'flower-bouquet', 'flower-basket')
          OR (p.type IS NOT NULL AND p.type IN ('flower', 'bouquet', 'basket'))
          OR c.slug IN ('flower-bouquet', 'flower-basket')
        )
        -- Strictly exclude non-flower items, cakes, add-ons, table runners, and wreaths
        AND (p.category_id IS NULL OR p.category_id NOT IN ('cat-cakes', 'cat-addons', 'cat-table-decor', 'cat-wreath'))
        AND (p.type IS NULL OR p.type NOT IN ('cake', 'addon', 'table-decor', 'wreath'))
        AND p.name NOT ILIKE '%cake%'
        AND p.id NOT LIKE 'addon-%'
        AND p.id NOT IN ('flower-11', 'flower-12')
        AND p.name NOT ILIKE '%altar%'
        AND p.name NOT ILIKE '%church%'
        AND p.name NOT ILIKE '%aisle%'
        AND p.name NOT ILIKE '%pew%'
        AND p.name NOT ILIKE '%runner%'
        AND (
          -- Primary match: explicitly assigned to this flower type
          p.flower_type_id = ${flowerConfig.id}
          OR p.flower_type_id = ${flowerConfig.slug}
          OR ft.slug = ${flowerConfig.slug}
          OR ft.id = ${flowerConfig.id}
          -- Secondary match: for mixed or unassigned products, check clear title keywords
          OR (
            (p.flower_type_id IS NULL OR p.flower_type_id = 'ft-mixed-flowers' OR p.flower_type_id = 'NONE')
            AND (
              LOWER(p.name) LIKE ${"%" + flowerConfig.singular + "%"}
              OR LOWER(p.slug) LIKE ${"%" + flowerConfig.singular + "%"}
              OR LOWER(p.name) LIKE ${"%" + flowerConfig.plural + "%"}
              OR LOWER(p.slug) LIKE ${"%" + flowerConfig.plural + "%"}
            )
          )
        )
      ORDER BY p.featured DESC, p.created_at DESC
    `;
    dbProducts = (rawRows || []).map(mapDbToProduct);
  } catch (e) {
    console.error("DB products for flower search error:", e);
  }

  // 3. Fallback to catalog data if DB yields few or no products
  let catalogProducts = getProductsForFlower(flowerConfig.slug);
  if (!catalogProducts || catalogProducts.length === 0) {
    catalogProducts = getProductsForFlower(flowerConfig.singular);
  }

  // 4. Merge products without duplicates and apply defensive quality filtering
  const seen = new Set<string>();
  const allProducts: any[] = [];

  for (const p of [...dbProducts, ...(catalogProducts || [])]) {
    const cat = ((p as any).category_id || p.category || "").toLowerCase();
    const type = ((p as any).type || "").toLowerCase();
    const name = (p.name || "").toLowerCase();
    const id = (p.id || "").toLowerCase();
    const slug = (p.slug || "").toLowerCase();

    // Strictly reject any cakes, add-ons, table decor, wreaths, or dummy mock items
    if (cat.includes("cake") || type === "cake" || name.includes("cake") || id.includes("cake")) continue;
    if (cat === "cat-addons" || cat === "addons" || id.startsWith("addon-")) continue;
    if (cat.includes("table-decor") || cat.includes("wreath") || type === "table-decor" || type === "wreath") continue;
    if (id === "flower-11" || id === "flower-12") continue;
    if (name.includes("altar") || name.includes("arch") || name.includes("aisle") || name.includes("pew") || name.includes("runner")) continue;

    // Check flower-specific exclusion pattern (e.g. for roses, exclude tuberose/rajnigandha)
    if (flowerConfig.excludePattern && (flowerConfig.excludePattern.test(name) || flowerConfig.excludePattern.test(slug))) {
      continue;
    }

    if (!seen.has(p.id) && !seen.has(p.slug)) {
      seen.add(p.id);
      seen.add(p.slug);
      allProducts.push(p);
    }
  }

  if (!isKnownCategory && !dbFlower && allProducts.length === 0) {
    notFound();
  }

  const flowerName = dbFlower?.name || flowerConfig.name || info.name || (category.charAt(0).toUpperCase() + category.slice(1));
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
      initialFilterId={activeTab}
      flowerCategory={category}
    />
  );
}
