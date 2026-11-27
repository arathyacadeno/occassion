import { MetadataRoute } from "next";
import { CATALOG_PRODUCTS } from "@/data/catalog";
import { sql } from "@/lib/db/neon";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://occasionswithflowers.com";
  const now = new Date();

  // Core static & service pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/flower-bouquets`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cakes`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/flower-baskets`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/table-decor`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/wreaths`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/car-decoration`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/church-decoration`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/garlands`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/stage-decoration`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/special-occasions`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/gift`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Dynamic product routes from Neon DB or catalog
  const productRoutes: MetadataRoute.Sitemap = [];
  try {
    const dbProducts = await sql`
      SELECT p.id, p.slug, p.category_id, c.slug as category_slug, p.updated_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.active = 1 AND (p.status = 'published' OR p.status IS NULL OR p.status = '')
    `;

    if (dbProducts && dbProducts.length > 0) {
      for (const p of dbProducts) {
        const pSlug = p.slug || p.id;
        const catSlug = (p.category_slug || p.category_id || "").toLowerCase();
        let path = `/flower/${encodeURIComponent(pSlug)}`;
        if (catSlug.includes("cake")) {
          path = `/cakes/${encodeURIComponent(pSlug)}`;
        } else if (catSlug.includes("table")) {
          path = `/table-decor/${encodeURIComponent(pSlug)}`;
        } else if (catSlug.includes("wreath")) {
          path = `/wreaths/${encodeURIComponent(pSlug)}`;
        } else if (catSlug.includes("special") || catSlug.includes("occ")) {
          path = `/special-occasions/${encodeURIComponent(pSlug)}`;
        }

        productRoutes.push({
          url: `${baseUrl}${path}`,
          lastModified: p.updated_at ? new Date(p.updated_at) : now,
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
    }
  } catch (err) {
    console.warn("Sitemap DB fetch fallback:", err);
  }

  // Fallback to static catalog products if DB returned few or errored
  if (productRoutes.length === 0) {
    for (const p of CATALOG_PRODUCTS) {
      let path = `/flower/${p.slug}`;
      if (p.category === "cakes") path = `/cakes/${p.slug}`;
      else if (p.category === "table-decor") path = `/table-decor/${p.slug}`;
      else if (p.category === "wreaths") path = `/wreaths/${p.slug}`;
      else if (p.category === "special-occasions") path = `/special-occasions/${p.slug}`;

      productRoutes.push({
        url: `${baseUrl}${path}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  return [...staticRoutes, ...productRoutes];
}
