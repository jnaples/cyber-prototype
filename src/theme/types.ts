import type {
  ColorSystemOptions,
  CSSObject,
  CssVarsThemeOptions,
  Palette,
  PaletteOptions,
  SupportedColorScheme,
  ThemeOptions as MuiThemeOptions,
} from "@mui/material/styles";
import type { PaletteColor, PaletteColorChannel } from "@mui/material/styles";

/**
 * Palette
 */
export type PaletteColorKey =
  | "primary"
  | "secondary"
  | "tertiary"
  | "quaternary"
  | "pairingTeal"
  | "pairingRose"
  | "pairingPurple"
  | "info"
  | "success"
  | "warning"
  | "error";

export type PaletteColorNoChannels = Omit<
  PaletteColor,
  "lighterChannel" | "darkerChannel"
>;

export type PaletteColorWithChannels = PaletteColor & PaletteColorChannel;

export type CommonColorsExtend = {
  whiteChannel: string;
  blackChannel: string;
};

export type TypeTextExtend = {
  disabledChannel: string;
};

export type TypeBackgroundExtend = {
  neutral: string;
  neutralChannel: string;
};

export type PaletteExtend = {
  tertiary: Palette["primary"];
  quaternary: Palette["primary"];
  pairingTeal: Palette["primary"];
  pairingRose: Palette["primary"];
  pairingPurple: Palette["primary"];
};

export type PaletteOptionsExtend = {
  tertiary: PaletteOptions["primary"];
  quaternary: PaletteOptions["primary"];
  pairingTeal: PaletteOptions["primary"];
  pairingRose: PaletteOptions["primary"];
  pairingPurple: PaletteOptions["primary"];
};

export type GreyExtend = {
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
};

/**
 * Typography
 */
export type FontStyleExtend = {
  fontWeightSemiBold: CSSObject["fontWeight"];
  fontSecondaryFamily: CSSObject["fontFamily"];
  pageTitle: React.CSSProperties;
  cardTitle: React.CSSProperties;
  sectionHeading: React.CSSProperties;
};

/**
 * Theme
 */

export type ThemeColorScheme = SupportedColorScheme;

export type ThemeOptions = Omit<MuiThemeOptions, "components"> &
  Pick<CssVarsThemeOptions, "defaultColorScheme" | "components"> & {
    colorSchemes?: Record<ThemeColorScheme, ColorSystemOptions>;
    cssVariables?: CssVarsThemeOptions;
  };
