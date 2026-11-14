"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Sparkles,
  Plus,
  Edit,
  Trash2,
  Upload,
  Image as ImageIcon,
  Check,
  X,
  AlertTriangle,
  ArrowUpDown,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Phone,
  MessageCircle,
  ShieldCheck,
  Search,
  CheckCircle,
  RefreshCw,
} from "lucide-react";

export interface HighlightGalleryItem {
  id?: string;
  image_url: string;
  title: string;
  alt_text?: string;
  description: string;
  price: number;
  display_order?: number;
}

export interface Highlight {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  tag: string;
  description: string;
  cover_image: string;
  starting_price: number;
  price_display?: string;
  whatsapp_number: string;
  whatsapp_text?: string;
  call_number: string;
  call_text?: string;
  guarantee_text?: string;
  features?: string[];
  active: number;
  display_order: number;
  gallery_count?: number;
  gallery?: HighlightGalleryItem[];
}

interface HighlightManagerProps {
  onRefresh?: () => Promise<void>;
}

export default function HighlightManager({ onRefresh }: HighlightManagerProps) {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");

  // Edit / Add Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHighlight, setEditingHighlight] = useState<Highlight | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<"details" | "gallery">("details");

  // Form fields
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formTag, setFormTag] = useState("VIP Floristry");
  const [formDescription, setFormDescription] = useState("");
  const [formCoverImage, setFormCoverImage] = useState("");
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formPriceDisplay, setFormPriceDisplay] = useState("");
  const [formWhatsAppNumber, setFormWhatsAppNumber] = useState("918606464700");
  const [formWhatsAppText, setFormWhatsAppText] = useState("");
  const [formCallNumber, setFormCallNumber] = useState("+918606464700");
  const [formCallText, setFormCallText] = useState("Call Atelier Directly");
  const [formGuaranteeText, setFormGuaranteeText] = useState("100% Freshness Guarantee");
  const [formFeatures, setFormFeatures] = useState<string[]>([]);
  const [newFeatureInput, setNewFeatureInput] = useState("");
  const [formActive, setFormActive] = useState(true);
  const [formDisplayOrder, setFormDisplayOrder] = useState(0);

  // Gallery items for the modal
  const [formGallery, setFormGallery] = useState<HighlightGalleryItem[]>([]);

  // Uploading / saving state
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [highlightToDelete, setHighlightToDelete] = useState<Highlight | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Live Gallery Preview Modal
  const [previewHighlight, setPreviewHighlight] = useState<Highlight | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);

  // File input ref for replace
  const replaceIndexRef = useRef<number | null>(null);
  const replaceInputRef = useRef<HTMLInputElement | null>(null);

  const fetchHighlights = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/admin/highlights", { credentials: "include" });
      const data = await res.json();
      if (data.success && Array.isArray(data.highlights)) {
        setHighlights(data.highlights);
      } else {
        setErrorMsg(data.error || "Failed to load highlights");
      }
    } catch (e: any) {
      console.error(e);
      setErrorMsg("Network error loading highlights");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHighlights();
  }, [fetchHighlights]);

  // Open modal for Adding new highlight
  const handleOpenAdd = () => {
    setEditingHighlight(null);
    setFormTitle("");
    setFormSlug("");
    setFormSubtitle("");
    setFormTag("VIP Floristry");
    setFormDescription("");
    setFormCoverImage("");
    setFormPrice(0);
    setFormPriceDisplay("");
    setFormWhatsAppNumber("918606464700");
    setFormWhatsAppText("");
    setFormCallNumber("+918606464700");
    setFormCallText("Call Atelier Directly");
    setFormGuaranteeText("100% Freshness Guarantee");
    setFormFeatures([
      "Bespoke Floral Styling",
      "On-Site Setup in Calicut",
      "100% Fresh Cut Stems",
    ]);
    setFormActive(true);
    setFormDisplayOrder(highlights.length + 1);
    setFormGallery([]);
    setActiveModalTab("details");
    setModalError(null);
    setIsModalOpen(true);
  };

  // Open modal for Editing highlight
  const handleOpenEdit = async (item: Highlight) => {
    setEditingHighlight(item);
    setFormTitle(item.title);
    setFormSlug(item.slug || item.id);
    setFormSubtitle(item.subtitle || "");
    setFormTag(item.tag || "VIP Floristry");
    setFormDescription(item.description || "");
    setFormCoverImage(item.cover_image || "");
    setFormPrice(Number(item.starting_price) || 0);
    setFormPriceDisplay(item.price_display || "");
    setFormWhatsAppNumber(item.whatsapp_number || "918606464700");
    setFormWhatsAppText(item.whatsapp_text || "");
    setFormCallNumber(item.call_number || "+918606464700");
    setFormCallText(item.call_text || "Call Atelier Directly");
    setFormGuaranteeText(item.guarantee_text || "100% Freshness Guarantee");
    setFormFeatures(Array.isArray(item.features) ? item.features : []);
    setFormActive(Boolean(item.active));
    setFormDisplayOrder(item.display_order || 0);

    // If gallery is already loaded in item
    if (Array.isArray(item.gallery) && item.gallery.length > 0) {
      setFormGallery([...item.gallery]);
    } else {
      // Fetch full details
      try {
        const res = await fetch(`/api/admin/highlights/${item.id}`, { credentials: "include" });
        const d = await res.json();
        if (d.success && d.highlight) {
          setFormGallery(d.highlight.gallery || []);
        } else {
          setFormGallery([]);
        }
      } catch {
        setFormGallery([]);
      }
    }

    setActiveModalTab("details");
    setModalError(null);
    setIsModalOpen(true);
  };

  // Upload cover image to Cloudinary
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setModalError("Please upload an image file (JPG, PNG, WebP).");
      return;
    }

    setUploadingCover(true);
    setModalError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "highlights");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();
      if (data.success && data.url) {
        setFormCoverImage(data.url);
      } else {
        setModalError(data.error || "Failed to upload cover image.");
      }
    } catch {
      setModalError("Network error uploading cover image.");
    } finally {
      setUploadingCover(false);
      e.target.value = "";
    }
  };

  // Upload multiple gallery images to Cloudinary
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingGallery(true);
    setModalError(null);

    const newItems: HighlightGalleryItem[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) continue;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "highlights");

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
          credentials: "include",
        });
        const data = await res.json();
        if (data.success && data.url) {
          const cleanName = file.name
            .replace(/\.[^/.]+$/, "")
            .replace(/[-_]+/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());

          newItems.push({
            id: `temp-${Date.now()}-${i}`,
            image_url: data.url,
            title: cleanName,
            alt_text: cleanName,
            description: formDescription || "Exquisite floral styling handcrafted for special moments.",
            price: formPrice || 0,
            display_order: formGallery.length + newItems.length + 1,
          });
        }
      }

      if (newItems.length > 0) {
        setFormGallery((prev) => [...prev, ...newItems]);
      }
    } catch (err) {
      console.error(err);
      setModalError("Error uploading gallery images. Please try again.");
    } finally {
      setUploadingGallery(false);
      e.target.value = "";
    }
  };

  // Replace single image
  const triggerReplaceImage = (idx: number) => {
    replaceIndexRef.current = idx;
    replaceInputRef.current?.click();
  };

  const handleReplaceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetIdx = replaceIndexRef.current;
    if (!file || targetIdx === null || targetIdx === undefined) return;

    setUploadingGallery(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "highlights");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();
      if (data.success && data.url) {
        setFormGallery((prev) => {
          const updated = [...prev];
          if (updated[targetIdx]) {
            updated[targetIdx] = { ...updated[targetIdx], image_url: data.url };
          }
          return updated;
        });
      }
    } catch {
      setModalError("Failed to replace image.");
    } finally {
      setUploadingGallery(false);
      replaceIndexRef.current = null;
      e.target.value = "";
    }
  };

  // Gallery ordering & deletion
  const moveGalleryItem = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === formGallery.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...formGallery];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setFormGallery(updated);
  };

  const removeGalleryItem = (index: number) => {
    setFormGallery((prev) => prev.filter((_, i) => i !== index));
  };

  const updateGalleryItemField = (index: number, field: keyof HighlightGalleryItem, val: any) => {
    setFormGallery((prev) => {
      const copy = [...prev];
      if (copy[index]) {
        copy[index] = { ...copy[index], [field]: val };
      }
      return copy;
    });
  };

  // Features list helpers
  const handleAddFeature = () => {
    if (!newFeatureInput.trim()) return;
    setFormFeatures((prev) => [...prev, newFeatureInput.trim()]);
    setNewFeatureInput("");
  };

  const handleRemoveFeature = (idx: number) => {
    setFormFeatures((prev) => prev.filter((_, i) => i !== idx));
  };

  // Toggle active status directly from list view
  const handleToggleActive = async (item: Highlight) => {
    const newStatus = item.active === 1 ? 0 : 1;
    try {
      const res = await fetch(`/api/admin/highlights/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: newStatus }),
        credentials: "include",
      });
      if (res.ok) {
        setHighlights((prev) =>
          prev.map((h) => (h.id === item.id ? { ...h, active: newStatus } : h))
        );
        setSuccessMsg(`Status updated for "${item.title}".`);
        setTimeout(() => setSuccessMsg(null), 3000);
        if (onRefresh) onRefresh();
      }
    } catch {
      setErrorMsg("Failed to update status");
    }
  };

  // Save Highlight (Create or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setModalError("Title is required.");
      return;
    }
    if (!formCoverImage.trim()) {
      setModalError("Please upload or provide a cover image.");
      return;
    }

    setSaving(true);
    setModalError(null);

    const payload = {
      title: formTitle.trim(),
      slug: formSlug.trim() || undefined,
      subtitle: formSubtitle.trim(),
      tag: formTag.trim(),
      description: formDescription.trim(),
      cover_image: formCoverImage.trim(),
      starting_price: Number(formPrice) || 0,
      price_display: formPriceDisplay.trim() || undefined,
      whatsapp_number: formWhatsAppNumber.trim() || "918606464700",
      whatsapp_text: formWhatsAppText.trim() || `Hello Occasions Florist Calicut, I would like to inquire about ${formTitle}.`,
      call_number: formCallNumber.trim() || "+918606464700",
      call_text: formCallText.trim() || "Call Atelier Directly",
      guarantee_text: formGuaranteeText.trim() || "100% Freshness Guarantee",
      features: formFeatures,
      active: formActive ? 1 : 0,
      display_order: Number(formDisplayOrder) || 0,
      gallery: formGallery,
    };

    try {
      const isEdit = !!editingHighlight;
      const url = isEdit ? `/api/admin/highlights/${editingHighlight.id}` : "/api/admin/highlights";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(isEdit ? "Highlight updated successfully!" : "New highlight created successfully!");
        setTimeout(() => setSuccessMsg(null), 4000);
        setIsModalOpen(false);
        await fetchHighlights();
        if (onRefresh) await onRefresh();
      } else {
        setModalError(data.error || "Failed to save highlight.");
      }
    } catch (err: any) {
      setModalError(err.message || "Network error while saving.");
    } finally {
      setSaving(false);
    }
  };

  // Delete Highlight
  const handleDeleteConfirm = async () => {
    if (!highlightToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/highlights/${highlightToDelete.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`"${highlightToDelete.title}" and its gallery were deleted.`);
        setTimeout(() => setSuccessMsg(null), 4000);
        setDeleteModalOpen(false);
        setHighlightToDelete(null);
        await fetchHighlights();
        if (onRefresh) await onRefresh();
      } else {
        alert(data.error || "Failed to delete highlight.");
      }
    } catch {
      alert("Network error deleting highlight.");
    } finally {
      setDeleting(false);
    }
  };

  // Filter highlights
  const filteredHighlights = highlights.filter((h) => {
    const matchesSearch =
      h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.tag && h.tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (h.subtitle && h.subtitle.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterActive === "active") return h.active === 1;
    if (filterActive === "inactive") return h.active === 0;
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Hidden file input for single image replace */}
      <input
        type="file"
        ref={replaceInputRef}
        onChange={handleReplaceUpload}
        accept="image/*"
        style={{ display: "none" }}
      />

      {/* Header Card */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: "24px 28px",
          border: "1px solid #fce7f3",
          boxShadow: "0 2px 10px rgba(131, 24, 67, 0.04)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "#fdf2f8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#db2777",
              }}
            >
              <Sparkles size={20} />
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
              Highlights &amp; Service Galleries
            </h1>
          </div>
          <p style={{ color: "#64748b", fontSize: "0.88rem", margin: 0 }}>
            Manage the homepage &quot;Our Highlights&quot; cards, custom service galleries, photo collections, and inquiry pricing.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            type="button"
            onClick={fetchHighlights}
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
            title="Refresh list from Neon DB"
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
              padding: "10px 20px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg, #db2777 0%, #be185d 100%)",
              color: "#fff",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(219, 39, 119, 0.25)",
            }}
          >
            <Plus size={17} />
            <span>Add New Highlight</span>
          </button>
        </div>
      </div>

      {/* Feedback Messages */}
      {successMsg && (
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            color: "#166534",
            padding: "12px 18px",
            borderRadius: 10,
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            padding: "12px 18px",
            borderRadius: 10,
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <AlertTriangle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          padding: "14px 20px",
          border: "1px solid #f1f5f9",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ position: "relative", minWidth: 280, flex: 1, maxWidth: 420 }}>
          <Search
            size={16}
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}
          />
          <input
            type="text"
            placeholder="Search highlights by title or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 14px 9px 36px",
              borderRadius: 8,
              border: "1px solid #cbd5e1",
              fontSize: "0.88rem",
              outline: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: "0.84rem", color: "#64748b", fontWeight: 500 }}>Filter:</span>
          {(["all", "active", "inactive"] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setFilterActive(filter)}
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                border: filterActive === filter ? "1px solid #db2777" : "1px solid #e2e8f0",
                background: filterActive === filter ? "#fdf2f8" : "#fff",
                color: filterActive === filter ? "#be185d" : "#64748b",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table / Cards */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid #f1f5f9",
          overflow: "hidden",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.02)",
        }}
      >
        {loading ? (
          <div style={{ padding: "64px 20px", textAlign: "center", color: "#64748b" }}>
            <div style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>
              <RefreshCw size={26} color="#db2777" />
            </div>
            <div style={{ marginTop: 12, fontWeight: 600, fontSize: "0.95rem" }}>
              Loading highlights from Neon DB...
            </div>
          </div>
        ) : filteredHighlights.length === 0 ? (
          <div style={{ padding: "64px 20px", textAlign: "center" }}>
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: "50%",
                background: "#fdf2f8",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#db2777",
                marginBottom: 12,
              }}
            >
              <Sparkles size={24} />
            </div>
            <h3 style={{ margin: "0 0 6px", color: "#1e293b", fontSize: "1.05rem" }}>No highlights found</h3>
            <p style={{ margin: "0 0 16px", color: "#64748b", fontSize: "0.88rem" }}>
              {searchQuery ? "No highlights match your search criteria." : "Create your first highlight to feature on the homepage."}
            </p>
            <button
              type="button"
              onClick={handleOpenAdd}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                background: "#db2777",
                color: "#fff",
                border: "none",
                fontWeight: 600,
                fontSize: "0.86rem",
                cursor: "pointer",
              }}
            >
              Add Highlight
            </button>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={{ padding: "14px 18px", color: "#475569", fontWeight: 600, width: 80 }}>Order</th>
                  <th style={{ padding: "14px 18px", color: "#475569", fontWeight: 600 }}>Cover &amp; Title</th>
                  <th style={{ padding: "14px 18px", color: "#475569", fontWeight: 600 }}>Gallery Photos</th>
                  <th style={{ padding: "14px 18px", color: "#475569", fontWeight: 600 }}>Starting Price</th>
                  <th style={{ padding: "14px 18px", color: "#475569", fontWeight: 600 }}>Status</th>
                  <th style={{ padding: "14px 18px", color: "#475569", fontWeight: 600, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHighlights.map((item) => {
                  const galleryCount = item.gallery ? item.gallery.length : (item.gallery_count || 0);
                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#fffbfd")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      {/* Display Order */}
                      <td style={{ padding: "16px 18px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 8px",
                            borderRadius: 6,
                            background: "#f1f5f9",
                            fontWeight: 700,
                            color: "#475569",
                            fontSize: "0.82rem",
                          }}
                        >
                          #{item.display_order}
                        </span>
                      </td>

                      {/* Cover & Title */}
                      <td style={{ padding: "16px 18px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                          <img
                            src={item.cover_image}
                            alt={item.title}
                            style={{
                              width: 60,
                              height: 60,
                              borderRadius: 10,
                              objectFit: "cover",
                              border: "1px solid #fce7f3",
                              background: "#fdf2f8",
                            }}
                          />
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                              <span style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.96rem" }}>
                                {item.title}
                              </span>
                              {item.tag && (
                                <span
                                  style={{
                                    fontSize: "0.72rem",
                                    fontWeight: 600,
                                    padding: "2px 7px",
                                    borderRadius: 4,
                                    background: "#fce7f3",
                                    color: "#be185d",
                                  }}
                                >
                                  {item.tag}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                              {item.subtitle || item.description?.substring(0, 50) + "..."}
                            </div>
                            <div style={{ fontSize: "0.74rem", color: "#94a3b8", marginTop: 2 }}>
                              Slug: <code>{item.slug || item.id}</code>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Gallery count & preview */}
                      <td style={{ padding: "16px 18px" }}>
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewHighlight(item);
                            setPreviewIndex(0);
                          }}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "6px 12px",
                            borderRadius: 20,
                            border: "1px solid #fce7f3",
                            background: "#fdf2f8",
                            color: "#be185d",
                            fontWeight: 600,
                            fontSize: "0.8rem",
                            cursor: "pointer",
                          }}
                          title="Click to preview gallery popup"
                        >
                          <ImageIcon size={14} />
                          <span>{galleryCount} images in gallery</span>
                          <Eye size={12} style={{ marginLeft: 2 }} />
                        </button>
                      </td>

                      {/* Price */}
                      <td style={{ padding: "16px 18px" }}>
                        <span style={{ fontWeight: 700, color: "#0f766e", fontSize: "0.92rem" }}>
                          {item.price_display || (Number(item.starting_price) > 0 ? `₹ ${Number(item.starting_price).toLocaleString("en-IN")}` : "Inquire")}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: "16px 18px" }}>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(item)}
                          style={{
                            padding: "4px 12px",
                            borderRadius: 16,
                            border: "none",
                            background: item.active === 1 ? "#dcfce7" : "#f1f5f9",
                            color: item.active === 1 ? "#166534" : "#64748b",
                            fontWeight: 600,
                            fontSize: "0.78rem",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                          title="Click to toggle active state"
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: item.active === 1 ? "#22c55e" : "#94a3b8",
                            }}
                          />
                          <span>{item.active === 1 ? "Active" : "Inactive"}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "16px 18px", textAlign: "right" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewHighlight(item);
                              setPreviewIndex(0);
                            }}
                            style={{
                              padding: "6px 10px",
                              borderRadius: 8,
                              border: "1px solid #e2e8f0",
                              background: "#fff",
                              color: "#475569",
                              cursor: "pointer",
                            }}
                            title="Preview Gallery Modal"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            style={{
                              padding: "6px 12px",
                              borderRadius: 8,
                              border: "1px solid #fce7f3",
                              background: "#fdf2f8",
                              color: "#be185d",
                              fontWeight: 600,
                              fontSize: "0.82rem",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <Edit size={14} />
                            <span>Edit &amp; Gallery</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setHighlightToDelete(item);
                              setDeleteModalOpen(true);
                            }}
                            style={{
                              padding: "6px 10px",
                              borderRadius: 8,
                              border: "1px solid #fee2e2",
                              background: "#fff5f5",
                              color: "#dc2626",
                              cursor: "pointer",
                            }}
                            title="Delete Highlight"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ADD / EDIT HIGHLIGHT & GALLERY MODAL                          */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 20,
          }}
          onClick={() => !saving && setIsModalOpen(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              width: "100%",
              maxWidth: 920,
              maxHeight: "92vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "20px 28px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#fdf2f8",
              }}
            >
              <div>
                <h2
                  style={{
                    fontFamily: "var(--font-serif)",
                    color: "#831843",
                    fontSize: "1.3rem",
                    fontWeight: 700,
                    margin: 0,
                  }}
                >
                  {editingHighlight ? `Manage "${editingHighlight.title}"` : "Create New Highlight"}
                </h2>
                <p style={{ margin: "3px 0 0", color: "#64748b", fontSize: "0.82rem" }}>
                  Configure card details, pricing, WhatsApp inquiry CTA, and multi-image photo gallery.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  border: "1px solid #fce7f3",
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#64748b",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Tabs Navigation */}
            <div
              style={{
                display: "flex",
                borderBottom: "1px solid #e2e8f0",
                background: "#fff",
                padding: "0 28px",
                gap: 16,
              }}
            >
              <button
                type="button"
                onClick={() => setActiveModalTab("details")}
                style={{
                  padding: "14px 8px",
                  border: "none",
                  background: "transparent",
                  borderBottom: activeModalTab === "details" ? "3px solid #db2777" : "3px solid transparent",
                  color: activeModalTab === "details" ? "#be185d" : "#64748b",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Sparkles size={16} />
                <span>1. Highlight Card &amp; Contact</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModalTab("gallery")}
                style={{
                  padding: "14px 8px",
                  border: "none",
                  background: "transparent",
                  borderBottom: activeModalTab === "gallery" ? "3px solid #db2777" : "3px solid transparent",
                  color: activeModalTab === "gallery" ? "#be185d" : "#64748b",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <ImageIcon size={16} />
                <span>2. Service Gallery Photos ({formGallery.length})</span>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} style={{ overflowY: "auto", padding: "24px 28px", flex: 1 }}>
              {modalError && (
                <div
                  style={{
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    color: "#991b1b",
                    padding: "10px 16px",
                    borderRadius: 8,
                    fontSize: "0.86rem",
                    marginBottom: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <AlertTriangle size={16} />
                  <span>{modalError}</span>
                </div>
              )}

              {/* ── TAB 1: Highlight Details ── */}
              {activeModalTab === "details" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                        Highlight Title *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Car Decor, Stage Decor"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: 8,
                          border: "1px solid #cbd5e1",
                          fontSize: "0.9rem",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                        Slug (URL identifier)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. car-decor (leave blank to auto-generate)"
                        value={formSlug}
                        onChange={(e) => setFormSlug(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: 8,
                          border: "1px solid #cbd5e1",
                          fontSize: "0.9rem",
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                        Tag Badge
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. VIP Floristry, Celebration, Tradition"
                        value={formTag}
                        onChange={(e) => setFormTag(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: 8,
                          border: "1px solid #cbd5e1",
                          fontSize: "0.9rem",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                        Subtitle / Short Tagline
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. VIP Bonnet Florals and Satin Posies"
                        value={formSubtitle}
                        onChange={(e) => setFormSubtitle(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: 8,
                          border: "1px solid #cbd5e1",
                          fontSize: "0.9rem",
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                      Full Description *
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Detailed overview shown in the gallery modal..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 8,
                        border: "1px solid #cbd5e1",
                        fontSize: "0.88rem",
                        lineHeight: 1.5,
                      }}
                    />
                  </div>

                  {/* Cover Image Upload */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                      Homepage Cover Image * (Upload to Cloudinary)
                    </label>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      {formCoverImage ? (
                        <img
                          src={formCoverImage}
                          alt="Cover"
                          style={{
                            width: 80,
                            height: 80,
                            borderRadius: 10,
                            objectFit: "cover",
                            border: "1px solid #cbd5e1",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 80,
                            height: 80,
                            borderRadius: 10,
                            background: "#f8fafc",
                            border: "1px dashed #cbd5e1",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#94a3b8",
                          }}
                        >
                          <ImageIcon size={28} />
                        </div>
                      )}

                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                          <label
                            style={{
                              padding: "8px 16px",
                              borderRadius: 8,
                              background: "#f1f5f9",
                              color: "#334155",
                              border: "1px solid #cbd5e1",
                              fontWeight: 600,
                              fontSize: "0.84rem",
                              cursor: uploadingCover ? "not-allowed" : "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <Upload size={14} />
                            <span>{uploadingCover ? "Uploading to Cloudinary..." : "Choose Image File"}</span>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={uploadingCover}
                              onChange={handleCoverUpload}
                              style={{ display: "none" }}
                            />
                          </label>
                        </div>
                        <input
                          type="url"
                          placeholder="Or paste Cloudinary HTTPS URL..."
                          value={formCoverImage}
                          onChange={(e) => setFormCoverImage(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            borderRadius: 6,
                            border: "1px solid #cbd5e1",
                            fontSize: "0.82rem",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pricing Details */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                        Starting Price (₹ numeric)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="1800"
                        value={formPrice || ""}
                        onChange={(e) => {
                          const p = Number(e.target.value);
                          setFormPrice(p);
                          if (!formPriceDisplay || formPriceDisplay.startsWith("₹")) {
                            setFormPriceDisplay(p > 0 ? `₹ ${p.toLocaleString("en-IN")}` : "");
                          }
                        }}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: 8,
                          border: "1px solid #cbd5e1",
                          fontSize: "0.9rem",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                        Price Display Label
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. ₹ 1,800 or Starting from ₹1,800"
                        value={formPriceDisplay}
                        onChange={(e) => setFormPriceDisplay(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: 8,
                          border: "1px solid #cbd5e1",
                          fontSize: "0.9rem",
                        }}
                      />
                    </div>
                  </div>

                  {/* Contact Buttons & Phone Numbers */}
                  <div
                    style={{
                      background: "#f8fafc",
                      borderRadius: 12,
                      padding: 16,
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.9rem", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                      <Phone size={15} color="#db2777" />
                      <span>Contact &amp; CTA Buttons Configuration</span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.8rem", color: "#475569", marginBottom: 4 }}>
                          WhatsApp Number (without +)
                        </label>
                        <input
                          type="text"
                          value={formWhatsAppNumber}
                          onChange={(e) => setFormWhatsAppNumber(e.target.value)}
                          placeholder="918606464700"
                          style={{
                            width: "100%",
                            padding: "8px 10px",
                            borderRadius: 6,
                            border: "1px solid #cbd5e1",
                            fontSize: "0.85rem",
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "0.8rem", color: "#475569", marginBottom: 4 }}>
                          Pre-filled WhatsApp Message
                        </label>
                        <input
                          type="text"
                          value={formWhatsAppText}
                          onChange={(e) => setFormWhatsAppText(e.target.value)}
                          placeholder="Hello Occasions Florist Calicut, I would like to inquire about..."
                          style={{
                            width: "100%",
                            padding: "8px 10px",
                            borderRadius: 6,
                            border: "1px solid #cbd5e1",
                            fontSize: "0.85rem",
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "0.8rem", color: "#475569", marginBottom: 4 }}>
                          Call Button Text
                        </label>
                        <input
                          type="text"
                          value={formCallText}
                          onChange={(e) => setFormCallText(e.target.value)}
                          placeholder="Call Atelier Directly"
                          style={{
                            width: "100%",
                            padding: "8px 10px",
                            borderRadius: 6,
                            border: "1px solid #cbd5e1",
                            fontSize: "0.85rem",
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "0.8rem", color: "#475569", marginBottom: 4 }}>
                          Telephone Number
                        </label>
                        <input
                          type="text"
                          value={formCallNumber}
                          onChange={(e) => setFormCallNumber(e.target.value)}
                          placeholder="+918606464700"
                          style={{
                            width: "100%",
                            padding: "8px 10px",
                            borderRadius: 6,
                            border: "1px solid #cbd5e1",
                            fontSize: "0.85rem",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Features / Highlights Bullets */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                      Key Features &amp; Service Highlights
                    </label>
                    <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                      <input
                        type="text"
                        placeholder="Add feature bullet (e.g. Scratch-Proof Suction Mounting)"
                        value={newFeatureInput}
                        onChange={(e) => setNewFeatureInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddFeature();
                          }
                        }}
                        style={{
                          flex: 1,
                          padding: "8px 12px",
                          borderRadius: 6,
                          border: "1px solid #cbd5e1",
                          fontSize: "0.86rem",
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddFeature}
                        style={{
                          padding: "8px 14px",
                          borderRadius: 6,
                          background: "#db2777",
                          color: "#fff",
                          border: "none",
                          fontSize: "0.84rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Add
                      </button>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {formFeatures.map((feat, idx) => (
                        <span
                          key={idx}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            background: "#f1f5f9",
                            color: "#334155",
                            padding: "4px 10px",
                            borderRadius: 16,
                            fontSize: "0.8rem",
                          }}
                        >
                          <span>{feat}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(idx)}
                            style={{
                              border: "none",
                              background: "transparent",
                              cursor: "pointer",
                              padding: 0,
                              color: "#94a3b8",
                            }}
                          >
                            <X size={13} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Display Order & Active Toggle */}
                  <div style={{ display: "flex", alignItems: "center", gap: 24, paddingTop: 10, borderTop: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <label style={{ fontSize: "0.84rem", fontWeight: 600, color: "#334155" }}>
                        Display Order:
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formDisplayOrder}
                        onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
                        style={{
                          width: 80,
                          padding: "6px 10px",
                          borderRadius: 6,
                          border: "1px solid #cbd5e1",
                          fontSize: "0.88rem",
                        }}
                      />
                    </div>

                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={formActive}
                        onChange={(e) => setFormActive(e.target.checked)}
                        style={{ width: 17, height: 17, accentColor: "#db2777" }}
                      />
                      <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "#334155" }}>
                        Active (Display on public homepage)
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* ── TAB 2: Gallery Management ── */}
              {activeModalTab === "gallery" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  {/* Multi-upload banner */}
                  <div
                    style={{
                      background: "#fdf2f8",
                      border: "2px dashed #fce7f3",
                      borderRadius: 14,
                      padding: "24px 20px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        background: "#fff",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#db2777",
                        marginBottom: 10,
                        boxShadow: "0 2px 6px rgba(219, 39, 119, 0.15)",
                      }}
                    >
                      <Upload size={20} />
                    </div>
                    <div style={{ fontWeight: 700, color: "#831843", fontSize: "0.96rem", marginBottom: 4 }}>
                      Upload Multiple Gallery Images Directly to Cloudinary
                    </div>
                    <p style={{ color: "#64748b", fontSize: "0.82rem", margin: "0 0 14px" }}>
                      Select one or multiple photos from your device. Each image will be securely hosted and added to this highlight gallery.
                    </p>

                    <label
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "10px 22px",
                        borderRadius: 10,
                        background: "#db2777",
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: "0.88rem",
                        cursor: uploadingGallery ? "not-allowed" : "pointer",
                        boxShadow: "0 4px 10px rgba(219, 39, 119, 0.2)",
                      }}
                    >
                      <Plus size={16} />
                      <span>{uploadingGallery ? "Uploading Images to Cloudinary..." : "Select Images to Upload"}</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        disabled={uploadingGallery}
                        onChange={handleGalleryUpload}
                        style={{ display: "none" }}
                      />
                    </label>
                  </div>

                  {/* Gallery Items Count Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.94rem" }}>
                      Gallery Images ({formGallery.length})
                    </div>
                    <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                      Use arrows to reorder. Changes will be saved with the highlight.
                    </span>
                  </div>

                  {/* Gallery Items Grid */}
                  {formGallery.length === 0 ? (
                    <div style={{ padding: "40px 20px", textAlign: "center", color: "#94a3b8" }}>
                      <ImageIcon size={32} style={{ marginBottom: 8 }} />
                      <div style={{ fontSize: "0.9rem" }}>No gallery images added yet.</div>
                      <div style={{ fontSize: "0.8rem", color: "#cbd5e1" }}>
                        Upload images above to build the customer photo carousel.
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {formGallery.map((imgItem, idx) => (
                        <div
                          key={imgItem.id || `img-${idx}`}
                          style={{
                            background: "#fff",
                            border: "1px solid #e2e8f0",
                            borderRadius: 12,
                            padding: 14,
                            display: "flex",
                            gap: 14,
                            alignItems: "center",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                          }}
                        >
                          {/* Reorder Buttons */}
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => moveGalleryItem(idx, "up")}
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: 6,
                                border: "1px solid #cbd5e1",
                                background: idx === 0 ? "#f8fafc" : "#fff",
                                color: idx === 0 ? "#cbd5e1" : "#334155",
                                cursor: idx === 0 ? "not-allowed" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              title="Move up / left"
                            >
                              <ArrowUp size={14} />
                            </button>

                            <button
                              type="button"
                              disabled={idx === formGallery.length - 1}
                              onClick={() => moveGalleryItem(idx, "down")}
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: 6,
                                border: "1px solid #cbd5e1",
                                background: idx === formGallery.length - 1 ? "#f8fafc" : "#fff",
                                color: idx === formGallery.length - 1 ? "#cbd5e1" : "#334155",
                                cursor: idx === formGallery.length - 1 ? "not-allowed" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              title="Move down / right"
                            >
                              <ArrowDown size={14} />
                            </button>
                          </div>

                          {/* Image Thumbnail with Replace Action */}
                          <div style={{ position: "relative" }}>
                            <img
                              src={imgItem.image_url}
                              alt={imgItem.alt_text || "Gallery Photo"}
                              style={{
                                width: 90,
                                height: 80,
                                borderRadius: 8,
                                objectFit: "cover",
                                border: "1px solid #e2e8f0",
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => triggerReplaceImage(idx)}
                              style={{
                                position: "absolute",
                                bottom: 4,
                                right: 4,
                                padding: "2px 6px",
                                borderRadius: 4,
                                background: "rgba(15, 23, 42, 0.75)",
                                color: "#fff",
                                border: "none",
                                fontSize: "0.68rem",
                                cursor: "pointer",
                              }}
                              title="Replace this image"
                            >
                              Replace
                            </button>
                          </div>

                          {/* Editable Details: Title, Price, Description */}
                          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 10 }}>
                            <div>
                              <input
                                type="text"
                                placeholder="Photo Title / Car Model / Theme"
                                value={imgItem.title || ""}
                                onChange={(e) => updateGalleryItemField(idx, "title", e.target.value)}
                                style={{
                                  width: "100%",
                                  padding: "6px 10px",
                                  borderRadius: 6,
                                  border: "1px solid #cbd5e1",
                                  fontSize: "0.84rem",
                                  fontWeight: 600,
                                  marginBottom: 6,
                                }}
                              />
                              <textarea
                                rows={2}
                                placeholder="Specific description for this design..."
                                value={imgItem.description || ""}
                                onChange={(e) => updateGalleryItemField(idx, "description", e.target.value)}
                                style={{
                                  width: "100%",
                                  padding: "6px 10px",
                                  borderRadius: 6,
                                  border: "1px solid #cbd5e1",
                                  fontSize: "0.8rem",
                                }}
                              />
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>₹</span>
                                <input
                                  type="number"
                                  min="0"
                                  placeholder="Price (₹)"
                                  value={imgItem.price || ""}
                                  onChange={(e) => updateGalleryItemField(idx, "price", Number(e.target.value))}
                                  style={{
                                    flex: 1,
                                    padding: "6px 10px",
                                    borderRadius: 6,
                                    border: "1px solid #cbd5e1",
                                    fontSize: "0.84rem",
                                    fontWeight: 700,
                                    color: "#0f766e",
                                  }}
                                />
                              </div>
                              <input
                                type="text"
                                placeholder="Alt Text (SEO)"
                                value={imgItem.alt_text || ""}
                                onChange={(e) => updateGalleryItemField(idx, "alt_text", e.target.value)}
                                style={{
                                  width: "100%",
                                  padding: "6px 10px",
                                  borderRadius: 6,
                                  border: "1px solid #cbd5e1",
                                  fontSize: "0.78rem",
                                  color: "#64748b",
                                }}
                              />
                            </div>
                          </div>

                          {/* Delete Item Button */}
                          <button
                            type="button"
                            onClick={() => removeGalleryItem(idx)}
                            style={{
                              padding: "8px",
                              borderRadius: 8,
                              border: "none",
                              background: "#fee2e2",
                              color: "#dc2626",
                              cursor: "pointer",
                            }}
                            title="Remove from gallery"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Modal Footer */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 20,
                  marginTop: 20,
                  borderTop: "1px solid #f1f5f9",
                }}
              >
                <div style={{ fontSize: "0.82rem", color: "#64748b" }}>
                  {formGallery.length} photos in gallery | Cover set
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => setIsModalOpen(false)}
                    style={{
                      padding: "10px 18px",
                      borderRadius: 8,
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
                    disabled={saving || uploadingCover || uploadingGallery}
                    style={{
                      padding: "10px 24px",
                      borderRadius: 8,
                      border: "none",
                      background: "linear-gradient(135deg, #db2777 0%, #be185d 100%)",
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      cursor: saving ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      boxShadow: "0 4px 12px rgba(219, 39, 119, 0.25)",
                    }}
                  >
                    {saving && <RefreshCw size={15} style={{ animation: "spin 1s linear infinite" }} />}
                    <span>{saving ? "Saving Changes..." : editingHighlight ? "Save Changes" : "Create Highlight"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* DELETE CONFIRMATION MODAL                                     */}
      {/* ───────────────────────────────────────────────────────────── */}
      {deleteModalOpen && highlightToDelete && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: 20,
          }}
          onClick={() => !deleting && setDeleteModalOpen(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              maxWidth: 440,
              width: "100%",
              padding: 24,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "#fef2f2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#dc2626",
                marginBottom: 16,
              }}
            >
              <Trash2 size={24} />
            </div>

            <h3 style={{ margin: "0 0 8px", color: "#1e293b", fontSize: "1.15rem", fontWeight: 700 }}>
              Delete &quot;{highlightToDelete.title}&quot;?
            </h3>
            <p style={{ margin: "0 0 20px", color: "#64748b", fontSize: "0.88rem", lineHeight: 1.5 }}>
              Are you sure you want to delete this highlight? All associated service gallery photos in Neon DB will also be removed. This action cannot be undone.
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteModalOpen(false)}
                style={{
                  padding: "9px 16px",
                  borderRadius: 8,
                  border: "1px solid #cbd5e1",
                  background: "#fff",
                  color: "#475569",
                  fontWeight: 600,
                  fontSize: "0.86rem",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteConfirm}
                style={{
                  padding: "9px 20px",
                  borderRadius: 8,
                  border: "none",
                  background: "#dc2626",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "0.86rem",
                  cursor: deleting ? "not-allowed" : "pointer",
                }}
              >
                {deleting ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* LIVE GALLERY MODAL PREVIEW                                    */}
      {/* ───────────────────────────────────────────────────────────── */}
      {previewHighlight && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10001,
            padding: 20,
          }}
          onClick={() => setPreviewHighlight(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              maxWidth: 960,
              width: "100%",
              maxHeight: "92vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3)",
              padding: 24,
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setPreviewHighlight(null)}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "1px solid #fce7f3",
                background: "#fdf2f8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#db2777",
                cursor: "pointer",
                zIndex: 2,
              }}
            >
              <X size={16} />
            </button>

            {/* Preview Banner */}
            <div
              style={{
                background: "#fdf2f8",
                borderRadius: 8,
                padding: "6px 12px",
                display: "inline-block",
                color: "#be185d",
                fontSize: "0.78rem",
                fontWeight: 700,
                marginBottom: 16,
              }}
            >
              Live Modal Preview: {previewHighlight.title}
            </div>

            {/* Gallery Content */}
            {(() => {
              const gallery = previewHighlight.gallery || [];
              const currentItem = gallery[previewIndex] || {
                image_url: previewHighlight.cover_image,
                title: previewHighlight.title,
                price: previewHighlight.starting_price,
                description: previewHighlight.description,
              };

              return (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24, marginBottom: 24 }}>
                    {/* Hero Image */}
                    <div
                      style={{
                        position: "relative",
                        borderRadius: 14,
                        overflow: "hidden",
                        aspectRatio: "4/3",
                        background: "#f8fafc",
                      }}
                    >
                      <img
                        src={currentItem.image_url}
                        alt={currentItem.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      {gallery.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewIndex((prev) => (prev > 0 ? prev - 1 : gallery.length - 1))
                            }
                            style={{
                              position: "absolute",
                              left: 10,
                              top: "50%",
                              transform: "translateY(-50%)",
                              width: 36,
                              height: 36,
                              borderRadius: "50%",
                              background: "rgba(255,255,255,0.9)",
                              border: "none",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <ChevronLeft size={20} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewIndex((prev) => (prev < gallery.length - 1 ? prev + 1 : 0))
                            }
                            style={{
                              position: "absolute",
                              right: 10,
                              top: "50%",
                              transform: "translateY(-50%)",
                              width: 36,
                              height: 36,
                              borderRadius: "50%",
                              background: "rgba(255,255,255,0.9)",
                              border: "none",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <ChevronRight size={20} />
                          </button>
                        </>
                      )}
                    </div>

                    {/* Details Column */}
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                      <h3 style={{ margin: "0 0 8px", color: "#1e293b", fontSize: "1.2rem", fontWeight: 700 }}>
                        {currentItem.title || previewHighlight.title}
                      </h3>
                      <p style={{ color: "#64748b", fontSize: "0.88rem", lineHeight: 1.5, margin: "0 0 16px" }}>
                        {currentItem.description || previewHighlight.description}
                      </p>

                      <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#be185d", marginBottom: 20 }}>
                        ₹ {currentItem.price || previewHighlight.starting_price}
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <a
                          href={`https://wa.me/${previewHighlight.whatsapp_number}?text=${encodeURIComponent(
                            `Hello Occasions Florist Calicut, I would like to inquire about ${currentItem.title} (₹${currentItem.price}).`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            padding: "11px 20px",
                            borderRadius: 10,
                            background: "#25d366",
                            color: "#fff",
                            textDecoration: "none",
                            fontWeight: 600,
                            fontSize: "0.88rem",
                          }}
                        >
                          <MessageCircle size={16} />
                          <span>Inquire on WhatsApp</span>
                        </a>

                        <a
                          href={`tel:${previewHighlight.call_number}`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            padding: "11px 20px",
                            borderRadius: 10,
                            border: "1px solid #fce7f3",
                            background: "#fff",
                            color: "#be185d",
                            textDecoration: "none",
                            fontWeight: 600,
                            fontSize: "0.88rem",
                          }}
                        >
                          <Phone size={15} />
                          <span>{previewHighlight.call_text || "Call Atelier Directly"}</span>
                        </a>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 14, color: "#059669", fontSize: "0.82rem" }}>
                        <ShieldCheck size={16} />
                        <span>{previewHighlight.guarantee_text || "100% Freshness Guarantee"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Thumbnail Carousel Track */}
                  {gallery.length > 1 && (
                    <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 16 }}>
                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          overflowX: "auto",
                          paddingBottom: 8,
                        }}
                      >
                        {gallery.map((gItem, gIdx) => (
                          <button
                            type="button"
                            key={gIdx}
                            onClick={() => setPreviewIndex(gIdx)}
                            style={{
                              border: gIdx === previewIndex ? "2px solid #db2777" : "2px solid transparent",
                              borderRadius: 8,
                              padding: 0,
                              background: "none",
                              cursor: "pointer",
                              flexShrink: 0,
                              overflow: "hidden",
                            }}
                          >
                            <img
                              src={gItem.image_url}
                              alt={gItem.title}
                              style={{ width: 70, height: 60, objectFit: "cover", display: "block" }}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
