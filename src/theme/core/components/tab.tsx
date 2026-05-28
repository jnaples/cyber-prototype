import type { Components, Theme } from "@mui/material";

const MuiTab: Components<Theme>["MuiTab"] = {
  defaultProps: {
    // position icon to the start (left) by default
    iconPosition: "start",
  },
  styleOverrides: {
    root: ({ theme }) => ({
      textTransform: "none",
      fontWeight: 400,
      fontSize: "13px",
      // ensure consistent line-height and letter-spacing
      lineHeight: 1.2,
      letterSpacing: 0,
      // Inactive tabs use secondary text color; prefer CSS vars when available
      color:
        theme.vars?.palette?.text?.secondary ?? theme.palette.text.secondary,
      // Size and spacing requirements
      height: 32,
      minHeight: 32,
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "start",
      minWidth: 90,
      gap: theme.spacing(1), // 8px gap between icon and label
      // Left and right padding: 4px, top/bottom 0
      padding: theme.spacing(0, 0.5),
      boxSizing: "border-box",
      // ensure tab aligns to bottom of parent (pushes content to bottom)
      alignSelf: "flex-end",
      // Selected tabs use the theme text primary for text and icon
      "&.Mui-selected": {
        marginBottom: 0,
        color: theme.vars?.palette?.text?.primary ?? theme.palette.text.primary,
        "& .MuiSvgIcon-root": {
          color:
            theme.vars?.palette?.text?.primary ?? theme.palette.text.primary,
        },
      },
    }),
    icon: () => ({
      width: 20,
      height: 20,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 0,
      color: "inherit",
      // ensure svg inside respects the size and inherit color
      "& .MuiSvgIcon-root": {
        width: 20,
        height: 20,
        color: "inherit",
      },
    }),
  },
};

const MuiTabs: Components<Theme>["MuiTabs"] = {
  styleOverrides: {
    root: () => ({
      minHeight: 40,
      // align tabs content to the bottom of the container
      alignItems: "flex-end",
    }),
    scroller: ({ theme }) => ({
      minHeight: 40,
      display: "flex",
      alignContent: "flex-end",
      gap: theme.spacing(2),
    }),
    // ensure the inner list uses align-content: end
    list: ({ theme }) => ({
      alignContent: "flex-end",
      gap: theme.spacing(2),
      columnGap: theme.spacing(2),
    }),
    indicator: ({ theme }) => ({
      // make the indicator sit inside the active tab at the very bottom
      height: 2,
      backgroundColor:
        theme.vars?.palette?.primary?.main ?? theme.palette.primary.main,
      bottom: 0,
      zIndex: theme.zIndex.appBar + 1,
    }),
  },
};

export const tab: Components<Theme> = {
  MuiTab,
  MuiTabs,
};
