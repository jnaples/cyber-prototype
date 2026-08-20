// Delivery details for a single run in History — opened from the row's
// overflow menu. Recipients are split into what landed and what bounced, each
// behind the same expand/collapse header the side nav uses.
//
// The counts come from the row itself: a row reading "Bounced (2)" shows two
// bounced addresses, and every other row shows none.

import { Box, Collapse, Typography } from "@mui/material";
import { useState } from "react";

import { Drawer } from "@/components/drawer";
import { MaterialSymbol } from "@/components/material-symbol";

import type { DeliveryRecipient } from "./history-delivery";

/** One collapsible group, headed by its name and count. */
function RecipientGroup({
  label,
  recipients,
  tone,
  icon,
  defaultOpen = false,
}: {
  label: string;
  recipients: DeliveryRecipient[];
  /** Palette key for the per-row status icon. */
  tone: "success" | "error";
  icon: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const empty = recipients.length === 0;
  return (
    <Box>
      <Box
        role="button"
        tabIndex={empty ? -1 : 0}
        aria-disabled={empty}
        onClick={() => {
          if (!empty) setOpen((o) => !o);
        }}
        onKeyDown={(event) => {
          if (empty) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen((o) => !o);
          }
        }}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          px: 1,
          py: 1,
          borderRadius: 1,
          userSelect: "none",
          // An empty group has nothing to open, so it doesn't invite a click.
          cursor: empty ? "default" : "pointer",
          color: empty ? "text.disabled" : "text.primary",
          "&:hover": { bgcolor: empty ? "transparent" : "action.hover" },
        }}
      >
        <Typography sx={{ fontWeight: 600, color: "inherit" }}>
          {label} ({recipients.length})
        </Typography>
        {!empty && (
          <MaterialSymbol
            name={open ? "expand_less" : "expand_more"}
            size={20}
          />
        )}
      </Box>
      <Collapse in={open && !empty}>
        {/* Long lists scroll inside the group rather than pushing the other
            group off the bottom of the drawer. */}
        <Box
          sx={{
            maxHeight: 220,
            overflowY: "auto",
            px: 1,
            pt: 0.5,
            pb: 1,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          {recipients.map((r) => (
            <Box
              key={r.email}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  minWidth: 0,
                }}
              >
                <MaterialSymbol
                  name={icon}
                  size={18}
                  sx={{ color: `${tone}.main`, flexShrink: 0 }}
                />
                <Typography variant="body2" noWrap sx={{ minWidth: 0 }}>
                  {r.email}
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", flexShrink: 0 }}
              >
                {r.detail}
              </Typography>
            </Box>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}

export function HistoryDeliveryDrawer({
  open,
  onClose,
  delivered,
  bounced,
}: {
  open: boolean;
  onClose: () => void;
  delivered: DeliveryRecipient[];
  bounced: DeliveryRecipient[];
}) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Delivery details"
      // A lone secondary action keeps the left side of the footer.
      secondaryAction={{ label: "Back", onClick: onClose }}
    >
      <RecipientGroup
        label="Delivered"
        recipients={delivered}
        tone="success"
        icon="check_circle"
        defaultOpen
      />
      <RecipientGroup
        label="Bounced"
        recipients={bounced}
        tone="error"
        icon="error"
        // The reason the drawer was opened, when there is one.
        defaultOpen={bounced.length > 0}
      />
    </Drawer>
  );
}
