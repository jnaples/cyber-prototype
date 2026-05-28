// This file is the source for every color, font, radius, and component style
// you see in the browser. Edit values here, save, and DevTools will show the
// new CSS on the next render.
//
// How it works: combines the palettes, typography, shape, and component
// overrides from ./core into one theme object. MUI then emits that as real
// CSS — custom properties under the `--dnsf-*` prefix on <html>, plus
// component classes like `.MuiButton-textPrimary` — which is exactly what you
// inspect in DevTools. Light/dark swap is driven by the
// `data-mui-color-scheme` attribute on <html>.

import type { Theme } from "@mui/material";
import { createTheme as createMuiTheme } from "@mui/material/styles";

import {
  darkPalette,
  generateShape,
  generateTypography,
  lightPalette,
} from "./core";
import { components } from "./core/components";

export function createTheme(): Theme {
  return createMuiTheme({
    cssVariables: {
      cssVarPrefix: "dnsf",
      colorSchemeSelector: "data-mui-color-scheme",
    },
    colorSchemes: {
      light: { palette: lightPalette },
      dark: { palette: darkPalette },
    },
    typography: generateTypography(),
    shape: generateShape(),
    components,
  });
}
