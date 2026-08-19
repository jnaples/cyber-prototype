// Reporting → Report Manager. A list of recurring report deliveries with a
// status summary strip (All / Active / Paused / Delivery issues) that filters
// the grid, plus search + report-type filtering. The grid mirrors the app's
// standard data grids (see Query Logs).

import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  ListItemIcon,
  Menu,
  MenuItem,
  Snackbar,
  Switch,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";
import type { Theme } from "@mui/material/styles";
import type { GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";

import { ArrowTooltip } from "@/components/arrow-tooltip";
import { DataTable } from "@/components/data-table";
import { DataTableBulkActions } from "@/components/data-table-bulk-actions";
import { MaterialSymbol } from "@/components/material-symbol";
import { useOrgScope } from "@/hooks/use-org-scope";
import { Modal } from "@/components/modal";
import { OrgScopeSlot } from "@/components/org-scope-slot";
import { PageHeader } from "@/components/page-header";
import { PageShell } from "@/components/page-shell";
import type { StatusTabConfig } from "@/components/tabbed-data-card";
import { TabbedDataCard } from "@/components/tabbed-data-card";
import { Select } from "@/components/select";
import { TextField } from "@/components/text-field";

import { DeliveryDetailsDrawer } from "./delivery-details-drawer";
import { ReportHistory } from "./report-history";
import { scheduleEditState, TAG_TO_REPORT_KEY } from "./schedule-edit-state";
import { REPORT_MANAGER_BASE, REPORT_MANAGER_TABS } from "./routes";
import { ReportLibrary } from "./report-library";
import { ReportLibraryV2 } from "./report-library-v2";
import { ReportLibraryV3 } from "./report-library-v3";
import { REPORTS } from "./reports";

// ---------------------------------------------------------------------------
// Types + data
// ---------------------------------------------------------------------------

type ScheduleStatus = "active" | "paused" | "issue";

type Schedule = {
  id: number;
  name: string;
  tags: string[];
  /** A schedule targets exactly one organization. */
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
  "Timeline",
  "Timeline Logs",
];

const SCHEDULES: Schedule[] = [
  {
    id: 1,
    name: "Monthly Timeline",
    tags: ["Activity Overview"],
    organizations: "Acme Retail Group",
    recipients: 7,
    freqPrimary: "Monthly",
    freqSecondary: "1st",
    nextDelivery: "Aug 1",
    lastDate: "Jul 1",
    lastStatus: "sent",
    status: "active",
  },
  {
    id: 2,
    name: "Acme Weekly Traffic Digest",
    tags: ["Traffic Logs"],
    organizations: "Acme Retail Group",
    recipients: 3,
    freqPrimary: "Weekly",
    freqSecondary: "Mon",
    nextDelivery: "Mon, Jul 27",
    lastDate: "Jul 20",
    lastStatus: "sent",
    status: "active",
  },
  {
    id: 3,
    name: "CyberSight AI Monthly Review",
    tags: ["AI Usage"],
    organizations: "Summit Financial Advisors",
    recipients: 2,
    freqPrimary: "Monthly",
    freqSecondary: "15th",
    nextDelivery: "Aug 15",
    lastDate: "Jul 15",
    lastStatus: "failed",
    status: "issue",
  },
  {
    id: 4,
    name: "Business Review Packet",
    tags: ["Protection Summary"],
    organizations: "Riverside Dental Group",
    recipients: 6,
    freqPrimary: "Monthly",
    freqSecondary: "1st",
    nextDelivery: "Paused",
    lastDate: "Apr 1",
    lastStatus: "sent",
    status: "paused",
  },
  {
    id: 5,
    name: "Riverside Dental Group Timeline Logs",
    tags: ["Timeline Logs"],
    organizations: "Riverside Dental Group",
    recipients: 1,
    freqPrimary: "Daily",
    freqSecondary: "Every day",
    nextDelivery: "Wed, Jul 22",
    lastDate: "Jul 21",
    lastStatus: "sent",
    status: "active",
  },
];

// ---------------------------------------------------------------------------
// Cells
// ---------------------------------------------------------------------------

// Schedule name + report-type tag chips (first two, then a +N overflow chip).
function ScheduleCell({ name }: { name: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
      <Typography variant="body2" noWrap sx={{ color: "text.primary" }}>
        {name}
      </Typography>
    </Box>
  );
}

// The reports a schedule sends. Only the first two fit the column, so the rest
// collapse into a count.
function ReportTypeCell({ tags }: { tags: string[] }) {
  const [report] = tags;
  if (!report) return null;
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        height: "100%",
        minWidth: 0,
      }}
    >
      <Chip
        size="small"
        variant="outlined"
        color="secondary"
        label={report}
        // Long titles ellipsize rather than overflowing the cell.
        sx={{
          minWidth: 0,
          "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" },
        }}
      />
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

function deliveryFor(row: Schedule) {
  const { portalUsers, externalEmails } = scheduleEditState(row);
  const emails = [...portalUsers, ...externalEmails];
  return emails.map((email, i) => ({
    email,
    // The last address is the one that bounced.
    status: (i === emails.length - 1 ? "bounced" : "delivered") as
      "bounced" | "delivered",
    detail:
      i === emails.length - 1
        ? "Bounced — mailbox full"
        : `Delivered ${row.lastDate}`,
  }));
}

function attachmentsFor(row: Schedule) {
  return row.tags.map((tag) => {
    // Grid tags are short labels ("AI Usage"), so they resolve through the same
    // map the edit prefill uses rather than matching catalog titles directly.
    const def = REPORTS.find((r) => r.key === TAG_TO_REPORT_KEY[tag]);
    return {
      file: def?.file ?? `${tag.replace(/\s+/g, "-")}.pdf`,
      size: def?.size ?? "—",
    };
  });
}

function ActionsCell({
  row,
  onSendTest,
  onDelete,
  onResend,
}: {
  row: Schedule;
  onSendTest: () => void;
  onDelete: () => void;
  onResend: (count: number) => void;
}) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const closeMenu = () => setAnchorEl(null);
  const failedDelivery = row.lastStatus === "failed";

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
      <ArrowTooltip title="Edit">
        <IconButton
          size="small"
          aria-label="Edit"
          // Opens the scheduler seeded from this row.
          onClick={() =>
            navigate("/reporting/report-scheduler", {
              state: { edit: scheduleEditState(row) },
            })
          }
        >
          <EditOutlinedIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </ArrowTooltip>
      <IconButton
        size="small"
        aria-label="More options"
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        <MoreHorizOutlinedIcon sx={{ fontSize: 20 }} />
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
            onSendTest();
          }}
        >
          <ListItemIcon>
            <MaterialSymbol name="send" size={20} />
          </ListItemIcon>
          Send test
        </MenuItem>
        {/* Only meaningful when the last run didn't reach everyone. */}
        {failedDelivery && (
          <MenuItem
            onClick={() => {
              closeMenu();
              setDeliveryOpen(true);
            }}
          >
            <ListItemIcon>
              <MaterialSymbol name="mark_email_unread" size={20} />
            </ListItemIcon>
            View delivery details
          </MenuItem>
        )}
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
        title="Delete Schedule"
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

      {failedDelivery && (
        <DeliveryDetailsDrawer
          open={deliveryOpen}
          onClose={() => setDeliveryOpen(false)}
          scheduleName={row.name}
          organization={row.organizations}
          period=""
          generatedAt={row.lastDate}
          recipients={deliveryFor(row)}
          attachments={attachmentsFor(row)}
          onResend={onResend}
        />
      )}
    </Box>
  );
}

const buildColumns = (
  onSendTest: (row: Schedule) => void,
  onDelete: (row: Schedule) => void,
  onResend: (row: Schedule, count: number) => void,
): GridColDef<Schedule>[] => [
  {
    field: "name",
    headerName: "Schedule Name",
    width: 260,
    renderCell: (params) => <ScheduleCell name={params.row.name} />,
  },
  {
    field: "tags",
    headerName: "Report Type",
    width: 280,
    sortable: false,
    renderCell: (params) => <ReportTypeCell tags={params.row.tags} />,
  },
  {
    field: "organizations",
    headerName: "Organization",
    flex: 1,
    minWidth: 160,
  },
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
    headerName: "Delivery Schedule",
    flex: 1,
    minWidth: 150,
    sortable: false,
    renderCell: (params) => (
      <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
        <Typography variant="body2" sx={{ color: "text.primary" }}>
          {params.row.freqPrimary}
        </Typography>
      </Box>
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
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <MaterialSymbol
                name={failed ? "error" : "check_circle"}
                size={18}
                sx={{
                  color: failed ? "error.main" : "success.main",
                  flexShrink: 0,
                }}
              />
              <Typography variant="body2" sx={{ color: "text.primary" }}>
                {params.row.lastDate}
              </Typography>
            </Box>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                ml: "26px",
                color: failed ? "error.main" : "text.secondary",
              }}
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
    renderCell: (params) => (
      <ActionsCell
        row={params.row}
        onSendTest={() => onSendTest(params.row)}
        onDelete={() => onDelete(params.row)}
        onResend={(count) => onResend(params.row, count)}
      />
    ),
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

// Page-level tabs shown under the header (same treatment as Unblock Requests).
// Each tab owns a URL so it can be linked to and survives a refresh. The bare
// base path lands on Templates.
const PAGE_TABS = REPORT_MANAGER_TABS.filter((tab) => !("hidden" in tab));

// Selected page tab reads as a card lifted out of the neutral strip.
const selectedTabSx = {
  "&.Mui-selected": {
    backgroundColor: (
      theme: Theme & {
        vars?: { palette?: { background?: { paper?: string } } };
      },
    ) =>
      theme.vars?.palette?.background?.paper ?? theme.palette.background.paper,
    borderTopLeftRadius: "6px",
    borderTopRightRadius: "6px",
    boxShadow: (theme: Theme) => theme.shadows[3],
    zIndex: (theme: Theme) => theme.zIndex.appBar,
  },
};

export default function ScheduledReportsPage() {
  const { pathname, state } = useLocation();
  // Saving an edited schedule returns here with a confirmation to show.
  const [toast, setToast] = useState<string | null>(
    (state as { toast?: string } | null)?.toast ?? null,
  );
  const [schedules, setSchedules] = useState<Schedule[]>(SCHEDULES);

  const columns = useMemo(
    () =>
      buildColumns(
        (row) => setToast(`Test report sent for "${row.name}".`),
        (row) => {
          setSchedules((rows) => rows.filter((r) => r.id !== row.id));
          setToast(`"${row.name}" deleted.`);
        },
        (row, count) =>
          setToast(
            `Resent "${row.name}" to ${count} recipient${count === 1 ? "" : "s"}.`,
          ),
      ),
    [],
  );
  const activeTab = PAGE_TABS.findIndex(
    (t) => pathname === `${REPORT_MANAGER_BASE}/${t.path}`,
  );
  const pageTab = activeTab === -1 ? 0 : activeTab;
  // A hidden tab is still routable, so the panel follows the path.
  const activePath =
    REPORT_MANAGER_TABS.find(
      (t) => pathname === `${REPORT_MANAGER_BASE}/${t.path}`,
    )?.path ?? PAGE_TABS[0].path;
  const [statusFilter, setStatusFilter] = useState<SummaryKey>("all");
  const [search, setSearch] = useState("");
  const [reportType, setReportType] = useState("all");
  const navigate = useNavigate();
  const [rowSelection, setRowSelection] = useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set(),
  });
  const clearSelection = () =>
    setRowSelection({ type: "include", ids: new Set() });

  const { organization: scopedOrg } = useOrgScope();

  // Tab counts describe what's on screen, so they follow the org scope too.
  const counts = useMemo(() => {
    const inScope = scopedOrg
      ? schedules.filter((s) => s.organizations === scopedOrg)
      : schedules;
    return {
      all: inScope.length,
      active: inScope.filter((s) => s.status !== "paused").length,
      paused: inScope.filter((s) => s.status === "paused").length,
      issue: inScope.filter((s) => s.status === "issue").length,
    };
  }, [schedules, scopedOrg]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return schedules.filter((s) => {
      // The header's scope chip narrows schedules to one organization.
      if (scopedOrg && s.organizations !== scopedOrg) return false;
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
  }, [schedules, statusFilter, search, reportType, scopedOrg]);

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

  return (
    <PageShell
      header={
        <PageHeader title="Reports" leftSlot={<OrgScopeSlot />}>
          <Box
            sx={{
              mb: -2,
              display: "flex",
              alignContent: "flex-end",
              backgroundColor: (
                theme: Theme & {
                  vars?: { palette?: { background?: { neutral?: string } } };
                },
              ) =>
                theme.vars?.palette?.background?.neutral ??
                theme.palette.background.neutral,
              color: (
                theme: Theme & {
                  vars?: { palette?: { text?: { primary?: string } } };
                },
              ) =>
                theme.vars?.palette?.text?.primary ??
                theme.palette.text.primary,
            }}
          >
            <Tabs
              value={pageTab}
              onChange={(_e, next: number) =>
                navigate(`${REPORT_MANAGER_BASE}/${PAGE_TABS[next].path}`)
              }
              aria-label="report manager tabs"
              sx={{ px: 3 }}
            >
              {PAGE_TABS.map((tab) => (
                <Tab
                  key={tab.label}
                  label={tab.label}
                  icon={<MaterialSymbol name={tab.icon} size={20} />}
                  sx={selectedTabSx}
                />
              ))}
            </Tabs>
          </Box>
        </PageHeader>
      }
    >
      {activePath === "templates" && <ReportLibrary />}

      {activePath === "templates-v2" && <ReportLibraryV2 />}
      {activePath === "templates-v3" && <ReportLibraryV3 />}

      {activePath === "history" && <ReportHistory />}

      {activePath === "schedules" && (
        <>
          {/* Actions */}
          <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<MaterialSymbol name="add" size={18} />}
              onClick={() => navigate("/reporting/report-scheduler")}
            >
              Schedule Report
            </Button>
          </Box>

          {/* Summary tabs + grid, connected as one card (like Query Logs) */}
          <TabbedDataCard
            tabs={tabsConfig}
            activeTab={STATUS_KEYS.indexOf(statusFilter)}
            onTabChange={(_e, newValue) =>
              setStatusFilter(STATUS_KEYS[newValue])
            }
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
                        <MaterialSymbol
                          name="search"
                          size={20}
                          sx={{ color: "inherit" }}
                        />
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
                          startIcon={
                            <MaterialSymbol name="play_arrow" size={18} />
                          }
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
        </>
      )}

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setToast(null)}
        >
          {toast}
        </Alert>
      </Snackbar>
    </PageShell>
  );
}
