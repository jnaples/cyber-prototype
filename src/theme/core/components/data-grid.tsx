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
      // Selection checkboxes are 20px in every grid. MUI's own default is the
      // 24px medium icon, which reads heavy beside 14px row text — and setting
      // it here covers the header's select-all and every row, in any grid,
      // rather than per page.
      "& .MuiDataGrid-checkboxInput .MuiSvgIcon-root": {
        fontSize: 20,
      },
      // Action-column buttons (e.g. the row ellipsis) always use the secondary
      // text button color, wherever an "actions" column appears. Disabled ones
      // are excluded — this selector outranks a button's own `sx`, so without
      // the exclusion an unavailable action still paints as if it were live.
      "& .MuiDataGrid-cell[data-field='actions'] .MuiIconButton-root:not(.Mui-disabled)":
        {
          color: theme.vars.palette.secondary.main,
        },
      // Selected row uses the same primary tint as a selected menu item, so
      // "selected" reads consistently between grids and dropdowns.
      "& .MuiDataGrid-row.Mui-selected": {
        backgroundColor: alpha(theme.palette.primary.main, 0.08),
        "&:hover": {
          backgroundColor: alpha(theme.palette.primary.main, 0.12),
        },
      },
    }),
  },
};

export const dataGrid: Components<Theme> = {
  MuiDataGrid,
};
