import type { Components, Theme } from "@mui/material";

const MuiCircularProgress: Components<Theme>["MuiCircularProgress"] = {
  defaultProps: {
    color: "primary",
  },
};

export const circularProgress: Components<Theme> = {
  MuiCircularProgress,
};
