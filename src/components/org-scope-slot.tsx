// The scope line beside a page title: which organizations the page is showing,
// and the chip that opens the organization drill-down. Shared by Deployments,
// Unblock Requests and Reports so the three read identically.

import { Box, Divider, Typography } from "@mui/material";

import { OrganizationScopeChip } from "@/components/organization-scope-chip";
import { useOrgScope } from "@/hooks/use-org-scope";

export function OrgScopeSlot() {
  const { organization, setOrganization } = useOrgScope();

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        {organization ?? "All Organizations"}
      </Typography>
      <Divider
        orientation="vertical"
        flexItem
        sx={(theme) => ({
          mx: 1,
          // Ink at 60% on the light header; its paper-side counterpart on dark,
          // where near-black would disappear into the surface.
          borderColor: "rgba(3, 22, 37, 0.6)",
          ...theme.applyStyles("dark", {
            borderColor: "rgba(236, 241, 250, 0.7)",
          }),
        })}
      />
      <OrganizationScopeChip
        organization={organization}
        onSelect={setOrganization}
        onClear={() => setOrganization(null)}
      />
    </Box>
  );
}
