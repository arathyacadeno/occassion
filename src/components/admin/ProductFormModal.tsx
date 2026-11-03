"use client";

import React, { useState, useEffect, useRef } from "react";
import MediaLibrary from "@/components/admin/MediaLibrary";
import {
  X,
  Upload,
  Image as ImageIcon,
  Plus,
  Trash2,
  Sparkles,
  Check,
  AlertCircle,
  Tag,
  Layers,
  DollarSign,
  Package,
} from "lucide-react";

const EMPTY_ARRAY: any[] = [];
const DEFAULT_CATEGORIES = [
  { id: "cat-flower-bouquet", name: "Flower Bouquet", slug: "flower-bouquet" },
  { id: "cat-flower-basket", name: "Flower Basket", slug: "flower-basket" },
  { id: "cat-cakes", name: "Cakes", slug: "cakes" },
  { id: "cat-table-decor", name: "Table Decor", slug: "table-decor" },
  { id: "cat-wreath", name: "Wreath", slug: "wreath" },
];

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: any | null;
  categories: Array<{ id: string; name: string; slug: string }>;
  flowerTypes?: Array<{ id: string; name: string; slug: string }>;
  occasions?: Array<{ id: string; name: string; slug: string }>;
  onSave: (productData: any) => Promise<boolean>;
}

export default function ProductFormModal({
  isOpen,
  onClose,
  product,
  categories = DEFAULT_CATEGORIES,
  flowerTypes = EMPTY_ARRAY,
  occasions = EMPTY_ARRAY,
  onSave,
}: ProductFormModalProps) {
  const isEditing = Boolean(product?.id);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [sku, setSku] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [flowerTypeId, setFlowerTypeId] = useState("");
  const [occasionId, setOccasionId] = useState("");
  const [price, setPrice] = useState<number | string>("");
  const [originalPrice, setOriginalPrice] = useState<number | string>("");
  const [stock, setStock] = useState<number | string>(45);
  const [lowStockThreshold, setLowStockThreshold] = useState<number | string>(5);
  const [status, setStatus] = useState<"published" | "draft" | "archived">("published");
  const [type, setType] = useState<"flower" | "cake" | "basket" | "wreath" | "decor" | "general">("flower");
  const [featured, setFeatured] = useState(false);
  const [badge, setBadge] = useState("");
  const [deliveryInfo, setDeliveryInfo] = useState("Same-day Calicut express delivery available");
  const [images, setImages] = useState<string[]>([]);
  const [customImageUrl, setCustomImageUrl] = useState("");

  // Category specific attributes
  const [flavour, setFlavour] = useState("");
  const [cakeWeight, setCakeWeight] = useState("1kg");
  const [egglessAvailable, setEgglessAvailable] = useState(true);
  const [stemPrice, setStemPrice] = useState<number | string>(60);
  const [minStems, setMinStems] = useState<number | string>(12);
  const [maxStems, setMaxStems] = useState<number | string>(42);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Initialize or reset form
  useEffect(() => {
    if (!isOpen) {
      setSku("");
      setError(null);
      return;
    }

    if (product) {
      setName(product.name || "");
      setSlug(product.slug || "");
      setSku(product.sku || "");
      setShortDescription(product.shortDescription || product.short_description || "");
      setDescription(product.description || "");
      setCategoryId(product.categoryId || product.category_id || (categories[0]?.id || "cat-flower-bouquet"));
      setFlowerTypeId(product.flowerTypeId || product.flower_type_id || "");
      setOccasionId(product.occasionId || product.occasion_id || "");
      setPrice(product.price ?? "");
      setOriginalPrice(product.originalPrice || product.discount_price || "");
      setStock(product.stock ?? 45);
      setLowStockThreshold(product.lowStockThreshold || product.low_stock_threshold || 5);
      setStatus(product.status || (product.active ? "published" : "draft"));
      setType(product.type || "flower");
      setFeatured(Boolean(product.featured));
      setBadge(product.badge || "");
      setDeliveryInfo(product.deliveryInfo || product.delivery_info || "Same-day Calicut express delivery available");

      let parsedImgs: string[] = [];
      if (Array.isArray(product.images)) {
        parsedImgs = product.images;
      } else if (typeof product.images === "string") {
        try {
          parsedImgs = JSON.parse(product.images);
        } catch {
          parsedImgs = [product.images];
        }
      }
      setImages(parsedImgs.length > 0 ? parsedImgs : [product.image || "/images/cat-flower-bouquet-luxe.jpg"]);

      const attrs = typeof product.attributes === "object" ? product.attributes : {};
      setFlavour(attrs?.flavour || "");
      setCakeWeight(attrs?.weight || "1kg");
      setEgglessAvailable(attrs?.egglessAvailable ?? true);
      setStemPrice(attrs?.stemPrice ?? 60);
      setMinStems(attrs?.minStems ?? 12);
      setMaxStems(attrs?.maxStems ?? 42);
    } else {
      // Reset for new product
      setName("");
      setSlug("");
      // Generate a stable SKU once if not already present
      setSku((current) => (current ? current : `SKU-OCC-${Math.floor(100000 + Math.random() * 900000)}`));
      setShortDescription("");
      setDescription("");
      setCategoryId(categories[0]?.id || "cat-flower-bouquet");
      setFlowerTypeId(flowerTypes[0]?.id || "ft-mixed-flowers");
      setOccasionId(occasions[0]?.id || "occ-birthday");
      setPrice("");
      setOriginalPrice("");
      setStock(45);
      setLowStockThreshold(5);
      setStatus("published");
      setType("flower");
      setFeatured(false);
      setBadge("");
      setDeliveryInfo("Same-day Calicut express delivery available");
      setImages(["/images/lily-6-stems.png"]);
      setFlavour("");
      setCakeWeight("1kg");
      setEgglessAvailable(true);
      setStemPrice(60);
      setMinStems(12);
      setMaxStems(42);
    }
    setError(null);
    setShowNewCatInput(false);
    setNewCatName("");
  }, [isOpen, product]);

  if (!isOpen) return null;

  // Auto slug generation on name change when adding new
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing && (!slug || slug === name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""))) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));
    }
  };

  // Upload to Cloudinary via backend endpoint
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "occasions/products");

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (data.success && data.url) {
          setImages((prev) => {
            const filtered = prev.filter((img) => img !== "/images/lily-6-stems.png" && img !== "/images/cat-flower-bouquet-luxe.jpg");
            return [data.url, ...filtered];
          });
        } else {
          throw new Error(data.error || "Failed to upload to Cloudinary");
        }
      }
    } catch (err: any) {
      console.error("Cloudinary upload failed:", err);
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleAddCustomUrl = () => {
    if (!customImageUrl.trim()) return;
    setImages((prev) => [customImageUrl.trim(), ...prev.filter((i) => i !== customImageUrl.trim())]);
    setCustomImageUrl("");
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSetMainImage = (index: number) => {
    setImages((prev) => {
      const selected = prev[index];
      const rest = prev.filter((_, idx) => idx !== index);
      return [selected, ...rest];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Product name is required");
      formRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0 || price === "") {
      setError("Please provide a valid selling price");
      formRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSaving(true);
    try {
      const attributes: Record<string, any> = {};
      if (type === "cake") {
        if (flavour) attributes.flavour = flavour;
        attributes.weight = cakeWeight;
        attributes.egglessAvailable = egglessAvailable;
      } else if (type === "flower") {
        attributes.stemPrice = Number(stemPrice) || 60;
        attributes.minStems = Number(minStems) || 12;
        attributes.maxStems = Number(maxStems) || 42;
      }

      const payload = {
        name: name.trim(),
        slug: slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
        sku: sku.trim(),
        shortDescription: shortDescription.trim(),
        description: description.trim(),
        categoryId: showNewCatInput && newCatName.trim() ? `cat-${newCatName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}` : categoryId,
        flowerTypeId: flowerTypeId || undefined,
        occasionId: occasionId || undefined,
        price: numPrice,
        originalPrice: originalPrice ? Number(originalPrice) : null,
        stock: Number(stock) || 0,
        lowStockThreshold: Number(lowStockThreshold) || 5,
        status,
        type,
        active: status === "published",
        featured,
        badge: badge.trim() || null,
        deliveryInfo: deliveryInfo.trim(),
        images: images.length > 0 ? images : ["/images/cat-flower-bouquet-luxe.jpg"],
        attributes,
      };

      const success = await onSave(payload);
      if (success) {
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const discountPercent =
    originalPrice && Number(originalPrice) > Number(price)
      ? Math.round(((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100)
      : null;

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
          maxWidth: "920px",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#fafafa",
          }}
        >
          <div>
            <h2
              style={{
                margin: "0 0 4px",
                fontSize: "1.35rem",
                fontWeight: 700,
                color: "#831843",
                fontFamily: "var(--font-serif, serif)",
              }}
            >
              {isEditing ? `Edit Product: ${product?.name}` : "Add New Floral / Store Product"}
            </h2>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
              Permanent Cloudinary image storage, inventory management, and storefront publishing.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "#f1f5f9",
              border: "none",
              borderRadius: "50%",
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#475569",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form ref={formRef} onSubmit={handleSubmit} style={{ overflowY: "auto", padding: "24px", flex: 1 }}>
          {error && (
            <div
              style={{
                marginBottom: 20,
                padding: "12px 16px",
                borderRadius: 10,
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#991b1b",
                fontSize: "0.88rem",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Basic Information */}
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#1e293b", margin: "0 0 14px", display: "flex", alignItems: "center", gap: 8 }}>
              <Tag size={16} color="#db2777" />
              <span>Basic Information</span>
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scarlet Whisper Crimson Rose Bouquet"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1.5px solid #e2e8f0",
                    fontSize: "0.92rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                  SKU Code
                </label>
                <input
                  type="text"
                  placeholder="SKU-ROSE-001"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1.5px solid #e2e8f0",
                    fontSize: "0.92rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                  URL Slug
                </label>
                <input
                  type="text"
                  placeholder="scarlet-whisper-rose-bouquet"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1.5px solid #e2e8f0",
                    fontSize: "0.92rem",
                    boxSizing: "border-box",
                    fontFamily: "monospace",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                  Storefront Badge / Tag (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bestseller, Fresh Harvest, Atelier Special"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1.5px solid #e2e8f0",
                    fontSize: "0.92rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                Short Summary (appears in catalogs &amp; previews)
              </label>
              <input
                type="text"
                placeholder="Handcrafted with 18 velvety crimson Dutch roses and fragrant eucalyptus"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1.5px solid #e2e8f0",
                  fontSize: "0.92rem",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                Full Product Story &amp; Details
              </label>
              <textarea
                rows={3}
                placeholder="Comprehensive description of the fresh floral selection, packaging, care guidelines, and boutique story..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1.5px solid #e2e8f0",
                  fontSize: "0.92rem",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />
            </div>
          </div>

          {/* Section 2: Category & Classification */}
          <div style={{ marginBottom: 28, background: "#f8fafc", padding: 18, borderRadius: 14, border: "1px solid #e2e8f0" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#1e293b", margin: "0 0 14px", display: "flex", alignItems: "center", gap: 8 }}>
              <Layers size={16} color="#db2777" />
              <span>Category &amp; Department</span>
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                  Category *
                </label>
                {!showNewCatInput ? (
                  <select
                    value={categoryId}
                    onChange={(e) => {
                      if (e.target.value === "CREATE_NEW") {
                        setShowNewCatInput(true);
                      } else {
                        setCategoryId(e.target.value);
                      }
                    }}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: "1.5px solid #cbd5e1",
                      fontSize: "0.92rem",
                      background: "#fff",
                    }}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                    <option value="CREATE_NEW">+ Create New Category...</option>
                  </select>
                ) : (
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="text"
                      placeholder="e.g. Car Decor, Stage Decor"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      style={{
                        flex: 1,
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: "1.5px solid #db2777",
                        fontSize: "0.9rem",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewCatInput(false)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 8,
                        border: "1px solid #cbd5e1",
                        background: "#fff",
                        fontSize: "0.78rem",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                  Product Type Architecture
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1.5px solid #cbd5e1",
                    fontSize: "0.92rem",
                    background: "#fff",
                  }}
                >
                  <option value="flower">Flower Bouquet / Stems</option>
                  <option value="cake">Gourmet Cake</option>
                  <option value="basket">Flower Basket</option>
                  <option value="wreath">Floral Wreath</option>
                  <option value="decor">Table / Event Decor</option>
                  <option value="general">General Gift</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                  Occasion Theme (Optional)
                </label>
                <select
                  value={occasionId}
                  onChange={(e) => setOccasionId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1.5px solid #cbd5e1",
                    fontSize: "0.92rem",
                    background: "#fff",
                  }}
                >
                  <option value="">Any / Universal Occasion</option>
                  {occasions.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Pricing & Inventory */}
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#1e293b", margin: "0 0 14px", display: "flex", alignItems: "center", gap: 8 }}>
              <DollarSign size={16} color="#db2777" />
              <span>Pricing &amp; Inventory</span>
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                  Selling Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  placeholder="1450"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1.5px solid #e2e8f0",
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                  Regular / Strike Price (₹)
                  {discountPercent && (
                    <span style={{ marginLeft: 8, color: "#059669", fontWeight: 700 }}>
                      ({discountPercent}% OFF)
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="1650"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1.5px solid #e2e8f0",
                    fontSize: "0.95rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                  Stock Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1.5px solid #e2e8f0",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                  Low Stock Alert
                </label>
                <input
                  type="number"
                  min="1"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1.5px solid #e2e8f0",
                    fontSize: "0.95rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Cloudinary Media Gallery */}
          <div style={{ marginBottom: 28, background: "#fdf2f8", padding: 18, borderRadius: 14, border: "1px solid #fce7f3" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#831843", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <ImageIcon size={18} color="#db2777" />
                <span>Product Images &amp; Cloudinary Storage</span>
              </h3>
              {uploading && (
                <span style={{ fontSize: "0.82rem", color: "#db2777", fontWeight: 600 }}>
                  Uploading to Cloudinary CDN...
                </span>
              )}
            </div>

            <p style={{ margin: "0 0 14px", fontSize: "0.84rem", color: "#64748b" }}>
              Upload high-resolution photography. The first image serves as the Main Featured thumbnail.
            </p>

            {/* Upload Toolbar */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 18px",
                  borderRadius: 10,
                  background: "#db2777",
                  color: "#fff",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  cursor: uploading ? "not-allowed" : "pointer",
                }}
              >
                <Upload size={16} />
                <span>{uploading ? "Processing..." : "Upload from Device (Cloudinary)"}</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={uploading}
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />
              </label>

              <button
                type="button"
                onClick={() => setIsMediaPickerOpen(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 18px",
                  borderRadius: 10,
                  background: "#fdf2f8",
                  color: "#be185d",
                  border: "1px solid #fbcfe8",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <ImageIcon size={16} />
                <span>Browse Media Library</span>
              </button>

              <div style={{ display: "flex", gap: 8, flex: 1, minWidth: 260 }}>
                <input
                  type="text"
                  placeholder="Or paste external image URL..."
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                    fontSize: "0.88rem",
                    background: "#fff",
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCustomUrl}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                    background: "#fff",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  Add URL
                </button>
              </div>
            </div>

            {/* Gallery Thumbnails List */}
            <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
              {images.map((img, idx) => (
                <div
                  key={idx}
                  style={{
                    position: "relative",
                    width: 100,
                    height: 100,
                    borderRadius: 10,
                    overflow: "hidden",
                    border: idx === 0 ? "2.5px solid #db2777" : "1.5px solid #cbd5e1",
                    flexShrink: 0,
                    background: "#fff",
                  }}
                >
                  <img src={img} alt={`Preview ${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  {idx === 0 && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: "rgba(219, 39, 119, 0.9)",
                        color: "#fff",
                        fontSize: "0.65rem",
                        textAlign: "center",
                        fontWeight: 700,
                        padding: "2px 0",
                      }}
                    >
                      MAIN
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    title="Remove Image"
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      background: "rgba(0,0,0,0.6)",
                      border: "none",
                      borderRadius: "50%",
                      width: 22,
                      height: 22,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => handleSetMainImage(idx)}
                      title="Set as Main"
                      style={{
                        position: "absolute",
                        bottom: 4,
                        left: 4,
                        background: "rgba(255,255,255,0.85)",
                        border: "none",
                        borderRadius: 4,
                        padding: "2px 5px",
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Make Main
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Category-Specific Attributes */}
          {type === "cake" && (
            <div style={{ marginBottom: 28, background: "#fff7ed", padding: 18, borderRadius: 14, border: "1px solid #fed7aa" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#9a3412", margin: "0 0 12px" }}>
                🎂 Cake Specific Attributes
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                    Flavour / Profile
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Belgian Truffle, Red Velvet"
                    value={flavour}
                    onChange={(e) => setFlavour(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                    Default Weight
                  </label>
                  <select
                    value={cakeWeight}
                    onChange={(e) => setCakeWeight(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff" }}
                  >
                    <option value="0.5kg">0.5 kg (Half kg)</option>
                    <option value="1kg">1.0 kg</option>
                    <option value="1.5kg">1.5 kg</option>
                    <option value="2kg">2.0 kg</option>
                  </select>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 24 }}>
                  <input
                    type="checkbox"
                    id="egglessCheck"
                    checked={egglessAvailable}
                    onChange={(e) => setEgglessAvailable(e.target.checked)}
                    style={{ width: 18, height: 18, cursor: "pointer" }}
                  />
                  <label htmlFor="egglessCheck" style={{ fontSize: "0.88rem", fontWeight: 600, color: "#334155", cursor: "pointer" }}>
                    Eggless Customization Available
                  </label>
                </div>
              </div>
            </div>
          )}

          {type === "flower" && (
            <div style={{ marginBottom: 28, background: "#f0fdf4", padding: 18, borderRadius: 14, border: "1px solid #bbf7d0" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#166534", margin: "0 0 12px" }}>
                🌸 Flower Stems &amp; Customization Rules
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                    Stem Price (₹/stem)
                  </label>
                  <input
                    type="number"
                    min="10"
                    value={stemPrice}
                    onChange={(e) => setStemPrice(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                    Min Stems Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={minStems}
                    onChange={(e) => setMinStems(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                    Max Stems Count
                  </label>
                  <input
                    type="number"
                    min="5"
                    value={maxStems}
                    onChange={(e) => setMaxStems(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff" }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 6: Publishing Status & Highlights */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                Visibility Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1.5px solid #cbd5e1",
                  fontSize: "0.92rem",
                  background: "#fff",
                  fontWeight: 600,
                  color: status === "published" ? "#166534" : "#92400e",
                }}
              >
                <option value="published">Published (Visible in Storefront)</option>
                <option value="draft">Draft (Hidden from Customers)</option>
                <option value="archived">Archived / Unpublished</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 26 }}>
              <input
                type="checkbox"
                id="featuredCheck"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                style={{ width: 20, height: 20, cursor: "pointer" }}
              />
              <label htmlFor="featuredCheck" style={{ fontSize: "0.92rem", fontWeight: 600, color: "#1e293b", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <Sparkles size={16} color="#d97706" />
                <span>Feature in Homepage Highlights &amp; New Arrivals</span>
              </label>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
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
            disabled={saving}
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              border: "1px solid #cbd5e1",
              background: "#fff",
              color: "#475569",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || uploading}
            style={{
              padding: "10px 24px",
              borderRadius: 10,
              border: "none",
              background: "#db2777",
              color: "#fff",
              fontSize: "0.9rem",
              fontWeight: 700,
              cursor: saving || uploading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 12px rgba(219, 39, 119, 0.25)",
            }}
          >
            {saving ? (
              <span>Saving Changes...</span>
            ) : (
              <>
                <Check size={16} />
                <span>{isEditing ? "Save Product Changes" : "Publish Product"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {isMediaPickerOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              maxWidth: 960,
              width: "100%",
              maxHeight: "88vh",
              overflowY: "auto",
              padding: 24,
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "1.2rem", color: "#831843" }}>
                Select Image from Cloudinary Media Library
              </h3>
              <button
                type="button"
                onClick={() => setIsMediaPickerOpen(false)}
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: "50%",
                  width: 32,
                  height: 32,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={16} />
              </button>
            </div>
            <MediaLibrary
              isPickerMode={true}
              onSelectImage={(url) => {
                if (!images.includes(url)) {
                  setImages([...images, url]);
                }
                setIsMediaPickerOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

