import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import {
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormLabel,
  IconButton,
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
  Tooltip,
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
  gridFilterableColumnDefinitionsSelector,
  GridFilterPanel,
  GridLogicOperator,
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

import { MaterialSymbol } from "./material-symbol";

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
  doesNotContain: "does not contain",
  equals: "equals",
  doesNotEqual: "does not equal",
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
  "=": "equals",
  "!=": "does not equal",
  ">": "greater than",
  ">=": "greater than or equal to",
  "<": "less than",
  "<=": "less than or equal to",
};

function formatFilterOperator(op: string): string {
  // De-camel-case anything not explicitly mapped, e.g. "doesNotContain".
  return (
    OPERATOR_LABELS[op] ??
    op
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (c) => c.toLowerCase())
      .trim()
  );
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
        endIcon={<MaterialSymbol name="arrow_drop_down" size={20} />}
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
        startIcon={<DeleteForeverOutlinedIcon sx={{ fontSize: 18 }} />}
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
        startIcon={<MaterialSymbol name="add" size={20} />}
      >
        Add Filter
      </Button>
      <Button
        variant="text"
        color="error"
        onClick={handleRemoveAll}
        startIcon={<DeleteForeverOutlinedIcon sx={{ fontSize: 20 }} />}
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
            defaultProps: { variant: "outlined", size: "small" },
          },
          MuiFormControl: {
            defaultProps: { variant: "outlined", size: "small" },
          },
          MuiSelect: {
            defaultProps: { variant: "outlined" },
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

// ---------------------------------------------------------------------------
// Deferred-apply filter panel
// ---------------------------------------------------------------------------

// Monotonic id source for newly-added draft filters (event-handler only, so it
// never mutates during render). The empty starter row uses a stable id.
let deferredFilterId = 0;
const PLACEHOLDER_FILTER_ID = "deferred-placeholder";

// Structural equality for two filter models (order-insensitive on items) — used
// to disable "Apply" when the draft matches what's already applied.
function isSameFilterModel(a: GridFilterModel, b: GridFilterModel): boolean {
  const logicA = a.logicOperator ?? GridLogicOperator.And;
  const logicB = b.logicOperator ?? GridLogicOperator.And;
  if (logicA !== logicB) return false;
  if (a.items.length !== b.items.length) return false;
  const key = (it: GridFilterItem) =>
    `${it.field}|${it.operator}|${JSON.stringify(it.value ?? "")}`;
  const as = a.items.map(key).sort();
  const bs = b.items.map(key).sort();
  return as.every((k, i) => k === bs[i]);
}

// Width reserved for the And/Or conjunction control so the Filter-by / Operator
// / Value columns line up across rows (the first row leaves it empty).
const CONJ_WIDTH = 96;

// A single filter field with its label stacked above the control — matches the
// dashboards Advanced Filters drawer.
function LabeledField({
  label,
  children,
  width,
}: {
  label: string;
  children: React.ReactNode;
  /** Fixed width (px). When omitted, the field flexes to fill the row. */
  width?: number;
}) {
  return (
    <Box
      sx={{
        ...(width
          ? { flex: "0 0 auto", width, minWidth: width }
          : { flex: 1, minWidth: 120 }),
        display: "flex",
        flexDirection: "column",
      }}
    >
      {label ? <FormLabel>{label}</FormLabel> : null}
      {children}
    </Box>
  );
}

// A filter panel that edits a *local draft* model — the grid does not filter as
// the user types. Changes are committed to the grid only when "Apply" is
// clicked; closing the panel discards them (the panel remounts on next open,
// re-seeding from the applied model). Mirrors MUI's "apply filters on demand".
function DeferredFilterPanel(
  props: React.ComponentProps<typeof GridFilterPanel> & {
    seedModel?: GridFilterModel;
    onApply?: (model: GridFilterModel) => void;
    filterFields?: string[];
  },
) {
  const { seedModel, onApply, filterFields } = props;
  const apiRef = useGridApiContext();
  const allFilterableColumns = useGridSelector(
    apiRef,
    gridFilterableColumnDefinitionsSelector,
  );
  // Columns offered in the "Filter by" dropdown — restricted to `filterFields`
  // (in that order) when provided; full column lookup stays available for
  // resolving items already in the model.
  const filterableColumns =
    filterFields && filterFields.length > 0
      ? filterFields.flatMap((f) => {
          const col = allFilterableColumns.find((c) => c.field === f);
          return col ? [col] : [];
        })
      : allFilterableColumns;
  const outer = useTheme();
  const inner = React.useMemo(
    () =>
      createTheme({
        ...outer,
        components: {
          ...outer.components,
          MuiTextField: {
            defaultProps: { variant: "outlined", size: "small" },
          },
          MuiFormControl: {
            defaultProps: { variant: "outlined", size: "small" },
          },
          MuiSelect: { defaultProps: { variant: "outlined" } },
        },
      }),
    [outer],
  );

  const firstColumn = filterableColumns.find((c) => c.filterOperators?.length);

  // Seed the draft from the applied model, or start with a single empty row so
  // the first "Add Filter" click adds a *second* row (rather than silently
  // replacing an invisible placeholder).
  const [draft, setDraft] = useState<GridFilterModel>(() => {
    const seeded = seedModel?.items ?? [];
    if (seeded.length > 0) {
      return {
        items: seeded.map((it) => ({ ...it })),
        logicOperator: seedModel?.logicOperator ?? GridLogicOperator.And,
      };
    }
    return {
      items: firstColumn
        ? [
            {
              id: PLACEHOLDER_FILTER_ID,
              field: firstColumn.field,
              operator: firstColumn.filterOperators![0].value,
            },
          ]
        : [],
      logicOperator: GridLogicOperator.And,
    };
  });

  const displayItems = draft.items;

  const applyFilterChanges = (item: GridFilterItem) => {
    setDraft((prev) => {
      const exists = prev.items.some((i) => i.id === item.id);
      const items = exists
        ? prev.items.map((i) => (i.id === item.id ? item : i))
        : [...prev.items, item];
      return { ...prev, items };
    });
  };

  const deleteFilter = (item: GridFilterItem) => {
    setDraft((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== item.id),
    }));
  };


  const addFilter = () => {
    if (!firstColumn) return;
    deferredFilterId += 1;
    setDraft((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: `deferred-${deferredFilterId}`,
          field: firstColumn.field,
          operator: firstColumn.filterOperators![0].value,
        },
      ],
    }));
  };

  const removeAll = () => setDraft((prev) => ({ ...prev, items: [] }));

  // Only items that will actually filter (a complete value) get committed.
  const cleanedItems = draft.items.filter((item) => {
    const col = allFilterableColumns.find((c) => c.field === item.field);
    const op = col?.filterOperators?.find((o) => o.value === item.operator);
    return Boolean(col && op && op.getApplyFilterFn(item, col));
  });
  const cleanedModel: GridFilterModel = {
    items: cleanedItems,
    logicOperator: draft.logicOperator,
  };
  const appliedModel: GridFilterModel = {
    items: seedModel?.items ?? [],
    logicOperator: seedModel?.logicOperator ?? GridLogicOperator.And,
  };
  const canApply = !isSameFilterModel(cleanedModel, appliedModel);

  const handleApply = () => {
    onApply?.(cleanedModel);
    apiRef.current.hideFilterPanel();
  };

  const hasMultipleFilters = displayItems.length > 1;

  return (
    <ThemeProvider theme={inner}>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Box
          sx={{
            p: 1.5,
            display: "flex",
            flexDirection: "column",
            gap: 1,
            maxHeight: 400,
            overflowY: "auto",
          }}
        >
          {displayItems.map((item, index) => {
            const column = allFilterableColumns.find(
              (c) => c.field === item.field,
            );
            const operators = column?.filterOperators ?? [];
            const currentOperator = operators.find(
              (o) => o.value === item.operator,
            );
            const ValueInput = currentOperator?.InputComponent;
            // The time "range" operator's value input is two datetime pickers,
            // so it's much wider — pin the column/operator selects to a fixed
            // width in that case so they don't balloon with the row.
            const wideValue = item.operator === "range";

            const handleColumnChange = (field: string) => {
              const col = allFilterableColumns.find((c) => c.field === field);
              applyFilterChanges({
                ...item,
                field,
                operator: col?.filterOperators?.[0]?.value ?? item.operator,
                value: undefined,
              });
            };
            const handleOperatorChange = (operator: string) => {
              const nextOp = operators.find((o) => o.value === operator);
              const eraseValue =
                !nextOp?.InputComponent ||
                nextOp.InputComponent !== currentOperator?.InputComponent;
              applyFilterChanges({
                ...item,
                operator,
                value: eraseValue ? undefined : item.value,
              });
            };

            return (
              <Box
                key={item.id ?? index}
                sx={{ display: "flex", alignItems: "flex-end", gap: 1.5 }}
              >
                <Tooltip title="Remove filter">
                  <IconButton
                    size="small"
                    aria-label="remove filter"
                    onClick={() => deleteFilter(item)}
                  >
                    <MaterialSymbol name="close" size={20} />
                  </IconButton>
                </Tooltip>

                {hasMultipleFilters &&
                  (index === 0 ? (
                    // Reserve the conjunction column so the first row's fields
                    // line up with the rows below.
                    <Box sx={{ width: CONJ_WIDTH, flexShrink: 0 }} />
                  ) : (
                    // Rows are always joined with AND (no And/Or dropdown).
                    <Box
                      sx={{
                        width: CONJ_WIDTH,
                        flexShrink: 0,
                        height: 40,
                        display: "flex",
                        alignItems: "center",
                        color: "text.primary",
                        fontWeight: 600,
                        fontSize: 14,
                      }}
                    >
                      And
                    </Box>
                  ))}

                <LabeledField
                  label="Filter by:"
                  width={wideValue ? 150 : undefined}
                >
                  <TextField
                    select
                    size="small"
                    value={item.field}
                    onChange={(e) => handleColumnChange(e.target.value)}
                  >
                    {filterableColumns.map((c) => (
                      <MenuItem key={c.field} value={c.field}>
                        {c.headerName ?? c.field}
                      </MenuItem>
                    ))}
                  </TextField>
                </LabeledField>

                <LabeledField
                  label="Operator"
                  width={wideValue ? 150 : undefined}
                >
                  <TextField
                    select
                    size="small"
                    value={item.operator}
                    onChange={(e) => handleOperatorChange(e.target.value)}
                  >
                    {operators.map((op) => (
                      <MenuItem key={op.value} value={op.value}>
                        {op.label ?? formatFilterOperator(op.value)}
                      </MenuItem>
                    ))}
                  </TextField>
                </LabeledField>

                <LabeledField label={wideValue ? "" : "Value"}>
                  {ValueInput ? (
                    <ValueInput
                      apiRef={apiRef}
                      item={item}
                      applyValue={applyFilterChanges}
                      slotProps={
                        {
                          root: {
                            label: "",
                            variant: "outlined",
                            size: "small",
                            fullWidth: true,
                          },
                        } as never
                      }
                    />
                  ) : (
                    <TextField size="small" disabled placeholder="No value" />
                  )}
                </LabeledField>
              </Box>
            );
          })}
        </Box>
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
            onClick={addFilter}
            startIcon={<MaterialSymbol name="add" size={20} />}
          >
            Add Filter
          </Button>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              variant="text"
              color="error"
              onClick={removeAll}
              startIcon={<DeleteForeverOutlinedIcon sx={{ fontSize: 20 }} />}
            >
              Remove All
            </Button>
            <Button
              variant="contained"
              color="primary"
              disabled={!canApply}
              onClick={handleApply}
            >
              Apply
            </Button>
          </Box>
        </Box>
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
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
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
      <Box sx={{ display: "flex", justifyContent: "space-between", pt: 1 }}>
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
  /**
   * When set, the filter panel edits a draft model and the grid does not
   * filter until the user clicks "Apply" (MUI's "apply filters on demand").
   */
  deferFilterApply?: boolean;
  /**
   * Restricts which columns are offered in the deferred filter panel's
   * "Filter by" dropdown (by field name, in this order). Omit to offer every
   * filterable column. Only applies when `deferFilterApply` is set.
   */
  filterFields?: string[];
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
  /**
   * Provide an external grid api ref to drive the grid from outside (e.g. apply
   * a filter from a control rendered elsewhere on the page). Defaults to an
   * internally-created ref.
   */
  apiRef?: ReturnType<typeof useGridApiRef>;
  /**
   * Filter item ids to omit from the Active Filters bar (the filter still
   * applies to the grid — it's just represented elsewhere, e.g. the Investigate
   * Mode banner owns its time-window filter).
   */
  hiddenFilterIds?: ReadonlyArray<string | number>;
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
  deferFilterApply = false,
  filterFields,
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
  apiRef: apiRefProp,
  hiddenFilterIds,
  sx: sxOverrides,
}: DataTableProps) {
  const internalApiRef = useGridApiRef();
  const apiRef = apiRefProp ?? internalApiRef;
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
  const activeFilterItems = filterModel.items
    .filter(hasFilterValue)
    .filter(
      (it) => it.id === undefined || !hiddenFilterIds?.includes(it.id),
    );

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
        // Action columns carry no sortable/filterable content, so their column
        // menu only offers "Manage columns" — suppress the menu entirely.
        disableColumnMenu:
          col.field === "actions" ? true : col.disableColumnMenu,
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
  const leftShadowField = pinnedShadowFields?.left;
  // Any "actions" column always gets the right-edge shadow — pages don't need
  // to opt in via pinnedShadowFields.right (an explicit value still wins).
  const rightShadowField =
    pinnedShadowFields?.right ??
    (columns.some((c) => c.field === "actions") ? "actions" : undefined);
  if (leftShadowField) {
    pinnedSx[`& .MuiDataGrid-cell[data-field='${leftShadowField}']`] = {
      boxShadow: "rgba(0, 0, 0, 0.21) 2px 0px 4px -2px",
    };
    pinnedSx[`& .MuiDataGrid-columnHeader[data-field='${leftShadowField}']`] = {
      boxShadow: "rgba(0, 0, 0, 0.21) 2px 0px 4px -2px",
      // Sit above the neighbouring header so its opaque background does not
      // paint over this column's right-side shadow.
      zIndex: 1,
    };
  }
  if (rightShadowField) {
    pinnedSx[`& .MuiDataGrid-cell[data-field='${rightShadowField}']`] = {
      boxShadow: "rgba(0, 0, 0, 0.21) -2px 0px 4px -2px",
    };
    pinnedSx[`& .MuiDataGrid-columnHeader[data-field='${rightShadowField}']`] = {
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
                    <MaterialSymbol
                      name="search"
                      size={20}
                      sx={{ color: "inherit" }}
                    />
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
              startIcon={<MaterialSymbol name="filter_alt" size={20} />}
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
                  startIcon={<MaterialSymbol name="view_column" size={20} />}
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
                  <MaterialSymbol name="arrow_drop_down" size={20} />
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
                  startIcon={<MaterialSymbol name="tune" size={20} />}
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
                      <MaterialSymbol name="view_column" size={20} />
                    </ListItemIcon>
                    <ListItemText>Columns</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={() => setPreferencesAnchorEl(null)}>
                    <ListItemIcon sx={{ color: "text.primary" }}>
                      <MaterialSymbol name="density_small" size={20} />
                    </ListItemIcon>
                    <ListItemText>Density</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={() => setPreferencesAnchorEl(null)}>
                    <ListItemIcon sx={{ color: "text.primary" }}>
                      <MaterialSymbol name="save" size={20} />
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
                startIcon={<MaterialSymbol name="download" size={20} />}
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
                startIcon={<MaterialSymbol name="refresh" size={20} />}
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
              filterPanel: deferFilterApply
                ? DeferredFilterPanel
                : StandardFilterPanel,
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
              ...(deferFilterApply
                ? {
                    filterPanel: {
                      seedModel: filterModel,
                      filterFields,
                      onApply: (model: GridFilterModel) => {
                        setFilterModel(model);
                        onFilterModelChange?.(model);
                      },
                    } as never,
                  }
                : {}),
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
