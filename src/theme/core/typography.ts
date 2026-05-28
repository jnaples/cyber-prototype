import type { TypographyVariantsOptions } from "@mui/material";

import { pxToRem } from "./utils";

export type TypographyVariantsExtend = {
  fontSecondaryFamily: React.CSSProperties["fontFamily"];
};

export const primaryFont = [
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
].join(",");

export const secondaryFont = [
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
].join(",");

export function generateTypography(): TypographyVariantsOptions {
  const typography: TypographyVariantsOptions = {
    fontFamily: primaryFont,
    fontSecondaryFamily: secondaryFont,
    fontWeightLight: "300",
    fontWeightRegular: "400",
    fontWeightMedium: "500",
    fontWeightSemiBold: "600",
    fontWeightBold: "700",
    fontSize: 16,
    h1: {
      fontFamily: secondaryFont,
      fontWeight: 700,
      lineHeight: 1.33,
      fontSize: pxToRem(20),
    },

    h2: {
      fontFamily: secondaryFont,
      fontWeight: 600,
      lineHeight: 1.2,
      fontSize: pxToRem(40),
    },

    h3: {
      fontFamily: secondaryFont,
      fontWeight: 600,
      lineHeight: 1.25,
      fontSize: pxToRem(32),
    },

    h4: {
      fontFamily: secondaryFont,
      fontWeight: 600,
      lineHeight: 1.33,
      fontSize: pxToRem(24),
    },

    h5: {
      fontFamily: secondaryFont,
      fontWeight: 600,
      lineHeight: 1.4,
      fontSize: pxToRem(20),
    },

    h6: {
      fontFamily: secondaryFont,
      fontWeight: 600,
      lineHeight: 1.33,
      fontSize: pxToRem(18),
    },

    subtitle1: {
      fontFamily: primaryFont,
      fontWeight: 500,
      lineHeight: 1.75,
      fontSize: pxToRem(18),
    },

    subtitle2: {
      fontFamily: primaryFont,
      fontWeight: 500,
      lineHeight: 1.57,
      fontSize: pxToRem(16),
    },

    body1: {
      fontFamily: primaryFont,
      lineHeight: 1.5,
      fontSize: pxToRem(16),
    },

    body2: {
      fontFamily: primaryFont,
      lineHeight: 1.6,
      fontSize: pxToRem(14),
    },

    button: {
      fontFamily: primaryFont,
      fontWeight: 700,
      lineHeight: 1.8,
      fontSize: pxToRem(13),
      textTransform: "uppercase",
    },

    caption: {
      fontFamily: primaryFont,
      lineHeight: 1.66,
      fontSize: pxToRem(12),
    },

    overline: {
      fontFamily: primaryFont,
      lineHeight: 2.66,
      fontSize: pxToRem(12),
      textTransform: "uppercase",
    },
    // Custom variants
    pageTitle: {
      fontFamily: secondaryFont,
      fontWeight: 700,
      lineHeight: 1.33,
      fontSize: pxToRem(20),
    },

    cardTitle: {
      fontFamily: secondaryFont,
      fontWeight: 600,
      lineHeight: 1.33,
      fontSize: pxToRem(18),
    },

    sectionHeading: {
      fontFamily: secondaryFont,
      fontWeight: 600,
      lineHeight: 1.33,
      fontSize: pxToRem(18),
    },
  };

  return typography;
}
