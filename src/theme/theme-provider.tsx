import { ThemeProvider as MuiThemeProvider } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import type { ReactNode } from "react";

import type { BrandConfig } from "./brand-config";
import { brandConfig as defaultBrandConfig } from "./brand-config";
import { createTheme } from "./create-theme";
import type {} from "./extend-theme-types";

type ThemeProviderProps = {
  brandConfig?: BrandConfig;
  children: ReactNode;
};

export const ThemeProvider = ({
  brandConfig = defaultBrandConfig,
  children,
}: ThemeProviderProps) => {
  return (
    <MuiThemeProvider theme={createTheme(brandConfig)}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};
