import { alpha } from "@mui/material/styles";
import type { Components, Theme } from "@mui/material/styles";

const MuiMenu: Components<Theme>["MuiMenu"] = {
  styleOverrides: {
    paper: {
      maxHeight: 500,
      overflowY: "auto",
    },
  },
};

// Selected menu items use our brand primary (not the default neutral grey),
// with a stronger tint so the active row reads clearly.
const MuiMenuItem: Components<Theme>["MuiMenuItem"] = {
  styleOverrides: {
    root: ({ theme }) => ({
      "&.Mui-selected": {
        backgroundColor: alpha(theme.palette.primary.main, 0.08),
        "&:hover": {
          backgroundColor: alpha(theme.palette.primary.main, 0.12),
        },
        "&.Mui-focusVisible": {
          backgroundColor: alpha(theme.palette.primary.main, 0.12),
        },
      },
    }),
  },
};

export const menu: Components<Theme> = {
  MuiMenu,
  MuiMenuItem,
};
