import type { Components, Theme } from "@mui/material";

// In dark mode, checked / indeterminate checkboxes read better in the lighter
// primary blue (primary.light) than the deep contained-blue (primary.main),
// which is too dark against dark surfaces. Applied app-wide so any checkbox —
// including the DataGrid selection boxes, which use MUI's base checkbox — adopts
// it automatically. Light mode is unchanged.
const MuiCheckbox: Components<Theme>["MuiCheckbox"] = {
  styleOverrides: {
    root: ({ theme }) => ({
      ...theme.applyStyles("dark", {
        "&.Mui-checked": {
          color: theme.vars.palette.primary.light,
        },
        "&.MuiCheckbox-indeterminate": {
          color: theme.vars.palette.primary.light,
        },
      }),
    }),
  },
};

export const checkbox: Components<Theme> = {
  MuiCheckbox,
};
