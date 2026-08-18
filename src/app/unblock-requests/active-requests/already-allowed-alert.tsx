// "Already allowed" banner — the domain is on a policy's allow list already, so
// the request is stale. Shown in whichever drawer the admin opens (Approve,
// Deny, Deny & Ignore) so the same fact reads the same way in each.

import { Alert, AlertTitle, Box, Link } from "@mui/material";
import { format as fnsFormat } from "date-fns";

// Prototype stand-in for the entry's real timestamp (yesterday).
const ADDED_DATE = fnsFormat(
  new Date(Date.now() - 24 * 60 * 60 * 1000),
  "MMM d",
);

export function AlreadyAllowedAlert({
  domain,
  policy,
  action,
}: {
  domain: string;
  policy: string;
  /** Closing beat: a note that no entry is needed (Approve, where one would
   *  otherwise be written) or a link out to the policy (Deny). */
  action?: "note" | "link";
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
      Allow List on {ADDED_DATE}.{" "}
      {action === "link" ? (
        <Link
          href="/global-policies"
          target="_blank"
          rel="noopener"
          underline="hover"
          sx={(theme) => ({
            fontWeight: 700,
            color: theme.vars.palette.primary.main,
            // Full-strength primary is too dark on the dark alert surface.
            ...theme.applyStyles("dark", {
              color: theme.vars.palette.primary.light,
            }),
          })}
        >
          View policy
        </Link>
      ) : (
        "No new entry is needed."
      )}
    </Alert>
  );
}
