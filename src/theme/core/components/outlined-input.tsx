import type { Components, Theme } from "@mui/material/styles";

const MuiOutlinedInput: Components<Theme>["MuiOutlinedInput"] = {
  defaultProps: {
    size: "small",
  },
  styleOverrides: {
    root: ({ theme }) => ({
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.vars.palette.action.disabled,
      },
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.vars.palette.text.primary,
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.vars.palette.primary.main,
      },
      "&.Mui-error .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.vars.palette.error.main,
      },
      "&.Mui-disabled .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.vars.palette.divider,
      },
    }),
  },
};

export const outlinedInput: Components<Theme> = {
  MuiOutlinedInput,
};
