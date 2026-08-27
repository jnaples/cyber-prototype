// ⌘K / Ctrl+K focuses the tab's search field.
//
// Bound on the window so it works wherever focus happens to be, and
// preventDefault'ed because Ctrl+K is the browser's own "search from the
// address bar" on Windows and Linux.

import { useEffect } from "react";
import type { RefObject } from "react";

export function useSearchShortcut(
  inputRef: RefObject<HTMLInputElement | null>,
) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "k") return;
      if (!event.metaKey && !event.ctrlKey) return;
      const input = inputRef.current;
      if (!input) return;
      event.preventDefault();
      input.focus();
      // Selecting lets the next keystroke replace an existing query.
      input.select();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [inputRef]);
}
