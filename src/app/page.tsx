"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import SplitHero from "@/components/SplitHero";
import ShopByCategory from "@/components/ShopByCategory";
import ShopByOccasion from "@/components/ShopByOccasion";
import JoyfulGiftsBanner from "@/components/JoyfulGiftsBanner";
import ShopByFlowers from "@/components/ShopByFlowers";
import HighlightSection from "@/components/HighlightSection";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

export default function Home() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [targetSlide, setTargetSlide] = useState<number | undefined>(undefined);
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleSelectSlide = (index: number) => {
    setTargetSlide(index);
    // Reset so selecting the same slide again will still trigger
    setTimeout(() => setTargetSlide(undefined), 100);
  };

  return (
    <main style={{ minHeight: "100vh", position: "relative", overflowX: "clip", backgroundColor: "#FAD9E3" }}>
      {/* Navigation Header with dynamic split contrast & official Occassions logo */}
      <Header
        isDrawerOpen={isDrawerOpen}
        onToggleDrawer={setIsDrawerOpen}
        onSelectSlide={handleSelectSlide}
        currentSlide={currentSlide}
      />

      {/* 1. Home Page Hero */}
      <SplitHero
        onOpenMenu={() => setIsDrawerOpen(true)}
        targetSlide={targetSlide}
        onSlideChange={setCurrentSlide}
      />

      {/* 2. Shop by Category */}
      <ShopByCategory />

      {/* 3. Shop by Occasion */}
      <ShopByOccasion />

      {/* 3.5 Celebration Gifts Promotional Banner */}
      <JoyfulGiftsBanner />

      {/* 4. Shop by Flower */}
      <ShopByFlowers />

      {/* 5. Our Highlights */}
      <HighlightSection />

      {/* 5.5 Testimonials */}
      <Testimonials />

      {/* 6. Footer */}
      <Footer />
    </main>
  );
}
