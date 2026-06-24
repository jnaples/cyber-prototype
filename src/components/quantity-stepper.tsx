import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { Box, IconButton, InputBase } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { useState } from "react";

export type QuantityStepperProps = {
  value: number;
  onChange: (value: number) => void;
  /** Lower bound; the field clamps to this on blur and the − button stops here. */
  min?: number;
  /** Upper bound; the + button stops here and the field clamps to it on blur. */
  max?: number;
  /** Amount added/removed per button press. */
  step?: number;
  /** Accessible label for the editable number field. */
  ariaLabel?: string;
  /** Styles forwarded to the root container. */
  sx?: SxProps<Theme>;
};

/**
 * A bordered "− [value] +" number stepper. The center value is an editable,
 * digits-only field that auto-sizes to its content; the − / + buttons step by
 * `step` and respect `min`/`max`.
 */
export function QuantityStepper({
  value,
  onChange,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  ariaLabel = "Quantity",
  sx,
}: QuantityStepperProps) {
  // While typing we hold a raw string draft so intermediate values (e.g. "5"
  // on the way to "50") aren't clamped out from under the user; we reconcile
  // to a clamped number on blur.
  const [draft, setDraft] = useState<string | null>(null);

  const clamp = (n: number) => Math.min(max, Math.max(min, n));

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const digits = event.target.value.replace(/\D/g, "");
    setDraft(digits);
    if (digits !== "") onChange(Math.min(max, Number(digits)));
  };

  const handleBlur = () => {
    onChange(draft === null || draft === "" ? min : clamp(Number(draft)));
    setDraft(null);
  };

  const display = draft ?? String(value);

  // Buttons sit a touch darker than the input field. In light mode that's the
  // neutral grey over white; in dark mode `neutral` is lighter than the paper
  // field (looks inverted), so drop to the darker default surface instead.
  const buttonSx = (theme: Theme) => ({
    width: 36,
    height: "100%",
    borderRadius: 0,
    bgcolor: "background.neutral",
    color: "text.primary",
    "& .MuiSvgIcon-root": { fontSize: 16 },
    ...theme.applyStyles("dark", {
      bgcolor: theme.vars.palette.background.default,
    }),
  });

  return (
    <Box
      sx={[
        {
          display: "flex",
          height: 40,
          border: 1,
          borderColor: "divider",
          borderRadius: "6px",
          overflow: "hidden",
          bgcolor: "background.paper",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <IconButton
        aria-label="Decrease"
        disabled={value <= min}
        onClick={() => onChange(clamp(value - step))}
        sx={[buttonSx, { borderRight: 1, borderColor: "divider" }]}
      >
        <RemoveIcon />
      </IconButton>
      <InputBase
        value={display}
        onChange={handleChange}
        onBlur={handleBlur}
        inputProps={{
          inputMode: "numeric",
          pattern: "[0-9]*",
          size: Math.max(1, display.length),
          "aria-label": ariaLabel,
          sx: { textAlign: "center", p: 0, fontSize: 16, width: "auto" },
        }}
        sx={{ px: 2, color: "text.primary" }}
      />
      <IconButton
        aria-label="Increase"
        disabled={value >= max}
        onClick={() => onChange(clamp(value + step))}
        sx={[buttonSx, { borderLeft: 1, borderColor: "divider" }]}
      >
        <AddIcon />
      </IconButton>
    </Box>
  );
}
