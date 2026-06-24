import type { Components, Theme } from "@mui/material";

// Drop the Container's responsive left/right gutters at every maxWidth — page
// padding is owned by PageShell, so the Container shouldn't double it up.
const MuiContainer: Components<Theme>["MuiContainer"] = {
  defaultProps: {
    disableGutters: true,
  },
};

export const container: Components<Theme> = {
  MuiContainer,
};
