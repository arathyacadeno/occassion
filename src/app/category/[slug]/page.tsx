import React from "react";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import CategoryPage from "@/components/CategoryPage";
import { getDb } from "@/lib/db";
import { Product } from "@/data/catalog";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const db = getDb();
  const category: any = db.prepare("SELECT * FROM categories WHERE slug = ? OR id = ?").get(slug, `cat-${slug}`);

  if (!category) {
    const formatted = slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    return {
      title: `${formatted} | Occassions Florist Calicut`,
      description: `Explore our exclusive ${formatted} collection handcrafted for your special celebrations in Calicut.`,
    };
  }

  return {
    title: `${category.name} | Occassions Florist Calicut`,
    description: category.description || `Explore our ${category.name} collection at Occassions Florist Calicut.`,
  };
}

export default async function DynamicCategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const cleanSlug = slug.toLowerCase().trim();

  // Redirect canonical routes if matching standard categories
  if (cleanSlug === "flower-bouquet" || cleanSlug === "flower-bouquets" || cleanSlug === "bouquets") {
    redirect("/flower-bouquets");
  }
  if (cleanSlug === "flower-basket" || cleanSlug === "flower-baskets" || cleanSlug === "baskets") {
    redirect("/flower-baskets");
  }
  if (cleanSlug === "cakes" || cleanSlug === "cake") {
    redirect("/cakes");
  }
  if (cleanSlug === "table-decor" || cleanSlug === "table-decorations") {
    redirect("/table-decor");
  }
  if (cleanSlug === "wreath" || cleanSlug === "wreaths") {
    redirect("/wreaths");
  }

  const db = getDb();
  const category: any = db.prepare("SELECT * FROM categories WHERE slug = ? OR id = ?").get(cleanSlug, `cat-${cleanSlug}`);

  const catId = category?.id || `cat-${cleanSlug}`;
  const catName = category?.name || cleanSlug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  const catDesc = category?.description || `Explore handcrafted ${catName} curated with fresh blooms and boutique designs.`;

  // Query products belonging to this category
  const rawProducts: any[] = db.prepare(`
    SELECT p.* FROM products p
    WHERE (p.category_id = ? OR p.category_id = ? OR p.category_id = ?)
      AND p.active = 1
      AND (p.status = 'published' OR p.status IS NULL OR p.status = '')
    ORDER BY p.featured DESC, p.created_at DESC
  `).all(catId, cleanSlug, `cat-${cleanSlug}`);

  const products: Product[] = rawProducts.map((p) => {
    let parsedImages: string[] = [];
    if (typeof p.images === "string") {
      try {
        parsedImages = JSON.parse(p.images);
      } catch {
        parsedImages = [p.images];
      }
    } else if (Array.isArray(p.images)) {
      parsedImages = p.images;
    }

    const mainImg = parsedImages[0] || p.image || "/images/cat-flower-bouquet-luxe.jpg";

    let parsedOffers: string[] = [];
    if (typeof p.offers === "string") {
      try { parsedOffers = JSON.parse(p.offers); } catch { parsedOffers = []; }
    } else if (Array.isArray(p.offers)) {
      parsedOffers = p.offers;
    }

    let parsedIncludes: string[] = [];
    if (typeof p.includes === "string") {
      try { parsedIncludes = JSON.parse(p.includes); } catch { parsedIncludes = []; }
    } else if (Array.isArray(p.includes)) {
      parsedIncludes = p.includes;
    }

    const catType: Product["category"] =
      p.type === "cakes" || p.type === "cake" ? "cakes" :
      p.type === "table-decor" || p.type === "decor" ? "table-decor" :
      p.type === "wreaths" || p.type === "wreath" ? "wreaths" : "flower";

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.price) || 0,
      originalPrice: p.discount_price ? Number(p.discount_price) : undefined,
      rating: Number(p.rating) || 5.0,
      reviewsCount: Number(p.reviews_count) || 1,
      description: p.description || "",
      shortDescription: p.short_description || "",
      image: mainImg,
      images: parsedImages.length > 0 ? parsedImages : [mainImg],
      category: catType,
      categoryLabel: catName,
      badge: p.badge || undefined,
      inStock: (p.stock ?? 1) > 0,
      stock: p.stock ?? 1,
      deliveryInfo: p.delivery_info || "Same-day Calicut express delivery available",
      offers: parsedOffers,
      includes: parsedIncludes,
    };
  });

  return (
    <CategoryPage
      title={catName}
      description={catDesc}
      products={products}
      filterTabs={[
        { id: "all", label: "All Items" },
      ]}
    />
  );
}
