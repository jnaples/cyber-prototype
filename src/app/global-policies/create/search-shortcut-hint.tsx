// The ⌘K / Ctrl K hint shown inside the search field, so the shortcut is
// discoverable rather than hidden.

import { Typography } from "@mui/material";

// `navigator.platform` is deprecated but still the most reliable Mac signal in
// browsers; the userAgent is the fallback.
const IS_MAC = /Mac|iPhone|iPad|iPod/i.test(
  navigator.platform || navigator.userAgent,
);

export function SearchShortcutHint() {
  return (
    <Typography
      variant="body2"
      aria-hidden
      sx={{
        color: "text.disabled",
        whiteSpace: "nowrap",
        flexShrink: 0,
        "& .cmd": { lineHeight: 1 },
      }}
    >
      {IS_MAC ? (
        <>
          <span className="cmd">⌘</span>K
        </>
      ) : (
        "Ctrl K"
      )}
    </Typography>
  );
}
