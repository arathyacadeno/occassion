"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  MapPin,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";

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
  const router = useRouter();
  const { items: cartItems, cartCount, subtotal: cartSubtotal } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, isAuthenticated, isAdmin, login, signup, loginWithGoogle, logout } = useAuth();
  const [internalDrawerOpen, setInternalDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModal, setActiveModal] = useState<"cart" | "signin" | null>(null);

  const [authTab, setAuthTab] = useState<"signin" | "signup">("signin");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Phone OTP flow
  const [phoneFlow, setPhoneFlow] = useState<"idle" | "enter" | "otp">("idle");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [otpResendTimer, setOtpResendTimer] = useState(0);
  const otpTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startOtpTimer = () => {
    setOtpResendTimer(30);
    if (otpTimerRef.current) clearInterval(otpTimerRef.current);
    otpTimerRef.current = setInterval(() => {
      setOtpResendTimer((t) => {
        if (t <= 1) {
          clearInterval(otpTimerRef.current!);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    const cleaned = phoneNumber.replace(/\D/g, "");
    if (cleaned.length < 10) {
      setPhoneError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setPhoneError(null);
    setPhoneLoading(true);
    // Simulate OTP send (replace with real API call)
    await new Promise((r) => setTimeout(r, 1200));
    setPhoneLoading(false);
    setPhoneFlow("otp");
    startOtpTimer();
  };

  const handleVerifyOtp = async () => {
    if (otpValue.length < 4) {
      setPhoneError("Please enter the OTP sent to your number.");
      return;
    }
    setPhoneError(null);
    setPhoneLoading(true);
    // Simulate OTP verify (replace with real API call)
    await new Promise((r) => setTimeout(r, 1200));
    setPhoneLoading(false);
    // For demo: any 4+ digit OTP succeeds
    setActiveModal(null);
    setPhoneFlow("idle");
    setPhoneNumber("");
    setOtpValue("");
  };

  const resetPhoneFlow = () => {
    setPhoneFlow("idle");
    setPhoneNumber("");
    setOtpValue("");
    setPhoneError(null);
    setOtpResendTimer(0);
    if (otpTimerRef.current) clearInterval(otpTimerRef.current);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      if (authTab === "signin") {
        const res = await login(authForm.email, authForm.password);
        if (res.success) {
          setActiveModal(null);
          setAuthForm({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
        } else {
          setAuthError(res.error || "Failed to sign in");
        }
      } else {
        if (authForm.password !== authForm.confirmPassword) {
          setAuthError("Passwords do not match");
          setAuthLoading(false);
          return;
        }
        const res = await signup(authForm);
        if (res.success) {
          setActiveModal(null);
          setAuthForm({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
        } else {
          setAuthError(res.error || "Failed to create account");
        }
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (authLoading) return; // Prevent multiple requests while processing
    setAuthError(null);

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setAuthError("Google Client ID is not configured.");
      return;
    }

    if (typeof window === "undefined" || !(window as any).google?.accounts?.id) {
      setAuthError("Google Services are loading. Please check your connection and try again.");
      return;
    }

    setAuthLoading(true);

    try {
      const google = (window as any).google;
      google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: { credential?: string }) => {
          if (!response || !response.credential) {
            setAuthError("Failed to receive Google credential. Please try again.");
            setAuthLoading(false);
            return;
          }

          try {
            const res = await loginWithGoogle({ credential: response.credential });
            if (res.success) {
              setActiveModal(null);
              router.push("/");
            } else {
              setAuthError(res.error || "Google authentication failed.");
            }
          } catch {
            setAuthError("Authentication request failed. Please try again.");
          } finally {
            setAuthLoading(false);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Prompt account selection
      google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed()) {
          setAuthLoading(false);
          const reason = notification.getNotDisplayedReason();
          console.warn("Google One Tap prompt not displayed:", reason);
          setAuthError("Unable to open Google prompt. Please check your browser popup/cookie settings.");
        } else if (notification.isSkippedMoment()) {
          setAuthLoading(false);
          const reason = notification.getSkippedReason();
          if (reason !== "user_cancel") {
            console.warn("Google prompt skipped:", reason);
          }
        } else if (notification.isDismissedMoment()) {
          setAuthLoading(false);
          const reason = notification.getDismissedReason();
          if (reason === "credential_returned") {
            // Handled in callback
          } else {
            console.log("Google prompt dismissed:", reason);
          }
        }
      });
    } catch (err: any) {
      setAuthLoading(false);
      setAuthError(err?.message || "Google authentication could not be initialized.");
    }
  };

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
    const handleShowSignin = () => {
      setAuthTab("signin");
      setAuthError(null);
      setActiveModal("signin");
    };
    window.addEventListener("show-signin-modal", handleShowSignin);

    return () => {
      window.removeEventListener("show-signin-modal", handleShowSignin);
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
                        <span className={styles.profileWelcomeLabel}>
                          {isAuthenticated ? "Welcome back," : "Welcome"}
                        </span>
                        <span className={styles.profileUserLabel}>
                          {isAuthenticated ? (user?.name || "Customer") : "Sign In / Register"}
                        </span>
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

                      <Link
                        href="/track-order"
                        className={styles.profileMenuItem}
                        onClick={() => setProfileHovered(false)}
                        role="menuitem"
                      >
                        <MapPin size={17} className={styles.profileMenuIcon} />
                        <span>Track Order</span>
                      </Link>

                      {isAuthenticated ? (
                        <>
                          <Link
                            href="/profile"
                            className={styles.profileMenuItem}
                            onClick={() => setProfileHovered(false)}
                            role="menuitem"
                          >
                            <User size={17} className={styles.profileMenuIcon} />
                            <span>My Profile & Addresses</span>
                          </Link>

                          {isAdmin && (
                            <Link
                              href="/admin"
                              className={styles.profileMenuItem}
                              onClick={() => setProfileHovered(false)}
                              role="menuitem"
                            >
                              <ShieldCheck size={17} className={styles.profileMenuIcon} />
                              <span>Admin Panel</span>
                            </Link>
                          )}

                          <button
                            type="button"
                            className={styles.profileMenuItem}
                            onClick={async () => {
                              setProfileHovered(false);
                              await logout();
                              router.refresh();
                            }}
                            role="menuitem"
                            style={{ color: "#e11d48" }}
                          >
                            <LogOut size={17} className={styles.profileMenuIcon} style={{ color: "#e11d48" }} />
                            <span>Sign Out</span>
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className={styles.profileMenuItem}
                          onClick={() => {
                            setProfileHovered(false);
                            setAuthTab("signin");
                            setAuthError(null);
                            setActiveModal("signin");
                          }}
                          role="menuitem"
                        >
                          <User size={17} className={styles.profileMenuIcon} />
                          <span>Sign In / Register</span>
                        </button>
                      )}
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

            {cartItems.length === 0 ? (
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
            ) : (
              <div style={{ padding: "16px 4px" }}>
                <div
                  style={{
                    maxHeight: "260px",
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    paddingRight: "4px",
                    marginBottom: "16px",
                  }}
                >
                  {cartItems.map((item, idx) => (
                    <div
                      key={`${item.bouquet.id}-${idx}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "10px",
                        borderRadius: "12px",
                        background: "#fff1f2",
                        border: "1px solid #ffe4e6",
                      }}
                    >
                      <img
                        src={item.bouquet.image}
                        alt={item.bouquet.name}
                        style={{
                          width: 48,
                          height: 48,
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: "0.88rem",
                            color: "#1e293b",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {item.bouquet.name}
                        </div>
                        <div style={{ fontSize: "0.76rem", color: "#64748b" }}>
                          Qty: {item.quantity} • ₹{item.bouquet.price.toLocaleString("en-IN")}
                        </div>
                      </div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: "0.92rem",
                          color: "#be185d",
                        }}
                      >
                        ₹{(item.bouquet.price * item.quantity).toLocaleString("en-IN")}
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 4px",
                    borderTop: "1px dashed #e2e8f0",
                    marginBottom: "14px",
                  }}
                >
                  <span style={{ fontWeight: 600, color: "#334155", fontSize: "0.95rem" }}>
                    Subtotal
                  </span>
                  <span style={{ fontWeight: 800, color: "#be185d", fontSize: "1.1rem" }}>
                    ₹{cartSubtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveModal(null);
                      router.push("/cart");
                    }}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "10px",
                      border: "1px solid #fda4af",
                      background: "#fff",
                      color: "#be185d",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontSize: "0.85rem",
                    }}
                  >
                    View Cart
                  </button>
                  <button
                    type="button"
                    className={styles.primaryBtn}
                    style={{ flex: 1, margin: 0, padding: "10px", fontSize: "0.85rem" }}
                    onClick={() => {
                      if (!isAuthenticated) {
                        setAuthTab("signin");
                        setAuthError(null);
                        setActiveModal("signin");
                      } else {
                        setActiveModal(null);
                        router.push("/cart");
                      }
                    }}
                  >
                    Checkout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sign in modal */}
      {activeModal === "signin" && (
        <div className={styles.modalBackdrop} onClick={() => { setActiveModal(null); resetPhoneFlow(); }}>
          <div
            className={styles.modalBox}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="signin-modal-title"
          >
            <div className={styles.modalHeader}>
              <h3 id="signin-modal-title" className={styles.modalTitle}>
                {authTab === "signin" ? "Sign In to Occassions" : "Create Your Account"}
              </h3>
              <button
                className={styles.modalCloseBtn}
                onClick={() => { setActiveModal(null); resetPhoneFlow(); }}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}

            {authError && <div className={styles.authError}>{authError}</div>}


            <form onSubmit={handleAuthSubmit}>
              {authTab === "signup" && (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Full Name</label>
                    <input
                      type="text"
                      className={styles.inputField}
                      placeholder="e.g. Rahul Menon"
                      required
                      value={authForm.name}
                      onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Mobile Number</label>
                    <input
                      type="tel"
                      className={styles.inputField}
                      placeholder="10-digit mobile number"
                      value={authForm.phone}
                      onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })}
                    />
                  </div>
                </>
              )}

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email Address</label>
                <input
                  type="email"
                  className={styles.inputField}
                  placeholder="Enter your email"
                  required
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Password</label>
                <input
                  type="password"
                  className={styles.inputField}
                  placeholder={authTab === "signin" ? "Enter your password" : "At least 6 characters"}
                  required
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                />
              </div>

              {authTab === "signup" && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Confirm Password</label>
                  <input
                    type="password"
                    className={styles.inputField}
                    placeholder="Re-enter your password"
                    required
                    value={authForm.confirmPassword}
                    onChange={(e) => setAuthForm({ ...authForm, confirmPassword: e.target.value })}
                  />
                </div>
              )}

              <button type="submit" className={styles.primaryBtn} disabled={authLoading}>
                {authLoading ? (
                  "Processing..."
                ) : authTab === "signin" ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <div className={styles.authDivider}>
              <span>or</span>
            </div>

            {/* Phone OTP flow */}
            {phoneFlow === "idle" && (
              <button
                type="button"
                className={styles.phoneBtn}
                onClick={() => { setPhoneFlow("enter"); setPhoneError(null); }}
                disabled={authLoading}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.36 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 5.49 5.49l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span>Continue with Phone Number</span>
              </button>
            )}

            {phoneFlow === "enter" && (
              <div className={styles.phoneFlowBox}>
                <p className={styles.phoneFlowLabel}>Enter your mobile number</p>
                <div className={styles.phoneInputRow}>
                  <span className={styles.phoneFlag}>🇮🇳 +91</span>
                  <input
                    type="tel"
                    className={styles.phoneInput}
                    placeholder="10-digit mobile number"
                    value={phoneNumber}
                    maxLength={10}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                    autoFocus
                  />
                </div>
                {phoneError && <p className={styles.phoneError}>{phoneError}</p>}
                <button
                  type="button"
                  className={styles.primaryBtn}
                  style={{ marginTop: 12 }}
                  onClick={handleSendOtp}
                  disabled={phoneLoading}
                >
                  {phoneLoading ? "Sending OTP…" : "Send OTP"}
                </button>
                <button type="button" className={styles.phoneCancelBtn} onClick={resetPhoneFlow}>
                  Use email instead
                </button>
              </div>
            )}

            {phoneFlow === "otp" && (
              <div className={styles.phoneFlowBox}>
                <p className={styles.phoneFlowLabel}>
                  OTP sent to <strong>+91 {phoneNumber}</strong>
                </p>
                <div className={styles.otpInputRow}>
                  {[0,1,2,3,4,5].map((i) => (
                    <input
                      key={i}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className={styles.otpDigit}
                      value={otpValue[i] || ""}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        const arr = otpValue.split("");
                        arr[i] = val;
                        setOtpValue(arr.join("").slice(0, 6));
                        if (val && e.target.nextElementSibling) {
                          (e.target.nextElementSibling as HTMLInputElement).focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !otpValue[i] && e.currentTarget.previousElementSibling) {
                          (e.currentTarget.previousElementSibling as HTMLInputElement).focus();
                        }
                      }}
                    />
                  ))}
                </div>
                {phoneError && <p className={styles.phoneError}>{phoneError}</p>}
                <button
                  type="button"
                  className={styles.primaryBtn}
                  style={{ marginTop: 14 }}
                  onClick={handleVerifyOtp}
                  disabled={phoneLoading || otpValue.length < 4}
                >
                  {phoneLoading ? "Verifying…" : "Verify OTP"}
                </button>
                <div className={styles.otpResend}>
                  {otpResendTimer > 0 ? (
                    <span>Resend OTP in {otpResendTimer}s</span>
                  ) : (
                    <button type="button" className={styles.phoneCancelBtn} onClick={handleSendOtp}>
                      Resend OTP
                    </button>
                  )}
                  <button type="button" className={styles.phoneCancelBtn} onClick={resetPhoneFlow}>
                    Change number
                  </button>
                </div>
              </div>
            )}

            <button
              type="button"
              className={styles.googleBtn}
              onClick={handleGoogleLogin}
              disabled={authLoading}
              aria-busy={authLoading}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.98 0 12s.45 3.85 1.24 5.42l4.04-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>{authLoading ? "Connecting with Google…" : "Continue with Google"}</span>
            </button>

            <div style={{ marginTop: 18, fontSize: "0.75rem", color: "#64748b", textAlign: "center", lineHeight: 1.5 }}>
              By continuing, you agree to Occassions{" "}
              <span style={{ color: "#db2777", fontWeight: 600 }}>Terms of Service</span>
              {" "}&amp;{" "}
              <span style={{ color: "#db2777", fontWeight: 600 }}>Privacy Policy</span>.
              Fast checkout for all floral arrangements.
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
            <li>
              <Link
                href="/track-order"
                className={styles.drawerNavLink}
                onClick={() => setDrawerOpen(false)}
              >
                📦 Track Order
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