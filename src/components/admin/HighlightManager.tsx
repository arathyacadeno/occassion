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
  ArrowLeft,
  ArrowRight,
  Phone,
  MessageCircle,
  ShieldCheck,
  Search,
  CheckCircle,
  RefreshCw,
  Info,
  HelpCircle,
  Layers,
  Settings as SettingsIcon,
} from "lucide-react";
import { useScrollLock } from "@/lib/scrollLock";

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

  // Default store contact settings
  const [storeDefaults, setStoreDefaults] = useState({
    whatsapp: "918606464700",
    phone: "+91 8606464700",
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHighlight, setEditingHighlight] = useState<Highlight | null>(null);
  const [activeTab, setActiveTab] = useState<"basic" | "gallery" | "contact" | "settings">("basic");

  // Form Fields - Tab 1: Basic Information
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPriceDisplay, setFormPriceDisplay] = useState("");
  const [formStartingPrice, setFormStartingPrice] = useState<number>(0);
  const [formCoverImage, setFormCoverImage] = useState("");

  // Form Fields - Tab 2: Gallery Images
  const [formGallery, setFormGallery] = useState<HighlightGalleryItem[]>([]);
  const [uploadProgressText, setUploadProgressText] = useState<string | null>(null);

  // Form Fields - Tab 3: Contact Information
  const [formWhatsAppText, setFormWhatsAppText] = useState("");
  const [formWhatsAppNumber, setFormWhatsAppNumber] = useState("");
  const [formCallText, setFormCallText] = useState("");
  const [formCallNumber, setFormCallNumber] = useState("");

  // Form Fields - Tab 4: Settings
  const [formActive, setFormActive] = useState(true);
  const [formDisplayOrder, setFormDisplayOrder] = useState(1);
  const [formTag, setFormTag] = useState("VIP Floristry");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formGuaranteeText, setFormGuaranteeText] = useState("100% Freshness Guarantee");
  const [formSlug, setFormSlug] = useState("");

  // Upload & Save loading states
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Delete confirmation
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [highlightToDelete, setHighlightToDelete] = useState<Highlight | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Customer Preview Modal
  const [previewHighlight, setPreviewHighlight] = useState<Highlight | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // Select card to see the highlight
  const handleSelectCard = (item: Highlight) => {
    setSelectedCardId(item.id);
    setPreviewHighlight(item);
    setPreviewIndex(0);
  };

  // Hidden file input for replacing single gallery image
  const replaceIdxRef = useRef<number | null>(null);
  const replaceInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch highlights and store settings
  const fetchHighlights = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [hlRes, stRes] = await Promise.allSettled([
        fetch("/api/admin/highlights", { credentials: "include" }),
        fetch("/api/settings"),
      ]);

      if (hlRes.status === "fulfilled" && hlRes.value.ok) {
        const data = await hlRes.value.json();
        if (data.success && Array.isArray(data.highlights)) {
          setHighlights(data.highlights);
        }
      }

      if (stRes.status === "fulfilled" && stRes.value.ok) {
        const sData = await stRes.value.json();
        if (sData.success && sData.settings) {
          setStoreDefaults({
            whatsapp: sData.settings.store_whatsapp || "918606464700",
            phone: sData.settings.store_phone || "+91 8606464700",
          });
        }
      }
    } catch {
      setErrorMsg("Failed to connect to server. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHighlights();
  }, [fetchHighlights]);

  // Lock background body scroll cleanly (fixed background, no layout jumps or movement)
  useScrollLock(isModalOpen || deleteModalOpen || Boolean(previewHighlight));

  // Open modal to add a brand new highlight
  const handleOpenAdd = () => {
    setEditingHighlight(null);
    setFormTitle("");
    setFormDescription("");
    setFormPriceDisplay("₹ 2,000");
    setFormStartingPrice(2000);
    setFormCoverImage("");
    setFormGallery([]);
    setFormWhatsAppText("Hello Occasions Florist Calicut, I would like to inquire about this service.");
    setFormWhatsAppNumber(storeDefaults.whatsapp);
    setFormCallText("Call Atelier Directly");
    setFormCallNumber(storeDefaults.phone);
    setFormActive(true);
    setFormDisplayOrder(highlights.length + 1);
    setFormTag("Signature Service");
    setFormSubtitle("");
    setFormGuaranteeText("100% Freshness Guarantee");
    setFormSlug("");
    setActiveTab("basic");
    setModalError(null);
    setIsModalOpen(true);
  };

  // Open modal to edit existing highlight
  const handleOpenEdit = async (item: Highlight) => {
    setEditingHighlight(item);
    setFormTitle(item.title);
    setFormDescription(item.description || "");
    setFormPriceDisplay(item.price_display || (item.starting_price > 0 ? `₹ ${item.starting_price.toLocaleString("en-IN")}` : ""));
    setFormStartingPrice(Number(item.starting_price) || 0);
    setFormCoverImage(item.cover_image || "");
    setFormWhatsAppText(item.whatsapp_text || `Hello Occasions Florist Calicut, I would like to inquire about ${item.title}.`);
    setFormWhatsAppNumber(item.whatsapp_number || storeDefaults.whatsapp);
    setFormCallText(item.call_text || "Call Atelier Directly");
    setFormCallNumber(item.call_number || storeDefaults.phone);
    setFormActive(item.active === 1);
    setFormDisplayOrder(item.display_order || 1);
    setFormTag(item.tag || "VIP Floristry");
    setFormSubtitle(item.subtitle || "");
    setFormGuaranteeText(item.guarantee_text || "100% Freshness Guarantee");
    setFormSlug(item.slug || item.id);

    // Load full gallery
    if (Array.isArray(item.gallery) && item.gallery.length > 0) {
      setFormGallery([...item.gallery]);
    } else {
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

    setActiveTab("basic");
    setModalError(null);
    setIsModalOpen(true);
  };

  // Upload Cover Image
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setModalError("Please select an image file (JPG, PNG, WebP).");
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
      setModalError("Network error while uploading cover photo.");
    } finally {
      setUploadingCover(false);
      e.target.value = "";
    }
  };

  // Multi-image upload for Gallery
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingGallery(true);
    setModalError(null);
    const totalFiles = files.length;
    const newItems: HighlightGalleryItem[] = [];

    try {
      for (let i = 0; i < totalFiles; i++) {
        setUploadProgressText(`Uploading image ${i + 1} of ${totalFiles} to Cloudinary...`);
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
          const prettyName = file.name
            .replace(/\.[^/.]+$/, "")
            .replace(/[-_]+/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());

          newItems.push({
            id: `temp-${Date.now()}-${i}`,
            image_url: data.url,
            title: prettyName,
            alt_text: prettyName,
            description: formDescription || "Handcrafted floral styling designed for celebrations.",
            price: formStartingPrice || 0,
            display_order: formGallery.length + newItems.length + 1,
          });
        }
      }

      if (newItems.length > 0) {
        setFormGallery((prev) => [...prev, ...newItems]);
      }
    } catch {
      setModalError("Error uploading gallery images. Please try again.");
    } finally {
      setUploadingGallery(false);
      setUploadProgressText(null);
      e.target.value = "";
    }
  };

  // Replace single gallery image
  const triggerReplaceImage = (index: number) => {
    replaceIdxRef.current = index;
    replaceInputRef.current?.click();
  };

  const handleReplaceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetIdx = replaceIdxRef.current;
    if (!file || targetIdx === null) return;

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
          const copy = [...prev];
          if (copy[targetIdx]) {
            copy[targetIdx] = { ...copy[targetIdx], image_url: data.url };
          }
          return copy;
        });
      }
    } catch {
      setModalError("Failed to replace image.");
    } finally {
      setUploadingGallery(false);
      replaceIdxRef.current = null;
      e.target.value = "";
    }
  };

  // Reorder gallery photos (Left / Right)
  const moveGalleryItem = (index: number, direction: "prev" | "next") => {
    if (
      (direction === "prev" && index === 0) ||
      (direction === "next" && index === formGallery.length - 1)
    ) {
      return;
    }
    const targetIdx = direction === "prev" ? index - 1 : index + 1;
    const updated = [...formGallery];
    const item = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = item;
    setFormGallery(updated);
  };

  const removeGalleryItem = (index: number) => {
    setFormGallery((prev) => prev.filter((_, i) => i !== index));
  };

  const updateGalleryItemField = (index: number, field: keyof HighlightGalleryItem, value: any) => {
    setFormGallery((prev) => {
      const copy = [...prev];
      if (copy[index]) {
        copy[index] = { ...copy[index], [field]: value };
      }
      return copy;
    });
  };

  // Quick toggle active directly from card
  const handleToggleActive = async (item: Highlight, e: React.MouseEvent) => {
    e.stopPropagation();
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
        setSuccessMsg(newStatus === 1 ? `"${item.title}" is now visible on your homepage!` : `"${item.title}" is now hidden from homepage.`);
        setTimeout(() => setSuccessMsg(null), 3000);
        if (onRefresh) onRefresh();
      }
    } catch {
      setErrorMsg("Failed to update status");
    }
  };

  // Save Highlight
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setActiveTab("basic");
      setModalError("Please enter a Highlight Name.");
      return;
    }
    if (!formCoverImage.trim()) {
      setActiveTab("basic");
      setModalError("Please upload a cover image.");
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
      starting_price: Number(formStartingPrice) || 0,
      price_display: formPriceDisplay.trim() || undefined,
      whatsapp_number: formWhatsAppNumber.trim() || storeDefaults.whatsapp,
      whatsapp_text: formWhatsAppText.trim(),
      call_number: formCallNumber.trim() || storeDefaults.phone,
      call_text: formCallText.trim() || "Call Atelier Directly",
      guarantee_text: formGuaranteeText.trim() || "100% Freshness Guarantee",
      active: formActive ? 1 : 0,
      display_order: Number(formDisplayOrder) || 1,
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
        setSuccessMsg(isEdit ? `Saved changes to "${formTitle}"!` : `Created "${formTitle}" successfully!`);
        setTimeout(() => setSuccessMsg(null), 4000);
        setIsModalOpen(false);
        await fetchHighlights();
        if (onRefresh) await onRefresh();
      } else {
        setModalError(data.error || "Failed to save. Please try again.");
      }
    } catch {
      setModalError("Network error while saving.");
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
        setSuccessMsg(`Deleted "${highlightToDelete.title}".`);
        setTimeout(() => setSuccessMsg(null), 3500);
        setDeleteModalOpen(false);
        setHighlightToDelete(null);
        await fetchHighlights();
        if (onRefresh) await onRefresh();
      } else {
        alert(data.error || "Failed to delete.");
      }
    } catch {
      alert("Network error deleting highlight.");
    } finally {
      setDeleting(false);
    }
  };

  // Filtered highlights for search & tab filter
  const filteredHighlights = highlights.filter((h) => {
    const matchQuery =
      h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.tag && h.tag.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchQuery) return false;
    if (filterActive === "active") return h.active === 1;
    if (filterActive === "inactive") return h.active === 0;
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Hidden file input for replacing single gallery image */}
      <input
        type="file"
        ref={replaceInputRef}
        onChange={handleReplaceUpload}
        accept="image/*"
        style={{ display: "none" }}
      />

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. CLEAN TOP HEADER                                           */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: "24px 28px",
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
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
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
              Highlights &amp; Galleries
            </h1>
          </div>
          <p style={{ color: "#64748b", fontSize: "0.88rem", margin: 0 }}>
            Manage the 4 main showcase cards on your homepage and their customer photo galleries.
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
            <span>Add New Highlight</span>
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
          }}
        >
          <AlertTriangle size={20} color="#dc2626" />
          <span style={{ fontWeight: 500 }}>{errorMsg}</span>
        </div>
      )}

      {/* Search & Status Filter Bar */}
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
        }}
      >
        <div style={{ position: "relative", minWidth: 260, flex: 1, maxWidth: 380 }}>
          <Search
            size={16}
            style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}
          />
          <input
            type="text"
            placeholder="Search by highlight name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 14px 9px 38px",
              borderRadius: 10,
              border: "1px solid #e2e8f0",
              fontSize: "0.88rem",
              outline: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "0.84rem", color: "#64748b", fontWeight: 600 }}>Filter:</span>
          {(
            [
              { id: "all", label: `All (${highlights.length})` },
              { id: "active", label: `Active (${highlights.filter((h) => h.active === 1).length})` },
              { id: "inactive", label: `Hidden (${highlights.filter((h) => h.active === 0).length})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterActive(tab.id)}
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                border: filterActive === tab.id ? "1px solid #db2777" : "1px solid #e2e8f0",
                background: filterActive === tab.id ? "#fdf2f8" : "#fff",
                color: filterActive === tab.id ? "#be185d" : "#64748b",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. VISUAL CARD-BASED DASHBOARD                                */}
      {/* ───────────────────────────────────────────────────────────── */}
      {loading ? (
        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            padding: "80px 20px",
            textAlign: "center",
            border: "1px solid #f1f5f9",
          }}
        >
          <div style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>
            <RefreshCw size={30} color="#db2777" />
          </div>
          <div style={{ marginTop: 14, fontWeight: 600, color: "#1e293b", fontSize: "0.98rem" }}>
            Loading your highlights...
          </div>
        </div>
      ) : filteredHighlights.length === 0 ? (
        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            padding: "80px 20px",
            textAlign: "center",
            border: "1px solid #fce7f3",
          }}
        >
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: "50%",
              background: "#fdf2f8",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#db2777",
              marginBottom: 14,
            }}
          >
            <Sparkles size={28} />
          </div>
          <h3 style={{ margin: "0 0 6px", color: "#1e293b", fontSize: "1.1rem", fontWeight: 700 }}>
            No highlights found
          </h3>
          <p style={{ margin: "0 0 20px", color: "#64748b", fontSize: "0.88rem" }}>
            {searchQuery ? "No highlights match your search." : "Click below to create your first highlight category."}
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
            + Add New Highlight
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 22,
          }}
        >
          {filteredHighlights.map((item) => {
            const galleryCount = item.gallery ? item.gallery.length : (item.gallery_count || 0);
            const isItemActive = item.active === 1;
            const isSelected = item.id === selectedCardId;

            return (
              <div
                key={item.id}
                onClick={() => handleSelectCard(item)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelectCard(item);
                  }
                }}
                style={{
                  background: "#fff",
                  borderRadius: 20,
                  border: isSelected ? "2px solid #db2777" : "1px solid #f1f5f9",
                  overflow: "hidden",
                  boxShadow: isSelected
                    ? "0 12px 30px rgba(219, 39, 119, 0.16)"
                    : "0 4px 18px rgba(0, 0, 0, 0.04)",
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 12px 30px rgba(219, 39, 119, 0.12)";
                  if (!isSelected) e.currentTarget.style.borderColor = "#f472b6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = isSelected
                    ? "0 12px 30px rgba(219, 39, 119, 0.16)"
                    : "0 4px 18px rgba(0, 0, 0, 0.04)";
                  if (!isSelected) e.currentTarget.style.borderColor = "#f1f5f9";
                }}
              >
                {/* Card Top: Cover Image with Overlaid Badges */}
                <div style={{ position: "relative", width: "100%", height: 180, background: "#f8fafc", overflow: "hidden" }}>
                  <img
                    src={item.cover_image}
                    alt={item.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />

                  {/* Hover Overlay: Click to See Highlight */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(15, 23, 42, 0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: 0,
                      transition: "opacity 0.2s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
                  >
                    <span
                      style={{
                        background: "rgba(255, 255, 255, 0.95)",
                        color: "#be185d",
                        padding: "7px 14px",
                        borderRadius: 20,
                        fontWeight: 700,
                        fontSize: "0.82rem",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        boxShadow: "0 4px 14px rgba(0, 0, 0, 0.15)",
                      }}
                    >
                      <Eye size={15} />
                      <span>Click to See Highlight</span>
                    </span>
                  </div>

                  {/* Active / Inactive Status Pill */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleActive(item, e);
                    }}
                    style={{
                      position: "absolute",
                      top: 12,
                      left: 12,
                      padding: "4px 10px",
                      borderRadius: 20,
                      border: "none",
                      background: isItemActive ? "rgba(22, 101, 52, 0.9)" : "rgba(71, 85, 105, 0.85)",
                      backdropFilter: "blur(4px)",
                      color: "#fff",
                      fontSize: "0.74rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      zIndex: 2,
                    }}
                    title="Click to toggle Show/Hide"
                  >
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: isItemActive ? "#4ade80" : "#cbd5e1",
                      }}
                    />
                    <span>{isItemActive ? "Active" : "Hidden"}</span>
                  </button>

                  {/* Image Count Pill */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 12,
                      right: 12,
                      padding: "4px 10px",
                      borderRadius: 20,
                      background: "rgba(15, 23, 42, 0.75)",
                      backdropFilter: "blur(4px)",
                      color: "#fff",
                      fontSize: "0.74rem",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      zIndex: 2,
                    }}
                  >
                    <ImageIcon size={13} />
                    <span>{galleryCount} photos</span>
                  </div>

                  {/* Tag Pill */}
                  {item.tag && (
                    <div
                      style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        padding: "4px 9px",
                        borderRadius: 6,
                        background: "rgba(255, 255, 255, 0.92)",
                        color: "#be185d",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        zIndex: 2,
                      }}
                    >
                      {item.tag}
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "1.15rem",
                        fontWeight: 700,
                        color: "#1e293b",
                        fontFamily: "var(--font-serif)",
                      }}
                    >
                      {item.title}
                    </h3>
                    <span style={{ fontWeight: 700, color: "#be185d", fontSize: "0.95rem" }}>
                      {item.price_display || (item.starting_price > 0 ? `₹ ${item.starting_price.toLocaleString("en-IN")}` : "Inquire")}
                    </span>
                  </div>

                  <p
                    style={{
                      margin: "0 0 16px",
                      color: "#64748b",
                      fontSize: "0.84rem",
                      lineHeight: 1.5,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      flex: 1,
                    }}
                  >
                    {item.description}
                  </p>

                  {/* Card Action Buttons */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      paddingTop: 14,
                      borderTop: "1px solid #f1f5f9",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Primary Button: See Highlight */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectCard(item);
                      }}
                      style={{
                        flex: 1.2,
                        padding: "10px 14px",
                        borderRadius: 10,
                        border: "1px solid #fce7f3",
                        background: "#fdf2f8",
                        color: "#be185d",
                        fontWeight: 700,
                        fontSize: "0.86rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#fce7f3";
                        e.currentTarget.style.borderColor = "#f472b6";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#fdf2f8";
                        e.currentTarget.style.borderColor = "#fce7f3";
                      }}
                      title="See full highlight gallery, prices, and inquiry preview"
                    >
                      <Eye size={15} />
                      <span>See Highlight</span>
                    </button>

                    {/* Edit Highlight Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(item);
                      }}
                      style={{
                        flex: 0.9,
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: "1px solid #e2e8f0",
                        background: "#fff",
                        color: "#334155",
                        fontWeight: 600,
                        fontSize: "0.84rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 5,
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#f8fafc";
                        e.currentTarget.style.borderColor = "#cbd5e1";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#fff";
                        e.currentTarget.style.borderColor = "#e2e8f0";
                      }}
                      title="Edit basic info, photo gallery, and contacts"
                    >
                      <Edit size={14} />
                      <span>Edit</span>
                    </button>

                    {/* Delete Highlight Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setHighlightToDelete(item);
                        setDeleteModalOpen(true);
                      }}
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        border: "1px solid #fee2e2",
                        background: "#fff5f5",
                        color: "#dc2626",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#fee2e2")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#fff5f5")}
                      title="Delete Highlight"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. SIMPLE 4-TAB EDITING MODAL                                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 20,
            overscrollBehavior: "contain",
          }}
          onClick={() => !saving && setIsModalOpen(false)}
          onWheel={(e) => {
            if (e.target === e.currentTarget) e.stopPropagation();
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 24,
              width: "100%",
              maxWidth: 860,
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 50px -12px rgba(131, 24, 67, 0.2)",
              overflow: "hidden",
              overscrollBehavior: "contain",
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
                    fontSize: "1.35rem",
                    fontWeight: 700,
                    margin: 0,
                  }}
                >
                  {editingHighlight ? `Edit "${editingHighlight.title}"` : "Add New Highlight"}
                </h2>
                <p style={{ margin: "2px 0 0", color: "#64748b", fontSize: "0.84rem" }}>
                  Use the 4 tabs below to configure the basic info, photo gallery, and contact buttons.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  width: 36,
                  height: 36,
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

            {/* 4 Clean Tabs */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                borderBottom: "1px solid #e2e8f0",
                background: "#fff",
              }}
            >
              {[
                { id: "basic", label: "1. Basic Info", icon: Sparkles },
                { id: "gallery", label: `2. Gallery (${formGallery.length})`, icon: ImageIcon },
                { id: "contact", label: "3. Contact & WhatsApp", icon: MessageCircle },
                { id: "settings", label: "4. Settings", icon: SettingsIcon },
              ].map((tab) => {
                const IconComp = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    style={{
                      padding: "14px 8px",
                      border: "none",
                      background: isSelected ? "#fff" : "#fafafa",
                      borderBottom: isSelected ? "3px solid #db2777" : "1px solid #e2e8f0",
                      color: isSelected ? "#be185d" : "#64748b",
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: "0.86rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <IconComp size={15} color={isSelected ? "#db2777" : "#94a3b8"} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Body */}
            <form
              onSubmit={handleSave}
              style={{
                overflowY: "auto",
                padding: "24px 28px",
                flex: 1,
                overscrollBehavior: "contain",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {modalError && (
                <div
                  style={{
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    color: "#991b1b",
                    padding: "12px 16px",
                    borderRadius: 10,
                    fontSize: "0.88rem",
                    marginBottom: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <AlertTriangle size={18} color="#dc2626" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* ───────────────────────────────────────────────────── */}
              {/* TAB 1: BASIC INFORMATION                              */}
              {/* ───────────────────────────────────────────────────── */}
              {activeTab === "basic" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 18 }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>
                        Highlight Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Car Decor, Stage Decor, Church Decor"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "11px 14px",
                          borderRadius: 10,
                          border: "1px solid #cbd5e1",
                          fontSize: "0.92rem",
                        }}
                      />
                      <span style={{ fontSize: "0.76rem", color: "#64748b", marginTop: 4, display: "block" }}>
                        Displayed as the main title on the homepage card and popup gallery.
                      </span>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>
                        Displayed Price
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. ₹ 1,800 or Starting from ₹1,800"
                        value={formPriceDisplay}
                        onChange={(e) => setFormPriceDisplay(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "11px 14px",
                          borderRadius: 10,
                          border: "1px solid #cbd5e1",
                          fontSize: "0.92rem",
                        }}
                      />
                      <span style={{ fontSize: "0.76rem", color: "#64748b", marginTop: 4, display: "block" }}>
                        Shown to customers as the starting inquiry price.
                      </span>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>
                      Short Description *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Explain this decoration or floral service in 2-3 sentences..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        borderRadius: 10,
                        border: "1px solid #cbd5e1",
                        fontSize: "0.9rem",
                        lineHeight: 1.5,
                      }}
                    />
                  </div>

                  {/* Cover Photo Upload */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>
                      Cover Photo * (Featured on Homepage)
                    </label>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 18,
                        background: "#fafafa",
                        padding: 16,
                        borderRadius: 14,
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      {formCoverImage ? (
                        <div style={{ position: "relative" }}>
                          <img
                            src={formCoverImage}
                            alt="Cover"
                            style={{
                              width: 120,
                              height: 90,
                              borderRadius: 12,
                              objectFit: "cover",
                              border: "1px solid #e2e8f0",
                            }}
                          />
                        </div>
                      ) : (
                        <div
                          style={{
                            width: 120,
                            height: 90,
                            borderRadius: 12,
                            background: "#fdf2f8",
                            border: "2px dashed #fce7f3",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#db2777",
                          }}
                        >
                          <ImageIcon size={32} />
                        </div>
                      )}

                      <div style={{ flex: 1 }}>
                        <label
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "9px 18px",
                            borderRadius: 8,
                            background: "#db2777",
                            color: "#fff",
                            fontSize: "0.86rem",
                            fontWeight: 600,
                            cursor: uploadingCover ? "not-allowed" : "pointer",
                            marginBottom: 8,
                          }}
                        >
                          <Upload size={15} />
                          <span>{uploadingCover ? "Uploading to Cloudinary..." : formCoverImage ? "Change Cover Photo" : "Upload Cover Photo"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingCover}
                            onChange={handleCoverUpload}
                            style={{ display: "none" }}
                          />
                        </label>
                        <p style={{ margin: 0, fontSize: "0.78rem", color: "#64748b" }}>
                          JPG, PNG, or WebP. Photo will be saved to Cloudinary automatically.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: "right", marginTop: 10 }}>
                    <button
                      type="button"
                      onClick={() => setActiveTab("gallery")}
                      style={{
                        padding: "8px 18px",
                        borderRadius: 8,
                        border: "1px solid #fce7f3",
                        background: "#fdf2f8",
                        color: "#be185d",
                        fontWeight: 600,
                        fontSize: "0.86rem",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <span>Next: Manage Gallery Images</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* ───────────────────────────────────────────────────── */}
              {/* TAB 2: GALLERY IMAGES                                 */}
              {/* ───────────────────────────────────────────────────── */}
              {activeTab === "gallery" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {/* Upload Box */}
                  <div
                    style={{
                      background: "#fdf2f8",
                      border: "2px dashed #fce7f3",
                      borderRadius: 16,
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
                        boxShadow: "0 2px 8px rgba(219, 39, 119, 0.15)",
                      }}
                    >
                      <Upload size={20} />
                    </div>

                    <h4 style={{ margin: "0 0 4px", color: "#831843", fontSize: "1rem", fontWeight: 700 }}>
                      Add Photos to This Gallery
                    </h4>
                    <p style={{ margin: "0 0 16px", color: "#64748b", fontSize: "0.84rem" }}>
                      You can select multiple photos from your computer or phone at once.
                    </p>

                    <label
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "11px 24px",
                        borderRadius: 10,
                        background: "linear-gradient(135deg, #db2777 0%, #be185d 100%)",
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        cursor: uploadingGallery ? "not-allowed" : "pointer",
                        boxShadow: "0 4px 12px rgba(219, 39, 119, 0.25)",
                      }}
                    >
                      <Plus size={17} />
                      <span>{uploadingGallery ? "Uploading Images..." : "+ Choose Images to Upload"}</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        disabled={uploadingGallery}
                        onChange={handleGalleryUpload}
                        style={{ display: "none" }}
                      />
                    </label>

                    {uploadProgressText && (
                      <div style={{ marginTop: 12, fontSize: "0.82rem", color: "#be185d", fontWeight: 600 }}>
                        {uploadProgressText}
                      </div>
                    )}
                  </div>

                  {/* Existing Photos Grid */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.92rem" }}>
                        Current Gallery Photos ({formGallery.length})
                      </span>
                      <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                        Use &larr; &rarr; arrows to change photo order.
                      </span>
                    </div>

                    {formGallery.length === 0 ? (
                      <div
                        style={{
                          background: "#fafafa",
                          borderRadius: 14,
                          padding: "40px 20px",
                          textAlign: "center",
                          color: "#94a3b8",
                          border: "1px solid #f1f5f9",
                        }}
                      >
                        <ImageIcon size={32} style={{ marginBottom: 6 }} />
                        <div style={{ fontSize: "0.88rem" }}>No gallery photos added yet.</div>
                        <div style={{ fontSize: "0.78rem" }}>Upload images above to create the photo carousel.</div>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                          gap: 14,
                        }}
                      >
                        {formGallery.map((img, idx) => (
                          <div
                            key={img.id || `img-${idx}`}
                            style={{
                              background: "#fff",
                              border: "1px solid #e2e8f0",
                              borderRadius: 14,
                              overflow: "hidden",
                              boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            {/* Photo Thumbnail */}
                            <div style={{ position: "relative", width: "100%", height: 130, background: "#f8fafc" }}>
                              <img
                                src={img.image_url}
                                alt={img.title || "Gallery item"}
                                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                              />

                              <span
                                style={{
                                  position: "absolute",
                                  top: 6,
                                  left: 6,
                                  padding: "2px 7px",
                                  borderRadius: 4,
                                  background: "rgba(15, 23, 42, 0.75)",
                                  color: "#fff",
                                  fontSize: "0.7rem",
                                  fontWeight: 700,
                                }}
                              >
                                #{idx + 1}
                              </span>

                              {/* Remove Button */}
                              <button
                                type="button"
                                onClick={() => removeGalleryItem(idx)}
                                style={{
                                  position: "absolute",
                                  top: 6,
                                  right: 6,
                                  width: 26,
                                  height: 26,
                                  borderRadius: "50%",
                                  background: "rgba(220, 38, 38, 0.9)",
                                  color: "#fff",
                                  border: "none",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                }}
                                title="Remove photo"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>

                            {/* Caption & Price */}
                            <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                              <input
                                type="text"
                                placeholder="Photo title / design name"
                                value={img.title || ""}
                                onChange={(e) => updateGalleryItemField(idx, "title", e.target.value)}
                                style={{
                                  width: "100%",
                                  padding: "5px 8px",
                                  borderRadius: 6,
                                  border: "1px solid #cbd5e1",
                                  fontSize: "0.82rem",
                                  fontWeight: 600,
                                }}
                              />

                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 700 }}>₹</span>
                                <input
                                  type="number"
                                  min="0"
                                  placeholder="Price"
                                  value={img.price || ""}
                                  onChange={(e) => updateGalleryItemField(idx, "price", Number(e.target.value))}
                                  style={{
                                    flex: 1,
                                    padding: "4px 8px",
                                    borderRadius: 6,
                                    border: "1px solid #cbd5e1",
                                    fontSize: "0.82rem",
                                    fontWeight: 700,
                                    color: "#0f766e",
                                  }}
                                />
                              </div>

                              {/* Ordering Controls & Replace */}
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  paddingTop: 8,
                                  borderTop: "1px solid #f1f5f9",
                                  marginTop: "auto",
                                }}
                              >
                                <div style={{ display: "flex", gap: 4 }}>
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => moveGalleryItem(idx, "prev")}
                                    style={{
                                      padding: "3px 7px",
                                      borderRadius: 4,
                                      border: "1px solid #cbd5e1",
                                      background: idx === 0 ? "#f8fafc" : "#fff",
                                      color: idx === 0 ? "#cbd5e1" : "#334155",
                                      cursor: idx === 0 ? "not-allowed" : "pointer",
                                    }}
                                    title="Move left"
                                  >
                                    <ArrowLeft size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={idx === formGallery.length - 1}
                                    onClick={() => moveGalleryItem(idx, "next")}
                                    style={{
                                      padding: "3px 7px",
                                      borderRadius: 4,
                                      border: "1px solid #cbd5e1",
                                      background: idx === formGallery.length - 1 ? "#f8fafc" : "#fff",
                                      color: idx === formGallery.length - 1 ? "#cbd5e1" : "#334155",
                                      cursor: idx === formGallery.length - 1 ? "not-allowed" : "pointer",
                                    }}
                                    title="Move right"
                                  >
                                    <ArrowRight size={13} />
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => triggerReplaceImage(idx)}
                                  style={{
                                    border: "none",
                                    background: "transparent",
                                    color: "#db2777",
                                    fontSize: "0.76rem",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    textDecoration: "underline",
                                  }}
                                >
                                  Replace
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ───────────────────────────────────────────────────── */}
              {/* TAB 3: CONTACT INFORMATION                            */}
              {/* ───────────────────────────────────────────────────── */}
              {activeTab === "contact" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div
                    style={{
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      borderRadius: 12,
                      padding: 14,
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                    }}
                  >
                    <Info size={18} color="#16a34a" />
                    <span style={{ fontSize: "0.84rem", color: "#166534" }}>
                      When a customer clicks &quot;Inquire on WhatsApp&quot; or &quot;Call Atelier&quot; in the gallery popup, these numbers will be dialed automatically.
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>
                        WhatsApp Number (with country code, no +)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 918606464700"
                        value={formWhatsAppNumber}
                        onChange={(e) => setFormWhatsAppNumber(e.target.value)}
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
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>
                        Pre-filled WhatsApp Message
                      </label>
                      <input
                        type="text"
                        placeholder="Hello Occasions Florist, I would like to inquire..."
                        value={formWhatsAppText}
                        onChange={(e) => setFormWhatsAppText(e.target.value)}
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

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>
                        Telephone Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. +91 8606464700"
                        value={formCallNumber}
                        onChange={(e) => setFormCallNumber(e.target.value)}
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
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>
                        Call Button Label
                      </label>
                      <input
                        type="text"
                        placeholder="Call Atelier Directly"
                        value={formCallText}
                        onChange={(e) => setFormCallText(e.target.value)}
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
                </div>
              )}

              {/* ───────────────────────────────────────────────────── */}
              {/* TAB 4: SETTINGS & VISIBILITY                          */}
              {/* ───────────────────────────────────────────────────── */}
              {activeTab === "settings" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  {/* Active Toggle Card */}
                  <div
                    style={{
                      background: formActive ? "#f0fdf4" : "#f8fafc",
                      border: formActive ? "1px solid #bbf7d0" : "1px solid #e2e8f0",
                      borderRadius: 14,
                      padding: "18px 20px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.94rem", marginBottom: 2 }}>
                        Show on Public Homepage
                      </div>
                      <p style={{ margin: 0, color: "#64748b", fontSize: "0.82rem" }}>
                        When switched on, customers will see this card in the &quot;Our Highlights&quot; section.
                      </p>
                    </div>

                    <label style={{ position: "relative", display: "inline-block", width: 50, height: 26, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={formActive}
                        onChange={(e) => setFormActive(e.target.checked)}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          inset: 0,
                          borderRadius: 26,
                          background: formActive ? "#22c55e" : "#cbd5e1",
                          transition: "0.2s ease",
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            height: 20,
                            width: 20,
                            left: formActive ? 26 : 3,
                            bottom: 3,
                            background: "#fff",
                            borderRadius: "50%",
                            transition: "0.2s ease",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                          }}
                        />
                      </span>
                    </label>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>
                        Display Sequence / Order
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formDisplayOrder}
                        onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: 8,
                          border: "1px solid #cbd5e1",
                          fontSize: "0.9rem",
                        }}
                      />
                      <span style={{ fontSize: "0.76rem", color: "#64748b", marginTop: 4, display: "block" }}>
                        Cards are displayed from lowest to highest (1 = first card).
                      </span>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>
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
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>
                      Freshness Guarantee / Trust Badge
                    </label>
                    <input
                      type="text"
                      placeholder="100% Freshness Guarantee"
                      value={formGuaranteeText}
                      onChange={(e) => setFormGuaranteeText(e.target.value)}
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
              )}

              {/* Modal Footer Controls */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 20,
                  marginTop: 24,
                  borderTop: "1px solid #f1f5f9",
                }}
              >
                <div style={{ fontSize: "0.82rem", color: "#64748b" }}>
                  {formGallery.length} photos ready in gallery
                </div>

                <div style={{ display: "flex", gap: 12 }}>
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
                    disabled={saving || uploadingCover || uploadingGallery}
                    style={{
                      padding: "11px 26px",
                      borderRadius: 10,
                      border: "none",
                      background: "linear-gradient(135deg, #db2777 0%, #be185d 100%)",
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: "0.92rem",
                      cursor: saving ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      boxShadow: "0 4px 14px rgba(219, 39, 119, 0.28)",
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
      {/* 4. DELETE CONFIRMATION DIALOG                                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      {deleteModalOpen && highlightToDelete && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: 20,
            overscrollBehavior: "contain",
          }}
          onClick={() => !deleting && setDeleteModalOpen(false)}
          onWheel={(e) => {
            if (e.target === e.currentTarget) e.stopPropagation();
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              maxWidth: 420,
              width: "100%",
              padding: 26,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
              overscrollBehavior: "contain",
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
                marginBottom: 14,
              }}
            >
              <Trash2 size={24} />
            </div>

            <h3 style={{ margin: "0 0 8px", color: "#1e293b", fontSize: "1.2rem", fontWeight: 700 }}>
              Delete &quot;{highlightToDelete.title}&quot;?
            </h3>
            <p style={{ margin: "0 0 22px", color: "#64748b", fontSize: "0.88rem", lineHeight: 1.5 }}>
              Are you sure? This will remove this card from your homepage and delete its photo gallery.
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteModalOpen(false)}
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
                type="button"
                disabled={deleting}
                onClick={handleDeleteConfirm}
                style={{
                  padding: "10px 22px",
                  borderRadius: 10,
                  border: "none",
                  background: "#dc2626",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "0.88rem",
                  cursor: deleting ? "not-allowed" : "pointer",
                }}
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 5. CUSTOMER MODAL PREVIEW                                     */}
      {/* ───────────────────────────────────────────────────────────── */}
      {previewHighlight && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10001,
            padding: 20,
            overscrollBehavior: "contain",
          }}
          onClick={() => setPreviewHighlight(null)}
          onWheel={(e) => {
            if (e.target === e.currentTarget) e.stopPropagation();
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 24,
              maxWidth: 960,
              width: "100%",
              maxHeight: "92vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3)",
              padding: 24,
              position: "relative",
              overscrollBehavior: "contain",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewHighlight(null)}
              style={{
                position: "absolute",
                top: 18,
                right: 18,
                width: 34,
                height: 34,
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
              <X size={18} />
            </button>

            {/* Header: Switch between cards & quick edit */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
                flexWrap: "wrap",
                gap: 12,
                paddingRight: 44,
              }}
            >
              {/* Highlight Card Selector Pills */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Select Card:
                </span>
                {filteredHighlights.map((hl) => {
                  const isCurrent = hl.id === previewHighlight.id;
                  return (
                    <button
                      key={hl.id}
                      type="button"
                      onClick={() => {
                        setSelectedCardId(hl.id);
                        setPreviewHighlight(hl);
                        setPreviewIndex(0);
                      }}
                      style={{
                        padding: "5px 12px",
                        borderRadius: 20,
                        border: isCurrent ? "1.5px solid #db2777" : "1px solid #e2e8f0",
                        background: isCurrent ? "#fdf2f8" : "#fff",
                        color: isCurrent ? "#be185d" : "#475569",
                        fontWeight: isCurrent ? 700 : 500,
                        fontSize: "0.82rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        transition: "all 0.15s ease",
                      }}
                    >
                      {isCurrent && <Check size={12} color="#db2777" />}
                      <span>{hl.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* Direct Edit Button */}
              <button
                type="button"
                onClick={() => {
                  const toEdit = previewHighlight;
                  setPreviewHighlight(null);
                  handleOpenEdit(toEdit);
                }}
                style={{
                  padding: "7px 14px",
                  borderRadius: 10,
                  border: "1px solid #fce7f3",
                  background: "#fff",
                  color: "#be185d",
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#fdf2f8")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                title="Open editor to modify this highlight"
              >
                <Edit size={14} />
                <span>Edit Highlight</span>
              </button>
            </div>

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
                    <div
                      style={{
                        position: "relative",
                        borderRadius: 16,
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
                              left: 12,
                              top: "50%",
                              transform: "translateY(-50%)",
                              width: 38,
                              height: 38,
                              borderRadius: "50%",
                              background: "rgba(255,255,255,0.92)",
                              border: "none",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <ChevronLeft size={22} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewIndex((prev) => (prev < gallery.length - 1 ? prev + 1 : 0))
                            }
                            style={{
                              position: "absolute",
                              right: 12,
                              top: "50%",
                              transform: "translateY(-50%)",
                              width: 38,
                              height: 38,
                              borderRadius: "50%",
                              background: "rgba(255,255,255,0.92)",
                              border: "none",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <ChevronRight size={22} />
                          </button>
                        </>
                      )}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                      <h3 style={{ margin: "0 0 8px", color: "#1e293b", fontSize: "1.25rem", fontWeight: 700 }}>
                        {currentItem.title || previewHighlight.title}
                      </h3>
                      <p style={{ color: "#64748b", fontSize: "0.9rem", lineHeight: 1.6, margin: "0 0 16px" }}>
                        {currentItem.description || previewHighlight.description}
                      </p>

                      <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#be185d", marginBottom: 20 }}>
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
                            padding: "12px 20px",
                            borderRadius: 10,
                            background: "#25d366",
                            color: "#fff",
                            textDecoration: "none",
                            fontWeight: 600,
                            fontSize: "0.9rem",
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
                            padding: "12px 20px",
                            borderRadius: 10,
                            border: "1px solid #fce7f3",
                            background: "#fff",
                            color: "#be185d",
                            textDecoration: "none",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                          }}
                        >
                          <Phone size={15} />
                          <span>{previewHighlight.call_text || "Call Atelier Directly"}</span>
                        </a>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 14, color: "#059669", fontSize: "0.84rem" }}>
                        <ShieldCheck size={16} />
                        <span>{previewHighlight.guarantee_text || "100% Freshness Guarantee"}</span>
                      </div>
                    </div>
                  </div>

                  {gallery.length > 1 && (
                    <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 16 }}>
                      <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6 }}>
                        {gallery.map((g, gIdx) => (
                          <button
                            key={gIdx}
                            type="button"
                            onClick={() => setPreviewIndex(gIdx)}
                            style={{
                              border: gIdx === previewIndex ? "2px solid #db2777" : "2px solid transparent",
                              borderRadius: 10,
                              padding: 0,
                              background: "none",
                              cursor: "pointer",
                              flexShrink: 0,
                              overflow: "hidden",
                            }}
                          >
                            <img
                              src={g.image_url}
                              alt={g.title}
                              style={{ width: 75, height: 60, objectFit: "cover", display: "block" }}
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
