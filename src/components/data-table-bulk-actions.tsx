// Bulk-actions strip rendered below a DataTable's toolbar when rows are
// selected. Shows a primary-colored "{N} {noun}s selected" label, a slot for
// action buttons (Edit, Delete, Export, anything), and an X to clear.

import CloseIcon from "@mui/icons-material/Close";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

export type DataTableBulkActionsProps = {
  /** Number of selected rows. */
  count: number;
  /** Singular noun (e.g. "roaming client"). Auto-pluralized with "s". */
  noun?: string;
  /** Optional plural override when "s" is wrong (e.g. "policies"). */
  nounPlural?: string;
  /** Right-side button slot. Pass one Button, several, or a Stack. */
  actions?: ReactNode;
  /** Optional clear handler. Renders the X icon when provided. */
  onClose?: () => void;
};

export function DataTableBulkActions({
  count,
  noun = "row",
  nounPlural,
  actions,
  onClose,
}: DataTableBulkActionsProps) {
  const word = count === 1 ? noun : (nounPlural ?? `${noun}s`);
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        px: 2,
        py: 1.5,
        alignItems: "center",
        bgcolor: "background.neutral",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Typography
        variant="body2"
        sx={{ color: "text.primary", fontWeight: 600 }}
      >
        {count.toLocaleString()} {word} selected
      </Typography>
      <Box sx={{ flex: 1 }} />
      {actions}
      {onClose && (
        <IconButton
          onClick={onClose}
          aria-label="Clear selection"
          size="small"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      )}
    </Stack>
  );
}
