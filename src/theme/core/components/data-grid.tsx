import type { Components, Theme } from "@mui/material";
import { alpha } from "@mui/material";

import { StandardFilterPanel } from "./standard-filter-panel";

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
      // Selected row uses the same primary tint as a selected menu item, so
      // "selected" reads consistently between grids and dropdowns.
      "& .MuiDataGrid-row.Mui-selected": {
        backgroundColor: alpha(theme.palette.primary.main, 0.24),
        "&:hover": {
          backgroundColor: alpha(theme.palette.primary.main, 0.32),
        },
      },
    }),
  },
};

export const dataGrid: Components<Theme> = {
  MuiDataGrid,
};
