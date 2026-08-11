import type { Components, Theme } from "@mui/material";

// Overline always reads as a label above content, never as content itself, so
// it carries the secondary text color everywhere rather than being set per use.
const MuiTypography: Components<Theme>["MuiTypography"] = {
  styleOverrides: {
    overline: ({ theme }) => ({
      color: theme.vars.palette.text.secondary,
    }),
  },
};

export const typography: Components<Theme> = {
  MuiTypography,
};
