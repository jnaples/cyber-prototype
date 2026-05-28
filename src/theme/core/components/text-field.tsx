import type { Components, Theme } from "@mui/material/styles";

const MuiTextField: Components<Theme>["MuiTextField"] = {
  defaultProps: {
    size: "small",
  },
};

export const textField: Components<Theme> = {
  MuiTextField,
};
