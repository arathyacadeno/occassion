import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetails from "@/components/flowers/ProductDetails";
import {
  getProductBySlug,
  getRelatedProducts,
  getCategoryInfo,
  FLOWER_PRODUCTS,
} from "@/data/flowerProducts";

interface PageProps {
  params: Promise<{
    category: string;
    productSlug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { productSlug } = await params;
  const product = getProductBySlug(productSlug);

  if (!product) {
    return {
      title: "Product Not Found | Occasions Flower Shop",
    };
  }

  return {
    title: `${product.name} | Occasions Flower Shop Calicut`,
    description: product.description,
    openGraph: {
      title: `${product.name} - ₹${product.price}`,
      description: product.subtitle,
      images: [{ url: product.image }],
    },
  };
}

export async function generateStaticParams() {
  return FLOWER_PRODUCTS.map((p) => ({
    category: p.category,
    productSlug: p.slug,
  }));
}

export default async function ProductPage({ params }: PageProps) {
  const { category, productSlug } = await params;
  const product = getProductBySlug(productSlug);

  if (!product) {
    notFound();
  }

  const categoryInfo = getCategoryInfo(product.category || category);
  const relatedProducts = getRelatedProducts(product.slug, product.category, 3);

  return (
    <ProductDetails
      product={product}
      relatedProducts={relatedProducts}
      categoryName={categoryInfo.name}
    />
  );
}
