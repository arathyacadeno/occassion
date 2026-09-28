import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import styles from "./Breadcrumb.module.css";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={styles.breadcrumbNav}>
      <ol className={styles.breadcrumbList}>
        <li className={styles.breadcrumbItem}>
          <Link href="/" className={styles.breadcrumbLink} title="Home">
            <Home size={14} className={styles.homeIcon} />
            <span>Home</span>
          </Link>
        </li>

        <li className={styles.breadcrumbItem}>
          <ChevronRight size={13} className={styles.separator} aria-hidden="true" />
          <Link href="/flowers/all" className={styles.breadcrumbLink}>
            Flowers
          </Link>
        </li>

        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={idx} className={styles.breadcrumbItem}>
              <ChevronRight size={13} className={styles.separator} aria-hidden="true" />
              {isLast || !item.href ? (
                <span className={styles.activeText} aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className={styles.breadcrumbLink}>
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
