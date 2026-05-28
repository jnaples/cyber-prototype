import type { Components, Theme } from "@mui/material";

const MuiTooltip: Components<Theme>["MuiTooltip"] = {
  styleOverrides: {
    tooltip: ({ theme }) => ({
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      fontSize: theme.typography.body2.fontSize,
      lineHeight: theme.typography.body2.lineHeight,
      fontFamily: theme.typography.body2.fontFamily,
    }),
    arrow: {
      color: "rgba(0, 0, 0, 0.8)",
    },
  },
};

export const tooltip: Components<Theme> = {
  MuiTooltip,
};
