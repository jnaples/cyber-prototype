import type { CommonColors } from "@mui/material/styles";

import type { PaletteColorNoChannels } from "./types";

export type BrandConfig = {
  fontFamily: Record<"primary" | "secondary", string>;
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
  shape: { borderRadius: number };
};

export const brandConfig: BrandConfig = {
  fontFamily: {
    primary: [
      "Inter Variable",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
    secondary: [
      "Montserrat Variable",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
  },
  palette: {
    primary: {
      light: {
        light: "#534fff",
        main: "#3527fd",
        dark: "#0F13C1",
        contrastText: "#FFFFFF",
      },
      dark: {
        light: "#534fff",
        main: "#3527fd",
        dark: "#0F13C1",
        contrastText: "#FFFFFF",
      },
    },
    secondary: {
      light: {
        light: "#BDBDBD",
        main: "#000000",
        dark: "#212121",
        contrastText: "#FFFFFF",
      },
      dark: {
        light: "#FAFAFA",
        main: "#EEEEEE",
        dark: "#BDBDBD",
        contrastText: "#031625",
      },
    },
    tertiary: {
      light: {
        light: "#F306B0",
        main: "#CE008E",
        dark: "#A50085",
        contrastText: "#FFFFFF",
      },
      dark: {
        light: "#F306B0",
        main: "#CE008E",
        dark: "#A50085",
        contrastText: "#FFFFFF",
      },
    },
    quaternary: {
      light: {
        light: "#2BADF5",
        main: "#238CD2",
        dark: "#185B9C",
        contrastText: "#FFFFFF",
      },
      dark: {
        light: "#2BADF5",
        main: "#238CD2",
        dark: "#185B9C",
        contrastText: "#FFFFFF",
      },
    },
    pairingTeal: {
      light: {
        light: "#44E5E7",
        main: "#05C6C6",
        dark: "#059692",
        contrastText: "#FFFFFF",
      },
      dark: {
        light: "#DFF5F6",
        main: "#71D7D8",
        dark: "#2FDBDC",
        contrastText: "#031625",
      },
    },
    pairingRose: {
      light: {
        light: "#F44077",
        main: "#D63258",
        dark: "#9E0E37",
        contrastText: "#FFFFFF",
      },
      dark: {
        light: "#FAE4EA",
        main: "#F792B1",
        dark: "#F44077",
        contrastText: "#031625",
      },
    },
    pairingPurple: {
      light: {
        light: "#C588FF",
        main: "#9435EC",
        dark: "#4300AF",
        contrastText: "#FFFFFF",
      },
      dark: {
        light: "#F2E3FF",
        main: "#C588FF",
        dark: "#9435EC",
        contrastText: "#031625",
      },
    },
    info: {
      light: {
        light: "#2BADF5",
        main: "#207BBE",
        dark: "#185B9C",
        contrastText: "#FFFFFF",
      },
      dark: {
        light: "#5AC6F8",
        main: "#3DB9F7",
        dark: "#238CD2",
        contrastText: "#031625",
      },
    },
    success: {
      light: {
        light: "#1EF1A2",
        main: "#05864A",
        dark: "#005A25",
        contrastText: "#FFFFFF",
      },
      dark: {
        light: "#7AFBC1",
        main: "#54F6B1",
        dark: "#0AB36F",
        contrastText: "#031625",
      },
    },
    warning: {
      light: {
        light: "#FF9800",
        main: "#EF6C00",
        dark: "#BF360C",
        contrastText: "#FFFFFF",
      },
      dark: {
        light: "#FFB74D",
        main: "#FFA726",
        dark: "#F57C00",
        contrastText: "#031625",
      },
    },
    error: {
      light: {
        light: "#EF5350",
        main: "#D32F2F",
        dark: "#B71C1C",
        contrastText: "#FFFFFF",
      },
      dark: {
        light: "#E57373",
        main: "#F44336",
        dark: "#D32F2F",
        contrastText: "#031625",
      },
    },
    grey: {
      "50": "#FAFAFA",
      "100": "#F5F5F5",
      "200": "#EEEEEE",
      "300": "#E0E0E0",
      "400": "#BDBDBD",
      "500": "#9E9E9E",
      "600": "#757575",
      "700": "#616161",
      "800": "#424242",
      "900": "#212121",
    },
    blueGrey: {
      "50": "#F6F8FC",
      "100": "#ECF1FA",
      "200": "#E2EAF8",
      "300": "#BCCCDC",
      "400": "#97A9BC",
      "500": "#72879F",
      "600": "#3C5974",
      "700": "#223A50",
      "800": "#14293B",
      "900": "#031625",
    },
    common: { black: "#000000", white: "#FFFFFF" },
  },
  shape: {
    borderRadius: 6,
  },
};
