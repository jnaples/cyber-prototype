import type { Components, Theme } from "@mui/material/styles";

const MuiLink: Components<Theme>["MuiLink"] = {
  styleOverrides: {
    root: ({ theme }) => ({
      color: theme.vars.palette.primary.light,
    }),
  },
};

export const link: Components<Theme> = {
  MuiLink,
};
