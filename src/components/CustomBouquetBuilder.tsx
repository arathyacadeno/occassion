"use client";

import React, { useState } from "react";
import styles from "./CustomBouquetBuilder.module.css";
import { Bouquet } from "@/types";
import { ShoppingBag } from "lucide-react";

interface CustomBouquetBuilderProps {
  onAddCustomBouquet: (bouquet: Bouquet, note: string) => void;
}

export default function CustomBouquetBuilder({ onAddCustomBouquet }: CustomBouquetBuilderProps) {
  const [selectedOccasion, setSelectedOccasion] = useState("Romance & Anniversary");
  const [selectedPalette, setSelectedPalette] = useState("Blush & Rose Quartz");
  const [selectedSize, setSelectedSize] = useState("Signature Grand");
  const [giftNote, setGiftNote] = useState("");
  const [includeVase, setIncludeVase] = useState(false);

  const occasions = [
    "Romance & Anniversary",
    "Birthday Elegance",
    "Celebration & Gala",
    "Peace & Solace",
  ];

  const palettes = [
    {
      name: "Blush & Rose Quartz",
      color: "linear-gradient(135deg, #f7dcd6 0%, #e8a598 100%)",
      img: "/images/slide1-flower.jpg",
    },
    {
      name: "Twilight Hydrangea",
      color: "linear-gradient(135deg, #9787a4 0%, #5d5069 100%)",
      img: "/images/slide2-flower.jpg",
    },
    {
      name: "Sunlit Peach Coral",
      color: "linear-gradient(135deg, #f9c29d 0%, #d87654 100%)",
      img: "/images/slide3-flower.jpg",
    },
    {
      name: "White Eden Orchid",
      color: "linear-gradient(135deg, #ffffff 0%, #e4ded7 100%)",
      img: "/images/bouquet-4.jpg",
    },
  ];

  const sizes = [
    { name: "Petite Posy", price: 75, stems: "18-20 stems" },
    { name: "Signature Grand", price: 120, stems: "32-36 stems" },
    { name: "Royal Atelier", price: 185, stems: "48-52 stems" },
  ];

  const activePaletteObj = palettes.find((p) => p.name === selectedPalette) || palettes[0];
  const activeSizeObj = sizes.find((s) => s.name === selectedSize) || sizes[1];

  const totalPrice = activeSizeObj.price + (includeVase ? 25 : 0);

  const handleOrder = () => {
    const customBouquet: Bouquet = {
      id: `custom-${Date.now()}`,
      name: `Bespoke: ${selectedPalette}`,
      subtitle: `${selectedSize} for ${selectedOccasion}`,
      price: totalPrice,
      image: activePaletteObj.img,
      occasion: "curated",
      rating: 5.0,
      reviewsCount: 1,
      stems: [
        "Artisan Sourced Daily Blooms",
        "Garden Foliage & Greens",
        "Hand-tied Silk Ribbon",
        includeVase ? "Hand-Blown Fluted Glass Vase" : "Eco-Luxury Wrap",
      ],
      description: `Custom handcrafted arrangement curated for ${selectedOccasion} with a ${selectedPalette} chromatic palette. Includes personalized calligraphy gift card.`,
      flowerCount: activeSizeObj.stems,
      scent: "Heirloom Rose",
      badge: "Bespoke Creation",
      dimensions: selectedSize === "Petite Posy" ? "40cm × 30cm" : "55cm × 45cm",
    };

    onAddCustomBouquet(customBouquet, giftNote);
  };

  return (
    <section className={styles.sectionWrapper} id="custom-builder">
      <div className={styles.atelierBgPattern} />
      <div className="container">
        <div className={styles.headerArea}>
          <div className={styles.tagline}>Bespoke Floral Atelier</div>
          <h2 className={styles.title}>Craft Your Custom Bouquet</h2>
          <p className={styles.desc}>
            Collaborate with our master florists. Select your signature occasion, color palette, and scale, and let us handcraft your one-of-a-kind floral tribute.
          </p>
        </div>

        <div className={styles.builderContainer}>
          {/* Step Controls */}
          <div className={styles.stepsColumn}>
            {/* Step 1: Occasion */}
            <div className={styles.stepBlock}>
              <div className={styles.stepLabel}>
                <span className={styles.stepNumber}>1</span>
                Select Occasion
              </div>
              <div className={styles.optionsGrid}>
                {occasions.map((occ) => (
                  <button
                    key={occ}
                    className={`${styles.optionCard} ${
                      selectedOccasion === occ ? styles.optionSelected : ""
                    }`}
                    onClick={() => setSelectedOccasion(occ)}
                  >
                    <span className={styles.optionName}>{occ}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Palette */}
            <div className={styles.stepBlock}>
              <div className={styles.stepLabel}>
                <span className={styles.stepNumber}>2</span>
                Chromatic Palette
              </div>
              <div className={styles.optionsGrid}>
                {palettes.map((pal) => (
                  <button
                    key={pal.name}
                    className={`${styles.optionCard} ${
                      selectedPalette === pal.name ? styles.optionSelected : ""
                    }`}
                    onClick={() => setSelectedPalette(pal.name)}
                  >
                    <div
                      className={styles.paletteCircle}
                      style={{ background: pal.color }}
                    />
                    <span className={styles.optionName}>{pal.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Size */}
            <div className={styles.stepBlock}>
              <div className={styles.stepLabel}>
                <span className={styles.stepNumber}>3</span>
                Arrangement Scale
              </div>
              <div className={styles.optionsGrid}>
                {sizes.map((s) => (
                  <button
                    key={s.name}
                    className={`${styles.optionCard} ${
                      selectedSize === s.name ? styles.optionSelected : ""
                    }`}
                    onClick={() => setSelectedSize(s.name)}
                  >
                    <span className={styles.optionName}>{s.name}</span>
                    <span className={styles.optionSub}>${s.price} • {s.stems}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Gift Note */}
            <div className={styles.stepBlock}>
              <div className={styles.stepLabel}>
                <span className={styles.stepNumber}>4</span>
                Personal Handwritten Card (Complimentary)
              </div>
              <textarea
                className={styles.noteInput}
                placeholder="Write your heartfelt note here... Our calligrapher will transcribe it onto heavy pressed cotton stationery."
                value={giftNote}
                onChange={(e) => setGiftNote(e.target.value)}
              />
            </div>
          </div>

          {/* Real-time Atelier Summary & Preview */}
          <div className={styles.previewColumn}>
            <div>
              <div className={styles.previewHeader}>
                <div className={styles.previewTitle}>Bespoke Summary</div>
                <div className={styles.previewPrice}>${totalPrice}</div>
              </div>

              <div className={styles.previewImageContainer}>
                <img
                  src={activePaletteObj.img}
                  alt={activePaletteObj.name}
                  className={styles.previewImage}
                />
              </div>

              <div className={styles.summaryList}>
                <div className={styles.summaryItem}>
                  <span>Occasion:</span>
                  <strong>{selectedOccasion}</strong>
                </div>
                <div className={styles.summaryItem}>
                  <span>Palette:</span>
                  <strong>{selectedPalette}</strong>
                </div>
                <div className={styles.summaryItem}>
                  <span>Scale:</span>
                  <strong>{selectedSize} ({activeSizeObj.stems})</strong>
                </div>
                <div className={styles.summaryItem}>
                  <span>Finishing:</span>
                  <strong>Raw-Edge French Silk Ribbon</strong>
                </div>
                <div className={styles.summaryItem}>
                  <span>Handmade Vase:</span>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={includeVase}
                      onChange={(e) => setIncludeVase(e.target.checked)}
                    />
                    <span>Include Vase (+ $25)</span>
                  </label>
                </div>
              </div>
            </div>

            <button className={styles.submitBtn} onClick={handleOrder}>
              <ShoppingBag size={16} />
              Add Custom Creation to Cart (${totalPrice})
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
