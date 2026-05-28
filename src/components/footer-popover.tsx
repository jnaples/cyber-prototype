import type { PopoverProps } from "@mui/material";
import { Popover } from "@mui/material";
import React from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FooterPopoverProps
  extends Omit<PopoverProps, "open" | "anchorEl" | "onClose" | "children"> {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  children: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FooterPopover({
  open,
  anchorEl,
  onClose,
  children,
  ...rest
}: FooterPopoverProps) {
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      transformOrigin={{ vertical: "bottom", horizontal: "center" }}
      sx={{ mt: "-8px" }}
      slotProps={{
        paper: {
          sx: {
            borderRadius: "12px",
            boxShadow: 6,
            overflow: "visible",
            bgcolor: "background.paper",
            backgroundImage: "none",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: -6,
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: "6px solid",
              borderTopColor: "background.paper",
            },
          },
        },
      }}
      {...rest}
    >
      {children}
    </Popover>
  );
}
