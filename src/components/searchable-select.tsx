// Single-select with the Query Logs dropdown treatment: a pinned search box
// above the options. The multi-select sibling is SearchableMultiSelect; this
// one is for fields that take exactly one value.

import {
  Box,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  MenuItem,
  Typography,
} from "@mui/material";
import type { ReactNode } from "react";
import { useState } from "react";

import { Select } from "@/components/select";
import { DropdownSearch } from "@/components/dropdown-search";

export function SearchableSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Select",
  required = false,
  disabled = false,
  helperText,
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
        {visibleOptions.map((option) => (
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
