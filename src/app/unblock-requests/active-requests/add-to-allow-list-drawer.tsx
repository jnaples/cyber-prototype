// "Add to Allow List" drawer — opened from the Active Requests row action.
// Shows the request context (domain + requester + reason), what the allow entry
// affects, options to include CNAMEs / also add to the org-wide global allow
// list, and an optional note.

import {
  Alert,
  AlertTitle,
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  TextField,
  Typography,
} from "@mui/material";
import { format as fnsFormat } from "date-fns";
import { useState } from "react";

import { Drawer } from "@/components/drawer";

// Placeholder impact figure for the policy scope.
const POLICY_IMPACT = "7 sites, 142 users on this policy";

// Date the note is auto-stamped with (computed once at load).
const STAMP_DATE = fnsFormat(new Date(), "MMM d, yyyy");

// Date shown in the "already on the allow list" banner (yesterday).
const ALREADY_ADDED_DATE = fnsFormat(
  new Date(Date.now() - 24 * 60 * 60 * 1000),
  "MMM d",
);

export function AddToAllowListDrawer({
  open,
  onClose,
  onSubmit,
  domain = "this domain",
  requester = "the requester",
  reason,
  policy = "this policy",
  alreadyAllowed = false,
}: {
  open: boolean;
  onClose: () => void;
  /** Called when the user confirms "Add to Allow List". */
  onSubmit?: () => void;
  domain?: string;
  requester?: string;
  reason?: string;
  policy?: string;
  /** The domain is already on the policy's allow list — this request is stale.
   *  Shows a banner and switches the action to resolving the request. */
  alreadyAllowed?: boolean;
}) {
  const [note, setNote] = useState("");
  const [includeCnames, setIncludeCnames] = useState(false);
  const [addToGlobal, setAddToGlobal] = useState(false);

  // Reset the form each time the drawer opens. The note is auto-stamped with a
  // sensible default the admin can edit or clear.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setNote(`Approved from unblock request — ${requester}, ${STAMP_DATE}.`);
      setIncludeCnames(false);
      setAddToGlobal(false);
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Add to Allow List"
      secondaryAction={{ label: "Cancel", onClick: onClose }}
      primaryAction={{
        label: alreadyAllowed ? "Resolve Request" : "Add to Allow List",
        onClick: () => {
          onSubmit?.();
          onClose();
        },
      }}
    >
      {alreadyAllowed && (
        <Alert severity="info">
          <AlertTitle>Already on the Allow List</AlertTitle>
          <Box component="strong" sx={{ fontWeight: 700 }}>
            {domain}
          </Box>{" "}
          was added to the {policy} Allow List on {ALREADY_ADDED_DATE}. No new
          entry is needed.
        </Alert>
      )}

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

      {/* Scope summary — hidden once already allowed (the banner covers it). */}
      {!alreadyAllowed && (
        <Box>
          <Typography sx={{ color: "text.primary" }}>
            Add {domain} to the{" "}
            <Box component="strong" sx={{ fontWeight: 700 }}>
              {policy}
            </Box>{" "}
            Allow List.
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            {POLICY_IMPACT}
          </Typography>
        </Box>
      )}

      {/* Actions only apply when a new entry is being made — the domain is
          already allowed, so the checkboxes and note are hidden. */}
      {!alreadyAllowed && (
        <>
          {/* Include CNAMEs */}
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={includeCnames}
                onChange={(e) => setIncludeCnames(e.target.checked)}
                sx={{ p: 0.5, mr: 1 }}
              />
            }
            label={<Typography>Include CNAMEs</Typography>}
            sx={{ m: 0 }}
          />

          {/* Also add to global allow list */}
          <Box>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={addToGlobal}
                  onChange={(e) => setAddToGlobal(e.target.checked)}
                  sx={{ p: 0.5, mr: 1 }}
                />
              }
              label={<Typography>Also Add to Universal Allow List</Typography>}
              sx={{ m: 0 }}
            />
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              This affects all sites and users.
            </Typography>
          </Box>

          {/* Note */}
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
                Note
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
              onChange={(e) => setNote(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": { bgcolor: "background.paper" },
              }}
            />
          </Box>
        </>
      )}

      {/* Notification note — pinned to the bottom of the scroll area */}
      <Typography
        variant="body2"
        sx={{ color: "text.secondary", mt: "auto" }}
      >
        {requester} will be notified{" "}
        {alreadyAllowed ? "that access is available." : "by email."}
      </Typography>
    </Drawer>
  );
}
