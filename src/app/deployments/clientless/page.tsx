import {
  Alert,
  Box,
  Button,
  Card,
  Dialog,
  Divider,
  FormLabel,
  IconButton,
  Link,
  ListItemIcon,
  Menu,
  MenuItem,
  Snackbar,
  Typography,
} from "@mui/material";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import RestoreIcon from "@mui/icons-material/Restore";
import type { GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
import { getGridSingleSelectOperators } from "@mui/x-data-grid";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";

import { ArrowTooltip } from "@/components/arrow-tooltip";
import { DataTable } from "@/components/data-table";
import { DataTableBulkActions } from "@/components/data-table-bulk-actions";
import { MaterialSymbol } from "@/components/material-symbol";
import { TextField } from "@/components/text-field";
import { Modal } from "@/components/modal";
import { NoResultsOverlay } from "@/components/no-results-overlay";
import type { StatusTabConfig } from "@/components/tabbed-data-card";
import { TabbedDataCard } from "@/components/tabbed-data-card";
import { useOrgScope } from "@/hooks/use-org-scope";

import { ConnectionDetailsDrawer } from "./connection-details-drawer";

type DohStatus = "Active" | "Inactive" | "Pending";

// Last Query Received reports an age bucket rather than a timestamp, ordered
// newest to oldest.
type LastQuery =
  | "< 15 Minutes"
  | "< 30 Minutes"
  | "< 60 Minutes"
  | "< 4 Hours"
  | "< 8 Hours"
  | "< 12 Hours"
  | "< 24 Hours"
  | "< 7 Days"
  | "< 14 Days"
  | "< 30 Days"
  | "< 90 Days"
  | "> 90 Days";

type DohRow = {
  id: number;
  name: string;
  organization: string;
  policy: string;
  endpointId: string;
  devices: number;
  status: DohStatus;
  /** Local-time strings — pending devices have never synced, so they're blank. */
  created: string;
  lastQuery: LastQuery | "";
};

const ROWS: DohRow[] = [
  {
    id: 1,
    name: "Test_Demo",
    organization: "Acme Retail Group",
    policy: "Lincoln Middle School — CIPA Policy",
    endpointId: "3a18ae",
    devices: 1,
    status: "Pending",
    created: "",
    lastQuery: "",
  },
  {
    id: 2,
    name: "HQ Guest Wi-Fi",
    organization: "Acme Retail Group",
    policy: "Default Policy",
    endpointId: "a2fca4",
    devices: 2,
    status: "Active",
    created: "Jul 12, 2026 9:14 AM",
    lastQuery: "< 15 Minutes",
  },
  {
    id: 3,
    name: "Remote Sales Team",
    organization: "Summit Financial Advisors",
    policy: "Restricted Policy",
    endpointId: "7b91de",
    devices: 1,
    status: "Inactive",
    created: "Jul 9, 2026 4:22 PM",
    lastQuery: "> 90 Days",
  },
  {
    id: 4,
    name: "Lab Devices",
    organization: "Lakeside Law Group",
    policy: "Default Policy",
    endpointId: "3c0f55",
    devices: 0,
    status: "Pending",
    created: "",
    lastQuery: "",
  },
  {
    id: 5,
    name: "Front Desk Kiosk",
    organization: "Riverside Dental Group",
    policy: "Default Policy",
    endpointId: "5d24bc",
    devices: 1,
    status: "Active",
    created: "Jul 15, 2026 11:03 AM",
    lastQuery: "< 4 Hours",
  },
  {
    id: 6,
    name: "Warehouse Scanners",
    organization: "Acme Retail Group",
    policy: "Restricted Policy",
    endpointId: "9ee71a",
    devices: 4,
    status: "Active",
    created: "Jul 10, 2026 8:47 AM",
    lastQuery: "< 60 Minutes",
  },
  {
    id: 7,
    name: "Conference Room AV",
    organization: "Summit Financial Advisors",
    policy: "Default Policy",
    endpointId: "c14f80",
    devices: 2,
    status: "Pending",
    created: "",
    lastQuery: "",
  },
  {
    id: 8,
    name: "Marketing Laptops",
    organization: "Lakeside Law Group",
    policy: "Standard Policy",
    endpointId: "61ab39",
    devices: 3,
    status: "Inactive",
    created: "Jul 22, 2026 1:15 PM",
    lastQuery: "> 90 Days",
  },
  {
    id: 9,
    name: "Executive Devices",
    organization: "Riverside Dental Group",
    policy: "HIPAA Strict",
    endpointId: "8fd2e7",
    devices: 2,
    status: "Active",
    created: "Jul 8, 2026 7:05 AM",
    lastQuery: "< 24 Hours",
  },
  {
    id: 10,
    name: "Reception iPad",
    organization: "Summit Financial Advisors",
    policy: "Guest Wi-Fi Policy",
    endpointId: "24c9b1",
    devices: 0,
    status: "Pending",
    created: "",
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

// Deleted deployments, kept for 30 days so they can be put back. Session-only:
// restoring one adds it to the grid until the page reloads.
type ArchivedRow = DohRow & { deleted: string };

const ARCHIVED_ROWS: ArchivedRow[] = [
  {
    id: 101,
    name: "Retired Lobby Kiosk",
    organization: "Acme Retail Group",
    policy: "Guest Wi-Fi Policy",
    endpointId: "b71c02",
    devices: 1,
    status: "Inactive",
    created: "Jul 28, 2026 9:14 AM",
    lastQuery: "> 90 Days",
    deleted: "Aug 18, 2026 4:32 PM",
  },
  {
    id: 102,
    name: "Old Warehouse Tablet",
    organization: "Northwind Traders",
    policy: "Standard Policy",
    endpointId: "4e93a7",
    devices: 2,
    status: "Inactive",
    created: "Aug 1, 2026 11:02 AM",
    lastQuery: "> 90 Days",
    deleted: "Aug 20, 2026 8:05 AM",
  },
  {
    id: 103,
    name: "Clinic Check-In iPad",
    organization: "Bright Future Pediatrics",
    policy: "HIPAA Strict",
    endpointId: "c58d13",
    devices: 1,
    status: "Inactive",
    created: "Aug 3, 2026 2:47 PM",
    lastQuery: "< 30 Days",
    deleted: "Aug 21, 2026 1:19 PM",
  },
  {
    id: 104,
    name: "Front Desk Phone",
    organization: "Riverside Dental Group",
    policy: "Default Policy",
    endpointId: "9a2f61",
    devices: 1,
    status: "Inactive",
    created: "Aug 5, 2026 10:30 AM",
    lastQuery: "< 30 Days",
    deleted: "Aug 22, 2026 9:58 AM",
  },
  {
    id: 105,
    name: "Training Room Display",
    organization: "Summit Financial Advisors",
    policy: "Restricted Policy",
    endpointId: "d30bb8",
    devices: 3,
    status: "Inactive",
    created: "Aug 8, 2026 3:11 PM",
    lastQuery: "< 14 Days",
    deleted: "Aug 23, 2026 5:44 PM",
  },
];
/** Empty archive — nothing has been deleted, so there's nothing to restore. */
function ArchivedEmptyOverlay() {
  return (
    <NoResultsOverlay description="There are no Clientless Devices to restore." />
  );
}

// Router state the create page reads to open in edit mode instead of add mode.
const editStateFor = (row: DohRow) => ({
  editName: row.name,
  editToken: row.endpointId,
  editSite: EDIT_SITES[(row.id - 1) % EDIT_SITES.length],
});

// The device name opens the same edit view as the row's Edit action.
function NameCell({ row }: { row: DohRow }) {
  const navigate = useNavigate();
  return (
    <Link
      href="#"
      underline="hover"
      onClick={(e) => {
        e.preventDefault();
        navigate("/deployments/clientless/create", {
          state: editStateFor(row),
        });
      }}
    >
      {row.name}
    </Link>
  );
}

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
  // Deleting is permanent, so it's typed out before the button unlocks.
  const [confirmText, setConfirmText] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const closeMenu = () => setAnchorEl(null);
  const closeConfirm = () => {
    setConfirmOpen(false);
    setConfirmText("");
  };

  const openEdit = () =>
    navigate("/deployments/clientless/create", { state: editStateFor(row) });

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
      }}
    >
      <ArrowTooltip title="Edit">
        <IconButton size="small" aria-label="Edit" onClick={openEdit}>
          <MaterialSymbol name="edit" size={20} />
        </IconButton>
      </ArrowTooltip>
      <ArrowTooltip title="View DoH Endpoint">
        <IconButton
          size="small"
          aria-label="View DoH Endpoint"
          onClick={() => setDetailsOpen(true)}
        >
          <RemoveRedEyeOutlinedIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </ArrowTooltip>
      <IconButton
        size="small"
        aria-label="more options"
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        <MaterialSymbol name="more_horiz" size={20} />
      </IconButton>

      <ConnectionDetailsDrawer
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        name={row.name}
        token={row.endpointId}
      />

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
        onClose={closeConfirm}
        title="Delete Clientless Device"
        width={420}
        secondaryAction={{
          label: "Cancel",
          onClick: closeConfirm,
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
          disabled: confirmText.trim().toUpperCase() !== "DELETE",
          onClick: () => {
            onDelete();
            closeConfirm();
          },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="body1" sx={{ color: "text.primary" }}>
            Deleting this Clientless Device disables its DoH address.
          </Typography>
          <Typography variant="body1" sx={{ color: "text.primary" }}>
            A device still configured with that address will lose internet
            access until the address is removed from the device.
          </Typography>
        </Box>
        <Box sx={{ mt: 2 }}>
          <FormLabel sx={{ display: "block", mb: 0.5 }}>
            Type DELETE to confirm
          </FormLabel>
          <TextField
            fullWidth
            size="small"
            placeholder="DELETE"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
          />
        </Box>
      </Modal>
    </Box>
  );
}

// Only an Active deployment is actually protecting anything — Inactive reads as
// offline, Pending as waiting. Icons and colors match the status tabs above.
const STATUS_ICON: Record<
  DohStatus,
  { name: string; colorVar: string; tooltip: string }
> = {
  Active: {
    name: "verified_user",
    colorVar: "var(--dnsf-palette-success-main)",
    tooltip: "Protected",
  },
  Inactive: {
    name: "portable_wifi_off",
    colorVar: "var(--dnsf-palette-text-disabled)",
    tooltip: "Inactive",
  },
  Pending: {
    name: "hourglass_empty",
    colorVar: "var(--dnsf-palette-warning-main)",
    tooltip: "Pending",
  },
};

function StatusChip({ status }: { status: DohStatus }) {
  const { name, colorVar, tooltip } = STATUS_ICON[status];
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
      }}
    >
      <ArrowTooltip title={tooltip} direction="top">
        <MaterialSymbol name={name} size={22} sx={{ color: colorVar }} />
      </ArrowTooltip>
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
const ORG_OPTIONS = [...new Set(ROWS.map((r) => r.organization))];
const STATUS_OPTIONS: DohStatus[] = ["Active", "Inactive", "Pending"];

// Constrain each column to a single filter operator so the build only offers
// the operators we intend to ship. "INCLUDES" = singleSelect "is any of"
// (multi-pick dropdown); "IS" = singleSelect "is" (single-pick dropdown).
const singleSelectOperators = getGridSingleSelectOperators();
const INCLUDES_OP = singleSelectOperators
  .filter((op) => op.value === "isAnyOf")
  .map((op) => ({ ...op, label: "includes" }));
const IS_OP = singleSelectOperators.filter((op) => op.value === "is");

const baseColumns: GridColDef<DohRow>[] = [
  {
    field: "name",
    headerName: "Clientless Device Name",
    width: 240,
    type: "singleSelect",
    valueOptions: NAME_OPTIONS,
    filterOperators: INCLUDES_OP,
    renderCell: (params) => <NameCell row={params.row} />,
  },
  {
    field: "status",
    headerName: "Status",
    width: 120,
    sortable: false,
    headerAlign: "center",
    type: "singleSelect",
    valueOptions: STATUS_OPTIONS,
    filterOperators: IS_OP,
    renderCell: (params) => <StatusChip status={params.row.status} />,
  },
  {
    field: "lastQuery",
    headerName: "Last Query Received",
    description: "How long ago this endpoint last resolved a query.",
    flex: 1,
    minWidth: 190,
    renderCell: (params) => params.row.lastQuery || "-",
  },
  {
    field: "created",
    headerName: "Created",
    description: "Shown in your local time zone.",
    flex: 1,
    minWidth: 180,
    renderCell: (params) => params.row.created || "-",
  },
  {
    field: "organization",
    headerName: "Organization",
    flex: 1,
    minWidth: 170,
    type: "singleSelect",
    valueOptions: ORG_OPTIONS,
    filterOperators: INCLUDES_OP,
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
    headerName: "Block Page",
    flex: 1,
    minWidth: 160,
    sortable: false,
    type: "singleSelect",
    valueOptions: BLOCK_PAGE_OPTIONS,
    valueGetter: (_v, row) => blockPageFor(row.policy),
    filterOperators: INCLUDES_OP,
    renderCell: (params) => blockPageFor(params.row.policy),
  },
];

// DoH ID and Created ship hidden; users can turn them on in Preferences.
const DEFAULT_COLUMN_VISIBILITY = { created: false };

export default function ClientlessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [rows, setRows] = useState<DohRow[]>(ROWS);
  // Success toast passed from the create/edit page after saving.
  const [toast, setToast] = useState<string | null>(
    (location.state as { toast?: string } | null)?.toast ?? null,
  );
  const [cardTab, setCardTab] = useState(0);
  // Archived Endpoints modal, and what's still in it — restoring is
  // session-only, so a reload puts everything back.
  const [archivedOpen, setArchivedOpen] = useState(false);
  const [archived, setArchived] = useState<ArchivedRow[]>(ARCHIVED_ROWS);
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >(DEFAULT_COLUMN_VISIBILITY);

  // The header's scope chip narrows the list to one organization; tab counts
  // follow so they describe what's on screen.
  const { organization } = useOrgScope();
  const inScope = organization
    ? rows.filter((r) => r.organization === organization)
    : rows;

  const total = inScope.length;
  const activeCount = inScope.filter((r) => r.status === "Active").length;
  const inactiveCount = inScope.filter((r) => r.status === "Inactive").length;
  const pendingCount = inScope.filter((r) => r.status === "Pending").length;

  const tabsConfig: StatusTabConfig[] = [
    {
      icon: "format_list_bulleted",
      count: total,
      label: "All",
      color: "primary.main",
      iconColorVar: "var(--dnsf-palette-primary-main)",
      progressValue: total ? 100 : 0,
      // Counts are in the grid below; the tabs just filter.
      hideCount: true,
    },
    {
      icon: "check_circle",
      count: activeCount,
      label: "Active",
      color: "success.main",
      iconColorVar: "var(--dnsf-palette-success-main)",
      progressValue: total ? (activeCount / total) * 100 : 0,
      hideCount: true,
      showInfoIcon: true,
      infoTooltip:
        "Clientless Devices that have reported DNS traffic within the last 15 minutes.",
    },
    {
      icon: "hourglass_empty",
      count: pendingCount,
      label: "Pending",
      color: "warning.main",
      iconColorVar: "var(--dnsf-palette-warning-main)",
      progressValue: total ? (pendingCount / total) * 100 : 0,
      hideCount: true,
      showInfoIcon: true,
      infoTooltip:
        "Clientless Devices that were created but have not reported DNS traffic yet.",
    },
    {
      icon: "portable_wifi_off",
      count: inactiveCount,
      label: "Inactive",
      color: "text.secondary",
      // Matches the progress ring above, which uses `color`.
      iconColorVar: "var(--dnsf-palette-text-secondary)",
      progressValue: total ? (inactiveCount / total) * 100 : 0,
      hideCount: true,
      showInfoIcon: true,
      infoTooltip:
        "Clientless Devices that have reported DNS traffic before, but not within the last 15 minutes.",
    },
  ];

  // Tab order is All / Active / Pending / Inactive.
  const TAB_STATUS: (DohStatus | null)[] = [
    null,
    "Active",
    "Pending",
    "Inactive",
  ];
  const tabStatus = TAB_STATUS[cardTab];
  const visibleRows = tabStatus
    ? inScope.filter((r) => r.status === tabStatus)
    : inScope;

  // Rows ticked in the archive, and the bulk Restore that acts on them.
  const [archivedSelection, setArchivedSelection] =
    useState<GridRowSelectionModel>({ type: "include", ids: new Set() });
  const clearArchivedSelection = () =>
    setArchivedSelection({ type: "include", ids: new Set() });
  const closeArchived = () => {
    setArchivedOpen(false);
    clearArchivedSelection();
  };
  const archivedSelectedCount =
    archivedSelection.type === "exclude"
      ? archived.length - archivedSelection.ids.size
      : archivedSelection.ids.size;

  const toDevice = (row: ArchivedRow) => ({
    id: row.id,
    name: row.name,
    organization: row.organization,
    policy: row.policy,
    endpointId: row.endpointId,
    devices: row.devices,
    status: row.status,
    created: row.created,
    lastQuery: row.lastQuery,
  });

  const restoreSelected = () => {
    const picked = archived.filter((r) =>
      archivedSelection.type === "exclude"
        ? !archivedSelection.ids.has(r.id)
        : archivedSelection.ids.has(r.id),
    );
    if (picked.length === 0) return;
    setRows((prev) => [...picked.map(toDevice), ...prev]);
    setArchived((prev) => prev.filter((r) => !picked.includes(r)));
    // The restored devices are on the grid behind, so that's where to look.
    closeArchived();
    setToast(
      picked.length === 1
        ? `"${picked[0].name}" restored.`
        : `${picked.length} clientless devices restored.`,
    );
  };

  // A restored deployment joins the top of the grid and leaves the archive.
  const restore = (row: ArchivedRow) => {
    setRows((prev) => [toDevice(row), ...prev]);
    setArchived((prev) => prev.filter((r) => r.id !== row.id));
    setToast(`"${row.name}" restored.`);
  };

  const archivedColumns: GridColDef<ArchivedRow>[] = [
    {
      field: "name",
      headerName: "Clientless Device Name",
      flex: 1,
      minWidth: 200,
    },
    { field: "created", headerName: "Creation Date", flex: 1, minWidth: 180 },
    { field: "deleted", headerName: "Deletion Date", flex: 1, minWidth: 180 },
    {
      field: "actions",
      headerName: "Action",
      width: 90,
      sortable: false,
      filterable: false,
      resizable: false,
      align: "center",
      headerAlign: "center",
      disableColumnMenu: true,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <ArrowTooltip title="Restore Clientless Device">
            <IconButton
              size="small"
              aria-label="Restore"
              onClick={() => restore(params.row)}
            >
              <RestoreIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </ArrowTooltip>
        </Box>
      ),
    },
  ];

  const columns: GridColDef<DohRow>[] = [
    ...baseColumns,
    {
      field: "actions",
      headerName: "Actions",
      // Three buttons now, so the column needs the room.
      width: 140,
      headerAlign: "center",
      sortable: false,
      filterable: false,
      resizable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <DohActionsCell
          row={params.row}
          onDelete={() => {
            setRows((prev) => prev.filter((r) => r.id !== params.row.id));
            setToast(`"${params.row.name}" deleted.`);
          }}
        />
      ),
    },
  ];

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          mb: 2,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={<MaterialSymbol name="add" size={20} />}
          onClick={() => navigate("/deployments/clientless/create")}
        >
          Add Clientless Device
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => setArchivedOpen(true)}
        >
          Archived Endpoints
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
          columnVisibilityModel={columnVisibility}
          onColumnVisibilityModelChange={setColumnVisibility}
          pinnedShadowFields={{ left: "name", right: "actions" }}
        />
      </TabbedDataCard>

      {/* Archived Endpoints — deleted deployments, restorable for 30 days.
          Same shape as the Investigate Mode modal: centred title, a neutral
          well inset 16px, and the actions row under it. */}
      <Dialog
        open={archivedOpen}
        onClose={closeArchived}
        maxWidth={false}
        slotProps={{
          paper: {
            elevation: 1,
            sx: { width: 900, maxWidth: "95vw", borderRadius: 1 },
          },
        }}
      >
        {/* Header */}
        <Box sx={{ position: "relative", p: 2 }}>
          <Typography
            variant="cardTitle"
            sx={{ display: "block", textAlign: "center" }}
          >
            Archived Endpoints
          </Typography>
          <IconButton
            size="small"
            aria-label="Close"
            onClick={closeArchived}
            sx={{ position: "absolute", top: 12, right: 12 }}
          >
            <MaterialSymbol name="close" size={20} />
          </IconButton>
        </Box>

        {/* Body — the grid as a card on the neutral pane. */}
        <Box
          sx={{
            bgcolor: "background.neutral",
            borderRadius: 1,
            p: 2,
            mx: 2,
          }}
        >
          <Card sx={{ overflow: "hidden" }}>
            <DataTable
              rows={archived}
              columns={archivedColumns}
              rowSelectionModel={archivedSelection}
              onRowSelectionModelChange={setArchivedSelection}
              bulkActions={
                archivedSelectedCount > 0 && (
                  <DataTableBulkActions
                    count={archivedSelectedCount}
                    noun="endpoint"
                    onClose={clearArchivedSelection}
                    actions={
                      <Button
                        variant="text"
                        color="primary"
                        startIcon={<RestoreIcon sx={{ fontSize: 18 }} />}
                        onClick={restoreSelected}
                      >
                        Restore
                      </Button>
                    }
                  />
                )
              }
              showSearch={false}
              showFilters={false}
              showDefaultView={false}
              showPreferences={false}
              showExport={false}
              showRefresh={false}
              noRowsOverlay={ArchivedEmptyOverlay}
            />
          </Card>
        </Box>

        {/* Actions — secondary on the left, as the drawers have it. */}
        <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            type="button"
            size="small"
            variant="outlined"
            color="secondary"
            onClick={closeArchived}
          >
            Close
          </Button>
        </Box>
      </Dialog>

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
