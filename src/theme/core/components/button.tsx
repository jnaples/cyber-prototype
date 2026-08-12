import type { Components, Theme } from "@mui/material";

const MuiButton: Components<Theme>["MuiButton"] = {
  defaultProps: {
    size: "small",
  },
  styleOverrides: {
    root: ({ theme }) => ({
      lineHeight: "22px",
      // Show the not-allowed cursor on hover for disabled buttons (MUI
      // disables pointer events by default, so no cursor shows). The disabled
      // attribute still blocks clicks.
      "&.Mui-disabled": {
        pointerEvents: "auto",
        cursor: "not-allowed",
      },
      "&.MuiButton-containedPrimary, &.MuiButton-containedSecondary": {
        boxShadow:
          "rgba(0, 0, 0, 0.2) 0px 3px 1px -2px, rgba(0, 0, 0, 0.14) 0px 2px 2px 0px, rgba(0, 0, 0, 0.12) 0px 1px 5px 0px",
        "&:hover": {
          boxShadow:
            "rgba(0, 0, 0, 0.2) 0px 2px 4px -1px, rgba(0, 0, 0, 0.14) 0px 4px 5px 0px, rgba(0, 0, 0, 0.12) 0px 1px 10px 0px",
        },
      },
      // Re-enabling pointer events (above) also re-enables MUI's hover
      // background/shadow on disabled buttons — suppress that so a disabled
      // button looks identical hovered or not.
      "&.Mui-disabled:hover": {
        backgroundColor: "transparent",
        boxShadow: "none",
      },
      "&.MuiButton-contained.Mui-disabled:hover": {
        backgroundColor: theme.vars.palette.action.disabledBackground,
      },
    }),
    sizeSmall: {
      fontSize: "13px",
    },
    text: ({ theme }) => ({
      paddingLeft: "10px",
      paddingRight: "10px",
      "&.MuiButton-colorPrimary": {
        color: theme.vars.palette.primary.light,
      },
    }),
  },
};

const MuiIconButton: Components<Theme>["MuiIconButton"] = {
  styleOverrides: {
    root: ({ theme }) => ({
      "&.Mui-disabled": {
        pointerEvents: "auto",
        cursor: "not-allowed",
      },
      // See primary-on-dark: non-button primary accents lighten on dark.
      ...theme.applyStyles("dark", {
        "&.MuiIconButton-colorPrimary": {
          color: theme.vars.palette.primary.light,
        },
      }),
    }),
  },
};

export const button: Components<Theme> = {
  MuiButton,
  MuiIconButton,
};
