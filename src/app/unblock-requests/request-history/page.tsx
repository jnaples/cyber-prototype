import { Box, Chip, IconButton, Typography } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { format as fnsFormat } from "date-fns";

import { DataTable } from "@/components/data-table";
import { TabbedDataCard } from "@/components/tabbed-data-card";
import { PILL_CHIP_RADIUS } from "@/theme/core/components/chip";

const columns: GridColDef[] = [
  { field: "organization", headerName: "Organization", flex: 1, minWidth: 160 },
  { field: "site", headerName: "Site", flex: 1, minWidth: 150 },
  { field: "policy", headerName: "Policy", flex: 1, minWidth: 150 },
  { field: "category", headerName: "Category", flex: 1, minWidth: 160 },
  {
    field: "loggedInUser",
    headerName: "Logged In User",
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
    headerName: "Time of Attempt",
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
    field: "action",
    headerName: "Action",
    flex: 1,
    minWidth: 120,
    renderCell: (params) => {
      const allowed = params.value === "Allowed";
      return (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Chip
            size="small"
            variant="outlined"
            color={allowed ? "success" : "error"}
            icon={
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 16 }}
              >
                {allowed ? "check" : "block"}
              </span>
            }
            label={params.value}
            sx={{ borderRadius: PILL_CHIP_RADIUS }}
          />
        </Box>
      );
    },
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 80,
    sortable: false,
    filterable: false,
    resizable: false,
    align: "center",
    headerAlign: "center",
    renderCell: () => (
      <IconButton size="small" aria-label="more options">
        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
          more_horiz
        </span>
      </IconButton>
    ),
  },
];

// ---------------------------------------------------------------------------
// Mock data — resolved unblock requests
// ---------------------------------------------------------------------------

type HistoryRequest = {
  organization: string;
  site: string;
  policy: string;
  category: string;
  loggedInUser: string;
  email: string;
  requestReason: string;
  actionedBy: string;
  action: string;
};

const HISTORY: HistoryRequest[] = [
  {
    organization: "Northwind Traders",
    site: "Seattle HQ",
    policy: "Standard Policy",
    category: "Social Networking",
    loggedInUser: "Sarah Chen",
    email: "sarah.chen@northwind.com",
    requestReason: "Need LinkedIn for recruiting and sales outreach",
    actionedBy: "Jordan Blake",
    action: "Allowed",
  },
  {
    organization: "Globex Manufacturing",
    site: "Detroit Plant",
    policy: "Default Filtering",
    category: "Streaming Media",
    loggedInUser: "Marcus Thompson",
    email: "marcus.thompson@globex.com",
    requestReason: "Vendor posted required machine-training videos",
    actionedBy: "Casey Morgan",
    action: "Allowed",
  },
  {
    organization: "Contoso Health",
    site: "Austin Clinic",
    policy: "HIPAA Strict",
    category: "File Sharing",
    loggedInUser: "Priya Patel",
    email: "priya.patel@contosohealth.com",
    requestReason: "Referring clinic shared patient records here",
    actionedBy: "Riley Adams",
    action: "Allowed",
  },
  {
    organization: "Initech Legal",
    site: "Chicago Office",
    policy: "Standard Policy",
    category: "Proxy / Anonymizer",
    loggedInUser: "David Park",
    email: "david.park@initechlegal.com",
    requestReason: "Miscategorized — needed for internal dev tooling",
    actionedBy: "Jordan Blake",
    action: "Allowed",
  },
  {
    organization: "Umbrella Retail",
    site: "Phoenix HQ",
    policy: "Marketing Policy",
    category: "Personal Storage",
    loggedInUser: "Lisa Wang",
    email: "lisa.wang@umbrellaretail.com",
    requestReason: "Designing this quarter's promo graphics",
    actionedBy: "Casey Morgan",
    action: "Blocked",
  },
  {
    organization: "Northwind Traders",
    site: "Portland DC",
    policy: "Support Policy",
    category: "Forums",
    loggedInUser: "Diego Silva",
    email: "diego.silva@northwind.com",
    requestReason: "Customer reported a bug discussed in a thread",
    actionedBy: "Riley Adams",
    action: "Allowed",
  },
  {
    organization: "Contoso Health",
    site: "Dallas Hospital",
    policy: "Finance Policy",
    category: "File Sharing",
    loggedInUser: "Nina Volkov",
    email: "nina.volkov@contosohealth.com",
    requestReason: "Auditor is sending large year-end documents",
    actionedBy: "Jordan Blake",
    action: "Allowed",
  },
  {
    organization: "Globex Manufacturing",
    site: "Cincinnati HQ",
    policy: "Engineering Policy",
    category: "AI Tools",
    loggedInUser: "Kevin O'Brien",
    email: "kevin.obrien@globex.com",
    requestReason: "Approved for debugging production code",
    actionedBy: "Casey Morgan",
    action: "Allowed",
  },
  {
    organization: "Umbrella Retail",
    site: "Tucson Store",
    policy: "Marketing Policy",
    category: "Streaming Media",
    loggedInUser: "Hannah Lee",
    email: "hannah.lee@umbrellaretail.com",
    requestReason: "Embedded product demo for the landing page",
    actionedBy: "Riley Adams",
    action: "Blocked",
  },
  {
    organization: "Initech Legal",
    site: "NYC Office",
    policy: "Standard Policy",
    category: "News",
    loggedInUser: "Tom Bradley",
    email: "tom.bradley@initechlegal.com",
    requestReason: "Industry research for an active client matter",
    actionedBy: "Jordan Blake",
    action: "Allowed",
  },
];

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
  };
});

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
  return (
    <TabbedDataCard>
      <DataTable
        rows={rows}
        columns={columns}
        checkboxSelection={false}
        showDefaultView={false}
        noRowsOverlay={RequestHistoryEmptyOverlay}
      />
    </TabbedDataCard>
  );
}
