import type { Components, Theme } from "@mui/material/styles";

const MuiFormHelperText: Components<Theme>["MuiFormHelperText"] = {
  styleOverrides: {
    root: ({ theme }) => ({
      marginLeft: theme.spacing(0.5),
    }),
  },
};

export const formHelperText: Components<Theme> = {
  MuiFormHelperText,
};
