// Single-select with the Query Logs dropdown treatment: a pinned search box
// above the options. The multi-select sibling is SearchableMultiSelect; this
// one is for fields that take exactly one value.

import {
  Box,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  ListSubheader,
  MenuItem,
  Typography,
} from "@mui/material";
import type { ReactNode } from "react";
import { useState } from "react";

import { Select } from "@/components/select";
import { GROUPED_ITEM_SX, GROUP_HEADING_SX } from "@/components/dropdown-group";
import { DropdownSearch } from "@/components/dropdown-search";

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

export function SearchableSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Select",
  required = false,
  disabled = false,
  helperText,
  groupBy,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  /** Shown while nothing is selected. */
  placeholder?: string;
  /** Marks the label with the app's required asterisk. */
  required?: boolean;
  disabled?: boolean;
  /** Files each option under a heading — e.g. the product it belongs to. */
  groupBy?: (option: string) => string;
  /** Rendered under the field — takes a node so it can hold a link. */
  helperText?: ReactNode;
}) {
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();
  const visibleOptions = query
    ? options.filter((option) => option.toLowerCase().includes(query))
    : options;

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
        displayEmpty
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onClose={() => setSearch("")}
        MenuProps={{ slotProps: { paper: { sx: { maxHeight: 400 } } } }}
        renderValue={(selected) =>
          selected ? (
            (selected as string)
          ) : (
            <Typography
              component="span"
              variant="body1"
              sx={{ color: "text.disabled" }}
            >
              {placeholder}
            </Typography>
          )
        }
      >
        <DropdownSearch value={search} onChange={setSearch} />
        {/* Same breathing room the multi-select gives its search box. */}
        <Divider sx={{ my: 1 }} />
        {groupBy
          ? groupOptions(visibleOptions, groupBy).flatMap(([group, opts]) => [
              <ListSubheader key={`group-${group}`} sx={GROUP_HEADING_SX}>
                {group}
              </ListSubheader>,
              ...opts.map((option) => (
                <MenuItem key={option} value={option} sx={GROUPED_ITEM_SX}>
                  {option}
                </MenuItem>
              )),
            ])
          : visibleOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
      </Select>
      {helperText && (
        <FormHelperText sx={{ fontSize: 14 }}>{helperText}</FormHelperText>
      )}
    </FormControl>
  );
}
