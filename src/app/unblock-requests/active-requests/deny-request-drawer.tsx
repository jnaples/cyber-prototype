// "Deny Request" drawer — opened from the Active Requests Deny row action.
// Mirrors the Add to Allow List drawer: request context up top, a summary of
// what denying does, an editable message sent to the requester, and a
// secondary "Deny & Ignore" action that also suppresses future requests.

import { Box, Divider, TextField, Typography } from "@mui/material";
import { useState } from "react";

import { Drawer } from "@/components/drawer";

export function DenyRequestDrawer({
  open,
  onClose,
  onDeny,
  domain = "this domain",
  requester = "the requester",
  reason,
}: {
  open: boolean;
  onClose: () => void;
  /** Deny the request and notify the requester. */
  onDeny?: () => void;
  domain?: string;
  requester?: string;
  reason?: string;
}) {
  const [message, setMessage] = useState("");

  // Prefill an editable message each time the drawer opens.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setMessage(
        `Your request to unblock ${domain} was not approved under your organization's policy.`,
      );
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Deny request and notify user"
      secondaryAction={{ label: "Cancel", onClick: onClose }}
      primaryAction={{
        label: "Deny Request",
        onClick: () => {
          onDeny?.();
          onClose();
        },
      }}
    >
      {/* Request context */}
      <Box>
        <Typography sx={{ fontWeight: 600, fontSize: 16, color: "text.primary" }}>
          {domain}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
          Requested by: {requester}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Reason: {reason && `“${reason}”`}
        </Typography>
      </Box>

      <Divider />

      {/* Summary */}
      <Box>
        <Typography sx={{ color: "text.primary" }}>
          Deny the request and notify the user via email.
        </Typography>
        <Typography sx={{ color: "text.primary", mt: 0.5 }}>
          {requester} can submit another request later.
        </Typography>
      </Box>

      {/* Message to requester */}
      <Box>
        <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 0.5 }}>
          Message to Requester
        </Typography>
        <TextField
          fullWidth
          multiline
          minRows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          sx={{ "& .MuiOutlinedInput-root": { bgcolor: "background.paper" } }}
        />
      </Box>

    </Drawer>
  );
}
