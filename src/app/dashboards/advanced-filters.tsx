// Advanced Filters drawer: mirrors the MUI DataGrid filter builder used on the
// Query Logs grid (Columns / Operator / value rows, with Add filter / Remove
// all), but scoped to dashboard-relevant dimensions rather than log columns.

import {
  Box,
  Button,
  Divider,
  IconButton,
  MenuItem,
  TextField,
  Tooltip,
} from "@mui/material";
import { useRef, useState } from "react";

import {
  CustomDateTimeRangePicker,
  type CustomDateTimeRangePickerValue,
} from "@/components/custom-date-time-range-picker";
import { Drawer } from "@/components/drawer";

import {
  CATEGORY_OPTIONS,
  DEPLOYMENT_TYPE_OPTIONS,
  RESULT_OPTIONS,
  SITE_OPTIONS,
} from "./dashboard-filters";

// ---------------------------------------------------------------------------
// Filterable dashboard columns
// ---------------------------------------------------------------------------

type ColumnType = "singleSelect" | "dateTime";

type FilterColumn = {
  field: string;
  label: string;
  type: ColumnType;
  options?: string[];
};

const FILTER_COLUMNS: FilterColumn[] = [
  { field: "time", label: "Time", type: "dateTime" },
  { field: "result", label: "Result", type: "singleSelect", options: RESULT_OPTIONS },
  {
    field: "site",
    label: "Site / Network",
    type: "singleSelect",
    options: SITE_OPTIONS,
  },
  {
    field: "deploymentType",
    label: "Deployment Type",
    type: "singleSelect",
    options: DEPLOYMENT_TYPE_OPTIONS,
  },
  {
    field: "category",
    label: "Category",
    type: "singleSelect",
    options: CATEGORY_OPTIONS,
  },
];

const SELECT_OPERATORS = [
  { value: "is", label: "is" },
  { value: "isNot", label: "is not" },
];
const DATE_OPERATORS = [{ value: "range", label: "range" }];

function columnByField(field: string) {
  return FILTER_COLUMNS.find((c) => c.field === field) ?? FILTER_COLUMNS[0];
}

function operatorsFor(column: FilterColumn) {
  return column.type === "dateTime" ? DATE_OPERATORS : SELECT_OPERATORS;
}

// ---------------------------------------------------------------------------
// Filter rows
// ---------------------------------------------------------------------------

type FilterItem = {
  id: number;
  field: string;
  operator: string;
  value: string; // single-select value
  range: CustomDateTimeRangePickerValue; // date/time range value
};

function makeItem(id: number, field = FILTER_COLUMNS[0].field): FilterItem {
  const column = columnByField(field);
  return {
    id,
    field,
    operator: operatorsFor(column)[0].value,
    value: "",
    range: [null, null],
  };
}

function FilterRow({
  item,
  onChange,
  onRemove,
}: {
  item: FilterItem;
  onChange: (next: FilterItem) => void;
  onRemove: () => void;
}) {
  const column = columnByField(item.field);
  const operators = operatorsFor(column);

  const handleField = (field: string) => {
    const next = columnByField(field);
    // Reset operator + values when the column changes, like the grid does.
    onChange({
      ...makeItem(item.id, field),
      operator: operatorsFor(next)[0].value,
    });
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Tooltip title="Remove filter">
        <IconButton size="small" aria-label="remove filter" onClick={onRemove}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            close
          </span>
        </IconButton>
      </Tooltip>

      <TextField
        select
        size="small"
        label="Columns"
        value={item.field}
        onChange={(e) => handleField(e.target.value)}
        sx={{ minWidth: 120, flex: 1 }}
      >
        {FILTER_COLUMNS.map((c) => (
          <MenuItem key={c.field} value={c.field}>
            {c.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        size="small"
        label="Operator"
        value={item.operator}
        onChange={(e) => onChange({ ...item, operator: e.target.value })}
        sx={{ minWidth: 100, flex: 1 }}
      >
        {operators.map((op) => (
          <MenuItem key={op.value} value={op.value}>
            {op.label}
          </MenuItem>
        ))}
      </TextField>

      {column.type === "singleSelect" ? (
        <TextField
          select
          size="small"
          label="Value"
          value={item.value}
          onChange={(e) => onChange({ ...item, value: e.target.value })}
          sx={{ minWidth: 120, flex: 1 }}
        >
          {(column.options ?? []).map((opt) => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </TextField>
      ) : (
        <Box sx={{ display: "flex", flex: 1.5, minWidth: 200 }}>
          <CustomDateTimeRangePicker
            value={item.range}
            onChange={(range) => onChange({ ...item, range })}
          />
        </Box>
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Drawer
// ---------------------------------------------------------------------------

export function AdvancedFilters({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  // Row ids: the seed row reuses id 0 (rows are cleared between opens), while
  // Add Filter pulls fresh ids from a ref counter inside the event handler.
  const nextId = useRef(1);
  const newId = () => nextId.current++;
  const [items, setItems] = useState<FilterItem[]>(() => [makeItem(0)]);

  // Re-seed to a single empty row whenever the drawer opens.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setItems([makeItem(0)]);
  }

  const updateItem = (id: number, next: FilterItem) =>
    setItems((prev) => prev.map((it) => (it.id === id ? next : it)));

  const removeItem = (id: number) =>
    setItems((prev) => prev.filter((it) => it.id !== id));

  const addFilter = () => setItems((prev) => [...prev, makeItem(newId())]);

  const removeAll = () => setItems([]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      size="large"
      title="Advanced Filters"
      secondaryAction={{ label: "Cancel", onClick: onClose }}
      primaryAction={{ label: "Apply", onClick: onClose }}
    >
      <Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {items.map((item) => (
            <FilterRow
              key={item.id}
              item={item}
              onChange={(next) => updateItem(item.id, next)}
              onRemove={() => removeItem(item.id)}
            />
          ))}
        </Box>

        <Divider sx={{ my: 2 }} />

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Button
          variant="text"
          color="primary"
          onClick={addFilter}
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
          onClick={removeAll}
          startIcon={
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              delete
            </span>
          }
        >
          Remove All
        </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
