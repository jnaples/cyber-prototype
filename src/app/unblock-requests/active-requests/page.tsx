import {
  Box,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { format as fnsFormat } from "date-fns";
import { useState } from "react";

import { ArrowTooltip } from "@/components/arrow-tooltip";
import { DataTable } from "@/components/data-table";
import { TabbedDataCard } from "@/components/tabbed-data-card";

// ---------------------------------------------------------------------------
// Row actions
// ---------------------------------------------------------------------------

// Inline quick actions to the left of the overflow menu.
const QUICK_ACTIONS: { label: string; icon: string }[] = [
  { label: "Allow", icon: "check" },
  { label: "Block", icon: "block" },
];

// Items kept in the overflow menu.
const MENU_ACTIONS: { label: string; icon: string }[] = [
  { label: "Report miscategorization", icon: "flag" },
];

function RowActionsCell() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const close = () => setAnchorEl(null);
  return (
    <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
      {QUICK_ACTIONS.map(({ label, icon }) => (
        <ArrowTooltip key={label} title={label}>
          <IconButton size="small" aria-label={label}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 20 }}
            >
              {icon}
            </span>
          </IconButton>
        </ArrowTooltip>
      ))}
      <IconButton
        size="small"
        aria-label="more options"
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
          more_horiz
        </span>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={close}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {MENU_ACTIONS.map(({ label, icon }) => (
          <MenuItem key={label} onClick={close}>
            <ListItemIcon>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 20 }}
              >
                {icon}
              </span>
            </ListItemIcon>
            {label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Columns
// ---------------------------------------------------------------------------

const columns: GridColDef[] = [
  { field: "organization", headerName: "Organization", flex: 1, minWidth: 160 },
  { field: "site", headerName: "Site", flex: 1, minWidth: 150 },
  { field: "policy", headerName: "Policy", flex: 1, minWidth: 150 },
  { field: "category", headerName: "Category", flex: 1, minWidth: 160 },
  {
    field: "timeOfAttempt",
    headerName: "Time of Attempt",
    flex: 1,
    minWidth: 180,
  },
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
  {
    field: "actions",
    headerName: "Actions",
    width: 130,
    sortable: false,
    filterable: false,
    resizable: false,
    align: "center",
    headerAlign: "center",
    renderCell: () => <RowActionsCell />,
  },
];

// ---------------------------------------------------------------------------
// Mock data — legitimate sites that got policy-blocked across MSP clients
// ---------------------------------------------------------------------------

type ActiveRequest = {
  organization: string;
  site: string;
  policy: string;
  category: string;
  loggedInUser: string;
  email: string;
  requestReason: string;
};

const REQUESTS: ActiveRequest[] = [
  {
    organization: "Northwind Traders",
    site: "Seattle HQ",
    policy: "Standard Policy",
    category: "Social Networking",
    loggedInUser: "Sarah Chen",
    email: "sarah.chen@northwind.com",
    requestReason: "Need LinkedIn for recruiting and sales outreach",
  },
  {
    organization: "Globex Manufacturing",
    site: "Detroit Plant",
    policy: "Default Filtering",
    category: "Streaming Media",
    loggedInUser: "Marcus Thompson",
    email: "marcus.thompson@globex.com",
    requestReason: "Vendor posted required machine-training videos",
  },
  {
    organization: "Contoso Health",
    site: "Austin Clinic",
    policy: "HIPAA Strict",
    category: "File Sharing",
    loggedInUser: "Priya Patel",
    email: "priya.patel@contosohealth.com",
    requestReason: "Referring clinic shared patient records here",
  },
  {
    organization: "Initech Legal",
    site: "Chicago Office",
    policy: "Standard Policy",
    category: "Proxy / Anonymizer",
    loggedInUser: "David Park",
    email: "david.park@initechlegal.com",
    requestReason: "Miscategorized — needed for internal dev tooling",
  },
  {
    organization: "Umbrella Retail",
    site: "Phoenix HQ",
    policy: "Marketing Policy",
    category: "Personal Storage",
    loggedInUser: "Lisa Wang",
    email: "lisa.wang@umbrellaretail.com",
    requestReason: "Designing this quarter's promo graphics",
  },
  {
    organization: "Northwind Traders",
    site: "Portland DC",
    policy: "Support Policy",
    category: "Forums",
    loggedInUser: "Diego Silva",
    email: "diego.silva@northwind.com",
    requestReason: "Customer reported a bug discussed in a thread",
  },
  {
    organization: "Contoso Health",
    site: "Dallas Hospital",
    policy: "Finance Policy",
    category: "File Sharing",
    loggedInUser: "Nina Volkov",
    email: "nina.volkov@contosohealth.com",
    requestReason: "Auditor is sending large year-end documents",
  },
  {
    organization: "Globex Manufacturing",
    site: "Cincinnati HQ",
    policy: "Engineering Policy",
    category: "AI Tools",
    loggedInUser: "Kevin O'Brien",
    email: "kevin.obrien@globex.com",
    requestReason: "Approved for debugging production code",
  },
  {
    organization: "Umbrella Retail",
    site: "Tucson Store",
    policy: "Marketing Policy",
    category: "Streaming Media",
    loggedInUser: "Hannah Lee",
    email: "hannah.lee@umbrellaretail.com",
    requestReason: "Embedded product demo for the landing page",
  },
  {
    organization: "Initech Legal",
    site: "NYC Office",
    policy: "Standard Policy",
    category: "News",
    loggedInUser: "Tom Bradley",
    email: "tom.bradley@initechlegal.com",
    requestReason: "Industry research for an active client matter",
  },
];

// Spread attempts across the last few business days during 9-5 hours.
const NOW = new Date();
const rows = REQUESTS.map((request, i) => {
  const date = new Date(NOW);
  date.setDate(date.getDate() - Math.floor(i / 3));
  date.setHours(9 + (i % 3) * 3, (i * 17) % 60, 0, 0);
  return {
    id: i + 1,
    ...request,
    timeOfAttempt: fnsFormat(date, "MMM d, yyyy h:mm a"),
  };
});

// The table always has rows, so the no-rows overlay only appears when a search
// filters everything out.
function ActiveRequestsEmptyOverlay() {
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

export default function ActiveRequestsPage() {
  return (
    <TabbedDataCard>
      <DataTable
        rows={rows}
        columns={columns}
        checkboxSelection={false}
        showDefaultView={false}
        noRowsOverlay={ActiveRequestsEmptyOverlay}
      />
    </TabbedDataCard>
  );
}
