// Thin wrapper around the Material Symbols icon font so callers use MUI `sx`
// (size, color, theme tokens) instead of inline `style` on a raw <span>.

import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

export function MaterialSymbol({
  name,
  size = 20,
  sx,
}: {
  /** Icon ligature, e.g. "search", "block", "public". */
  name: string;
  /** Font size in px (icons are square). */
  size?: number;
  sx?: SxProps<Theme>;
}) {
  return (
    <Box
      component="span"
      className="material-symbols-outlined"
      aria-hidden
      sx={[
        { fontSize: size, lineHeight: 1, display: "inline-flex" },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {name}
    </Box>
  );
}
