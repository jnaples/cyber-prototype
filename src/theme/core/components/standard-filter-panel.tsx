import { createTheme, ThemeProvider, useTheme } from "@mui/material";
import { GridFilterPanel } from "@mui/x-data-grid";
import React from "react";

// The DataGrid filter panel, re-themed so its inputs default to size="small"
// to match the rest of the app.
export function StandardFilterPanel(
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
