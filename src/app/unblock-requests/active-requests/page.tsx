import { IconButton } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";

import { DataTable } from "@/components/data-table";
import { EmptyState } from "@/components/empty-state";
import { TabbedDataCard } from "@/components/tabbed-data-card";

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
  { field: "categories", headerName: "Categories", flex: 1, minWidth: 140 },
  {
    field: "requestReason",
    headerName: "Request reason",
    flex: 1,
    minWidth: 160,
  },
  {
    field: "requestedDate",
    headerName: "Requested date",
    flex: 1,
    minWidth: 150,
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
        rows={[]}
        columns={columns}
        checkboxSelection={false}
        showFilters={false}
        showDefaultView={false}
        noRowsOverlay={ActiveRequestsEmptyOverlay}
      />
    </TabbedDataCard>
  );
}
