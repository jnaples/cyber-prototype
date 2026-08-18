// "Deny Request" drawer — opened from the Active Requests Deny row action.
// Mirrors the Add to Allow List drawer: request context up top, a summary of
// what denying does, an editable message sent to the requester, and a
// secondary "Deny & Ignore" action that also suppresses future requests.

import { Box, Chip, Divider, Link, Typography } from "@mui/material";
import { useState } from "react";

import { Drawer } from "@/components/drawer";
import { TextField } from "@/components/text-field";

import { AlreadyAllowedAlert } from "./already-allowed-alert";

export function DenyRequestDrawer({
  open,
  onClose,
  onDeny,
  ignore = false,
  domain = "this domain",
  requester = "the requester",
  reason,
  category = "Uncategorized",
  policy = "this policy",
  alreadyAllowed = false,
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
  /** The domain's content category, shown alongside the request context. */
  category?: string;
  policy?: string;
  /** The domain is already on the policy's allow list — the request is stale. */
  alreadyAllowed?: boolean;
}) {
  const [message, setMessage] = useState("");
  const [note, setNote] = useState("");

  // Prefill an editable message each time the drawer opens.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setNote("");
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
        // Nothing left to deny once the domain is allowed — the action is
        // just closing out the stale request.
        label: alreadyAllowed
          ? "Resolve Request"
          : ignore
            ? "Deny & Ignore"
            : "Deny Request",
        onClick: () => {
          onDeny?.();
          onClose();
        },
      }}
    >
      {alreadyAllowed && (
        <AlreadyAllowedAlert domain={domain} policy={policy} action="link" />
      )}

      {/* Summary — the banner covers it once the domain is already allowed. */}
      {alreadyAllowed ? null : ignore ? (
        <Typography variant="body2" sx={{ color: "text.primary" }}>
          Stop future requests for this domain from {requester}. No notification
          is sent.
        </Typography>
      ) : (
        <Box>
          <Typography variant="body2" sx={{ color: "text.primary" }}>
            Deny the request and notify the user via email.
          </Typography>
          <Typography variant="body2" sx={{ color: "text.primary", mt: 0.5 }}>
            {requester} can submit another request later.
          </Typography>
        </Box>
      )}

      {/* Request context */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <Typography variant="body2" sx={{ color: "text.primary" }}>
          <Box component="span" sx={{ fontWeight: 700 }}>
            Domain:
          </Box>{" "}
          <Link
            href={`https://${domain}`}
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            sx={{ color: "text.primary" }}
          >
            {domain}
          </Link>
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography
            variant="body2"
            sx={{ color: "text.primary", fontWeight: 700 }}
          >
            Category:
          </Typography>
          <Chip
            label={category}
            size="small"
            variant="outlined"
            color="secondary"
          />
        </Box>
        <Typography variant="body2" sx={{ color: "text.primary" }}>
          <Box component="span" sx={{ fontWeight: 700 }}>
            Policy:
          </Box>{" "}
          {policy}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.primary" }}>
          <Box component="span" sx={{ fontWeight: 700 }}>
            Requester:
          </Box>{" "}
          {requester}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.primary" }}>
          <Box component="span" sx={{ fontWeight: 700 }}>
            Message:
          </Box>{" "}
          {reason && `“${reason}”`}
        </Typography>
      </Box>

      {!alreadyAllowed && <Divider />}

      {/* Internal notes — the record of why, kept out of the requester's
          email. Same field the Approve drawer carries. */}
      {!alreadyAllowed && (
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 0.5,
            }}
          >
            <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
              Internal Notes
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Optional
            </Typography>
          </Box>
          <TextField
            fullWidth
            multiline
            minRows={3}
            placeholder="Add your notes here..."
            value={note}
            helperText="Saved to Request History."
            onChange={(e) => setNote(e.target.value)}
            sx={{
              // 14px: the size the app's other helper copy reads at.
              "& .MuiFormHelperText-root": { fontSize: 14 },
            }}
          />
        </Box>
      )}

      {/* Message to requester — only when notifying. */}
      {!ignore && !alreadyAllowed && (
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 0.5,
            }}
          >
            <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
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
          />
        </Box>
      )}
    </Drawer>
  );
}
