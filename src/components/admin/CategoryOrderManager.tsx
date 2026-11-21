"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowUpDown,
  MoveUp,
  MoveDown,
  GripVertical,
  Check,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Layers,
  ExternalLink,
  AlertCircle,
  Eye,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  display_order?: number;
  active?: number;
}

interface CategoryOrderManagerProps {
  categories?: Category[];
  onRefresh?: () => Promise<void>;
}

// Canonical definition of the 5 customer-facing categories
const DEFAULT_CANONICAL_FIVE: { id: string; name: string; slug: string; link: string; defaultOrder: number }[] = [
  { id: "cat-flower-bouquet", name: "Flower Bouquet", slug: "flower-bouquet", link: "/flower-bouquets", defaultOrder: 1 },
  { id: "cat-flower-basket", name: "Flower Basket", slug: "flower-basket", link: "/flower-baskets", defaultOrder: 2 },
  { id: "cat-cakes", name: "Cake", slug: "cakes", link: "/cakes", defaultOrder: 3 },
  { id: "cat-wreath", name: "Wreath", slug: "wreath", link: "/wreaths", defaultOrder: 4 },
  { id: "cat-table-decor", name: "Table Decor", slug: "table-decor", link: "/table-decor", defaultOrder: 5 },
];

export default function CategoryOrderManager({ categories = [], onRefresh }: CategoryOrderManagerProps) {
  const [items, setItems] = useState<Category[]>([]);
  const [initialOrderIds, setInitialOrderIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Load and normalize the 5 categories
  const loadCategories = (catList: Category[]) => {
    // Filter to the 5 primary storefront categories (strictly excluding Add-ons or custom types)
    const PRIMARY_KEYS = ["flower-bouquet", "flower-basket", "cake", "wreath", "table-decor"];

    // Find each of the 5 categories from the DB list, fallback to canonical definition
    const matched: Category[] = [];

    PRIMARY_KEYS.forEach((key) => {
      const found = catList.find((c) => {
        const s = (c.slug || c.id || "").toLowerCase().replace(/^cat-/, "");
        return s.includes(key) || key.includes(s);
      });

      if (found) {
        // Normalize name: if 'Cakes', display 'Cake' per prompt requirements
        const displayName = found.name.toLowerCase() === "cakes" ? "Cake" : found.name;
        matched.push({
          ...found,
          name: displayName,
          display_order: found.display_order ?? 99,
        });
      } else {
        const fallback = DEFAULT_CANONICAL_FIVE.find((def) => def.slug.includes(key) || key.includes(def.slug));
        if (fallback) {
          matched.push({
            id: fallback.id,
            name: fallback.name,
            slug: fallback.slug,
            image: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647361/occasions/categories/categories-flower-bouquet.jpg",
            display_order: fallback.defaultOrder,
            active: 1,
          });
        }
      }
    });

    // Sort by existing display_order ascending
    matched.sort((a, b) => {
      const orderA = a.display_order ?? 99;
      const orderB = b.display_order ?? 99;
      if (orderA !== orderB) return orderA - orderB;
      return (a.name || "").localeCompare(b.name || "");
    });

    setItems(matched);
    setInitialOrderIds(matched.map((m) => m.id));
    setLoading(false);
  };

  useEffect(() => {
    if (categories && categories.length > 0) {
      loadCategories(categories);
    } else {
      fetch("/api/categories")
        .then((r) => r.json())
        .then((d) => {
          if (d.success && Array.isArray(d.categories)) {
            loadCategories(d.categories);
          } else {
            loadCategories([]);
          }
        })
        .catch(() => loadCategories([]));
    }
  }, [categories]);

  // Check if order has unsaved modifications
  const hasChanges = JSON.stringify(items.map((i) => i.id)) !== JSON.stringify(initialOrderIds);

  // Move item up
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const newItems = [...items];
    const temp = newItems[index - 1];
    newItems[index - 1] = newItems[index];
    newItems[index] = temp;
    setItems(newItems);
    setSuccessMsg(null);
  };

  // Move item down
  const handleMoveDown = (index: number) => {
    if (index >= items.length - 1) return;
    const newItems = [...items];
    const temp = newItems[index + 1];
    newItems[index + 1] = newItems[index];
    newItems[index] = temp;
    setItems(newItems);
    setSuccessMsg(null);
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // Set transparent image or drag data
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newItems = [...items];
    const [movedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, movedItem);

    setItems(newItems);
    setDraggedIndex(null);
    setDragOverIndex(null);
    setSuccessMsg(null);
  };

  // Reset to default 1 to 5 canonical order
  const handleResetToDefault = () => {
    const defaultSorted = [...items].sort((a, b) => {
      const defA = DEFAULT_CANONICAL_FIVE.find((d) => d.id === a.id || a.slug.includes(d.slug))?.defaultOrder ?? 99;
      const defB = DEFAULT_CANONICAL_FIVE.find((d) => d.id === b.id || b.slug.includes(d.slug))?.defaultOrder ?? 99;
      return defA - defB;
    });
    setItems(defaultSorted);
    setSuccessMsg(null);
  };

  // Save new display order to database
  const handleSaveOrder = async () => {
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const orders = items.map((cat, idx) => ({
        id: cat.id,
        display_order: idx + 1,
      }));

      const res = await fetch("/api/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ orders }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update category order");
      }

      setInitialOrderIds(items.map((i) => i.id));
      setSuccessMsg("Category display order saved successfully! The storefront homepage is now updated with this order.");

      // Refresh parent admin data if provided
      if (onRefresh) {
        await onRefresh();
      }

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMsg(null);
      }, 5000);
    } catch (err: any) {
      console.error("Save display order error:", err);
      setErrorMsg(err.message || "An error occurred while saving the category order.");
    } finally {
      setSaving(false);
    }
  };

  const getStorefrontLink = (slug: string, id: string) => {
    const s = (slug || id || "").toLowerCase().replace(/^cat-/, "");
    if (s.includes("flower-bouquet") || s === "bouquet") return "/flower-bouquets";
    if (s.includes("flower-basket") || s === "basket") return "/flower-baskets";
    if (s.includes("cake")) return "/cakes";
    if (s.includes("table-decor")) return "/table-decor";
    if (s.includes("wreath")) return "/wreaths";
    return `/category/${s}`;
  };

  if (loading) {
    return (
      <div style={{ background: "#ffffff", borderRadius: 18, border: "1px solid #e2e8f0", padding: 40, textAlign: "center" }}>
        <RefreshCw size={24} className="animate-spin" color="#db2777" style={{ margin: "0 auto 12px" }} />
        <div style={{ color: "#64748b", fontSize: "0.9rem" }}>Loading category sequence from database...</div>
      </div>
    );
  }

  return (
    <div style={{ background: "#ffffff", borderRadius: 18, border: "1px solid #e2e8f0", padding: 26, boxShadow: "0 4px 16px rgba(0, 0, 0, 0.03)" }}>
      {/* Header & Description */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "#fdf2f8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#db2777",
            }}>
              <ArrowUpDown size={20} />
            </div>
            <h2 style={{ fontFamily: "var(--font-serif)", color: "#831843", fontSize: "1.45rem", margin: 0, fontWeight: 700 }}>
              Category Display Order
            </h2>
          </div>
          <p style={{ margin: "4px 0 0", fontSize: "0.86rem", color: "#64748b", lineHeight: 1.5, maxWidth: 650 }}>
            Control the sequence in which product categories appear on the customer-facing website (e.g. Homepage &quot;Shop by Category&quot;).
            Rearrange rows via <strong>Drag &amp; Drop</strong> or using the <strong>Up / Down</strong> buttons, then click <strong>Save Display Order</strong>.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button
            type="button"
            onClick={handleResetToDefault}
            disabled={saving}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 14px",
              borderRadius: 10,
              border: "1.5px solid #e2e8f0",
              background: "#f8fafc",
              color: "#475569",
              fontSize: "0.84rem",
              fontWeight: 600,
              cursor: saving ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
            }}
            title="Reset to default: Flower Bouquet, Flower Basket, Cake, Wreath, Table Decor"
          >
            <RotateCcw size={15} />
            <span>Reset to Default</span>
          </button>

          <button
            type="button"
            onClick={handleSaveOrder}
            disabled={saving || !hasChanges}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 22px",
              borderRadius: 10,
              border: "none",
              background: hasChanges
                ? "linear-gradient(90deg, #db2777, #be185d)"
                : "#e2e8f0",
              color: hasChanges ? "#ffffff" : "#94a3b8",
              fontSize: "0.9rem",
              fontWeight: 700,
              cursor: hasChanges && !saving ? "pointer" : "not-allowed",
              boxShadow: hasChanges ? "0 3px 12px rgba(190, 24, 93, 0.3)" : "none",
              transition: "all 0.2s ease",
            }}
          >
            {saving ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Check size={17} />
            )}
            <span>{saving ? "Saving Order..." : "Save Display Order"}</span>
          </button>
        </div>
      </div>

      {/* Unsaved Changes Banner */}
      {hasChanges && (
        <div style={{
          padding: "10px 14px",
          borderRadius: 10,
          background: "#fffbeb",
          border: "1px solid #fde68a",
          color: "#92400e",
          fontSize: "0.85rem",
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 16,
          fontWeight: 600,
        }}>
          <Sparkles size={16} color="#d97706" style={{ flexShrink: 0 }} />
          <span>You have unsaved changes to the display order. Click &quot;Save Display Order&quot; to push this new sequence live to the website.</span>
        </div>
      )}

      {/* Success Notification */}
      {successMsg && (
        <div style={{
          padding: "12px 18px",
          borderRadius: 10,
          background: "#ecfdf5",
          border: "1px solid #a7f3d0",
          color: "#065f46",
          fontWeight: 600,
          fontSize: "0.88rem",
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 16,
          animation: "fadeIn 0.2s ease",
        }}>
          <Check size={18} color="#059669" style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>{successMsg}</span>
          <button
            type="button"
            onClick={() => setSuccessMsg(null)}
            style={{ background: "transparent", border: "none", color: "#065f46", cursor: "pointer", fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Error Notification */}
      {errorMsg && (
        <div style={{
          padding: "12px 18px",
          borderRadius: 10,
          background: "#fef2f2",
          border: "1px solid #fecaca",
          color: "#991b1b",
          fontWeight: 600,
          fontSize: "0.88rem",
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 16,
        }}>
          <AlertCircle size={18} color="#dc2626" style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>{errorMsg}</span>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            style={{ background: "transparent", border: "none", color: "#991b1b", cursor: "pointer", fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Reorderable Categories List */}
      <div style={{
        borderRadius: 14,
        border: "1.5px solid #e2e8f0",
        overflow: "hidden",
        background: "#ffffff",
        marginBottom: 24,
      }}>
        {/* Table / List Header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "70px 100px 1fr 180px 120px",
          padding: "12px 18px",
          background: "#f8fafc",
          borderBottom: "1.5px solid #e2e8f0",
          color: "#475569",
          fontSize: "0.76rem",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          alignItems: "center",
        }}>
          <div style={{ textAlign: "center" }}>Order</div>
          <div>Position</div>
          <div>Category Name</div>
          <div>Storefront Link</div>
          <div style={{ textAlign: "right" }}>Move</div>
        </div>

        {/* Draggable Rows */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {items.map((cat, index) => {
            const isDragging = draggedIndex === index;
            const isDragOver = dragOverIndex === index;
            const position = index + 1;
            const linkHref = getStorefrontLink(cat.slug, cat.id);

            return (
              <div
                key={cat.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                onDrop={(e) => handleDrop(e, index)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "70px 100px 1fr 180px 120px",
                  padding: "14px 18px",
                  alignItems: "center",
                  background: isDragging
                    ? "#fdf2f8"
                    : isDragOver
                    ? "#fce7f3"
                    : index % 2 === 0
                    ? "#ffffff"
                    : "#fafafa",
                  borderBottom: index < items.length - 1 ? "1px solid #f1f5f9" : "none",
                  borderTop: isDragOver ? "2px solid #db2777" : "none",
                  opacity: isDragging ? 0.45 : 1,
                  cursor: "grab",
                  transition: "background 0.15s ease, opacity 0.15s ease",
                  userSelect: "none",
                }}
              >
                {/* Drag Handle */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
                  <GripVertical size={18} style={{ cursor: "grab" }} />
                </div>

                {/* Position Badge */}
                <div>
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 30,
                    height: 28,
                    padding: "0 10px",
                    borderRadius: 20,
                    background: position === 1 ? "#fdf2f8" : "#f1f5f9",
                    color: position === 1 ? "#be185d" : "#334155",
                    fontWeight: 800,
                    fontSize: "0.86rem",
                    border: position === 1 ? "1.5px solid #fbcfe8" : "1px solid #e2e8f0",
                  }}>
                    #{position}
                  </span>
                </div>

                {/* Category Info with Image */}
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    overflow: "hidden",
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    flexShrink: 0,
                  }}>
                    <img
                      src={cat.image || "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647361/occasions/categories/categories-flower-bouquet.jpg"}
                      alt={cat.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => {
                        e.currentTarget.src = "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647361/occasions/categories/categories-flower-bouquet.jpg";
                      }}
                    />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.95rem" }}>
                      {cat.name}
                    </div>
                    <div style={{ fontSize: "0.76rem", color: "#64748b", display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                      <span>Slug: <code>{cat.slug}</code></span>
                      <span style={{
                        display: "inline-block",
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#10b981",
                      }} />
                      <span style={{ color: "#059669", fontWeight: 600 }}>Active</span>
                    </div>
                  </div>
                </div>

                {/* Storefront Link Preview */}
                <div>
                  <a
                    href={linkHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      color: "#db2777",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      textDecoration: "none",
                      background: "#fdf2f8",
                      padding: "4px 8px",
                      borderRadius: 6,
                    }}
                  >
                    <span>{linkHref}</span>
                    <ExternalLink size={12} />
                  </a>
                </div>

                {/* Move Controls: Up & Down Arrows */}
                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveUp(index);
                    }}
                    disabled={index === 0}
                    title="Move Up"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      border: "1px solid #cbd5e1",
                      background: index === 0 ? "#f8fafc" : "#ffffff",
                      color: index === 0 ? "#cbd5e1" : "#1e293b",
                      cursor: index === 0 ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <MoveUp size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveDown(index);
                    }}
                    disabled={index === items.length - 1}
                    title="Move Down"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      border: "1px solid #cbd5e1",
                      background: index === items.length - 1 ? "#f8fafc" : "#ffffff",
                      color: index === items.length - 1 ? "#cbd5e1" : "#1e293b",
                      cursor: index === items.length - 1 ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <MoveDown size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Storefront Sequence Preview */}
      <div style={{
        background: "#fafafa",
        border: "1.5px dashed #cbd5e1",
        borderRadius: 14,
        padding: "16px 20px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Eye size={16} color="#db2777" />
          <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#334155", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Live Storefront Homepage Sequence Preview
          </span>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          {items.map((cat, idx) => (
            <React.Fragment key={cat.id}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "#ffffff",
                padding: "8px 12px",
                borderRadius: 10,
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}>
                <span style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: idx === 0 ? "#db2777" : "#64748b",
                  color: "#ffffff",
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  {idx + 1}
                </span>
                <span style={{ fontSize: "0.84rem", fontWeight: 700, color: "#1e293b" }}>
                  {cat.name}
                </span>
              </div>
              {idx < items.length - 1 && (
                <span style={{ color: "#94a3b8", fontWeight: 800, fontSize: "0.9rem" }}>→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
