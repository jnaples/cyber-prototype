import type { Components, Theme } from "@mui/material";

// Chip shapes:
// - Default (6px): status chips (e.g. "Active", "Paid", "Requires Enterprise").
// - Pill (999px): data-table chips (e.g. query-logs Result). Opt in per usage
//   with `sx={{ borderRadius: PILL_CHIP_RADIUS }}` since the pill shape is
//   orthogonal to the filled/outlined variant.
export const PILL_CHIP_RADIUS = 999;

const MuiChip: Components<Theme>["MuiChip"] = {
  styleOverrides: {
    root: {
      borderRadius: 6,
    },
  },
};

export const chip: Components<Theme> = {
  MuiChip,
};
