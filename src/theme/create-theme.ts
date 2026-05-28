import type { Theme } from "@mui/material";
import { createTheme as createMuiTheme } from "@mui/material/styles";

import type { BrandConfig } from "./brand-config";
import { generatePalettes, generateShape, generateTypography } from "./core";
import { components } from "./core/components";
import type { ThemeOptions } from "./types";

export function createTheme(brandConfig: BrandConfig): Theme {
  const palette = generatePalettes(brandConfig);
  const typography = generateTypography(brandConfig);
  const shape = generateShape(brandConfig);

  const themeOptions: ThemeOptions = {
    cssVariables: {
      cssVarPrefix: "dnsf",
      colorSchemeSelector: "data-mui-color-scheme",
    },
    colorSchemes: {
      light: {
        palette: palette.light,
      },
      dark: {
        palette: palette.dark,
      },
    },
    typography,
    shape,
    components,
  };

  return createMuiTheme(themeOptions);
}
