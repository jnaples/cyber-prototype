// A tall modal: one fixed height for every panel-style dialog, a header that
// stays put, a body that scrolls, and an actions row pinned to the bottom.
// Preview Report, Investigate Mode and Archived Endpoints all render through
// this so their paper is always the same size.

import { Box, Dialog, IconButton, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

import { MaterialSymbol } from "@/components/material-symbol";

export function PanelModal({
  open,
  onClose,
  title,
  titleAlign = "center",
  titleAdornment,
  headerContent,
  actions,
  width = 900,
  bodySx,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  /** Centred by default; the Preview modals run their title along the left. */
  titleAlign?: "left" | "center";
  /** Sits beside the title — a chip, a count, a status. */
  titleAdornment?: ReactNode;
  /** Below the title row, inside the fixed header — a banner, say. */
  headerContent?: ReactNode;
  /** The bottom row. Lay the buttons out as the surface needs them. */
  actions?: ReactNode;
  width?: number;
  /** Overrides for the scrolling body — padding, background, layout. */
  bodySx?: SxProps<Theme>;
  children?: ReactNode;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      slotProps={{
        paper: {
          elevation: 1,
          sx: {
            width,
            maxWidth: "95vw",
            // The ceiling every panel modal shares — shorter content hugs,
            // taller content scrolls in the body.
            maxHeight: "min(880px, 92vh)",
            borderRadius: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          },
        },
      }}
    >
      {/* Header — fixed, so the body scrolls under it. */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          p: 2,
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Typography
            variant="cardTitle"
            sx={
              titleAlign === "center"
                ? { flex: 1, textAlign: "center" }
                : undefined
            }
          >
            {title}
          </Typography>
          {titleAdornment}
          {titleAlign === "left" && <Box sx={{ flex: 1 }} />}
          <IconButton
            size="small"
            aria-label="Close"
            onClick={onClose}
            sx={
              titleAlign === "center"
                ? { position: "absolute", top: -4, right: -4 }
                : undefined
            }
          >
            <MaterialSymbol name="close" size={20} />
          </IconButton>
        </Box>
        {headerContent}
      </Box>

      {/* Body — the only part that scrolls. */}
      <Box
        sx={[
          { flex: 1, minHeight: 0, overflowY: "auto", px: 2 },
          ...(Array.isArray(bodySx) ? bodySx : [bodySx]),
        ]}
      >
        {children}
      </Box>

      {actions && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            p: 2,
            flexShrink: 0,
          }}
        >
          {actions}
        </Box>
      )}
    </Dialog>
  );
}
