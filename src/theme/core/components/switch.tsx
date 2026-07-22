import type { Components, Theme } from "@mui/material";

// In dark mode, an "on" toggle reads better in the lighter primary blue
// (primary.light / secureBlue) than the deep contained indigo (primary.main),
// matching checkboxes and other selected states. Applied app-wide; light mode
// is unchanged.
const MuiSwitch: Components<Theme>["MuiSwitch"] = {
  styleOverrides: {
    root: ({ theme }) => ({
      ...theme.applyStyles("dark", {
        "& .MuiSwitch-switchBase.Mui-checked": {
          color: theme.vars.palette.primary.light,
        },
        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
          backgroundColor: theme.vars.palette.primary.light,
        },
      }),
    }),
  },
};

export const switchComponent: Components<Theme> = {
  MuiSwitch,
};
