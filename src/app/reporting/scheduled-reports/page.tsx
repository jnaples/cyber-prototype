// Reporting → Scheduled Reports. A list of recurring report deliveries with a
// status summary strip (All / Active / Paused / Delivery issues) that filters
// the grid, plus search + report-type filtering. The grid mirrors the app's
// standard data grids (see Query Logs).

import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";
import type { Theme } from "@mui/material/styles";
import type { GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
import { useMemo, useState } from "react";

import { DataTable } from "@/components/data-table";
import { DataTableBulkActions } from "@/components/data-table-bulk-actions";
import { MaterialSymbol } from "@/components/material-symbol";
import { PageHeader } from "@/components/page-header";
import { PageShell } from "@/components/page-shell";
import type { StatusTabConfig } from "@/components/tabbed-data-card";
import { TabbedDataCard } from "@/components/tabbed-data-card";

import { SampleReportsModal } from "./sample-reports-modal";
import { ScheduleReportView } from "./schedule-report-view";

// ---------------------------------------------------------------------------
// Types + data
// ---------------------------------------------------------------------------

type ScheduleStatus = "active" | "paused" | "issue";

type Schedule = {
  id: number;
  name: string;
  tags: string[];
  organizations: string;
  recipients: number;
  freqPrimary: string;
  freqSecondary: string;
  nextDelivery: string; // "Paused" when the schedule is paused
  lastDate: string;
  lastStatus: "sent" | "failed";
  status: ScheduleStatus;
};

// Report-type tags, offered in the filter select.
const REPORT_TYPES = [
  "Activity Overview",
  "Protection Summary",
  "Traffic Logs",
  "AI Usage",
  "Timeline Overview",
  "Timeline Logs",
];

const SCHEDULES: Schedule[] = [
  {
    id: 1,
    name: "Monthly Executive Summary",
    tags: ["Activity Overview", "Protection Summary"],
    organizations: "All organizations (6)",
    recipients: 7,
    freqPrimary: "Monthly",
    freqSecondary: "1st · 8:00 AM ET",
    nextDelivery: "Aug 1 · 8:00 AM ET",
    lastDate: "Jul 1 · 8:00 AM",
    lastStatus: "sent",
    status: "active",
  },
  {
    id: 2,
    name: "Acme Weekly Traffic Digest",
    tags: ["Traffic Logs"],
    organizations: "Acme Manufacturing",
    recipients: 3,
    freqPrimary: "Weekly",
    freqSecondary: "Mon · 7:00 AM ET",
    nextDelivery: "Mon, Jul 27 · 7:00 AM ET",
    lastDate: "Jul 20 · 7:00 AM",
    lastStatus: "sent",
    status: "active",
  },
  {
    id: 3,
    name: "CyberSight AI Monthly Review",
    tags: ["AI Usage", "Timeline Overview"],
    organizations: "Globex +1",
    recipients: 2,
    freqPrimary: "Monthly",
    freqSecondary: "15th · 9:00 AM CT",
    nextDelivery: "Aug 15 · 9:00 AM CT",
    lastDate: "Jul 15 · 9:00 AM",
    lastStatus: "failed",
    status: "issue",
  },
  {
    id: 4,
    name: "Quarterly Business Review Packet",
    tags: ["Activity Overview", "Protection Summary", "Traffic Logs", "AI Usage"],
    organizations: "All organizations (6)",
    recipients: 6,
    freqPrimary: "Quarterly",
    freqSecondary: "1st of quarter · 9:00 AM ET",
    nextDelivery: "Paused",
    lastDate: "Apr 1 · 9:00 AM",
    lastStatus: "sent",
    status: "paused",
  },
  {
    id: 5,
    name: "Umbrella Health Timeline Logs",
    tags: ["Timeline Logs", "Traffic Logs"],
    organizations: "Umbrella Health",
    recipients: 1,
    freqPrimary: "Daily",
    freqSecondary: "6:00 AM ET",
    nextDelivery: "Wed, Jul 22 · 6:00 AM ET",
    lastDate: "Jul 21 · 6:00 AM",
    lastStatus: "sent",
    status: "active",
  },
];

// ---------------------------------------------------------------------------
// Cells
// ---------------------------------------------------------------------------

function TwoLineCell({ primary, secondary }: { primary: string; secondary: string }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        height: "100%",
      }}
    >
      <Typography variant="body2" sx={{ color: "text.primary" }}>
        {primary}
      </Typography>
      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        {secondary}
      </Typography>
    </Box>
  );
}

// Schedule name + report-type tag chips (first two, then a +N overflow chip).
function ScheduleCell({ name, tags }: { name: string; tags: string[] }) {
  const shown = tags.slice(0, 2);
  const extra = tags.length - shown.length;
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 0.5,
        height: "100%",
        minWidth: 0,
        py: 1,
      }}
    >
      <Typography variant="body2" noWrap sx={{ fontWeight: 600, color: "text.primary" }}>
        {name}
      </Typography>
      <Box sx={{ display: "flex", gap: 0.5 }}>
        {shown.map((t) => (
          <Chip
            key={t}
            size="small"
            label={t}
            sx={{ bgcolor: "action.hover", color: "text.secondary" }}
          />
        ))}
        {extra > 0 && (
          <Chip
            size="small"
            label={`+${extra}`}
            sx={{ bgcolor: "action.hover", color: "text.secondary" }}
          />
        )}
      </Box>
    </Box>
  );
}

// Status toggle — seeded from the row, holds its own on/off state.
function StatusCell({ status }: { status: ScheduleStatus }) {
  const [on, setOn] = useState(status !== "paused");
  return (
    <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
      <Switch checked={on} onChange={(e) => setOn(e.target.checked)} />
    </Box>
  );
}

function ActionsCell() {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 0.5,
        height: "100%",
        width: "100%",
      }}
    >
      <IconButton size="small" aria-label="Edit">
        <EditOutlinedIcon sx={{ fontSize: 20 }} />
      </IconButton>
      <IconButton size="small" aria-label="More options">
        <MoreHorizOutlinedIcon sx={{ fontSize: 20 }} />
      </IconButton>
    </Box>
  );
}

const columns: GridColDef<Schedule>[] = [
  {
    field: "name",
    headerName: "Schedule",
    width: 320,
    renderCell: (params) => (
      <ScheduleCell name={params.row.name} tags={params.row.tags} />
    ),
  },
  { field: "organizations", headerName: "Organizations", flex: 1, minWidth: 160 },
  {
    field: "recipients",
    headerName: "Recipients",
    flex: 0.7,
    minWidth: 110,
    valueGetter: (_v, row) =>
      `${row.recipients} recipient${row.recipients === 1 ? "" : "s"}`,
  },
  {
    field: "frequency",
    headerName: "Frequency",
    flex: 1,
    minWidth: 150,
    sortable: false,
    renderCell: (params) => (
      <TwoLineCell
        primary={params.row.freqPrimary}
        secondary={params.row.freqSecondary}
      />
    ),
  },
  {
    field: "nextDelivery",
    headerName: "Next Delivery",
    flex: 1,
    minWidth: 170,
    sortable: false,
    renderCell: (params) => {
      const paused = params.row.nextDelivery === "Paused";
      return (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Typography
            variant="body2"
            sx={{ color: paused ? "text.secondary" : "text.primary" }}
          >
            {params.row.nextDelivery}
          </Typography>
        </Box>
      );
    },
  },
  {
    field: "lastDelivery",
    headerName: "Last Delivery",
    flex: 1,
    minWidth: 160,
    sortable: false,
    renderCell: (params) => {
      const failed = params.row.lastStatus === "failed";
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, height: "100%" }}>
          <MaterialSymbol
            name={failed ? "error" : "check_circle"}
            size={18}
            sx={{ color: failed ? "error.main" : "success.main", flexShrink: 0 }}
          />
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography variant="body2" sx={{ color: "text.primary" }}>
              {params.row.lastDate}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: failed ? "error.main" : "text.secondary" }}
            >
              {failed ? "Failed" : "Sent"}
            </Typography>
          </Box>
        </Box>
      );
    },
  },
  {
    field: "status",
    headerName: "Active",
    width: 90,
    sortable: false,
    filterable: false,
    renderCell: (params) => <StatusCell status={params.row.status} />,
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 110,
    sortable: false,
    filterable: false,
    resizable: false,
    align: "center",
    headerAlign: "center",
    renderCell: () => <ActionsCell />,
  },
];

// ---------------------------------------------------------------------------
// Summary strip
// ---------------------------------------------------------------------------

type SummaryKey = "all" | "active" | "paused" | "issue";

// Order of the status tabs; the tab index maps to one of these keys.
const STATUS_KEYS: SummaryKey[] = ["all", "active", "paused", "issue"];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ScheduledReportsPage() {
  const [statusFilter, setStatusFilter] = useState<SummaryKey>("all");
  const [search, setSearch] = useState("");
  const [reportType, setReportType] = useState("all");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [view, setView] = useState<"list" | "schedule">("list");
  const [rowSelection, setRowSelection] = useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set(),
  });
  const clearSelection = () =>
    setRowSelection({ type: "include", ids: new Set() });

  const counts = useMemo(
    () => ({
      all: SCHEDULES.length,
      active: SCHEDULES.filter((s) => s.status !== "paused").length,
      paused: SCHEDULES.filter((s) => s.status === "paused").length,
      issue: SCHEDULES.filter((s) => s.status === "issue").length,
    }),
    [],
  );

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SCHEDULES.filter((s) => {
      if (statusFilter === "active" && s.status === "paused") return false;
      if (statusFilter === "paused" && s.status !== "paused") return false;
      if (statusFilter === "issue" && s.status !== "issue") return false;
      if (reportType !== "all" && !s.tags.includes(reportType)) return false;
      if (
        q &&
        !s.name.toLowerCase().includes(q) &&
        !s.organizations.toLowerCase().includes(q) &&
        !s.tags.some((t) => t.toLowerCase().includes(q))
      )
        return false;
      return true;
    });
  }, [statusFilter, search, reportType]);

  const selectedCount =
    rowSelection.type === "exclude"
      ? rows.length - rowSelection.ids.size
      : rowSelection.ids.size;

  const tabsConfig: StatusTabConfig[] = [
    {
      icon: "event_repeat",
      count: counts.all,
      label: "All Schedules",
      color: "primary.main",
      iconColorVar: "var(--dnsf-palette-primary-main)",
      progressValue: 100,
    },
    {
      icon: "play_circle",
      count: counts.active,
      label: "Active",
      color: "success.main",
      iconColorVar: "var(--dnsf-palette-success-main)",
      progressValue: counts.all ? (counts.active / counts.all) * 100 : 0,
    },
    {
      icon: "pause_circle",
      count: counts.paused,
      label: "Paused",
      color: "text.secondary",
      iconColorVar: "var(--dnsf-palette-text-secondary)",
      progressValue: counts.all ? (counts.paused / counts.all) * 100 : 0,
    },
    {
      icon: "error",
      count: counts.issue,
      label: "Delivery Issues",
      color: "error.main",
      iconColorVar: "var(--dnsf-palette-error-main)",
      progressValue: counts.all ? (counts.issue / counts.all) * 100 : 0,
    },
  ];

  if (view === "schedule") {
    return (
      <ScheduleReportView
        onCancel={() => setView("list")}
        onSave={() => setView("list")}
      />
    );
  }

  return (
    <PageShell
      header={
        <PageHeader
          title="Scheduled Reports"
          leftSlot={
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Typography variant="body2" color="text.secondary">
                All Organizations
              </Typography>
              <Divider
                orientation="vertical"
                flexItem
                sx={{ borderColor: "divider", mx: "8px" }}
              />
              <Chip
                label="Managing 8 Organizations"
                onClick={() => {}}
                sx={{ borderRadius: "8px", fontSize: "14px" }}
                deleteIcon={
                  <MaterialSymbol
                    name="filter_list"
                    size={20}
                    sx={{ color: "text.primary" }}
                  />
                }
                onDelete={() => {}}
                size="small"
              />
            </div>
          }
        />
      }
    >
      {/* Actions */}
      <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          size="small"
          startIcon={<MaterialSymbol name="add" size={18} />}
          onClick={() => setView("schedule")}
        >
          Schedule Report
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button
          variant="outlined"
          color="secondary"
          size="small"
          startIcon={<MaterialSymbol name="visibility" size={18} />}
          onClick={() => setPreviewOpen(true)}
        >
          Preview Sample Reports
        </Button>
      </Box>

      {/* Summary tabs + grid, connected as one card (like Query Logs) */}
      <TabbedDataCard
        tabs={tabsConfig}
        activeTab={STATUS_KEYS.indexOf(statusFilter)}
        onTabChange={(_e, newValue) => setStatusFilter(STATUS_KEYS[newValue])}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <TextField
            size="small"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: 260 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <MaterialSymbol name="search" size={20} sx={{ color: "inherit" }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Select
            size="small"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="all">All report types</MenuItem>
            {REPORT_TYPES.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </Select>
        </Box>

        <DataTable
          rows={rows}
          columns={columns}
          density="comfortable"
          initialPageSize={10}
          showSearch={false}
          showFilters
          showDefaultView={false}
          showPreferences={false}
          showExport
          showRefresh
          rowSelectionModel={rowSelection}
          onRowSelectionModelChange={setRowSelection}
          bulkActions={
            selectedCount > 0 && (
              <DataTableBulkActions
                count={selectedCount}
                noun="schedule"
                onClose={clearSelection}
                actions={
                  <>
                    <Button
                      variant="text"
                      color="primary"
                      startIcon={<MaterialSymbol name="pause" size={18} />}
                    >
                      Pause
                    </Button>
                    <Button
                      variant="text"
                      color="primary"
                      startIcon={<MaterialSymbol name="play_arrow" size={18} />}
                    >
                      Resume
                    </Button>
                  </>
                }
              />
            )
          }
          sx={(theme: Theme) => ({
            "& .MuiDataGrid-cell, & .MuiDataGrid-columnHeaderTitle": {
              fontSize: theme.typography.body2.fontSize,
            },
          })}
        />
      </TabbedDataCard>

      {/* Preview sample reports */}
      <SampleReportsModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </PageShell>
  );
}
