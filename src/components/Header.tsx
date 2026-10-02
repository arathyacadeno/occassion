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
  Package,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

interface HeaderProps {
  isDrawerOpen?: boolean;
  onToggleDrawer?: (open: boolean) => void;
  onSelectSlide?: (index: number) => void;
  currentSlide?: number;
}

/* Mega dropdown content, kept as data so the JSX stays short */
const FLOWER_COLUMNS = [
  {
    title: "By Type",
    items: [
      { href: "/flowers/roses", label: "Roses", Icon: Flower2 },
      { href: "/flowers/bouquets", label: "Bouquets", Icon: Sparkles },
      { href: "/flowers/tulips", label: "Tulips", Icon: Flower },
      { href: "/flowers/sunflowers", label: "Sunflowers", Icon: Sun },
      { href: "/flowers/lilies", label: "Lilies", Icon: Feather },
    ],
  },
  {
    title: "By Occasion",
    items: [
      { href: "/flowers/anniversary", label: "Anniversary", Icon: Heart },
      { href: "/flowers/birthday", label: "Birthday", Icon: Cake },
      { href: "/flowers/wedding", label: "Wedding", Icon: Gem },
      { href: "/flowers/mothers-day", label: "Mother's Day", Icon: Gift },
      { href: "/flowers/congratulations", label: "Congratulations", Icon: PartyPopper },
    ],
  },
  {
    title: "By Color",
    items: [
      { href: "/flowers/pink-flowers", label: "Pink Flowers", Icon: Circle, color: "colorIconPink" },
      { href: "/flowers/white-flowers", label: "White Flowers", Icon: Circle, color: "colorIconWhite" },
      { href: "/flowers/red-flowers", label: "Red Flowers", Icon: Circle, color: "colorIconRed" },
      { href: "/flowers/purple-flowers", label: "Purple Flowers", Icon: Circle, color: "colorIconPurple" },
      { href: "/flowers/yellow-flowers", label: "Yellow Flowers", Icon: Circle, color: "colorIconYellow" },
    ],
  },
] as const;

export default function Header({
  isDrawerOpen: controlledDrawerOpen,
  onToggleDrawer,
  onSelectSlide,
}: HeaderProps) {
  const pathname = usePathname();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [internalDrawerOpen, setInternalDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModal, setActiveModal] = useState<"cart" | "signin" | null>(null);

  const [flowersHovered, setFlowersHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [profileHovered, setProfileHovered] = useState(false);
  const profileTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const handleProfileEnter = () => {
    if (profileTimeoutRef.current) {
      clearTimeout(profileTimeoutRef.current);
      profileTimeoutRef.current = null;
    }
    setProfileHovered(true);
  };

  const handleProfileLeave = () => {
    profileTimeoutRef.current = setTimeout(() => {
      setProfileHovered(false);
    }, 180);
  };

  // Close menus on page change
  useEffect(() => {
    setFlowersHovered(false);
    setProfileHovered(false);
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      if (profileTimeoutRef.current) clearTimeout(profileTimeoutRef.current);
    };
  }, []);

  // Section active states: active ONLY when on the Home page and viewing/clicking the section
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Smooth scroll to a home page section
  const handleSectionNav = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string,
    sectionKey?: string
  ) => {
    if (pathname === "/") {
      e.preventDefault();
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", `/#${targetId}`);
        if (sectionKey) {
          setActiveSection(sectionKey);
        }
      }
    }
  };

  // If landing on "/" from another page with a hash in URL (e.g. /#highlights), scroll to it
  useEffect(() => {
    if (pathname === "/" && typeof window !== "undefined" && window.location.hash) {
      const hashId = window.location.hash.replace("#", "");
      const targetEl = document.getElementById(hashId);
      if (targetEl) {
        const timer = setTimeout(() => {
          targetEl.scrollIntoView({ behavior: "smooth" });
          if (hashId === "shop-by-flowers" || hashId === "flower") setActiveSection("flower");
          else if (hashId === "cakes" || hashId === "categories") setActiveSection("cakes");
          else if (hashId === "occasions") setActiveSection("occasions");
          else if (hashId === "highlights") setActiveSection("highlights");
        }, 120);
        return () => clearTimeout(timer);
      }
    }
  }, [pathname]);

  // Scroll spy: tracks active section ONLY when on the Home page
  useEffect(() => {
    if (pathname !== "/") {
      setActiveSection(null);
      return;
    }

    const sections = [
      { id: "cakes", key: "cakes", fallbackId: "categories" },
      { id: "occasions", key: "occasions" },
      { id: "shop-by-flowers", key: "flower" },
      { id: "highlights", key: "highlights" },
    ];

    const handleScroll = () => {
      // If at top of page (hero), no navbar item is highlighted
      if (window.scrollY < 200) {
        setActiveSection(null);
        return;
      }

      const scrollAnchor = window.scrollY + window.innerHeight * 0.35;
      let matchedSection: string | null = null;

      for (const section of sections) {
        const el = document.getElementById(section.id) || (section.fallbackId ? document.getElementById(section.fallbackId) : null);
        if (el) {
          const rect = el.getBoundingClientRect();
          const top = rect.top + window.scrollY;
          const height = rect.height;
          if (scrollAnchor >= top && scrollAnchor < top + height) {
            matchedSection = section.key;
            break;
          }
        }
      }

      setActiveSection(matchedSection);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname]);

  // Active flags: ONLY true when on the home page ('/') and corresponding section is active
  const isHomePage = pathname === "/";
  const isFlowerActive = isHomePage && activeSection === "flower";
  const isCakesActive = isHomePage && activeSection === "cakes";
  const isSpecialOccasionsActive = isHomePage && activeSection === "occasions";
  const isHighlightsActive = isHomePage && activeSection === "highlights";

  const isDrawerOpen =
    controlledDrawerOpen !== undefined ? controlledDrawerOpen : internalDrawerOpen;

  const setDrawerOpen = (open: boolean) => {
    if (onToggleDrawer) {
      onToggleDrawer(open);
    } else {
      setInternalDrawerOpen(open);
    }
  };

  const scrollToHighlightsOr = (fallbackUrl: string) => {
    const highlightEl = document.getElementById("highlights");
    if (highlightEl) {
      highlightEl.scrollIntoView({ behavior: "smooth" });
    } else if (typeof window !== "undefined") {
      window.location.href = fallbackUrl;
    }
  };

  const handleNavCategory = (categoryName: string, slideIndex?: number) => {
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
      scrollToHighlightsOr("/table-arrangements");
    } else if (categoryName === "Car decorations") {
      scrollToHighlightsOr("/car-decorations");
    } else if (categoryName === "Church arrangements") {
      scrollToHighlightsOr("/church-arrangements");
    } else if (categoryName === "Flower baskets & garlands") {
      scrollToHighlightsOr("/garlands-and-baskets");
    } else if (categoryName === "Contact & Location") {
      setDrawerOpen(true);
    }
  };

  const handleSearchSubmit = (term: string) => {
    const q = term.toLowerCase().trim();
    if (!q) return;

    if (q.includes("rose")) {
      window.location.href = "/flowers/roses";
    } else if (q.includes("tulip")) {
      window.location.href = "/flowers/tulips";
    } else if (q.includes("sunflower")) {
      window.location.href = "/flowers/sunflowers";
    } else if (q.includes("lilies") || q.includes("lily")) {
      window.location.href = "/flowers/lilies";
    } else if (q.includes("bouquet") || q.includes("flower")) {
      window.location.href = "/flowers/bouquets";
    } else if (q.includes("car")) {
      handleNavCategory("Car decorations", 1);
    } else if (q.includes("church") || q.includes("altar")) {
      handleNavCategory("Church arrangements", 1);
    } else if (q.includes("table") || q.includes("centerpiece")) {
      handleNavCategory("Table arrangements", 1);
    } else if (q.includes("garland") || q.includes("basket") || q.includes("varmala")) {
      handleNavCategory("Flower baskets & garlands", 1);
    } else if (q.includes("cake")) {
      window.open(
        "https://wa.me/918606464700?text=Hello%20Occassions,%20I%20would%20like%20to%20order%20a%20fresh%20celebration%20cake.",
        "_blank",
        "noopener,noreferrer"
      );
    } else if (
      q.includes("contact") ||
      q.includes("phone") ||
      q.includes("location") ||
      q.includes("address")
    ) {
      setDrawerOpen(true);
    } else {
      window.location.href = "/flowers/all";
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

  const drawerSlideBtnStyle: React.CSSProperties = {
    textAlign: "left",
    background: "none",
    border: "none",
    cursor: "pointer",
    width: "100%",
  };

  const drawerHeadingStyle: React.CSSProperties = {
    fontFamily: "var(--font-sans)",
    fontSize: "0.72rem",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "#888",
    marginBottom: 12,
  };

  return (
    <>
      <header className={styles.headerWrapper} role="banner">
        <div className={styles.navbarContainer}>
          {/* Left: logo */}
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

          {/* Center: navigation */}
          <nav className={styles.centerNav} aria-label="Main Navigation">
            <Link
              href="/#shop-by-flowers"
              onClick={(e) => handleSectionNav(e, "shop-by-flowers", "flower")}
              className={`${styles.centerNavLink} ${isFlowerActive ? styles.activeNavLink : ""
                }`}
            >
              Flower
            </Link>

            <Link
              href="/#cakes"
              onClick={(e) => handleSectionNav(e, "cakes", "cakes")}
              className={`${styles.centerNavLink} ${isCakesActive ? styles.activeNavLink : ""
                }`}
            >
              Cakes
            </Link>

            <Link
              href="/#occasions"
              onClick={(e) => handleSectionNav(e, "occasions", "occasions")}
              className={`${styles.centerNavLink} ${isSpecialOccasionsActive ? styles.activeNavLink : ""
                }`}
            >
              Special Occasions
            </Link>

            <Link
              href="/#highlights"
              onClick={(e) => handleSectionNav(e, "highlights", "highlights")}
              className={`${styles.centerNavLink} ${isHighlightsActive ? styles.activeNavLink : ""
                }`}
            >
              Our highlights
            </Link>
          </nav>

          {/* Right: search + action icons */}
          <div className={styles.rightSection}>
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
                placeholder="Search flowers, cakes..."
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

            <div className={styles.actionsGroup}>


              <Link
                href="/cart"
                className={styles.iconBtn}
                aria-label="View Shopping Cart"
                title="Shopping Cart"
              >
                <div className={styles.cartIconWrap}>
                  <ShoppingCart size={21} strokeWidth={1.8} />
                  {cartCount > 0 && (
                    <span className={styles.cartBadge}>{cartCount}</span>
                  )}
                </div>
              </Link>

              <Link
                href="/wishlist"
                className={styles.iconBtn}
                aria-label="View Wishlist"
                title="Wishlist"
              >
                <div className={styles.cartIconWrap}>
                  <Heart size={21} strokeWidth={1.8} />
                  {wishlistCount > 0 && (
                    <span className={styles.cartBadge}>{wishlistCount}</span>
                  )}
                </div>
              </Link>

              <button
                className={styles.mobileMenuBtn}
                onClick={() => setDrawerOpen(true)}
                type="button"
                aria-label="Open mobile navigation"
                title="Menu"
              >
                <Menu size={22} strokeWidth={1.8} />
              </button>
              <div
                className={styles.profileWrapper}
                onMouseEnter={handleProfileEnter}
                onMouseLeave={handleProfileLeave}
              >
                <button
                  className={`${styles.iconBtn} ${profileHovered ? styles.activeProfileBtn : ""
                    }`}
                  onClick={() => setProfileHovered((prev) => !prev)}
                  type="button"
                  aria-label="Profile Account"
                  title="Profile / Account"
                  aria-expanded={profileHovered}
                >
                  <User size={21} strokeWidth={1.8} />
                </button>

                {profileHovered && (
                  <div className={styles.profileDropdown} role="menu">
                    <div className={styles.profileDropdownHeader}>
                      <div className={styles.profileAvatarIcon}>
                        <User size={16} />
                      </div>
                      <div className={styles.profileHeaderText}>
                        <span className={styles.profileWelcomeLabel}>Welcome</span>
                        <span className={styles.profileUserLabel}>Flower Boutique</span>
                      </div>
                    </div>

                    <div className={styles.profileDivider} />

                    <div className={styles.profileMenuList}>
                      <Link
                        href="/orders"
                        className={styles.profileMenuItem}
                        onClick={() => setProfileHovered(false)}
                        role="menuitem"
                      >
                        <Package size={17} className={styles.profileMenuIcon} />
                        <span>My Orders</span>
                      </Link>

                      <button
                        type="button"
                        className={styles.profileMenuItem}
                        onClick={() => {
                          setProfileHovered(false);
                          setActiveModal("signin");
                        }}
                        role="menuitem"
                      >
                        <User size={17} className={styles.profileMenuIcon} />
                        <span>Profile</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Cart modal */}
      {activeModal === "cart" && (
        <div className={styles.modalBackdrop} onClick={() => setActiveModal(null)}>
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
              <h4 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 6 }}>
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

              <div style={{ marginTop: 16, fontSize: "0.78rem", color: "#64748b" }}>
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

      {/* Sign in modal */}
      {activeModal === "signin" && (
        <div className={styles.modalBackdrop} onClick={() => setActiveModal(null)}>
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
              By continuing, you agree to Occassions Terms of Service &amp; Privacy
              Policy. Fast checkout for all floral arrangements.
            </div>
          </div>
        </div>
      )}

      {/* Slide-out side drawer */}
      <div
        className={`${styles.drawerOverlay} ${isDrawerOpen ? styles.drawerOpen : ""}`}
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

          <h4 style={drawerHeadingStyle}>Menu</h4>

          <ul className={styles.drawerNavList}>
            <li>
              <Link
                href="/#shop-by-flowers"
                className={`${styles.drawerNavLink} ${isFlowerActive ? styles.activeNavLink : ""}`}
                onClick={(e) => {
                  handleSectionNav(e, "shop-by-flowers", "flower");
                  setDrawerOpen(false);
                }}
              >
                Flower
              </Link>
            </li>
            <li>
              <Link
                href="/#cakes"
                className={`${styles.drawerNavLink} ${isCakesActive ? styles.activeNavLink : ""}`}
                onClick={(e) => {
                  handleSectionNav(e, "cakes", "cakes");
                  setDrawerOpen(false);
                }}
              >
                Cakes
              </Link>
            </li>
            <li>
              <Link
                href="/#occasions"
                className={`${styles.drawerNavLink} ${isSpecialOccasionsActive ? styles.activeNavLink : ""}`}
                onClick={(e) => {
                  handleSectionNav(e, "occasions", "occasions");
                  setDrawerOpen(false);
                }}
              >
                Special Occasions
              </Link>
            </li>
            <li>
              <Link
                href="/#highlights"
                className={`${styles.drawerNavLink} ${isHighlightsActive ? styles.activeNavLink : ""}`}
                onClick={(e) => {
                  handleSectionNav(e, "highlights", "highlights");
                  setDrawerOpen(false);
                }}
              >
                Our highlights
              </Link>
            </li>
          </ul>

          <div className={styles.drawerDivider} />

          <h4 style={drawerHeadingStyle}>Floral Showcase Navigation</h4>

          <ul className={styles.drawerNavList}>
            {[
              "01. Everything You Need (Bridal)",
              "02. Perfect Choice (Hydrangea)",
              "03. For Every Occasion (Roses)",
            ].map((label, i) => (
              <li key={label}>
                <button
                  className={styles.drawerNavLink}
                  onClick={() => {
                    if (onSelectSlide) onSelectSlide(i);
                    setDrawerOpen(false);
                  }}
                  style={drawerSlideBtnStyle}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>

          <div className={styles.drawerDivider} />

          <h4 style={drawerHeadingStyle}>Our Specialist Services</h4>

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