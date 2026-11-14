"use client";

import React, { useState } from "react";
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  Upload,
  Image as ImageIcon,
  Check,
  X,
  AlertTriangle,
  FolderOpen,
  ArrowUpDown,
  ShoppingBag,
  Tag,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  display_order?: number;
  active?: number;
  product_count?: number;
}

interface CategoryManagerProps {
  categories: Category[];
  onRefresh: () => Promise<void>;
}

export default function CategoryManager({ categories, onRefresh }: CategoryManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [active, setActive] = useState(true);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Lock background body scroll when modal is open
  React.useEffect(() => {
    if (!isModalOpen && !deleteModalOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isModalOpen, deleteModalOpen]);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setDescription("");
    setImage("/images/cat-flower-bouquet-luxe.jpg");
    setDisplayOrder(categories.length);
    setActive(true);
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name || "");
    setSlug(cat.slug || "");
    setDescription(cat.description || "");
    setImage(cat.image || "/images/cat-flower-bouquet-luxe.jpg");
    setDisplayOrder(cat.display_order ?? 0);
    setActive(cat.active !== 0);
    setError(null);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));
    }
  };

  // Upload category image to Cloudinary
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "occasions/categories");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setImage(data.url);
      } else {
        throw new Error(data.error || "Failed to upload image");
      }
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Category name is required");
      return;
    }

    setSaving(true);
    try {
      const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      const payload = {
        name: name.trim(),
        slug: cleanSlug,
        description: description.trim(),
        image: image || "/images/cat-flower-bouquet-luxe.jpg",
        displayOrder: Number(displayOrder) || 0,
        active: active ? 1 : 0,
      };

      const url = editingCategory
        ? `/api/categories/${encodeURIComponent(editingCategory.id)}`
        : `/api/categories`;
      const method = editingCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to save category");
      }

      setSuccessMsg(`✓ Category '${payload.name}' ${editingCategory ? "updated" : "created"} successfully`);
      setTimeout(() => setSuccessMsg(null), 4000);
      setIsModalOpen(false);
      await onRefresh();
    } catch (err: any) {
      setError(err.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (cat: Category) => {
    const nextActive = cat.active === 0 ? 1 : 0;
    try {
      const res = await fetch(`/api/categories/${encodeURIComponent(cat.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: nextActive }),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`✓ Category '${cat.name}' is now ${nextActive ? "Active" : "Disabled"}`);
        setTimeout(() => setSuccessMsg(null), 3000);
        await onRefresh();
      }
    } catch (err) {
      console.error("Failed to toggle category active:", err);
    }
  };

  const handleOpenDelete = (cat: Category) => {
    setCategoryToDelete(cat);
    setDeleteError(null);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/categories/${encodeURIComponent(categoryToDelete.id)}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to delete category");
      }

      setSuccessMsg(`✓ Category '${categoryToDelete.name}' deleted successfully`);
      setTimeout(() => setSuccessMsg(null), 4000);
      setDeleteModalOpen(false);
      await onRefresh();
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete category");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ background: "#ffffff", borderRadius: 18, border: "1px solid #e2e8f0", padding: 24, boxShadow: "0 4px 16px rgba(0, 0, 0, 0.03)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 14 }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-serif)", color: "#831843", fontSize: "1.45rem", margin: "0 0 4px" }}>
            Storefront Category Management
          </h2>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
            Manage product categories, organize storefront navigation, and configure display order.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "9px 18px",
            borderRadius: 10,
            border: "none",
            background: "#db2777",
            color: "#ffffff",
            fontSize: "0.88rem",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(219, 39, 119, 0.25)",
          }}
        >
          <Plus size={18} />
          <span>Add New Category</span>
        </button>
      </div>

      {successMsg && (
        <div style={{ padding: "12px 18px", borderRadius: 10, background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", fontWeight: 600, fontSize: "0.9rem", marginBottom: 18 }}>
          {successMsg}
        </div>
      )}

      {/* Categories Table */}
      <div style={{ overflowX: "auto", width: "100%" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1.5px solid #e2e8f0" }}>
              <th style={{ padding: "12px 14px", color: "#475569", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase" }}>Category</th>
              <th style={{ padding: "12px 14px", color: "#475569", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase" }}>Slug / URL</th>
              <th style={{ padding: "12px 14px", color: "#475569", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase" }}>Assigned Products</th>
              <th style={{ padding: "12px 14px", color: "#475569", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase" }}>Display Order</th>
              <th style={{ padding: "12px 14px", color: "#475569", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase" }}>Status</th>
              <th style={{ padding: "12px 14px", color: "#475569", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "48px 20px", color: "#64748b" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                    <div style={{ width: 50, height: 50, borderRadius: "50%", background: "#fdf2f8", border: "1px solid #fce7f3", display: "flex", alignItems: "center", justifyContent: "center", color: "#db2777" }}>
                      <Tag size={24} />
                    </div>
                    <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "0.95rem" }}>
                      No categories found
                    </div>
                    <div style={{ color: "#64748b", fontSize: "0.85rem" }}>
                      Click &quot;Add New Category&quot; above to create your first store category.
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              categories.map((c) => (
              <tr key={c.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <img
                      src={c.image || "/images/cat-flower-bouquet-luxe.jpg"}
                      alt={c.name}
                      style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", border: "1px solid #e2e8f0", background: "#f8fafc" }}
                      onError={(e: any) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 24 24' fill='%23fdf2f8' stroke='%23db2777' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='100%25' height='100%25' fill='%23fdf2f8' rx='8'/%3E%3Cpath d='M12 3a4 4 0 0 0-4 4c0 2 4 6 4 6s4-4 4-6a4 4 0 0 0-4-4z' fill='%23fce7f3'/%3E%3Cpath d='M12 13v7' stroke='%23be185d'/%3E%3Cpath d='M9 17c1.5 0 3-1.5 3-1.5s1.5 1.5 3 1.5' stroke='%23be185d'/%3E%3C/svg%3E";
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.92rem" }}>{c.name}</div>
                      {c.description && (
                        <div style={{ fontSize: "0.75rem", color: "#64748b", maxWidth: 280, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {c.description}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                <td style={{ padding: 14, fontFamily: "monospace", fontSize: "0.82rem", color: "#64748b" }}>
                  /{c.slug}
                </td>

                <td style={{ padding: 14 }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "4px 10px",
                      borderRadius: 16,
                      background: (c.product_count || 0) > 0 ? "#fdf2f8" : "#f1f5f9",
                      color: (c.product_count || 0) > 0 ? "#be185d" : "#64748b",
                      fontWeight: 700,
                      fontSize: "0.78rem",
                    }}
                  >
                    <ShoppingBag size={12} />
                    <span>{c.product_count || 0} Products</span>
                  </span>
                </td>

                <td style={{ padding: 14, fontWeight: 600, color: "#334155" }}>
                  {c.display_order ?? 0}
                </td>

                <td style={{ padding: 14 }}>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(c)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 16,
                      border: "none",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      background: c.active !== 0 ? "#dcfce7" : "#fee2e2",
                      color: c.active !== 0 ? "#166534" : "#991b1b",
                    }}
                  >
                    {c.active !== 0 ? "Active" : "Disabled"}
                  </button>
                </td>

                <td style={{ padding: 14 }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(c)}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 6,
                        border: "1px solid #e2e8f0",
                        background: "#fff",
                        color: "#475569",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Edit size={14} />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenDelete(c)}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 6,
                        border: "1px solid #fecaca",
                        background: "#fff",
                        color: "#dc2626",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.65)", backdropFilter: "blur(4px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#ffffff", borderRadius: 18, width: "100%", maxWidth: "560px", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fafafa" }}>
              <div style={{ fontWeight: 700, fontSize: "1.15rem", color: "#831843" }}>
                {editingCategory ? `Edit Category: ${editingCategory.name}` : "Create New Category"}
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748b" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} style={{ padding: 24 }}>
              {error && (
                <div style={{ padding: "10px 14px", borderRadius: 8, background: "#fee2e2", color: "#991b1b", fontSize: "0.85rem", marginBottom: 16 }}>
                  {error}
                </div>
              )}

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stage Decor, Car Decor, Church Floral"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: "0.92rem", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  placeholder="stage-decor"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: "0.92rem", boxSizing: "border-box", fontFamily: "monospace" }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Artisanal stage and backdrop floral arrangements..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: "0.92rem", boxSizing: "border-box", fontFamily: "inherit" }}
                />
              </div>

              {/* Image Upload */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                  Category Banner / Cover Image
                </label>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <img
                    src={image || "/images/cat-flower-bouquet-luxe.jpg"}
                    alt="Category preview"
                    style={{ width: 56, height: 56, borderRadius: 8, objectFit: "cover", border: "1px solid #e2e8f0" }}
                    onError={(e: any) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 24 24' fill='%23fdf2f8' stroke='%23db2777' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='100%25' height='100%25' fill='%23fdf2f8' rx='8'/%3E%3Cpath d='M12 3a4 4 0 0 0-4 4c0 2 4 6 4 6s4-4 4-6a4 4 0 0 0-4-4z' fill='%23fce7f3'/%3E%3Cpath d='M12 13v7' stroke='%23be185d'/%3E%3Cpath d='M9 17c1.5 0 3-1.5 3-1.5s1.5 1.5 3 1.5' stroke='%23be185d'/%3E%3C/svg%3E";
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "8px 14px",
                        borderRadius: 8,
                        background: "#fdf2f8",
                        color: "#be185d",
                        border: "1px solid #fce7f3",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        cursor: uploading ? "not-allowed" : "pointer",
                      }}
                    >
                      <Upload size={14} />
                      <span>{uploading ? "Uploading to Cloudinary..." : "Upload New Image"}</span>
                      <input type="file" accept="image/*" disabled={uploading} onChange={handleImageUpload} style={{ display: "none" }} />
                    </label>
                    <input
                      type="text"
                      placeholder="Or enter image URL..."
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: "0.8rem", marginTop: 6, boxSizing: "border-box" }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: "0.9rem", boxSizing: "border-box" }}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 24 }}>
                  <input
                    type="checkbox"
                    id="catActiveCheck"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    style={{ width: 18, height: 18, cursor: "pointer" }}
                  />
                  <label htmlFor="catActiveCheck" style={{ fontSize: "0.88rem", fontWeight: 600, color: "#334155", cursor: "pointer" }}>
                    Category is Active
                  </label>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: "9px 16px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", color: "#475569", fontWeight: 600, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  style={{
                    padding: "9px 20px",
                    borderRadius: 8,
                    border: "none",
                    background: "#db2777",
                    color: "#fff",
                    fontWeight: 700,
                    cursor: saving || uploading ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Check size={16} />
                  <span>{saving ? "Saving..." : (editingCategory ? "Update Category" : "Create Category")}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && categoryToDelete && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.65)", backdropFilter: "blur(4px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#ffffff", borderRadius: 18, width: "100%", maxWidth: "460px", overflow: "hidden", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)" }}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #fee2e2", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fef2f2" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#991b1b", fontWeight: 700 }}>
                <AlertTriangle size={20} />
                <span>Delete Category</span>
              </div>
              <button type="button" onClick={() => setDeleteModalOpen(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#991b1b" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: 24 }}>
              {deleteError && (
                <div style={{ padding: "10px 14px", borderRadius: 8, background: "#fee2e2", color: "#991b1b", fontSize: "0.85rem", marginBottom: 16 }}>
                  {deleteError}
                </div>
              )}

              <p style={{ margin: "0 0 14px", fontSize: "0.9rem", color: "#334155" }}>
                Are you sure you want to delete category <strong>{categoryToDelete.name}</strong>?
              </p>

              {(categoryToDelete.product_count || 0) > 0 ? (
                <div style={{ padding: "12px 14px", borderRadius: 10, background: "#fff1f2", border: "1px solid #fecdd3", color: "#be123c", fontSize: "0.85rem" }}>
                  <strong>Safety Lock:</strong> This category currently contains <strong>{categoryToDelete.product_count} product(s)</strong>. To prevent breaking storefront listings, you must reassign or remove these products first, or disable this category instead.
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: "0.82rem", color: "#64748b" }}>
                  This category contains 0 products and can be safely deleted.
                </p>
              )}
            </div>

            <div style={{ padding: "16px 24px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", gap: 10, background: "#fafafa" }}>
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", color: "#475569", fontWeight: 600, cursor: "pointer" }}
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={(categoryToDelete.product_count || 0) > 0 || deleting}
                onClick={handleConfirmDelete}
                style={{
                  padding: "8px 18px",
                  borderRadius: 8,
                  border: "none",
                  background: (categoryToDelete.product_count || 0) > 0 ? "#94a3b8" : "#dc2626",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: (categoryToDelete.product_count || 0) > 0 || deleting ? "not-allowed" : "pointer",
                }}
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

