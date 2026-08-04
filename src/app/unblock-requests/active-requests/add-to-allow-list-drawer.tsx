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
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { format as fnsFormat } from "date-fns";
import { useState } from "react";

import { Drawer } from "@/components/drawer";

// Placeholder impact figure for the policy scope.
const POLICY_IMPACT = "7 sites, 142 users on this policy";

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
  threatCategory,
}: {
  open: boolean;
  onClose: () => void;
  /** Called when the user confirms "Save" — receives the chosen scope. */
  onSubmit?: (scope: "policy" | "universal") => void;
  domain?: string;
  requester?: string;
  reason?: string;
  policy?: string;
  /** The domain is already on the policy's allow list — this request is stale.
   *  Shows a banner and switches the action to resolving the request. */
  alreadyAllowed?: boolean;
  /** Threat category the domain is classified under — shows a red warning
   *  banner when the requested site is flagged as malicious. */
  threatCategory?: string;
}) {
  const [note, setNote] = useState("");
  const [includeCnames, setIncludeCnames] = useState(false);
  const [scope, setScope] = useState<"policy" | "universal">("policy");

  // Reset the form each time the drawer opens. The note is auto-stamped with a
  // sensible default the admin can edit or clear.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setNote("");
      setIncludeCnames(false);
      setScope("policy");
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Approve Request"
      secondaryAction={{ label: "Cancel", onClick: onClose }}
      primaryAction={{
        label: alreadyAllowed ? "Resolve Request" : "Add to Allow List",
        sx: { minWidth: 0 },
        onClick: () => {
          onSubmit?.(scope);
          onClose();
        },
      }}
    >
      {threatCategory && (
        <Alert severity="error">
          <AlertTitle>Flagged as {threatCategory}</AlertTitle>
          <Box component="strong" sx={{ fontWeight: 700 }}>
            {domain}
          </Box>{" "}
          is currently categorized as{" "}
          <Box component="strong" sx={{ fontWeight: 600 }}>
            {threatCategory}
          </Box>
          . Adding it to the Allow List will let users reach a site flagged as a
          potential threat. If you believe this is a miscategorization, report
          it before allowing.
        </Alert>
      )}

      {alreadyAllowed && (
        <Alert severity="info">
          <AlertTitle>Already on the Allow List</AlertTitle>
          <Box component="strong" sx={{ fontWeight: 700 }}>
            {domain}
          </Box>{" "}
          was added to the{" "}
          <Box component="strong" sx={{ fontWeight: 700 }}>
            {policy}
          </Box>{" "}
          Allow List on {ALREADY_ADDED_DATE}. No new entry is needed.
        </Alert>
      )}

      {!alreadyAllowed && (
        <Typography variant="body1" sx={{ color: "text.primary" }}>
          Approve this request by adding the domain to an allow list. The user
          will be notified by email.
        </Typography>
      )}

      {/* Request context */}
      <Box>
        <Typography variant="body1" sx={{ color: "text.primary" }}>
          <Box component="span" sx={{ fontWeight: 700 }}>
            Domain:
          </Box>{" "}
          {domain}
        </Typography>
        <Typography variant="body1" sx={{ color: "text.primary" }}>
          <Box component="span" sx={{ fontWeight: 700 }}>
            Requested by:
          </Box>{" "}
          {requester}
        </Typography>
        <Typography variant="body1" sx={{ color: "text.primary" }}>
          <Box component="span" sx={{ fontWeight: 700 }}>
            Reason:
          </Box>{" "}
          {reason && `“${reason}”`}
        </Typography>
      </Box>

      {/* Scope selection — hidden once already allowed (the banner covers it). */}
      {!alreadyAllowed && (
        <>
          <Divider />
          <Box>
            <FormLabel sx={{ display: "block", mb: 1 }}>
            Select Allow List
          </FormLabel>
          <RadioGroup
            value={scope}
            onChange={(e) => setScope(e.target.value as "policy" | "universal")}
            sx={{ gap: 1 }}
          >
            {[
              {
                value: "policy" as const,
                title: `${policy} Allow List`,
                desc: POLICY_IMPACT,
              },
              {
                value: "universal" as const,
                title: "Universal Allow List",
                desc: "Affects all sites and users",
              },
            ].map((option) => (
              <Box
                key={option.value}
                onClick={() => setScope(option.value)}
                sx={(theme) => {
                  const on = scope === option.value;
                  return {
                    display: "flex",
                    bgcolor: "background.paper",
                    borderRadius: 1,
                    boxShadow: theme.shadows[1],
                    cursor: "pointer",
                    transition: "background 120ms",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, on ? 0.12 : 0.04),
                    },
                  };
                }}
              >
                <Box sx={{ pl: 1, pr: 0, py: 1 }}>
                  <Radio
                    value={option.value}
                    checked={scope === option.value}
                    sx={{
                      p: "2px 12px",
                      "& .MuiSvgIcon-root": { fontSize: 20 },
                    }}
                  />
                </Box>
                <Box sx={{ pl: 0, pr: 1, py: 1 }}>
                  <Typography sx={{ color: "text.primary", mb: 0.5 }}>
                    {option.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary" }}
                  >
                    {option.desc}
                  </Typography>
                </Box>
              </Box>
            ))}
          </RadioGroup>
          </Box>
        </>
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
                Domain Note
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

    </Drawer>
  );
}
