import type { CSSProperties } from "react";

import type {} from "@mui/material/themeCssVarsAugmentation";
import type {} from "@mui/x-data-grid/themeAugmentation";
import type {} from "@mui/x-date-pickers/themeAugmentation";

declare module "@mui/material/styles" {
  interface Color {
    "50Channel": string;
    "100Channel": string;
    "200Channel": string;
    "300Channel": string;
    "400Channel": string;
    "500Channel": string;
    "600Channel": string;
    "700Channel": string;
    "800Channel": string;
    "900Channel": string;
  }

  interface TypeText {
    disabledChannel: string;
  }

  interface CommonColors {
    whiteChannel: string;
    blackChannel: string;
  }

  interface TypeBackground {
    neutral: string;
    neutralChannel: string;
  }

  interface Palette {
    tertiary: Palette["primary"];
    quaternary: Palette["primary"];
    pairingTeal: Palette["primary"];
    pairingRose: Palette["primary"];
    pairingPurple: Palette["primary"];
    blueGrey: Palette["grey"];
  }

  interface PaletteOptions {
    tertiary?: PaletteOptions["primary"];
    quaternary?: PaletteOptions["primary"];
    pairingTeal?: PaletteOptions["primary"];
    pairingRose?: PaletteOptions["primary"];
    pairingPurple?: PaletteOptions["primary"];
    blueGrey?: PaletteOptions["grey"];
  }

  interface TypographyVariants {
    fontWeightSemiBold: CSSProperties["fontWeight"];
    fontSecondaryFamily: CSSProperties["fontFamily"];
    pageTitle: CSSProperties;
    cardTitle: CSSProperties;
    sectionHeading: CSSProperties;
  }

  interface TypographyVariantsOptions {
    fontWeightSemiBold?: CSSProperties["fontWeight"];
    fontSecondaryFamily?: CSSProperties["fontFamily"];
    pageTitle?: CSSProperties;
    cardTitle?: CSSProperties;
    sectionHeading?: CSSProperties;
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    tertiary: true;
    quaternary: true;
    pairingTeal: true;
    pairingRose: true;
    pairingPurple: true;
  }
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    pageTitle: true;
    cardTitle: true;
    sectionHeading: true;
  }
}
