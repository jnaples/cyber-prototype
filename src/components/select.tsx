// Drop-in replacement for MUI's Select that adds the app-standard clear
// affordance: once something is selected, a small ✕ fades in on hover / focus
// inside the field, just left of the dropdown arrow, and resets the value
// (multi-selects clear to an empty array).
//
// Import this instead of `Select` from @mui/material.

import CancelIcon from "@mui/icons-material/Cancel";
import {
  IconButton,
  InputAdornment,
  Select as MuiSelect,
} from "@mui/material";
import type { SelectChangeEvent, SelectProps } from "@mui/material";
import type { MouseEvent } from "react";

export type { SelectProps };

export function Select<Value = string>(props: SelectProps<Value>) {
  const { value, onChange, disabled, multiple, name, endAdornment, sx } = props;

  const hasValue = Array.isArray(value)
    ? value.length > 0
    : value != null && value !== "";
  const showClear = Boolean(onChange) && hasValue && !disabled;

  const handleClear = (event: MouseEvent<HTMLButtonElement>) => {
    onChange?.(
      {
        ...event,
        target: { name: name ?? "", value: multiple ? [] : "" },
      } as unknown as SelectChangeEvent<Value>,
      null,
    );
  };

  return (
    <MuiSelect
      {...props}
      endAdornment={
        showClear ? (
          <>
            <InputAdornment
              position="end"
              className="select-clear"
              // Sits inside the field; the margin keeps it clear of the
              // absolutely-positioned dropdown arrow.
              sx={{ visibility: "hidden", mr: 2.5, ml: 0 }}
            >
              <IconButton
                size="small"
                aria-label="Clear"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear(e);
                }}
                sx={{ color: "text.disabled", p: 0.25 }}
              >
                <CancelIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
            {endAdornment}
          </>
        ) : (
          endAdornment
        )
      }
      sx={[
        {
          "&:hover .select-clear": { visibility: "visible" },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    />
  );
}
