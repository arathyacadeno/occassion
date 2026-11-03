"use client";

import React, { useState } from "react";
import { X, ExternalLink, Edit, Copy, Sparkles, Check, Package, Tag } from "lucide-react";

interface ProductQuickViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any | null;
  onEdit: (product: any) => void;
  onDuplicate: (slug: string) => void;
}

export default function ProductQuickViewModal({
  isOpen,
  onClose,
  product,
  onEdit,
  onDuplicate,
}: ProductQuickViewModalProps) {
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);

  if (!isOpen || !product) return null;

  let images: string[] = [];
  if (Array.isArray(product.images)) {
    images = product.images;
  } else if (typeof product.images === "string") {
    try {
      images = JSON.parse(product.images);
    } catch {
      images = [product.images];
    }
  }
  if (images.length === 0) {
    images = [product.image || "/images/sunflower-bouquet.jpg"];
  }

  const liveUrl = product.type === "cake" ? `/cakes` : `/flower-bouquets`;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 20,
          width: "100%",
          maxWidth: "760px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#fafafa",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                display: "inline-block",
                padding: "4px 10px",
                borderRadius: 20,
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                background: product.active ? "#dcfce7" : "#fef3c7",
                color: product.active ? "#166534" : "#92400e",
              }}
            >
              {product.active ? "Published" : "Draft / Archived"}
            </span>
            <span style={{ fontSize: "0.82rem", color: "#64748b" }}>SKU: {product.sku || "N/A"}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: "#f1f5f9",
              border: "none",
              borderRadius: "50%",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#475569",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "24px", overflowY: "auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Left: Images */}
          <div>
            <div
              style={{
                width: "100%",
                height: 300,
                borderRadius: 14,
                overflow: "hidden",
                border: "1px solid #e2e8f0",
                background: "#f8fafc",
                marginBottom: 12,
              }}
            >
              <img
                src={images[selectedImgIdx] || images[0]}
                alt={product.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>

            {images.length > 1 && (
              <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImgIdx(idx)}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 8,
                      overflow: "hidden",
                      border: selectedImgIdx === idx ? "2.5px solid #db2777" : "1.5px solid #e2e8f0",
                      padding: 0,
                      cursor: "pointer",
                      background: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    <img src={img} alt={`Thumb ${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div>
            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#be185d", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
              {product.categoryLabel || product.category || "Bouquet"}
            </div>
            <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#1e293b", margin: "0 0 10px", lineHeight: 1.3 }}>
              {product.name}
            </h2>

            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "#831843" }}>₹{product.price}</span>
              {product.originalPrice && (
                <span style={{ fontSize: "1rem", color: "#94a3b8", textDecoration: "line-through" }}>
                  ₹{product.originalPrice}
                </span>
              )}
            </div>

            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <div style={{ padding: "8px 12px", borderRadius: 8, background: "#f8fafc", border: "1px solid #e2e8f0", fontSize: "0.82rem" }}>
                <span style={{ color: "#64748b" }}>Stock: </span>
                <strong style={{ color: product.stock <= 5 ? "#dc2626" : "#059669" }}>{product.stock} units</strong>
              </div>
              {product.badge && (
                <div style={{ padding: "8px 12px", borderRadius: 8, background: "#fdf2f8", border: "1px solid #fce7f3", color: "#db2777", fontWeight: 700, fontSize: "0.82rem" }}>
                  {product.badge}
                </div>
              )}
            </div>

            {product.shortDescription && (
              <p style={{ fontSize: "0.88rem", color: "#475569", lineHeight: 1.5, margin: "0 0 12px" }}>
                {product.shortDescription}
              </p>
            )}

            {product.description && (
              <div style={{ fontSize: "0.82rem", color: "#64748b", maxHeight: 120, overflowY: "auto", borderTop: "1px solid #f1f5f9", paddingTop: 10 }}>
                {product.description}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#fafafa",
          }}
        >
          <a
            href={liveUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: "#be185d",
              textDecoration: "none",
              fontSize: "0.88rem",
              fontWeight: 600,
            }}
          >
            <ExternalLink size={15} />
            <span>View on Public Storefront</span>
          </a>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={() => {
                onClose();
                onDuplicate(product.slug || product.id);
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 8,
                border: "1px solid #cbd5e1",
                background: "#fff",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                color: "#334155",
              }}
            >
              <Copy size={14} />
              <span>Duplicate</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(product);
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 8,
                border: "none",
                background: "#db2777",
                color: "#fff",
                fontSize: "0.85rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              <Edit size={14} />
              <span>Edit Product</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

