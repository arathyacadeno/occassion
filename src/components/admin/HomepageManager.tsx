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
  Heart,
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

interface OccasionItem {
  id: string;
  name: string;
  slug: string;
  image?: string;
  href?: string;
  whatsapp_message?: string;
  active: number;
  display_order: number;
}

export default function HomepageManager() {
  const [banners, setBanners] = useState<Banner[]>([]);
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

  // Occasions State & Modal
  const [occasions, setOccasions] = useState<OccasionItem[]>([]);
  const [isOccasionModalOpen, setIsOccasionModalOpen] = useState(false);
  const [editingOccasion, setEditingOccasion] = useState<OccasionItem | null>(null);
  const [occasionForm, setOccasionForm] = useState({
    name: "",
    slug: "",
    image: "",
    href: "",
    whatsapp_message: "",
    active: 1,
    display_order: 0,
  });
  const [uploadingOccasionImg, setUploadingOccasionImg] = useState(false);
  const [savingOccasion, setSavingOccasion] = useState(false);

  // Lock background body scroll when any modal is open
  useEffect(() => {
    if (!isBannerModalOpen && !isOccasionModalOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isBannerModalOpen, isOccasionModalOpen]);

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

      // Load occasions
      const occRes = await fetch("/api/occasions");
      const occData = await occRes.json();
      if (occData.success && Array.isArray(occData.occasions)) {
        setOccasions(occData.occasions);
      }
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

  // Occasions Handlers
  const handleOpenAddOccasion = () => {
    setEditingOccasion(null);
    setOccasionForm({
      name: "",
      slug: "",
      image: "",
      href: "",
      whatsapp_message: "",
      active: 1,
      display_order: occasions.length + 1,
    });
    setIsOccasionModalOpen(true);
  };

  const handleOpenEditOccasion = (occ: OccasionItem) => {
    setEditingOccasion(occ);
    setOccasionForm({
      name: occ.name,
      slug: occ.slug,
      image: occ.image || "",
      href: occ.href || `/flower-bouquets?occasion=${occ.slug}`,
      whatsapp_message: occ.whatsapp_message || "",
      active: occ.active ?? 1,
      display_order: occ.display_order ?? 0,
    });
    setIsOccasionModalOpen(true);
  };

  const handleOccasionImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingOccasionImg(true);
      setErrorMsg(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "occasions/occasions");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload image to Cloudinary");
      }

      setOccasionForm((p) => ({ ...p, image: data.url }));
    } catch (err: any) {
      setErrorMsg(err.message || "Image upload failed");
    } finally {
      setUploadingOccasionImg(false);
    }
  };

  const handleSaveOccasion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!occasionForm.name.trim()) {
      setErrorMsg("Occasion name is required");
      return;
    }

    try {
      setSavingOccasion(true);
      setErrorMsg(null);

      const isEdit = !!editingOccasion;
      const url = "/api/occasions";
      const method = isEdit ? "PUT" : "POST";
      const body = isEdit
        ? { id: editingOccasion.id, ...occasionForm }
        : occasionForm;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save occasion");
      }

      setSuccessMsg(isEdit ? "Occasion updated successfully!" : "New occasion created successfully!");
      setTimeout(() => setSuccessMsg(null), 4000);
      setIsOccasionModalOpen(false);
      setEditingOccasion(null);
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save occasion");
    } finally {
      setSavingOccasion(false);
    }
  };

  const handleDeleteOccasion = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the occasion "${name}"?`)) return;

    try {
      setLoading(true);
      setErrorMsg(null);

      const res = await fetch(`/api/occasions?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete occasion");
      }

      setSuccessMsg(`Occasion "${name}" deleted successfully.`);
      setTimeout(() => setSuccessMsg(null), 4000);
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to delete occasion");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOccasionActive = async (occ: OccasionItem) => {
    try {
      const newActive = occ.active === 1 ? 0 : 1;
      const res = await fetch("/api/occasions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: occ.id,
          name: occ.name,
          slug: occ.slug,
          image: occ.image,
          href: occ.href,
          whatsappMessage: occ.whatsapp_message,
          active: newActive,
          displayOrder: occ.display_order,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update occasion status");
      }

      setOccasions((prev) =>
        prev.map((o) => (o.id === occ.id ? { ...o, active: newActive } : o))
      );
    } catch (err: any) {
      setErrorMsg(err.message || "Could not toggle status");
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

      {/* Section 2: Shop By Occasion Manager */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 24,
          border: "1px solid #f1f5f9",
          boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Heart size={20} color="#be185d" />
              <h3 style={{ fontSize: "1.1rem", color: "#831843", margin: 0, fontWeight: 700 }}>
                2. Shop By Occasion Cards (Homepage Carousel)
              </h3>
            </div>
            <span style={{ fontSize: "0.8rem", color: "#64748b", marginTop: 4, display: "block" }}>
              Add, edit, or customize occasion cards that appear in the &quot;Shop by Occasion&quot; homepage slider.
            </span>
          </div>

          <button
            type="button"
            onClick={handleOpenAddOccasion}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 16px",
              background: "linear-gradient(135deg, #be185d 0%, #9d174d 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: "0.84rem",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(190, 24, 93, 0.25)",
            }}
          >
            <Plus size={16} />
            <span>Add New Occasion</span>
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 18 }}>
          {occasions.map((occ) => (
            <div
              key={occ.id}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                overflow: "hidden",
                background: "#fafafa",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.2s ease",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: 150,
                  background: "#f1f5f9",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <img
                  src={occ.image || "/images/occasion-birthday.jpg"}
                  alt={occ.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <span
                  style={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    fontSize: "0.7rem",
                    padding: "3px 8px",
                    borderRadius: 4,
                    background: occ.active ? "rgba(22, 101, 52, 0.9)" : "rgba(100, 116, 139, 0.9)",
                    color: "#fff",
                    fontWeight: 700,
                  }}
                >
                  {occ.active ? "Active" : "Disabled"}
                </span>

                <span
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    fontSize: "0.7rem",
                    padding: "3px 8px",
                    borderRadius: 4,
                    background: "rgba(0,0,0,0.6)",
                    color: "#fff",
                    fontWeight: 600,
                  }}
                >
                  Order #{occ.display_order}
                </span>
              </div>

              <div style={{ padding: 14, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.98rem", color: "#1e293b", marginBottom: 4 }}>
                    {occ.name}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#64748b", marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    🔗 {occ.href || `/flower-bouquets?occasion=${occ.slug}`}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 12, borderTop: "1px solid #f1f5f9", paddingTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => handleOpenEditOccasion(occ)}
                    style={{
                      flex: 1,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 4,
                      padding: "6px 10px",
                      background: "#fff",
                      border: "1px solid #cbd5e1",
                      borderRadius: 6,
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: "#334155",
                      cursor: "pointer",
                    }}
                  >
                    <Edit size={13} />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleOccasionActive(occ)}
                    title={occ.active ? "Deactivate" : "Activate"}
                    style={{
                      padding: "6px 10px",
                      background: occ.active ? "#f0fdf4" : "#f1f5f9",
                      border: `1px solid ${occ.active ? "#bbf7d0" : "#cbd5e1"}`,
                      borderRadius: 6,
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: occ.active ? "#15803d" : "#64748b",
                      cursor: "pointer",
                    }}
                  >
                    {occ.active ? <Eye size={13} /> : <EyeOff size={13} />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteOccasion(occ.id, occ.name)}
                    style={{
                      padding: "6px 10px",
                      background: "#fff1f2",
                      border: "1px solid #ffe4e6",
                      borderRadius: 6,
                      color: "#e11d48",
                      cursor: "pointer",
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
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

      {/* OCCASION ADD / EDIT MODAL */}
      {isOccasionModalOpen && (
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
              maxWidth: 580,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 24,
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h3 style={{ margin: 0, color: "#831843", fontSize: "1.2rem" }}>
                {editingOccasion ? `Edit Occasion: ${editingOccasion.name}` : "Add New Occasion"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsOccasionModalOpen(false);
                  setEditingOccasion(null);
                }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveOccasion} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                  Occasion Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Valentine's Day, Mother's Day, Housewarming"
                  value={occasionForm.name}
                  onChange={(e) => {
                    const nameVal = e.target.value;
                    const autoSlug = nameVal.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                    setOccasionForm((p) => ({
                      ...p,
                      name: nameVal,
                      slug: editingOccasion ? p.slug : (p.slug || autoSlug),
                      href: editingOccasion ? p.href : (p.href || `/flower-bouquets?occasion=${autoSlug}`),
                      whatsapp_message: editingOccasion
                        ? p.whatsapp_message
                        : (p.whatsapp_message || `Hello Occassions Florist Calicut, I would like to order fresh flowers for ${nameVal}.`),
                    }));
                  }}
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
                  Occasion Photo *
                </label>
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <div
                    style={{
                      width: 100,
                      height: 80,
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      background: "#f8fafc",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {occasionForm.image ? (
                      <img src={occasionForm.image} alt="Occasion" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <ImageIcon size={24} color="#94a3b8" />
                    )}
                  </div>

                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                    <label
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "7px 14px",
                        background: "#fdf2f8",
                        color: "#be185d",
                        borderRadius: 6,
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        border: "1px solid #fbcfe8",
                        width: "fit-content",
                      }}
                    >
                      <Upload size={14} />
                      <span>{uploadingOccasionImg ? "Uploading..." : "Upload New Photo"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        disabled={uploadingOccasionImg}
                        onChange={handleOccasionImageUpload}
                      />
                    </label>

                    <input
                      type="text"
                      placeholder="Or enter image URL"
                      value={occasionForm.image}
                      onChange={(e) => setOccasionForm((p) => ({ ...p, image: e.target.value }))}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        border: "1px solid #cbd5e1",
                        borderRadius: 6,
                        fontSize: "0.8rem",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                    Slug / URL Identifier
                  </label>
                  <input
                    type="text"
                    value={occasionForm.slug}
                    onChange={(e) => setOccasionForm((p) => ({ ...p, slug: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: 8,
                      fontSize: "0.85rem",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                    Display Order (Sorting)
                  </label>
                  <input
                    type="number"
                    value={occasionForm.display_order}
                    onChange={(e) => setOccasionForm((p) => ({ ...p, display_order: Number(e.target.value) || 0 }))}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: 8,
                      fontSize: "0.85rem",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                  Target Page Link
                </label>
                <input
                  type="text"
                  value={occasionForm.href}
                  placeholder="/flower-bouquets?occasion=birthday"
                  onChange={(e) => setOccasionForm((p) => ({ ...p, href: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: 8,
                    fontSize: "0.85rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                  WhatsApp Inquire Message
                </label>
                <textarea
                  rows={2}
                  value={occasionForm.whatsapp_message}
                  onChange={(e) => setOccasionForm((p) => ({ ...p, whatsapp_message: e.target.value }))}
                  placeholder="Hello Occassions Florist Calicut, I would like to order fresh flowers for..."
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: 8,
                    fontSize: "0.85rem",
                    boxSizing: "border-box",
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  id="occActive"
                  checked={occasionForm.active === 1}
                  onChange={(e) => setOccasionForm((p) => ({ ...p, active: e.target.checked ? 1 : 0 }))}
                  style={{ width: 16, height: 16, cursor: "pointer" }}
                />
                <label htmlFor="occActive" style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155", cursor: "pointer" }}>
                  Active (Show on homepage carousel)
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsOccasionModalOpen(false);
                    setEditingOccasion(null);
                  }}
                  style={{
                    padding: "9px 16px",
                    background: "#f1f5f9",
                    color: "#475569",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingOccasion}
                  style={{
                    padding: "9px 20px",
                    background: "linear-gradient(135deg, #be185d 0%, #9d174d 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: "0.88rem",
                    cursor: savingOccasion ? "not-allowed" : "pointer",
                  }}
                >
                  {savingOccasion ? "Saving..." : editingOccasion ? "Update Occasion" : "Create Occasion"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

