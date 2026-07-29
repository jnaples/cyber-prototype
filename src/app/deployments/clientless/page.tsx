import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Link,
  ListItemIcon,
  Menu,
  MenuItem,
  Snackbar,
  Typography,
} from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { getGridSingleSelectOperators } from "@mui/x-data-grid";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";

import { ArrowTooltip } from "@/components/arrow-tooltip";
import { DataTable } from "@/components/data-table";
import { MaterialSymbol } from "@/components/material-symbol";
import { Modal } from "@/components/modal";
import { NoResultsOverlay } from "@/components/no-results-overlay";
import type { StatusTabConfig } from "@/components/tabbed-data-card";
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
    policy: "Default Policy",
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
    policy: "Guest Wi-Fi Policy",
    endpointId: "24c9b1",
    devices: 0,
    status: "Pending",
    lastQuery: "",
  },
];

// Sites the edit page can inherit from — mirrors the create page's list.
const EDIT_SITES = [
  "Seattle HQ",
  "Portland DC",
  "Austin Clinic",
  "Lincoln Middle School",
];

function DohActionsCell({
  row,
  onDelete,
}: {
  row: DohRow;
  onDelete: () => void;
}) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const closeMenu = () => setAnchorEl(null);

  const openEdit = () =>
    navigate("/deployments/clientless/create", {
      state: {
        editName: row.name,
        editToken: row.endpointId,
        editSite: EDIT_SITES[(row.id - 1) % EDIT_SITES.length],
      },
    });

  return (
    <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
      <ArrowTooltip title="Edit">
        <IconButton size="small" aria-label="Edit" onClick={openEdit}>
          <MaterialSymbol name="edit" size={20} />
        </IconButton>
      </ArrowTooltip>
      <IconButton
        size="small"
        aria-label="more options"
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        <MaterialSymbol name="more_horiz" size={20} />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={closeMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem
          onClick={() => {
            closeMenu();
            navigate("/dashboards");
          }}
        >
          <ListItemIcon>
            <MaterialSymbol name="bar_chart" size={20} />
          </ListItemIcon>
          View In Insights
        </MenuItem>
        <MenuItem
          onClick={() => {
            closeMenu();
            navigate("/query-logs");
          }}
        >
          <ListItemIcon>
            <MaterialSymbol name="podcasts" size={20} />
          </ListItemIcon>
          View In Query Log
        </MenuItem>
        <MenuItem
          onClick={() => {
            closeMenu();
            navigate("/deployments/sites");
          }}
        >
          <ListItemIcon>
            <MaterialSymbol name="hub" size={20} />
          </ListItemIcon>
          View Site
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            closeMenu();
            setConfirmOpen(true);
          }}
          sx={{ color: "error.main" }}
        >
          <ListItemIcon sx={{ color: "inherit" }}>
            <MaterialSymbol name="delete" size={20} sx={{ color: "inherit" }} />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete Clientless Device"
        width={420}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setConfirmOpen(false),
        }}
        primaryAction={{
          label: (
            <Box
              component="span"
              sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}
            >
              <MaterialSymbol name="delete_forever" size={18} />
              Delete
            </Box>
          ),
          color: "error",
          sx: { color: "common.white" },
          onClick: () => {
            onDelete();
            setConfirmOpen(false);
          },
        }}
      >
        <Typography variant="body1" sx={{ color: "text.primary" }}>
          This action cannot be undone.
        </Typography>
      </Modal>
    </Box>
  );
}

function StatusChip({ status }: { status: DohStatus }) {
  const active = status === "Active";
  return (
    <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
      <Chip
        size="small"
        variant="outlined"
        color={active ? "success" : "warning"}
        icon={
          <MaterialSymbol
            name={active ? "check_circle" : "hourglass_empty"}
            size={16}
          />
        }
        label={status}
      />
    </Box>
  );
}

const siteForRow = (id: number) => EDIT_SITES[(id - 1) % EDIT_SITES.length];

const blockPageFor = (policy: string) => {
  if (!policy) return "-";
  if (policy.includes("CIPA")) return "CIPA Notice";
  if (policy.includes("HIPAA")) return "HIPAA Notice";
  return "Default Block Page";
};

// Filter value pickers are dropdowns of the actual values present in the grid.
const NAME_OPTIONS = ROWS.map((r) => r.name);
const SITE_OPTIONS = EDIT_SITES;
const POLICY_OPTIONS = [...new Set(ROWS.map((r) => r.policy).filter(Boolean))];
const BLOCK_PAGE_OPTIONS = [
  ...new Set(ROWS.map((r) => blockPageFor(r.policy))),
];
const DOH_OPTIONS = ROWS.map((r) => r.endpointId);
const STATUS_OPTIONS: DohStatus[] = ["Active", "Pending"];

// Constrain each column to a single filter operator so the build only offers
// the operators we intend to ship. "INCLUDES" = singleSelect "is any of"
// (multi-pick dropdown); "IS" = singleSelect "is" (single-pick dropdown).
const singleSelectOperators = getGridSingleSelectOperators();
const INCLUDES_OP = singleSelectOperators.filter((op) => op.value === "isAnyOf");
const IS_OP = singleSelectOperators.filter((op) => op.value === "is");

const baseColumns: GridColDef<DohRow>[] = [
  {
    field: "name",
    headerName: "Clientless Device Name",
    flex: 1,
    minWidth: 160,
    type: "singleSelect",
    valueOptions: NAME_OPTIONS,
    filterOperators: INCLUDES_OP,
    renderCell: (params) => (
      <Link href="#" underline="hover">
        {params.row.name}
      </Link>
    ),
  },
  {
    field: "site",
    headerName: "Site",
    flex: 1,
    minWidth: 150,
    sortable: false,
    type: "singleSelect",
    valueOptions: SITE_OPTIONS,
    valueGetter: (_v, row) => siteForRow(row.id),
    filterOperators: IS_OP,
    renderCell: (params) => siteForRow(params.row.id),
  },
  {
    field: "policy",
    headerName: "Policy/Schedule",
    flex: 1.2,
    minWidth: 200,
    type: "singleSelect",
    valueOptions: POLICY_OPTIONS,
    filterOperators: INCLUDES_OP,
    renderCell: (params) => params.row.policy || "-",
  },
  {
    field: "blockPage",
    headerName: "Block page",
    flex: 1,
    minWidth: 160,
    sortable: false,
    type: "singleSelect",
    valueOptions: BLOCK_PAGE_OPTIONS,
    valueGetter: (_v, row) => blockPageFor(row.policy),
    filterOperators: INCLUDES_OP,
    renderCell: (params) => blockPageFor(params.row.policy),
  },
  {
    field: "uniqueDoh",
    headerName: "DoH ID",
    width: 150,
    sortable: false,
    type: "singleSelect",
    valueOptions: DOH_OPTIONS,
    valueGetter: (_v, row) => row.endpointId,
    filterOperators: IS_OP,
    renderCell: (params) => (
      <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
        <Chip
          size="small"
          variant="outlined"
          label={params.row.endpointId}
          sx={{ fontFamily: "monospace", fontSize: 13 }}
        />
      </Box>
    ),
  },
  {
    field: "status",
    headerName: "Status",
    width: 140,
    sortable: false,
    type: "singleSelect",
    valueOptions: STATUS_OPTIONS,
    filterOperators: IS_OP,
    renderCell: (params) => <StatusChip status={params.row.status} />,
  },
];

export default function ClientlessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [rows, setRows] = useState<DohRow[]>(ROWS);
  // Success toast passed from the create/edit page after saving.
  const [toast, setToast] = useState<string | null>(
    (location.state as { toast?: string } | null)?.toast ?? null,
  );
  const [cardTab, setCardTab] = useState(0);

  const total = rows.length;
  const activeCount = rows.filter((r) => r.status === "Active").length;
  const pendingCount = rows.filter((r) => r.status === "Pending").length;

  const tabsConfig: StatusTabConfig[] = [
    {
      icon: "format_list_bulleted",
      count: total,
      label: "All",
      color: "primary.main",
      iconColorVar: "var(--dnsf-palette-primary-main)",
      progressValue: total ? 100 : 0,
    },
    {
      icon: "check_circle",
      count: activeCount,
      label: "Active",
      color: "success.main",
      iconColorVar: "var(--dnsf-palette-success-main)",
      progressValue: total ? (activeCount / total) * 100 : 0,
    },
    {
      icon: "hourglass_empty",
      count: pendingCount,
      label: "Pending",
      color: "warning.main",
      iconColorVar: "var(--dnsf-palette-warning-main)",
      progressValue: total ? (pendingCount / total) * 100 : 0,
    },
  ];

  const visibleRows =
    cardTab === 1
      ? rows.filter((r) => r.status === "Active")
      : cardTab === 2
        ? rows.filter((r) => r.status === "Pending")
        : rows;

  const columns: GridColDef<DohRow>[] = [
    ...baseColumns,
    {
      field: "actions",
      headerName: "Actions",
      width: 104,
      sortable: false,
      filterable: false,
      resizable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <DohActionsCell
          row={params.row}
          onDelete={() =>
            setRows((prev) => prev.filter((r) => r.id !== params.row.id))
          }
        />
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<MaterialSymbol name="add" size={20} />}
          onClick={() => navigate("/deployments/clientless/create")}
        >
          Add Clientless Device
        </Button>
      </Box>

      <TabbedDataCard
        tabs={tabsConfig}
        activeTab={cardTab}
        onTabChange={(_, newValue) => setCardTab(newValue)}
      >
        <DataTable
          rows={visibleRows}
          columns={columns}
          checkboxSelection={false}
          showDefaultView={false}
          deferFilterApply
          noRowsOverlay={NoResultsOverlay}
          pinnedShadowFields={{ left: "name", right: "actions" }}
        />
      </TabbedDataCard>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity="success"
          variant="standard"
          elevation={8}
          onClose={() => setToast(null)}
        >
          {toast}
        </Alert>
      </Snackbar>
    </Box>
  );
}
