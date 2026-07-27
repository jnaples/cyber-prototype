import { Box, Button, IconButton, Link } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { useNavigate } from "react-router";

import { ArrowTooltip } from "@/components/arrow-tooltip";
import { DataTable } from "@/components/data-table";
import { MaterialSymbol } from "@/components/material-symbol";
import { NoResultsOverlay } from "@/components/no-results-overlay";
import { TabbedDataCard } from "@/components/tabbed-data-card";

type DohStatus = "Active" | "Pending";
type DohRow = {
  id: number;
  name: string;
  policy: string;
  endpointId: string;
  devices: number;
  status: DohStatus;
  lastQuery: string;
};

const ROWS: DohRow[] = [
  {
    id: 1,
    name: "Test_Demo",
    policy: "Lincoln Middle School — CIPA Policy",
    endpointId: "3a18ae",
    devices: 1,
    status: "Pending",
    lastQuery: "",
  },
  {
    id: 2,
    name: "HQ Guest Wi-Fi",
    policy: "Default Policy",
    endpointId: "a2fca4",
    devices: 2,
    status: "Active",
    lastQuery: "6/18/2026, 6:06:19 PM",
  },
  {
    id: 3,
    name: "Remote Sales Team",
    policy: "Restricted Policy",
    endpointId: "7b91de",
    devices: 1,
    status: "Active",
    lastQuery: "6/17/2026, 6:06:19 PM",
  },
  {
    id: 4,
    name: "Lab Devices",
    policy: "",
    endpointId: "3c0f55",
    devices: 0,
    status: "Pending",
    lastQuery: "",
  },
  {
    id: 5,
    name: "Front Desk Kiosk",
    policy: "Default Policy",
    endpointId: "5d24bc",
    devices: 1,
    status: "Active",
    lastQuery: "6/16/2026, 2:14:02 PM",
  },
  {
    id: 6,
    name: "Warehouse Scanners",
    policy: "Restricted Policy",
    endpointId: "9ee71a",
    devices: 4,
    status: "Active",
    lastQuery: "6/18/2026, 9:31:47 AM",
  },
  {
    id: 7,
    name: "Conference Room AV",
    policy: "Default Policy",
    endpointId: "c14f80",
    devices: 2,
    status: "Pending",
    lastQuery: "",
  },
  {
    id: 8,
    name: "Marketing Laptops",
    policy: "Standard Policy",
    endpointId: "61ab39",
    devices: 3,
    status: "Active",
    lastQuery: "6/15/2026, 11:02:55 AM",
  },
  {
    id: 9,
    name: "Executive Devices",
    policy: "HIPAA Strict",
    endpointId: "8fd2e7",
    devices: 2,
    status: "Active",
    lastQuery: "6/18/2026, 7:45:10 AM",
  },
  {
    id: 10,
    name: "Reception iPad",
    policy: "",
    endpointId: "24c9b1",
    devices: 0,
    status: "Pending",
    lastQuery: "",
  },
];

function DohActionsCell() {
  return (
    <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
      <ArrowTooltip title="Edit">
        <IconButton size="small" aria-label="Edit">
          <MaterialSymbol name="edit" size={20} />
        </IconButton>
      </ArrowTooltip>
      <IconButton size="small" aria-label="more options">
        <MaterialSymbol name="more_horiz" size={20} />
      </IconButton>
    </Box>
  );
}

const columns: GridColDef<DohRow>[] = [
  {
    field: "name",
    headerName: "Deployment name",
    flex: 1,
    minWidth: 160,
    renderCell: (params) => (
      <Link href="#" underline="hover">
        {params.row.name}
      </Link>
    ),
  },
  {
    field: "policy",
    headerName: "Policy/Schedule",
    flex: 1.2,
    minWidth: 200,
    renderCell: (params) => params.row.policy || "-",
  },
  {
    field: "blockPage",
    headerName: "Block page",
    flex: 1,
    minWidth: 160,
    sortable: false,
    renderCell: (params) => {
      const policy = params.row.policy;
      if (!policy) return "-";
      if (policy.includes("CIPA")) return "CIPA Notice";
      if (policy.includes("HIPAA")) return "HIPAA Notice";
      return "Default Block Page";
    },
  },
  {
    field: "uniqueDoh",
    headerName: "Unique DoH Endpoint",
    flex: 1.4,
    minWidth: 260,
    sortable: false,
    renderCell: (params) => (
      <Box component="span" sx={{ fontFamily: "monospace", fontSize: 13 }}>
        https://{params.row.endpointId}.doh.dnsfilter.net
      </Box>
    ),
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 104,
    sortable: false,
    filterable: false,
    resizable: false,
    disableColumnMenu: true,
    renderCell: () => <DohActionsCell />,
  },
];

export default function ClientlessPage() {
  const navigate = useNavigate();
  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<MaterialSymbol name="add" size={20} />}
          onClick={() => navigate("/deployments/clientless/create")}
        >
          Add Clientless
        </Button>
      </Box>

      <TabbedDataCard>
        <DataTable
          rows={ROWS}
          columns={columns}
          checkboxSelection={false}
          showDefaultView={false}
          noRowsOverlay={NoResultsOverlay}
          pinnedShadowFields={{ left: "name", right: "actions" }}
        />
      </TabbedDataCard>
    </Box>
  );
}
