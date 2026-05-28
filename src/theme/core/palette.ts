import type { ColorSystemOptions, CommonColors } from "@mui/material/styles";

import type { PaletteColorNoChannels, ThemeColorScheme } from "../types";

type GenerateColorSchemeProps = {
  palette: Record<
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
    | "error",
    { light: PaletteColorNoChannels; dark: PaletteColorNoChannels }
  > & {
    common: Pick<CommonColors, "black" | "white">;
    grey: Record<
      | "50"
      | "100"
      | "200"
      | "300"
      | "400"
      | "500"
      | "600"
      | "700"
      | "800"
      | "900",
      string
    >;
    blueGrey: Record<
      | "50"
      | "100"
      | "200"
      | "300"
      | "400"
      | "500"
      | "600"
      | "700"
      | "800"
      | "900",
      string
    >;
  };
};

export function generatePalettes({
  palette,
}: GenerateColorSchemeProps): Record<
  ThemeColorScheme,
  ColorSystemOptions["palette"]
> {
  const { common, grey, blueGrey } = palette;

  const text = {
    light: {
      primary: blueGrey["900"],
      secondary: blueGrey["600"],
      disabled: blueGrey["400"],
    },
    dark: {
      primary: common.white,
      secondary: grey["400"],
      disabled: grey["600"],
    },
  };

  const background = {
    light: {
      paper: common.white,
      default: blueGrey[100],
      neutral: blueGrey[50],
    },
    dark: {
      paper: "#1C252E",
      default: "#141A21",
      neutral: "#29323D",
    },
  };

  const baseAction = {
    hover: "rgba(158, 158, 158, 0.08)",
    selected: "rgba(158, 158, 158, 0.16)",
    focus: "rgba(158, 158, 158, 0.24)",
    disabled: "rgba(158, 158, 158, 0.8)",
    disabledBackground: "rgba(158, 158, 158, 0.24)",
    hoverOpacity: 0.08,
    disabledOpacity: 0.48,
  };

  const action = {
    light: { ...baseAction, active: grey[600] },
    dark: { ...baseAction, active: grey[500] },
  };

  const basePalette = {
    common,
    grey,
  };

  return {
    light: {
      ...basePalette,
      divider: "rgba(0, 0, 0, 0.12)",
      primary: palette.primary.light,
      secondary: palette.secondary.light,
      tertiary: palette.tertiary.light,
      quaternary: palette.quaternary.light,
      pairingTeal: palette.pairingTeal.light,
      pairingRose: palette.pairingRose.light,
      pairingPurple: palette.pairingPurple.light,
      info: palette.info.light,
      success: palette.success.light,
      warning: palette.warning.light,
      error: palette.error.light,
      text: text.light,
      background: background.light,
      action: action.light,
    },
    dark: {
      ...basePalette,
      divider: "rgba(255, 255, 255, 0.12)",
      primary: palette.primary.dark,
      secondary: palette.secondary.dark,
      tertiary: palette.tertiary.dark,
      quaternary: palette.quaternary.dark,
      pairingTeal: palette.pairingTeal.dark,
      pairingRose: palette.pairingRose.dark,
      pairingPurple: palette.pairingPurple.dark,
      info: palette.info.dark,
      success: palette.success.dark,
      warning: palette.warning.dark,
      error: palette.error.dark,
      text: text.dark,
      background: background.dark,
      action: action.dark,
    },
  };
}
