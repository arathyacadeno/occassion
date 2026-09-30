import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetailView from "@/components/ProductDetailView";
import { getProductBySlug } from "@/data/catalog";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const product = getProductBySlug("special-occasions", resolvedParams.slug);

  if (!product) {
    return { title: "Product Not Found | Occassions" };
  }

  return {
    title: `${product.name} | Occassions Florist Calicut`,
    description: product.description,
  };
}

export default async function SpecialOccasionProductDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const product = getProductBySlug("special-occasions", resolvedParams.slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailView product={product} />;
}
