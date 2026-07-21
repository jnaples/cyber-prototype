// "Add to Allow List" drawer — opened from the Active Requests row action.
// Shows the request context (domain + requester + reason), what the allow entry
// affects, options to include CNAMEs / also add to the org-wide global allow
// list, and an optional note.

import {
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

import { Drawer } from "@/components/drawer";

// Placeholder impact figures for the two scopes.
const POLICY_IMPACT = "7 Sites / 142 Users on this policy";
const GLOBAL_IMPACT = "12 Sites / 480 Users in the organization";

export function AddToAllowListDrawer({
  open,
  onClose,
  domain = "this domain",
  requester = "the requester",
  reason,
  policy = "this policy",
}: {
  open: boolean;
  onClose: () => void;
  domain?: string;
  requester?: string;
  reason?: string;
  policy?: string;
}) {
  const [note, setNote] = useState("");
  const [includeCnames, setIncludeCnames] = useState(false);
  const [addToGlobal, setAddToGlobal] = useState(false);

  // Reset the form each time the drawer opens.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setNote("");
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
      primaryAction={{ label: "Add to Allow List", onClick: onClose }}
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

      {/* Scope summary */}
      <Box>
        <Typography sx={{ color: "text.primary" }}>
          Add {domain} to the{" "}
          <Box component="strong" sx={{ fontWeight: 700 }}>
            {policy}
          </Box>{" "}
          Allow List.
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          Affects {POLICY_IMPACT}.
        </Typography>
      </Box>

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
          Affects all {GLOBAL_IMPACT}.
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
          <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Note</Typography>
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
          sx={{ "& .MuiOutlinedInput-root": { bgcolor: "background.paper" } }}
        />
      </Box>

      {/* Notification note — pinned to the bottom of the scroll area */}
      <Typography
        variant="body2"
        sx={{ color: "text.secondary", mt: "auto" }}
      >
        {requester} will be notified by email.
      </Typography>
    </Drawer>
  );
}
