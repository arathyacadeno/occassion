"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import {
  ShieldCheck,
  Sparkles,
  Sliders,
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
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  Filter,
  Globe,
} from "lucide-react";
import ProductFormModal from "@/components/admin/ProductFormModal";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import ProductQuickViewModal from "@/components/admin/ProductQuickViewModal";
import CategoryManager from "@/components/admin/CategoryManager";
import MediaLibrary from "@/components/admin/MediaLibrary";
import StoreBrandingManager from "@/components/admin/StoreBrandingManager";
import HomepageManager from "@/components/admin/HomepageManager";
import DeliveryManager from "@/components/admin/DeliveryManager";
import { Layers, Palette, LayoutTemplate, Image as ImageIcon } from "lucide-react";
import styles from "./admin.module.css";

export default function AdminPage() {
  const { user, isAdmin, isAuthenticated, login } = useAuth();

  // Admin login fallback
  const [adminEmail, setAdminEmail] = useState("admin@occasions.com");
  const [adminPassword, setAdminPassword] = useState("admin123");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  // Tab
  const [activeTab, setActiveTab] = useState<"orders" | "stock" | "categories" | "media" | "branding" | "homepage" | "customization" | "coupons" | "delivery" | "users">("orders");

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

  // Product Management CRUD & Filters state
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [productStatusFilter, setProductStatusFilter] = useState("all");
  const [productStockFilter, setProductStockFilter] = useState("all");
  const [productSort, setProductSort] = useState("newest");
  const [productPage, setProductPage] = useState(1);
  const productPageSize = 20;

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState<any | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProductForDelete, setSelectedProductForDelete] = useState<any | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [selectedProductForQuickView, setSelectedProductForQuickView] = useState<any | null>(null);
  const [productActionMsg, setProductActionMsg] = useState<string | null>(null);

  // Coupon form
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discountType: "percentage",
    discountValue: 10,
    minOrderValue: 500,
    maxDiscount: 200,
  });
  const [couponMsg, setCouponMsg] = useState<string | null>(null);

  // Customization state
  const [customConfig, setCustomConfig] = useState<any>({
    sizes: [
      { id: "small", name: "Small (Standard)", stemsText: "12 - 15 Stems", extraPrice: 0 },
      { id: "medium", name: "Medium", stemsText: "18 - 22 Stems", extraPrice: 200 },
      { id: "large", name: "Large Deluxe", stemsText: "26 - 30 Stems", extraPrice: 450 },
      { id: "premium", name: "Premium Luxe Atelier", stemsText: "36 - 42 Stems", extraPrice: 750 },
    ],
    wrappingPapers: [
      { id: "craft-natural", name: "Classic Natural Craft Wrap", extraPrice: 0 },
      { id: "blush-pink-matte", name: "Blush Pink Matte Luxury Wrap", extraPrice: 80 },
      { id: "champagne-gold-foil", name: "Champagne Gold Foil Border", extraPrice: 120 },
      { id: "midnight-black-gold", name: "Midnight Onyx & Gold Accent", extraPrice: 100 },
      { id: "frosted-pearl", name: "Frosted Pearl Minimalist Wrap", extraPrice: 90 },
    ],
    ribbonColors: [
      { id: "champagne-gold", name: "Champagne Gold Ribbon", colorCode: "#d4af37", extraPrice: 0 },
      { id: "blush-pink", name: "Blush Rose Pink Ribbon", colorCode: "#f472b6", extraPrice: 30 },
      { id: "royal-crimson", name: "Royal Crimson Red Ribbon", colorCode: "#be185d", extraPrice: 30 },
      { id: "deep-maroon", name: "Deep Maroon Satin Ribbon", colorCode: "#831843", extraPrice: 40 },
      { id: "lavender-violet", name: "Lavender Violet Ribbon", colorCode: "#a855f7", extraPrice: 30 },
      { id: "emerald-green", name: "Forest Emerald Ribbon", colorCode: "#059669", extraPrice: 30 },
      { id: "ivory-silk", name: "Ivory Silk Ribbon", colorCode: "#fef3c7", extraPrice: 30 },
    ],
    decorations: [
      { id: "babys-breath", name: "Fresh Baby's Breath (Gypsophila)", extraPrice: 100 },
      { id: "ruscus-greens", name: "Italian Ruscus Greenery", extraPrice: 70 },
      { id: "eucalyptus", name: "Fragrant Silver Dollar Eucalyptus", extraPrice: 90 },
      { id: "golden-fillers", name: "Decorative Floral Sparkle Fillers", extraPrice: 120 },
    ],
    disabledProductIds: [],
  });
  const [customCatFilter, setCustomCatFilter] = useState("all");
  const [customSaveMsg, setCustomSaveMsg] = useState<string | null>(null);
  const [customSaving, setCustomSaving] = useState(false);

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
      const prodRes = await fetch("/api/products?limit=250", { credentials: "include" });
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

      // 6. Categories
      try {
        const catRes = await fetch("/api/categories", { credentials: "include" });
        if (catRes.ok) {
          const data = await catRes.json();
          if (data.success && Array.isArray(data.categories)) {
            setCategoriesList(data.categories);
          }
        }
      } catch (err) {
        console.warn("Could not fetch categories", err);
      }

      // 5. Customization Settings
      try {
        const customRes = await fetch("/api/admin/customization", { credentials: "include" });
        if (customRes.ok) {
          const data = await customRes.json();
          if (data.success && data.config) {
            setCustomConfig(data.config);
          }
        }
      } catch (err) {
        console.warn("Could not fetch customization settings", err);
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

  const handleToggleProductCustomizable = (productId: string) => {
    setCustomConfig((prev: any) => {
      const disabledList: string[] = Array.isArray(prev.disabledProductIds) ? prev.disabledProductIds : [];
      const isCurrentlyDisabled = disabledList.includes(productId);
      const nextDisabled = isCurrentlyDisabled
        ? disabledList.filter((id) => id !== productId)
        : [...disabledList, productId];
      return { ...prev, disabledProductIds: nextDisabled };
    });
  };

  const handleSaveCustomization = async () => {
    setCustomSaving(true);
    setCustomSaveMsg(null);
    try {
      const res = await fetch("/api/admin/customization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customConfig),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setCustomSaveMsg("Customization settings and charges saved successfully!");
        setTimeout(() => setCustomSaveMsg(null), 3500);
      } else {
        setCustomSaveMsg(data.error || "Failed to save settings");
      }
    } catch {
      setCustomSaveMsg("Network error saving customization settings");
    } finally {
      setCustomSaving(false);
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

  // Product CRUD Action Handlers
  const handleOpenAddProduct = () => {
    setSelectedProductForEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditProduct = (p: any) => {
    setSelectedProductForEdit(p);
    setIsFormModalOpen(true);
  };

  const handleOpenQuickView = (p: any) => {
    setSelectedProductForQuickView(p);
    setIsQuickViewOpen(true);
  };

  const handleOpenDelete = (p: any) => {
    setSelectedProductForDelete(p);
    setIsDeleteModalOpen(true);
  };

  const handleCreateOrUpdateProduct = async (productData: any): Promise<boolean> => {
    const isEdit = Boolean(selectedProductForEdit?.slug || selectedProductForEdit?.id);
    const targetSlug = selectedProductForEdit?.slug || selectedProductForEdit?.id;
    const url = isEdit ? `/api/products/${encodeURIComponent(targetSlug)}` : `/api/products`;
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
      credentials: "include",
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || "Failed to save product");
    }

    setProductActionMsg(`✓ Product '${productData.name}' ${isEdit ? "updated" : "published"} successfully`);
    setTimeout(() => setProductActionMsg(null), 5000);
    await fetchAdminData();
    return true;
  };

  const handleTogglePublishProduct = async (p: any) => {
    const newActive = !p.active;
    const newStatus = newActive ? "published" : "draft";

    const res = await fetch(`/api/products/${encodeURIComponent(p.slug || p.id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: newActive, status: newStatus }),
      credentials: "include",
    });

    const data = await res.json();
    if (data.success) {
      setProducts((prev) =>
        prev.map((item) => (item.id === p.id ? { ...item, active: newActive, status: newStatus } : item))
      );
      setProductActionMsg(`✓ '${p.name}' is now ${newActive ? "Published" : "Draft"}`);
      setTimeout(() => setProductActionMsg(null), 4000);
    } else {
      alert(data.error || "Failed to update product status");
    }
  };

  const handleDuplicateProduct = async (slug: string) => {
    const res = await fetch(`/api/products/${encodeURIComponent(slug)}/duplicate`, {
      method: "POST",
      credentials: "include",
    });
    const data = await res.json();
    if (data.success) {
      setProductActionMsg("✓ Product duplicated successfully as Draft");
      setTimeout(() => setProductActionMsg(null), 4000);
      await fetchAdminData();
    } else {
      alert(data.error || "Failed to duplicate product");
    }
  };

  const handleConfirmDelete = async (slug: string, force?: boolean): Promise<boolean> => {
    const res = await fetch(`/api/products/${encodeURIComponent(slug)}?force=${force ? "true" : "false"}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();
    if (data.success) {
      setProducts((prev) => prev.filter((item) => item.slug !== slug && item.id !== slug));
      setProductActionMsg(`✓ ${data.message || "Product removed successfully"}`);
      setTimeout(() => setProductActionMsg(null), 5000);
      await fetchAdminData();
      return true;
    } else {
      throw new Error(data.error || "Failed to remove product");
    }
  };

  // Filtered & Paginated Products for Product Management
  const filteredProducts = useMemo(() => {
    return products
      .filter((p: any) => {
        if (productSearch.trim()) {
          const q = productSearch.toLowerCase();
          const matchName = (p.name || "").toLowerCase().includes(q);
          const matchSku = (p.sku || "").toLowerCase().includes(q);
          const matchSlug = (p.slug || "").toLowerCase().includes(q);
          if (!matchName && !matchSku && !matchSlug) return false;
        }

        if (productCategoryFilter !== "all") {
          const cat = (p.categoryId || p.categorySlug || p.category || "").toLowerCase();
          if (cat !== productCategoryFilter.toLowerCase()) return false;
        }

        if (productStatusFilter !== "all") {
          const st = p.status || (p.active ? "published" : "draft");
          if (st !== productStatusFilter) return false;
        }

        if (productStockFilter === "instock" && (p.stock || 0) <= 0) return false;
        if (productStockFilter === "low" && ((p.stock || 0) > 10 || (p.stock || 0) <= 0)) return false;
        if (productStockFilter === "out" && (p.stock || 0) > 0) return false;

        return true;
      })
      .sort((a: any, b: any) => {
        if (productSort === "price_asc") return (a.price || 0) - (b.price || 0);
        if (productSort === "price_desc") return (b.price || 0) - (a.price || 0);
        if (productSort === "name_asc") return (a.name || "").localeCompare(b.name || "");
        if (productSort === "stock_asc") return (a.stock || 0) - (b.stock || 0);
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });
  }, [products, productSearch, productCategoryFilter, productStatusFilter, productStockFilter, productSort]);

  const totalProductPages = Math.max(1, Math.ceil(filteredProducts.length / productPageSize));
  const paginatedProducts = filteredProducts.slice(
    (productPage - 1) * productPageSize,
    productPage * productPageSize
  );

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
              <div className={styles.statValue}>{stats?.totalOrders ?? orders.length}</div>
              <div className={styles.statLabel}>Total Orders Placed</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconBox}>
              <ShoppingBag size={24} />
            </div>
            <div>
              <div className={styles.statValue}>{stats?.activeProducts ?? products.length}</div>
              <div className={styles.statLabel}>Active Catalog Products</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconBox}>
              <Users size={24} />
            </div>
            <div>
              <div className={styles.statValue}>{stats?.totalCustomers ?? usersList.length}</div>
              <div className={styles.statLabel}>Registered Customers</div>
            </div>
          </div>
        </div>

                {/* Two-Column Sidebar Dashboard Layout */}
        <div className={styles.dashboardLayout}>
          {/* Left Sidebar Navigation */}
          <aside className={styles.sidebar} aria-label="Admin Navigation">
            {/* Group 1: Store & Orders */}
            <div className={styles.sidebarSection}>
              <div className={styles.sidebarSectionTitle}>Store &amp; Orders</div>
              <button
                type="button"
                className={`${styles.sidebarBtn} ${activeTab === "orders" ? styles.sidebarBtnActive : ""}`}
                onClick={() => setActiveTab("orders")}
              >
                <div className={styles.sidebarBtnLeft}>
                  <Package size={17} />
                  <span>Orders</span>
                </div>
                <span className={`${styles.sidebarBadge} ${activeTab === "orders" ? styles.sidebarBadgeActive : ""}`}>
                  {stats?.totalOrders ?? orders.length}
                </span>
              </button>

              <button
                type="button"
                className={`${styles.sidebarBtn} ${activeTab === "users" ? styles.sidebarBtnActive : ""}`}
                onClick={() => setActiveTab("users")}
              >
                <div className={styles.sidebarBtnLeft}>
                  <Users size={17} />
                  <span>Customers</span>
                </div>
                <span className={`${styles.sidebarBadge} ${activeTab === "users" ? styles.sidebarBadgeActive : ""}`}>
                  {stats?.totalCustomers ?? usersList.length}
                </span>
              </button>
            </div>

            {/* Group 2: Catalog Management */}
            <div className={styles.sidebarSection}>
              <div className={styles.sidebarSectionTitle}>Catalog Management</div>
              <button
                type="button"
                className={`${styles.sidebarBtn} ${activeTab === "stock" ? styles.sidebarBtnActive : ""}`}
                onClick={() => setActiveTab("stock")}
              >
                <div className={styles.sidebarBtnLeft}>
                  <ShoppingBag size={17} />
                  <span>Products &amp; Stock</span>
                </div>
                <span className={`${styles.sidebarBadge} ${activeTab === "stock" ? styles.sidebarBadgeActive : ""}`}>
                  {stats?.activeProducts ?? products.length}
                </span>
              </button>

              <button
                type="button"
                className={`${styles.sidebarBtn} ${activeTab === "categories" ? styles.sidebarBtnActive : ""}`}
                onClick={() => setActiveTab("categories")}
              >
                <div className={styles.sidebarBtnLeft}>
                  <Layers size={17} />
                  <span>Categories</span>
                </div>
                <span className={`${styles.sidebarBadge} ${activeTab === "categories" ? styles.sidebarBadgeActive : ""}`}>
                  {categoriesList.length}
                </span>
              </button>

              <button
                type="button"
                className={`${styles.sidebarBtn} ${activeTab === "media" ? styles.sidebarBtnActive : ""}`}
                onClick={() => setActiveTab("media")}
              >
                <div className={styles.sidebarBtnLeft}>
                  <ImageIcon size={17} />
                  <span>Media Library</span>
                </div>
              </button>
            </div>

            {/* Group 3: Store Settings & CMS */}
            <div className={styles.sidebarSection}>
              <div className={styles.sidebarSectionTitle}>Settings &amp; Content</div>
              <button
                type="button"
                className={`${styles.sidebarBtn} ${activeTab === "branding" ? styles.sidebarBtnActive : ""}`}
                onClick={() => setActiveTab("branding")}
              >
                <div className={styles.sidebarBtnLeft}>
                  <Palette size={17} />
                  <span>Store Branding</span>
                </div>
              </button>

              <button
                type="button"
                className={`${styles.sidebarBtn} ${activeTab === "homepage" ? styles.sidebarBtnActive : ""}`}
                onClick={() => setActiveTab("homepage")}
              >
                <div className={styles.sidebarBtnLeft}>
                  <LayoutTemplate size={17} />
                  <span>Homepage CMS</span>
                </div>
              </button>

              <button
                type="button"
                className={`${styles.sidebarBtn} ${activeTab === "delivery" ? styles.sidebarBtnActive : ""}`}
                onClick={() => setActiveTab("delivery")}
              >
                <div className={styles.sidebarBtnLeft}>
                  <Truck size={17} />
                  <span>Delivery Settings</span>
                </div>
              </button>

              <button
                type="button"
                className={`${styles.sidebarBtn} ${activeTab === "coupons" ? styles.sidebarBtnActive : ""}`}
                onClick={() => setActiveTab("coupons")}
              >
                <div className={styles.sidebarBtnLeft}>
                  <Tag size={17} />
                  <span>Coupons</span>
                </div>
              </button>
            </div>
          </aside>

          {/* Right Main Content Area */}
          <div className={styles.contentArea}>
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

        {/* TAB 2: Products & Catalog Management */}
        {activeTab === "stock" && (
          <div className={styles.panelCard}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 14 }}>
              <div>
                <h2 style={{ fontFamily: "var(--font-serif)", color: "#831843", fontSize: "1.45rem", margin: "0 0 4px" }}>
                  Product Catalog &amp; Inventory Management
                </h2>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
                  Add new items, upload high-res imagery to Cloudinary, edit pricing, manage stock, and publish to the storefront.
                </p>
              </div>

              <button
                type="button"
                className={styles.primaryBtn}
                onClick={handleOpenAddProduct}
              >
                <Plus size={18} />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Toast feedback */}
            {productActionMsg && (
              <div style={{ padding: "12px 18px", borderRadius: 10, background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", fontWeight: 600, fontSize: "0.9rem", marginBottom: 18 }}>
                {productActionMsg}
              </div>
            )}
            {stockSaveMsg && (
              <div style={{ padding: "10px 16px", borderRadius: 10, background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", fontWeight: 600, fontSize: "0.88rem", marginBottom: 16 }}>
                ✓ {stockSaveMsg}
              </div>
            )}

            {/* Filter & Search Toolbar */}
            <div className={styles.catalogToolbar}>
              <div className={styles.toolbarGroup}>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    placeholder="Search name, SKU, slug..."
                    className={styles.searchInput}
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setProductPage(1);
                    }}
                  />
                </div>

                <select
                  className={styles.filterSelect}
                  value={productCategoryFilter}
                  onChange={(e) => {
                    setProductCategoryFilter(e.target.value);
                    setProductPage(1);
                  }}
                >
                  <option value="all">All Categories</option>
                  <option value="cat-flower-bouquet">Flower Bouquets</option>
                  <option value="cat-flower-basket">Flower Baskets</option>
                  <option value="cat-cakes">Cakes</option>
                  <option value="cat-table-decor">Table Decor</option>
                  <option value="cat-wreath">Wreaths</option>
                  {categoriesList.filter((c: any) => !["cat-flower-bouquet", "cat-flower-basket", "cat-cakes", "cat-table-decor", "cat-wreath"].includes(c.id)).map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>

                <select
                  className={styles.filterSelect}
                  value={productStatusFilter}
                  onChange={(e) => {
                    setProductStatusFilter(e.target.value);
                    setProductPage(1);
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>

                <select
                  className={styles.filterSelect}
                  value={productStockFilter}
                  onChange={(e) => {
                    setProductStockFilter(e.target.value);
                    setProductPage(1);
                  }}
                >
                  <option value="all">All Stock Levels</option>
                  <option value="instock">In Stock (&gt; 0)</option>
                  <option value="low">Low Stock (≤ 10)</option>
                  <option value="out">Out of Stock (= 0)</option>
                </select>

                <select
                  className={styles.filterSelect}
                  value={productSort}
                  onChange={(e) => setProductSort(e.target.value)}
                >
                  <option value="newest">Sort: Newest Added</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name_asc">Name: A to Z</option>
                  <option value="stock_asc">Stock: Low to High</option>
                </select>
              </div>

              <div style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600 }}>
                Found {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
              </div>
            </div>

            {/* Products Table */}
            <div className={styles.tableResponsive}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
                        No products match the selected filters or search query.
                      </td>
                    </tr>
                  ) : (
                    paginatedProducts.map((p: any) => {
                      const currentVal =
                        stockChanges[p.slug] !== undefined ? stockChanges[p.slug] : p.stock;

                      let mainImg = p.image;
                      if (!mainImg && p.images) {
                        try {
                          mainImg = Array.isArray(p.images) ? p.images[0] : JSON.parse(p.images)[0];
                        } catch {
                          mainImg = typeof p.images === "string" ? p.images : "/images/cat-flower-bouquet-luxe.jpg";
                        }
                      }
                      if (!mainImg) mainImg = "/images/cat-flower-bouquet-luxe.jpg";

                      const isPublished = p.active === 1 || p.status === "published";

                      return (
                        <tr key={p.id}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <img
                                src={mainImg}
                                alt={p.name}
                                className={styles.productThumb}
                                onError={(e: any) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 24 24' fill='%23fdf2f8' stroke='%23db2777' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='100%25' height='100%25' fill='%23fdf2f8' rx='8'/%3E%3Cpath d='M12 3a4 4 0 0 0-4 4c0 2 4 6 4 6s4-4 4-6a4 4 0 0 0-4-4z' fill='%23fce7f3'/%3E%3Cpath d='M12 13v7' stroke='%23be185d'/%3E%3Cpath d='M9 17c1.5 0 3-1.5 3-1.5s1.5 1.5 3 1.5' stroke='%23be185d'/%3E%3C/svg%3E";
                                }}
                              />
                              <div>
                                <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "0.92rem" }}>
                                  {p.name}
                                </div>
                                <div style={{ display: "flex", gap: 8, fontSize: "0.75rem", color: "#64748b", marginTop: 2 }}>
                                  <span>SKU: {p.sku || "—"}</span>
                                  <span>•</span>
                                  <span style={{ fontFamily: "monospace" }}>/{p.slug}</span>
                                </div>
                                {p.badge && (
                                  <span style={{ display: "inline-block", fontSize: "0.68rem", fontWeight: 700, background: "#fdf2f8", color: "#db2777", padding: "1px 6px", borderRadius: 4, marginTop: 3 }}>
                                    {p.badge}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td>
                            <span style={{ display: "inline-block", padding: "4px 8px", borderRadius: 6, background: "#f1f5f9", fontSize: "0.8rem", color: "#334155", fontWeight: 600 }}>
                              {p.categoryLabel || p.category || "Bouquet"}
                            </span>
                          </td>

                          <td>
                            <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.92rem" }}>₹{p.price}</div>
                            {p.originalPrice && p.originalPrice > p.price && (
                              <div style={{ fontSize: "0.75rem", color: "#94a3b8", textDecoration: "line-through" }}>
                                ₹{p.originalPrice}
                              </div>
                            )}
                          </td>

                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
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
                              {stockChanges[p.slug] !== undefined && stockChanges[p.slug] !== p.stock && (
                                <button
                                  type="button"
                                  className={styles.actionBtn}
                                  onClick={() => handleSaveStock(p.slug, currentVal)}
                                  title="Save Stock"
                                >
                                  Save
                                </button>
                              )}
                            </div>
                            {currentVal <= 5 && (
                              <div style={{ fontSize: "0.7rem", color: "#dc2626", fontWeight: 700, marginTop: 2 }}>
                                Low Stock
                              </div>
                            )}
                          </td>

                          <td>
                            <span
                              className={styles.statusBadge}
                              style={{
                                background: isPublished ? "#dcfce7" : p.status === "archived" ? "#f1f5f9" : "#fef3c7",
                                color: isPublished ? "#166534" : p.status === "archived" ? "#64748b" : "#92400e",
                              }}
                            >
                              {p.status || (isPublished ? "published" : "draft")}
                            </span>
                          </td>

                          <td>
                            <div className={styles.actionBtnGroup}>
                              <button
                                type="button"
                                className={styles.iconActionBtn}
                                onClick={() => handleOpenQuickView(p)}
                                title="Quick Preview"
                              >
                                <Eye size={14} />
                                <span>View</span>
                              </button>

                              <button
                                type="button"
                                className={styles.iconActionBtn}
                                onClick={() => handleOpenEditProduct(p)}
                                title="Edit Product"
                              >
                                <Edit size={14} />
                                <span>Edit</span>
                              </button>

                              <button
                                type="button"
                                className={styles.iconActionBtn}
                                onClick={() => handleDuplicateProduct(p.slug || p.id)}
                                title="Duplicate as Draft"
                              >
                                <Copy size={14} />
                              </button>

                              <button
                                type="button"
                                className={styles.iconActionBtn}
                                onClick={() => handleTogglePublishProduct(p)}
                                title={isPublished ? "Unpublish (Move to Draft)" : "Publish to Storefront"}
                                style={{
                                  color: isPublished ? "#059669" : "#d97706",
                                }}
                              >
                                <Globe size={14} />
                              </button>

                              <button
                                type="button"
                                className={`${styles.iconActionBtn} ${styles.deleteActionBtn}`}
                                onClick={() => handleOpenDelete(p)}
                                title="Remove / Archive Product"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredProducts.length > productPageSize && (
              <div className={styles.paginationBar}>
                <div>
                  Showing {(productPage - 1) * productPageSize + 1} to{" "}
                  {Math.min(productPage * productPageSize, filteredProducts.length)} of {filteredProducts.length} items
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button
                    type="button"
                    className={styles.pageBtn}
                    disabled={productPage === 1}
                    onClick={() => setProductPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </button>

                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1e293b", padding: "0 6px" }}>
                    Page {productPage} of {totalProductPages}
                  </span>

                  <button
                    type="button"
                    className={styles.pageBtn}
                    disabled={productPage >= totalProductPages}
                    onClick={() => setProductPage((p) => Math.min(totalProductPages, p + 1))}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: Customization Settings */}
        {activeTab === "customization" && (
          <div className={styles.panelCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2 style={{ fontFamily: "var(--font-serif)", color: "#831843", fontSize: "1.4rem", margin: "0 0 6px" }}>
                  Flower Customization Management
                </h2>
                <p style={{ color: "#64748b", fontSize: "0.88rem", margin: 0 }}>
                  Enable or disable customization for individual products, and configure bouquet sizes, wraps, ribbons, and decorative botanical fillers.
                </p>
              </div>

              <button
                type="button"
                className={styles.submitBtn}
                onClick={handleSaveCustomization}
                disabled={customSaving}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 22px" }}
              >
                <Sparkles size={16} />
                <span>{customSaving ? "Saving..." : "Save Customization Settings"}</span>
              </button>
            </div>

            {customSaveMsg && (
              <div style={{ padding: 14, borderRadius: 10, background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", fontWeight: 600, marginBottom: 20 }}>
                ✓ {customSaveMsg}
              </div>
            )}

            {/* Category Filter Pills */}
            <div className={styles.customCatTabs}>
              {[
                { id: "all", label: "All Flower Types" },
                { id: "chrysanthemums", label: "Chrysanthemums" },
                { id: "roses", label: "Roses" },
                { id: "orchids", label: "Orchids" },
                { id: "gerberas", label: "Gerberas" },
                { id: "sunflowers", label: "Sunflowers" },
                { id: "carnations", label: "Carnations" },
                { id: "lilies", label: "Lilies" },
                { id: "gladiolus", label: "Gladiolus" },
                { id: "rajnigandha", label: "Rajnigandha" },
                { id: "heliconia", label: "Heliconia" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`${styles.customCatPill} ${customCatFilter === cat.id ? styles.customCatPillActive : ""}`}
                  onClick={() => setCustomCatFilter(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Product Customization Toggles Table */}
            <h3 style={{ margin: "20px 0 12px", color: "#831843", fontSize: "1.1rem" }}>
              Customizable Products ({
                products.filter((p) => {
                  if (customCatFilter === "all") return p.category_slug?.includes("flower") || p.category_id?.includes("flower") || p.name?.toLowerCase().includes("flower") || p.name?.toLowerCase().includes("rose") || p.name?.toLowerCase().includes("bouquet");
                  return (p.name + " " + (p.description || "")).toLowerCase().includes(customCatFilter.replace(/s$/, ""));
                }).length
              })
            </h3>

            <div className={styles.tableResponsive}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Base Price (₹)</th>
                    <th>Stock</th>
                    <th>Customization Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products
                    .filter((p) => {
                      if (customCatFilter === "all") return true;
                      const text = (p.name + " " + (p.description || "") + " " + (p.slug || "")).toLowerCase();
                      return text.includes(customCatFilter.replace(/s$/, ""));
                    })
                    .slice(0, 40)
                    .map((p) => {
                      const disabledList: string[] = customConfig.disabledProductIds || [];
                      const isCustomizable = !disabledList.includes(p.id) && !disabledList.includes(p.slug);
                      return (
                        <tr key={p.id}>
                          <td>
                            <div style={{ fontWeight: 600, color: "#111827" }}>{p.name}</div>
                            <div style={{ fontSize: "0.76rem", color: "#64748b" }}>ID: {p.id}</div>
                          </td>
                          <td style={{ fontWeight: 700, color: "#be185d" }}>
                            ₹{p.price}
                          </td>
                          <td>{p.stock} in stock</td>
                          <td>
                            <span className={`${styles.statusBadge} ${isCustomizable ? styles.statusDelivered : styles.statusCancelled}`}>
                              {isCustomizable ? "Customization Enabled" : "Disabled"}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className={`${styles.toggleBtn} ${isCustomizable ? styles.toggleDisabled : styles.toggleEnabled}`}
                              onClick={() => handleToggleProductCustomizable(p.id)}
                            >
                              {isCustomizable ? "Disable" : "Enable"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Global Customization Charges Configuration */}
            <h3 style={{ margin: "36px 0 14px", color: "#831843", fontSize: "1.1rem" }}>
              Customization Options &amp; Extra Charges (₹)
            </h3>

            <div className={styles.customPriceGrid}>
              {/* Bouquet Sizes */}
              <div className={styles.customPriceCard}>
                <h4 style={{ margin: "0 0 10px", color: "#831843", fontSize: "0.95rem" }}>Bouquet Sizes</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {customConfig.sizes?.map((size: any, idx: number) => (
                    <div key={size.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
                      <span>{size.name}</span>
                      <input
                        type="number"
                        min="0"
                        style={{ width: 80, padding: "4px 8px", borderRadius: 6, border: "1px solid #cbd5e1", textAlign: "right" }}
                        value={size.extraPrice}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setCustomConfig((prev: any) => {
                            const nextSizes = [...prev.sizes];
                            nextSizes[idx] = { ...nextSizes[idx], extraPrice: val };
                            return { ...prev, sizes: nextSizes };
                          });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Wrapping Paper */}
              <div className={styles.customPriceCard}>
                <h4 style={{ margin: "0 0 10px", color: "#831843", fontSize: "0.95rem" }}>Luxury Wrapping Papers</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {customConfig.wrappingPapers?.map((wrap: any, idx: number) => (
                    <div key={wrap.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
                      <span style={{ maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{wrap.name}</span>
                      <input
                        type="number"
                        min="0"
                        style={{ width: 80, padding: "4px 8px", borderRadius: 6, border: "1px solid #cbd5e1", textAlign: "right" }}
                        value={wrap.extraPrice}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setCustomConfig((prev: any) => {
                            const nextWraps = [...prev.wrappingPapers];
                            nextWraps[idx] = { ...nextWraps[idx], extraPrice: val };
                            return { ...prev, wrappingPapers: nextWraps };
                          });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Ribbon Colors */}
              <div className={styles.customPriceCard}>
                <h4 style={{ margin: "0 0 10px", color: "#831843", fontSize: "0.95rem" }}>Satin Ribbon Accents</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {customConfig.ribbonColors?.map((rib: any, idx: number) => (
                    <div key={rib.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 12, height: 12, borderRadius: "50%", background: rib.colorCode, display: "inline-block" }} />
                        {rib.name.replace(" Ribbon", "")}
                      </span>
                      <input
                        type="number"
                        min="0"
                        style={{ width: 80, padding: "4px 8px", borderRadius: 6, border: "1px solid #cbd5e1", textAlign: "right" }}
                        value={rib.extraPrice}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setCustomConfig((prev: any) => {
                            const nextRib = [...prev.ribbonColors];
                            nextRib[idx] = { ...nextRib[idx], extraPrice: val };
                            return { ...prev, ribbonColors: nextRib };
                          });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Botanical Decorations */}
              <div className={styles.customPriceCard}>
                <h4 style={{ margin: "0 0 10px", color: "#831843", fontSize: "0.95rem" }}>Botanical Fillers</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {customConfig.decorations?.map((dec: any, idx: number) => (
                    <div key={dec.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
                      <span style={{ maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{dec.name.split(" (")[0]}</span>
                      <input
                        type="number"
                        min="0"
                        style={{ width: 80, padding: "4px 8px", borderRadius: 6, border: "1px solid #cbd5e1", textAlign: "right" }}
                        value={dec.extraPrice}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setCustomConfig((prev: any) => {
                            const nextDec = [...prev.decorations];
                            nextDec[idx] = { ...nextDec[idx], extraPrice: val };
                            return { ...prev, decorations: nextDec };
                          });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
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
          <DeliveryManager />
        )}

        {/* TAB 6: Categories */}
        {activeTab === "categories" && (
          <CategoryManager categories={categoriesList} onRefresh={fetchAdminData} />
        )}

        {/* TAB 7: Media Library */}
        {activeTab === "media" && (
          <MediaLibrary />
        )}

        {/* TAB 8: Store Branding */}
        {activeTab === "branding" && (
          <StoreBrandingManager />
        )}

        {/* TAB 9: Homepage CMS */}
        {activeTab === "homepage" && (
          <HomepageManager />
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
          </div>
        </div>

        {/* Modals for Product Management */}
        <ProductFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          product={selectedProductForEdit}
          categories={categoriesList.length > 0 ? categoriesList : [
            { id: "cat-flower-bouquet", name: "Flower Bouquet", slug: "flower-bouquet" },
            { id: "cat-flower-basket", name: "Flower Basket", slug: "flower-basket" },
            { id: "cat-cakes", name: "Cakes", slug: "cakes" },
            { id: "cat-table-decor", name: "Table Decor", slug: "table-decor" },
            { id: "cat-wreath", name: "Wreath", slug: "wreath" },
          ]}
          onSave={handleCreateOrUpdateProduct}
        />

        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          product={selectedProductForDelete}
          onConfirm={handleConfirmDelete}
        />

        <ProductQuickViewModal
          isOpen={isQuickViewOpen}
          onClose={() => setIsQuickViewOpen(false)}
          product={selectedProductForQuickView}
          onEdit={handleOpenEditProduct}
          onDuplicate={handleDuplicateProduct}
        />
      </main>

      <Footer />
    </div>
  );
}
