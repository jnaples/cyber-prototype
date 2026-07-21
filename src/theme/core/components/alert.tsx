import type { Components, Theme } from "@mui/material/styles";

// Alert titles are always semi-bold (600) across the app.
const MuiAlertTitle: Components<Theme>["MuiAlertTitle"] = {
  styleOverrides: {
    root: {
      fontWeight: 600,
    },
  },
};

export const alert: Components<Theme> = {
  MuiAlertTitle,
};
