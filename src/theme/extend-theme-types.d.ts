import type {} from "@mui/material/themeCssVarsAugmentation";
import type {} from "@mui/x-data-grid/themeAugmentation";
import type {} from "@mui/x-date-pickers/themeAugmentation";

import type {
  CommonColorsExtend,
  FontStyleExtend,
  GreyExtend,
  PaletteExtend,
  PaletteOptionsExtend,
  TypeBackgroundExtend,
  TypeTextExtend,
} from "./types";

declare module "@mui/material/styles" {
  interface Color extends GreyExtend {}
  interface TypeText extends TypeTextExtend {}
  interface CommonColors extends CommonColorsExtend {}
  interface TypeBackground extends TypeBackgroundExtend {}
  interface PaletteOptions extends PaletteOptionsExtend {}
  interface Palette extends PaletteExtend {}
  interface TypographyVariants extends FontStyleExtend {}
  interface TypographyVariantsOptions extends Partial<FontStyleExtend> {}
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    pageTitle: true;
    cardTitle: true;
    sectionHeading: true;
  }
}
