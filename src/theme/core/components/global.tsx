import type { Components, Theme } from "@mui/material";

const MuiCssBaseline: Components<Theme>["MuiCssBaseline"] = {
  styleOverrides: (theme: Theme) => ({
    // Ensure any tab panel has a consistent top padding and background
    "@global": {
      '[role="tabpanel"]': {
        paddingTop: theme.spacing(2),
        // use the neutral background token so it adapts to light/dark modes
        backgroundColor:
          theme.vars?.palette?.background?.neutral ??
          theme.palette.background.neutral,
        // ensure readable text color
        color: theme.vars?.palette?.text?.primary ?? theme.palette.text.primary,
      },
    },
  }),
};

export const global: Components<Theme> = {
  MuiCssBaseline,
};
