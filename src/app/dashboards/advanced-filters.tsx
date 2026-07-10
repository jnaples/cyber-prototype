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
import { type ReactNode, useState } from "react";

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
      sx={{ flex: 1, minWidth: 120, display: "flex", flexDirection: "column" }}
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
  onEnter,
}: {
  item: FilterItem;
  index: number;
  multi: boolean;
  columns: FilterColumn[];
  onChange: (next: FilterItem) => void;
  onRemove: () => void;
  /** Fired when Enter is pressed in the free-text value field. */
  onEnter: () => void;
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
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onEnter();
              }
            }}
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
  applyLabel = "Apply",
  title = "Advanced Filters",
  seedFilters,
}: {
  open: boolean;
  onClose: () => void;
  /** Called on Apply with the filter rows that have a value selected. */
  onApply?: (applied: AppliedAdvancedFilter[]) => void;
  /** Filterable columns; defaults to the dashboard dimensions. */
  columns?: FilterColumn[];
  /** Label for the primary (apply) button. */
  applyLabel?: string;
  /** Drawer title. */
  title?: string;
  /**
   * Previously-applied filters to restore when the drawer opens, so applied
   * filters persist until edited here or cleared upstream. Omit to always open
   * with a single empty row.
   */
  seedFilters?: AppliedAdvancedFilter[];
}) {
  const firstField = columns[0].field;

  // Rebuild editable rows from previously-applied filters (label → field /
  // operator via the column + operator lists).
  const rowsFromSeed = (): FilterItem[] =>
    seedFilters && seedFilters.length > 0
      ? seedFilters.map((f, i) => ({
          id: i,
          field:
            columns.find((c) => c.label === f.fieldLabel)?.field ?? firstField,
          operator:
            OPERATORS.find((o) => o.label === f.operatorLabel)?.value ??
            OPERATORS[0].value,
          value: f.value,
          conjunction: "And" as Conjunction,
        }))
      : [makeItem(0, firstField)];
  // Row ids: the seed row reuses id 0 (rows are cleared between opens), while
  const [items, setItems] = useState<FilterItem[]>(rowsFromSeed);

  // Re-seed from the applied filters (or a single empty row) on each open.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setItems(rowsFromSeed());
  }

  const updateItem = (id: number, next: FilterItem) =>
    setItems((prev) => prev.map((it) => (it.id === id ? next : it)));

  const removeItem = (id: number) =>
    setItems((prev) => prev.filter((it) => it.id !== id));

  // Fresh id = one past the current max, so ids stay unique after re-seeding.
  const addFilter = () =>
    setItems((prev) => [
      ...prev,
      makeItem(prev.reduce((m, it) => Math.max(m, it.id), -1) + 1, firstField),
    ]);

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
      title={title}
      secondaryAction={{ label: "Cancel", onClick: onClose }}
      primaryAction={{ label: applyLabel, onClick: handleApply }}
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
              onEnter={addFilter}
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
