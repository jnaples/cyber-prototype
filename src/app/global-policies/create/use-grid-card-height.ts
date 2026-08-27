// Sizes a card around a DataTable so it hugs the grid's rows but never grows
// past the space on offer.
//
// CSS can't do this: the grid needs a *definite* height to switch from growing
// to scrolling, and no CSS height value is both content-driven and definite.
// So measure — but measure the right things:
//
//   • The column headers are pinned INSIDE the virtual scroller, so they add to
//     the height the scroller needs. Measuring only the rows undershoots by the
//     header height and clips the last row under the pager.
//   • The rows' own height comes off the scroller's content node, which MUI
//     sizes with `flex-basis` and `flex-shrink: 0` — so it reports the full
//     rows height even while the scroller is shorter than that.
//   • Everything else (the card's own header, the grid's pager) is the
//     difference between the card and the scroller, and is invariant of the
//     card's height — which is what stops this from oscillating.
//
// The grid publishes its own metrics as CSS custom properties on its root, so
// the header and overlay heights are read rather than guessed.

import { useLayoutEffect, useRef, useState } from "react";

/** Reads a numeric px custom property off an element. */
function cssPx(el: Element, name: string) {
  return parseFloat(getComputedStyle(el).getPropertyValue(name)) || 0;
}

export function useGridCardHeight(rowCount: number) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState<number>();

  useLayoutEffect(() => {
    const card = cardRef.current;
    const container = card?.parentElement;
    if (!card || !container) return;

    let watched: Element | null = null;

    const measure = () => {
      const root = card.querySelector<HTMLElement>(".MuiDataGrid-root");
      const scroller = card.querySelector<HTMLElement>(
        ".MuiDataGrid-virtualScroller",
      );
      const rows = card.querySelector<HTMLElement>(
        ".MuiDataGrid-virtualScrollerContent",
      );
      if (!root || !scroller || !rows) return;

      // Re-point the observer if the grid swapped the node out.
      if (watched !== rows) {
        if (watched) observer.unobserve(watched);
        observer.observe(rows);
        watched = rows;
      }

      const chrome = Math.max(0, card.clientHeight - scroller.clientHeight);
      const headers = cssPx(root, "--DataGrid-headersTotalHeight");
      const scrollbar = Math.max(
        0,
        scroller.offsetHeight - scroller.clientHeight,
      );
      const body =
        rowCount === 0
          ? cssPx(root, "--DataGrid-overlayHeight") || 320
          : rows.offsetHeight;

      // The grid reports 0 for a frame after the row set changes; acting on it
      // would collapse the scroller and the measurement would never recover.
      if (rowCount > 0 && body === 0) return;

      // The ceiling is the parent's *content* box — its padding isn't space
      // the card can use.
      const pad = getComputedStyle(container);
      const available =
        container.clientHeight -
        (parseFloat(pad.paddingTop) || 0) -
        (parseFloat(pad.paddingBottom) || 0);

      setHeight(Math.min(available, chrome + headers + body + scrollbar));
    };

    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(card);
    measure();
    return () => observer.disconnect();
    // Re-measure whenever the row set changes.
  }, [rowCount]);

  return { cardRef, height };
}
