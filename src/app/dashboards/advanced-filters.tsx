// Advanced Filters drawer: mirrors the MUI DataGrid filter builder used on the
// Query Logs grid (Columns / Operator / value rows, with Add filter / Remove
// all), but scoped to dashboard-relevant dimensions rather than log columns.

import {
  Box,
  Button,
  Divider,
  FormLabel,
  IconButton,
  MenuItem,
  TextField,
  Tooltip,
} from "@mui/material";
import { type ReactNode, useRef, useState } from "react";

import { Drawer } from "@/components/drawer";
import { MaterialSymbol } from "@/components/material-symbol";

import {
  DEPLOYMENT_TYPE_OPTIONS,
  RESULT_OPTIONS,
  SITE_OPTIONS,
} from "./dashboard-filters";

// ---------------------------------------------------------------------------
// Filterable dashboard columns (all single-select)
// ---------------------------------------------------------------------------

const DOMAIN_OPTIONS = [
  "google.com",
  "youtube.com",
  "facebook.com",
  "dropbox.com",
  "tiktok.com",
  "chatgpt.com",
];
const POLICY_OPTIONS = [
  "Standard Policy",
  "Default Filtering",
  "HIPAA Strict",
  "Marketing Policy",
  "Engineering Policy",
];
const THREAT_TYPE_OPTIONS = [
  "Malware",
  "Phishing",
  "Botnet",
  "C2",
  "Cryptomining",
  "Spyware",
];
const CATEGORY_TYPE_OPTIONS = [
  "Social Networking",
  "Streaming Media",
  "Adult Content",
  "Gambling",
  "AI Tools",
  "File Sharing",
];

export type FilterColumn = {
  field: string;
  label: string;
  /** When provided, the value is a dropdown; otherwise a free-text input. */
  options?: string[];
};

const DASHBOARD_FILTER_COLUMNS: FilterColumn[] = [
  { field: "result", label: "Result", options: RESULT_OPTIONS },
  { field: "site", label: "Site / Network", options: SITE_OPTIONS },
  {
    field: "deploymentType",
    label: "Deployment Type",
    options: DEPLOYMENT_TYPE_OPTIONS,
  },
  { field: "domain", label: "Domain", options: DOMAIN_OPTIONS },
  { field: "policy", label: "Policy Applied", options: POLICY_OPTIONS },
  { field: "threatType", label: "Threat Type", options: THREAT_TYPE_OPTIONS },
  {
    field: "categoryType",
    label: "Category Type",
    options: CATEGORY_TYPE_OPTIONS,
  },
];

const OPERATORS = [
  { value: "contains", label: "contains" },
  { value: "notContains", label: "does not contain" },
];

function columnByField(field: string, columns: FilterColumn[]) {
  return columns.find((c) => c.field === field) ?? columns[0];
}

// ---------------------------------------------------------------------------
// Filter rows
// ---------------------------------------------------------------------------

type Conjunction = "And" | "Or";

type FilterItem = {
  id: number;
  field: string;
  operator: string;
  value: string;
  conjunction: Conjunction; // how this row joins the previous (rows after the first)
};

function makeItem(id: number, field: string): FilterItem {
  return {
    id,
    field,
    operator: OPERATORS[0].value,
    value: "",
    conjunction: "And",
  };
}

// Width reserved for the And/Or conjunction dropdown so columns line up across
// rows (the first row leaves it empty).
const CONJ_WIDTH = 96;

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <Box
      sx={{ flex: 1, minWidth: 120, display: "flex", flexDirection: "column", gap: 0.5 }}
    >
      <FormLabel>{label}</FormLabel>
      {children}
    </Box>
  );
}

function FilterRow({
  item,
  index,
  multi,
  columns,
  onChange,
  onRemove,
}: {
  item: FilterItem;
  index: number;
  multi: boolean;
  columns: FilterColumn[];
  onChange: (next: FilterItem) => void;
  onRemove: () => void;
}) {
  const column = columnByField(item.field, columns);

  const handleField = (field: string) => {
    // Reset operator + value when the column changes, like the grid does
    // (preserve the conjunction so the row keeps its And/Or).
    onChange({ ...makeItem(item.id, field), conjunction: item.conjunction });
  };

  return (
    <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1.5 }}>
      <Tooltip title="Remove filter">
        <IconButton size="small" aria-label="remove filter" onClick={onRemove}>
          <MaterialSymbol name="close" size={20} />
        </IconButton>
      </Tooltip>

      {/* And/Or conjunction — only when filters are stacked. The first row
          reserves the space so columns stay aligned across rows. */}
      {multi &&
        (index === 0 ? (
          <Box sx={{ width: CONJ_WIDTH, flexShrink: 0 }} />
        ) : (
          <TextField
            select
            size="small"
            value={item.conjunction}
            onChange={(e) =>
              onChange({ ...item, conjunction: e.target.value as Conjunction })
            }
            sx={{ width: CONJ_WIDTH, flexShrink: 0 }}
          >
            <MenuItem value="And">And</MenuItem>
            <MenuItem value="Or">Or</MenuItem>
          </TextField>
        ))}

      <Field label="Filter by:">
        <TextField
          select
          size="small"
          value={item.field}
          onChange={(e) => handleField(e.target.value)}
        >
          {columns.map((c) => (
            <MenuItem key={c.field} value={c.field}>
              {c.label}
            </MenuItem>
          ))}
        </TextField>
      </Field>

      <Field label="Operator">
        <TextField
          select
          size="small"
          value={item.operator}
          onChange={(e) => onChange({ ...item, operator: e.target.value })}
        >
          {OPERATORS.map((op) => (
            <MenuItem key={op.value} value={op.value}>
              {op.label}
            </MenuItem>
          ))}
        </TextField>
      </Field>

      <Field label="Value">
        {column.options ? (
          <TextField
            select
            size="small"
            value={item.value}
            onChange={(e) => onChange({ ...item, value: e.target.value })}
          >
            {column.options.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </TextField>
        ) : (
          <TextField
            size="small"
            placeholder="Enter value"
            value={item.value}
            onChange={(e) => onChange({ ...item, value: e.target.value })}
          />
        )}
      </Field>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Drawer
// ---------------------------------------------------------------------------

// One applied advanced filter, surfaced to the page's Active Filters bar.
export type AppliedAdvancedFilter = {
  id: number;
  fieldLabel: string;
  operatorLabel: string;
  value: string;
};

export function AdvancedFilters({
  open,
  onClose,
  onApply,
  columns = DASHBOARD_FILTER_COLUMNS,
}: {
  open: boolean;
  onClose: () => void;
  /** Called on Apply with the filter rows that have a value selected. */
  onApply?: (applied: AppliedAdvancedFilter[]) => void;
  /** Filterable columns; defaults to the dashboard dimensions. */
  columns?: FilterColumn[];
}) {
  const firstField = columns[0].field;
  // Row ids: the seed row reuses id 0 (rows are cleared between opens), while
  // Add Filter pulls fresh ids from a ref counter inside the event handler.
  const nextId = useRef(1);
  const newId = () => nextId.current++;
  const [items, setItems] = useState<FilterItem[]>(() => [
    makeItem(0, firstField),
  ]);

  // Re-seed to a single empty row whenever the drawer opens.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setItems([makeItem(0, firstField)]);
  }

  const updateItem = (id: number, next: FilterItem) =>
    setItems((prev) => prev.map((it) => (it.id === id ? next : it)));

  const removeItem = (id: number) =>
    setItems((prev) => prev.filter((it) => it.id !== id));

  const addFilter = () =>
    setItems((prev) => [...prev, makeItem(newId(), firstField)]);

  const removeAll = () => setItems([]);

  const handleApply = () => {
    const applied = items
      .filter((it) => it.value !== "")
      .map((it) => ({
        id: it.id,
        fieldLabel: columnByField(it.field, columns).label,
        operatorLabel:
          OPERATORS.find((o) => o.value === it.operator)?.label ?? it.operator,
        value: it.value,
      }));
    onApply?.(applied);
    onClose();
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      size="large"
      title="Advanced Filters"
      secondaryAction={{ label: "Cancel", onClick: onClose }}
      primaryAction={{ label: "Apply", onClick: handleApply }}
    >
      <Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {items.map((item, index) => (
            <FilterRow
              key={item.id}
              item={item}
              index={index}
              multi={items.length > 1}
              columns={columns}
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
            startIcon={<MaterialSymbol name="add" size={20} />}
          >
            Add Filter
          </Button>
          <Button
            variant="text"
            color="error"
            onClick={removeAll}
            startIcon={<MaterialSymbol name="delete" size={20} />}
          >
            Remove All
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
