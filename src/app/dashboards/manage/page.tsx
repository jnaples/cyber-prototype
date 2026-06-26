import {
  Alert,
  Box,
  Button,
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

export default function ManageDashboardsPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<DashboardRow[]>(INITIAL_ROWS);
  const [favorites, setFavorites] = useState<string[]>(INITIAL_FAVORITES);
  const [activeTab, setActiveTab] = useState(0);
  const [pendingDelete, setPendingDelete] = useState<DashboardRow | null>(null);
  const [toast, setToast] = useState<string | null>(null);

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
    { field: "name", headerName: "Dashboard", flex: 1, minWidth: 240 },
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
          onToggleFavorite={() => toggleFavorite(params.row.name)}
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
  onToggleFavorite,
  onDelete,
}: {
  name: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
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
