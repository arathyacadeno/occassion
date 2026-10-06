"use client";

import React, { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import {
  ShieldCheck,
  Package,
  ShoppingBag,
  Users,
  Tag,
  Truck,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import styles from "./admin.module.css";

export default function AdminPage() {
  const { user, isAdmin, isAuthenticated, login } = useAuth();

  // Admin login fallback
  const [adminEmail, setAdminEmail] = useState("admin@occasions.com");
  const [adminPassword, setAdminPassword] = useState("admin123");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  // Tab
  const [activeTab, setActiveTab] = useState<"orders" | "stock" | "coupons" | "delivery" | "users">("orders");

  // Admin stats & data
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Stock edit state
  const [stockChanges, setStockChanges] = useState<Record<string, number>>({});
  const [stockSaveMsg, setStockSaveMsg] = useState<string | null>(null);

  // Coupon form
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discountType: "percentage",
    discountValue: 10,
    minOrderValue: 500,
    maxDiscount: 200,
  });
  const [couponMsg, setCouponMsg] = useState<string | null>(null);

  const fetchAdminData = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      // 1. Stats & Users
      const statsRes = await fetch("/api/admin/stats", { credentials: "include" });
      if (statsRes.ok) {
        const data = await statsRes.json();
        if (data.success) {
          setStats(data.stats);
          setUsersList(data.users || []);
        }
      }

      // 2. Orders
      const ordersRes = await fetch("/api/orders", { credentials: "include" });
      if (ordersRes.ok) {
        const data = await ordersRes.json();
        if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      }

      // 3. Products
      const prodRes = await fetch("/api/products?limit=100", { credentials: "include" });
      if (prodRes.ok) {
        const data = await prodRes.json();
        if (data.success && Array.isArray(data.products)) {
          setProducts(data.products);
        }
      }

      // 4. Coupons
      const coupRes = await fetch("/api/coupons", { credentials: "include" });
      if (coupRes.ok) {
        const data = await coupRes.json();
        if (data.success && Array.isArray(data.coupons)) {
          setCoupons(data.coupons);
        }
      }
    } catch (e) {
      console.error("Admin data fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin, fetchAdminData]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoggingIn(true);
    try {
      const res = await login(adminEmail, adminPassword);
      if (!res.success) {
        setLoginError(res.error || "Invalid administrator credentials");
      }
    } finally {
      setLoggingIn(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
        credentials: "include",
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, order_status: newStatus } : o))
        );
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleSaveStock = async (productSlug: string, newStock: number) => {
    try {
      const res = await fetch(`/api/products/${productSlug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
        credentials: "include",
      });
      if (res.ok) {
        setStockSaveMsg(`Stock updated for ${productSlug}`);
        setTimeout(() => setStockSaveMsg(null), 3000);
        setProducts((prev) =>
          prev.map((p) => (p.slug === productSlug ? { ...p, stock: newStock } : p))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponMsg(null);
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCoupon),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setCouponMsg(`Coupon ${newCoupon.code.toUpperCase()} created successfully!`);
        setNewCoupon({
          code: "",
          discountType: "percentage",
          discountValue: 10,
          minOrderValue: 500,
          maxDiscount: 200,
        });
        fetchAdminData();
      } else {
        setCouponMsg(data.error || "Failed to create coupon");
      }
    } catch {
      setCouponMsg("Network error creating coupon");
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className={styles.pageWrapper}>
        <Navbar />
        <main className={styles.mainContainer}>
          <div className={styles.loginCard}>
            <ShieldCheck size={44} color="#be185d" style={{ margin: "0 auto 12px" }} />
            <h1 style={{ fontFamily: "var(--font-serif)", color: "#831843", fontSize: "1.6rem", margin: "0 0 8px" }}>
              Occassions Admin Portal
            </h1>
            <p style={{ color: "#64748b", fontSize: "0.86rem", margin: "0 0 20px" }}>
              Sign in with administrative credentials to manage flower products, stock, orders, and delivery settings.
            </p>

            {loginError && (
              <div style={{ background: "#fff1f2", color: "#e11d48", padding: 10, borderRadius: 10, fontSize: "0.82rem", marginBottom: 14 }}>
                {loginError}
              </div>
            )}

            <form onSubmit={handleAdminLogin} style={{ textAlign: "left" }}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#475569", marginBottom: 4 }}>
                  Admin Email
                </label>
                <input
                  type="email"
                  className={styles.inputControl}
                  style={{ width: "100%", boxSizing: "border-box" }}
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#475569", marginBottom: 4 }}>
                  Password
                </label>
                <input
                  type="password"
                  className={styles.inputControl}
                  style={{ width: "100%", boxSizing: "border-box" }}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className={styles.submitBtn}
                style={{ width: "100%", padding: 12 }}
                disabled={loggingIn}
              >
                {loggingIn ? "Verifying..." : "Sign In to Admin Dashboard"}
              </button>
            </form>

            <div style={{ marginTop: 20, padding: 12, background: "#f8fafc", borderRadius: 10, fontSize: "0.75rem", color: "#64748b" }}>
              💡 Default demo credentials: <strong>admin@occasions.com</strong> / <strong>admin123</strong>
            </div>
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
        {/* Header */}
        <div className={styles.adminHeader}>
          <div className={styles.titleArea}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <h1>Occassions Management Console</h1>
              <span className={styles.badgeAdmin}>
                <ShieldCheck size={14} /> Admin
              </span>
            </div>
            <p>Real-time orders, floral inventory, coupons, and delivery logistics</p>
          </div>

          <button
            type="button"
            className={styles.actionBtn}
            onClick={fetchAdminData}
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <RefreshCw size={14} /> Refresh Data
          </button>
        </div>

        {/* Stats Row */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIconBox}>
              <TrendingUp size={24} />
            </div>
            <div>
              <div className={styles.statValue}>₹{(stats?.totalRevenue || 0).toLocaleString("en-IN")}</div>
              <div className={styles.statLabel}>Total Paid Revenue</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconBox}>
              <Package size={24} />
            </div>
            <div>
              <div className={styles.statValue}>{orders.length}</div>
              <div className={styles.statLabel}>Total Orders Placed</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconBox}>
              <ShoppingBag size={24} />
            </div>
            <div>
              <div className={styles.statValue}>{products.length}</div>
              <div className={styles.statLabel}>Active Catalog Products</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconBox}>
              <Users size={24} />
            </div>
            <div>
              <div className={styles.statValue}>{usersList.length}</div>
              <div className={styles.statLabel}>Registered Customers</div>
            </div>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className={styles.tabsBar}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "orders" ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            <Package size={17} />
            <span>Orders ({orders.length})</span>
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "stock" ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveTab("stock")}
          >
            <ShoppingBag size={17} />
            <span>Products &amp; Stock ({products.length})</span>
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "coupons" ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveTab("coupons")}
          >
            <Tag size={17} />
            <span>Coupons</span>
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "delivery" ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveTab("delivery")}
          >
            <Truck size={17} />
            <span>Delivery Settings</span>
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "users" ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveTab("users")}
          >
            <Users size={17} />
            <span>Customers ({usersList.length})</span>
          </button>
        </div>

        {/* TAB 1: Orders */}
        {activeTab === "orders" && (
          <div className={styles.panelCard}>
            <h2 style={{ fontFamily: "var(--font-serif)", color: "#831843", fontSize: "1.3rem", margin: "0 0 16px" }}>
              Customer Orders &amp; Fulfillment
            </h2>
            <div className={styles.tableResponsive}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Destination</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Fulfillment Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td style={{ fontWeight: 700, color: "#831843" }}>#{o.id}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{o.customer_name}</div>
                        <div style={{ fontSize: "0.78rem", color: "#64748b" }}>{o.customer_phone}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: "0.82rem" }}>
                          {o.deliveryAddress?.area || "Calicut"}, PIN: {o.deliveryAddress?.pinCode || "673001"}
                        </div>
                      </td>
                      <td style={{ fontWeight: 700 }}>₹{o.final_amount}</td>
                      <td>
                        <span
                          className={styles.statusBadge}
                          style={{
                            background: o.payment_status === "paid" ? "#dcfce7" : "#fef3c7",
                            color: o.payment_status === "paid" ? "#166534" : "#92400e",
                          }}
                        >
                          {o.payment_status}
                        </span>
                      </td>
                      <td>
                        <select
                          className={styles.statusSelect}
                          value={o.order_status}
                          onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                        >
                          <option value="confirmed">Confirmed</option>
                          <option value="preparing">Floral Crafting (Preparing)</option>
                          <option value="out_for_delivery">Out for Delivery</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td>
                        <a
                          href={`/track-order`}
                          className={styles.actionBtn}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Track
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Products & Stock */}
        {activeTab === "stock" && (
          <div className={styles.panelCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontFamily: "var(--font-serif)", color: "#831843", fontSize: "1.3rem", margin: 0 }}>
                Inventory &amp; Stock Levels
              </h2>
              {stockSaveMsg && (
                <div style={{ color: "#047857", fontWeight: 600, fontSize: "0.88rem" }}>
                  ✓ {stockSaveMsg}
                </div>
              )}
            </div>

            <div className={styles.tableResponsive}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Flower Type</th>
                    <th>Price</th>
                    <th>Current Stock</th>
                    <th>Update</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const currentVal =
                      stockChanges[p.slug] !== undefined ? stockChanges[p.slug] : p.stock;
                    return (
                      <tr key={p.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{p.name}</div>
                          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>SKU: {p.sku}</div>
                        </td>
                        <td>{p.categoryLabel || p.category}</td>
                        <td>{p.flowerTypeLabel || p.flowerType || "Mixed Flowers"}</td>
                        <td style={{ fontWeight: 700 }}>₹{p.price}</td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            className={styles.stockInput}
                            value={currentVal}
                            onChange={(e) =>
                              setStockChanges({
                                ...stockChanges,
                                [p.slug]: Number(e.target.value),
                              })
                            }
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className={styles.actionBtn}
                            onClick={() => handleSaveStock(p.slug, currentVal)}
                          >
                            Save
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Coupons */}
        {activeTab === "coupons" && (
          <div className={styles.panelCard}>
            <h2 style={{ fontFamily: "var(--font-serif)", color: "#831843", fontSize: "1.3rem", margin: "0 0 16px" }}>
              Create New Promo Coupon
            </h2>

            {couponMsg && (
              <div style={{ padding: 12, borderRadius: 10, background: "#fdf2f8", color: "#be185d", fontWeight: 600, marginBottom: 16 }}>
                {couponMsg}
              </div>
            )}

            <form onSubmit={handleCreateCoupon}>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label>Coupon Code</label>
                  <input
                    type="text"
                    className={styles.inputControl}
                    placeholder="e.g. FESTIVE20"
                    required
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Discount Type</label>
                  <select
                    className={styles.inputControl}
                    value={newCoupon.discountType}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label>Discount Value</label>
                  <input
                    type="number"
                    min="1"
                    className={styles.inputControl}
                    value={newCoupon.discountValue}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Min. Order Value (₹)</label>
                  <input
                    type="number"
                    min="0"
                    className={styles.inputControl}
                    value={newCoupon.minOrderValue}
                    onChange={(e) => setNewCoupon({ ...newCoupon, minOrderValue: Number(e.target.value) })}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Max. Discount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    className={styles.inputControl}
                    value={newCoupon.maxDiscount}
                    onChange={(e) => setNewCoupon({ ...newCoupon, maxDiscount: Number(e.target.value) })}
                  />
                </div>
              </div>

              <button type="submit" className={styles.submitBtn}>
                Add Coupon Code
              </button>
            </form>

            <h3 style={{ margin: "32px 0 14px", color: "#831843" }}>Active Store Coupons</h3>
            <div className={styles.tableResponsive}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Type</th>
                    <th>Value</th>
                    <th>Min. Order</th>
                    <th>Max. Discount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr key={c.id || c.code}>
                      <td style={{ fontWeight: 700, color: "#831843" }}>{c.code}</td>
                      <td style={{ textTransform: "capitalize" }}>{c.discount_type || c.type}</td>
                      <td>
                        {c.discount_type === "percentage" ? `${c.discount_value}%` : `₹${c.discount_value}`}
                      </td>
                      <td>₹{c.min_order_value || 0}</td>
                      <td>{c.max_discount ? `₹${c.max_discount}` : "No Limit"}</td>
                      <td>
                        <span className={styles.statusBadge} style={{ background: "#dcfce7", color: "#166534" }}>
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: Delivery Settings */}
        {activeTab === "delivery" && (
          <div className={styles.panelCard}>
            <h2 style={{ fontFamily: "var(--font-serif)", color: "#831843", fontSize: "1.3rem", margin: "0 0 8px" }}>
              Calicut Delivery Zones &amp; Haversine Distance Rates
            </h2>
            <p style={{ color: "#64748b", fontSize: "0.88rem", marginBottom: 20 }}>
              All delivery charges are calculated mathematically on the server using Haversine Great-Circle distance from the shop hub.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18, marginBottom: 24 }}>
              <div style={{ padding: 18, background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "0.8rem", color: "#64748b" }}>Shop Base Location</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#831843" }}>Kozhikode Head Post Office</div>
                <div style={{ fontSize: "0.88rem", color: "#334155" }}>Shop PIN: <strong>673001</strong></div>
              </div>

              <div style={{ padding: 18, background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "0.8rem", color: "#64748b" }}>Serviceable Radius</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#047857" }}>Up to 50 km</div>
                <div style={{ fontSize: "0.88rem", color: "#334155" }}>&gt; 50 km: Automatic non-serviceable reject</div>
              </div>
            </div>

            <div className={styles.tableResponsive}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Radial Distance</th>
                    <th>Delivery Charge</th>
                    <th>Service Level</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>0 – 5 km</td>
                    <td style={{ fontWeight: 700, color: "#047857" }}>FREE Delivery</td>
                    <td>Local Express (Within 90 mins)</td>
                    <td>Active</td>
                  </tr>
                  <tr>
                    <td>&gt; 5 – 20 km</td>
                    <td style={{ fontWeight: 700 }}>₹150</td>
                    <td>Calicut Suburbs (Same-day)</td>
                    <td>Active</td>
                  </tr>
                  <tr>
                    <td>&gt; 20 – 30 km</td>
                    <td style={{ fontWeight: 700 }}>₹300</td>
                    <td>Greater Calicut Area</td>
                    <td>Active</td>
                  </tr>
                  <tr>
                    <td>&gt; 30 – 40 km</td>
                    <td style={{ fontWeight: 700 }}>₹400</td>
                    <td>Outlying Districts</td>
                    <td>Active</td>
                  </tr>
                  <tr>
                    <td>&gt; 40 – 50 km</td>
                    <td style={{ fontWeight: 700 }}>₹500</td>
                    <td>Perimeter Delivery</td>
                    <td>Active</td>
                  </tr>
                  <tr>
                    <td>&gt; 50 km</td>
                    <td style={{ color: "#e11d48", fontWeight: 700 }}>Not Serviceable</td>
                    <td>Outside Delivery Zone</td>
                    <td>Active</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: Users */}
        {activeTab === "users" && (
          <div className={styles.panelCard}>
            <h2 style={{ fontFamily: "var(--font-serif)", color: "#831843", fontSize: "1.3rem", margin: "0 0 16px" }}>
              Registered Customer Accounts
            </h2>
            <div className={styles.tableResponsive}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Registered On</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontSize: "0.8rem", color: "#64748b" }}>{u.id}</td>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.phone || "—"}</td>
                      <td>
                        <span
                          className={styles.statusBadge}
                          style={{
                            background: u.role === "admin" ? "#fce7f3" : "#f1f5f9",
                            color: u.role === "admin" ? "#be185d" : "#475569",
                          }}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td>
                        {u.created_at ? new Date(u.created_at).toLocaleDateString("en-IN") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
