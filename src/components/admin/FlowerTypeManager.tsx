"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Flower2,
  Plus,
  Edit,
  Trash2,
  Upload,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  Search,
  Eye,
  EyeOff,
  Sparkles,
  ArrowUpDown,
  Image as ImageIcon,
  CheckCircle,
  Package,
  Layers,
  Info,
} from "lucide-react";
import { useScrollLock } from "@/lib/scrollLock";

export interface FlowerType {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  description: string | null;
  is_active: number;
  display_order: number;
  product_count?: number;
  created_at?: string;
  updated_at?: string;
}

interface FlowerTypeManagerProps {
  onRefresh?: () => Promise<void>;
}

export default function FlowerTypeManager({ onRefresh }: FlowerTypeManagerProps) {
  const [flowerTypes, setFlowerTypes] = useState<FlowerType[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFlowerType, setEditingFlowerType] = useState<FlowerType | null>(null);
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDisplayOrder, setFormDisplayOrder] = useState<number>(0);
  const [formIsActive, setFormIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Delete Confirmation Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [flowerToDelete, setFlowerToDelete] = useState<FlowerType | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useScrollLock(isModalOpen || deleteModalOpen);

  // Fetch all flower types (with product counts)
  const fetchFlowerTypes = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/flowers?all=true&_t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.flowers)) {
        setFlowerTypes(data.flowers);
      } else {
        setErrorMsg(data.error || "Failed to load flower types.");
      }
    } catch {
      setErrorMsg("Network error loading flower types. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlowerTypes();
  }, [fetchFlowerTypes]);

  // Open modal to add a brand new flower type
  const handleOpenAdd = () => {
    setEditingFlowerType(null);
    setFormName("");
    setFormSlug("");
    setFormImage("");
    setFormDescription("");
    setFormDisplayOrder(flowerTypes.length + 1);
    setFormIsActive(true);
    setModalError(null);
    setIsModalOpen(true);
  };

  // Open modal to edit existing flower type
  const handleOpenEdit = (item: FlowerType) => {
    setEditingFlowerType(item);
    setFormName(item.name);
    setFormSlug(item.slug);
    setFormImage(item.image || "");
    setFormDescription(item.description || "");
    setFormDisplayOrder(Number(item.display_order) || 0);
    setFormIsActive(item.is_active === 1);
    setModalError(null);
    setIsModalOpen(true);
  };

  // Handle image upload to Cloudinary via /api/admin/upload
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setModalError("Please select a valid image file (JPG, PNG, WebP).");
      return;
    }

    setUploadingImage(true);
    setModalError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "products/general");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();
      if (data.success && data.url) {
        setFormImage(data.url);
      } else {
        setModalError(data.error || "Failed to upload image. Please try again.");
      }
    } catch (err: any) {
      setModalError(err.message || "Network error while uploading image.");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Save changes (Create or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim()) {
      setModalError("Flower type name is required.");
      return;
    }

    setSaving(true);
    setModalError(null);

    const isEdit = Boolean(editingFlowerType);
    const url = isEdit ? `/api/flowers/${editingFlowerType!.id}` : "/api/flowers";
    const method = isEdit ? "PUT" : "POST";

    const payload = {
      name: formName.trim(),
      slug: formSlug.trim() || undefined,
      image: formImage.trim() || null,
      description: formDescription.trim() || null,
      is_active: formIsActive ? 1 : 0,
      display_order: Number(formDisplayOrder) || 0,
    };

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(isEdit ? `Updated "${formName}" successfully!` : `Created "${formName}" successfully!`);
        setTimeout(() => setSuccessMsg(null), 3500);

        setIsModalOpen(false);
        await fetchFlowerTypes();
        if (onRefresh) await onRefresh();

        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("occasions:flower-types-changed"));
        }
      } else {
        setModalError(data.error || "Failed to save flower type.");
      }
    } catch {
      setModalError("Network error while saving.");
    } finally {
      setSaving(false);
    }
  };

  // Quick toggle active / inactive directly from the list
  const handleToggleActive = async (item: FlowerType) => {
    const newActiveState = item.is_active === 1 ? 0 : 1;
    try {
      const res = await fetch(`/api/flowers/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: newActiveState }),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setFlowerTypes((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, is_active: newActiveState } : f))
        );
        setSuccessMsg(`"${item.name}" is now ${newActiveState === 1 ? "Active" : "Hidden"}.`);
        setTimeout(() => setSuccessMsg(null), 3000);

        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("occasions:flower-types-changed"));
        }
      } else {
        setErrorMsg(data.error || "Failed to update status.");
      }
    } catch {
      setErrorMsg("Failed to update status.");
    }
  };

  // Open Delete Modal
  const handleOpenDelete = (item: FlowerType) => {
    setFlowerToDelete(item);
    setDeleteError(null);
    setDeleteModalOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!flowerToDelete) return;
    setDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/flowers/${flowerToDelete.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg(`Deleted "${flowerToDelete.name}" successfully.`);
        setTimeout(() => setSuccessMsg(null), 3500);
        setDeleteModalOpen(false);
        setFlowerToDelete(null);

        await fetchFlowerTypes();
        if (onRefresh) await onRefresh();

        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("occasions:flower-types-changed"));
        }
      } else {
        setDeleteError(data.error || "Failed to delete flower type.");
      }
    } catch {
      setDeleteError("Network error while attempting to delete.");
    } finally {
      setDeleting(false);
    }
  };

  // Filtered flower types based on search and status
  const filteredTypes = flowerTypes.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (statusFilter === "active") return item.is_active === 1;
    if (statusFilter === "inactive") return item.is_active === 0;
    return true;
  });

  const activeCount = flowerTypes.filter((f) => f.is_active === 1).length;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 60 }}>
      {/* Header Panel */}
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: "24px 28px",
          marginBottom: 20,
          border: "1px solid #fce7f3",
          boxShadow: "0 4px 20px rgba(131, 24, 67, 0.04)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: "#fdf2f8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#db2777",
              }}
            >
              <Flower2 size={20} />
            </div>
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                color: "#831843",
                fontSize: "1.45rem",
                fontWeight: 700,
                margin: 0,
              }}
            >
              Manage Flower Types
            </h1>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "3px 10px",
                borderRadius: 20,
                fontSize: "0.8rem",
                fontWeight: 700,
                background: "#fdf2f8",
                color: "#be185d",
                border: "1px solid #fbcfe8",
              }}
            >
              <Layers size={13} color="#db2777" />
              <span>{flowerTypes.length} Total ({activeCount} Active)</span>
            </span>
          </div>
          <p style={{ color: "#64748b", fontSize: "0.88rem", margin: 0 }}>
            Configure and sort the flower species displayed in the homepage &ldquo;Shop By Flowers&rdquo; carousel and product selectors.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            type="button"
            onClick={fetchFlowerTypes}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              borderRadius: 10,
              border: "1px solid #e2e8f0",
              background: "#fff",
              color: "#475569",
              fontSize: "0.88rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
            title="Refresh list"
          >
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "11px 22px",
              borderRadius: 12,
              border: "none",
              background: "linear-gradient(135deg, #db2777 0%, #be185d 100%)",
              color: "#fff",
              fontSize: "0.92rem",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(219, 39, 119, 0.28)",
              transition: "transform 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <Plus size={18} strokeWidth={2.4} />
            <span>Add New Flower Type</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            color: "#166534",
            padding: "14px 20px",
            borderRadius: 12,
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
            boxShadow: "0 2px 8px rgba(22, 101, 52, 0.06)",
          }}
        >
          <CheckCircle size={20} color="#16a34a" />
          <span style={{ fontWeight: 500 }}>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            padding: "14px 20px",
            borderRadius: 12,
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
            boxShadow: "0 2px 8px rgba(153, 27, 27, 0.06)",
          }}
        >
          <AlertTriangle size={20} color="#dc2626" />
          <span style={{ fontWeight: 500 }}>{errorMsg}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: "12px 20px",
          border: "1px solid #f1f5f9",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div style={{ position: "relative", minWidth: 260, flex: 1, maxWidth: 380 }}>
          <Search
            size={16}
            style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}
          />
          <input
            type="text"
            placeholder="Search flower types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 14px 9px 38px",
              borderRadius: 10,
              border: "1.5px solid #e2e8f0",
              fontSize: "0.88rem",
              outline: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "0.84rem", color: "#64748b", fontWeight: 600 }}>Filter:</span>
          {(
            [
              { id: "all", label: `All (${flowerTypes.length})` },
              { id: "active", label: `Active (${flowerTypes.filter((f) => f.is_active === 1).length})` },
              { id: "inactive", label: `Hidden (${flowerTypes.filter((f) => f.is_active === 0).length})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                border: "none",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
                background: statusFilter === tab.id ? "#db2777" : "#f1f5f9",
                color: statusFilter === tab.id ? "#fff" : "#475569",
                transition: "all 0.15s ease",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Flower Types List / Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
          <RefreshCw size={26} className="animate-spin" style={{ margin: "0 auto 12px", color: "#db2777" }} />
          <p style={{ margin: 0, fontWeight: 500 }}>Loading flower types...</p>
        </div>
      ) : filteredTypes.length === 0 ? (
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: "50px 20px",
            textAlign: "center",
            border: "1px dashed #cbd5e1",
          }}
        >
          <Flower2 size={36} color="#db2777" style={{ margin: "0 auto 12px", opacity: 0.7 }} />
          <h3 style={{ margin: "0 0 6px", color: "#1e293b", fontSize: "1.1rem", fontWeight: 700 }}>
            No flower types found
          </h3>
          <p style={{ margin: "0 0 18px", color: "#64748b", fontSize: "0.88rem" }}>
            {searchQuery ? "No flower types match your search criteria." : "Create your first flower type to display on the homepage."}
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            style={{
              padding: "10px 22px",
              borderRadius: 10,
              background: "#db2777",
              color: "#fff",
              border: "none",
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
          >
            + Add New Flower Type
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          {filteredTypes.map((item) => {
            const isActive = item.is_active === 1;
            const pCount = item.product_count || 0;

            return (
              <div
                key={item.id}
                style={{
                  background: "#fff",
                  borderRadius: 18,
                  border: "1px solid #f1f5f9",
                  overflow: "hidden",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                }}
              >
                {/* Image & Badges Container */}
                <div style={{ position: "relative", width: "100%", height: 190, background: "#fdf2f8" }}>
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#f472b6",
                      }}
                    >
                      <Flower2 size={48} strokeWidth={1.5} />
                    </div>
                  )}

                  {/* Order Tag */}
                  <span
                    style={{
                      position: "absolute",
                      top: 12,
                      left: 12,
                      background: "rgba(15, 23, 42, 0.75)",
                      color: "#fff",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: 6,
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    #{item.display_order}
                  </span>

                  {/* Active / Hidden Badge */}
                  <span
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      background: isActive ? "#16a34a" : "#64748b",
                      color: "#fff",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    {isActive ? <Check size={11} strokeWidth={3} /> : <EyeOff size={11} strokeWidth={2.5} />}
                    <span>{isActive ? "Active" : "Hidden"}</span>
                  </span>
                </div>

                {/* Details Body */}
                <div style={{ padding: "16px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <h3 style={{ margin: 0, fontSize: "1.08rem", fontWeight: 700, color: "#1e293b" }}>
                      {item.name}
                    </h3>
                    <span
                      style={{
                        fontSize: "0.74rem",
                        color: "#94a3b8",
                        background: "#f8fafc",
                        padding: "2px 6px",
                        borderRadius: 4,
                        fontFamily: "monospace",
                      }}
                    >
                      /{item.slug}
                    </span>
                  </div>

                  {item.description && (
                    <p
                      style={{
                        margin: "0 0 10px",
                        fontSize: "0.82rem",
                        color: "#64748b",
                        lineHeight: 1.4,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {item.description}
                    </p>
                  )}

                  <div
                    style={{
                      marginTop: "auto",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingTop: 12,
                      borderTop: "1px solid #f1f5f9",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.78rem",
                        color: pCount > 0 ? "#be185d" : "#94a3b8",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <Package size={13} />
                      <span>{pCount} product{pCount !== 1 ? "s" : ""} linked</span>
                    </span>

                    {/* Quick action buttons */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(item)}
                        title={isActive ? "Hide from homepage" : "Show on homepage"}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          border: "1px solid #e2e8f0",
                          background: "#fff",
                          color: isActive ? "#64748b" : "#16a34a",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                        {isActive ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        title="Edit flower type"
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          border: "1px solid #fbcfe8",
                          background: "#fdf2f8",
                          color: "#db2777",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                        <Edit size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenDelete(item)}
                        title="Delete flower type"
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          border: "1px solid #fee2e2",
                          background: "#fff1f2",
                          color: "#e11d48",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= ADD / EDIT MODAL ================= */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={() => !saving && setIsModalOpen(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              width: "100%",
              maxWidth: 540,
              maxHeight: "92vh",
              overflowY: "auto",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              padding: "26px 30px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: "#fdf2f8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#db2777",
                  }}
                >
                  <Flower2 size={18} />
                </div>
                <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "#831843" }}>
                  {editingFlowerType ? `Edit "${editingFlowerType.name}"` : "Add New Flower Type"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={saving}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: "none",
                  background: "#f1f5f9",
                  color: "#64748b",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#991b1b",
                  padding: "10px 14px",
                  borderRadius: 10,
                  fontSize: "0.85rem",
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <AlertTriangle size={16} />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSave}>
              {/* Name & Slug */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                  Flower Type Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gerberas, Sunflowers, Carnations"
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (!editingFlowerType) {
                      setFormSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/^-+|-+$/g, "")
                      );
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1.5px solid #cbd5e1",
                    fontSize: "0.92rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                  Slug (URL Path Identifier)
                </label>
                <input
                  type="text"
                  placeholder="e.g. gerberas"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 14px",
                    borderRadius: 10,
                    border: "1.5px solid #cbd5e1",
                    fontSize: "0.86rem",
                    boxSizing: "border-box",
                    fontFamily: "monospace",
                    background: "#f8fafc",
                  }}
                />
                <span style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 4, display: "block" }}>
                  Customers clicking this card navigate to: <code>/flowers/{formSlug || "slug"}</code>
                </span>
              </div>

              {/* Image Upload & Preview */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                  Flower Showcase Photo *
                </label>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
                  {formImage ? (
                    <div
                      style={{
                        position: "relative",
                        width: 110,
                        height: 110,
                        borderRadius: 12,
                        overflow: "hidden",
                        border: "1.5px solid #fbcfe8",
                        background: "#fdf2f8",
                        flexShrink: 0,
                      }}
                    >
                      <img src={formImage} alt="Flower Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button
                        type="button"
                        onClick={() => setFormImage("")}
                        title="Remove image"
                        style={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          background: "rgba(15, 23, 42, 0.75)",
                          color: "#fff",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ) : null}

                  <div style={{ flex: 1, minWidth: 200 }}>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleImageFileChange}
                      style={{ display: "none" }}
                    />
                    <button
                      type="button"
                      disabled={uploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        borderRadius: 10,
                        border: "1.5px dashed #db2777",
                        background: "#fdf2f8",
                        color: "#9d174d",
                        fontSize: "0.86rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      }}
                    >
                      <Upload size={16} />
                      <span>{uploadingImage ? "Uploading to Cloudinary..." : formImage ? "Replace Image" : "Upload Image from Computer"}</span>
                    </button>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 4, display: "block" }}>
                      Upload square or vertical flower photo (JPG, PNG, WebP).
                    </span>
                  </div>
                </div>
              </div>

              {/* Description (Optional) */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                  Short Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Playful & vivid fresh seasonal blooms"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 14px",
                    borderRadius: 10,
                    border: "1.5px solid #cbd5e1",
                    fontSize: "0.88rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Display Order & Active Toggle */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 22 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                    Sort Order *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={formDisplayOrder}
                    onChange={(e) => setFormDisplayOrder(Number(e.target.value) || 0)}
                    style={{
                      width: "100%",
                      padding: "9px 14px",
                      borderRadius: 10,
                      border: "1.5px solid #cbd5e1",
                      fontSize: "0.9rem",
                      boxSizing: "border-box",
                    }}
                  />
                  <span style={{ fontSize: "0.74rem", color: "#64748b", marginTop: 3, display: "block" }}>
                    Lowest numbers appear first on carousel (1 = 1st card).
                  </span>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                    Status
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormIsActive(!formIsActive)}
                    style={{
                      width: "100%",
                      padding: "9px 14px",
                      borderRadius: 10,
                      border: formIsActive ? "1.5px solid #bbf7d0" : "1.5px solid #e2e8f0",
                      background: formIsActive ? "#f0fdf4" : "#f8fafc",
                      color: formIsActive ? "#166534" : "#64748b",
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    {formIsActive ? <Check size={16} color="#16a34a" /> : <EyeOff size={16} />}
                    <span>{formIsActive ? "Active on Homepage" : "Hidden / Inactive"}</span>
                  </button>
                  <span style={{ fontSize: "0.74rem", color: "#64748b", marginTop: 3, display: "block" }}>
                    Toggle visibility on homepage.
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 14, borderTop: "1px solid #f1f5f9" }}>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: "10px 18px",
                    borderRadius: 10,
                    border: "1px solid #cbd5e1",
                    background: "#fff",
                    color: "#475569",
                    fontWeight: 600,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  style={{
                    padding: "10px 22px",
                    borderRadius: 10,
                    border: "none",
                    background: "linear-gradient(135deg, #db2777 0%, #be185d 100%)",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    cursor: saving || uploadingImage ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 12px rgba(219, 39, 119, 0.25)",
                  }}
                >
                  {saving ? "Saving..." : editingFlowerType ? "Save Changes" : "Create Flower Type"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      {deleteModalOpen && flowerToDelete && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={() => !deleting && setDeleteModalOpen(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              width: "100%",
              maxWidth: 460,
              padding: "26px 28px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "#fee2e2",
                color: "#e11d48",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <Trash2 size={24} />
            </div>

            <h3 style={{ margin: "0 0 8px", textAlign: "center", fontSize: "1.18rem", fontWeight: 700, color: "#1e293b" }}>
              Delete Flower Type?
            </h3>

            <p style={{ margin: "0 0 16px", textAlign: "center", color: "#64748b", fontSize: "0.88rem", lineHeight: 1.5 }}>
              Are you sure you want to permanently delete <strong>&ldquo;{flowerToDelete.name}&rdquo;</strong>?
            </p>

            {/* Product Relationship Warning */}
            {deleteError ? (
              <div
                style={{
                  background: "#fef2f2",
                  border: "1.5px solid #fecaca",
                  color: "#991b1b",
                  padding: "12px 14px",
                  borderRadius: 12,
                  fontSize: "0.84rem",
                  marginBottom: 18,
                  lineHeight: 1.45,
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <AlertTriangle size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong>Cannot Delete: Linked Products Found</strong>
                    <p style={{ margin: "4px 0 0" }}>{deleteError}</p>
                  </div>
                </div>
              </div>
            ) : flowerToDelete.product_count && flowerToDelete.product_count > 0 ? (
              <div
                style={{
                  background: "#fff7ed",
                  border: "1px solid #fed7aa",
                  color: "#9a3412",
                  padding: "10px 14px",
                  borderRadius: 10,
                  fontSize: "0.82rem",
                  marginBottom: 18,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Info size={16} color="#ea580c" />
                <span>Notice: This flower type is currently assigned to {flowerToDelete.product_count} product(s).</span>
              </div>
            ) : null}

            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteModalOpen(false)}
                style={{
                  padding: "10px 20px",
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                  background: "#fff",
                  color: "#475569",
                  fontWeight: 600,
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  flex: 1,
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                style={{
                  padding: "10px 20px",
                  borderRadius: 10,
                  border: "none",
                  background: "#e11d48",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "0.88rem",
                  cursor: deleting ? "not-allowed" : "pointer",
                  flex: 1,
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
