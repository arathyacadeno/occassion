"use client";

import React, { useState, useEffect } from "react";
import {
  Upload,
  Image as ImageIcon,
  Search,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Folder,
  Layers,
  Info,
  AlertTriangle,
  X,
  FileCheck,
} from "lucide-react";

interface MediaItem {
  id: string;
  url: string;
  public_id: string;
  filename: string;
  format?: string;
  size?: number;
  width?: number;
  height?: number;
  folder?: string;
  created_at?: string;
  referencedBy?: string[];
  isReferenced?: boolean;
  usageCount?: number;
}

interface MediaLibraryProps {
  onSelectImage?: (url: string) => void;
  isPickerMode?: boolean;
}

export default function MediaLibrary({ onSelectImage, isPickerMode = false }: MediaLibraryProps) {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Selected item detail modal
  const [detailItem, setDetailItem] = useState<MediaItem | null>(null);

  // Delete modal
  const [deleteItem, setDeleteItem] = useState<MediaItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMedia = async (sync = false) => {
    try {
      if (sync) setSyncing(true);
      else setLoading(true);

      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedFolder !== "all") params.set("folder", selectedFolder);
      if (sync) params.set("sync", "true");

      const res = await fetch(`/api/admin/media?${params.toString()}`, { credentials: "include" });
      const data = await res.json();
      if (data.success && Array.isArray(data.media)) {
        setMediaList(data.media);
      }
    } catch (err) {
      console.error("Failed to load media:", err);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [selectedFolder]);

  const handleUploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", selectedFolder === "all" ? "products" : selectedFolder);

        const res = await fetch("/api/admin/media", {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        const data = await res.json();
        if (data.success && data.mediaItem) {
          setMediaList((prev) => [data.mediaItem, ...prev]);
        }
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const handleConfirmDelete = async (force = false) => {
    if (!deleteItem) return;
    setDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(
        `/api/admin/media?id=${encodeURIComponent(deleteItem.id)}&publicId=${encodeURIComponent(deleteItem.public_id)}&force=${force ? "true" : "false"}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();
      if (!data.success) {
        setDeleteError(data.error || "Cannot delete image while in use");
        return;
      }

      setMediaList((prev) => prev.filter((m) => m.id !== deleteItem.id));
      setDeleteItem(null);
      if (detailItem?.id === deleteItem.id) setDetailItem(null);
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return "—";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div style={{ background: "#ffffff", borderRadius: 18, border: "1px solid #e2e8f0", padding: 24, boxShadow: "0 4px 16px rgba(0, 0, 0, 0.03)" }}>
      {/* Header Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 14 }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-serif)", color: "#831843", fontSize: "1.45rem", margin: "0 0 4px" }}>
            Centralized Media Library
          </h2>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
            High-resolution product photography, banners, and branding assets managed via Cloudinary CDN.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            type="button"
            onClick={() => fetchMedia(true)}
            disabled={syncing}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 16px",
              borderRadius: 10,
              border: "1px solid #cbd5e1",
              background: "#fff",
              color: "#475569",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: syncing ? "not-allowed" : "pointer",
            }}
          >
            <RefreshCw size={14} className={syncing ? "spin" : ""} />
            <span>{syncing ? "Syncing CDN..." : "Sync Cloudinary"}</span>
          </button>

          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 18px",
              borderRadius: 10,
              background: "#db2777",
              color: "#fff",
              fontSize: "0.88rem",
              fontWeight: 700,
              cursor: uploading ? "not-allowed" : "pointer",
              boxShadow: "0 2px 8px rgba(219, 39, 119, 0.25)",
            }}
          >
            <Upload size={16} />
            <span>{uploading ? "Uploading..." : "Upload New Files"}</span>
            <input type="file" accept="image/*" multiple disabled={uploading} onChange={handleUploadFiles} style={{ display: "none" }} />
          </label>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            { id: "all", label: "All Assets" },
            { id: "products", label: "Products" },
            { id: "categories", label: "Categories" },
            { id: "banners", label: "Banners" },
            { id: "branding", label: "Branding" },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setSelectedFolder(f.id)}
              style={{
                padding: "7px 14px",
                borderRadius: 20,
                border: "1px solid",
                borderColor: selectedFolder === f.id ? "#db2777" : "#e2e8f0",
                background: selectedFolder === f.id ? "#fdf2f8" : "#fff",
                color: selectedFolder === f.id ? "#be185d" : "#475569",
                fontWeight: 600,
                fontSize: "0.82rem",
                cursor: "pointer",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            placeholder="Search by filename or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") fetchMedia(); }}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1.5px solid #cbd5e1",
              fontSize: "0.85rem",
              width: 220,
            }}
          />
          <button
            type="button"
            onClick={() => fetchMedia()}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "none",
              background: "#f1f5f9",
              color: "#334155",
              fontWeight: 600,
              fontSize: "0.82rem",
              cursor: "pointer",
            }}
          >
            Search
          </button>
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
          Loading media library assets...
        </div>
      ) : mediaList.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "#f8fafc", borderRadius: 14, border: "1px dashed #cbd5e1" }}>
          <ImageIcon size={40} color="#94a3b8" style={{ margin: "0 auto 10px" }} />
          <h3 style={{ margin: "0 0 6px", fontSize: "1.05rem", color: "#334155" }}>No Media Found in this Folder</h3>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
            Click &quot;Upload New Files&quot; or &quot;Sync Cloudinary&quot; to import photography directly into the CMS.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 16,
          }}
        >
          {mediaList.map((m) => (
            <div
              key={m.id}
              style={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                background: "#fff",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.04)",
                position: "relative",
              }}
            >
              {/* Image Preview Box */}
              <div
                style={{
                  height: 140,
                  width: "100%",
                  background: "#f8fafc",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                }}
                onClick={() => {
                  if (isPickerMode && onSelectImage) {
                    onSelectImage(m.url);
                  } else {
                    setDetailItem(m);
                  }
                }}
              >
                <img
                  src={m.url}
                  alt={m.filename}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />

                {m.isReferenced && (
                  <span
                    style={{
                      position: "absolute",
                      top: 6,
                      left: 6,
                      background: "rgba(16, 185, 129, 0.9)",
                      color: "#fff",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    In Use ({m.usageCount})
                  </span>
                )}
              </div>

              {/* Info Bar */}
              <div style={{ padding: "10px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      color: "#1e293b",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      marginBottom: 4,
                    }}
                    title={m.filename}
                  >
                    {m.filename || m.public_id}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#64748b", display: "flex", gap: 6 }}>
                    <span>{m.format?.toUpperCase() || "JPG"}</span>
                    <span>•</span>
                    <span>{formatBytes(m.size)}</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, paddingTop: 6, borderTop: "1px solid #f1f5f9" }}>
                  {isPickerMode ? (
                    <button
                      type="button"
                      onClick={() => onSelectImage && onSelectImage(m.url)}
                      style={{
                        width: "100%",
                        padding: "6px",
                        borderRadius: 6,
                        border: "none",
                        background: "#db2777",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        cursor: "pointer",
                      }}
                    >
                      Use Image
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleCopy(m.url)}
                        title="Copy Cloudinary CDN URL"
                        style={{
                          padding: "4px 8px",
                          borderRadius: 6,
                          border: "1px solid #e2e8f0",
                          background: "#fff",
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          color: copiedUrl === m.url ? "#059669" : "#475569",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        {copiedUrl === m.url ? <Check size={12} /> : <Copy size={12} />}
                        <span>{copiedUrl === m.url ? "Copied" : "Copy URL"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setDeleteItem(m);
                          setDeleteError(null);
                        }}
                        title="Delete Asset"
                        style={{
                          padding: "4px 6px",
                          borderRadius: 6,
                          border: "1px solid #fee2e2",
                          background: "#fff",
                          color: "#dc2626",
                          cursor: "pointer",
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail & Usage Modal */}
      {detailItem && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.65)", backdropFilter: "blur(4px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#ffffff", borderRadius: 18, width: "100%", maxWidth: "680px", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fafafa" }}>
              <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#1e293b" }}>Image Asset Details</div>
              <button type="button" onClick={() => setDetailItem(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748b" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0", background: "#f8fafc", maxHeight: 320 }}>
                <img src={detailItem.url} alt={detailItem.filename} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </div>

              <div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>File Name</label>
                  <div style={{ fontSize: "0.92rem", fontWeight: 600, color: "#1e293b" }}>{detailItem.filename}</div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Dimensions</label>
                    <div style={{ fontSize: "0.85rem", color: "#334155" }}>{detailItem.width || 800} × {detailItem.height || 800} px</div>
                  </div>
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>File Size</label>
                    <div style={{ fontSize: "0.85rem", color: "#334155" }}>{formatBytes(detailItem.size)}</div>
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>CDN URL</label>
                  <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                    <input
                      type="text"
                      readOnly
                      value={detailItem.url}
                      style={{ flex: 1, padding: "6px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: "0.75rem", background: "#f8fafc" }}
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(detailItem.url)}
                      style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}
                    >
                      Copy
                    </button>
                  </div>
                </div>

                {/* Usage tracker */}
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                    Active Usage References ({detailItem.referencedBy?.length || 0})
                  </label>
                  <div style={{ marginTop: 4, maxHeight: 100, overflowY: "auto", border: "1px solid #f1f5f9", borderRadius: 8, padding: 8, background: "#fafafa" }}>
                    {detailItem.referencedBy && detailItem.referencedBy.length > 0 ? (
                      detailItem.referencedBy.map((ref, idx) => (
                        <div key={idx} style={{ fontSize: "0.78rem", color: "#065f46", display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                          <FileCheck size={12} color="#059669" />
                          <span>{ref}</span>
                        </div>
                      ))
                    ) : (
                      <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Not currently referenced in products or categories.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteItem && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.65)", backdropFilter: "blur(4px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#ffffff", borderRadius: 18, width: "100%", maxWidth: "460px", overflow: "hidden", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)" }}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #fee2e2", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fef2f2" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#991b1b", fontWeight: 700 }}>
                <AlertTriangle size={20} />
                <span>Delete Media Asset</span>
              </div>
              <button type="button" onClick={() => setDeleteItem(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#991b1b" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: 24 }}>
              {deleteError && (
                <div style={{ padding: "10px 14px", borderRadius: 8, background: "#fee2e2", color: "#991b1b", fontSize: "0.85rem", marginBottom: 14 }}>
                  {deleteError}
                </div>
              )}

              <p style={{ margin: "0 0 12px", fontSize: "0.9rem", color: "#334155" }}>
                Are you sure you want to delete <strong>{deleteItem.filename || deleteItem.public_id}</strong> from Cloudinary?
              </p>

              {deleteItem.isReferenced && (
                <div style={{ padding: "12px 14px", borderRadius: 10, background: "#fff1f2", border: "1px solid #fecdd3", color: "#be123c", fontSize: "0.82rem", marginBottom: 12 }}>
                  <strong>Warning:</strong> This image is currently referenced in:
                  <ul style={{ margin: "6px 0 0", paddingLeft: 20 }}>
                    {deleteItem.referencedBy?.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div style={{ padding: "16px 24px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", gap: 10, background: "#fafafa" }}>
              <button
                type="button"
                onClick={() => setDeleteItem(null)}
                style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", color: "#475569", fontWeight: 600, cursor: "pointer" }}
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={() => handleConfirmDelete(deleteItem.isReferenced)}
                style={{
                  padding: "8px 18px",
                  borderRadius: 8,
                  border: "none",
                  background: "#dc2626",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: deleting ? "not-allowed" : "pointer",
                }}
              >
                {deleting ? "Deleting..." : (deleteItem.isReferenced ? "Force Delete Anyway" : "Confirm Delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

