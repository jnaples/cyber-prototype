// Reporting → Scheduled Reports. A list of recurring report deliveries with a
// status summary strip (All / Active / Paused / Delivery issues) that filters
// the grid, plus search + report-type filtering. The grid mirrors the app's
// standard data grids (see Query Logs).

import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { GridColDef } from "@mui/x-data-grid";
import { useMemo, useState } from "react";

import { ArrowTooltip } from "@/components/arrow-tooltip";
import { DataTable } from "@/components/data-table";
import { MaterialSymbol } from "@/components/material-symbol";
import { PageHeader } from "@/components/page-header";
import { PageShell } from "@/components/page-shell";

// ---------------------------------------------------------------------------
// Types + data
// ---------------------------------------------------------------------------

type ScheduleStatus = "active" | "paused" | "issue";

type Schedule = {
  id: number;
  name: string;
  type: string;
  typeIcon: string;
  organization: string;
  recipients: number;
  freqPrimary: string;
  freqSecondary: string;
  nextPrimary: string;
  nextSecondary: string;
  lastSent: string;
  lastFailed?: string; // failure detail — presence marks a delivery issue
  status: ScheduleStatus;
};

const REPORT_TYPES = [
  { label: "Customer Activity Overview", icon: "monitoring" },
  { label: "Filter Protection Summary", icon: "shield" },
  { label: "CyberSight AI Usage", icon: "auto_awesome" },
  { label: "Endpoint Traffic Logs", icon: "table_chart" },
  { label: "Timeline Activity Logs", icon: "article" },
  { label: "Timeline Overview", icon: "show_chart" },
] as const;

const SCHEDULES: Schedule[] = [
  {
    id: 1,
    name: "Athlead — Weekly Executive Summary",
    type: "Customer Activity Overview",
    typeIcon: "monitoring",
    organization: "Athlead",
    recipients: 3,
    freqPrimary: "Weekly · Mon",
    freqSecondary: "8:00 AM · ET",
    nextPrimary: "Jul 27, 2026",
    nextSecondary: "in 5 days",
    lastSent: "Jul 20, 2026",
    status: "active",
  },
  {
    id: 2,
    name: "Vance Refrigeration — Protection Report",
    type: "Filter Protection Summary",
    typeIcon: "shield",
    organization: "Vance Refrigeration",
    recipients: 2,
    freqPrimary: "Monthly · 1st",
    freqSecondary: "7:00 AM · ET",
    nextPrimary: "Aug 1, 2026",
    nextSecondary: "in 10 days",
    lastSent: "Jul 1, 2026",
    status: "active",
  },
  {
    id: 3,
    name: "Schrute Farms — Daily CyberSight",
    type: "CyberSight AI Usage",
    typeIcon: "auto_awesome",
    organization: "Schrute Farms",
    recipients: 2,
    freqPrimary: "Daily",
    freqSecondary: "6:30 AM · ET",
    nextPrimary: "Jul 23, 2026",
    nextSecondary: "tomorrow",
    lastSent: "Jul 21, 2026",
    status: "active",
  },
  {
    id: 4,
    name: "All Orgs — Endpoint Traffic Audit",
    type: "Endpoint Traffic Logs",
    typeIcon: "table_chart",
    organization: "All Organizations",
    recipients: 2,
    freqPrimary: "Weekly · Fri",
    freqSecondary: "5:00 PM · ET",
    nextPrimary: "Jul 24, 2026",
    nextSecondary: "in 2 days",
    lastSent: "Jul 17, 2026",
    status: "active",
  },
  {
    id: 5,
    name: "Michael Scott Paper — Activity Digest",
    type: "Timeline Activity Logs",
    typeIcon: "article",
    organization: "Michael Scott Paper Co.",
    recipients: 2,
    freqPrimary: "Weekly · Wed",
    freqSecondary: "9:00 AM · ET",
    nextPrimary: "Jul 29, 2026",
    nextSecondary: "in 7 days",
    lastSent: "Jul 15, 2026",
    lastFailed: "recipient bounced",
    status: "issue",
  },
  {
    id: 6,
    name: "WUPHF.com — Usage Overview",
    type: "Timeline Overview",
    typeIcon: "show_chart",
    organization: "WUPHF.com",
    recipients: 2,
    freqPrimary: "Monthly · 15th",
    freqSecondary: "10:00 AM · CT",
    nextPrimary: "—",
    nextSecondary: "Paused",
    lastSent: "Jul 15, 2026",
    status: "paused",
  },
  {
    id: 7,
    name: "Prince Family Paper — Weekly Protection",
    type: "Filter Protection Summary",
    typeIcon: "shield",
    organization: "Prince Family Paper",
    recipients: 1,
    freqPrimary: "Weekly · Mon",
    freqSecondary: "8:00 AM · ET",
    nextPrimary: "—",
    nextSecondary: "Paused",
    lastSent: "Jun 29, 2026",
    status: "paused",
  },
  {
    id: 8,
    name: "Serenity by Jan — Quarterly Business Review",
    type: "Customer Activity Overview",
    typeIcon: "monitoring",
    organization: "Serenity by Jan",
    recipients: 2,
    freqPrimary: "Quarterly",
    freqSecondary: "9:00 AM · ET",
    nextPrimary: "Oct 1, 2026",
    nextSecondary: "in 71 days",
    lastSent: "Jul 1, 2026",
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
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, height: "100%" }}>
      <IconButton size="small" aria-label="Edit">
        <MaterialSymbol name="edit" size={18} />
      </IconButton>
      <IconButton size="small" aria-label="More options">
        <MaterialSymbol name="more_horiz" size={18} />
      </IconButton>
    </Box>
  );
}

const columns: GridColDef<Schedule>[] = [
  {
    field: "name",
    headerName: "Report name",
    flex: 1.4,
    minWidth: 220,
    renderCell: (params) => (
      <Box
        sx={{ display: "flex", alignItems: "center", height: "100%", minWidth: 0 }}
      >
        <Typography
          variant="body2"
          noWrap
          sx={{ fontWeight: 600, color: "text.primary" }}
        >
          {params.row.name}
        </Typography>
      </Box>
    ),
  },
  {
    field: "type",
    headerName: "Report type",
    flex: 1,
    minWidth: 190,
    renderCell: (params) => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, height: "100%" }}>
        <MaterialSymbol
          name={params.row.typeIcon}
          size={18}
          sx={{ color: "primary.main", flexShrink: 0 }}
        />
        <Typography variant="body2" noWrap sx={{ color: "text.primary" }}>
          {params.row.type}
        </Typography>
      </Box>
    ),
  },
  { field: "organization", headerName: "Organization", flex: 1, minWidth: 150 },
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
    minWidth: 140,
    sortable: false,
    renderCell: (params) => (
      <TwoLineCell
        primary={params.row.freqPrimary}
        secondary={params.row.freqSecondary}
      />
    ),
  },
  {
    field: "nextSend",
    headerName: "Next send",
    flex: 1,
    minWidth: 130,
    sortable: false,
    renderCell: (params) => (
      <TwoLineCell
        primary={params.row.nextPrimary}
        secondary={params.row.nextSecondary}
      />
    ),
  },
  {
    field: "lastSent",
    headerName: "Last sent",
    flex: 1.1,
    minWidth: 170,
    sortable: false,
    renderCell: (params) => {
      const failed = Boolean(params.row.lastFailed);
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, height: "100%" }}>
          <MaterialSymbol
            name={failed ? "error" : "check_circle"}
            size={18}
            sx={{
              color: failed ? "warning.main" : "success.main",
              flexShrink: 0,
            }}
          />
          {failed ? (
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Typography variant="body2" sx={{ color: "warning.main" }}>
                Failed
              </Typography>
              <Typography variant="caption" sx={{ color: "warning.main" }}>
                {params.row.lastSent} · {params.row.lastFailed}
              </Typography>
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: "text.primary" }}>
              {params.row.lastSent}
            </Typography>
          )}
        </Box>
      );
    },
  },
  {
    field: "status",
    headerName: "Status",
    width: 90,
    sortable: false,
    filterable: false,
    renderCell: (params) => <StatusCell status={params.row.status} />,
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 100,
    sortable: false,
    filterable: false,
    resizable: false,
    renderCell: () => <ActionsCell />,
  },
];

// ---------------------------------------------------------------------------
// Summary strip
// ---------------------------------------------------------------------------

type SummaryKey = "all" | "active" | "paused" | "issue";

function SummaryCard({
  icon,
  color,
  count,
  label,
  selected,
  onClick,
}: {
  icon: string;
  color: string;
  count: number;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <Card
      onClick={onClick}
      sx={{
        flex: 1,
        p: 2,
        display: "flex",
        alignItems: "center",
        gap: 2,
        cursor: "pointer",
        borderBottom: "3px solid",
        borderBottomColor: selected ? "primary.main" : "transparent",
      }}
    >
      <MaterialSymbol name={icon} size={28} sx={{ color }} />
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
          {count}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {label}
        </Typography>
      </Box>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ScheduledReportsPage() {
  const [statusFilter, setStatusFilter] = useState<SummaryKey>("all");
  const [search, setSearch] = useState("");
  const [reportType, setReportType] = useState("all");

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
      if (reportType !== "all" && s.type !== reportType) return false;
      if (
        q &&
        !s.name.toLowerCase().includes(q) &&
        !s.organization.toLowerCase().includes(q) &&
        !s.type.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [statusFilter, search, reportType]);

  const summary = [
    { key: "all" as const, icon: "event_repeat", color: "primary.main", label: "All Schedules", count: counts.all },
    { key: "active" as const, icon: "play_circle", color: "success.main", label: "Active", count: counts.active },
    { key: "paused" as const, icon: "pause_circle", color: "text.secondary", label: "Paused", count: counts.paused },
    { key: "issue" as const, icon: "error", color: "warning.main", label: "Delivery Issues", count: counts.issue },
  ];

  return (
    <PageShell
      header={
        <PageHeader
          title="Scheduled Reports"
          leftSlot={
            <>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                All Organizations
              </Typography>
              <Chip
                size="small"
                icon={<MaterialSymbol name="filter_alt" size={16} />}
                label="Managing 8 Organizations"
                variant="outlined"
                sx={{ ml: 1 }}
              />
            </>
          }
        />
      }
    >
      {/* Actions */}
      <Box sx={{ display: "flex", gap: 1.5, mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          size="small"
          startIcon={<MaterialSymbol name="add" size={18} />}
        >
          Schedule Report
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          size="small"
          startIcon={<MaterialSymbol name="visibility" size={18} />}
        >
          Preview Sample Reports
        </Button>
      </Box>

      {/* Summary strip */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        {summary.map((s) => (
          <SummaryCard
            key={s.key}
            icon={s.icon}
            color={s.color}
            count={s.count}
            label={s.label}
            selected={statusFilter === s.key}
            onClick={() => setStatusFilter(s.key)}
          />
        ))}
      </Box>

      {/* Toolbar + grid */}
      <Card sx={{ overflow: "hidden" }}>
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
              <MenuItem key={t.label} value={t.label}>
                {t.label}
              </MenuItem>
            ))}
          </Select>
          <Box sx={{ flex: 1 }} />
          <ArrowTooltip title="Export">
            <Button
              variant="text"
              color="secondary"
              size="small"
              startIcon={<MaterialSymbol name="download" size={20} />}
            >
              Export
            </Button>
          </ArrowTooltip>
          <Button
            variant="text"
            color="secondary"
            size="small"
            startIcon={<MaterialSymbol name="refresh" size={20} />}
          >
            Refresh
          </Button>
        </Box>

        <DataTable
          rows={rows}
          columns={columns}
          density="comfortable"
          showSearch={false}
          showFilters={false}
          showDefaultView={false}
          showPreferences={false}
          showExport={false}
          sx={(theme: Theme) => ({
            "& .MuiDataGrid-cell, & .MuiDataGrid-columnHeaderTitle": {
              fontSize: theme.typography.body2.fontSize,
            },
          })}
        />
      </Card>
    </PageShell>
  );
}
