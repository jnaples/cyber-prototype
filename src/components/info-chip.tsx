// The app's soft-info chip — a pale blue badge that marks a row without
// competing with it ("Investigating" in the DNS Query Log, "Current Policy" in
// the policy picker). Light mode uses the fixed pale-blue pair; dark mode
// derives from info.main so the badge stays legible on dark surfaces.

import { Chip } from "@mui/material";
import type { ChipProps } from "@mui/material";
import { alpha } from "@mui/material/styles";

export function InfoChip({ sx, ...props }: ChipProps) {
  return (
    <Chip
      size="small"
      sx={[
        {
          flexShrink: 0,
          bgcolor: "#E2F6FE",
          color: "#185B9C",
          '[data-mui-color-scheme="dark"] &': {
            bgcolor: (theme) => alpha(theme.palette.info.main, 0.2),
            color: "info.light",
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    />
  );
}
