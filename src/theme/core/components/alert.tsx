import type { Components, Theme } from "@mui/material/styles";

// Alert titles are always semi-bold (600) across the app.
const MuiAlertTitle: Components<Theme>["MuiAlertTitle"] = {
  styleOverrides: {
    root: {
      fontWeight: 600,
    },
  },
};

// A filled red or amber banner carries white type on dark, like the buttons
// and chips beside it.
const MuiAlert: Components<Theme>["MuiAlert"] = {
  styleOverrides: {
    root: ({ theme }) => ({
      ...theme.applyStyles("dark", {
        "&.MuiAlert-filled.MuiAlert-colorError, &.MuiAlert-filled.MuiAlert-colorWarning":
          {
            color: theme.vars.palette.common.white,
            "& .MuiAlert-icon": { color: theme.vars.palette.common.white },
          },
      }),
    }),
  },
};

export const alert: Components<Theme> = {
  MuiAlert,
  MuiAlertTitle,
};
