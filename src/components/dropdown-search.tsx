// The pinned search row at the top of a filter dropdown. Six dropdowns had
// their own copy of it, so a spacing change meant six edits — this is the one
// place that treatment lives now.
//
// MUI's Select clones every child with its own handlers, so whatever it passes
// is forwarded through to the ListSubheader, exactly as an inline one behaved.

import SearchIcon from "@mui/icons-material/Search";
import { InputAdornment, ListSubheader } from "@mui/material";
import type { ListSubheaderProps } from "@mui/material";

import { TextField } from "@/components/text-field";

export function DropdownSearch({
  value,
  onChange,
  placeholder = "Search...",
  ...listSubheaderProps
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
} & Omit<ListSubheaderProps, "onChange" | "children">) {
  return (
    <ListSubheader {...listSubheaderProps} sx={{ px: 2, pt: 1, pb: 0 }}>
      <TextField
        size="small"
        autoFocus
        fullWidth
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        // Typing shouldn't reach the menu's own type-ahead; Escape still
        // closes it.
        onKeyDown={(e) => {
          if (e.key !== "Escape") e.stopPropagation();
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
  );
}
