"use client";

import React, { useState } from "react";
import { AlertTriangle, Trash2, X, Archive, Check } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    slug: string;
    sku?: string;
    price?: number;
    image?: string;
    images?: string[] | string;
  } | null;
  onConfirm: (slug: string, force?: boolean) => Promise<boolean>;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  product,
  onConfirm,
}: DeleteConfirmModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lock background body scroll when modal is open
  React.useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  let imgUrl = product.image;
  if (!imgUrl && product.images) {
    try {
      imgUrl = Array.isArray(product.images) ? product.images[0] : JSON.parse(product.images)[0];
    } catch {
      imgUrl = typeof product.images === "string" ? product.images : "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647361/occasions/categories/categories-flower-bouquet.jpg";
    }
  }

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      const ok = await onConfirm(product.slug || product.id);
      if (ok) {
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

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
          borderRadius: 18,
          width: "100%",
          maxWidth: "480px",
          overflow: "hidden",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
        }}
      >
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid #fee2e2",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#fef2f2",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#991b1b" }}>
            <AlertTriangle size={20} />
            <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>Confirm Product Removal</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              borderRadius: "50%",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#991b1b",
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: "24px" }}>
          {error && (
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "#fee2e2", color: "#991b1b", fontSize: "0.85rem", marginBottom: 16 }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 18, padding: 12, background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" }}>
            <img
              src={imgUrl || "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647361/occasions/categories/categories-flower-bouquet.jpg"}
              alt={product.name}
              style={{ width: 64, height: 64, borderRadius: 8, objectFit: "cover", flexShrink: 0 }}
              onError={(e: any) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 24 24' fill='%23fdf2f8' stroke='%23db2777' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='100%25' height='100%25' fill='%23fdf2f8' rx='8'/%3E%3Cpath d='M12 3a4 4 0 0 0-4 4c0 2 4 6 4 6s4-4 4-6a4 4 0 0 0-4-4z' fill='%23fce7f3'/%3E%3Cpath d='M12 13v7' stroke='%23be185d'/%3E%3Cpath d='M9 17c1.5 0 3-1.5 3-1.5s1.5 1.5 3 1.5' stroke='%23be185d'/%3E%3C/svg%3E";
              }}
            />
            <div>
              <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.95rem" }}>{product.name}</div>
              <div style={{ fontSize: "0.78rem", color: "#64748b" }}>SKU: {product.sku || "N/A"}</div>
              {product.price && <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#831843" }}>₹{product.price}</div>}
            </div>
          </div>

          <p style={{ margin: "0 0 12px", fontSize: "0.88rem", color: "#475569", lineHeight: 1.5 }}>
            Are you sure you want to remove this product from the storefront?
          </p>

          <div style={{ padding: "12px 14px", borderRadius: 10, background: "#fffbeb", border: "1px solid #fef3c7", fontSize: "0.82rem", color: "#92400e", display: "flex", gap: 10 }}>
            <Archive size={18} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>Order Protection Guarantee:</strong> If this product is referenced in previous customer orders or receipts, it will be safely <strong>archived and unpublished</strong> so past customer tracking and order receipts never break.
            </div>
          </div>
        </div>

        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 12,
            background: "#fafafa",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            style={{
              padding: "9px 16px",
              borderRadius: 8,
              border: "1px solid #cbd5e1",
              background: "#fff",
              color: "#475569",
              fontSize: "0.88rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            style={{
              padding: "9px 20px",
              borderRadius: 8,
              border: "none",
              background: "#dc2626",
              color: "#fff",
              fontSize: "0.88rem",
              fontWeight: 700,
              cursor: deleting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 2px 8px rgba(220, 38, 38, 0.25)",
            }}
          >
            <Trash2 size={16} />
            <span>{deleting ? "Removing..." : "Confirm Removal"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

