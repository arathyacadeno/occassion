"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import SplitHero from "@/components/SplitHero";
import HighlightSection from "@/components/HighlightSection";
import ShopByCategory from "@/components/ShopByCategory";
import AtelierVideoSection from "@/components/AtelierVideoSection";
import StorySection from "@/components/StorySection";
import ShopByFlowers from "@/components/ShopByFlowers";
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
    <main style={{ minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      {/* Navigation Header with dynamic split contrast & official Occassions logo */}
      <Header
        isDrawerOpen={isDrawerOpen}
        onToggleDrawer={setIsDrawerOpen}
        onSelectSlide={handleSelectSlide}
        currentSlide={currentSlide}
      />

      {/* Hero: Rosebud/Marigold Split-Screen Vertical Scroll Slider */}
      <SplitHero
        onOpenMenu={() => setIsDrawerOpen(true)}
        targetSlide={targetSlide}
        onSlideChange={setCurrentSlide}
      />

      {/* Highlights Section: Interactive Resizable Grid (Car decorations, Garlands, Church arrangements, Table arrangements) */}
      <HighlightSection />

      {/* Shop By Category: Interactive Accordion Cards with Hover Expansion */}
      <ShopByCategory />

      {/* Atelier Florist Crafting Video Section */}
      <AtelierVideoSection />

      {/* Our Story / Brand Showcase Section */}
      <StorySection />

      {/* Shop By Flowers: Roses, White Roses, Tulips, Lilies */}
      <ShopByFlowers />

      {/* Testimonials: Lotus Background with Oval Showcase matching user reference */}
      <Testimonials />

      {/* Footer: Occassions Calicut, IFA certification, studio contact & WhatsApp booking */}
      <Footer />
    </main>
  );
}
