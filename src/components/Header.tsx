"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css";
import {
  Search,
  ShoppingCart,
  User,
  Heart,
  Menu,
  X,
  Phone,
  Check,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Flower2,
  Flower,
  Sun,
  Feather,
  Cake,
  Gem,
  Gift,
  PartyPopper,
  Circle,
} from "lucide-react";
import OccassionsLogo from "./OccassionsLogo";
import { useCart } from "@/context/CartContext";

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
  const pathname = usePathname();
  const { cartCount } = useCart();
  const [internalDrawerOpen, setInternalDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModal, setActiveModal] = useState<"cart" | "signin" | null>(null);
  const [activeCategory, setActiveCategory] = useState("Home");

  const [flowersHovered, setFlowersHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setFlowersHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setFlowersHovered(false);
    }, 180);
  };

  // Close mega menu on page change
  useEffect(() => {
    setFlowersHovered(false);
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  // Flowers is active with soft light-pink pill & pink text
  const isFlowersActive =
    !pathname ||
    pathname === "/" ||
    pathname.startsWith("/table-arrangements") ||
    (!pathname.startsWith("/church-arrangements") && !pathname.startsWith("/cart"));

  const isDrawerOpen =
    controlledDrawerOpen !== undefined ? controlledDrawerOpen : internalDrawerOpen;

  const setDrawerOpen = (open: boolean) => {
    if (onToggleDrawer) {
      onToggleDrawer(open);
    } else {
      setInternalDrawerOpen(open);
    }
  };

  const handleNavCategory = (categoryName: string, slideIndex?: number) => {
    setActiveCategory(categoryName);
    if (slideIndex !== undefined && onSelectSlide) {
      onSelectSlide(slideIndex);
    }
    if (categoryName === "Home") {
      if (typeof window !== "undefined" && window.location.pathname !== "/") {
        window.location.href = "/";
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else if (categoryName === "Table arrangements") {
      const highlightEl = document.getElementById("highlights");
      if (highlightEl) {
        highlightEl.scrollIntoView({ behavior: "smooth" });
      } else if (typeof window !== "undefined") {
        window.location.href = "/table-arrangements";
      }
    } else if (categoryName === "Car decorations") {
      const highlightEl = document.getElementById("highlights");
      if (highlightEl) {
        highlightEl.scrollIntoView({ behavior: "smooth" });
      } else if (typeof window !== "undefined") {
        window.location.href = "/car-decorations";
      }
    } else if (categoryName === "Church arrangements") {
      const highlightEl = document.getElementById("highlights");
      if (highlightEl) {
        highlightEl.scrollIntoView({ behavior: "smooth" });
      } else if (typeof window !== "undefined") {
        window.location.href = "/church-arrangements";
      }
    } else if (categoryName === "Flower baskets & garlands") {
      const highlightEl = document.getElementById("highlights");
      if (highlightEl) {
        highlightEl.scrollIntoView({ behavior: "smooth" });
      } else if (typeof window !== "undefined") {
        window.location.href = "/garlands-and-baskets";
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
  };

  const handleHighlightsClick = (e: React.MouseEvent) => {
    if (typeof window !== "undefined" && window.location.pathname === "/") {
      e.preventDefault();
      const highlightEl = document.getElementById("highlights");
      if (highlightEl) {
        highlightEl.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <>
      <header className={styles.headerWrapper} role="banner">
        <div className={styles.navbarContainer}>
          {/* Logo on the far left */}
          <Link
            href="/"
            className={styles.brandArea}
            aria-label="Occasions - Do it with flowers"
          >
            <img
              src="/images/occasions-logo.png"
              alt="Occasions - Do it with flowers"
              className={styles.brandMasterLogo}
            />
          </Link>

          {/* Navigation items in the center */}
          <nav className={styles.centerNav} aria-label="Main Navigation">
            <div
              className={styles.flowersNavWrapper}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <Link
                href="/table-arrangements"
                className={`${styles.centerNavLink} ${isFlowersActive || flowersHovered ? styles.activeNavLink : ""}`}
                aria-expanded={flowersHovered}
                aria-haspopup="true"
              >
                <span>Flowers</span>
              </Link>

              {/* SHOP FLOWERS 3-Column Mega Dropdown (Clean, Luxury Boutique) */}
              {flowersHovered && (
                <div
                  className={styles.shopFlowersDropdown}
                  role="region"
                  aria-label="Shop Flowers Dropdown"
                >
                  <div className={styles.shopFlowersGrid}>
                    {/* Column 1: By Type */}
                    <div className={styles.shopFlowersCol}>
                      <h4 className={styles.shopFlowersColTitle}>BY TYPE</h4>
                      <div className={styles.shopFlowersDivider} />
                      <ul className={styles.shopFlowersList}>
                        <li>
                          <Link
                            href="/table-arrangements"
                            className={styles.shopFlowersItem}
                            onClick={() => setFlowersHovered(false)}
                          >
                            <Flower2 size={16} strokeWidth={1.75} className={styles.itemIcon} />
                            <span>Roses</span>
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/table-arrangements"
                            className={styles.shopFlowersItem}
                            onClick={() => setFlowersHovered(false)}
                          >
                            <Sparkles size={16} strokeWidth={1.75} className={styles.itemIcon} />
                            <span>Bouquets</span>
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/table-arrangements"
                            className={styles.shopFlowersItem}
                            onClick={() => setFlowersHovered(false)}
                          >
                            <Flower size={16} strokeWidth={1.75} className={styles.itemIcon} />
                            <span>Tulips</span>
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/table-arrangements"
                            className={styles.shopFlowersItem}
                            onClick={() => setFlowersHovered(false)}
                          >
                            <Sun size={16} strokeWidth={1.75} className={styles.itemIcon} />
                            <span>Sunflowers</span>
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/table-arrangements"
                            className={styles.shopFlowersItem}
                            onClick={() => setFlowersHovered(false)}
                          >
                            <Feather size={16} strokeWidth={1.75} className={styles.itemIcon} />
                            <span>Lilies</span>
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* Column 2: By Occasion */}
                    <div className={styles.shopFlowersCol}>
                      <h4 className={styles.shopFlowersColTitle}>BY OCCASION</h4>
                      <div className={styles.shopFlowersDivider} />
                      <ul className={styles.shopFlowersList}>
                        <li>
                          <Link
                            href="/table-arrangements"
                            className={styles.shopFlowersItem}
                            onClick={() => setFlowersHovered(false)}
                          >
                            <Heart size={16} strokeWidth={1.75} className={styles.itemIcon} />
                            <span>Anniversary</span>
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/table-arrangements"
                            className={styles.shopFlowersItem}
                            onClick={() => setFlowersHovered(false)}
                          >
                            <Cake size={16} strokeWidth={1.75} className={styles.itemIcon} />
                            <span>Birthday</span>
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/church-arrangements"
                            className={styles.shopFlowersItem}
                            onClick={() => setFlowersHovered(false)}
                          >
                            <Gem size={16} strokeWidth={1.75} className={styles.itemIcon} />
                            <span>Wedding</span>
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/table-arrangements"
                            className={styles.shopFlowersItem}
                            onClick={() => setFlowersHovered(false)}
                          >
                            <Gift size={16} strokeWidth={1.75} className={styles.itemIcon} />
                            <span>Mother's Day</span>
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/church-arrangements"
                            className={styles.shopFlowersItem}
                            onClick={() => setFlowersHovered(false)}
                          >
                            <PartyPopper size={16} strokeWidth={1.75} className={styles.itemIcon} />
                            <span>Congratulations</span>
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* Column 3: By Color */}
                    <div className={styles.shopFlowersCol}>
                      <h4 className={styles.shopFlowersColTitle}>BY COLOR</h4>
                      <div className={styles.shopFlowersDivider} />
                      <ul className={styles.shopFlowersList}>
                        <li>
                          <Link
                            href="/table-arrangements"
                            className={styles.shopFlowersItem}
                            onClick={() => setFlowersHovered(false)}
                          >
                            <Circle size={15} strokeWidth={2} className={`${styles.itemIcon} ${styles.colorIconPink}`} />
                            <span>Pink Flowers</span>
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/table-arrangements"
                            className={styles.shopFlowersItem}
                            onClick={() => setFlowersHovered(false)}
                          >
                            <Circle size={15} strokeWidth={2} className={`${styles.itemIcon} ${styles.colorIconWhite}`} />
                            <span>White Flowers</span>
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/table-arrangements"
                            className={styles.shopFlowersItem}
                            onClick={() => setFlowersHovered(false)}
                          >
                            <Circle size={15} strokeWidth={2} className={`${styles.itemIcon} ${styles.colorIconRed}`} />
                            <span>Red Flowers</span>
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/table-arrangements"
                            className={styles.shopFlowersItem}
                            onClick={() => setFlowersHovered(false)}
                          >
                            <Circle size={15} strokeWidth={2} className={`${styles.itemIcon} ${styles.colorIconPurple}`} />
                            <span>Purple Flowers</span>
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/table-arrangements"
                            className={styles.shopFlowersItem}
                            onClick={() => setFlowersHovered(false)}
                          >
                            <Circle size={15} strokeWidth={2} className={`${styles.itemIcon} ${styles.colorIconYellow}`} />
                            <span>Yellow Flowers</span>
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* View All Flowers Button */}
                  <div className={styles.shopFlowersFooter}>
                    <Link
                      href="/table-arrangements"
                      className={styles.shopFlowersViewAllBtn}
                      onClick={() => setFlowersHovered(false)}
                    >
                      <span>View All Flowers</span>
                      <ArrowRight size={14} strokeWidth={2} />
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <a
              href="https://wa.me/918606464700?text=Hello%20Occassions,%20I%20would%20like%20to%20order%20a%20fresh%20celebration%20cake."
              target="_blank"
              rel="noopener noreferrer"
              className={styles.centerNavLink}
            >
              Cakes
            </a>
            <Link
              href="/church-arrangements"
              className={`${styles.centerNavLink} ${pathname?.startsWith("/church-arrangements") ? styles.activeNavLink : ""}`}
            >
              Special occasions
            </Link>
            <Link
              href="/#highlights"
              onClick={handleHighlightsClick}
              className={styles.centerNavLink}
            >
              Our highlights
            </Link>
          </nav>

          {/* Right Section: Search bar followed by action icons */}
          <div className={styles.rightSection}>
            {/* Search bar: white background, thin light-gray border, rounded corners, search icon on the left */}
            <form
              className={styles.searchBar}
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  handleSearchSubmit(searchQuery.trim());
                }
              }}
              role="search"
              suppressHydrationWarning
            >
              <Search size={18} strokeWidth={1.8} className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search for flowers, cakes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search for flowers, cakes and gifts"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                suppressHydrationWarning
              />
              {searchQuery && (
                <button
                  type="button"
                  className={styles.searchClearBtn}
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </form>

            {/* Action icons: simple dark outline icons */}
            <div className={styles.actionsGroup}>
              {/* User/Account Icon */}
              <button
                className={styles.iconBtn}
                onClick={() => setActiveModal("signin")}
                type="button"
                aria-label="Profile Account"
                title="Profile / Account"
              >
                <User size={21} strokeWidth={1.8} />
              </button>

              {/* Shopping cart icon with small 2 notification badge */}
              <Link
                href="/cart"
                className={styles.iconBtn}
                aria-label="View Shopping Cart"
                title="Shopping Cart"
              >
                <div className={styles.cartIconWrap}>
                  <ShoppingCart size={21} strokeWidth={1.8} />
                  <span className={styles.cartBadge}>{cartCount > 0 ? cartCount : 2}</span>
                </div>
              </Link>

              {/* Wishlist/Heart Icon */}
              <Link
                href="/table-arrangements#arrangements"
                className={styles.iconBtn}
                aria-label="View Wishlist"
                title="Wishlist"
              >
                <Heart size={21} strokeWidth={1.8} />
              </Link>

              {/* Mobile Menu Hamburger (for smaller screens) */}
              <button
                className={styles.mobileMenuBtn}
                onClick={() => setDrawerOpen(true)}
                type="button"
                aria-label="Open mobile navigation"
                title="Menu"
              >
                <Menu size={22} strokeWidth={1.8} />
              </button>
            </div>
          </div>
        </div>
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
                  autoComplete="off"
                  suppressHydrationWarning
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
            Menu
          </h4>

          <ul className={styles.drawerNavList}>
            <li>
              <Link
                href="/table-arrangements"
                className={styles.drawerNavLink}
                onClick={() => setDrawerOpen(false)}
              >
                Flowers
              </Link>
            </li>
            <li>
              <a
                href="https://wa.me/918606464700?text=Hello%20Occassions,%20I%20would%20like%20to%20order%20a%20fresh%20celebration%20cake."
                target="_blank"
                rel="noopener noreferrer"
                className={styles.drawerNavLink}
                onClick={() => setDrawerOpen(false)}
              >
                Cakes
              </a>
            </li>
            <li>
              <Link
                href="/church-arrangements"
                className={styles.drawerNavLink}
                onClick={() => setDrawerOpen(false)}
              >
                Special occasions
              </Link>
            </li>
            <li>
              <Link
                href="/#highlights"
                className={styles.drawerNavLink}
                onClick={(e) => {
                  handleHighlightsClick(e);
                  setDrawerOpen(false);
                }}
              >
                Our highlights
              </Link>
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
