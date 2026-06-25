import type { Components, Theme } from "@mui/material";

const MuiCardContent: Components<Theme>["MuiCardContent"] = {
  styleOverrides: {
    root: ({ theme }) => ({
      padding: theme.spacing(2),
      paddingTop: theme.spacing(0),
      paddingBottom: theme.spacing(2),
      "&:last-child": {
        paddingBottom: theme.spacing(2),
      },
    }),
  },
};

const MuiCardHeader: Components<Theme>["MuiCardHeader"] = {
  defaultProps: {
    // Card titles use the cardTitle typography variant — never hard-code sizes.
    // MUI's CardHeader reads the title variant from slotProps.title (the older
    // titleTypographyProps API is ignored in this version).
    slotProps: { title: { variant: "cardTitle" } },
  },
  styleOverrides: {
    // 12px top/bottom padding on every card title (horizontal stays default).
    root: ({ theme }) => ({
      paddingTop: theme.spacing(1.5),
      paddingBottom: theme.spacing(1.5),
    }),
  },
};

export const card: Components<Theme> = {
  MuiCardContent,
  MuiCardHeader,
};
