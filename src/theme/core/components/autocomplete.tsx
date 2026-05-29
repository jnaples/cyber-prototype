import type { Components, Theme } from "@mui/material/styles";

const MuiAutocomplete: Components<Theme>["MuiAutocomplete"] = {
  styleOverrides: {
    listbox: {
      maxHeight: 400,
      overflowY: "auto",
    },
  },
};

export const autocomplete: Components<Theme> = {
  MuiAutocomplete,
};
