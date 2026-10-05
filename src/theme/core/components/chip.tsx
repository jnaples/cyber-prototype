import type { Components, Theme } from "@mui/material";

// Chip shapes:
// - Default (6px): status chips (e.g. "Active", "Paid", "Requires Enterprise").
// - Pill (999px): data-table chips (e.g. query-logs Result). Opt in per usage
//   with `sx={{ borderRadius: PILL_CHIP_RADIUS }}` since the pill shape is
//   orthogonal to the filled/outlined variant.
export const PILL_CHIP_RADIUS = 999;

const MuiChip: Components<Theme>["MuiChip"] = {
  styleOverrides: {
    // All chips (and badge-style pill chips) use 13px text, regardless of size.
    root: ({ theme }) => ({
      borderRadius: 6,
      fontSize: 13,
      // Same rule the buttons follow: a filled red or amber chip carries white
      // type on dark rather than the palette's near-black contrastText.
      ...theme.applyStyles("dark", {
        "&.MuiChip-filled.MuiChip-colorError, &.MuiChip-filled.MuiChip-colorWarning":
          {
            color: theme.vars.palette.common.white,
            "& .MuiChip-icon, & .MuiChip-deleteIcon": {
              color: theme.vars.palette.common.white,
            },
          },
      }),
    }),
    sizeSmall: {
      fontSize: 13,
    },
  },
};

export const chip: Components<Theme> = {
  MuiChip,
};
