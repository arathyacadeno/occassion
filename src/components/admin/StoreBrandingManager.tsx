"use client";

import React, { useState, useEffect } from "react";
import {
  Palette,
  Upload,
  Image as ImageIcon,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  Globe,
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Clock,
  Sparkles,
  Eye,
  Save,
} from "lucide-react";
import { useStoreSettings } from "@/context/StoreSettingsContext";

export default function StoreBrandingManager() {
  const { settings, refreshSettings, updateLocalSettings } = useStoreSettings();

  const [form, setForm] = useState({
    store_name: "",
    store_tagline: "",
    store_logo: "",
    header_logo: "",
    footer_logo: "",
    store_favicon: "",
    brand_description: "",
    primary_color: "#be185d",
    secondary_color: "#831843",
    store_phone: "",
    store_whatsapp: "",
    store_email: "",
    store_address: "",
    opening_hours: "",
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setForm({
        store_name: settings.store_name || "Occassions",
        store_tagline: settings.store_tagline || "",
        store_logo: settings.store_logo || "/images/occasions-logo.png",
        header_logo: settings.header_logo || "/images/occasions-logo.png",
        footer_logo: settings.footer_logo || "/images/occasions-logo.png",
        store_favicon: settings.store_favicon || "/favicon.ico",
        brand_description: settings.brand_description || "",
        primary_color: settings.primary_color || "#be185d",
        secondary_color: settings.secondary_color || "#831843",
        store_phone: settings.store_phone || "",
        store_whatsapp: settings.store_whatsapp || "",
        store_email: settings.store_email || "",
        store_address: settings.store_address || "",
        opening_hours: settings.opening_hours || "",
      });
    }
  }, [settings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingField(fieldName);
      setErrorMsg(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "occasions/branding");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload image to Cloudinary");
      }

      const updatedForm = {
        ...form,
        [fieldName]: data.url,
      };
      setForm(updatedForm);

      // Auto-save the uploaded image to store settings immediately
      try {
        const saveRes = await fetch("/api/admin/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ settings: updatedForm }),
        });
        const saveData = await saveRes.json();
        if (saveRes.ok && saveData.success) {
          updateLocalSettings(updatedForm);
          await refreshSettings();
          const label = fieldName === "store_favicon" ? "Browser Favicon" : fieldName === "header_logo" ? "Header Logo" : "Footer Logo";
          setSuccessMsg(`${label} uploaded and saved successfully!`);
          setTimeout(() => setSuccessMsg(null), 5000);
        }
      } catch (autoSaveErr) {
        console.warn("Auto-save after upload error:", autoSaveErr);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Upload failed");
    } finally {
      setUploadingField(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: form }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save settings");
      }

      updateLocalSettings(form);
      await refreshSettings();
      setSuccessMsg("Branding & Website Settings successfully updated across the entire site!");
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Title & Banner */}
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
            <Palette size={22} color="#be185d" />
            <h2 style={{ fontFamily: "var(--font-serif, serif)", fontSize: "1.4rem", color: "#831843", margin: 0 }}>
              Website Settings &amp; Store Branding
            </h2>
          </div>
          <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>
            Customize your boutique shop name, logos, brand colors, contact channels, and website identity.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 22px",
            background: "linear-gradient(135deg, #be185d 0%, #9d174d 100%)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            fontWeight: 600,
            fontSize: "0.9rem",
            cursor: saving ? "not-allowed" : "pointer",
            boxShadow: "0 4px 14px rgba(190, 24, 93, 0.25)",
            transition: "all 0.2s ease",
          }}
        >
          {saving ? <RefreshCw size={16} className="spin" /> : <Save size={16} />}
          <span>{saving ? "Saving Changes..." : "Save Branding"}</span>
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div
          style={{
            background: "#ecfdf5",
            border: "1px solid #10b981",
            color: "#065f46",
            padding: "14px 18px",
            borderRadius: 12,
            fontSize: "0.88rem",
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
            padding: "14px 18px",
            borderRadius: 12,
            fontSize: "0.88rem",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <AlertTriangle size={18} color="#e11d48" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form Grid */}
      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Section 1: Store Identity */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 24,
            border: "1px solid #f1f5f9",
            boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
          }}
        >
          <h3 style={{ fontSize: "1.1rem", color: "#831843", margin: "0 0 16px", fontWeight: 700 }}>
            1. Brand Identity &amp; Meta
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                Shop Name *
              </label>
              <input
                type="text"
                name="store_name"
                value={form.store_name}
                onChange={handleInputChange}
                required
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid #cbd5e1",
                  borderRadius: 8,
                  fontSize: "0.9rem",
                  boxSizing: "border-box",
                }}
              />
              <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                Displays in navbar, order invoices, and browser tab.
              </span>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                Brand Tagline
              </label>
              <input
                type="text"
                name="store_tagline"
                value={form.store_tagline}
                onChange={handleInputChange}
                placeholder="e.g. Luxury Florist & Celebration Atelier"
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

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                Brand Story / Meta Description
              </label>
              <textarea
                name="brand_description"
                rows={3}
                value={form.brand_description}
                onChange={handleInputChange}
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
          </div>
        </div>

        {/* Section 2: Visual Logos & Favicon */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 24,
            border: "1px solid #f1f5f9",
            boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
          }}
        >
          <h3 style={{ fontSize: "1.1rem", color: "#831843", margin: "0 0 16px", fontWeight: 700 }}>
            2. Logos &amp; Favicon Management (Cloudinary)
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
            {/* Header Logo */}
            <div
              style={{
                border: "1px dashed #cbd5e1",
                borderRadius: 12,
                padding: 16,
                background: "#fafafa",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#475569", marginBottom: 10 }}>
                Header Logo
              </div>
              <div
                style={{
                  width: "100%",
                  height: 90,
                  background: "#fff",
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  marginBottom: 12,
                  padding: 8,
                }}
              >
                {form.header_logo ? (
                  <img
                    src={form.header_logo}
                    alt="Header Logo"
                    style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                  />
                ) : (
                  <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>No Logo Set</span>
                )}
              </div>

              <div style={{ display: "flex", gap: 8, width: "100%", justifyContent: "center" }}>
                <label
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 12px",
                    background: "#fdf2f8",
                    color: "#be185d",
                    borderRadius: 6,
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    border: "1px solid #fbcfe8",
                  }}
                >
                  <Upload size={14} />
                  <span>{uploadingField === "header_logo" ? "Uploading..." : "Upload New"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    disabled={uploadingField !== null}
                    onChange={(e) => handleImageUpload(e, "header_logo")}
                  />
                </label>

                {form.header_logo && (
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, header_logo: "" }))}
                    style={{
                      padding: "6px 10px",
                      background: "#fff1f2",
                      color: "#e11d48",
                      border: "1px solid #ffe4e6",
                      borderRadius: 6,
                      fontSize: "0.78rem",
                      cursor: "pointer",
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* Footer Logo */}
            <div
              style={{
                border: "1px dashed #cbd5e1",
                borderRadius: 12,
                padding: 16,
                background: "#fafafa",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#475569", marginBottom: 10 }}>
                Footer Logo
              </div>
              <div
                style={{
                  width: "100%",
                  height: 90,
                  background: "#1e293b",
                  borderRadius: 8,
                  border: "1px solid #334155",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  marginBottom: 12,
                  padding: 8,
                }}
              >
                {form.footer_logo ? (
                  <img
                    src={form.footer_logo}
                    alt="Footer Logo"
                    style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                  />
                ) : (
                  <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>No Logo Set</span>
                )}
              </div>

              <div style={{ display: "flex", gap: 8, width: "100%", justifyContent: "center" }}>
                <label
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 12px",
                    background: "#fdf2f8",
                    color: "#be185d",
                    borderRadius: 6,
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    border: "1px solid #fbcfe8",
                  }}
                >
                  <Upload size={14} />
                  <span>{uploadingField === "footer_logo" ? "Uploading..." : "Upload New"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    disabled={uploadingField !== null}
                    onChange={(e) => handleImageUpload(e, "footer_logo")}
                  />
                </label>

                {form.footer_logo && (
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, footer_logo: "" }))}
                    style={{
                      padding: "6px 10px",
                      background: "#fff1f2",
                      color: "#e11d48",
                      border: "1px solid #ffe4e6",
                      borderRadius: 6,
                      fontSize: "0.78rem",
                      cursor: "pointer",
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* Favicon */}
            <div
              style={{
                border: "1px dashed #cbd5e1",
                borderRadius: 12,
                padding: 16,
                background: "#fafafa",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#475569", marginBottom: 10 }}>
                Browser Favicon (.ico, .png)
              </div>
              <div
                style={{
                  width: "100%",
                  height: 90,
                  background: "#fff",
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  marginBottom: 12,
                  padding: 8,
                }}
              >
                {form.store_favicon ? (
                  <img
                    src={form.store_favicon}
                    alt="Favicon"
                    style={{ width: 36, height: 36, objectFit: "contain" }}
                  />
                ) : (
                  <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Default</span>
                )}
              </div>

              <div style={{ display: "flex", gap: 8, width: "100%", justifyContent: "center" }}>
                <label
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 12px",
                    background: "#fdf2f8",
                    color: "#be185d",
                    borderRadius: 6,
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    border: "1px solid #fbcfe8",
                  }}
                >
                  <Upload size={14} />
                  <span>{uploadingField === "store_favicon" ? "Uploading..." : "Upload New"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    disabled={uploadingField !== null}
                    onChange={(e) => handleImageUpload(e, "store_favicon")}
                  />
                </label>

                {form.store_favicon && (
                  <button
                    type="button"
                    onClick={async () => {
                      const updated = { ...form, store_favicon: "" };
                      setForm(updated);
                      try {
                        await fetch("/api/admin/settings", {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ settings: updated }),
                        });
                        updateLocalSettings(updated);
                        await refreshSettings();
                        setSuccessMsg("Favicon reset to default successfully!");
                        setTimeout(() => setSuccessMsg(null), 4000);
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    style={{
                      padding: "6px 10px",
                      background: "#fff1f2",
                      color: "#e11d48",
                      border: "1px solid #ffe4e6",
                      borderRadius: 6,
                      fontSize: "0.78rem",
                      cursor: "pointer",
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Brand Colors */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 24,
            border: "1px solid #f1f5f9",
            boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
          }}
        >
          <h3 style={{ fontSize: "1.1rem", color: "#831843", margin: "0 0 16px", fontWeight: 700 }}>
            3. Brand Color Palette
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                Primary Brand Color
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <input
                  type="color"
                  name="primary_color"
                  value={form.primary_color}
                  onChange={handleInputChange}
                  style={{
                    width: 44,
                    height: 44,
                    padding: 0,
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                  }}
                />
                <input
                  type="text"
                  name="primary_color"
                  value={form.primary_color}
                  onChange={handleInputChange}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    border: "1px solid #cbd5e1",
                    borderRadius: 8,
                    fontSize: "0.9rem",
                    textTransform: "uppercase",
                  }}
                />
              </div>
              <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                Used for main CTA buttons, badges, highlights.
              </span>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                Secondary Brand Color (Dark Crimson)
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <input
                  type="color"
                  name="secondary_color"
                  value={form.secondary_color}
                  onChange={handleInputChange}
                  style={{
                    width: 44,
                    height: 44,
                    padding: 0,
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                  }}
                />
                <input
                  type="text"
                  name="secondary_color"
                  value={form.secondary_color}
                  onChange={handleInputChange}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    border: "1px solid #cbd5e1",
                    borderRadius: 8,
                    fontSize: "0.9rem",
                    textTransform: "uppercase",
                  }}
                />
              </div>
              <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                Used for headers, title typography, premium cards.
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Contact & Channels */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 24,
            border: "1px solid #f1f5f9",
            boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
          }}
        >
          <h3 style={{ fontSize: "1.1rem", color: "#831843", margin: "0 0 16px", fontWeight: 700 }}>
            4. Contact &amp; Physical Store Details
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                Contact Phone
              </label>
              <div style={{ position: "relative" }}>
                <Phone size={16} color="#94a3b8" style={{ position: "absolute", left: 12, top: 13 }} />
                <input
                  type="text"
                  name="store_phone"
                  value={form.store_phone}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "10px 14px 10px 38px",
                    border: "1px solid #cbd5e1",
                    borderRadius: 8,
                    fontSize: "0.9rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                WhatsApp Number (with country code, no +)
              </label>
              <div style={{ position: "relative" }}>
                <MessageCircle size={16} color="#94a3b8" style={{ position: "absolute", left: 12, top: 13 }} />
                <input
                  type="text"
                  name="store_whatsapp"
                  value={form.store_whatsapp}
                  onChange={handleInputChange}
                  placeholder="e.g. 918606464700"
                  style={{
                    width: "100%",
                    padding: "10px 14px 10px 38px",
                    border: "1px solid #cbd5e1",
                    borderRadius: 8,
                    fontSize: "0.9rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                Contact Email
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={16} color="#94a3b8" style={{ position: "absolute", left: 12, top: 13 }} />
                <input
                  type="email"
                  name="store_email"
                  value={form.store_email}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "10px 14px 10px 38px",
                    border: "1px solid #cbd5e1",
                    borderRadius: 8,
                    fontSize: "0.9rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                Opening Hours
              </label>
              <div style={{ position: "relative" }}>
                <Clock size={16} color="#94a3b8" style={{ position: "absolute", left: 12, top: 13 }} />
                <input
                  type="text"
                  name="opening_hours"
                  value={form.opening_hours}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "10px 14px 10px 38px",
                    border: "1px solid #cbd5e1",
                    borderRadius: 8,
                    fontSize: "0.9rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                Physical Atelier Address
              </label>
              <div style={{ position: "relative" }}>
                <MapPin size={16} color="#94a3b8" style={{ position: "absolute", left: 12, top: 13 }} />
                <input
                  type="text"
                  name="store_address"
                  value={form.store_address}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "10px 14px 10px 38px",
                    border: "1px solid #cbd5e1",
                    borderRadius: 8,
                    fontSize: "0.9rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 28px",
              background: "linear-gradient(135deg, #be185d 0%, #9d174d 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontWeight: 600,
              fontSize: "0.95rem",
              cursor: saving ? "not-allowed" : "pointer",
              boxShadow: "0 4px 14px rgba(190, 24, 93, 0.25)",
            }}
          >
            {saving ? <RefreshCw size={18} className="spin" /> : <Save size={18} />}
            <span>{saving ? "Saving Changes..." : "Save Branding Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

