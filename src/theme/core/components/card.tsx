import type { Components, Theme } from "@mui/material";

const MuiCard: Components<Theme>["MuiCard"] = {
  styleOverrides: {
    root: ({ theme }) => ({
      // ensure consistent bottom padding across cards
      "& .MuiCardContent-root": {
        padding: theme.spacing(2),
        paddingBottom: theme.spacing(2),
        "&:last-child": {
          paddingBottom: theme.spacing(2),
        },
      },
    }),
  },
};

const MuiCardContent: Components<Theme>["MuiCardContent"] = {
  styleOverrides: {
    root: ({ theme }) => ({
      padding: theme.spacing(2),
      paddingBottom: theme.spacing(2),
      "&:last-child": {
        paddingBottom: theme.spacing(2),
      },
    }),
  },
};

export const card: Components<Theme> = {
  MuiCard,
  MuiCardContent,
};
