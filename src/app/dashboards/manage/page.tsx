import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Snackbar,
  Typography,
} from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { useState } from "react";
import { useNavigate } from "react-router";

import { ArrowTooltip } from "@/components/arrow-tooltip";
import { DataTable } from "@/components/data-table";
import { Modal } from "@/components/modal";
import { PageHeader } from "@/components/page-header";
import { PageShell } from "@/components/page-shell";
import { TabbedDataCard } from "@/components/tabbed-data-card";
import type { StatusTabConfig } from "@/components/tabbed-data-card";

import { DASHBOARD_NAMES } from "../lib";

type DashboardRow = { id: string; name: string };

const INITIAL_ROWS: DashboardRow[] = DASHBOARD_NAMES.map((name) => ({
  id: name,
  name,
}));

const INITIAL_FAVORITES = ["FilterDNS Overview", "Security Summary"];

// The dashboard currently set as the default landing dashboard.
const DEFAULT_DASHBOARD = "FilterDNS Overview";

export default function ManageDashboardsPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<DashboardRow[]>(INITIAL_ROWS);
  const [favorites, setFavorites] = useState<string[]>(INITIAL_FAVORITES);
  const [activeTab, setActiveTab] = useState(0);
  const [pendingDelete, setPendingDelete] = useState<DashboardRow | null>(null);
  const [defaultDashboard, setDefaultDashboard] = useState(DEFAULT_DASHBOARD);
  const [orgDefaultDashboard, setOrgDefaultDashboard] = useState<string | null>(
    null,
  );
  const [toast, setToast] = useState<string | null>(null);

  const setAsDefault = (name: string) => {
    setDefaultDashboard(name);
    setToast(`${name} set as default`);
  };

  const setAsOrgDefault = (name: string) => {
    setOrgDefaultDashboard(name);
    setToast(`${name} set as org default`);
  };

  const favoriteRows = rows.filter((row) => favorites.includes(row.name));
  const otherRows = rows.filter((row) => !favorites.includes(row.name));
  const visibleRows =
    activeTab === 1 ? favoriteRows : activeTab === 2 ? otherRows : rows;

  const total = rows.length;
  const tabs: StatusTabConfig[] = [
    {
      icon: "format_list_bulleted",
      count: total,
      label: "All",
      color: "primary.main",
      iconColorVar: "var(--dnsf-palette-primary-main)",
      progressValue: total ? 100 : 0,
    },
    {
      icon: "star",
      count: favoriteRows.length,
      label: "Favorites",
      color: "success.main",
      iconColorVar: "var(--dnsf-palette-success-main)",
      progressValue: total ? (favoriteRows.length / total) * 100 : 0,
    },
    {
      icon: "dashboard",
      count: otherRows.length,
      label: "Other Dashboards",
      color: "secondary.main",
      iconColorVar: "var(--dnsf-palette-secondary-main)",
      progressValue: total ? (otherRows.length / total) * 100 : 0,
    },
  ];

  const toggleFavorite = (name: string) => {
    const isFav = favorites.includes(name);
    setToast(isFav ? "Removed from favorites" : "Added to favorites");
    setFavorites((prev) =>
      isFav ? prev.filter((n) => n !== name) : [...prev, name],
    );
  };

  const deleteDashboard = (id: string) =>
    setRows((prev) => prev.filter((row) => row.id !== id));

  const columns: GridColDef<DashboardRow>[] = [
    {
      field: "name",
      headerName: "Dashboard",
      flex: 1,
      minWidth: 240,
      renderCell: (params) => (
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, height: "100%" }}
        >
          <span>{params.row.name}</span>
          {params.row.name === defaultDashboard && (
            <Chip label="Default" size="small" />
          )}
          {params.row.name === orgDefaultDashboard && (
            <Chip
              label="Org Default"
              size="small"
              // Match the standard info Alert background (scheme-aware tokens).
              sx={(theme) => ({
                bgcolor: theme.vars.palette.Alert.infoStandardBg,
                color: theme.vars.palette.Alert.infoColor,
                "& .MuiChip-label": { color: "inherit" },
              })}
            />
          )}
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
      align: "right",
      headerAlign: "right",
      renderCell: (params) => (
        <ActionsCell
          name={params.row.name}
          isFavorite={favorites.includes(params.row.name)}
          isDefault={params.row.name === defaultDashboard}
          isOrgDefault={params.row.name === orgDefaultDashboard}
          onToggleFavorite={() => toggleFavorite(params.row.name)}
          onSetDefault={() => setAsDefault(params.row.name)}
          onSetOrgDefault={() => setAsOrgDefault(params.row.name)}
          onDelete={() => setPendingDelete(params.row)}
        />
      ),
    },
  ];

  return (
    <PageShell
      header={
        <PageHeader
          title="Manage Dashboards"
          onBack={() => navigate("/dashboards")}
        />
      }
    >
      <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/dashboards")}
          startIcon={
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 20 }}
            >
              add
            </span>
          }
        >
          Create Dashboard
        </Button>
      </Box>

      <TabbedDataCard
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(_event, value) => setActiveTab(value)}
      >
        <DataTable
          rows={visibleRows}
          columns={columns}
          checkboxSelection={false}
          showDefaultView={false}
          noRowsOverlay={ManageDashboardsEmptyOverlay}
        />
      </TabbedDataCard>

      <Modal
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title="Delete dashboard?"
        width={420}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setPendingDelete(null),
        }}
        primaryAction={{
          label: (
            <Box
              component="span"
              sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18 }}
              >
                delete
              </span>
              Delete
            </Box>
          ),
          color: "error",
          sx: { color: "common.white" },
          onClick: () => {
            if (pendingDelete) {
              deleteDashboard(pendingDelete.id);
              setToast(`${pendingDelete.name} deleted`);
            }
            setPendingDelete(null);
          },
        }}
      >
        <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
          This action cannot be undone.
        </Typography>
      </Modal>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity="success"
          variant="standard"
          elevation={8}
          onClose={() => setToast(null)}
          sx={{
            alignItems: "center",
            "& .MuiAlert-icon": { alignSelf: "center", py: 0 },
            "& .MuiAlert-message": { py: 0 },
            "& .MuiAlert-action": { alignSelf: "center", py: 0, pt: 0 },
          }}
        >
          {toast}
        </Alert>
      </Snackbar>
    </PageShell>
  );
}

function ManageDashboardsEmptyOverlay() {
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

function ActionsCell({
  isFavorite,
  isDefault,
  isOrgDefault,
  onToggleFavorite,
  onSetDefault,
  onSetOrgDefault,
  onDelete,
}: {
  name: string;
  isFavorite: boolean;
  isDefault: boolean;
  isOrgDefault: boolean;
  onToggleFavorite: () => void;
  onSetDefault: () => void;
  onSetOrgDefault: () => void;
  onDelete: () => void;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const close = () => setAnchorEl(null);

  return (
    <>
      <ArrowTooltip
        title={isFavorite ? "Remove from favorites." : "Add to favorites."}
      >
        <IconButton
          size="small"
          aria-label={
            isFavorite ? "Remove from favorites" : "Add to favorites"
          }
          aria-pressed={isFavorite}
          onClick={onToggleFavorite}
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: 20,
              fontVariationSettings: isFavorite ? '"FILL" 1' : '"FILL" 0',
              color: isFavorite
                ? "var(--dnsf-palette-warning-main)"
                : undefined,
            }}
          >
            star
          </span>
        </IconButton>
      </ArrowTooltip>
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
        <MenuItem
          disabled={isDefault}
          onClick={() => {
            onSetDefault();
            close();
          }}
          sx={{
            "&.Mui-disabled": {
              pointerEvents: "auto",
              cursor: "not-allowed",
            },
          }}
        >
          <ListItemIcon>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 20, opacity: 0.7 }}
            >
              check_circle
            </span>
          </ListItemIcon>
          Set as default
        </MenuItem>
        <MenuItem
          disabled={isOrgDefault}
          onClick={() => {
            onSetOrgDefault();
            close();
          }}
          sx={{
            "&.Mui-disabled": {
              pointerEvents: "auto",
              cursor: "not-allowed",
            },
          }}
        >
          <ListItemIcon>
            <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 20, opacity: 0.7 }} />
          </ListItemIcon>
          Set as org default
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            onDelete();
            close();
          }}
          sx={{ color: "error.main" }}
        >
          <ListItemIcon sx={{ color: "inherit" }}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 20, color: "inherit" }}
            >
              delete
            </span>
          </ListItemIcon>
          Delete Dashboard
        </MenuItem>
      </Menu>
    </>
  );
}
