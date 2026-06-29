// Quick Filters drawer: a time-range dropdown plus multi-select dropdowns
// (checkboxes inside) for the other dimensions. Selections stage in a draft
// and commit to the page on Apply.

import {
  Checkbox,
  FormControl,
  FormLabel,
  ListItemText,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import { useState } from "react";

import { Drawer } from "@/components/drawer";

import {
  CATEGORY_OPTIONS,
  DEPLOYMENT_TYPE_OPTIONS,
  RESULT_OPTIONS,
  SITE_OPTIONS,
  TIME_RANGE_OPTIONS,
  type DashboardFilters,
  type TimeRangeKey,
} from "./dashboard-filters";

// Checkbox-group keys (everything except the single-select time range).
type GroupKey = "results" | "sites" | "deploymentTypes" | "categories";

function MultiSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    onChange(typeof value === "string" ? value.split(",") : value);
  };

  return (
    <FormControl fullWidth size="small">
      <FormLabel sx={{ mb: 0.5 }}>{label}</FormLabel>
      <Select
        multiple
        displayEmpty
        value={selected}
        onChange={handleChange}
        renderValue={(sel) =>
          sel.length === 0 ? (
            <Typography
              component="span"
              variant="body1"
              sx={{ color: "text.secondary" }}
            >
              All
            </Typography>
          ) : (
            sel.join(", ")
          )
        }
      >
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            <Checkbox size="small" checked={selected.includes(option)} />
            <ListItemText
              primary={option}
              slotProps={{ primary: { variant: "body2" } }}
            />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export function QuickFilters({
  open,
  onClose,
  filters,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  filters: DashboardFilters;
  onApply: (next: DashboardFilters) => void;
}) {
  const [draft, setDraft] = useState<DashboardFilters>(filters);

  // Re-seed the draft from the applied filters whenever the drawer opens
  // (adjust-state-during-render rather than an effect).
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setDraft(filters);
  }

  const setGroup = (key: GroupKey, values: string[]) =>
    setDraft((d) => ({ ...d, [key]: values }));

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={380}
      title="Quick Filters"
      secondaryAction={{ label: "Cancel", onClick: onClose }}
      primaryAction={{ label: "Apply", onClick: handleApply }}
    >
      <FormControl fullWidth size="small">
        <FormLabel sx={{ mb: 0.5 }}>Time range</FormLabel>
        <Select
          value={draft.timeRange}
          onChange={(e) =>
            setDraft((d) => ({
              ...d,
              timeRange: e.target.value as TimeRangeKey,
            }))
          }
        >
          {TIME_RANGE_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <MultiSelect
        label="Result"
        options={RESULT_OPTIONS}
        selected={draft.results}
        onChange={(v) => setGroup("results", v)}
      />
      <MultiSelect
        label="Site / Network"
        options={SITE_OPTIONS}
        selected={draft.sites}
        onChange={(v) => setGroup("sites", v)}
      />
      <MultiSelect
        label="Deployment type"
        options={DEPLOYMENT_TYPE_OPTIONS}
        selected={draft.deploymentTypes}
        onChange={(v) => setGroup("deploymentTypes", v)}
      />
      <MultiSelect
        label="Top categories"
        options={CATEGORY_OPTIONS}
        selected={draft.categories}
        onChange={(v) => setGroup("categories", v)}
      />
    </Drawer>
  );
}
