import { formLabelClasses } from "@mui/material/FormLabel";
import type { Components, Theme } from "@mui/material/styles";

const MuiFormControl: Components<Theme>["MuiFormControl"] = {
  defaultProps: {
    size: "small",
  },
};

/**
 * Applies label styles to TextField and Select.
 */
const MuiInputLabel: Components<Theme>["MuiInputLabel"] = {
  styleOverrides: {
    root: ({ theme }) => ({
      ...theme.typography.body2,
      fontWeight: 600,
      color: theme.vars.palette.text.primary,
      [`&.${formLabelClasses.focused}:not(.${formLabelClasses.error})`]: {
        color: theme.vars.palette.text.primary,
      },
      [`&.${formLabelClasses.disabled}`]: {
        color: theme.vars.palette.action.disabledBackground,
      },
    }),
  },
};

const MuiFormControlLabel: Components<Theme>["MuiFormControlLabel"] = {
  styleOverrides: {
    label: ({ theme }) => ({
      ...theme.typography.body2,
      fontWeight: 600,
      color: theme.vars.palette.text.primary,
    }),
  },
};

export const form: Components<Theme> = {
  MuiInputLabel,
  MuiFormControl,
  MuiFormControlLabel,
};
