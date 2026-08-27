// Tracks whether a scroll container has content out of view above or below, so
// an edge shadow can signal there's more to scroll to.

import { useEffect, useRef, useState } from "react";

/**
 * The data grid's pinned-column shadow, turned through 90° and scaled up: at
 * the grid's own 2px/4px/-2px it reads as a hairline over a list this tall, so
 * the offset, blur and spread are roughly 3x, at a slightly lighter alpha.
 *
 * Drawn `inset` deliberately — an outer shadow on a zero-height strip never
 * paints at all, because the negative spread collapses the shadow rect.
 */
export const OVERFLOW_SHADOW_TOP = "inset 0 9px 7px -7px rgba(0, 0, 0, 0.2)";
export const OVERFLOW_SHADOW_BOTTOM =
  "inset 0 -9px 7px -7px rgba(0, 0, 0, 0.2)";

export function useOverflowShadows<T extends HTMLElement>() {
  const scrollRef = useRef<T | null>(null);
  const [overflow, setOverflow] = useState({ top: false, bottom: false });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      setOverflow((prev) => {
        // Sub-pixel scroll heights mean an exact comparison never settles.
        const top = scrollTop > 1;
        const bottom = scrollTop + clientHeight < scrollHeight - 1;
        return prev.top === top && prev.bottom === bottom
          ? prev
          : { top, bottom };
      });
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    // Catches the container resizing and its content growing or shrinking.
    const observer = new ResizeObserver(update);
    observer.observe(el);
    for (const child of Array.from(el.children)) observer.observe(child);

    return () => {
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  return { scrollRef, ...overflow };
}
