"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductGallery from "@/components/ProductGallery";
import ProductInfo from "@/components/ProductInfo";
import ProductGrid from "@/components/ProductGrid";
import RecommendedAddons from "@/components/RecommendedAddons";
import { Product, getProductsByCategory } from "@/data/catalog";
import { useCart } from "@/context/CartContext";
import { useCheckout } from "@/context/CheckoutContext";
import { ShoppingCart, Check } from "lucide-react";
import styles from "./ProductDetailView.module.css";

interface ProductDetailViewProps {
  product: Product;
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const { addItem } = useCart();
  const { startBuyNow } = useCheckout();
  const [addedFeedback, setAddedFeedback] = useState(false);

  const relatedProducts = getProductsByCategory(product.category)
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    addItem(
      {
        id: product.id,
        name: product.name,
        subtitle: product.categoryLabel,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        occasion: "celebration",
        rating: product.rating,
        reviewsCount: product.reviewsCount,
        stems: product.includes || [],
        description: product.description,
        flowerCount: `${product.includes?.length || 12} items`,
        scent: "Fresh & Green",
        badge: product.badge,
        dimensions: "45cm H × 35cm W",
      },
      "Signature",
      false
    );

    setAddedFeedback(true);
    setTimeout(() => {
      setAddedFeedback(false);
    }, 2200);
  };

  const handleBuyNow = () => {
    startBuyNow({
      id: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      quantity: 1,
    });
  };

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <main className={styles.mainContainer}>
        {/* Main 2-column Product Detail Layout */}
        <section className={styles.productLayout}>
          <ProductGallery
            images={product.images}
            productName={product.name}
          />

          <ProductInfo product={product} />
        </section>

        {/* Recommended Addon Products Carousel */}
        <RecommendedAddons />

        {/* Action Buttons: [ Add To Cart ] [ Buy Now ] placed below Addon Carousel */}
        <div className={styles.bottomActionsRow}>
          <button
            type="button"
            onClick={handleAddToCart}
            className={`${styles.addToCartBtn} ${
              addedFeedback ? styles.addedSuccess : ""
            }`}
          >
            {addedFeedback ? (
              <>
                <Check size={18} strokeWidth={2.5} />
                <span>Added to Cart!</span>
              </>
            ) : (
              <>
                <ShoppingCart size={18} strokeWidth={1.8} />
                <span>Add To Cart</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            className={styles.buyNowBtn}
          >
            <ShoppingCart size={18} strokeWidth={1.8} />
            <span>Buy Now</span>
          </button>
        </div>

        {/* You May Also Like */}
        {relatedProducts.length > 0 && (
          <section className={styles.relatedSection}>
            <h2 className={styles.relatedHeading}>You May Also Like</h2>
            <ProductGrid products={relatedProducts} ariaLabel="Related Products" />
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
