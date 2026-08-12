// Full-strength primary is too dark to read against the dark surfaces, so on
// dark every non-button primary accent steps up to primary.light.
//
// Buttons are deliberately excluded: they paint primary as a *fill* with white
// text, where the darker tone is what gives the contrast.
//
// This is the rule — reach for it rather than adding another per-component
// `theme.applyStyles("dark", { color: primary.light })` at the call site.
// Switch, Link and IconButton already have their own theme modules and carry
// the same rule there.

import type { Components, Theme } from "@mui/material";

const light = (theme: Theme) => theme.vars.palette.primary.light;

const MuiRadio: Components<Theme>["MuiRadio"] = {
  styleOverrides: {
    root: ({ theme }) =>
      theme.applyStyles("dark", {
        "&.Mui-checked": { color: light(theme) },
      }),
  },
};

const MuiCheckbox: Components<Theme>["MuiCheckbox"] = {
  styleOverrides: {
    root: ({ theme }) =>
      theme.applyStyles("dark", {
        "&.Mui-checked, &.MuiCheckbox-indeterminate": { color: light(theme) },
      }),
  },
};

const MuiSvgIcon: Components<Theme>["MuiSvgIcon"] = {
  styleOverrides: {
    root: ({ theme }) =>
      theme.applyStyles("dark", {
        "&.MuiSvgIcon-colorPrimary": { color: light(theme) },
      }),
  },
};

export const primaryOnDark: Components<Theme> = {
  MuiRadio,
  MuiCheckbox,
  MuiSvgIcon,
};
