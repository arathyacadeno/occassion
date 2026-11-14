"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useScrollLock } from "@/lib/scrollLock";
import {
  Truck,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  MapPin,
  Compass,
  Sliders,
  DollarSign,
  Eye,
  EyeOff,
} from "lucide-react";

export interface DeliveryTier {
  id: string;
  min_km: number;
  max_km: number;
  charge: number;
  label: string;
  active: number;
  display_order: number;
}

export interface DeliverySettings {
  shop_location_name: string;
  shop_address: string;
  shop_pin: string;
  max_serviceable_km: string;
  allow_sunday_delivery: string;
  [key: string]: string;
}

export default function DeliveryManager() {
  const [tiers, setTiers] = useState<DeliveryTier[]>([]);
  const [settings, setSettings] = useState<DeliverySettings>({
    shop_location_name: "Kozhikode Head Post Office",
    shop_address: "Near CH Flyover, Kannur Road, Calicut, Kerala, 673001",
    shop_pin: "673001",
    max_serviceable_km: "50",
    allow_sunday_delivery: "false",
  });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal State for Tier (Add / Edit)
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<DeliveryTier | null>(null);
  const [tierForm, setTierForm] = useState({
    min_km: 0,
    max_km: 5,
    charge: 0,
    label: "",
    active: 1,
    display_order: 1,
  });
  const [savingTier, setSavingTier] = useState(false);

  // Modal State for Delete Confirmation
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingTier, setDeletingTier] = useState<DeliveryTier | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Modal State for Base Location Settings
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    shop_location_name: "",
    shop_pin: "",
    max_serviceable_km: "50",
    shop_address: "",
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Lock background body scroll cleanly (fixed background, no layout jumps or movement)
  useScrollLock(isTierModalOpen || isDeleteModalOpen || isSettingsModalOpen);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await fetch("/api/admin/delivery");
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load delivery settings");
      }
      setTiers(data.tiers || []);
      if (data.settings) {
        setSettings(data.settings);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to fetch delivery data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Open Add Tier Modal
  const handleOpenAddTier = () => {
    setEditingTier(null);
    const lastTier = tiers.length > 0 ? tiers[tiers.length - 1] : null;
    const nextMin = lastTier ? lastTier.max_km : 0;
    const nextMax = nextMin + 10;
    setTierForm({
      min_km: nextMin,
      max_km: nextMax,
      charge: 100,
      label: `Calicut Zone (${nextMin} – ${nextMax} km)`,
      active: 1,
      display_order: tiers.length + 1,
    });
    setIsTierModalOpen(true);
  };

  // Open Edit Tier Modal
  const handleOpenEditTier = (tier: DeliveryTier) => {
    setEditingTier(tier);
    setTierForm({
      min_km: tier.min_km,
      max_km: tier.max_km,
      charge: tier.charge,
      label: tier.label || "",
      active: tier.active ?? 1,
      display_order: tier.display_order || 0,
    });
    setIsTierModalOpen(true);
  };

  // Save Tier (Create or Update)
  const handleSaveTier = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTier(true);
    setErrorMsg(null);

    try {
      if (editingTier) {
        // Edit existing tier
        const res = await fetch("/api/admin/delivery", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "update_tier",
            tier: {
              ...tierForm,
              id: editingTier.id,
            },
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || "Failed to update delivery tier");
        setSuccessMsg(`Delivery tier "${tierForm.min_km} – ${tierForm.max_km} km" updated successfully!`);
      } else {
        // Add new tier
        const res = await fetch("/api/admin/delivery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(tierForm),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || "Failed to create delivery tier");
        setSuccessMsg(`New delivery tier created successfully!`);
      }

      setIsTierModalOpen(false);
      await fetchData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save delivery tier");
    } finally {
      setSavingTier(false);
    }
  };

  // Open Delete Confirmation Modal
  const handleOpenDeleteTier = (tier: DeliveryTier) => {
    setDeletingTier(tier);
    setIsDeleteModalOpen(true);
  };

  // Execute Delete
  const handleConfirmDeleteTier = async () => {
    if (!deletingTier) return;
    setDeleting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/admin/delivery?id=${encodeURIComponent(deletingTier.id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to delete tier");

      setSuccessMsg(`Delivery tier deleted successfully!`);
      setIsDeleteModalOpen(false);
      setDeletingTier(null);
      await fetchData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to delete tier");
    } finally {
      setDeleting(false);
    }
  };

  // Toggle Tier Active Status
  const handleToggleTierActive = async (tier: DeliveryTier) => {
    try {
      const updated = { ...tier, active: tier.active ? 0 : 1 };
      await fetch("/api/admin/delivery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_tier",
          tier: updated,
        }),
      });
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to toggle status");
    }
  };

  // Open Edit Location Settings Modal
  const handleOpenEditSettings = () => {
    setSettingsForm({
      shop_location_name: settings.shop_location_name || "Kozhikode Head Post Office",
      shop_pin: settings.shop_pin || "673001",
      max_serviceable_km: settings.max_serviceable_km || "50",
      shop_address: settings.shop_address || "Near CH Flyover, Kannur Road, Calicut, Kerala, 673001",
    });
    setIsSettingsModalOpen(true);
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/admin/delivery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_settings",
          settings: settingsForm,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to save delivery location settings");

      setSuccessMsg("Base location and serviceable radius updated!");
      setIsSettingsModalOpen(false);
      await fetchData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save settings");
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header Card */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: "24px 28px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
          border: "1px solid #f1f5f9",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <Truck size={22} color="#be185d" />
            <h2 style={{ fontFamily: "var(--font-serif, serif)", fontSize: "1.35rem", color: "#831843", margin: 0 }}>
              Calicut Delivery Zones &amp; Distance Rates
            </h2>
          </div>
          <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>
            All delivery charges are calculated mathematically on the server using Haversine Great-Circle distance from the shop hub.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
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
            onClick={handleOpenEditSettings}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 16px",
              background: "#fdf2f8",
              border: "1px solid #fbcfe8",
              borderRadius: 8,
              fontSize: "0.85rem",
              cursor: "pointer",
              color: "#be185d",
              fontWeight: 600,
            }}
          >
            <Sliders size={14} />
            <span>Edit Shop Location &amp; Radius</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddTier}
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
            <span>Add Delivery Tier</span>
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
            fontSize: "0.86rem",
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
            fontSize: "0.86rem",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <AlertTriangle size={18} color="#e11d48" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Shop Location & Serviceable Radius Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
        <div
          style={{
            padding: 20,
            background: "#fff",
            borderRadius: 14,
            border: "1px solid #f1f5f9",
            boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: "0.8rem", color: "#64748b", display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <MapPin size={14} color="#be185d" />
              <span>Shop Base Location</span>
            </div>
            <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#831843", marginBottom: 4 }}>
              {settings.shop_location_name}
            </div>
            <div style={{ fontSize: "0.85rem", color: "#475569" }}>
              Shop PIN: <strong style={{ color: "#1e293b" }}>{settings.shop_pin}</strong>
            </div>
          </div>
          <div style={{ marginTop: 12, fontSize: "0.78rem", color: "#94a3b8" }}>
            {settings.shop_address}
          </div>
        </div>

        <div
          style={{
            padding: 20,
            background: "#fff",
            borderRadius: 14,
            border: "1px solid #f1f5f9",
            boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: "0.8rem", color: "#64748b", display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <Compass size={14} color="#059669" />
              <span>Serviceable Radius</span>
            </div>
            <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#047857", marginBottom: 4 }}>
              Up to {settings.max_serviceable_km} km
            </div>
            <div style={{ fontSize: "0.85rem", color: "#e11d48", fontWeight: 600 }}>
              &gt; {settings.max_serviceable_km} km: Automatic non-serviceable reject
            </div>
          </div>
          <div style={{ marginTop: 12, fontSize: "0.78rem", color: "#94a3b8" }}>
            Addresses outside this radius cannot place online deliveries.
          </div>
        </div>
      </div>

      {/* Delivery Tiers Table */}
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
            Configured Distance Tiers ({tiers.length})
          </h3>
          <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
            Edit rates, service levels, or remove distance zones.
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
                <th style={{ padding: "12px 16px", color: "#475569" }}>Radial Distance</th>
                <th style={{ padding: "12px 16px", color: "#475569" }}>Delivery Charge</th>
                <th style={{ padding: "12px 16px", color: "#475569" }}>Service Level / Label</th>
                <th style={{ padding: "12px 16px", color: "#475569" }}>Status</th>
                <th style={{ padding: "12px 16px", color: "#475569", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((t) => (
                <tr key={t.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  {/* Radial Distance */}
                  <td style={{ padding: "14px 16px", fontWeight: 600, color: "#1e293b" }}>
                    {t.min_km === 0 ? `0 – ${t.max_km} km` : `> ${t.min_km} – ${t.max_km} km`}
                  </td>

                  {/* Delivery Charge */}
                  <td style={{ padding: "14px 16px" }}>
                    {t.charge === 0 ? (
                      <span style={{ fontWeight: 700, color: "#047857", background: "#ecfdf5", padding: "4px 8px", borderRadius: 6 }}>
                        FREE Delivery
                      </span>
                    ) : (
                      <span style={{ fontWeight: 700, color: "#831843" }}>
                        ₹{t.charge}
                      </span>
                    )}
                  </td>

                  {/* Service Level */}
                  <td style={{ padding: "14px 16px", color: "#475569" }}>
                    {t.label || "Standard Delivery"}
                  </td>

                  {/* Status Toggle */}
                  <td style={{ padding: "14px 16px" }}>
                    <button
                      type="button"
                      onClick={() => handleToggleTierActive(t)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "4px 10px",
                        borderRadius: 6,
                        border: "none",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        background: t.active ? "#dcfce7" : "#f1f5f9",
                        color: t.active ? "#15803d" : "#64748b",
                      }}
                    >
                      {t.active ? <Eye size={12} /> : <EyeOff size={12} />}
                      <span>{t.active ? "Active" : "Disabled"}</span>
                    </button>
                  </td>

                  {/* Actions (Edit / Delete) */}
                  <td style={{ padding: "14px 16px", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEditTier(t)}
                        style={{
                          padding: "6px 10px",
                          background: "#f8fafc",
                          border: "1px solid #cbd5e1",
                          borderRadius: 6,
                          cursor: "pointer",
                          color: "#334155",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: "0.8rem",
                        }}
                        title="Edit Delivery Tier"
                      >
                        <Edit size={13} />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenDeleteTier(t)}
                        style={{
                          padding: "6px 10px",
                          background: "#fff1f2",
                          border: "1px solid #fecdd3",
                          borderRadius: 6,
                          cursor: "pointer",
                          color: "#e11d48",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: "0.8rem",
                        }}
                        title="Delete Delivery Tier"
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {/* Beyond Serviceable Radius Non-Serviceable Row */}
              <tr style={{ background: "#fafafa" }}>
                <td style={{ padding: "14px 16px", fontWeight: 600, color: "#64748b" }}>
                  &gt; {settings.max_serviceable_km} km
                </td>
                <td style={{ padding: "14px 16px", color: "#e11d48", fontWeight: 700 }}>
                  Not Serviceable
                </td>
                <td style={{ padding: "14px 16px", color: "#64748b" }}>
                  Outside Delivery Zone
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#15803d", background: "#dcfce7", padding: "4px 8px", borderRadius: 6 }}>
                    Active Rule
                  </span>
                </td>
                <td style={{ padding: "14px 16px", textAlign: "right", color: "#94a3b8", fontSize: "0.8rem" }}>
                  System Boundary
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD / EDIT DELIVERY TIER */}
      {isTierModalOpen && (
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
              maxWidth: 520,
              width: "100%",
              padding: 24,
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h3 style={{ margin: 0, color: "#831843", fontSize: "1.2rem" }}>
                {editingTier ? "Edit Delivery Tier" : "Add New Delivery Tier"}
              </h3>
              <button
                type="button"
                onClick={() => setIsTierModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveTier} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                    Min Distance (km) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={tierForm.min_km}
                    onChange={(e) => setTierForm((p) => ({ ...p, min_km: parseFloat(e.target.value) || 0 }))}
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
                    Max Distance (km) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={tierForm.max_km}
                    onChange={(e) => setTierForm((p) => ({ ...p, max_km: parseFloat(e.target.value) || 0 }))}
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
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                  Delivery Charge (₹) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={tierForm.charge}
                  onChange={(e) => setTierForm((p) => ({ ...p, charge: parseFloat(e.target.value) || 0 }))}
                  placeholder="0 for Free Delivery"
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
                  Enter 0 to mark this tier as &quot;FREE Delivery&quot;.
                </span>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                  Service Level / Label
                </label>
                <input
                  type="text"
                  value={tierForm.label}
                  onChange={(e) => setTierForm((p) => ({ ...p, label: e.target.value }))}
                  placeholder="e.g. Local Express (Within 90 mins)"
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={tierForm.display_order}
                    onChange={(e) => setTierForm((p) => ({ ...p, display_order: parseInt(e.target.value) || 0 }))}
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
                    Tier Status
                  </label>
                  <select
                    value={tierForm.active}
                    onChange={(e) => setTierForm((p) => ({ ...p, active: parseInt(e.target.value) || 0 }))}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: 8,
                      boxSizing: "border-box",
                    }}
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Disabled</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setIsTierModalOpen(false)}
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
                  disabled={savingTier}
                  style={{
                    padding: "10px 22px",
                    background: "linear-gradient(135deg, #be185d 0%, #9d174d 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: "0.88rem",
                    cursor: savingTier ? "not-allowed" : "pointer",
                  }}
                >
                  {savingTier ? "Saving..." : editingTier ? "Update Tier" : "Create Tier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {isDeleteModalOpen && deletingTier && (
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
              maxWidth: 440,
              width: "100%",
              padding: 24,
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              textAlign: "center",
            }}
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

            <h3 style={{ margin: "0 0 8px", color: "#1e293b", fontSize: "1.2rem" }}>
              Delete Delivery Tier?
            </h3>
            <p style={{ margin: "0 0 20px", color: "#64748b", fontSize: "0.88rem" }}>
              Are you sure you want to delete the delivery tier for{" "}
              <strong>
                {deletingTier.min_km} – {deletingTier.max_km} km (₹{deletingTier.charge})
              </strong>
              ? Orders falling into this distance range will not be matched to this rate.
            </p>

            <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                style={{
                  padding: "10px 20px",
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
                type="button"
                onClick={handleConfirmDeleteTier}
                disabled={deleting}
                style={{
                  padding: "10px 22px",
                  background: "#e11d48",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: "0.88rem",
                  cursor: deleting ? "not-allowed" : "pointer",
                }}
              >
                {deleting ? "Deleting..." : "Yes, Delete Tier"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT SHOP LOCATION & RADIUS */}
      {isSettingsModalOpen && (
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
              maxWidth: 500,
              width: "100%",
              padding: 24,
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h3 style={{ margin: 0, color: "#831843", fontSize: "1.2rem" }}>
                Edit Shop Location &amp; Radius
              </h3>
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                  Shop Base Location Name *
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.shop_location_name}
                  onChange={(e) => setSettingsForm((p) => ({ ...p, shop_location_name: e.target.value }))}
                  placeholder="e.g. Kozhikode Head Post Office"
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                    Shop PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.shop_pin}
                    onChange={(e) => setSettingsForm((p) => ({ ...p, shop_pin: e.target.value }))}
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
                    Max Service Radius (km) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={settingsForm.max_serviceable_km}
                    onChange={(e) => setSettingsForm((p) => ({ ...p, max_serviceable_km: e.target.value }))}
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
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                  Shop Physical Address
                </label>
                <textarea
                  rows={2}
                  value={settingsForm.shop_address}
                  onChange={(e) => setSettingsForm((p) => ({ ...p, shop_address: e.target.value }))}
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

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(false)}
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
                  disabled={savingSettings}
                  style={{
                    padding: "10px 22px",
                    background: "linear-gradient(135deg, #be185d 0%, #9d174d 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: "0.88rem",
                    cursor: savingSettings ? "not-allowed" : "pointer",
                  }}
                >
                  {savingSettings ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

