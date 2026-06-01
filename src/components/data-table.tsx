import {
  Button,
  CircularProgress,
  Divider,
  InputAdornment,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Pagination,
  PaginationItem,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import Box from "@mui/material/Box";
import { createTheme, ThemeProvider, useTheme } from "@mui/material/styles";
import {
  DataGrid,
  type DataGridProps,
  type GridColDef,
  gridColumnDefinitionsSelector,
  gridColumnVisibilityModelSelector,
  GridFilterPanel,
  gridPageCountSelector,
  gridPageSelector,
  gridPageSizeSelector,
  GridPreferencePanelsValue,
  gridRowCountSelector,
  useGridApiContext,
  useGridApiRef,
  useGridSelector,
} from "@mui/x-data-grid";
import React, { useState } from "react";

const DEFAULT_PAGE_SIZE_OPTIONS = [25, 50, 100, 200];

// ---------------------------------------------------------------------------
// Internal sub-components (not exported)
// ---------------------------------------------------------------------------

function CustomPagination({
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
}: {
  pageSizeOptions?: number[];
}) {
  const apiRef = useGridApiContext();
  const page = useGridSelector(apiRef, gridPageSelector);
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);
  const pageSize = useGridSelector(apiRef, gridPageSizeSelector);
  const rowCount = useGridSelector(apiRef, gridRowCountSelector);

  const startRow = page * pageSize + 1;
  const endRow = Math.min((page + 1) * pageSize, rowCount);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        px: 2,
        py: 1,
        width: "100%",
        justifyContent: "flex-end",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Rows per page:
        </Typography>
        <Select
          size="small"
          value={pageSize}
          onChange={(e) => apiRef.current.setPageSize(Number(e.target.value))}
          sx={{
            minWidth: 70,
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
          }}
        >
          {pageSizeOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </Box>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {startRow}–{endRow} of {rowCount}
      </Typography>
      <Pagination
        color="primary"
        shape="rounded"
        page={page + 1}
        count={pageCount}
        renderItem={(props) => (
          <PaginationItem
            {...props}
            sx={{
              ...((props.type === "previous" || props.type === "next") && {
                border: "none",
              }),
              "&.Mui-selected": {
                borderRadius: "999px !important",
                border: "none !important",
                backgroundColor: "primary.main",
                color: "#fff !important",
                "&:hover": {
                  backgroundColor: "primary.dark",
                },
              },
            }}
          />
        )}
        onChange={(_event, value) => apiRef.current.setPage(value - 1)}
      />
    </Box>
  );
}

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
            defaultProps: { variant: "standard", size: "small" },
          },
          MuiFormControl: {
            defaultProps: { variant: "standard", size: "small" },
          },
          MuiSelect: {
            defaultProps: { variant: "standard" },
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

function CustomColumnsPanel() {
  const apiRef = useGridApiContext();
  const [search, setSearch] = useState("");

  const allColumns = useGridSelector(apiRef, gridColumnDefinitionsSelector);
  const visibilityModel = useGridSelector(
    apiRef,
    gridColumnVisibilityModelSelector,
  );
  const toggleable = allColumns.filter(
    (col) => col.field !== "__check__" && col.hideable !== false,
  );

  const filtered = toggleable.filter((col) =>
    (col.headerName ?? col.field).toLowerCase().includes(search.toLowerCase()),
  );

  const isVisible = (field: string) => visibilityModel[field] !== false;

  const visibleCount = toggleable.filter((col) => isVisible(col.field)).length;

  const handleToggle = (field: string) => {
    apiRef.current.setColumnVisibility(field, !isVisible(field));
  };

  const handleShowAll = () => {
    const model: Record<string, boolean> = {};
    toggleable.forEach((col) => {
      model[col.field] = true;
    });
    apiRef.current.setColumnVisibilityModel(model);
  };

  const handleHideAll = () => {
    const model: Record<string, boolean> = {};
    toggleable.forEach((col) => {
      model[col.field] = false;
    });
    apiRef.current.setColumnVisibilityModel(model);
  };

  return (
    <Box sx={{ width: 300, p: 2 }}>
      <TextField
        fullWidth
        size="small"
        placeholder="Find column"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 1 }}
      />
      <Divider />
      <Box sx={{ maxHeight: 350, overflowY: "auto", py: 1 }}>
        {filtered.map((col) => (
          <Box
            key={col.field}
            sx={{
              display: "flex",
              alignItems: "center",
              py: 0.25,
              px: 1,
              cursor: "pointer",
              "&:hover": { backgroundColor: "action.hover" },
              borderRadius: 1,
            }}
            onClick={() => handleToggle(col.field)}
          >
            <Switch
              size="small"
              checked={isVisible(col.field)}
              color="primary"
              sx={{ mr: 1 }}
            />
            <Typography variant="body2">
              {col.headerName ?? col.field}
            </Typography>
          </Box>
        ))}
      </Box>
      <Divider />
      <Box sx={{ display: "flex", justifyContent: "space-between", pt: 1.5 }}>
        <Button
          size="small"
          onClick={handleHideAll}
          sx={{ textTransform: "uppercase", fontWeight: 600 }}
        >
          Hide all
        </Button>
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", alignSelf: "center" }}
        >
          {visibleCount} of {toggleable.length}
        </Typography>
        <Button
          size="small"
          onClick={handleShowAll}
          sx={{ textTransform: "uppercase", fontWeight: 600 }}
        >
          Show all
        </Button>
      </Box>
    </Box>
  );
}

function LoadingOverlay() {
  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CircularProgress aria-label="Loading…" />
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface DefaultViewOption {
  label: string;
  value: string;
}

export interface DataTableProps {
  rows: DataGridProps["rows"];
  columns: GridColDef[];
  checkboxSelection?: boolean;
  initialPageSize?: number;
  pageSizeOptions?: number[];
  density?: "compact" | "standard" | "comfortable";
  showSearch?: boolean;
  showFilters?: boolean;
  showDefaultView?: boolean;
  defaultViewOptions?: DefaultViewOption[];
  showPreferences?: boolean;
  showExport?: boolean;
  loading?: boolean;
  noRowsOverlay?: React.ComponentType;
  onSearchChange?: (query: string) => void;
  onDefaultViewChange?: (value: string) => void;
  onFiltersClick?: () => void;
  onExportClick?: () => void;
  columnVisibilityModel?: Record<string, boolean>;
  onColumnVisibilityModelChange?: (model: Record<string, boolean>) => void;
  pinnedShadowFields?: { left?: string; right?: string };
  sx?: DataGridProps["sx"];
}

export function DataTable({
  rows,
  columns,
  checkboxSelection = true,
  initialPageSize = 25,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  density = "compact",
  showSearch = true,
  showFilters = true,
  showDefaultView = true,
  defaultViewOptions = [
    { label: "All", value: "all" },
    { label: "Default", value: "default" },
    { label: "Investigative", value: "investigative" },
    { label: "Compliance Audit", value: "compliance-audit" },
  ],
  showPreferences = true,
  showExport = true,
  loading = false,
  noRowsOverlay,
  onSearchChange,
  onDefaultViewChange,
  onFiltersClick,
  onExportClick,
  columnVisibilityModel,
  onColumnVisibilityModelChange,
  pinnedShadowFields,
  sx: sxOverrides,
}: DataTableProps) {
  const apiRef = useGridApiRef();
  const [searchQuery, setSearchQuery] = useState("");
  const [preferencesAnchorEl, setPreferencesAnchorEl] =
    useState<null | HTMLElement>(null);
  const [defaultViewAnchorEl, setDefaultViewAnchorEl] =
    useState<null | HTMLElement>(null);
  const [filtersButtonEl, setFiltersButtonEl] = useState<null | HTMLElement>(
    null,
  );
  const [panelTarget, setPanelTarget] = useState<null | HTMLElement>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    onSearchChange?.(val);
  };

  // Wrap each column with a default `renderHeader` so the auto-tooltip on
  // hover doesn't fire. MUI X's default header content shows a Tooltip
  // wrapping the title text (with description or truncated headerName) —
  // replacing the title slot with a plain span suppresses it. Sort/filter/menu
  // icons live outside renderHeader and still work normally.
  const processedColumns = React.useMemo(
    () =>
      columns.map((col) => ({
        ...col,
        renderHeader:
          col.renderHeader ??
          (() => (
            <span style={{ fontWeight: 600 }}>{col.headerName}</span>
          )),
      })),
    [columns],
  );

  // Generic search: filter by all string/number values in each row
  const filteredRows = React.useMemo(() => {
    if (!searchQuery) return rows;
    if (onSearchChange) return rows; // parent handles filtering
    const query = searchQuery.toLowerCase();
    return (rows ?? []).filter((row: Record<string, unknown>) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(query),
      ),
    );
  }, [rows, searchQuery, onSearchChange]);

  // Pinned shadow styles
  const pinnedSx: Record<string, unknown> = {};
  if (pinnedShadowFields?.left) {
    pinnedSx[`& .MuiDataGrid-cell[data-field='${pinnedShadowFields.left}']`] = {
      boxShadow: "rgba(0, 0, 0, 0.21) 2px 0px 4px -2px",
    };
    pinnedSx[
      `& .MuiDataGrid-columnHeader[data-field='${pinnedShadowFields.left}']`
    ] = {
      boxShadow: "rgba(0, 0, 0, 0.21) 2px 0px 4px -2px",
    };
  }
  if (pinnedShadowFields?.right) {
    pinnedSx[`& .MuiDataGrid-cell[data-field='${pinnedShadowFields.right}']`] =
      {
        boxShadow: "rgba(0, 0, 0, 0.21) -2px 0px 4px -2px",
      };
    pinnedSx[
      `& .MuiDataGrid-columnHeader[data-field='${pinnedShadowFields.right}']`
    ] = {
      boxShadow: "rgba(0, 0, 0, 0.21) -2px 0px 4px -2px",
    };
  }

  const showToolbar =
    showFilters || showDefaultView || showPreferences || showExport;

  return (
    <>
      {showSearch && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            px: 2,
            py: 1.5,
            borderTop: "1px solid",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <TextField
            size="small"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearchChange}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 20, color: "inherit" }}
                    >
                      search
                    </span>
                  </InputAdornment>
                ),
              },
            }}
            sx={{ width: 250 }}
          />
        </Box>
      )}

      {showToolbar && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1,
          }}
        >
          {showFilters ? (
            <Button
              ref={setFiltersButtonEl}
              variant="text"
              color="secondary"
              size="small"
              onClick={() => {
                if (onFiltersClick) {
                  onFiltersClick();
                } else {
                  setPanelTarget(filtersButtonEl);
                  apiRef.current?.showFilterPanel();
                }
              }}
              startIcon={
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 20 }}
                >
                  filter_alt
                </span>
              }
              sx={{ color: "text.primary" }}
            >
              Filters
            </Button>
          ) : (
            <Box />
          )}

          <Box sx={{ display: "flex", alignItems: "center" }}>
            {showDefaultView && (
              <>
                <Button
                  variant="outlined"
                  color="secondary"
                  size="medium"
                  onClick={(e) => setDefaultViewAnchorEl(e.currentTarget)}
                  startIcon={
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 20 }}
                    >
                      view_column
                    </span>
                  }
                  sx={{ px: "8px", mr: "4px" }}
                >
                  <span style={{ marginRight: "8px" }}>Default</span>
                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{
                      my: "-5px",
                      mx: "4px",
                      borderColor: "currentColor",
                      opacity: 0.5,
                    }}
                  />
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 20 }}
                  >
                    arrow_drop_down
                  </span>
                </Button>
                <Menu
                  anchorEl={defaultViewAnchorEl}
                  open={Boolean(defaultViewAnchorEl)}
                  onClose={() => setDefaultViewAnchorEl(null)}
                  anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                  transformOrigin={{ vertical: "top", horizontal: "left" }}
                >
                  {defaultViewOptions.map((opt) => (
                    <MenuItem
                      key={opt.value}
                      onClick={() => {
                        setDefaultViewAnchorEl(null);
                        onDefaultViewChange?.(opt.value);
                      }}
                    >
                      <ListItemText>{opt.label}</ListItemText>
                    </MenuItem>
                  ))}
                </Menu>
              </>
            )}

            {showPreferences && (
              <>
                <Button
                  variant="text"
                  color="secondary"
                  size="small"
                  onClick={(e) => setPreferencesAnchorEl(e.currentTarget)}
                  startIcon={
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 20 }}
                    >
                      tune
                    </span>
                  }
                  sx={{ color: "text.primary" }}
                >
                  Preferences
                </Button>
                <Menu
                  anchorEl={preferencesAnchorEl}
                  open={Boolean(preferencesAnchorEl)}
                  onClose={() => setPreferencesAnchorEl(null)}
                  anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                  transformOrigin={{ vertical: "top", horizontal: "left" }}
                >
                  <MenuItem
                    onClick={() => {
                      setPanelTarget(preferencesAnchorEl);
                      setPreferencesAnchorEl(null);
                      apiRef.current?.showPreferences(
                        GridPreferencePanelsValue.columns,
                      );
                    }}
                  >
                    <ListItemIcon sx={{ color: "text.primary" }}>
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: 20 }}
                      >
                        view_column
                      </span>
                    </ListItemIcon>
                    <ListItemText>Columns</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={() => setPreferencesAnchorEl(null)}>
                    <ListItemIcon sx={{ color: "text.primary" }}>
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: 20 }}
                      >
                        density_small
                      </span>
                    </ListItemIcon>
                    <ListItemText>Density</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={() => setPreferencesAnchorEl(null)}>
                    <ListItemIcon sx={{ color: "text.primary" }}>
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: 20 }}
                      >
                        save
                      </span>
                    </ListItemIcon>
                    <ListItemText>Save View</ListItemText>
                  </MenuItem>
                </Menu>
              </>
            )}

            {showExport && (
              <Button
                variant="text"
                color="secondary"
                size="small"
                onClick={onExportClick}
                startIcon={
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 20 }}
                  >
                    download
                  </span>
                }
                sx={{ color: "text.primary" }}
              >
                Export
              </Button>
            )}
          </Box>
        </Box>
      )}

      <Box sx={{ minWidth: 0, width: "100%", overflowX: "auto" }}>
        {(
          <DataGrid
            apiRef={apiRef}
            rows={filteredRows}
            columns={processedColumns}
            density={density}
            initialState={{
              pagination: {
                paginationModel: { pageSize: initialPageSize },
              },
            }}
            pageSizeOptions={pageSizeOptions}
            checkboxSelection={checkboxSelection}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={onColumnVisibilityModelChange}
            disableRowSelectionOnClick
            loading={loading}
            slots={{
              pagination: CustomPagination,
              columnsManagement: CustomColumnsPanel,
              filterPanel: StandardFilterPanel,
              loadingOverlay: LoadingOverlay,
              ...(noRowsOverlay ? { noRowsOverlay } : {}),
            }}
            slotProps={{
              pagination: { pageSizeOptions } as never,
              panel: { target: panelTarget },
            }}
            sx={{
              width: "100%",
              border: "none",
              backgroundColor: "transparent",
              "--DataGrid-overlayHeight": "320px",
              "& .MuiDataGrid-virtualScroller": {
                overflowX: "auto",
              },
              "& .MuiDataGrid-main": {
                backgroundColor: "transparent",
              },
              "& .MuiDataGrid-columnHeaders, & .MuiDataGrid-columnHeader": {
                backgroundColor:
                  "var(--dnsf-palette-background-gridHeader) !important",
              },
              "--DataGrid-containerBackground":
                "var(--dnsf-palette-background-gridHeader)",
              "& .MuiDataGrid-columnHeaderTitle": {
                fontFamily: "'Inter Variable', sans-serif",
                fontWeight: 600,
                fontSize: "14px",
              },
              "& .MuiDataGrid-cell": {
                borderBottom: "1px solid #E0E0E0 !important",
              },
              '[data-mui-color-scheme="dark"] & .MuiDataGrid-cell': {
                borderBottom:
                  "1px solid var(--dnsf-palette-divider) !important",
              },
              "& .MuiDataGrid-columnSeparator": {
                visibility: "hidden",
                color: "text.disabled",
              },
              "& .MuiDataGrid-columnHeader:hover .MuiDataGrid-columnSeparator":
                {
                  visibility: "visible",
                },
              "& .MuiCheckbox-root .MuiSvgIcon-root": {
                width: 18,
                height: 18,
              },
              "& .MuiDataGrid-footerContainer": {
                borderTop: "1px solid #E0E0E0 !important",
              },
              '[data-mui-color-scheme="dark"] & .MuiDataGrid-footerContainer': {
                borderTop: "1px solid var(--dnsf-palette-divider) !important",
              },
              "& .MuiDataGrid-row:last-child .MuiDataGrid-cell": {
                borderBottom: "none !important",
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "action.hover",
              },
              ...pinnedSx,
              ...(sxOverrides as Record<string, unknown>),
            }}
          />
        )}
      </Box>
    </>
  );
}
