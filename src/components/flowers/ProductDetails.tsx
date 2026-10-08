"use client";

import React from "react";
import ProductDetailView from "@/components/ProductDetailView";
import { FlowerProduct } from "@/types";
import { Product } from "@/data/catalog";

interface ProductDetailsProps {
  product: FlowerProduct;
  relatedProducts?: FlowerProduct[];
  categoryName?: string;
}

export default function ProductDetails({
  product,
  categoryName,
}: ProductDetailsProps) {
  const catalogProduct: Product = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    originalPrice: product.originalPrice,
    category: "flower",
    categoryLabel: categoryName || "Flowers",
    image: product.image,
    images:
      product.images && product.images.length >= 4
        ? product.images
        : product.images && product.images.length > 0
          ? [
            ...product.images,
            ...Array(4 - product.images.length).fill(product.image),
          ]
          : [product.image, product.image, product.image, product.image],
    rating: product.rating || 4.4,
    reviewsCount: product.reviewsCount || 34,
    description: product.description,
    deliveryInfo: "Same-day delivery across Calicut",
    offers: [],
    includes: product.stems || [],
    badge: product.badge,
    variants: product.variants?.map((v) => ({
      id: v.id,
      name: v.name,
      price: v.price,
      originalPrice: v.originalPrice,
      image: v.image || product.image,
    })),
  };

  return <ProductDetailView product={catalogProduct} />;
}
