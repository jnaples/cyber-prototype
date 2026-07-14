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
      // Placeholder color for enabled inputs; disabled inputs keep the
      // default muted state.
      "&:not(.Mui-disabled) input::placeholder, &:not(.Mui-disabled) textarea::placeholder":
        {
          color: theme.vars.palette.text.secondary,
          opacity: 1,
        },
      // Neutralize the browser autofill highlight (the blue/gray fill) so
      // autofilled inputs keep the normal paper background.
      "& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active":
        {
          WebkitBoxShadow: `0 0 0 1000px ${theme.vars.palette.background.paper} inset`,
          WebkitTextFillColor: theme.vars.palette.text.primary,
          caretColor: theme.vars.palette.text.primary,
          transition: "background-color 9999s ease-in-out 0s",
        },
    }),
  },
};

export const outlinedInput: Components<Theme> = {
  MuiOutlinedInput,
};
