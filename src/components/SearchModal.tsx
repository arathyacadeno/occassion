"use client";

import React, { useState } from "react";
import { BOUQUETS_DATA } from "@/data/bouquets";
import { Bouquet } from "@/types";
import { Search, X } from "lucide-react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBouquet: (bouquet: Bouquet) => void;
}

export default function SearchModal({
  isOpen,
  onClose,
  onSelectBouquet,
}: SearchModalProps) {
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  const results = searchTerm.trim()
    ? BOUQUETS_DATA.filter(
        (b) =>
          b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.stems.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : [];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(18, 15, 13, 0.75)",
        backdropFilter: "blur(8px)",
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "80px 20px 40px 20px",
        animation: "fadeIn 0.25s ease",
      }}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 28,
          right: 28,
          color: "#fff",
          background: "transparent",
          border: "none",
          cursor: "pointer",
        }}
        aria-label="Close search"
      >
        <X size={32} />
      </button>

      <div
        style={{
          width: "100%",
          maxWidth: 720,
          background: "transparent",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            position: "relative",
            borderBottom: "2px solid #ffffff",
            paddingBottom: 14,
            marginBottom: 36,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Search size={28} color="#ffffff" style={{ marginRight: 16 }} />
          <input
            type="text"
            placeholder="Search by bouquet name, rose, peony, orchid..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              color: "#ffffff",
              fontSize: "1.8rem",
              fontFamily: "var(--font-serif)",
              outline: "none",
            }}
          />
        </div>

        {/* Results */}
        {searchTerm.trim() && (
          <div
            style={{
              background: "#ffffff",
              borderRadius: 4,
              padding: 24,
              maxHeight: "60vh",
              overflowY: "auto",
              boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
            }}
          >
            <div
              style={{
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                color: "#888",
                marginBottom: 16,
              }}
            >
              Found {results.length} floral match{results.length === 1 ? "" : "es"}
            </div>

            {results.length === 0 ? (
              <p style={{ color: "#666", padding: "20px 0" }}>
                No floral arrangements matched &quot;{searchTerm}&quot;. Try searching for &quot;Roses&quot;, &quot;Peony&quot;, or &quot;Hydrangea&quot;.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {results.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => {
                      onSelectBouquet(b);
                      onClose();
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      padding: 10,
                      borderRadius: 4,
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#faf6f1")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <img
                      src={b.image}
                      alt={b.name}
                      style={{
                        width: 60,
                        height: 70,
                        objectFit: "cover",
                        borderRadius: 2,
                      }}
                    />
                    <div style={{ flexGrow: 1 }}>
                      <h4
                        style={{
                          fontFamily: "var(--font-serif)",
                          fontSize: "1.2rem",
                          color: "#831843",
                        }}
                      >
                        {b.name}
                      </h4>
                      <p style={{ fontSize: "0.78rem", color: "#777" }}>
                        {b.subtitle}
                      </p>
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: "1.2rem",
                        color: "var(--color-rose-dark)",
                      }}
                    >
                      ${b.price}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
