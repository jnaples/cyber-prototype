import { Box, Chip, Link, Typography } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { format as fnsFormat } from "date-fns";
import { useState } from "react";

import { DataTable } from "@/components/data-table";
import { MaterialSymbol } from "@/components/material-symbol";
import { TabbedDataCard } from "@/components/tabbed-data-card";

const columns: GridColDef[] = [
  {
    field: "domain",
    headerName: "Domain",
    width: 240,
    renderCell: (params) => (
      <Link
        href={`https://${params.row.domain}`}
        target="_blank"
        rel="noopener noreferrer"
        underline="hover"
      >
        {params.row.domain}
      </Link>
    ),
  },
  { field: "organization", headerName: "Organization", flex: 1, minWidth: 160 },
  {
    field: "site",
    headerName: "Site",
    flex: 1,
    minWidth: 150,
    renderCell: (params) => (
      <Link
        href="/deployments/sites"
        target="_blank"
        rel="noopener"
        underline="always"
        sx={{
          cursor: "pointer",
          color: "text.primary",
          textDecoration: "underline",
          textDecorationColor: "currentColor",
          "&:hover": { color: "primary.light" },
        }}
      >
        {params.row.site}
      </Link>
    ),
  },
  {
    field: "policy",
    headerName: "Policy",
    flex: 1,
    minWidth: 150,
    renderCell: (params) => (
      <Link
        href="/global-policies/filter"
        target="_blank"
        rel="noopener"
        underline="always"
        sx={{
          cursor: "pointer",
          color: "text.primary",
          textDecoration: "underline",
          textDecorationColor: "currentColor",
          "&:hover": { color: "primary.light" },
        }}
      >
        {params.row.policy}
      </Link>
    ),
  },
  { field: "category", headerName: "Category", flex: 1, minWidth: 160 },
  {
    field: "loggedInUser",
    headerName: "Logged on User",
    flex: 1,
    minWidth: 150,
  },
  { field: "email", headerName: "Email", flex: 1, minWidth: 220 },
  {
    field: "requestReason",
    headerName: "Request Reason",
    flex: 1.5,
    minWidth: 260,
  },
  { field: "actionedBy", headerName: "Actioned by", flex: 1, minWidth: 150 },
  {
    field: "timeOfAttempt",
    headerName: "Time of Submission",
    flex: 1,
    minWidth: 180,
  },
  {
    field: "resolvedDate",
    headerName: "Resolved Date",
    flex: 1,
    minWidth: 180,
  },
  {
    field: "deployment",
    headerName: "Deployment",
    flex: 1,
    minWidth: 160,
  },
  {
    field: "deploymentType",
    headerName: "Deployment Type",
    flex: 1,
    minWidth: 150,
  },
  {
    field: "internalNote",
    headerName: "Internal Notes",
    flex: 1.5,
    minWidth: 240,
  },
  {
    field: "action",
    headerName: "Decision",
    flex: 1,
    minWidth: 120,
    renderCell: (params) => {
      const allowed = params.value === "Allowed";
      return (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Chip
            size="small"
            icon={
              <MaterialSymbol name={allowed ? "check" : "block"} size={16} />
            }
            label={params.value}
            sx={(theme) => ({
              borderRadius: "6px",
              bgcolor: allowed
                ? theme.vars.palette.Alert.successStandardBg
                : theme.vars.palette.Alert.errorStandardBg,
              color: allowed
                ? theme.vars.palette.Alert.successColor
                : theme.vars.palette.Alert.errorColor,
              "& .MuiChip-icon, & .MuiChip-label": { color: "inherit" },
            })}
          />
        </Box>
      );
    },
  },
];

// ---------------------------------------------------------------------------
// Mock data — resolved unblock requests
// ---------------------------------------------------------------------------

type HistoryRequest = {
  domain: string;
  organization: string;
  site: string;
  policy: string;
  category: string;
  loggedInUser: string;
  email: string;
  requestReason: string;
  actionedBy: string;
  action: string;
  /** What the admin noted when resolving — blank when they left it empty. */
  internalNote: string;
};

const HISTORY: HistoryRequest[] = [
  {
    domain: "linkedin.com",
    organization: "Northwind Traders",
    site: "Seattle HQ",
    policy: "Standard Policy",
    category: "Social Networking",
    loggedInUser: "Sarah Chen",
    email: "sarah.chen@northwind.com",
    requestReason: "Need LinkedIn for recruiting and sales outreach",
    actionedBy: "Jordan Blake",
    action: "Allowed",
    internalNote:
      "Approved for the recruiting team only; revisit at Q3 policy review.",
  },
  {
    domain: "youtube.com",
    organization: "Globex Manufacturing",
    site: "Detroit Plant",
    policy: "Default Filtering",
    category: "Streaming Media",
    loggedInUser: "Marcus Thompson",
    email: "marcus.thompson@globex.com",
    requestReason: "Vendor posted required machine-training videos",
    actionedBy: "Casey Morgan",
    action: "Allowed",
    internalNote: "Vendor training runs through end of quarter.",
  },
  {
    domain: "dropbox.com",
    organization: "Contoso Health",
    site: "Austin Clinic",
    policy: "HIPAA Strict",
    category: "File Sharing",
    loggedInUser: "Priya Patel",
    email: "priya.patel@contosohealth.com",
    requestReason: "Referring clinic shared patient records here",
    actionedBy: "Riley Adams",
    action: "Allowed",
    internalNote: "Legal signed off — BAA on file with the referring clinic.",
  },
  {
    domain: "github.com",
    organization: "Initech Legal",
    site: "Chicago Office",
    policy: "Standard Policy",
    category: "Proxy, Anonymizer",
    loggedInUser: "David Park",
    email: "david.park@initechlegal.com",
    requestReason: "Miscategorized — needed for internal dev tooling",
    actionedBy: "Jordan Blake",
    action: "Allowed",
    internalNote:
      "Miscategorization reported to DNSFilter; added to the policy allow list.",
  },
  {
    domain: "canva.com",
    organization: "Umbrella Retail",
    site: "Phoenix HQ",
    policy: "Marketing Policy",
    category: "Personal Storage",
    loggedInUser: "Lisa Wang",
    email: "lisa.wang@umbrellaretail.com",
    requestReason: "Designing this quarter's promo graphics",
    actionedBy: "Casey Morgan",
    action: "Blocked",
    internalNote: "Denied — use the licensed design tool already provisioned.",
  },
  {
    domain: "reddit.com",
    organization: "Northwind Traders",
    site: "Portland DC",
    policy: "Support Policy",
    category: "Forums",
    loggedInUser: "Diego Silva",
    email: "diego.silva@northwind.com",
    requestReason: "Customer reported a bug discussed in a thread",
    actionedBy: "Riley Adams",
    action: "Allowed",
    internalNote: "Temporary, tied to the open support ticket.",
  },
  {
    domain: "wetransfer.com",
    organization: "Contoso Health",
    site: "Dallas Hospital",
    policy: "Finance Policy",
    category: "File Sharing",
    loggedInUser: "Nina Volkov",
    email: "nina.volkov@contosohealth.com",
    requestReason: "Auditor is sending large year-end documents",
    actionedBy: "Jordan Blake",
    action: "Allowed",
    internalNote: "Year-end audit only; remove after the January close.",
  },
  {
    domain: "chatgpt.com",
    organization: "Globex Manufacturing",
    site: "Cincinnati HQ",
    policy: "Engineering Policy",
    category: "AI Tools",
    loggedInUser: "Kevin O'Brien",
    email: "kevin.obrien@globex.com",
    requestReason: "Approved for debugging production code",
    actionedBy: "Casey Morgan",
    action: "Allowed",
    internalNote: "",
  },
  {
    domain: "vimeo.com",
    organization: "Umbrella Retail",
    site: "Tucson Store",
    policy: "Marketing Policy",
    category: "Streaming Media",
    loggedInUser: "Hannah Lee",
    email: "hannah.lee@umbrellaretail.com",
    requestReason: "Embedded product demo for the landing page",
    actionedBy: "Riley Adams",
    action: "Blocked",
    internalNote: "Denied — host the demo on the marketing CDN instead.",
  },
  {
    domain: "nytimes.com",
    organization: "Initech Legal",
    site: "NYC Office",
    policy: "Standard Policy",
    category: "News",
    loggedInUser: "Tom Bradley",
    email: "tom.bradley@initechlegal.com",
    requestReason: "Industry research for an active client matter",
    actionedBy: "Jordan Blake",
    action: "Allowed",
    internalNote: "",
  },
];

// Deployment values mirror the DNS Query Log grid's.
const DEPLOYMENTS = ["macOS Agent 14.2", "Windows Agent 15"];
const DEPLOYMENT_TYPES = ["Roaming Client", "Relay", "Site"];

// Attempts span prior business days; each was resolved a few hours later.
const NOW = new Date();
const rows = HISTORY.map((request, i) => {
  const attempt = new Date(NOW);
  attempt.setDate(attempt.getDate() - Math.floor(i / 3) - 1);
  attempt.setHours(9 + (i % 3) * 3, (i * 17) % 60, 0, 0);
  const resolved = new Date(attempt.getTime() + (1 + (i % 4)) * 60 * 60 * 1000);
  return {
    id: i + 1,
    ...request,
    timeOfAttempt: fnsFormat(attempt, "MMM d, yyyy h:mm a"),
    resolvedDate: fnsFormat(resolved, "MMM d, yyyy h:mm a"),
    deployment: DEPLOYMENTS[i % DEPLOYMENTS.length],
    deploymentType: DEPLOYMENT_TYPES[i % DEPLOYMENT_TYPES.length],
  };
});

// Deployment / Deployment Type ship hidden; users turn them on in Preferences.
const DEFAULT_COLUMN_VISIBILITY = { deployment: false, deploymentType: false };

function RequestHistoryEmptyOverlay() {
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography variant="body2" sx={{ color: "text.primary" }}>
        No results found.
      </Typography>
    </Box>
  );
}

export default function RequestHistoryPage() {
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >(DEFAULT_COLUMN_VISIBILITY);

  return (
    <TabbedDataCard>
      <DataTable
        rows={rows}
        columns={columns}
        checkboxSelection={false}
        showDefaultView={false}
        noRowsOverlay={RequestHistoryEmptyOverlay}
        pinnedShadowFields={{ left: "domain" }}
        columnVisibilityModel={columnVisibility}
        onColumnVisibilityModelChange={setColumnVisibility}
      />
    </TabbedDataCard>
  );
}
