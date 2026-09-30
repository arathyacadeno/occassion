"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingCart, Heart, Menu, X } from "lucide-react";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isFlowerActive =
    pathname === "/flower-baskets" ||
    !!pathname?.startsWith("/flower-baskets") ||
    pathname === "/bouquets" ||
    !!pathname?.startsWith("/bouquets") ||
    !!pathname?.startsWith("/flowers");
  const isCakesActive =
    pathname === "/cakes" || !!pathname?.startsWith("/cakes");
  const isOccasionActive =
    pathname === "/church-arrangements" ||
    !!pathname?.startsWith("/church-arrangements");

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

        {/* Center: Category navigation */}
        <nav className={styles.navLinks} aria-label="Main Navigation">
          <Link
            href="/flower-baskets"
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
            href="/church-arrangements"
            className={`${styles.navLink} ${
              isOccasionActive ? styles.activeNavLink : ""
            }`}
          >
            Special Occasions
          </Link>
          <Link
            href="/#highlights"
            onClick={handleHighlightsClick}
            className={styles.navLink}
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
          </Link>
          <Link
            href="/#categories"
            className={styles.iconButton}
            aria-label="Wishlist"
            title="Wishlist"
          >
            <Heart size={20} strokeWidth={1.8} />
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
            href="/flower-baskets"
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
            href="/church-arrangements"
            className={`${styles.mobileNavLink} ${
              isOccasionActive ? styles.activeNavLink : ""
            }`}
            onClick={() => setMobileOpen(false)}
          >
            Special Occasions
          </Link>
          <Link
            href="/#highlights"
            className={styles.mobileNavLink}
            onClick={(e) => {
              handleHighlightsClick(e);
              setMobileOpen(false);
            }}
          >
            Our highlights
          </Link>
        </div>
      )}
    </header>
  );
}
