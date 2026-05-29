import type { Components, Theme } from "@mui/material";
import { createTheme, ThemeProvider, useTheme } from "@mui/material";
import { GridFilterPanel } from "@mui/x-data-grid";
import React from "react";

function StandardFilterPanel(
  props: React.ComponentProps<typeof GridFilterPanel>,
) {
  const outer = useTheme();
  const inner = React.useMemo(
    () =>
      createTheme({
        ...outer,
        components: {
          ...outer.components,
          MuiTextField: {
            defaultProps: { size: "small" },
          },
          MuiFormControl: {
            defaultProps: { size: "small" },
          },
        },
      }),
    [outer],
  );

  return (
    <ThemeProvider theme={inner}>
      <GridFilterPanel {...props} />
    </ThemeProvider>
  );
}

const MuiDataGrid: Components<Theme>["MuiDataGrid"] = {
  defaultProps: {
    slots: { filterPanel: StandardFilterPanel },
  },
  styleOverrides: {
    root: ({ theme }) => ({
      "& .MuiDataGrid-columnHeader, & .MuiDataGrid-container--top [role='row'], & .MuiDataGrid-filler":
        {
          backgroundColor: theme.vars.palette.background.gridHeader,
        },
    }),
  },
};

export const dataGrid: Components<Theme> = {
  MuiDataGrid,
};
