import type { Components, Theme } from "@mui/material/styles";

import { primaryFont } from "../typography";
import { pxToRem } from "../utils";

const MuiFormLabel: Components<Theme>["MuiFormLabel"] = {
  styleOverrides: {
    root: ({ theme }) => ({
      fontFamily: primaryFont,
      fontSize: pxToRem(14),
      fontWeight: 600,
      color: "inherit",
      marginBottom: theme.spacing(0.5),
      "&.Mui-focused": { color: "inherit" },
      "&.Mui-error": { color: "inherit" },
    }),
  },
};

export const formLabel: Components<Theme> = {
  MuiFormLabel,
};
