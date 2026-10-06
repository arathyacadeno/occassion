"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import {
  User as UserIcon,
  MapPin,
  Lock,
  Package,
  Plus,
  Trash2,
  CheckCircle,
  Home,
  Briefcase,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import styles from "./profile.module.css";

interface Address {
  id: string;
  fullName: string;
  phone: string;
  house: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pinCode: string;
  type: string;
  isDefault: boolean;
}

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, updateProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "addresses" | "password">("profile");

  // Profile Form state
  const [profileForm, setProfileForm] = useState({ name: "", phone: "" });
  const [profileStatus, setProfileStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Form state
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordStatus, setPasswordStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  // Addresses state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phone: "",
    house: "",
    street: "",
    area: "",
    city: "Kozhikode (Calicut)",
    state: "Kerala",
    pinCode: "673001",
    type: "Home",
    isDefault: false,
  });
  const [addressStatus, setAddressStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const fetchAddresses = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingAddresses(true);
    try {
      const res = await fetch("/api/addresses", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.addresses)) {
          setAddresses(data.addresses);
        }
      }
    } catch (err) {
      console.error("Failed to load addresses", err);
    } finally {
      setLoadingAddresses(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses();
    }
  }, [isAuthenticated, fetchAddresses]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileStatus(null);
    setSavingProfile(true);
    try {
      const res = await updateProfile(profileForm);
      if (res.success) {
        setProfileStatus({ type: "success", msg: "Profile updated successfully!" });
      } else {
        setProfileStatus({ type: "error", msg: res.error || "Failed to update profile" });
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ type: "error", msg: "New passwords do not match" });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordStatus({ type: "error", msg: "New password must be at least 6 characters" });
      return;
    }

    setSavingPassword(true);
    try {
      const res = await updateProfile({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      if (res.success) {
        setPasswordStatus({ type: "success", msg: "Password changed successfully!" });
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setPasswordStatus({ type: "error", msg: res.error || "Failed to update password" });
      }
    } finally {
      setSavingPassword(false);
    }
  };

  const handleAddAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressStatus(null);
    setSavingAddress(true);
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressForm),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setAddressStatus({ type: "success", msg: "Address saved successfully!" });
        setShowAddAddress(false);
        setAddressForm({
          fullName: "",
          phone: "",
          house: "",
          street: "",
          area: "",
          city: "Kozhikode (Calicut)",
          state: "Kerala",
          pinCode: "673001",
          type: "Home",
          isDefault: false,
        });
        fetchAddresses();
      } else {
        setAddressStatus({ type: "error", msg: data.error || "Failed to save address" });
      }
    } catch {
      setAddressStatus({ type: "error", msg: "Network error saving address" });
    } finally {
      setSavingAddress(false);
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      const res = await fetch(`/api/addresses/${id}`, {
        method: "PATCH",
        credentials: "include",
      });
      if (res.ok) {
        fetchAddresses();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      const res = await fetch(`/api/addresses/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        fetchAddresses();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.pageWrapper}>
        <Navbar />
        <main className={styles.mainContainer}>
          <p style={{ textAlign: "center", padding: "60px 0", color: "#64748b" }}>Loading profile...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.pageWrapper}>
        <Navbar />
        <main className={styles.mainContainer}>
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <UserIcon size={48} color="#db2777" style={{ margin: "0 auto 16px" }} />
            <h1 className={styles.pageTitle}>Account Access Required</h1>
            <p className={styles.pageSubtitle} style={{ marginBottom: 24 }}>
              Please sign in to manage your Occassions floral profile, saved delivery addresses, and order history.
            </p>
            <Link href="/" className={styles.saveBtn} style={{ textDecoration: "none" }}>
              Go to Home & Sign In
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <main className={styles.mainContainer}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.pageTitle}>My Account</h1>
            <p className={styles.pageSubtitle}>Manage your profile, delivery addresses, and security</p>
          </div>

          <div className={styles.topLinks}>
            <Link href="/orders" className={styles.outlineBtn}>
              <Package size={16} />
              <span>View Orders</span>
            </Link>
            <Link href="/track-order" className={styles.outlineBtn}>
              <MapPin size={16} />
              <span>Track Order</span>
            </Link>
          </div>
        </div>

        <div className={styles.contentGrid}>
          {/* Sidebar */}
          <aside className={styles.sidebarCard}>
            <div className={styles.userSummary}>
              <div className={styles.avatarCircle}>
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className={styles.summaryText}>
                <h3>{user?.name || "Customer"}</h3>
                <p>{user?.email}</p>
              </div>
            </div>

            <nav className={styles.navMenu}>
              <button
                type="button"
                className={`${styles.navItem} ${activeTab === "profile" ? styles.navItemActive : ""}`}
                onClick={() => setActiveTab("profile")}
              >
                <UserIcon size={18} />
                <span>Profile Details</span>
              </button>

              <button
                type="button"
                className={`${styles.navItem} ${activeTab === "addresses" ? styles.navItemActive : ""}`}
                onClick={() => setActiveTab("addresses")}
              >
                <MapPin size={18} />
                <span>Saved Addresses</span>
              </button>

              <button
                type="button"
                className={`${styles.navItem} ${activeTab === "password" ? styles.navItemActive : ""}`}
                onClick={() => setActiveTab("password")}
              >
                <Lock size={18} />
                <span>Change Password</span>
              </button>
            </nav>
          </aside>

          {/* Main Content Area */}
          <section className={styles.mainPanel}>
            {/* TAB 1: Profile Details */}
            {activeTab === "profile" && (
              <div>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Personal Details</h2>
                  <p className={styles.sectionDesc}>Update your account details and contact information</p>
                </div>

                {profileStatus && (
                  <div className={profileStatus.type === "success" ? styles.alertSuccess : styles.alertError}>
                    {profileStatus.msg}
                  </div>
                )}

                <form onSubmit={handleProfileSubmit}>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Full Name</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Phone Number</label>
                      <input
                        type="tel"
                        className={styles.formInput}
                        placeholder="+91 8606464700"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup} style={{ marginTop: 18 }}>
                    <label className={styles.formLabel}>Email Address</label>
                    <input
                      type="email"
                      className={`${styles.formInput} ${styles.formInputDisabled}`}
                      value={user?.email || ""}
                      disabled
                    />
                    <small style={{ color: "#94a3b8", fontSize: "0.78rem", marginTop: 4 }}>
                      Email address is linked to your account and cannot be modified directly.
                    </small>
                  </div>

                  <button type="submit" className={styles.saveBtn} disabled={savingProfile}>
                    {savingProfile ? "Saving changes..." : "Save Profile Details"}
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: Saved Addresses */}
            {activeTab === "addresses" && (
              <div>
                <div className={styles.sectionHeader} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h2 className={styles.sectionTitle}>Delivery Addresses</h2>
                    <p className={styles.sectionDesc}>Save addresses for express Calicut flower and cake deliveries</p>
                  </div>
                  {!showAddAddress && (
                    <button
                      type="button"
                      className={styles.outlineBtn}
                      onClick={() => setShowAddAddress(true)}
                    >
                      <Plus size={16} />
                      <span>Add New</span>
                    </button>
                  )}
                </div>

                {addressStatus && (
                  <div className={addressStatus.type === "success" ? styles.alertSuccess : styles.alertError}>
                    {addressStatus.msg}
                  </div>
                )}

                {/* Add Address Form */}
                {showAddAddress && (
                  <div className={styles.addAddressBox}>
                    <h3 style={{ margin: "0 0 16px", color: "#831843", fontSize: "1.1rem" }}>
                      Add New Delivery Address
                    </h3>
                    <form onSubmit={handleAddAddressSubmit}>
                      <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Recipient Full Name *</label>
                          <input
                            type="text"
                            className={styles.formInput}
                            placeholder="e.g. Arathy T P"
                            required
                            value={addressForm.fullName}
                            onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Contact Mobile *</label>
                          <input
                            type="tel"
                            className={styles.formInput}
                            placeholder="10-digit mobile number"
                            required
                            value={addressForm.phone}
                            onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>House / Flat / Building *</label>
                          <input
                            type="text"
                            className={styles.formInput}
                            placeholder="e.g. Lotus Villa, Flat 4B"
                            required
                            value={addressForm.house}
                            onChange={(e) => setAddressForm({ ...addressForm, house: e.target.value })}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Street / Landmark</label>
                          <input
                            type="text"
                            className={styles.formInput}
                            placeholder="e.g. Mavoor Road, Near YMCA"
                            value={addressForm.street}
                            onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Area / Locality</label>
                          <input
                            type="text"
                            className={styles.formInput}
                            placeholder="e.g. Arayidathupalam"
                            value={addressForm.area}
                            onChange={(e) => setAddressForm({ ...addressForm, area: e.target.value })}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Delivery PIN Code *</label>
                          <input
                            type="text"
                            className={styles.formInput}
                            placeholder="e.g. 673001"
                            required
                            value={addressForm.pinCode}
                            onChange={(e) => setAddressForm({ ...addressForm, pinCode: e.target.value })}
                          />
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 14, marginTop: 18, alignItems: "center" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.88rem", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={addressForm.isDefault}
                            onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                          />
                          <span>Set as default delivery address</span>
                        </label>
                      </div>

                      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                        <button type="submit" className={styles.saveBtn} disabled={savingAddress}>
                          {savingAddress ? "Saving..." : "Save Address"}
                        </button>
                        <button
                          type="button"
                          className={styles.outlineBtn}
                          onClick={() => setShowAddAddress(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Addresses List */}
                <div className={styles.addressList}>
                  {loadingAddresses ? (
                    <p style={{ color: "#64748b" }}>Loading saved addresses...</p>
                  ) : addresses.length === 0 && !showAddAddress ? (
                    <div style={{ textAlign: "center", padding: "40px 0", color: "#64748b" }}>
                      <MapPin size={36} color="#db2777" style={{ margin: "0 auto 12px" }} />
                      <p>You haven&apos;t saved any delivery addresses yet.</p>
                      <button
                        type="button"
                        className={styles.saveBtn}
                        onClick={() => setShowAddAddress(true)}
                        style={{ marginTop: 10 }}
                      >
                        Add Your First Address
                      </button>
                    </div>
                  ) : (
                    addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`${styles.addressCard} ${addr.isDefault ? styles.addressCardDefault : ""}`}
                      >
                        <div className={styles.addressHeader}>
                          <span className={styles.addressTypeBadge}>
                            {addr.type === "Work" ? <Briefcase size={13} /> : <Home size={13} />}
                            {addr.type}
                          </span>
                          {addr.isDefault && <span className={styles.defaultBadge}>Default Address</span>}
                        </div>

                        <div className={styles.addressName}>{addr.fullName}</div>
                        <div className={styles.addressPhone}>{addr.phone}</div>
                        <div className={styles.addressText}>
                          {addr.house}, {addr.street ? `${addr.street}, ` : ""}
                          {addr.area ? `${addr.area}, ` : ""}
                          {addr.city} - {addr.pinCode}, {addr.state}
                        </div>

                        <div className={styles.addressActions}>
                          {!addr.isDefault && (
                            <button
                              type="button"
                              className={styles.addressActionBtn}
                              onClick={() => handleSetDefaultAddress(addr.id)}
                            >
                              Set as Default
                            </button>
                          )}
                          <button
                            type="button"
                            className={`${styles.addressActionBtn} ${styles.addressDeleteBtn}`}
                            onClick={() => handleDeleteAddress(addr.id)}
                          >
                            <Trash2 size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: Change Password */}
            {activeTab === "password" && (
              <div>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Change Password</h2>
                  <p className={styles.sectionDesc}>Ensure your account is protected with a secure password</p>
                </div>

                {passwordStatus && (
                  <div className={passwordStatus.type === "success" ? styles.alertSuccess : styles.alertError}>
                    {passwordStatus.msg}
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit}>
                  <div className={styles.formGroup} style={{ maxWidth: 420 }}>
                    <label className={styles.formLabel}>Current Password</label>
                    <input
                      type="password"
                      className={styles.formInput}
                      required
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup} style={{ maxWidth: 420, marginTop: 14 }}>
                    <label className={styles.formLabel}>New Password (min 6 characters)</label>
                    <input
                      type="password"
                      className={styles.formInput}
                      required
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup} style={{ maxWidth: 420, marginTop: 14 }}>
                    <label className={styles.formLabel}>Confirm New Password</label>
                    <input
                      type="password"
                      className={styles.formInput}
                      required
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    />
                  </div>

                  <button type="submit" className={styles.saveBtn} disabled={savingPassword}>
                    {savingPassword ? "Updating Password..." : "Update Password"}
                  </button>
                </form>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
