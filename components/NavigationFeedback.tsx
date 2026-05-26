"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Adds `cursor: progress` to the page the moment a link or programmatic
 * navigation starts, and clears it as soon as the new route's pathname
 * shows up. Works for:
 *
 *   - `<Link href="…">` clicks (caught by the global mousedown listener)
 *   - `<a href="/…">` clicks (same)
 *   - `router.push()` calls — flag onClick in `Globe.tsx` adds the class
 *     directly before invoking the router
 *
 * Lives once at the layout level so every page benefits without each
 * component having to wire its own loading state.
 */
export function NavigationFeedback() {
  const pathname = usePathname();
  const lastPath = useRef(pathname);

  // When the rendered pathname changes, the new route has begun streaming —
  // safe to drop the wait cursor.
  useEffect(() => {
    if (lastPath.current !== pathname) {
      document.documentElement.classList.remove("navigating");
      lastPath.current = pathname;
    }
  }, [pathname]);

  // Any in-app link click flips the wait cursor on immediately. Capture
  // phase + mousedown so it fires before React's onClick chain.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      // Only primary-button clicks without modifier keys (otherwise the user
      // is opening a new tab and our nav isn't going to happen).
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      const target = e.target as HTMLElement | null;
      const a = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href) return;
      if (
        href.startsWith("http") ||
        href.startsWith("//") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("#")
      ) {
        return;
      }
      if (a.target === "_blank") return;
      document.documentElement.classList.add("navigating");
    };
    document.addEventListener("mousedown", handler, true);
    return () => document.removeEventListener("mousedown", handler, true);
  }, []);

  // Safety net: if navigation never resolves (network error, etc), clear
  // the cursor after 8 seconds so the page doesn't feel frozen forever.
  useEffect(() => {
    const t = setTimeout(() => {
      document.documentElement.classList.remove("navigating");
    }, 8000);
    return () => clearTimeout(t);
  }, [pathname]);

  return null;
}
