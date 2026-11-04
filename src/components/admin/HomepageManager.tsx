"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  LayoutTemplate,
  Plus,
  Edit,
  Trash2,
  Upload,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  Image as ImageIcon,
  ArrowUpDown,
  ExternalLink,
  Eye,
  EyeOff,
  Sparkles,
  Sliders,
} from "lucide-react";

interface Banner {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  button_text: string;
  button_link: string;
  desktop_image: string;
  mobile_image?: string;
  badge?: string;
  active: number;
  display_order: number;
}

interface Section {
  key: string;
  title: string;
  subtitle: string;
  product_ids: string | string[];
  active: number;
  display_order: number;
}

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string;
  category_id: string;
  active: number;
}

export default function HomepageManager() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Banner Modal
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [bannerForm, setBannerForm] = useState({
    type: "hero",
    title: "",
    subtitle: "",
    button_text: "Shop Now",
    button_link: "/flower-bouquets",
    desktop_image: "",
    mobile_image: "",
    badge: "",
    active: 1,
    display_order: 0,
  });
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [savingBanner, setSavingBanner] = useState(false);

  // Lock background body scroll when banner modal is open
  useEffect(() => {
    if (!isBannerModalOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isBannerModalOpen]);

  // Section Modal
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [sectionForm, setSectionForm] = useState({
    title: "",
    subtitle: "",
    product_ids: [] as string[],
    active: 1,
    display_order: 0,
  });
  const [savingSection, setSavingSection] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await fetch("/api/admin/homepage");
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch homepage data");
      }
      setBanners(data.banners || []);
      setSections(data.sections || []);
      setProducts(data.products || []);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load homepage configuration");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenAddBanner = () => {
    setEditingBanner(null);
    setBannerForm({
      type: "hero",
      title: "",
      subtitle: "",
      button_text: "Shop Now",
      button_link: "/flower-bouquets",
      desktop_image: "",
      mobile_image: "",
      badge: "",
      active: 1,
      display_order: banners.length + 1,
    });
    setIsBannerModalOpen(true);
  };

  const handleOpenEditBanner = (b: Banner) => {
    setEditingBanner(b);
    setBannerForm({
      type: b.type || "hero",
      title: b.title || "",
      subtitle: b.subtitle || "",
      button_text: b.button_text || "Shop Now",
      button_link: b.button_link || "/flower-bouquets",
      desktop_image: b.desktop_image || "",
      mobile_image: b.mobile_image || "",
      badge: b.badge || "",
      active: b.active ?? 1,
      display_order: b.display_order || 0,
    });
    setIsBannerModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: "desktop_image" | "mobile_image") => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(fieldName);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "occasions/banners");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload image");
      }
      setBannerForm((prev) => ({
        ...prev,
        [fieldName]: data.url,
        // If mobile is empty and desktop is uploaded, use desktop as mobile too
        mobile_image: fieldName === "desktop_image" && !prev.mobile_image ? data.url : prev.mobile_image,
      }));
    } catch (err: any) {
      setErrorMsg(err.message || "Upload error");
    } finally {
      setUploadingImage(null);
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm.desktop_image) {
      setErrorMsg("Desktop image is required for banner");
      return;
    }

    try {
      setSavingBanner(true);
      setErrorMsg(null);

      if (editingBanner) {
        // Update
        const res = await fetch("/api/admin/homepage", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "update_banner",
            banner: { ...bannerForm, id: editingBanner.id },
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || "Failed to update banner");
        setSuccessMsg("Banner updated successfully!");
      } else {
        // Create
        const res = await fetch("/api/admin/homepage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bannerForm),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || "Failed to create banner");
        setSuccessMsg("New banner created successfully!");
      }

      setIsBannerModalOpen(false);
      await fetchData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Error saving banner");
    } finally {
      setSavingBanner(false);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm("Are you sure you want to delete this homepage banner?")) return;

    try {
      setErrorMsg(null);
      const res = await fetch(`/api/admin/homepage?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to delete banner");
      setSuccessMsg("Banner removed successfully!");
      await fetchData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Error deleting banner");
    }
  };

  const handleToggleBannerActive = async (b: Banner) => {
    try {
      const updated = { ...b, active: b.active ? 0 : 1 };
      await fetch("/api/admin/homepage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_banner",
          banner: updated,
        }),
      });
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to toggle status");
    }
  };

  const handleOpenEditSection = (s: Section) => {
    let ids: string[] = [];
    if (typeof s.product_ids === "string") {
      try {
        ids = JSON.parse(s.product_ids);
      } catch {
        ids = [];
      }
    } else if (Array.isArray(s.product_ids)) {
      ids = s.product_ids;
    }

    setEditingSection(s);
    setSectionForm({
      title: s.title || "",
      subtitle: s.subtitle || "",
      product_ids: ids,
      active: s.active ?? 1,
      display_order: s.display_order || 0,
    });
  };

  const handleToggleProductInSection = (productId: string) => {
    setSectionForm((prev) => {
      const exists = prev.product_ids.includes(productId);
      return {
        ...prev,
        product_ids: exists
          ? prev.product_ids.filter((id) => id !== productId)
          : [...prev.product_ids, productId],
      };
    });
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection) return;

    try {
      setSavingSection(true);
      setErrorMsg(null);

      const res = await fetch("/api/admin/homepage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_section",
          section: {
            key: editingSection.key,
            title: sectionForm.title,
            subtitle: sectionForm.subtitle,
            product_ids: sectionForm.product_ids,
            active: sectionForm.active,
            display_order: sectionForm.display_order,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to update section");

      setSuccessMsg(`Homepage section "${editingSection.key}" updated!`);
      setEditingSection(null);
      await fetchData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save section");
    } finally {
      setSavingSection(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: "24px 28px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          border: "1px solid #f1f5f9",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <LayoutTemplate size={22} color="#be185d" />
            <h2 style={{ fontFamily: "var(--font-serif, serif)", fontSize: "1.4rem", color: "#831843", margin: 0 }}>
              Homepage Content Management (CMS)
            </h2>
          </div>
          <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>
            Manage hero carousel slides, promotional banners, featured product highlights, and seasonal displays.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={fetchData}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 16px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              fontSize: "0.85rem",
              cursor: "pointer",
              color: "#475569",
            }}
          >
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddBanner}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 18px",
              background: "linear-gradient(135deg, #be185d 0%, #9d174d 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(190, 24, 93, 0.25)",
            }}
          >
            <Plus size={16} />
            <span>Add Hero Banner</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div
          style={{
            background: "#ecfdf5",
            border: "1px solid #10b981",
            color: "#065f46",
            padding: "12px 18px",
            borderRadius: 10,
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Check size={18} color="#059669" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            background: "#fff1f2",
            border: "1px solid #f43f5e",
            color: "#9f1239",
            padding: "12px 18px",
            borderRadius: 10,
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <AlertTriangle size={18} color="#e11d48" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Section 1: Hero & Promo Banners */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 24,
          border: "1px solid #f1f5f9",
          boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: "1.1rem", color: "#831843", margin: 0, fontWeight: 700 }}>
            1. Hero &amp; Promotional Banners ({banners.length})
          </h3>
          <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
            Active banners rotate automatically on the customer homepage hero slider.
          </span>
        </div>

        {banners.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "#94a3b8" }}>
            No banners configured. Click &quot;Add Hero Banner&quot; above to create one.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
                  <th style={{ padding: "12px 16px", color: "#475569" }}>Order</th>
                  <th style={{ padding: "12px 16px", color: "#475569" }}>Banner Preview</th>
                  <th style={{ padding: "12px 16px", color: "#475569" }}>Title &amp; Subtitle</th>
                  <th style={{ padding: "12px 16px", color: "#475569" }}>CTA Button</th>
                  <th style={{ padding: "12px 16px", color: "#475569" }}>Type</th>
                  <th style={{ padding: "12px 16px", color: "#475569" }}>Status</th>
                  <th style={{ padding: "12px 16px", color: "#475569", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {banners.map((b) => (
                  <tr key={b.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 700, color: "#64748b" }}>
                      #{b.display_order}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div
                        style={{
                          width: 120,
                          height: 56,
                          borderRadius: 8,
                          overflow: "hidden",
                          background: "#f1f5f9",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <img
                          src={b.desktop_image}
                          alt={b.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", maxWidth: 280 }}>
                      <div style={{ fontWeight: 600, color: "#1e293b", marginBottom: 2 }}>
                        {b.title || "—"}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {b.subtitle || "—"}
                      </div>
                      {b.badge && (
                        <span
                          style={{
                            display: "inline-block",
                            marginTop: 4,
                            padding: "2px 6px",
                            borderRadius: 4,
                            background: "#fdf2f8",
                            color: "#be185d",
                            fontSize: "0.7rem",
                            fontWeight: 600,
                          }}
                        >
                          {b.badge}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "#be185d",
                          fontWeight: 600,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        {b.button_text || "Shop"} &rarr; {b.button_link}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          textTransform: "capitalize",
                          fontSize: "0.78rem",
                          padding: "3px 8px",
                          borderRadius: 6,
                          background: b.type === "hero" ? "#eff6ff" : "#fef3c7",
                          color: b.type === "hero" ? "#1d4ed8" : "#b45309",
                          fontWeight: 600,
                        }}
                      >
                        {b.type}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <button
                        type="button"
                        onClick={() => handleToggleBannerActive(b)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "4px 8px",
                          borderRadius: 6,
                          border: "none",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          background: b.active ? "#dcfce7" : "#f1f5f9",
                          color: b.active ? "#15803d" : "#64748b",
                        }}
                      >
                        {b.active ? <Eye size={12} /> : <EyeOff size={12} />}
                        <span>{b.active ? "Active" : "Disabled"}</span>
                      </button>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditBanner(b)}
                          style={{
                            padding: "6px 10px",
                            background: "#f8fafc",
                            border: "1px solid #cbd5e1",
                            borderRadius: 6,
                            cursor: "pointer",
                            color: "#334155",
                          }}
                          title="Edit Banner"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBanner(b.id)}
                          style={{
                            padding: "6px 10px",
                            background: "#fff1f2",
                            border: "1px solid #fecdd3",
                            borderRadius: 6,
                            cursor: "pointer",
                            color: "#e11d48",
                          }}
                          title="Delete Banner"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 2: Homepage Product Sections */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 24,
          border: "1px solid #f1f5f9",
          boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: "1.1rem", color: "#831843", margin: 0, fontWeight: 700 }}>
            2. Curated Homepage Sections
          </h3>
          <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
            Select which products appear under &quot;Featured Masterpieces&quot; and &quot;New Arrivals&quot;.
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 18 }}>
          {sections.map((s) => {
            let pIds: string[] = [];
            if (typeof s.product_ids === "string") {
              try {
                pIds = JSON.parse(s.product_ids);
              } catch {
                pIds = [];
              }
            } else if (Array.isArray(s.product_ids)) {
              pIds = s.product_ids;
            }

            return (
              <div
                key={s.key}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  padding: 18,
                  background: "#fafafa",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: "1rem", color: "#831843" }}>{s.title}</div>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: s.active ? "#dcfce7" : "#f1f5f9",
                        color: s.active ? "#15803d" : "#64748b",
                        fontWeight: 600,
                      }}
                    >
                      {s.active ? "Active" : "Disabled"}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "#64748b", marginBottom: 12 }}>{s.subtitle}</div>
                  <div style={{ fontSize: "0.8rem", color: "#475569", fontWeight: 600 }}>
                    Selected Products ({pIds.length}):
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                    {pIds.map((pid) => {
                      const prod = products.find((p) => p.id === pid);
                      return (
                        <span
                          key={pid}
                          style={{
                            fontSize: "0.75rem",
                            background: "#fff",
                            border: "1px solid #cbd5e1",
                            padding: "3px 8px",
                            borderRadius: 6,
                            color: "#334155",
                          }}
                        >
                          {prod ? prod.name : pid}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div style={{ marginTop: 18, textAlign: "right" }}>
                  <button
                    type="button"
                    onClick={() => handleOpenEditSection(s)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 14px",
                      background: "#fff",
                      border: "1px solid #be185d",
                      color: "#be185d",
                      borderRadius: 8,
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <Sliders size={14} />
                    <span>Configure Section</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BANNER ADD / EDIT MODAL */}
      {isBannerModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              maxWidth: 600,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 24,
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h3 style={{ margin: 0, color: "#831843", fontSize: "1.2rem" }}>
                {editingBanner ? "Edit Hero Banner" : "Add New Hero Banner"}
              </h3>
              <button
                type="button"
                onClick={() => setIsBannerModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                  Banner Title *
                </label>
                <input
                  type="text"
                  required
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Bespoke Floral Atelier & Luxury Celebrations"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid #cbd5e1",
                    borderRadius: 8,
                    fontSize: "0.9rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                  Subtitle / Promo Text
                </label>
                <textarea
                  rows={2}
                  value={bannerForm.subtitle}
                  onChange={(e) => setBannerForm((p) => ({ ...p, subtitle: e.target.value }))}
                  placeholder="e.g. Handcrafted fresh flower bouquets, artisanal flower baskets, gourmet cakes & decor in Calicut."
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid #cbd5e1",
                    borderRadius: 8,
                    fontSize: "0.88rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={bannerForm.button_text}
                    onChange={(e) => setBannerForm((p) => ({ ...p, button_text: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: 8,
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                    Button Link
                  </label>
                  <input
                    type="text"
                    value={bannerForm.button_link}
                    onChange={(e) => setBannerForm((p) => ({ ...p, button_link: e.target.value }))}
                    placeholder="/flower-bouquets"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: 8,
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              {/* Desktop Image Upload */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                  Desktop Banner Image (1920x800 recommended) *
                </label>
                {bannerForm.desktop_image && (
                  <div
                    style={{
                      width: "100%",
                      height: 120,
                      borderRadius: 8,
                      overflow: "hidden",
                      border: "1px solid #e2e8f0",
                      marginBottom: 8,
                    }}
                  >
                    <img
                      src={bannerForm.desktop_image}
                      alt="Preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                )}
                <label
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 14px",
                    background: "#fdf2f8",
                    color: "#be185d",
                    border: "1px solid #fbcfe8",
                    borderRadius: 8,
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <Upload size={14} />
                  <span>{uploadingImage === "desktop_image" ? "Uploading to Cloudinary..." : "Upload Desktop Image"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    disabled={uploadingImage !== null}
                    onChange={(e) => handleImageUpload(e, "desktop_image")}
                  />
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                    Top Pill Badge (Optional)
                  </label>
                  <input
                    type="text"
                    value={bannerForm.badge}
                    onChange={(e) => setBannerForm((p) => ({ ...p, badge: e.target.value }))}
                    placeholder="e.g. Premium Handcrafted"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: 8,
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={bannerForm.display_order}
                    onChange={(e) => setBannerForm((p) => ({ ...p, display_order: parseInt(e.target.value) || 0 }))}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: 8,
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  style={{
                    padding: "10px 18px",
                    background: "#f1f5f9",
                    border: "none",
                    borderRadius: 8,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingBanner}
                  style={{
                    padding: "10px 22px",
                    background: "linear-gradient(135deg, #be185d 0%, #9d174d 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: "0.88rem",
                    cursor: savingBanner ? "not-allowed" : "pointer",
                  }}
                >
                  {savingBanner ? "Saving..." : "Save Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SECTION CONFIGURE MODAL */}
      {editingSection && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              maxWidth: 700,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 24,
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h3 style={{ margin: 0, color: "#831843", fontSize: "1.2rem" }}>
                Configure Section: {editingSection.key}
              </h3>
              <button
                type="button"
                onClick={() => setEditingSection(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveSection} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                  Section Heading *
                </label>
                <input
                  type="text"
                  required
                  value={sectionForm.title}
                  onChange={(e) => setSectionForm((p) => ({ ...p, title: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid #cbd5e1",
                    borderRadius: 8,
                    fontSize: "0.9rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                  Section Subheading
                </label>
                <input
                  type="text"
                  value={sectionForm.subtitle}
                  onChange={(e) => setSectionForm((p) => ({ ...p, subtitle: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid #cbd5e1",
                    borderRadius: 8,
                    fontSize: "0.9rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                  Select Products to Showcase ({sectionForm.product_ids.length} selected)
                </label>
                <div
                  style={{
                    maxHeight: 280,
                    overflowY: "auto",
                    border: "1px solid #cbd5e1",
                    borderRadius: 8,
                    padding: 8,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  {products.map((p) => {
                    const isSelected = sectionForm.product_ids.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleToggleProductInSection(p.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 12px",
                          borderRadius: 6,
                          background: isSelected ? "#fdf2f8" : "#fff",
                          border: `1px solid ${isSelected ? "#fbcfe8" : "#f1f5f9"}`,
                          cursor: "pointer",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            style={{ cursor: "pointer" }}
                          />
                          <span style={{ fontSize: "0.85rem", fontWeight: isSelected ? 600 : 400, color: "#1e293b" }}>
                            {p.name}
                          </span>
                        </div>
                        <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#be185d" }}>
                          ₹{p.price}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  style={{
                    padding: "10px 18px",
                    background: "#f1f5f9",
                    border: "none",
                    borderRadius: 8,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSection}
                  style={{
                    padding: "10px 22px",
                    background: "linear-gradient(135deg, #be185d 0%, #9d174d 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: "0.88rem",
                    cursor: savingSection ? "not-allowed" : "pointer",
                  }}
                >
                  {savingSection ? "Saving..." : "Save Section Configuration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

