// "Add to Allow List" drawer — opened from the Active Requests row action.
// Shows the request context (domain + requester + reason), what the allow entry
// affects, options to include CNAMEs / also add to the org-wide global allow
// list, and an optional note.

import {
  Alert,
  AlertTitle,
  Box,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useState } from "react";

import { Drawer } from "@/components/drawer";
import { PolicySelect } from "@/components/policy-select";
import { TextField } from "@/components/text-field";

import { AlreadyAllowedAlert } from "./already-allowed-alert";

// Prototype stand-in: the policies whose allow list already carries the
// domain, so picking them again would be a no-op.
const ALREADY_ALLOWED_POLICIES = [
  "CIPA Policy",
  "Super, Duper, Extra Secure, Extra Strict Policy",
];

export function AddToAllowListDrawer({
  open,
  onClose,
  onSubmit,
  domain = "this domain",
  requester = "the requester",
  reason,
  category = "Uncategorized",
  policy = "this policy",
  alreadyAllowed = false,
  threatCategory,
}: {
  open: boolean;
  onClose: () => void;
  /** Called when the user confirms "Save" — receives the chosen scope and,
   *  for the policy scope, which policies' allow lists the entry lands on. */
  onSubmit?: (scope: "policy" | "universal", policies: string[]) => void;
  domain?: string;
  requester?: string;
  reason?: string;
  /** The domain's content category, shown alongside the request context. */
  category?: string;
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
  const [selectedPolicies, setSelectedPolicies] = useState<string[]>([]);

  // Reset the form each time the drawer opens. The note is auto-stamped with a
  // sensible default the admin can edit or clear.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setNote("");
      setIncludeCnames(false);
      setScope("policy");
      setSelectedPolicies([]);
    }
  }

  // The policy scope needs a policy named before the entry can be written —
  // and specifically the one that blocked the request, since an entry on any
  // other policy wouldn't reach this user.
  const needsPolicy =
    !alreadyAllowed && scope === "policy" && selectedPolicies.length === 0;
  const missingCurrentPolicy =
    !alreadyAllowed &&
    scope === "policy" &&
    selectedPolicies.length > 0 &&
    !selectedPolicies.includes(policy);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Approve Request"
      secondaryAction={{ label: "Cancel", onClick: onClose }}
      primaryAction={{
        label: alreadyAllowed ? "Approve and notify" : "Approve Request",
        sx: { minWidth: 0 },
        disabled: needsPolicy || missingCurrentPolicy,
        tooltip:
          needsPolicy || missingCurrentPolicy
            ? "Add the domain to the current policy or Universal Allow List to approve request."
            : "",
        onClick: () => {
          onSubmit?.(scope, selectedPolicies);
          onClose();
        },
      }}
    >
      {threatCategory && (
        <Alert severity="error" icon={<WarningAmberIcon />}>
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
        <AlreadyAllowedAlert domain={domain} policy={policy} />
      )}

      {!alreadyAllowed && (
        <Typography variant="body2" sx={{ color: "text.primary" }}>
          Approve this request by adding the domain to a policy allow list. The
          user will be notified by email.
        </Typography>
      )}

      {/* Request context */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <Typography variant="body2" sx={{ color: "text.primary" }}>
          <Box component="span" sx={{ fontWeight: 700 }}>
            Domain:
          </Box>{" "}
          {domain}
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

      {/* Scope selection — hidden once already allowed (the banner covers it). */}
      {!alreadyAllowed && (
        <>
          <Divider />
          <Box>
            <FormLabel sx={{ display: "block", mb: 1 }}>
              Add domain to
            </FormLabel>
            <RadioGroup
              value={scope}
              onChange={(e) =>
                setScope(e.target.value as "policy" | "universal")
              }
              sx={{ gap: 2 }}
            >
              {/* Policy scope — which policy is up to the admin, so the
                  option carries its own picker. */}
              <Box
                onClick={() => setScope("policy")}
                sx={{ cursor: "pointer" }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Radio
                    value="policy"
                    checked={scope === "policy"}
                    sx={{
                      p: 0,
                      mr: 1,
                      "& .MuiSvgIcon-root": { fontSize: 20 },
                    }}
                  />
                  <Typography sx={{ color: "text.primary" }}>
                    Policies
                  </Typography>
                </Box>
                {/* Indented to the option's label, and dead while the entry is
                    going to the universal list instead. */}
                <PolicySelect
                  multiple
                  currentPolicy={policy}
                  allowedPolicies={ALREADY_ALLOWED_POLICIES}
                  disableClear
                  disabled={scope !== "policy"}
                  value={selectedPolicies}
                  onChange={setSelectedPolicies}
                  placeholder="Select Policy"
                  sx={{
                    mt: "4px",
                    ml: "28px",
                    width: "calc(100% - 28px)",
                    bgcolor: "background.paper",
                  }}
                />
              </Box>

              <Box
                onClick={() => setScope("universal")}
                sx={{ display: "flex", cursor: "pointer" }}
              >
                <Radio
                  value="universal"
                  checked={scope === "universal"}
                  sx={{
                    p: 0,
                    mr: 1,
                    alignSelf: "flex-start",
                    "& .MuiSvgIcon-root": { fontSize: 20 },
                  }}
                />
                <Box>
                  <Typography sx={{ color: "text.primary" }}>
                    Universal Allow List
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Affects all Sites and users
                  </Typography>
                </Box>
              </Box>
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
              helperText="Saved to Request History and the allow list entry."
              onChange={(e) => setNote(e.target.value)}
              sx={{
                // 14px: the size the app's other helper copy reads at.
                "& .MuiFormHelperText-root": { fontSize: 14 },
              }}
            />
          </Box>
        </>
      )}
    </Drawer>
  );
}
