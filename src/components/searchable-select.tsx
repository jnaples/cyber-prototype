// Single-select with the Query Logs dropdown treatment: a pinned search box
// above the options. The multi-select sibling is SearchableMultiSelect; this
// one is for fields that take exactly one value.

import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  InputAdornment,
  ListSubheader,
  MenuItem,
  Typography,
} from "@mui/material";
import type { ReactNode } from "react";
import { useState } from "react";

import { Select } from "@/components/select";
import { TextField } from "@/components/text-field";

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
        <ListSubheader sx={{ px: 2, py: 1 }}>
          <TextField
            size="small"
            autoFocus
            fullWidth
            placeholder="Search..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            // Otherwise the menu's type-ahead swallows what's typed.
            onKeyDown={(event) => {
              if (event.key !== "Escape") event.stopPropagation();
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </ListSubheader>
        <Divider />
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
