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
  ignore = false,
  domain = "this domain",
  requester = "the requester",
  reason,
}: {
  open: boolean;
  onClose: () => void;
  /** Deny the request (and notify the requester unless `ignore`). */
  onDeny?: () => void;
  /** Deny and suppress future requests — hides the message, no notification. */
  ignore?: boolean;
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
      title={ignore ? "Deny Request & Ignore" : "Deny Request"}
      secondaryAction={{ label: "Cancel", onClick: onClose }}
      primaryAction={{
        label: ignore ? "Deny & Ignore" : "Deny Request",
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
      {ignore ? (
        <Typography sx={{ color: "text.primary" }}>
          Stop future requests for this domain from {requester}. No notification
          is sent.
        </Typography>
      ) : (
        <Box>
          <Typography sx={{ color: "text.primary" }}>
            Deny the request and notify the user via email.
          </Typography>
          <Typography sx={{ color: "text.primary", mt: 0.5 }}>
            {requester} can submit another request later.
          </Typography>
        </Box>
      )}

      {/* Message to requester — only when notifying. */}
      {!ignore && (
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 0.5,
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
              Message to Requester
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Optional
            </Typography>
          </Box>
          <TextField
            fullWidth
            multiline
            minRows={3}
            placeholder="Add your message here…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { bgcolor: "background.paper" } }}
          />
        </Box>
      )}
    </Drawer>
  );
}
