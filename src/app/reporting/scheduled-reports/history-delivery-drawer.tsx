// Delivery details for a single run in History — opened from the row's
// overflow menu. Recipients are split into what landed and what bounced, each
// behind the same expand/collapse header the side nav uses.
//
// The counts come from the row itself: a row reading "Bounced (2)" shows two
// bounced addresses, and every other row shows none.

import {
  Box,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useState } from "react";

import { Drawer } from "@/components/drawer";
import { MaterialSymbol } from "@/components/material-symbol";

import type { DeliveryRecipient } from "./history-delivery";

/** One collapsible group, headed by its name and count. */
function RecipientGroup({
  label,
  recipients,
  showReason = false,
}: {
  label: string;
  recipients: DeliveryRecipient[];
  /** Add the Reason column — bounces only. */
  showReason?: boolean;
}) {
  // Both groups start closed — the counts in the headers are the summary.
  const [open, setOpen] = useState(false);
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
        <Box sx={{ maxHeight: 220, overflowY: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Recipient</TableCell>
                {/* Only a bounce has anything to say beyond the address. */}
                {showReason && <TableCell>Reason</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {recipients.map((r) => (
                <TableRow key={r.email}>
                  <TableCell>{r.email}</TableCell>
                  {showReason && <TableCell>{r.detail}</TableCell>}
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
      <RecipientGroup label="Delivered" recipients={delivered} />
      <RecipientGroup label="Bounced" recipients={bounced} showReason />
    </Drawer>
  );
}
