"use client";

import React, { useMemo, useState, useEffect } from "react";
import styles from "./CategoryPage.module.css";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Product } from "@/data/catalog";

const DEFAULT_FILTER_TABS = [
  { id: "all", label: "All Items" },
  { id: "birthday", label: "Birthday" },
  { id: "anniversary", label: "Anniversary" },
  { id: "flowers-in-boxes", label: "Flowers in Boxes" },
  { id: "handcrafted-baskets", label: "Handcrafted Baskets" },
];

interface CategoryPageProps {
  title?: string;
  description?: string;
  products: Product[];
  filterTabs?: { id: string; label: string }[];
  initialFilterId?: string;
  initialSearch?: string;
}

export default function CategoryPage({
  title = "Flower Baskets",
  description,
  products,
  filterTabs,
  initialFilterId,
  initialSearch,
}: CategoryPageProps) {
  const tabs = filterTabs && filterTabs.length > 0 ? filterTabs : DEFAULT_FILTER_TABS;
  const [activeFilterId, setActiveFilterId] = useState<string>(
    initialFilterId || tabs[0].id
  );
  const [searchParam, setSearchParam] = useState<string>(initialSearch || "");

  // Sync tab with URL search parameter if present (e.g. /flower-bouquets?tab=roses or ?flower=roses or ?search=cake)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkParams = () => {
        const params = new URLSearchParams(window.location.search);
        const q = params.get("search") || params.get("q") || params.get("query") || "";
        setSearchParam(q);

        const tabParam =
          params.get("tab") ||
          params.get("flower") ||
          params.get("type") ||
          params.get("category");
        if (tabParam) {
          const rawParam = tabParam.toLowerCase().trim();
          const cleanParam = rawParam.replace(/s$/, "").replace(/[-_]/g, " ");
          const found = tabs.find(
            (t) =>
              t.id.toLowerCase() === rawParam ||
              t.id.toLowerCase().replace(/s$/, "") === cleanParam ||
              t.label.toLowerCase() === rawParam ||
              t.label.toLowerCase().replace(/s$/, "") === cleanParam ||
              cleanParam.includes(t.id.toLowerCase()) ||
              rawParam.includes(t.id.toLowerCase())
          );
          if (found) {
            setActiveFilterId(found.id);
            return;
          }
        }

        // If search query matches a tab, auto-select it
        if (q) {
          const cleanQ = q.toLowerCase().trim();
          const foundBySearch = tabs.find(
            (t) =>
              t.id.toLowerCase() !== "all" &&
              (cleanQ === t.id.toLowerCase() ||
                cleanQ.includes(t.id.toLowerCase()) ||
                cleanQ === t.label.toLowerCase() ||
                cleanQ.includes(t.label.toLowerCase().replace(/ cakes?| flowers?/i, "").trim()))
          );
          if (foundBySearch) {
            setActiveFilterId(foundBySearch.id);
          }
        }
      };

      checkParams();
      window.addEventListener("popstate", checkParams);
      return () => window.removeEventListener("popstate", checkParams);
    }
  }, [tabs]);

  const handleTabClick = (tabId: string) => {
    setActiveFilterId(tabId);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (tabId === "all") {
        url.searchParams.delete("tab");
        url.searchParams.delete("flower");
      } else {
        url.searchParams.set("tab", tabId);
      }
      window.history.replaceState(null, "", url.toString());
    }
  };

  const visibleProducts = useMemo(() => {
    let list = products;
    if (searchParam.trim()) {
      const q = searchParam.toLowerCase().trim();
      const isBroadCategory =
        q === "cake" ||
        q === "cakes" ||
        q === "flower" ||
        q === "flowers" ||
        q === "bouquet" ||
        q === "bouquets" ||
        q === "basket" ||
        q === "baskets";
      if (!isBroadCategory) {
        const filtered = list.filter((p) => {
          const text = `${p.name} ${p.description ?? ""} ${p.category ?? ""} ${p.badge ?? ""} ${p.slug ?? ""}`.toLowerCase();
          return text.includes(q);
        });
        if (filtered.length > 0) {
          list = filtered;
        }
      }
    }

    if (activeFilterId === "all" || activeFilterId.toLowerCase() === "all items") {
      return list;
    }
    const f = activeFilterId.toLowerCase();
    return products.filter((p) => {
      const text = `${p.name} ${p.description ?? ""} ${p.slug ?? ""} ${p.badge ?? ""}`.toLowerCase();
      if (f === "birthday")
        return (
          p.id !== "bouquet-sunshine-orchids" &&
          !text.includes("sunshine & orchids") &&
          (text.includes("birthday") ||
            (p.badge && p.badge.toLowerCase().includes("birthday")))
        );
      if (f === "anniversary") {
        if (
          p.id === "cake-chocolate-amma" ||
          p.id === "cake-lavender-amma" ||
          p.id.includes("amma") ||
          p.name.toLowerCase().includes("birthday") ||
          (p.category === "cakes" && text.includes("birthday"))
        ) {
          return false;
        }
        return (
          text.includes("anniversary") ||
          text.includes("wedding") ||
          text.includes("engaged") ||
          text.includes("romance") ||
          (text.includes("heart") && !text.includes("heartwarming") && !text.includes("heartfelt"))
        );
      }
      if (f === "chocolate")
        return (
          text.includes("chocolate") ||
          text.includes("truffle") ||
          text.includes("fudge") ||
          text.includes("cocoa")
        );
      if (f === "fruit")
        return (
          text.includes("fruit") ||
          text.includes("berry") ||
          text.includes("berries") ||
          text.includes("strawberr") ||
          text.includes("blueberr") ||
          text.includes("vanilla")
        );
      if (f === "roses" || f === "rose") {
        if (
          p.id === "bouquet-orchid-symphony" ||
          p.id === "bouquet-golden-blush" ||
          p.id === "bouquet-pink-roses-purple-orchids" ||
          p.id === "bouquet-orchid-fantasy" ||
          p.slug === "orchid-fantasy"
        ) {
          return false;
        }
        return text.includes("rose");
      }
      if (f === "orchids" || f === "orchid") return text.includes("orchid");
      if (f === "lilies" || f === "lily") return text.includes("lil");
      if (f === "carnations" || f === "carnation") return text.includes("carnation");
      if (f === "tulips" || f === "tulip" || f === "pastel-tulips") return text.includes("tulip");
      if (f === "sunflowers" || f === "sunflower") return text.includes("sunflower");
      if (f === "gerberas" || f === "gerbera") return text.includes("gerbera");
      if (f === "peonies" || f === "peony") return text.includes("peon");
      if (f === "bouquets" || f === "bouquet" || f === "flower-bouquets" || f === "flower bouquets") {
        return (
          !text.includes("basket") &&
          !text.includes("box") &&
          (text.includes("bouquet") ||
            text.includes("wrap") ||
            text.includes("bunch") ||
            text.includes("hand-tied") ||
            p.id.startsWith("bouquet-"))
        );
      }
      if (
        f === "baskets" ||
        f === "basket" ||
        f === "flower-baskets" ||
        f === "flower baskets" ||
        f === "handcrafted-baskets" ||
        f === "handcrafted baskets"
      ) {
        return (
          text.includes("basket") ||
          text.includes("box") ||
          text.includes("crate") ||
          p.id.startsWith("flower-basket-")
        );
      }
      if (f === "flowers-in-boxes" || f === "flowers in boxes")
        return (
          text.includes("basket") ||
          text.includes("box") ||
          text.includes("crate")
        );
      if (
        f === "cane" ||
        f === "cane-basket" ||
        f === "flowers in cane basket" ||
        f.includes("cane")
      ) {
        if (p.basketType) return p.basketType === "cane";
        return text.includes("cane") || text.includes("wicker");
      }
      if (
        f === "bamboo" ||
        f === "bamboo-basket" ||
        f === "flowers in bamboo basket" ||
        f.includes("bamboo")
      ) {
        if (p.basketType) return p.basketType === "bamboo";
        return text.includes("bamboo") && !text.includes("cane") && !text.includes("wicker");
      }
      if (
        f === "container" ||
        f === "conatiner" ||
        f === "flowers in container" ||
        f === "flowers in conatiner" ||
        f.includes("container") ||
        f.includes("conatiner")
      ) {
        if (p.basketType) return p.basketType === "container";
        return text.includes("container") || text.includes("conatiner") || p.id === "flower-basket-9";
      }
      if (f === "centerpiece")
        return text.includes("centerpiece") || text.includes("candelabra");
      if (f === "runner")
        return text.includes("runner") || text.includes("banquet");
      if (f === "wedding")
        return text.includes("wedding") || text.includes("ceremony") || text.includes("arch");
      if (f === "rustic")
        return text.includes("rustic") || text.includes("burlap") || text.includes("woven");
      if (f === "heart")
        return /\bheart\b/i.test(`${p.name} ${p.badge ?? ""} ${p.id} ${p.description ?? ""}`);
      if (f === "cross") {
        const crossCheck = `${p.name} ${p.badge ?? ""} ${p.id}`.toLowerCase();
        return /\bcross\b/i.test(crossCheck);
      }
      if (f === "circular") {
        const crossCheck = `${p.name} ${p.badge ?? ""} ${p.id}`.toLowerCase();
        if (/\bcross\b/i.test(crossCheck)) return false;
        const name = p.name.toLowerCase();
        const badge = (p.badge ?? "").toLowerCase();
        if (name.includes("dome") || name.includes("bouquet") || badge.includes("dome")) return false;
        return (
          name.includes("wreath") ||
          /\bring\b/i.test(name) ||
          /\bring\b/i.test(badge) ||
          badge.includes("circular") ||
          badge.includes("tribute")
        );
      }
      if (f === "easel") {
        const crossCheck = `${p.name} ${p.badge ?? ""} ${p.id}`.toLowerCase();
        if (/\bcross\b/i.test(crossCheck)) return false;
        const name = p.name.toLowerCase();
        const badge = (p.badge ?? "").toLowerCase();
        const desc = (p.description ?? "").toLowerCase();
        if (name.includes("wreath") && (badge.includes("ring") || badge.includes("circular"))) return false;
        return (
          name.includes("easel") ||
          name.includes("dome") ||
          name.includes("bouquet") ||
          badge.includes("dome") ||
          desc.includes("dome") ||
          desc.includes("standing easel") ||
          desc.includes("spherical dome")
        );
      }
      return text.includes(f);
    });
  }, [activeFilterId, products, searchParam]);

  return (
    <div className={styles.pageWrapper}>
      <Navbar />
      <main className={styles.mainContent}>
        {/* ================= HEADING ================= */}
        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>{title}</h1>
          {description ? (
            <p className={styles.pageSubtitle} style={{ whiteSpace: "pre-line" }}>
              {description}
            </p>
          ) : (
            <p className={styles.pageSubtitle}>
              Artisanal hand-woven baskets brimming with
              <br />
              fresh roses, peonies, baby&apos;s breath &amp; fragrant greenery.
            </p>
          )}
        </header>

        {/* ================= PINK PANEL ================= */}
        <section className={styles.categoryPanel}>
          <div
            className={styles.filterTabsRow}
            role="tablist"
            aria-label="Filter products"
          >
            {tabs.map((tab) => {
              const isActive = tab.id === activeFilterId;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`${styles.filterPill} ${
                    isActive ? styles.filterPillActive : ""
                  }`}
                  onClick={() => handleTabClick(tab.id)}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className={styles.gridContainer}>
            <div className={styles.productGrid}>
              {visibleProducts.length > 0 ? (
                visibleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} imageFit={title?.toLowerCase().includes("basket") ? "contain" : undefined} />
                ))
              ) : (
                <p className={styles.emptyState}>
                  No products in this category yet.
                </p>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}