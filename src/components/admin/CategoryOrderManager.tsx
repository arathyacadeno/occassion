"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Search,
  Package,
  ChevronsUp,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  display_order?: number;
  active?: number;
}

interface ProductItem {
  id: string;
  name: string;
  slug?: string;
  price?: number;
  originalPrice?: number;
  image?: string;
  images?: string[];
  sku?: string;
  stock?: number;
  status?: string;
  type?: string;
  categoryId?: string;
  category_id?: string;
  categorySlug?: string;
  category_slug?: string;
  categoryLabel?: string;
  categoryName?: string;
  category?: string;
  display_order?: number;
  displayOrder?: number;
}

interface CategoryOrderManagerProps {
  categories?: Category[];
  products?: ProductItem[];
  onRefresh?: () => Promise<void>;
}

// Canonical definition of the 5 customer-facing categories
const DEFAULT_CANONICAL_FIVE: {
  id: string;
  name: string;
  slug: string;
  link: string;
  defaultOrder: number;
  icon: string;
}[] = [
  { id: "cat-flower-bouquet", name: "Flower Bouquet", slug: "flower-bouquet", link: "/flower-bouquets", defaultOrder: 1, icon: "💐" },
  { id: "cat-flower-basket", name: "Flower Basket", slug: "flower-basket", link: "/flower-baskets", defaultOrder: 2, icon: "🧺" },
  { id: "cat-cakes", name: "Cake", slug: "cakes", link: "/cakes", defaultOrder: 3, icon: "🎂" },
  { id: "cat-wreath", name: "Wreath", slug: "wreath", link: "/wreaths", defaultOrder: 4, icon: "🌿" },
  { id: "cat-table-decor", name: "Table Decor", slug: "table-decor", link: "/table-decor", defaultOrder: 5, icon: "🛋️" },
];

export default function CategoryOrderManager({
  categories = [],
  products = [],
  onRefresh,
}: CategoryOrderManagerProps) {
  // Main view mode: 'categories' or 'products'
  const [managerMode, setManagerMode] = useState<"categories" | "products">("categories");

  // ==========================================
  // 1. CATEGORY DISPLAY ORDER STATE
  // ==========================================
  const [catItems, setCatItems] = useState<Category[]>([]);
  const [initialCatOrderIds, setInitialCatOrderIds] = useState<string[]>([]);
  const [catLoading, setCatLoading] = useState<boolean>(true);
  const [catSaving, setCatSaving] = useState<boolean>(false);
  const [catSuccessMsg, setCatSuccessMsg] = useState<string | null>(null);
  const [catErrorMsg, setCatErrorMsg] = useState<string | null>(null);

  // Drag and drop state for categories
  const [draggedCatIndex, setDraggedCatIndex] = useState<number | null>(null);
  const [dragOverCatIndex, setDragOverCatIndex] = useState<number | null>(null);

  // ==========================================
  // 2. PRODUCT DISPLAY ORDER STATE
  // ==========================================
  const [allProductsList, setAllProductsList] = useState<ProductItem[]>([]);
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>("flower-basket");
  const [productSearchQuery, setProductSearchQuery] = useState<string>("");
  const [productItems, setProductItems] = useState<ProductItem[]>([]);
  const [initialProductOrderIds, setInitialProductOrderIds] = useState<string[]>([]);
  const [prodLoading, setProdLoading] = useState<boolean>(false);
  const [prodSaving, setProdSaving] = useState<boolean>(false);
  const [prodSuccessMsg, setProdSuccessMsg] = useState<string | null>(null);
  const [prodErrorMsg, setProdErrorMsg] = useState<string | null>(null);

  // Drag and drop state for products
  const [draggedProdIndex, setDraggedProdIndex] = useState<number | null>(null);
  const [dragOverProdIndex, setDragOverProdIndex] = useState<number | null>(null);

  // ==========================================
  // LOAD & NORMALIZE CATEGORIES
  // ==========================================
  const loadCategories = (catList: Category[]) => {
    const PRIMARY_KEYS = ["flower-bouquet", "flower-basket", "cake", "wreath", "table-decor"];
    const matched: Category[] = [];

    PRIMARY_KEYS.forEach((key) => {
      const found = catList.find((c) => {
        const s = (c.slug || c.id || "").toLowerCase().replace(/^cat-/, "");
        return s.includes(key) || key.includes(s);
      });

      if (found) {
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

    matched.sort((a, b) => {
      const orderA = a.display_order ?? 99;
      const orderB = b.display_order ?? 99;
      if (orderA !== orderB) return orderA - orderB;
      return (a.name || "").localeCompare(b.name || "");
    });

    setCatItems(matched);
    setInitialCatOrderIds(matched.map((m) => m.id));
    setCatLoading(false);
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

  // ==========================================
  // LOAD & MANAGE PRODUCTS
  // ==========================================
  useEffect(() => {
    if (products && products.length > 0) {
      setAllProductsList(products);
    } else {
      fetch("/api/products?limit=500")
        .then((r) => r.json())
        .then((d) => {
          if (d.success && Array.isArray(d.products)) {
            setAllProductsList(d.products);
          }
        })
        .catch((e) => console.error("Error loading products:", e));
    }
  }, [products]);

  // Filter products by selected category
  const filterProductsForCategory = (allProds: ProductItem[], catKey: string) => {
    const normKey = catKey.toLowerCase().replace(/^cat-/, "");

    return allProds.filter((p) => {
      const pCatId = (p.categoryId || p.category_id || "").toLowerCase();
      const pCatSlug = (p.categorySlug || p.category_slug || p.category || "").toLowerCase();
      const pCatName = (p.categoryLabel || p.categoryName || "").toLowerCase();
      const pName = (p.name || "").toLowerCase();
      const pSlug = (p.slug || "").toLowerCase();
      const pType = (p.type || "").toLowerCase();

      if (normKey === "flower-bouquet" || normKey === "bouquet") {
        return (
          (pCatId === "cat-flower-bouquet" ||
            pCatSlug === "flower-bouquet" ||
            pCatSlug === "bouquet" ||
            pCatName.includes("bouquet") ||
            (pType === "flower" && !pName.includes("basket"))) &&
          !pName.includes("basket") &&
          !pName.includes("cake") &&
          !pName.includes("wreath") &&
          !pName.includes("table") &&
          !pCatId.includes("addon")
        );
      }

      if (normKey === "flower-basket" || normKey === "basket") {
        return (
          pCatId === "cat-flower-basket" ||
          pCatSlug === "flower-basket" ||
          pCatSlug === "basket" ||
          pCatName.includes("basket") ||
          pType === "basket" ||
          pName.includes("basket") ||
          pSlug.includes("basket")
        );
      }

      if (normKey === "cake" || normKey === "cakes") {
        return (
          (pCatId === "cat-cakes" ||
            pCatSlug === "cakes" ||
            pCatSlug === "cake" ||
            pCatName.includes("cake") ||
            pType === "cake" ||
            pName.includes("cake") ||
            pSlug.includes("cake")) &&
          !pName.includes("basket")
        );
      }

      if (normKey === "wreath" || normKey === "wreaths") {
        return (
          pCatId === "cat-wreath" ||
          pCatSlug === "wreath" ||
          pCatSlug === "wreaths" ||
          pCatName.includes("wreath") ||
          pType === "wreath" ||
          pName.includes("wreath") ||
          pSlug.includes("wreath")
        );
      }

      if (normKey === "table-decor" || normKey === "table") {
        return (
          pCatId === "cat-table-decor" ||
          pCatSlug === "table-decor" ||
          pCatSlug === "table" ||
          pCatName.includes("table") ||
          pType === "decor" ||
          pName.includes("table") ||
          pName.includes("centerpiece") ||
          pName.includes("runner")
        );
      }

      return false;
    });
  };

  // Sync category product list when category selection or allProducts changes
  useEffect(() => {
    if (!allProductsList || allProductsList.length === 0) return;

    const matched = filterProductsForCategory(allProductsList, selectedCategoryKey);

    // Sort by display_order: if > 0, place in ascending order; otherwise fallback
    matched.sort((a, b) => {
      const orderA = (a.display_order ?? a.displayOrder) || 0;
      const orderB = (b.display_order ?? b.displayOrder) || 0;
      if (orderA > 0 && orderB > 0) return orderA - orderB;
      if (orderA > 0) return -1;
      if (orderB > 0) return 1;
      return (a.name || "").localeCompare(b.name || "");
    });

    setProductItems(matched);
    setInitialProductOrderIds(matched.map((p) => p.id));
    setProdSuccessMsg(null);
    setProdErrorMsg(null);
  }, [selectedCategoryKey, allProductsList]);

  // Compute product counts for each category pill
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    DEFAULT_CANONICAL_FIVE.forEach((cat) => {
      counts[cat.slug] = filterProductsForCategory(allProductsList, cat.slug).length;
    });
    return counts;
  }, [allProductsList]);

  // Visible filtered products based on search query
  const visibleProducts = useMemo(() => {
    if (!productSearchQuery.trim()) return productItems;
    const query = productSearchQuery.toLowerCase().trim();
    return productItems.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const sku = (p.sku || "").toLowerCase();
      return name.includes(query) || sku.includes(query);
    });
  }, [productItems, productSearchQuery]);

  // ==========================================
  // CATEGORY ORDER ACTIONS
  // ==========================================
  const hasCatChanges = JSON.stringify(catItems.map((i) => i.id)) !== JSON.stringify(initialCatOrderIds);

  const handleMoveCatUp = (index: number) => {
    if (index <= 0) return;
    const newItems = [...catItems];
    const temp = newItems[index - 1];
    newItems[index - 1] = newItems[index];
    newItems[index] = temp;
    setCatItems(newItems);
    setCatSuccessMsg(null);
  };

  const handleMoveCatDown = (index: number) => {
    if (index >= catItems.length - 1) return;
    const newItems = [...catItems];
    const temp = newItems[index + 1];
    newItems[index + 1] = newItems[index];
    newItems[index] = temp;
    setCatItems(newItems);
    setCatSuccessMsg(null);
  };

  const handleCatDragStart = (e: React.DragEvent, index: number) => {
    setDraggedCatIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleCatDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverCatIndex !== index) {
      setDragOverCatIndex(index);
    }
  };

  const handleCatDragEnd = () => {
    setDraggedCatIndex(null);
    setDragOverCatIndex(null);
  };

  const handleCatDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedCatIndex === null || draggedCatIndex === targetIndex) {
      setDraggedCatIndex(null);
      setDragOverCatIndex(null);
      return;
    }

    const newItems = [...catItems];
    const [movedItem] = newItems.splice(draggedCatIndex, 1);
    newItems.splice(targetIndex, 0, movedItem);

    setCatItems(newItems);
    setDraggedCatIndex(null);
    setDragOverCatIndex(null);
    setCatSuccessMsg(null);
  };

  const handleResetCatDefault = () => {
    const defaultSorted = [...catItems].sort((a, b) => {
      const defA = DEFAULT_CANONICAL_FIVE.find((d) => d.id === a.id || a.slug.includes(d.slug))?.defaultOrder ?? 99;
      const defB = DEFAULT_CANONICAL_FIVE.find((d) => d.id === b.id || b.slug.includes(d.slug))?.defaultOrder ?? 99;
      return defA - defB;
    });
    setCatItems(defaultSorted);
    setCatSuccessMsg(null);
  };

  const handleSaveCatOrder = async () => {
    setCatSaving(true);
    setCatErrorMsg(null);
    setCatSuccessMsg(null);

    try {
      const orders = catItems.map((cat, idx) => ({
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

      setInitialCatOrderIds(catItems.map((i) => i.id));
      setCatSuccessMsg("Category display order saved successfully! The storefront homepage is now updated with this order.");

      if (onRefresh) {
        await onRefresh();
      }

      setTimeout(() => {
        setCatSuccessMsg(null);
      }, 5000);
    } catch (err: any) {
      console.error("Save category display order error:", err);
      setCatErrorMsg(err.message || "An error occurred while saving the category order.");
    } finally {
      setCatSaving(false);
    }
  };

  // ==========================================
  // PRODUCT ORDER ACTIONS
  // ==========================================
  const hasProductChanges = JSON.stringify(productItems.map((p) => p.id)) !== JSON.stringify(initialProductOrderIds);

  const handleMoveProdUp = (index: number) => {
    if (index <= 0) return;
    const newItems = [...productItems];
    const temp = newItems[index - 1];
    newItems[index - 1] = newItems[index];
    newItems[index] = temp;
    setProductItems(newItems);
    setProdSuccessMsg(null);
  };

  const handleMoveProdDown = (index: number) => {
    if (index >= productItems.length - 1) return;
    const newItems = [...productItems];
    const temp = newItems[index + 1];
    newItems[index + 1] = newItems[index];
    newItems[index] = temp;
    setProductItems(newItems);
    setProdSuccessMsg(null);
  };

  const handleMoveProdToTop = (index: number) => {
    if (index <= 0) return;
    const newItems = [...productItems];
    const [moved] = newItems.splice(index, 1);
    newItems.unshift(moved);
    setProductItems(newItems);
    setProdSuccessMsg(null);
  };

  const handleProdDragStart = (e: React.DragEvent, index: number) => {
    setDraggedProdIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleProdDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverProdIndex !== index) {
      setDragOverProdIndex(index);
    }
  };

  const handleProdDragEnd = () => {
    setDraggedProdIndex(null);
    setDragOverProdIndex(null);
  };

  const handleProdDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedProdIndex === null || draggedProdIndex === targetIndex) {
      setDraggedProdIndex(null);
      setDragOverProdIndex(null);
      return;
    }

    const newItems = [...productItems];
    const [movedItem] = newItems.splice(draggedProdIndex, 1);
    newItems.splice(targetIndex, 0, movedItem);

    setProductItems(newItems);
    setDraggedProdIndex(null);
    setDragOverProdIndex(null);
    setProdSuccessMsg(null);
  };

  const handleResetProdOrder = () => {
    const originalSorted = [...productItems].sort((a, b) => {
      const idxA = initialProductOrderIds.indexOf(a.id);
      const idxB = initialProductOrderIds.indexOf(b.id);
      return idxA - idxB;
    });
    setProductItems(originalSorted);
    setProdSuccessMsg(null);
    setProdErrorMsg(null);
  };

  const handleSaveProdOrder = async () => {
    setProdSaving(true);
    setProdErrorMsg(null);
    setProdSuccessMsg(null);

    try {
      const orders = productItems.map((prod, idx) => ({
        id: prod.id,
        slug: prod.slug,
        display_order: idx + 1,
      }));

      const res = await fetch("/api/products/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ orders }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update product display order");
      }

      setInitialProductOrderIds(productItems.map((p) => p.id));
      const activeCatDef = DEFAULT_CANONICAL_FIVE.find((c) => c.slug === selectedCategoryKey);
      setProdSuccessMsg(`Product display order for ${activeCatDef?.name || "Category"} saved successfully! Category storefront page updated.`);

      if (onRefresh) {
        await onRefresh();
      }

      setTimeout(() => {
        setProdSuccessMsg(null);
      }, 5000);
    } catch (err: any) {
      console.error("Save product display order error:", err);
      setProdErrorMsg(err.message || "An error occurred while saving the product order.");
    } finally {
      setProdSaving(false);
    }
  };

  const activeCategoryDef = DEFAULT_CANONICAL_FIVE.find((c) => c.slug === selectedCategoryKey) || DEFAULT_CANONICAL_FIVE[0];

  const getStorefrontLink = (slug: string, id: string) => {
    const s = (slug || id || "").toLowerCase().replace(/^cat-/, "");
    if (s.includes("flower-bouquet") || s === "bouquet") return "/flower-bouquets";
    if (s.includes("flower-basket") || s === "basket") return "/flower-baskets";
    if (s.includes("cake")) return "/cakes";
    if (s.includes("table-decor")) return "/table-decor";
    if (s.includes("wreath")) return "/wreaths";
    return `/category/${s}`;
  };

  const getProductImage = (prod: ProductItem) => {
    if (prod.image && prod.image.trim()) return prod.image;
    if (Array.isArray(prod.images) && prod.images.length > 0 && prod.images[0]) return prod.images[0];
    return "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647383/occasions/products/flower-bouquet/flower-bouquet-sunshine-and-peach-orchids.jpg";
  };

  if (catLoading) {
    return (
      <div style={{ background: "#ffffff", borderRadius: 18, border: "1px solid #e2e8f0", padding: 40, textAlign: "center" }}>
        <RefreshCw size={24} className="animate-spin" color="#db2777" style={{ margin: "0 auto 12px" }} />
        <div style={{ color: "#64748b", fontSize: "0.9rem" }}>Loading display order sequence from database...</div>
      </div>
    );
  }

  return (
    <div style={{ background: "#ffffff", borderRadius: 18, border: "1px solid #e2e8f0", padding: 26, boxShadow: "0 4px 16px rgba(0, 0, 0, 0.03)" }}>
      {/* ============================================================== */}
      {/* TOP HEADER & SECTION NAVIGATION                                */}
      {/* ============================================================== */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{
              width: 36,
              height: 36,
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
              Category &amp; Product Display Ordering
            </h2>
          </div>
          <p style={{ margin: "4px 0 0", fontSize: "0.86rem", color: "#64748b", lineHeight: 1.5, maxWidth: 650 }}>
            Control the sequence in which categories and products appear on the customer-facing website.
            Rearrange rows via <strong>Drag &amp; Drop</strong> or using the <strong>Up / Down</strong> buttons, then save.
          </p>
        </div>

        {/* View Mode Switcher (Categories vs Products) */}
        <div style={{
          display: "flex",
          background: "#f1f5f9",
          borderRadius: 12,
          padding: 4,
          border: "1px solid #e2e8f0",
        }}>
          <button
            type="button"
            onClick={() => setManagerMode("categories")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              fontSize: "0.85rem",
              fontWeight: managerMode === "categories" ? 700 : 500,
              background: managerMode === "categories" ? "#ffffff" : "transparent",
              color: managerMode === "categories" ? "#db2777" : "#64748b",
              boxShadow: managerMode === "categories" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <Layers size={16} />
            <span>Category Display Order (5)</span>
          </button>

          <button
            type="button"
            onClick={() => setManagerMode("products")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              fontSize: "0.85rem",
              fontWeight: managerMode === "products" ? 700 : 500,
              background: managerMode === "products" ? "#ffffff" : "transparent",
              color: managerMode === "products" ? "#db2777" : "#64748b",
              boxShadow: managerMode === "products" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <Package size={16} />
            <span>Individual Product Order</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODE 1: CATEGORY DISPLAY ORDER                                 */}
      {/* ============================================================== */}
      {managerMode === "categories" && (
        <div>
          {/* Action Header for Categories */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
            <div style={{ fontSize: "0.88rem", color: "#475569", fontWeight: 600 }}>
              Arrange the 5 customer-facing categories:
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={handleResetCatDefault}
                disabled={catSaving}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  borderRadius: 10,
                  border: "1.5px solid #e2e8f0",
                  background: "#f8fafc",
                  color: "#475569",
                  fontSize: "0.84rem",
                  fontWeight: 600,
                  cursor: catSaving ? "not-allowed" : "pointer",
                }}
                title="Reset to default: Flower Bouquet, Flower Basket, Cake, Wreath, Table Decor"
              >
                <RotateCcw size={15} />
                <span>Reset to Default</span>
              </button>

              <button
                type="button"
                onClick={handleSaveCatOrder}
                disabled={catSaving || !hasCatChanges}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "9px 20px",
                  borderRadius: 10,
                  border: "none",
                  background: hasCatChanges ? "linear-gradient(90deg, #db2777, #be185d)" : "#e2e8f0",
                  color: hasCatChanges ? "#ffffff" : "#94a3b8",
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  cursor: hasCatChanges && !catSaving ? "pointer" : "not-allowed",
                  boxShadow: hasCatChanges ? "0 3px 12px rgba(190, 24, 93, 0.3)" : "none",
                }}
              >
                {catSaving ? <RefreshCw size={16} className="animate-spin" /> : <Check size={16} />}
                <span>{catSaving ? "Saving Order..." : "Save Display Order"}</span>
              </button>
            </div>
          </div>

          {/* Success Banner */}
          {catSuccessMsg && (
            <div style={{
              padding: "12px 16px",
              borderRadius: 10,
              background: "#ecfdf5",
              border: "1px solid #a7f3d0",
              color: "#065f46",
              fontSize: "0.88rem",
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 16,
            }}>
              <Check size={18} color="#059669" />
              <span>{catSuccessMsg}</span>
            </div>
          )}

          {/* Error Banner */}
          {catErrorMsg && (
            <div style={{
              padding: "12px 16px",
              borderRadius: 10,
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#991b1b",
              fontSize: "0.88rem",
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 16,
            }}>
              <AlertCircle size={18} color="#dc2626" />
              <span>{catErrorMsg}</span>
            </div>
          )}

          {/* Categories List */}
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden", background: "#f8fafc" }}>
            {catItems.map((cat, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === catItems.length - 1;
              const isDragging = draggedCatIndex === idx;
              const isDragOver = dragOverCatIndex === idx;

              return (
                <div
                  key={cat.id}
                  draggable
                  onDragStart={(e) => handleCatDragStart(e, idx)}
                  onDragOver={(e) => handleCatDragOver(e, idx)}
                  onDragEnd={handleCatDragEnd}
                  onDrop={(e) => handleCatDrop(e, idx)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 18px",
                    background: isDragging ? "#fdf2f8" : isDragOver ? "#fce7f3" : "#ffffff",
                    borderBottom: idx < catItems.length - 1 ? "1px solid #e2e8f0" : "none",
                    borderLeft: isDragOver ? "4px solid #db2777" : "4px solid transparent",
                    transition: "all 0.15s ease",
                    cursor: "grab",
                  }}
                >
                  {/* Left: Drag Handle + Position Badge + Image + Title */}
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ color: "#94a3b8", cursor: "grab", display: "flex", alignItems: "center" }} title="Drag to reorder">
                      <GripVertical size={20} />
                    </div>

                    <div style={{
                      minWidth: 32,
                      height: 32,
                      borderRadius: 8,
                      background: idx === 0 ? "#fef3c7" : idx === 1 ? "#f1f5f9" : "#f8fafc",
                      border: idx === 0 ? "1px solid #fde68a" : "1px solid #e2e8f0",
                      color: idx === 0 ? "#b45309" : "#475569",
                      fontWeight: 800,
                      fontSize: "0.85rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      #{idx + 1}
                    </div>

                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", border: "1px solid #e2e8f0" }}
                      />
                    ) : (
                      <div style={{ width: 44, height: 44, borderRadius: 8, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
                        🌸
                      </div>
                    )}

                    <div>
                      <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.98rem" }}>
                        {cat.name}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "#64748b", display: "flex", gap: 8, alignItems: "center" }}>
                        <span>slug: <code style={{ background: "#f1f5f9", padding: "1px 5px", borderRadius: 4 }}>{cat.slug}</code></span>
                        <span>•</span>
                        <a
                          href={getStorefrontLink(cat.slug, cat.id)}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: "#db2777", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 3 }}
                        >
                          <Eye size={12} />
                          <span>View Section</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Right: Up / Down Arrow Buttons */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => handleMoveCatUp(idx)}
                      disabled={isFirst || catSaving}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 8,
                        border: "1px solid #e2e8f0",
                        background: isFirst ? "#f8fafc" : "#ffffff",
                        color: isFirst ? "#cbd5e1" : "#475569",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: isFirst || catSaving ? "not-allowed" : "pointer",
                      }}
                      title={isFirst ? "Already at top" : "Move up"}
                    >
                      <MoveUp size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMoveCatDown(idx)}
                      disabled={isLast || catSaving}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 8,
                        border: "1px solid #e2e8f0",
                        background: isLast ? "#f8fafc" : "#ffffff",
                        color: isLast ? "#cbd5e1" : "#475569",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: isLast || catSaving ? "not-allowed" : "pointer",
                      }}
                      title={isLast ? "Already at bottom" : "Move down"}
                    >
                      <MoveDown size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODE 2: INDIVIDUAL PRODUCT DISPLAY ORDER                       */}
      {/* ============================================================== */}
      {managerMode === "products" && (
        <div>
          {/* Category Selector Tabs */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6, marginBottom: 16 }}>
            {DEFAULT_CANONICAL_FIVE.map((cat) => {
              const isSelected = selectedCategoryKey === cat.slug;
              const count = categoryCounts[cat.slug] || 0;

              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => {
                    setSelectedCategoryKey(cat.slug);
                    setProductSearchQuery("");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 14px",
                    borderRadius: 10,
                    border: isSelected ? "1.5px solid #db2777" : "1px solid #e2e8f0",
                    background: isSelected ? "#fdf2f8" : "#ffffff",
                    color: isSelected ? "#be185d" : "#475569",
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: "0.86rem",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                  <span style={{
                    fontSize: "0.74rem",
                    padding: "2px 7px",
                    borderRadius: 12,
                    background: isSelected ? "#db2777" : "#f1f5f9",
                    color: isSelected ? "#ffffff" : "#64748b",
                    fontWeight: 700,
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Subheader & Search & Controls */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
            flexWrap: "wrap",
            gap: 12,
            background: "#f8fafc",
            padding: "12px 16px",
            borderRadius: 12,
            border: "1px solid #e2e8f0",
          }}>
            {/* Search Input */}
            <div style={{ position: "relative", minWidth: 260, flex: 1, maxWidth: 380 }}>
              <Search size={16} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                value={productSearchQuery}
                onChange={(e) => setProductSearchQuery(e.target.value)}
                placeholder={`Search in ${activeCategoryDef.name}...`}
                style={{
                  width: "100%",
                  padding: "8px 12px 8px 36px",
                  borderRadius: 8,
                  border: "1px solid #cbd5e1",
                  fontSize: "0.85rem",
                  background: "#ffffff",
                  outline: "none",
                }}
              />
            </div>

            {/* Product Action Buttons */}
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={handleResetProdOrder}
                disabled={prodSaving}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  borderRadius: 10,
                  border: "1.5px solid #e2e8f0",
                  background: "#ffffff",
                  color: "#475569",
                  fontSize: "0.84rem",
                  fontWeight: 600,
                  cursor: prodSaving ? "not-allowed" : "pointer",
                }}
              >
                <RotateCcw size={15} />
                <span>Reset Order</span>
              </button>

              <button
                type="button"
                onClick={handleSaveProdOrder}
                disabled={prodSaving || !hasProductChanges}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "9px 20px",
                  borderRadius: 10,
                  border: "none",
                  background: hasProductChanges ? "linear-gradient(90deg, #db2777, #be185d)" : "#e2e8f0",
                  color: hasProductChanges ? "#ffffff" : "#94a3b8",
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  cursor: hasProductChanges && !prodSaving ? "pointer" : "not-allowed",
                  boxShadow: hasProductChanges ? "0 3px 12px rgba(190, 24, 93, 0.3)" : "none",
                }}
              >
                {prodSaving ? <RefreshCw size={16} className="animate-spin" /> : <Check size={16} />}
                <span>{prodSaving ? "Saving Order..." : "Save Product Order"}</span>
              </button>

              <a
                href={activeCategoryDef.link}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 12px",
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                  background: "#ffffff",
                  color: "#db2777",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                <ExternalLink size={14} />
                <span>View Storefront</span>
              </a>
            </div>
          </div>

          {/* Success Banner */}
          {prodSuccessMsg && (
            <div style={{
              padding: "12px 16px",
              borderRadius: 10,
              background: "#ecfdf5",
              border: "1px solid #a7f3d0",
              color: "#065f46",
              fontSize: "0.88rem",
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 16,
            }}>
              <Check size={18} color="#059669" />
              <span>{prodSuccessMsg}</span>
            </div>
          )}

          {/* Error Banner */}
          {prodErrorMsg && (
            <div style={{
              padding: "12px 16px",
              borderRadius: 10,
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#991b1b",
              fontSize: "0.88rem",
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 16,
            }}>
              <AlertCircle size={18} color="#dc2626" />
              <span>{prodErrorMsg}</span>
            </div>
          )}

          {/* Products Count Indicator */}
          <div style={{ fontSize: "0.84rem", color: "#64748b", marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
            <span>
              Showing <strong>{visibleProducts.length}</strong> of <strong>{productItems.length}</strong> products in <strong>{activeCategoryDef.name}</strong>
            </span>
            <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
              Drag rows or use arrow buttons to arrange order. Products at the top display first on the website.
            </span>
          </div>

          {/* Product Items List */}
          {visibleProducts.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#64748b", border: "1px dashed #cbd5e1", borderRadius: 12 }}>
              <Package size={32} color="#94a3b8" style={{ margin: "0 auto 8px" }} />
              <div>No products found matching &quot;{productSearchQuery}&quot; in {activeCategoryDef.name}</div>
            </div>
          ) : (
            <div style={{
              border: "1px solid #e2e8f0",
              borderRadius: 14,
              overflow: "hidden",
              background: "#ffffff",
              maxHeight: 650,
              overflowY: "auto",
            }}>
              {visibleProducts.map((prod, idx) => {
                const actualIndex = productItems.findIndex((p) => p.id === prod.id);
                const isFirst = actualIndex === 0;
                const isLast = actualIndex === productItems.length - 1;
                const isDragging = draggedProdIndex === actualIndex;
                const isDragOver = dragOverProdIndex === actualIndex;

                return (
                  <div
                    key={prod.id}
                    draggable={!productSearchQuery.trim()}
                    onDragStart={(e) => handleProdDragStart(e, actualIndex)}
                    onDragOver={(e) => handleProdDragOver(e, actualIndex)}
                    onDragEnd={handleProdDragEnd}
                    onDrop={(e) => handleProdDrop(e, actualIndex)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 16px",
                      background: isDragging ? "#fdf2f8" : isDragOver ? "#fce7f3" : "#ffffff",
                      borderBottom: idx < visibleProducts.length - 1 ? "1px solid #e2e8f0" : "none",
                      borderLeft: isDragOver ? "4px solid #db2777" : "4px solid transparent",
                      transition: "all 0.15s ease",
                      cursor: !productSearchQuery.trim() ? "grab" : "default",
                    }}
                  >
                    {/* Left: Drag Handle + Position Badge + Image + Name + Details */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          color: productSearchQuery.trim() ? "#cbd5e1" : "#94a3b8",
                          cursor: productSearchQuery.trim() ? "not-allowed" : "grab",
                          display: "flex",
                          alignItems: "center",
                        }}
                        title={productSearchQuery.trim() ? "Clear search to reorder via drag & drop" : "Drag to reorder"}
                      >
                        <GripVertical size={18} />
                      </div>

                      <div style={{
                        minWidth: 32,
                        height: 30,
                        borderRadius: 8,
                        background: actualIndex === 0 ? "#fef3c7" : actualIndex === 1 ? "#f1f5f9" : "#f8fafc",
                        border: actualIndex === 0 ? "1px solid #fde68a" : "1px solid #e2e8f0",
                        color: actualIndex === 0 ? "#b45309" : "#475569",
                        fontWeight: 800,
                        fontSize: "0.82rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                        #{actualIndex + 1}
                      </div>

                      <img
                        src={getProductImage(prod)}
                        alt={prod.name}
                        style={{ width: 42, height: 42, borderRadius: 8, objectFit: "cover", border: "1px solid #e2e8f0", flexShrink: 0 }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647383/occasions/products/flower-bouquet/flower-bouquet-sunshine-and-peach-orchids.jpg";
                        }}
                      />

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.92rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {prod.name}
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "#64748b", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                          <span style={{ fontWeight: 600, color: "#0f172a" }}>₹{Number(prod.price || 0).toLocaleString()}</span>
                          {prod.sku && <span>• SKU: <code style={{ background: "#f1f5f9", padding: "1px 4px", borderRadius: 4 }}>{prod.sku}</code></span>}
                          <span>•</span>
                          <span style={{
                            fontSize: "0.72rem",
                            padding: "1px 6px",
                            borderRadius: 10,
                            background: "#ecfdf5",
                            color: "#059669",
                            fontWeight: 600,
                          }}>
                            {prod.status || "Published"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Quick Action Buttons (Up, Down, Move to Top) */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => handleMoveProdToTop(actualIndex)}
                        disabled={isFirst || prodSaving}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "6px 9px",
                          borderRadius: 8,
                          border: "1px solid #e2e8f0",
                          background: isFirst ? "#f8fafc" : "#ffffff",
                          color: isFirst ? "#cbd5e1" : "#475569",
                          fontSize: "0.76rem",
                          fontWeight: 600,
                          cursor: isFirst || prodSaving ? "not-allowed" : "pointer",
                        }}
                        title="Move directly to position #1 (Top)"
                      >
                        <ChevronsUp size={14} />
                        <span>Top</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMoveProdUp(actualIndex)}
                        disabled={isFirst || prodSaving}
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 8,
                          border: "1px solid #e2e8f0",
                          background: isFirst ? "#f8fafc" : "#ffffff",
                          color: isFirst ? "#cbd5e1" : "#475569",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: isFirst || prodSaving ? "not-allowed" : "pointer",
                        }}
                        title={isFirst ? "Already at top" : "Move up"}
                      >
                        <MoveUp size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMoveProdDown(actualIndex)}
                        disabled={isLast || prodSaving}
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 8,
                          border: "1px solid #e2e8f0",
                          background: isLast ? "#f8fafc" : "#ffffff",
                          color: isLast ? "#cbd5e1" : "#475569",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: isLast || prodSaving ? "not-allowed" : "pointer",
                        }}
                        title={isLast ? "Already at bottom" : "Move down"}
                      >
                        <MoveDown size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
