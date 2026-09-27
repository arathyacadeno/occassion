"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./Header.module.css";
import { Search, ShoppingCart, User, Menu, X, Phone, Check } from "lucide-react";
import OccassionsLogo from "./OccassionsLogo";

interface HeaderProps {
  isDrawerOpen?: boolean;
  onToggleDrawer?: (open: boolean) => void;
  onSelectSlide?: (index: number) => void;
  currentSlide?: number;
}

export default function Header({
  isDrawerOpen: controlledDrawerOpen,
  onToggleDrawer,
  onSelectSlide,
  currentSlide = 0,
}: HeaderProps) {
  const [internalDrawerOpen, setInternalDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<"cart" | "signin" | null>(null);
  const [activeCategory, setActiveCategory] = useState("Home");

  const searchContainerRef = useRef<HTMLDivElement>(null);

  const isDrawerOpen =
    controlledDrawerOpen !== undefined ? controlledDrawerOpen : internalDrawerOpen;

  const setDrawerOpen = (open: boolean) => {
    if (onToggleDrawer) {
      onToggleDrawer(open);
    } else {
      setInternalDrawerOpen(open);
    }
  };

  // Close search on click outside or Escape
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleNavCategory = (categoryName: string, slideIndex?: number) => {
    setActiveCategory(categoryName);
    if (slideIndex !== undefined && onSelectSlide) {
      onSelectSlide(slideIndex);
    }
    if (categoryName === "Home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (
      categoryName === "Flower baskets & garlands" ||
      categoryName === "Church arrangements" ||
      categoryName === "Table arrangements" ||
      categoryName === "Car decorations"
    ) {
      const highlightEl = document.getElementById("highlights");
      if (highlightEl) {
        highlightEl.scrollIntoView({ behavior: "smooth" });
      }
    } else if (categoryName === "Contact & Location") {
      setDrawerOpen(true);
    }
  };

  const handleSearchSubmit = (term: string) => {
    const q = term.toLowerCase().trim();
    if (!q) return;

    if (q.includes("car")) {
      handleNavCategory("Car decorations", 1);
    } else if (q.includes("church") || q.includes("altar")) {
      handleNavCategory("Church arrangements", 1);
    } else if (q.includes("table") || q.includes("centerpiece")) {
      handleNavCategory("Table arrangements", 1);
    } else if (q.includes("garland") || q.includes("basket") || q.includes("varmala")) {
      handleNavCategory("Flower baskets & garlands", 1);
    } else if (q.includes("bouquet") || q.includes("flower") || q.includes("rose")) {
      handleNavCategory("Bouquet", 0);
    } else if (q.includes("cake")) {
      handleNavCategory("Cakes", 0);
    } else if (q.includes("contact") || q.includes("phone") || q.includes("location") || q.includes("address")) {
      setDrawerOpen(true);
    } else {
      const highlightEl = document.getElementById("highlights");
      if (highlightEl) {
        highlightEl.scrollIntoView({ behavior: "smooth" });
      }
    }
    setIsSearchOpen(false);
  };

  return (
    <>
      <header className={styles.headerWrapper} role="banner">
        {/* Tier 1: Main Header Bar (Logo, Inline Search, Action Icons in SAME navbar) */}
        <div className={styles.topTier}>
          {/* Brand Logo - Official Occassions Master Logo */}
          <div
            className={styles.brandArea}
            onClick={() => handleNavCategory("Home", 0)}
            aria-label="Occassions - Do it with flowers"
          >
            <img
              src="/images/occasions-logo.png"
              alt="Occassions - Do it with flowers"
              className={styles.brandMasterLogo}
            />
          </div>

          {/* Inline Search in the SAME navbar row */}
          {isSearchOpen && (
            <div className={styles.inlineSearchContainer} ref={searchContainerRef}>
              <Search size={18} className={styles.inlineSearchIcon} />
              <input
                type="text"
                className={styles.inlineSearchInput}
                placeholder="Search for flowers, cakes, gifts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                aria-label="Search flowers, bouquets and gifts"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    handleSearchSubmit(searchQuery.trim());
                  }
                }}
              />
              <button
                type="button"
                className={styles.inlineSearchCloseBtn}
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery("");
                }}
                aria-label="Close search"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {/* Actions Group: Search, Shopping Cart (with orange-red '0' badge), User, Menu */}
          <div className={styles.actionsGroup}>
            {/* 1. Search Icon Button (visible when search is closed) */}
            {!isSearchOpen && (
              <button
                className={styles.iconActionBtn}
                onClick={() => setIsSearchOpen(true)}
                type="button"
                aria-label="Search"
                title="Search"
              >
                <Search size={22} strokeWidth={1.8} />
              </button>
            )}

            {/* 2. Shopping Cart (matching Image 2 with orange-red badge) */}
            <button
              className={styles.iconActionBtn}
              onClick={() => setActiveModal("cart")}
              type="button"
              aria-label="View Shopping Cart"
              title="Shopping Cart"
            >
              <div className={styles.cartIconWrap}>
                <ShoppingCart size={22} strokeWidth={1.8} />
                <span className={styles.cartBadge}>0</span>
              </div>
            </button>

            {/* 3. User / Account (matching Image 2) */}
            <button
              className={styles.iconActionBtn}
              onClick={() => setActiveModal("signin")}
              type="button"
              aria-label="Sign In to your account"
              title="Account"
            >
              <User size={22} strokeWidth={1.8} />
            </button>

            {/* 4. Menu / More */}
            <button
              className={styles.iconActionBtn}
              onClick={() => setDrawerOpen(true)}
              type="button"
              aria-label="More options & boutique info"
              title="Menu"
            >
              <Menu size={22} strokeWidth={1.8} />
            </button>
          </div>
        </div>

        {/* Tier 2: Horizontal Category Navbar ("then show navbar") */}
        <nav
          className={styles.categoryNavbar}
          aria-label="Category Navigation"
        >
          <button
            className={`${styles.navCategoryLink} ${
              activeCategory === "Home" && currentSlide === 0
                ? styles.navCategoryActive
                : ""
            }`}
            onClick={() => handleNavCategory("Home", 0)}
          >
            Home
          </button>

          <button
            className={`${styles.navCategoryLink} ${
              activeCategory === "Bouquet"
                ? styles.navCategoryActive
                : ""
            }`}
            onClick={() => handleNavCategory("Bouquet", 0)}
          >
            Bouquet
          </button>

          <button
            className={`${styles.navCategoryLink} ${
              activeCategory === "Cakes"
                ? styles.navCategoryActive
                : ""
            }`}
            onClick={() => handleNavCategory("Cakes", 0)}
          >
            Cakes
          </button>

          <button
            className={`${styles.navCategoryLink} ${
              activeCategory === "Flower baskets & garlands"
                ? styles.navCategoryActive
                : ""
            }`}
            onClick={() => handleNavCategory("Flower baskets & garlands", 1)}
          >
            Flower baskets &amp; garlands
          </button>

          <button
            className={`${styles.navCategoryLink} ${
              activeCategory === "Church arrangements"
                ? styles.navCategoryActive
                : ""
            }`}
            onClick={() => handleNavCategory("Church arrangements", 1)}
          >
            Church arrangements
          </button>

          <button
            className={`${styles.navCategoryLink} ${
              activeCategory === "Table arrangements"
                ? styles.navCategoryActive
                : ""
            }`}
            onClick={() => handleNavCategory("Table arrangements", 2)}
          >
            Table arrangements
          </button>

          <button
            className={`${styles.navCategoryLink} ${
              activeCategory === "Car decorations"
                ? styles.navCategoryActive
                : ""
            }`}
            onClick={() => handleNavCategory("Car decorations", 2)}
          >
            Car decorations
          </button>

          <button
            className={`${styles.navCategoryLink} ${
              activeCategory === "Contact & Location"
                ? styles.navCategoryActive
                : ""
            }`}
            onClick={() => handleNavCategory("Contact & Location")}
          >
            Contact &amp; Location
          </button>
        </nav>
      </header>



      {/* Modal 3: Cart Modal */}
      {activeModal === "cart" && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setActiveModal(null)}
        >
          <div
            className={styles.modalBox}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="cart-modal-title"
          >
            <div className={styles.modalHeader}>
              <h3 id="cart-modal-title" className={styles.modalTitle}>
                Your Flower Basket
              </h3>
              <button
                className={styles.modalCloseBtn}
                onClick={() => setActiveModal(null)}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ textAlign: "center", padding: "24px 10px" }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "#f0fdf4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  color: "#105b63",
                  fontSize: "1.8rem",
                }}
              >
                💐
              </div>
              <h4
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                Your cart is empty
              </h4>
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "#64748b",
                  marginBottom: 20,
                  lineHeight: 1.5,
                }}
              >
                Explore our signature bridal bouquets, stage decor packages, and
                same-day fresh flower deliveries in Calicut.
              </p>

              <button
                type="button"
                className={styles.primaryBtn}
                onClick={() => {
                  setActiveModal(null);
                  handleNavCategory("Bridal Bouquets", 0);
                }}
              >
                Explore Floral Collection
              </button>

              <div
                style={{
                  marginTop: 16,
                  fontSize: "0.78rem",
                  color: "#64748b",
                }}
              >
                Or order directly via WhatsApp:{" "}
                <a
                  href="https://wa.me/918606464700"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#105b63", fontWeight: 700 }}
                >
                  +91 8606 464 700
                </a>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Modal 5: Sign In Modal */}
      {activeModal === "signin" && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setActiveModal(null)}
        >
          <div
            className={styles.modalBox}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="signin-modal-title"
          >
            <div className={styles.modalHeader}>
              <h3 id="signin-modal-title" className={styles.modalTitle}>
                Sign In to Occassions
              </h3>
              <button
                className={styles.modalCloseBtn}
                onClick={() => setActiveModal(null)}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert(
                  "Welcome to Occassions! You can now place flower delivery orders across Calicut."
                );
                setActiveModal(null);
              }}
            >
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Mobile Number or Email</label>
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="Enter 10-digit mobile number or email"
                  required
                />
              </div>

              <button type="submit" className={styles.primaryBtn}>
                Get OTP / Continue
              </button>
            </form>

            <div
              style={{
                marginTop: 18,
                fontSize: "0.75rem",
                color: "#64748b",
                textAlign: "center",
                lineHeight: 1.5,
              }}
            >
              By continuing, you agree to Occassions Terms of Service &amp;
              Privacy Policy. Fast checkout for all floral arrangements.
            </div>
          </div>
        </div>
      )}

      {/* Slide-out Side Menu Drawer (Opened by "More" action or Contact) */}
      <div
        className={`${styles.drawerOverlay} ${
          isDrawerOpen ? styles.drawerOpen : ""
        }`}
        onClick={() => setDrawerOpen(false)}
      >
        <aside
          className={styles.drawerPanel}
          onClick={(e) => e.stopPropagation()}
          aria-label="Boutique side drawer"
        >
          <button
            className={styles.drawerCloseBtn}
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
          >
            <X size={26} />
          </button>

          <div className={styles.drawerBrand}>
            <div style={{ marginBottom: 12 }}>
              <img
                src="/images/occasions-logo.png"
                alt="Occassions - Do it with flowers"
                style={{
                  height: 72,
                  width: "auto",
                  maxWidth: 220,
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: "0.75rem",
                color: "#666",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Proprietor: <strong>SREEJESH K.V</strong>
            </div>
          </div>

          <div
            style={{
              background: "#fdf8f5",
              padding: "10px 14px",
              borderRadius: 6,
              border: "1px solid #ebdcd5",
              marginBottom: 20,
              fontSize: "0.75rem",
              color: "#6b332b",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>🎖️</span>
            <span>
              <strong>India Florist Association (ifa)</strong>
              <br />
              Trusted Florist Member
            </span>
          </div>

          <h4
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.72rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#888",
              marginBottom: 12,
            }}
          >
            Floral Showcase Navigation
          </h4>

          <ul className={styles.drawerNavList}>
            <li>
              <button
                className={styles.drawerNavLink}
                onClick={() => {
                  if (onSelectSlide) onSelectSlide(0);
                  setDrawerOpen(false);
                }}
                style={{
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                01. Everything You Need (Bridal)
              </button>
            </li>
            <li>
              <button
                className={styles.drawerNavLink}
                onClick={() => {
                  if (onSelectSlide) onSelectSlide(1);
                  setDrawerOpen(false);
                }}
                style={{
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                02. Perfect Choice (Hydrangea)
              </button>
            </li>
            <li>
              <button
                className={styles.drawerNavLink}
                onClick={() => {
                  if (onSelectSlide) onSelectSlide(2);
                  setDrawerOpen(false);
                }}
                style={{
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                03. For Every Occasion (Roses)
              </button>
            </li>
          </ul>

          <div className={styles.drawerDivider} />

          <h4
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.72rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#888",
              marginBottom: 12,
            }}
          >
            Our Specialist Services
          </h4>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              fontSize: "0.8rem",
              color: "#444",
              marginBottom: 24,
            }}
          >
            <div>▶ Bouquet</div>
            <div>▶ Cakes</div>
            <div>▶ Flower baskets &amp; garlands</div>
            <div>▶ Church arrangements</div>
            <div>▶ Table arrangements</div>
            <div>▶ Car decorations</div>
          </div>

          <div className={styles.drawerDivider} />

          <div className={styles.drawerContact}>
            <p>
              <strong>Shop Address:</strong>
              <br />
              Near Y.M.C.A. Junction, Opp. HDFC Bank,
              <br />
              Kannur Road, Calicut - 1, Kerala, India
            </p>
            <p style={{ marginTop: 12 }}>
              <strong>Mobile &amp; WhatsApp:</strong>
              <br />
              <a
                href="https://wa.me/918606464700"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#105b63", fontWeight: 700 }}
              >
                💬 +91 8606 464 700 (WhatsApp)
              </a>
              <br />
              📞 +91 9447 446 008
            </p>
            <p style={{ marginTop: 10 }}>
              <strong>Office Phone:</strong>
              <br />
              ☎️ 0495 - 4040104
            </p>
            <p style={{ marginTop: 10 }}>
              <strong>Email:</strong>
              <br />
              ✉️ occassions.flowers@gmail.com
            </p>
          </div>

          <div className={styles.drawerSocials}>
            <a
              href="https://wa.me/918606464700"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.drawerSocialIcon}
              aria-label="WhatsApp"
              style={{ color: "#105b63", borderColor: "#105b63" }}
            >
              💬
            </a>
            <a
              href="tel:+918606464700"
              className={styles.drawerSocialIcon}
              aria-label="Phone"
            >
              <Phone size={17} />
            </a>
          </div>
        </aside>
      </div>
    </>
  );
}
