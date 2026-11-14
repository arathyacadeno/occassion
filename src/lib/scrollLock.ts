"use client";

import { useEffect } from "react";

let lockCount = 0;
let savedScrollY = 0;
let originalBodyStyles: {
  position: string;
  top: string;
  left: string;
  width: string;
  overflow: string;
  paddingRight: string;
} | null = null;

/**
 * Locks the background document scroll cleanly without layout jumps.
 * Uses position: fixed at the exact scrollY offset and compensates for the scrollbar width.
 */
export function lockBackgroundScroll() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  if (lockCount === 0) {
    savedScrollY = window.scrollY || document.documentElement.scrollTop || 0;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

    originalBodyStyles = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
      paddingRight: document.body.style.paddingRight,
    };

    document.body.style.position = "fixed";
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.left = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }
  }

  lockCount++;
}

/**
 * Unlocks the background document scroll and seamlessly restores the scroll position.
 */
export function unlockBackgroundScroll() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0 && originalBodyStyles) {
    const { position, top, left, width, overflow, paddingRight } = originalBodyStyles;
    document.body.style.position = position;
    document.body.style.top = top;
    document.body.style.left = left;
    document.body.style.width = width;
    document.body.style.overflow = overflow;
    document.body.style.paddingRight = paddingRight;
    originalBodyStyles = null;

    window.scrollTo(0, savedScrollY);
  }
}

/**
 * React hook to lock background scroll while a modal is open.
 */
export function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;
    lockBackgroundScroll();
    return () => {
      unlockBackgroundScroll();
    };
  }, [isLocked]);
}
