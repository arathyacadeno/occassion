"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingCart, Heart, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const pathname = usePathname();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Exact 4 navigation categories
  const isFlowerActive =
    pathname === "/flower" ||
    pathname.startsWith("/flower/") ||
    pathname === "/flower-baskets" ||
    pathname === "/bouquets";

  const isCakesActive =
    pathname === "/cakes" || pathname.startsWith("/cakes/");

  const isSpecialOccasionsActive =
    pathname === "/special-occasions" ||
    pathname.startsWith("/special-occasions/") ||
    pathname === "/church-arrangements";

  const isHighlightsActive =
    pathname === "/our-highlights" ||
    pathname.startsWith("/our-highlights/") ||
    pathname === "/#highlights";

  return (
    <header className={styles.navbarWrapper}>
      <div className={styles.navbarContainer}>
        {/* Logo on the left */}
        <Link href="/" className={styles.logoLink} aria-label="Occassions Home">
          <img
            src="/images/occasions-logo.png"
            alt="Occassions - Do it with flowers"
            className={styles.logoImg}
          />
        </Link>

        {/* Center: Exactly 4 categories */}
        <nav className={styles.navLinks} aria-label="Main Navigation">
          <Link
            href="/flower"
            className={`${styles.navLink} ${
              isFlowerActive ? styles.activeNavLink : ""
            }`}
          >
            Flower
          </Link>
          <Link
            href="/cakes"
            className={`${styles.navLink} ${
              isCakesActive ? styles.activeNavLink : ""
            }`}
          >
            Cakes
          </Link>
          <Link
            href="/special-occasions"
            className={`${styles.navLink} ${
              isSpecialOccasionsActive ? styles.activeNavLink : ""
            }`}
          >
            Special Occasions
          </Link>
          <Link
            href="/our-highlights"
            className={`${styles.navLink} ${
              isHighlightsActive ? styles.activeNavLink : ""
            }`}
          >
            Our highlights
          </Link>
        </nav>

        {/* Right: Search, Cart, Wishlist/Heart */}
        <div className={styles.rightIcons}>
          <Link
            href="/#categories"
            className={styles.iconButton}
            aria-label="Search"
            title="Search"
          >
            <Search size={20} strokeWidth={1.8} />
          </Link>
          <Link
            href="/cart"
            className={styles.iconButton}
            aria-label="Shopping Cart"
            title="Shopping Cart"
          >
            <ShoppingCart size={20} strokeWidth={1.8} />
            {cartCount > 0 && (
              <span className={styles.cartBadge}>{cartCount}</span>
            )}
          </Link>
          <Link
            href="/wishlist"
            className={styles.iconButton}
            aria-label="Wishlist"
            title="Wishlist"
          >
            <Heart size={20} strokeWidth={1.8} />
            {wishlistCount > 0 && (
              <span className={styles.cartBadge}>{wishlistCount}</span>
            )}
          </Link>
          <button
            type="button"
            className={styles.mobileMenuButton}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className={styles.mobileMenu}>
          <Link
            href="/flower"
            className={`${styles.mobileNavLink} ${
              isFlowerActive ? styles.activeNavLink : ""
            }`}
            onClick={() => setMobileOpen(false)}
          >
            Flower
          </Link>
          <Link
            href="/cakes"
            className={`${styles.mobileNavLink} ${
              isCakesActive ? styles.activeNavLink : ""
            }`}
            onClick={() => setMobileOpen(false)}
          >
            Cakes
          </Link>
          <Link
            href="/special-occasions"
            className={`${styles.mobileNavLink} ${
              isSpecialOccasionsActive ? styles.activeNavLink : ""
            }`}
            onClick={() => setMobileOpen(false)}
          >
            Special Occasions
          </Link>
          <Link
            href="/our-highlights"
            className={`${styles.mobileNavLink} ${
              isHighlightsActive ? styles.activeNavLink : ""
            }`}
            onClick={() => setMobileOpen(false)}
          >
            Our highlights
          </Link>
        </div>
      )}
    </header>
  );
}
