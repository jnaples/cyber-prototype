import type { Components, Theme } from "@mui/material/styles";

const MuiMenu: Components<Theme>["MuiMenu"] = {
  styleOverrides: {
    paper: {
      maxHeight: 400,
      overflowY: "auto",
    },
  },
};

export const menu: Components<Theme> = {
  MuiMenu,
};
