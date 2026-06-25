import {
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
} from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { format as fnsFormat } from "date-fns";
import { useState } from "react";

import { DataTable } from "@/components/data-table";
import { EmptyState } from "@/components/empty-state";
import { TabbedDataCard } from "@/components/tabbed-data-card";

// ---------------------------------------------------------------------------
// Row actions
// ---------------------------------------------------------------------------

const ACTION_ITEMS: { label: string; icon: string }[] = [
  { label: "Allow", icon: "check" },
  { label: "Block", icon: "block" },
  { label: "Report miscategorization", icon: "flag" },
];

function RowActionsCell() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const close = () => setAnchorEl(null);
  return (
    <>
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
        {ACTION_ITEMS.map(({ label, icon }) => (
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
    </>
  );
}

// ---------------------------------------------------------------------------
// Columns
// ---------------------------------------------------------------------------

const columns: GridColDef[] = [
  { field: "organization", headerName: "Organization", flex: 1, minWidth: 160 },
  {
    field: "deploymentType",
    headerName: "Deployment Type",
    flex: 1,
    minWidth: 150,
  },
  {
    field: "localUserName",
    headerName: "Local User Name",
    flex: 1,
    minWidth: 150,
  },
  {
    field: "policySchedule",
    headerName: "Policy/Schedule",
    flex: 1,
    minWidth: 150,
  },
  { field: "domain", headerName: "Domain", flex: 1, minWidth: 160 },
  { field: "blockReason", headerName: "Block reason", flex: 1, minWidth: 150 },
  { field: "categories", headerName: "Categories", flex: 1, minWidth: 180 },
  {
    field: "requestReason",
    headerName: "Request reason",
    flex: 1.5,
    minWidth: 260,
  },
  {
    field: "requestedDate",
    headerName: "Requested date",
    flex: 1,
    minWidth: 170,
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
    renderCell: () => <RowActionsCell />,
  },
];

// ---------------------------------------------------------------------------
// Mock data — legitimate work sites that got policy-blocked
// ---------------------------------------------------------------------------

type ActiveRequest = {
  organization: string;
  deploymentType: string;
  localUserName: string;
  policySchedule: string;
  domain: string;
  blockReason: string;
  categories: string;
  requestReason: string;
};

const REQUESTS: ActiveRequest[] = [
  {
    organization: "Northwind Traders",
    deploymentType: "Roaming Clients",
    localUserName: "schen-mbp",
    policySchedule: "Standard Policy",
    domain: "linkedin.com",
    blockReason: "Social Networking",
    categories: "Social Networking, Business",
    requestReason: "Need it for recruiting and sales outreach",
  },
  {
    organization: "Globex Manufacturing",
    deploymentType: "Sites",
    localUserName: "mthompson-win11",
    policySchedule: "Default Filtering",
    domain: "youtube.com",
    blockReason: "Streaming Media",
    categories: "Streaming Media, Video",
    requestReason: "Vendor posted required machine-training videos",
  },
  {
    organization: "Contoso Health",
    deploymentType: "Roaming Clients",
    localUserName: "ppatel-mbp",
    policySchedule: "HIPAA Strict",
    domain: "dropbox.com",
    blockReason: "File Sharing",
    categories: "File Sharing, Cloud Storage",
    requestReason: "Referring clinic shared patient records here",
  },
  {
    organization: "Initech Legal",
    deploymentType: "Collections",
    localUserName: "dpark-mbp",
    policySchedule: "Standard Policy",
    domain: "github.com",
    blockReason: "Proxy / Anonymizer",
    categories: "Proxy / Anonymizer, Technology",
    requestReason: "Miscategorized — needed for internal dev tooling",
  },
  {
    organization: "Umbrella Retail",
    deploymentType: "Sites",
    localUserName: "lwang-win11",
    policySchedule: "Marketing Policy",
    domain: "canva.com",
    blockReason: "Personal Storage",
    categories: "Personal Storage, Productivity",
    requestReason: "Designing this quarter's promo graphics",
  },
  {
    organization: "Northwind Traders",
    deploymentType: "Roaming Clients",
    localUserName: "dsilva-mbp",
    policySchedule: "Support Policy",
    domain: "reddit.com",
    blockReason: "Forums",
    categories: "Forums, Social Networking",
    requestReason: "Customer reported a bug discussed in a thread",
  },
  {
    organization: "Contoso Health",
    deploymentType: "Sites",
    localUserName: "nvolkov-win11",
    policySchedule: "Finance Policy",
    domain: "wetransfer.com",
    blockReason: "File Sharing",
    categories: "File Sharing",
    requestReason: "Auditor is sending large year-end documents",
  },
  {
    organization: "Globex Manufacturing",
    deploymentType: "Collections",
    localUserName: "kobrien-mbp",
    policySchedule: "Engineering Policy",
    domain: "chatgpt.com",
    blockReason: "AI Tools",
    categories: "AI Tools, Technology",
    requestReason: "Approved for debugging production code",
  },
  {
    organization: "Umbrella Retail",
    deploymentType: "Roaming Clients",
    localUserName: "hlee-mbp",
    policySchedule: "Marketing Policy",
    domain: "vimeo.com",
    blockReason: "Streaming Media",
    categories: "Streaming Media",
    requestReason: "Embedded product demo for the landing page",
  },
  {
    organization: "Initech Legal",
    deploymentType: "Sites",
    localUserName: "tbradley-win11",
    policySchedule: "Standard Policy",
    domain: "wsj.com",
    blockReason: "News",
    categories: "News, Business",
    requestReason: "Industry research for an active client matter",
  },
];

// Spread requests across the last few business days during 9-5 hours.
const NOW = new Date();
const rows = REQUESTS.map((request, i) => {
  const date = new Date(NOW);
  date.setDate(date.getDate() - Math.floor(i / 3));
  date.setHours(9 + (i % 3) * 3, (i * 17) % 60, 0, 0);
  return {
    id: i + 1,
    ...request,
    requestedDate: fnsFormat(date, "MMM d, yyyy h:mm a"),
  };
});

function ActiveRequestsEmptyOverlay() {
  return (
    <EmptyState
      illustration="/unblock-requests.svg"
      title="No active requests"
      description="Unblock requests awaiting review will appear here."
    />
  );
}

export default function ActiveRequestsPage() {
  return (
    <TabbedDataCard>
      <DataTable
        rows={rows}
        columns={columns}
        checkboxSelection={false}
        showFilters={false}
        showDefaultView={false}
        noRowsOverlay={ActiveRequestsEmptyOverlay}
      />
    </TabbedDataCard>
  );
}
