import type { Components, Theme } from "@mui/material/styles";

// In dark mode, MUI's Paper applies an elevation overlay (translucent white
// gradient) on top of `background.paper`. ListSubheader is sticky and only
// paints background-color by default, so against an elevated Paper it reads
// as darker. Apply the elevation-8 overlay (Menu's default elevation) so it
// blends with the surrounding surface. In light mode the overlay var is
// `none`, so this is a no-op there.
const MuiListSubheader: Components<Theme>["MuiListSubheader"] = {
  styleOverrides: {
    root: {
      backgroundImage: "var(--dnsf-overlays-8)",
    },
  },
};

export const listSubheader: Components<Theme> = {
  MuiListSubheader,
};
