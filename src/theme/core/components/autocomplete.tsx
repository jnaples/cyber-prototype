import CancelIcon from "@mui/icons-material/Cancel";
import type { Components, Theme } from "@mui/material/styles";

const MuiAutocomplete: Components<Theme>["MuiAutocomplete"] = {
  defaultProps: {
    clearIcon: <CancelIcon fontSize="small" />,
  },
  styleOverrides: {
    listbox: {
      maxHeight: 400,
      overflowY: "auto",
    },
    // Hide the clear (X) button by default; reveal on hover or focus.
    clearIndicator: {
      visibility: "hidden",
    },
    root: {
      "&:hover .MuiAutocomplete-clearIndicator, &.Mui-focused .MuiAutocomplete-clearIndicator":
        {
          visibility: "visible",
        },
    },
  },
};

export const autocomplete: Components<Theme> = {
  MuiAutocomplete,
};
