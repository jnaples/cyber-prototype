import {
  Button,
  Chip,
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
  type GridFilterItem,
  type GridFilterModel,
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

const DEFAULT_PAGE_SIZE_OPTIONS = [25, 50, 100];

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
          onChange={(e) =>
            apiRef.current?.setPaginationModel({
              pageSize: Number(e.target.value),
              page: 0,
            })
          }
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

const OPERATOR_LABELS: Record<string, string> = {
  range: "spans",
  contains: "contains",
  equals: "equals",
  startsWith: "starts with",
  endsWith: "ends with",
  isAnyOf: "is any of",
  isEmpty: "is empty",
  isNotEmpty: "is not empty",
  is: "is",
  not: "is not",
  after: "after",
  before: "before",
  onOrAfter: "on or after",
  onOrBefore: "on or before",
};

function formatFilterOperator(op: string): string {
  return OPERATOR_LABELS[op] ?? op;
}

const DATETIME_LOCAL_RE =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:?\d{2})?$/;

function formatDateLike(d: Date, hasTime: boolean): string {
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(hasTime
      ? {
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }
      : {}),
  });
}

function formatFilterValue(v: unknown): string {
  if (v == null || v === "") return "";
  if (Array.isArray(v)) {
    return v.map(formatFilterValue).filter(Boolean).join(" - ");
  }
  if (v instanceof Date) {
    return formatDateLike(v, true);
  }
  if (typeof v === "string" && DATETIME_LOCAL_RE.test(v)) {
    const d = new Date(v);
    if (!Number.isNaN(d.getTime())) return formatDateLike(d, true);
  }
  return String(v);
}

function hasFilterValue(item: GridFilterItem): boolean {
  const v = item.value;
  if (v === undefined || v === null || v === "") return false;
  if (Array.isArray(v) && v.every((x) => x == null || x === "")) return false;
  return true;
}

const TIME_WINDOW_PRESETS_SECONDS = [5, 10, 15] as const;

function TimeWindowChip({
  filterItem,
  onUpdate,
}: {
  filterItem: GridFilterItem;
  onUpdate: (item: GridFilterItem) => void;
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const value = Array.isArray(filterItem.value)
    ? (filterItem.value as [string, string])
    : ["", ""];
  const startMs = value[0] ? new Date(value[0]).getTime() : NaN;
  const endMs = value[1] ? new Date(value[1]).getTime() : NaN;
  const validRange =
    Number.isFinite(startMs) && Number.isFinite(endMs) && endMs >= startMs;
  if (!validRange) return null;
  const centerMs = (startMs + endMs) / 2;
  const halfSec = Math.round((endMs - startMs) / 2 / 1000);
  const currentLabel = `±${halfSec}s`;

  const pick = (sec: number) => {
    const newStart = new Date(centerMs - sec * 1000).toISOString();
    const newEnd = new Date(centerMs + sec * 1000).toISOString();
    onUpdate({ ...filterItem, value: [newStart, newEnd] });
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        variant="outlined"
        color="secondary"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        endIcon={
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 20 }}
          >
            arrow_drop_down
          </span>
        }
      >
        Time Window
        <span style={{ textTransform: "none", marginLeft: 4 }}>
          {currentLabel}
        </span>
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{
          paper: {
            sx: { minWidth: anchorEl?.offsetWidth },
          },
        }}
      >
        {TIME_WINDOW_PRESETS_SECONDS.map((sec) => (
          <MenuItem
            key={sec}
            selected={sec === halfSec}
            onClick={() => pick(sec)}
          >
            ±{sec}s
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

function ActiveFiltersBar({
  items,
  columns,
  onRemove,
  onClearAll,
  onUpdate,
  timeRangeField,
}: {
  items: GridFilterItem[];
  columns: GridColDef[];
  onRemove: (item: GridFilterItem) => void;
  onClearAll: () => void;
  onUpdate: (item: GridFilterItem) => void;
  timeRangeField?: string;
}) {
  const timeRangeFilter = timeRangeField
    ? items.find(
        (it) => it.field === timeRangeField && it.operator === "range",
      )
    : undefined;
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 1.5,
        mx: 2,
        my: 1,
      }}
    >
      <Typography
        variant="caption"
        sx={{ fontWeight: 700, color: "text.primary" }}
      >
        Active Filters:
      </Typography>
      {items.map((item, idx) => {
        const col = columns.find((c) => c.field === item.field);
        const fieldLabel = col?.headerName ?? item.field;
        const opLabel = formatFilterOperator(item.operator);
        const valLabel = formatFilterValue(item.value);
        const chipLabel = [opLabel, valLabel].filter(Boolean).join(" ");
        return (
          <Box
            key={item.id ?? `${item.field}-${idx}`}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              px: 1,
              py: 0.5,
              border: "1px dashed",
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: "text.primary" }}
            >
              {fieldLabel}:
            </Typography>
            <Chip
              size="small"
              label={chipLabel}
              onDelete={() => onRemove(item)}
              sx={{ borderRadius: (t) => t.spacing(1) }}
            />
          </Box>
        );
      })}
      {timeRangeFilter && (
        <TimeWindowChip filterItem={timeRangeFilter} onUpdate={onUpdate} />
      )}
      <Button
        variant="text"
        color="error"
        size="small"
        onClick={onClearAll}
        startIcon={
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            close
          </span>
        }
      >
        Clear
      </Button>
    </Box>
  );
}

function FilterPanelFooter() {
  const apiRef = useGridApiContext();

  const handleAddFilter = () => {
    const filterableColumns = apiRef.current
      .getAllColumns()
      .filter((c) => c.filterable !== false && c.field !== "__check__");
    const firstColumn = filterableColumns[0];
    if (!firstColumn) return;
    const defaultOperator =
      firstColumn.filterOperators?.[0]?.value ?? "contains";
    const existingItems = apiRef.current.state.filter.filterModel.items;
    apiRef.current.upsertFilterItems([
      ...existingItems,
      {
        id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        field: firstColumn.field,
        operator: defaultOperator,
      },
    ]);
  };

  const handleRemoveAll = () => {
    apiRef.current.setFilterModel({ items: [] });
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        p: 1,
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      <Button
        variant="text"
        color="primary"
        onClick={handleAddFilter}
        startIcon={
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            add
          </span>
        }
      >
        Add Filter
      </Button>
      <Button
        variant="text"
        color="primary"
        onClick={handleRemoveAll}
        startIcon={
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            delete
          </span>
        }
      >
        Remove All
      </Button>
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
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <GridFilterPanel {...props} />
        <FilterPanelFooter />
      </Box>
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
  /**
   * Controlled current view. When provided, the parent owns the selection
   * and the DataTable will not maintain its own internal state — useful when
   * external actions need to swap the view programmatically.
   */
  defaultView?: string;
  showPreferences?: boolean;
  showExport?: boolean;
  showRefresh?: boolean;
  /**
   * Field name of a column that uses a "range" filter operator with a
   * [startISO, endISO] value tuple. When set, an extra ±Ns time-window chip
   * appears in the Active Filters bar, letting users quickly resize the range
   * around its midpoint.
   */
  timeRangeField?: string;
  loading?: boolean;
  noRowsOverlay?: React.ComponentType;
  onSearchChange?: (query: string) => void;
  onDefaultViewChange?: (value: string) => void;
  onFiltersClick?: () => void;
  onExportClick?: () => void;
  onRefreshClick?: () => void;
  columnVisibilityModel?: Record<string, boolean>;
  onColumnVisibilityModelChange?: (model: Record<string, boolean>) => void;
  rowSelectionModel?: DataGridProps["rowSelectionModel"];
  onRowSelectionModelChange?: DataGridProps["onRowSelectionModelChange"];
  getRowClassName?: DataGridProps["getRowClassName"];
  /** Notified whenever the grid's filter model changes (add/edit/clear). */
  onFilterModelChange?: (model: GridFilterModel) => void;
  bulkActions?: React.ReactNode;
  pinnedShadowFields?: { left?: string; right?: string };
  /** Grouped column headers (e.g. spanning header over several columns). */
  columnGroupingModel?: DataGridProps["columnGroupingModel"];
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
  defaultView,
  showPreferences = true,
  showExport = true,
  showRefresh = true,
  timeRangeField,
  loading = false,
  noRowsOverlay,
  onSearchChange,
  onDefaultViewChange,
  onFiltersClick,
  onExportClick,
  onRefreshClick,
  columnVisibilityModel,
  onColumnVisibilityModelChange,
  rowSelectionModel,
  onRowSelectionModelChange,
  getRowClassName,
  onFilterModelChange,
  bulkActions,
  pinnedShadowFields,
  columnGroupingModel,
  sx: sxOverrides,
}: DataTableProps) {
  const apiRef = useGridApiRef();
  const [searchQuery, setSearchQuery] = useState("");
  const [preferencesAnchorEl, setPreferencesAnchorEl] =
    useState<null | HTMLElement>(null);
  const [defaultViewAnchorEl, setDefaultViewAnchorEl] =
    useState<null | HTMLElement>(null);
  const [internalDefaultView, setInternalDefaultView] = useState<string>(
    () =>
      defaultViewOptions.find((o) => o.value === "default")?.value ??
      defaultViewOptions[0]?.value ??
      "",
  );
  const selectedDefaultView = defaultView ?? internalDefaultView;
  const setSelectedDefaultView = (value: string) => {
    // Only update internal state when uncontrolled; in controlled mode the
    // parent drives the value via the `defaultView` prop.
    if (defaultView === undefined) setInternalDefaultView(value);
  };
  const selectedDefaultViewLabel =
    defaultViewOptions.find((o) => o.value === selectedDefaultView)?.label ??
    "";
  const [filtersButtonEl, setFiltersButtonEl] = useState<null | HTMLElement>(
    null,
  );
  const [panelTarget, setPanelTarget] = useState<null | HTMLElement>(null);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
  });
  const activeFilterItems = filterModel.items.filter(hasFilterValue);

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
          (() => <span style={{ fontWeight: 600 }}>{col.headerName}</span>),
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
                  <span style={{ marginRight: "8px" }}>
                    {selectedDefaultViewLabel}
                  </span>
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
                      selected={opt.value === selectedDefaultView}
                      onClick={() => {
                        setSelectedDefaultView(opt.value);
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

            {showRefresh && (
              <Button
                variant="text"
                color="secondary"
                size="small"
                onClick={onRefreshClick}
                startIcon={
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 20 }}
                  >
                    refresh
                  </span>
                }
              >
                Refresh
              </Button>
            )}
          </Box>
        </Box>
      )}

      {bulkActions}

      {activeFilterItems.length > 0 && (
        <ActiveFiltersBar
          items={activeFilterItems}
          columns={columns}
          onRemove={(item) => apiRef.current?.deleteFilterItem(item)}
          onClearAll={() => apiRef.current?.setFilterModel({ items: [] })}
          onUpdate={(item) => apiRef.current?.upsertFilterItem(item)}
          timeRangeField={timeRangeField}
        />
      )}

      <Box sx={{ minWidth: 0, width: "100%", overflowX: "auto" }}>
        {
          <DataGrid
            apiRef={apiRef}
            rows={filteredRows}
            columns={processedColumns}
            columnGroupingModel={columnGroupingModel}
            density={density}
            pagination
            paginationMode="client"
            initialState={{
              pagination: {
                paginationModel: { pageSize: initialPageSize },
              },
            }}
            pageSizeOptions={pageSizeOptions}
            checkboxSelection={checkboxSelection}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={onColumnVisibilityModelChange}
            rowSelectionModel={rowSelectionModel}
            onRowSelectionModelChange={onRowSelectionModelChange}
            getRowClassName={getRowClassName}
            filterModel={filterModel}
            onFilterModelChange={(model) => {
              setFilterModel(model);
              onFilterModelChange?.(model);
            }}
            disableRowSelectionOnClick
            loading={loading}
            slots={{
              pagination: CustomPagination,
              columnsManagement: CustomColumnsPanel,
              filterPanel: StandardFilterPanel,
              loadingOverlay: LoadingOverlay,
              // Use the same overlay whether the grid has no data at all
              // (noRowsOverlay) or filtering removed everything
              // (noResultsOverlay) — otherwise the grid falls back to its
              // default "No results found." text on column filters.
              ...(noRowsOverlay
                ? { noRowsOverlay, noResultsOverlay: noRowsOverlay }
                : {}),
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
              "& .MuiDataGrid-overlay": {
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
              // Hide the default "N rows selected" label in the footer; bulk
              // selection is surfaced via the bulk-actions bar instead.
              "& .MuiDataGrid-selectedRowCount": {
                display: "none",
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
        }
      </Box>
    </>
  );
}
