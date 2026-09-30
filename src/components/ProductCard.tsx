import React from "react";
import { CategoryProduct } from "@/data/categoryProducts";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: CategoryProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const whatsappUrl = `https://wa.me/918606464700?text=${encodeURIComponent(
    `Hello Occassions Florist, I would like to order/inquire about "${product.title}" (${product.price}).`
  )}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.card}
      title={`${product.title} - ${product.price}`}
      aria-label={`${product.title} - ${product.price}`}
    >
      {/* Product Image on top portion */}
      <div className={styles.imageWrapper}>
        <img
          src={product.image}
          alt={product.title}
          className={styles.productImage}
          loading="lazy"
        />
      </div>

      {/* Subtle organic wave contour from reference design */}
      <div className={styles.waveDivider} aria-hidden="true">
        <svg
          viewBox="0 0 400 30"
          preserveAspectRatio="none"
          className={styles.waveSvg}
        >
          <path
            d="M 0 16 Q 120 32 240 10 T 400 24 L 400 30 L 0 30 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Clean light-gray lower content area matching reference mockup */}
      <div className={styles.lightGrayArea}>
        <span className={styles.srOnly}>
          {product.title} - {product.price}
        </span>
      </div>
    </a>
  );
}
