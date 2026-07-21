// "Add to Allow List" confirmation dialog — opened from the Active Requests
// row action. Confirms the domain/requester context, lets the admin toggle
// CNAME inclusion and add an optional response message, and switch the scope
// between the request's policy and the organization-wide global allow list.

import {
  Box,
  Checkbox,
  FormControlLabel,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

import { Modal } from "@/components/modal";

// Placeholder impact figures for the two scopes.
const POLICY_IMPACT = "7 sites and 142 users on this policy";
const GLOBAL_IMPACT = "12 sites and 480 users in the organization";

export function AddToAllowListModal({
  open,
  onClose,
  domain = "this domain",
  requester = "the requester",
  reason,
  policy = "this policy",
  organization = "the organization",
}: {
  open: boolean;
  onClose: () => void;
  domain?: string;
  requester?: string;
  reason?: string;
  policy?: string;
  organization?: string;
}) {
  const [includeCnames, setIncludeCnames] = useState(false);
  const [message, setMessage] = useState("");
  const [scope, setScope] = useState<"policy" | "global">("policy");

  // Reset the form each time the modal opens.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setIncludeCnames(false);
      setMessage("");
      setScope("policy");
    }
  }

  const isPolicy = scope === "policy";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add to Allow List"
      width={520}
      secondaryAction={{ label: "Cancel", onClick: onClose }}
      primaryAction={{ label: "Add to Allow List", onClick: onClose }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Request context */}
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {domain} — requested by {requester}
          {reason && ` · “${reason}”`}
        </Typography>

        {/* Scope summary */}
        <Typography sx={{ color: "text.primary" }}>
          {isPolicy ? (
            <>
              Adds {domain} to the Allow List for{" "}
              <Box component="strong" sx={{ fontWeight: 700 }}>
                {policy}
              </Box>
              . Affects {POLICY_IMPACT}.
            </>
          ) : (
            <>
              Adds {domain} to the{" "}
              <Box component="strong" sx={{ fontWeight: 700 }}>
                {organization} Global Allow List
              </Box>
              . Affects all {GLOBAL_IMPACT}.
            </>
          )}
        </Typography>

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

        {/* Response message */}
        <Box>
          <Typography
            sx={{ fontWeight: 600, fontSize: 14, color: "text.secondary", mb: 0.5 }}
          >
            Response Message (Optional)
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={2}
            placeholder="Approved for business use"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { bgcolor: "background.paper" } }}
          />
        </Box>

        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {requester} will be notified by email.
        </Typography>

        {/* Scope switch */}
        <Box>
          <Link
            component="button"
            type="button"
            underline="always"
            onClick={() => setScope(isPolicy ? "global" : "policy")}
            sx={{ color: "text.primary", "&:hover": { color: "primary.light" } }}
          >
            {isPolicy
              ? `Switch to ${organization} Global Allow List`
              : `Switch to ${policy} Allow List`}
          </Link>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            {isPolicy
              ? `Affects all ${GLOBAL_IMPACT}.`
              : `Affects ${POLICY_IMPACT}.`}
          </Typography>
        </Box>
      </Box>
    </Modal>
  );
}
