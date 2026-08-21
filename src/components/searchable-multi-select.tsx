// Labeled multi-select with the Query Logs dropdown treatment: a pinned search
// box, a "Select all" row, and a rule before the options. Used by the dashboard
// Filters drawer and the Generate Report drawer.

import {
  Box,
  Checkbox,
  Chip,
  Divider,
  FormControl,
  FormLabel,
  ListItemText,
  ListSubheader,
  MenuItem,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import { useState } from "react";

import { Select } from "@/components/select";
import { DropdownSearch } from "@/components/dropdown-search";

// Sentinel row value for the "Select all" item (same trick as Query Logs).
const SELECT_ALL_VALUE = "__select_all__";

/** Options bucketed by `groupBy`, in the order the groups first appear. */
function groupOptions(options: string[], groupBy: (option: string) => string) {
  const groups = new Map<string, string[]>();
  for (const option of options) {
    const key = groupBy(option);
    const bucket = groups.get(key);
    if (bucket) bucket.push(option);
    else groups.set(key, [option]);
  }
  return [...groups];
}

export function SearchableMultiSelect({
  label,
  options,
  selected,
  onChange,
  searchable = true,
  selectAll = true,
  groupBy,
  allLabel,
  disabled = false,
  chips = false,
  required = false,
}: {
  label: string;
  /** Marks the label with the app's required asterisk. */
  required?: boolean;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
  disabled?: boolean;
  /** Render the selection as deletable chips instead of a comma-joined list. */
  chips?: boolean;
  /** The search box + Select all + rule. On by default; turn off for short lists. */
  searchable?: boolean;
  /** The "Select all" row. On by default; turn off where picking everyone
   *  isn't a sensible shortcut. */
  selectAll?: boolean;
  /** Files each option under a heading — e.g. the organization it belongs to.
   *  Return the fallback heading yourself for options with no group. */
  groupBy?: (option: string) => string;
  /** Empty-state text; defaults to "All {label}". Set it where the label is
   *  singular and wouldn't read right (e.g. Result -> "All Results"). */
  allLabel?: string;
}) {
  const [search, setSearch] = useState("");
  const renderOption = (option: string) => (
    <MenuItem key={option} value={option}>
      <Checkbox
        size="small"
        checked={selected.includes(option)}
        sx={{ p: 0.5, mr: 1 }}
      />
      <ListItemText primary={option} />
    </MenuItem>
  );
  const allSelected = options.length > 0 && selected.length === options.length;
  const someSelected = selected.length > 0 && !allSelected;
  const visibleOptions = search
    ? options.filter((o) => o.toLowerCase().includes(search.toLowerCase()))
    : options;

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    const next = typeof value === "string" ? value.split(",") : value;
    if (next.includes(SELECT_ALL_VALUE)) {
      onChange(allSelected ? [] : [...options]);
      return;
    }
    onChange(next);
  };

  return (
    <FormControl fullWidth size="small" disabled={disabled}>
      <FormLabel>
        {label}
        {required && (
          <Box component="span" sx={{ ml: 0.25 }}>
            *
          </Box>
        )}
      </FormLabel>
      <Select
        multiple
        displayEmpty
        disabled={disabled}
        sx={{ pointerEvents: disabled ? "none" : undefined }}
        value={selected}
        onChange={handleChange}
        onClose={() => setSearch("")}
        MenuProps={{
          autoFocus: !searchable,
          slotProps: { paper: { sx: { maxHeight: 400 } } },
        }}
        renderValue={(sel) => {
          if (sel.length === 0 || (allSelected && !chips)) {
            return (
              <Typography
                component="span"
                variant="body1"
                sx={{ color: "text.disabled" }}
              >
                {allLabel ?? `All ${label}`}
              </Typography>
            );
          }
          if (!chips) return sel.join(", ");
          return (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {sel.map((value) => (
                <Chip
                  key={value}
                  size="small"
                  label={value}
                  sx={{
                    borderRadius: (t) => t.spacing(1),
                    // Match the clear affordance on text fields / selects.
                    "& .MuiChip-deleteIcon": {
                      color: "text.disabled",
                      "&:hover": { color: "text.secondary" },
                    },
                  }}
                  // The chip lives inside the select's value area, so stop the
                  // delete click from opening the menu.
                  onMouseDown={(e) => e.stopPropagation()}
                  onDelete={(e) => {
                    e.stopPropagation();
                    onChange(selected.filter((v) => v !== value));
                  }}
                />
              ))}
            </Box>
          );
        }}
      >
        {searchable && <DropdownSearch value={search} onChange={setSearch} />}
        {searchable && selectAll && (
          <MenuItem value={SELECT_ALL_VALUE}>
            <Checkbox
              size="small"
              checked={allSelected}
              indeterminate={someSelected}
              sx={{ p: 0.5, mr: 1 }}
            />
            <ListItemText primary="Select all" />
          </MenuItem>
        )}
        {/* Breathing room around the rule under the search box, matching the
            Query Logs dropdowns. */}
        {searchable && <Divider sx={{ my: 1 }} />}
        {groupBy
          ? groupOptions(visibleOptions, groupBy).flatMap(([group, opts]) => [
              <ListSubheader
                key={`group-${group}`}
                // Same heading treatment as the Query Logs Roaming Clients &
                // Relays dropdown.
                sx={{
                  typography: "overline",
                  lineHeight: 1.5,
                  color: "text.secondary",
                  pt: 1,
                  position: "static",
                }}
              >
                {group}
              </ListSubheader>,
              ...opts.map(renderOption),
            ])
          : visibleOptions.map(renderOption)}
      </Select>
    </FormControl>
  );
}
