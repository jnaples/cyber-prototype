// "Already allowed" banner — the domain is on a policy's allow list already, so
// the request is stale. Shown in whichever drawer the admin opens (Approve,
// Deny, Deny & Ignore) so the same fact reads the same way in each.

import { Alert, AlertTitle, Box } from "@mui/material";
import { format as fnsFormat } from "date-fns";

// Prototype stand-in for the entry's real timestamp (yesterday).
const ADDED_DATE = fnsFormat(
  new Date(Date.now() - 24 * 60 * 60 * 1000),
  "MMM d",
);

export function AlreadyAllowedAlert({
  domain,
  policy,
}: {
  domain: string;
  policy: string;
}) {
  return (
    <Alert severity="info">
      <AlertTitle>Already allowed</AlertTitle>
      <Box component="strong" sx={{ fontWeight: 700 }}>
        {domain}
      </Box>{" "}
      was added to the{" "}
      <Box component="strong" sx={{ fontWeight: 700 }}>
        {policy}
      </Box>{" "}
      Allow List on {ADDED_DATE}. No new entry is needed.
    </Alert>
  );
}
