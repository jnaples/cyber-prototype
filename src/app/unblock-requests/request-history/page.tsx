import {
  Box,
  Chip,
  IconButton,
  Link,
  ListItemIcon,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";
import type { GridColDef } from "@mui/x-data-grid";
import { format as fnsFormat } from "date-fns";
import { useState } from "react";

import { DataTable } from "@/components/data-table";
import { MaterialSymbol } from "@/components/material-symbol";
import { TabbedDataCard } from "@/components/tabbed-data-card";
import { useOrgScope } from "@/hooks/use-org-scope";
import { DomainCell } from "../domain-cell";

/** Row overflow menu — one item here, the policy the request was judged by. */
function HistoryActionsCell() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        width: "100%",
      }}
    >
      <IconButton
        size="small"
        aria-label="More options"
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        <MoreHorizOutlinedIcon sx={{ fontSize: 20 }} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            // A new tab so the history stays where it is.
            window.open("/global-policies", "_blank", "noopener");
          }}
        >
          <ListItemIcon>
            <MaterialSymbol name="library_books" size={20} />
          </ListItemIcon>
          View Policy
        </MenuItem>
      </Menu>
    </Box>
  );
}

const columns: GridColDef[] = [
  {
    field: "domain",
    headerName: "Domain",
    width: 240,
    renderCell: (params) => <DomainCell domain={params.row.domain} />,
  },
  { field: "category", headerName: "Category", flex: 1, minWidth: 160 },
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
  {
    field: "actions",
    headerName: "Actions",
    width: 90,
    sortable: false,
    filterable: false,
    resizable: false,
    align: "center",
    headerAlign: "center",
    disableColumnMenu: true,
    renderCell: () => <HistoryActionsCell />,
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
    organization: "Vanguard Auto Repair",
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
    organization: "Bright Future Pediatrics",
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
    organization: "Lakeside Law Group",
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
    organization: "Acme Retail Group",
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
    organization: "Bright Future Pediatrics",
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
    organization: "Vanguard Auto Repair",
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
    organization: "Acme Retail Group",
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
    organization: "Lakeside Law Group",
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

export default function RequestHistoryPage() {
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >(DEFAULT_COLUMN_VISIBILITY);
  // The header's scope chip narrows the history to one organization.
  const { organization } = useOrgScope();
  const visibleRows = organization
    ? rows.filter((row) => row.organization === organization)
    : rows;

  return (
    <TabbedDataCard fill>
      <DataTable
        // Rows scroll under the column headers; the pager stays put.
        fillHeight
        rows={visibleRows}
        columns={columns}
        checkboxSelection={false}
        showDefaultView={false}
        pinnedShadowFields={{ left: "domain", right: "actions" }}
        columnVisibilityModel={columnVisibility}
        onColumnVisibilityModelChange={setColumnVisibility}
      />
    </TabbedDataCard>
  );
}
