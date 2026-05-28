// Space-conserving Select: the label lives inline inside the input
// (as a placeholder when empty, as a "Label: Value" prefix once chosen)
// instead of floating above the field. Use where vertical space is tight.

import { Box, FormControl, MenuItem, Select } from "@mui/material";

export interface InlineLabelSelectOption<T extends string | number> {
  value: T;
  label: string;
}

export interface InlineLabelSelectProps<T extends string | number> {
  label: string;
  options: InlineLabelSelectOption<T>[];
  // "" represents the unselected state — MUI's Select convention for empty.
  value: T | "";
  // Fires only when the user picks a real option, so T (never "").
  onChange: (value: T) => void;
  fullWidth?: boolean;
}

export function InlineLabelSelect<T extends string | number>({
  label,
  options,
  value,
  onChange,
  fullWidth = true,
}: InlineLabelSelectProps<T>) {
  return (
    <FormControl fullWidth={fullWidth}>
      <Select<T | "">
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        // Without displayEmpty, MUI hides the input contents while value is ""
        // and relies on a floating label — we want our placeholder to show instead.
        displayEmpty
        // renderValue paints whatever sits inside the closed input box.
        renderValue={(selected) => {
          if (selected === "") {
            return (
              // Matches MUI's native <input> placeholder opacity (0.42 / 0.5)
              // so it visually reads as a placeholder in both themes.
              <Box
                component="span"
                sx={(theme) => ({
                  opacity: theme.palette.mode === "dark" ? 0.5 : 0.42,
                })}
              >
                {label}
              </Box>
            );
          }
          const match = options.find((o) => o.value === selected);
          return (
            <>
              <Box component="span" sx={{ fontWeight: 600 }}>
                {label}:
              </Box>{" "}
              {match?.label ?? String(selected)}
            </>
          );
        }}
      >
        {options.map((o) => (
          <MenuItem key={String(o.value)} value={o.value}>
            {o.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
