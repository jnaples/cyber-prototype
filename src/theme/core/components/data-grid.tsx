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
      // Action-column buttons (e.g. the row ellipsis) always use the secondary
      // text button color, wherever an "actions" column appears.
      "& .MuiDataGrid-cell[data-field='actions'] .MuiIconButton-root": {
        color: theme.vars.palette.secondary.main,
      },
    }),
  },
};

export const dataGrid: Components<Theme> = {
  MuiDataGrid,
};
