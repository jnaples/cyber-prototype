// Drop-in replacement for MUI's TextField that adds the app-standard clear
// affordance: once the field holds a value, a small ✕ fades in on hover /
// focus and resets the field to its empty state.
//
// Import this instead of `TextField` from @mui/material. Skipped automatically
// for disabled / read-only fields and for uncontrolled fields (no onChange).

import CancelIcon from "@mui/icons-material/Cancel";
import {
  IconButton,
  InputAdornment,
  TextField as MuiTextField,
} from "@mui/material";
import type { TextFieldProps } from "@mui/material";
import type { ChangeEvent, MouseEvent, ReactNode } from "react";

export type { TextFieldProps };

export function TextField(props: TextFieldProps) {
  const { value, onChange, disabled, slotProps, sx, name, ...rest } = props;

  const inputSlotProps = (slotProps?.input ?? {}) as Record<string, unknown>;
  const readOnly = Boolean(inputSlotProps.readOnly);
  const hasValue = Array.isArray(value)
    ? value.length > 0
    : value != null && value !== "";
  const showClear = Boolean(onChange) && hasValue && !disabled && !readOnly;

  const handleClear = (event: MouseEvent<HTMLButtonElement>) => {
    // Synthesize the shape handlers actually read (`e.target.value`).
    onChange?.({
      ...event,
      target: { name: name ?? "", value: "" },
      currentTarget: { name: name ?? "", value: "" },
    } as unknown as ChangeEvent<HTMLInputElement>);
  };

  const existingEndAdornment = inputSlotProps.endAdornment as ReactNode;

  return (
    <MuiTextField
      {...rest}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      slotProps={{
        ...slotProps,
        input: {
          ...inputSlotProps,
          endAdornment: showClear ? (
            <>
              <InputAdornment
                position="end"
                className="field-clear"
                sx={{ visibility: "hidden", ml: 0 }}
              >
                <IconButton
                  size="small"
                  aria-label="Clear"
                  // Keep focus/selection from shifting before the clear lands.
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleClear}
                  sx={{ color: "text.disabled", p: 0.25 }}
                >
                  <CancelIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
              {existingEndAdornment}
            </>
          ) : (
            existingEndAdornment
          ),
        },
      }}
      sx={[
        {
          "&:hover .field-clear": { visibility: "visible" },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    />
  );
}
