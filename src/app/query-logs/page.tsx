import {
  Autocomplete,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControl,
  FormLabel,
  IconButton,
  InputAdornment,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import Box from "@mui/material/Box";
import type { Theme } from "@mui/material/styles";
import type {
  GridColDef,
  GridFilterInputValueProps,
  GridFilterOperator,
  GridRowSelectionModel,
} from "@mui/x-data-grid";
import { getGridStringOperators } from "@mui/x-data-grid";
import CancelIcon from "@mui/icons-material/Cancel";
import SearchIcon from "@mui/icons-material/Search";
import { endOfDay, startOfDay, subDays, subHours, subMinutes } from "date-fns";
import { useState } from "react";

import { ArrowTooltip } from "@/components/arrow-tooltip";
import { DataTable } from "@/components/data-table";
import { DataTableBulkActions } from "@/components/data-table-bulk-actions";
import { CustomDateTimeRangePicker } from "@/components/custom-date-time-range-picker";
import type { CustomDateTimeRangePickerValue } from "@/components/custom-date-time-range-picker";
import { EmptyState } from "@/components/empty-state";
import { Modal } from "@/components/modal";
import { PageHeader } from "@/components/page-header";
import type { StatusTabConfig } from "@/components/tabbed-data-card";
import { TabbedDataCard } from "@/components/tabbed-data-card";
import {
  queryLogRows,
  relays,
  roamingClients,
  sites,
  users,
} from "@/data/query-logs";
import type { QueryLogRow } from "@/data/query-logs";

// ---------------------------------------------------------------------------
// Row actions menu (placeholder items — wire up later)
// ---------------------------------------------------------------------------

const ROW_ACTION_ITEMS = [
  "Add / Remove to Allow List",
  "Add / Remove to Block List",
  "Add / Remove to AppAware",
];

const TIME_WINDOW_OPTIONS = ["±5s", "±10s", "±15s"] as const;

function RowActionsCell() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [investigateOpen, setInvestigateOpen] = useState(false);
  const [timeWindow, setTimeWindow] = useState<string>(TIME_WINDOW_OPTIONS[0]);
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        height: "100%",
      }}
    >
      <IconButton
        size="small"
        aria-label="more options"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{ color: "text.primary" }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
          more_horiz
        </span>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {ROW_ACTION_ITEMS.map((label) => (
          <MenuItem key={label} onClick={() => setAnchorEl(null)}>
            {label}
          </MenuItem>
        ))}
        <Divider />
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            setInvestigateOpen(true);
          }}
        >
          Investigate Query
        </MenuItem>
      </Menu>
      <Modal
        open={investigateOpen}
        onClose={() => setInvestigateOpen(false)}
        title="Investigate Query"
        secondaryAction={{
          label: "Cancel",
          onClick: () => setInvestigateOpen(false),
        }}
        primaryAction={{
          label: "Submit",
          onClick: () => setInvestigateOpen(false),
        }}
      >
        <FormControl fullWidth>
          <FormLabel id="time-window-label">Time Window</FormLabel>
          <Select
            labelId="time-window-label"
            value={timeWindow}
            onChange={(e) => setTimeWindow(e.target.value)}
          >
            {TIME_WINDOW_OPTIONS.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Modal>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Time range filter operator
// ---------------------------------------------------------------------------

function TimeRangeFilterInput(props: GridFilterInputValueProps) {
  const { item, applyValue } = props;
  const value: [string, string] = Array.isArray(item.value)
    ? (item.value as [string, string])
    : ["", ""];
  const [start, end] = value;

  return (
    <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
      <TextField
        label="Start"
        type="datetime-local"
        size="small"
        variant="standard"
        value={start}
        onChange={(e) =>
          applyValue({ ...item, value: [e.target.value, end] })
        }
        slotProps={{ inputLabel: { shrink: true } }}
      />
      <TextField
        label="End"
        type="datetime-local"
        size="small"
        variant="standard"
        value={end}
        onChange={(e) =>
          applyValue({ ...item, value: [start, e.target.value] })
        }
        slotProps={{ inputLabel: { shrink: true } }}
      />
    </Box>
  );
}

const timeRangeOperator: GridFilterOperator<QueryLogRow> = {
  label: "range",
  value: "range",
  getApplyFilterFn: (filterItem) => {
    if (!Array.isArray(filterItem.value)) return null;
    const [start, end] = filterItem.value as [string, string];
    if (!start && !end) return null;
    const startMs = start ? new Date(start).getTime() : -Infinity;
    const endMs = end ? new Date(end).getTime() : Infinity;
    return (_value, row) => {
      const ts = row.timestampMs;
      return ts >= startMs && ts <= endMs;
    };
  },
  InputComponent: TimeRangeFilterInput,
};

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

const columns: GridColDef[] = [
  {
    field: "time",
    headerName: "Time",
    width: 240,
    minWidth: 240,
    filterOperators: [timeRangeOperator, ...getGridStringOperators()],
  },
  { field: "fqdn", headerName: "FQDN", width: 172, minWidth: 150 },
  { field: "domain", headerName: "Domain", flex: 1, minWidth: 140 },
  {
    field: "result",
    headerName: "Result",
    flex: 1,
    minWidth: 120,
    renderCell: (params) => {
      const allowed = params.value === "Allowed";
      return (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Chip
            size="small"
            variant="outlined"
            color={allowed ? "success" : "error"}
            icon={
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 16 }}
              >
                {allowed ? "check" : "block"}
              </span>
            }
            label={params.value}
            sx={{ borderRadius: 999 }}
          />
        </Box>
      );
    },
  },
  { field: "method", headerName: "Method", flex: 0.6, minWidth: 90 },
  { field: "categories", headerName: "Categories", flex: 1, minWidth: 140 },
  { field: "threat", headerName: "Threat", flex: 1, minWidth: 120 },
  { field: "application", headerName: "Application", flex: 1, minWidth: 140 },
  { field: "site", headerName: "Site", flex: 1, minWidth: 120 },
  { field: "deployment", headerName: "Deployment", flex: 1, minWidth: 140 },
  {
    field: "deploymentType",
    headerName: "Deployment Type",
    flex: 1,
    minWidth: 150,
  },
  { field: "agentName", headerName: "Agent Name", flex: 1, minWidth: 140 },
  {
    field: "localUserName",
    headerName: "Local User Name",
    flex: 1,
    minWidth: 150,
  },
  {
    field: "localIpv4",
    headerName: "Local IPv4 Address",
    flex: 1,
    minWidth: 160,
  },
  {
    field: "requestAddress",
    headerName: "Request Address",
    flex: 1,
    minWidth: 150,
  },
  { field: "resolvedIp", headerName: "Resolved IPs", flex: 1, minWidth: 140 },
  { field: "queryType", headerName: "Query Type", flex: 1, minWidth: 130 },
  { field: "lookupType", headerName: "Lookup Type", flex: 1, minWidth: 130 },
  { field: "resolver", headerName: "Resolver", flex: 1, minWidth: 120 },
  { field: "policy", headerName: "Policy", flex: 1, minWidth: 120 },
  {
    field: "scheduledPolicyName",
    headerName: "Scheduled Policy Name",
    flex: 1,
    minWidth: 180,
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 80,
    sortable: false,
    filterable: false,
    resizable: false,
    renderCell: () => <RowActionsCell />,
  },
];

// ---------------------------------------------------------------------------
// Status tab configuration
// ---------------------------------------------------------------------------

function buildTabsConfig(
  hasData: boolean,
  rowsInRange: QueryLogRow[],
): StatusTabConfig[] {
  const total = hasData ? rowsInRange.length : 0;
  const allowed = hasData
    ? rowsInRange.filter((r) => r.result === "Allowed").length
    : 0;
  const blocked = hasData
    ? rowsInRange.filter((r) => r.result === "Blocked").length
    : 0;
  const threats = hasData ? rowsInRange.filter((r) => r.isThreat).length : 0;

  return [
    {
      icon: "format_list_bulleted",
      count: total,
      label: "All",
      color: "primary.main",
      iconColorVar: "var(--dnsf-palette-primary-main)",
      progressValue: hasData ? 100 : 0,
    },
    {
      icon: "check",
      count: allowed,
      label: "Allowed",
      color: "success.main",
      iconColorVar: "var(--dnsf-palette-success-main)",
      progressValue: total ? (allowed / total) * 100 : 0,
    },
    {
      icon: "block",
      count: blocked,
      label: "Blocked",
      color: "warning.main",
      iconColorVar: "var(--dnsf-palette-warning-main)",
      progressValue: total ? (blocked / total) * 100 : 0,
    },
    {
      icon: "skull",
      count: threats,
      label: "Threats",
      color: "error.main",
      iconColorVar: "var(--dnsf-palette-error-main)",
      progressValue: total ? (threats / total) * 100 : 0,
    },
  ];
}

// ---------------------------------------------------------------------------
// Filter dropdown options
// ---------------------------------------------------------------------------

const FILTER_OPTIONS = {
  organization: ["Acme Inc.", "Globex", "Initech"],
};

const TIME_RANGE_GROUPS = [
  ["Last 5 minutes", "Last 15 minutes", "Last 30 minutes"],
  [
    "Last hour",
    "Last 4 hours",
    "Last 8 hours",
    "Last 12 hours",
    "Last 24 hours",
  ],
  ["Today", "Yesterday"],
] as const;

const CUSTOM_TIME_RANGE = "Custom";

type TimeRangeValue =
  | (typeof TIME_RANGE_GROUPS)[number][number]
  | typeof CUSTOM_TIME_RANGE;

function getRangeForPreset(
  preset: TimeRangeValue,
  now: Date = new Date(),
): [Date, Date] | null {
  switch (preset) {
    case "Last 5 minutes":
      return [subMinutes(now, 5), now];
    case "Last 15 minutes":
      return [subMinutes(now, 15), now];
    case "Last 30 minutes":
      return [subMinutes(now, 30), now];
    case "Last hour":
      return [subHours(now, 1), now];
    case "Last 4 hours":
      return [subHours(now, 4), now];
    case "Last 8 hours":
      return [subHours(now, 8), now];
    case "Last 12 hours":
      return [subHours(now, 12), now];
    case "Last 24 hours":
      return [subHours(now, 24), now];
    case "Today":
      return [startOfDay(now), endOfDay(now)];
    case "Yesterday": {
      const y = subDays(now, 1);
      return [startOfDay(y), endOfDay(y)];
    }
    case "Custom":
      return null;
  }
}

const FETCH_DELAY_MS = 700;

function QueryLogsEmptyOverlay() {
  return (
    <EmptyState
      title="Select an Organization"
      description="Choose an Organization to view its DNS Query Logs."
    />
  );
}

const SELECT_ALL_VALUE = "__select_all__";
const ALL_ROAMING_CLIENTS_AND_RELAYS = [...roamingClients, ...relays];

// Column visibility presets for the "Default" view dropdown.
// Empty array = use the default visibility (everything visible).
const COLUMN_VIEW_PRESETS: Record<string, string[] | null> = {
  all: [
    "time",
    "fqdn",
    "domain",
    "result",
    "method",
    "categories",
    "threat",
    "application",
    "site",
    "deployment",
    "deploymentType",
    "agentName",
    "localUserName",
    "localIpv4",
    "requestAddress",
    "resolvedIp",
    "queryType",
    "lookupType",
    "resolver",
    "policy",
    "scheduledPolicyName",
    "actions",
  ],
  default: [
    "time",
    "fqdn",
    "result",
    "method",
    "categories",
    "site",
    "policy",
    "deployment",
    "localUserName",
    "actions",
  ],
  investigative: [
    "time",
    "fqdn",
    "domain",
    "result",
    "method",
    "categories",
    "threat",
    "policy",
    "scheduledPolicyName",
    "site",
    "deployment",
    "deploymentType",
    "localUserName",
    "requestAddress",
    "resolvedIp",
    "actions",
  ],
  "compliance-audit": [
    "time",
    "fqdn",
    "result",
    "method",
    "categories",
    "site",
    "policy",
    "deployment",
    "localUserName",
    "deploymentType",
    "requestAddress",
    "threat",
    "agentName",
    "localIpv4",
    "resolvedIp",
    "queryType",
    "lookupType",
  ],
};

function buildVisibilityModel(
  allFields: string[],
  visibleFields: string[] | null,
): Record<string, boolean> {
  if (!visibleFields) {
    // No restriction — show everything.
    return Object.fromEntries(allFields.map((f) => [f, true]));
  }
  const visible = new Set(visibleFields);
  return Object.fromEntries(allFields.map((f) => [f, visible.has(f)]));
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function QueryLogsPage() {
  const [cardTab, setCardTab] = useState(0);
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [appliedOrg, setAppliedOrg] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRangeValue>("Last 15 minutes");
  const [dateRange, setDateRange] = useState<CustomDateTimeRangePickerValue>(
    () => getRangeForPreset("Last 15 minutes") ?? [null, null],
  );
  const [revertState, setRevertState] = useState<{
    timeRange: TimeRangeValue;
    dateRange: CustomDateTimeRangePickerValue;
  } | null>(null);

  const handleTimeRangeChange = (next: TimeRangeValue) => {
    if (next === CUSTOM_TIME_RANGE) {
      // Snapshot so a Cancel in the picker can restore the prior selection.
      setRevertState({ timeRange, dateRange });
    }
    setTimeRange(next);
    const range = getRangeForPreset(next);
    if (range) setDateRange(range);
  };

  const handleCustomCancel = () => {
    if (!revertState) return;
    setTimeRange(revertState.timeRange);
    setDateRange(revertState.dateRange);
    setRevertState(null);
  };

  // Roaming Clients & Relays multi-select (Select all sentinel toggled inside onChange).
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const totalClients = ALL_ROAMING_CLIENTS_AND_RELAYS.length;
  const allSelected = selectedClients.length === totalClients;
  const someSelected =
    selectedClients.length > 0 && selectedClients.length < totalClients;

  const handleClientsChange = (event: SelectChangeEvent<string[]>) => {
    const raw = event.target.value;
    const next = typeof raw === "string" ? raw.split(",") : raw;
    if (next.includes(SELECT_ALL_VALUE)) {
      setSelectedClients(
        allSelected ? [] : [...ALL_ROAMING_CLIENTS_AND_RELAYS],
      );
      return;
    }
    setSelectedClients(next);
  };

  // Sites multi-select (same pattern as roaming clients, no group headers).
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const totalSites = sites.length;
  const allSitesSelected = selectedSites.length === totalSites;
  const someSitesSelected =
    selectedSites.length > 0 && selectedSites.length < totalSites;

  const handleSitesChange = (event: SelectChangeEvent<string[]>) => {
    const raw = event.target.value;
    const next = typeof raw === "string" ? raw.split(",") : raw;
    if (next.includes(SELECT_ALL_VALUE)) {
      setSelectedSites(allSitesSelected ? [] : [...sites]);
      return;
    }
    setSelectedSites(next);
  };

  // Users multi-select (identical pattern to Sites).
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [rowSelection, setRowSelection] = useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set(),
  });
  const clearRowSelection = () =>
    setRowSelection({ type: "include", ids: new Set() });
  const totalUsers = users.length;
  const allUsersSelected = selectedUsers.length === totalUsers;
  const someUsersSelected =
    selectedUsers.length > 0 && selectedUsers.length < totalUsers;

  const handleUsersChange = (event: SelectChangeEvent<string[]>) => {
    const raw = event.target.value;
    const next = typeof raw === "string" ? raw.split(",") : raw;
    if (next.includes(SELECT_ALL_VALUE)) {
      setSelectedUsers(allUsersSelected ? [] : [...users]);
      return;
    }
    setSelectedUsers(next);
  };

  // Column visibility — driven by the Default-view preset selection.
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<
    Record<string, boolean>
  >({});
  const handleDefaultViewChange = (value: string) => {
    const preset = COLUMN_VIEW_PRESETS[value];
    setColumnVisibilityModel(
      buildVisibilityModel(
        columns.map((c) => c.field),
        preset === undefined ? null : preset,
      ),
    );
  };

  // Per-dropdown search state. Cleared when the menu closes.
  const [sitesSearch, setSitesSearch] = useState("");
  const [clientsSearch, setClientsSearch] = useState("");
  const [usersSearch, setUsersSearch] = useState("");
  const matches = (name: string, q: string) =>
    name.toLowerCase().includes(q.toLowerCase());
  const filteredSites = sites.filter((s) => matches(s, sitesSearch));
  const filteredRoamingClients = roamingClients.filter((c) =>
    matches(c, clientsSearch),
  );
  const filteredRelays = relays.filter((r) => matches(r, clientsSearch));
  const filteredUsers = users.filter((u) => matches(u, usersSearch));

  const filtersDisabled = !selectedOrg;
  const filtersDisabledTooltip = filtersDisabled
    ? "Select an Organization to enable this filter"
    : "";

  const hasData = appliedOrg !== null && !isFetching;
  const [startDate, endDate] = dateRange;
  const startMs = startDate?.getTime() ?? 0;
  const endMs = endDate?.getTime() ?? Number.POSITIVE_INFINITY;
  const rowsInRange = hasData
    ? queryLogRows.filter(
        (r) => r.timestampMs >= startMs && r.timestampMs <= endMs,
      )
    : [];
  const visibleRows =
    cardTab === 1
      ? rowsInRange.filter((r) => r.result === "Allowed")
      : cardTab === 2
        ? rowsInRange.filter((r) => r.result === "Blocked")
        : cardTab === 3
          ? rowsInRange.filter((r) => r.isThreat)
          : rowsInRange;
  const tabsConfig = buildTabsConfig(hasData, rowsInRange);
  // v8 selection model: "include" lists selected ids; "exclude" lists deselected
  // (header "Select all" uses exclude so it doesn't materialize every id).
  const selectedRowCount =
    rowSelection.type === "exclude"
      ? visibleRows.length - rowSelection.ids.size
      : rowSelection.ids.size;

  const handleApply = () => {
    if (!selectedOrg) return;
    setIsFetching(true);
    setCardTab(0);
    window.setTimeout(() => {
      setAppliedOrg(selectedOrg);
      setIsFetching(false);
    }, FETCH_DELAY_MS);
  };

  const handleClear = () => {
    setSelectedOrg(null);
    setAppliedOrg(null);
    setIsFetching(false);
    setCardTab(0);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <PageHeader title="Query Logs">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            px: 3,
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 2,
            }}
          >
            <Autocomplete
              size="small"
              options={FILTER_OPTIONS.organization}
              value={selectedOrg}
              onChange={(_event, newValue) => setSelectedOrg(newValue)}
              renderInput={(params) => (
                <TextField {...params} placeholder="Select Organization" />
              )}
            />
            <ArrowTooltip title={filtersDisabledTooltip}>
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  "& > *": { width: "100%" },
                }}
              >
                <FormControl
                  size="small"
                  fullWidth
                  disabled={filtersDisabled}
                  sx={{
                    position: "relative",
                    "&:hover .select-clear, &:focus-within .select-clear": {
                      visibility: "visible",
                    },
                  }}
                >
                  {selectedSites.length > 0 && (
                    <IconButton
                      size="small"
                      className="select-clear"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSites([]);
                      }}
                      sx={{
                        position: "absolute",
                        right: 32,
                        top: "50%",
                        transform: "translateY(-50%)",
                        visibility: "hidden",
                        zIndex: 1,
                      }}
                    >
                      <CancelIcon fontSize="small" />
                    </IconButton>
                  )}
                  <Select
                    multiple
                    displayEmpty
                    value={selectedSites}
                    onChange={handleSitesChange}
                    onClose={() => setSitesSearch("")}
                    renderValue={(selected) => {
                      if (selected.length === 0 || allSitesSelected) {
                        return "All Sites";
                      }
                      if (selected.length === 1) return selected[0];
                      return `${selected[0]} +${selected.length - 1}`;
                    }}
                    MenuProps={{
                      autoFocus: false,
                      slotProps: { paper: { sx: { maxHeight: 400 } } },
                    }}
                  >
                    <ListSubheader sx={{ px: 2, py: 1 }}>
                      <TextField
                        size="small"
                        autoFocus
                        fullWidth
                        placeholder="Search..."
                        value={sitesSearch}
                        onChange={(e) => setSitesSearch(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key !== "Escape") e.stopPropagation();
                        }}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    </ListSubheader>
                    <MenuItem value={SELECT_ALL_VALUE}>
                      <Checkbox
                        size="small"
                        checked={allSitesSelected}
                        indeterminate={someSitesSelected}
                        sx={{ p: 0.5, mr: 1 }}
                      />
                      <ListItemText primary="Select all" />
                    </MenuItem>
                    <Divider />
                    {filteredSites.map((name) => (
                      <MenuItem key={name} value={name}>
                        <Checkbox
                          size="small"
                          checked={selectedSites.includes(name)}
                          sx={{ p: 0.5, mr: 1 }}
                        />
                        <ListItemText primary={name} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </ArrowTooltip>
            <ArrowTooltip title={filtersDisabledTooltip}>
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  "& > *": { width: "100%" },
                }}
              >
                <FormControl
                  size="small"
                  fullWidth
                  disabled={filtersDisabled}
                  sx={{
                    position: "relative",
                    "&:hover .select-clear, &:focus-within .select-clear": {
                      visibility: "visible",
                    },
                  }}
                >
                  {selectedClients.length > 0 && (
                    <IconButton
                      size="small"
                      className="select-clear"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClients([]);
                      }}
                      sx={{
                        position: "absolute",
                        right: 32,
                        top: "50%",
                        transform: "translateY(-50%)",
                        visibility: "hidden",
                        zIndex: 1,
                      }}
                    >
                      <CancelIcon fontSize="small" />
                    </IconButton>
                  )}
                  <Select
                    multiple
                    displayEmpty
                    value={selectedClients}
                    onChange={handleClientsChange}
                    onClose={() => setClientsSearch("")}
                    renderValue={(selected) => {
                      if (selected.length === 0 || allSelected) {
                        return "All Roaming Clients & Relays";
                      }
                      if (selected.length === 1) return selected[0];
                      return `${selected[0]} +${selected.length - 1}`;
                    }}
                    MenuProps={{
                      autoFocus: false,
                      slotProps: { paper: { sx: { maxHeight: 400 } } },
                    }}
                  >
                    <ListSubheader sx={{ px: 2, py: 1 }}>
                      <TextField
                        size="small"
                        autoFocus
                        fullWidth
                        placeholder="Search..."
                        value={clientsSearch}
                        onChange={(e) => setClientsSearch(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key !== "Escape") e.stopPropagation();
                        }}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    </ListSubheader>
                    <MenuItem value={SELECT_ALL_VALUE}>
                      <Checkbox
                        size="small"
                        checked={allSelected}
                        indeterminate={someSelected}
                        sx={{ p: 0.5, mr: 1 }}
                      />
                      <ListItemText primary="Select all" />
                    </MenuItem>
                    <Divider />
                    {filteredRoamingClients.length > 0 && (
                      <ListSubheader
                        sx={{
                          typography: "overline",
                          lineHeight: 1.5,
                          color: "text.secondary",
                          pt: 1,
                        }}
                      >
                        Roaming Clients
                      </ListSubheader>
                    )}
                    {filteredRoamingClients.map((name) => (
                      <MenuItem key={name} value={name}>
                        <Checkbox
                          size="small"
                          checked={selectedClients.includes(name)}
                          sx={{ p: 0.5, mr: 1 }}
                        />
                        <ListItemText primary={name} />
                      </MenuItem>
                    ))}
                    {filteredRoamingClients.length > 0 &&
                      filteredRelays.length > 0 && <Divider />}
                    {filteredRelays.length > 0 && (
                      <ListSubheader
                        sx={{
                          typography: "overline",
                          lineHeight: 1.5,
                          color: "text.secondary",
                          pt: 1,
                        }}
                      >
                        Relays
                      </ListSubheader>
                    )}
                    {filteredRelays.map((name) => (
                      <MenuItem key={name} value={name}>
                        <Checkbox
                          size="small"
                          checked={selectedClients.includes(name)}
                          sx={{ p: 0.5, mr: 1 }}
                        />
                        <ListItemText primary={name} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </ArrowTooltip>
          </Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
              gap: 2,
            }}
          >
            <ArrowTooltip title={filtersDisabledTooltip}>
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  "& > *": { width: "100%" },
                }}
              >
                <FormControl
                  size="small"
                  fullWidth
                  disabled={filtersDisabled}
                  sx={{
                    position: "relative",
                    "&:hover .select-clear, &:focus-within .select-clear": {
                      visibility: "visible",
                    },
                  }}
                >
                  {selectedUsers.length > 0 && (
                    <IconButton
                      size="small"
                      className="select-clear"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedUsers([]);
                      }}
                      sx={{
                        position: "absolute",
                        right: 32,
                        top: "50%",
                        transform: "translateY(-50%)",
                        visibility: "hidden",
                        zIndex: 1,
                      }}
                    >
                      <CancelIcon fontSize="small" />
                    </IconButton>
                  )}
                  <Select
                    multiple
                    displayEmpty
                    value={selectedUsers}
                    onChange={handleUsersChange}
                    onClose={() => setUsersSearch("")}
                    renderValue={(selected) => {
                      if (selected.length === 0 || allUsersSelected) {
                        return "All Users";
                      }
                      if (selected.length === 1) return selected[0];
                      return `${selected[0]} +${selected.length - 1}`;
                    }}
                    MenuProps={{
                      autoFocus: false,
                      slotProps: { paper: { sx: { maxHeight: 400 } } },
                    }}
                  >
                    <ListSubheader sx={{ px: 2, py: 1 }}>
                      <TextField
                        size="small"
                        autoFocus
                        fullWidth
                        placeholder="Search..."
                        value={usersSearch}
                        onChange={(e) => setUsersSearch(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key !== "Escape") e.stopPropagation();
                        }}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    </ListSubheader>
                    <MenuItem value={SELECT_ALL_VALUE}>
                      <Checkbox
                        size="small"
                        checked={allUsersSelected}
                        indeterminate={someUsersSelected}
                        sx={{ p: 0.5, mr: 1 }}
                      />
                      <ListItemText primary="Select all" />
                    </MenuItem>
                    <Divider />
                    {filteredUsers.map((name) => (
                      <MenuItem key={name} value={name}>
                        <Checkbox
                          size="small"
                          checked={selectedUsers.includes(name)}
                          sx={{ p: 0.5, mr: 1 }}
                        />
                        <ListItemText primary={name} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </ArrowTooltip>
            <ArrowTooltip title={filtersDisabledTooltip}>
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  "& > *": { width: "100%" },
                }}
              >
                {timeRange === CUSTOM_TIME_RANGE ? (
                  <CustomDateTimeRangePicker
                    disabled={filtersDisabled}
                    value={dateRange}
                    onChange={setDateRange}
                    minDate={startOfDay(subDays(new Date(), 8))}
                    maxDate={endOfDay(new Date())}
                    defaultOpen
                    onCancel={handleCustomCancel}
                  />
                ) : (
                  <TextField
                    select
                    size="small"
                    value={timeRange}
                    onChange={(e) =>
                      handleTimeRangeChange(e.target.value as TimeRangeValue)
                    }
                    disabled={filtersDisabled}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: 20 }}
                            >
                              date_range
                            </span>
                          </InputAdornment>
                        ),
                      },
                    }}
                  >
                    {TIME_RANGE_GROUPS.flatMap((group, groupIdx) => [
                      ...group.map((preset) => (
                        <MenuItem key={preset} value={preset}>
                          {preset}
                        </MenuItem>
                      )),
                      <Divider key={`divider-${groupIdx}`} />,
                    ])}
                    <MenuItem value={CUSTOM_TIME_RANGE}>
                      {CUSTOM_TIME_RANGE}
                    </MenuItem>
                  </TextField>
                )}
              </Box>
            </ArrowTooltip>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Button
              variant="contained"
              color="primary"
              size="small"
              disabled={!selectedOrg || isFetching}
              onClick={handleApply}
            >
              Apply
            </Button>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {appliedOrg && (
                <Button
                  variant="text"
                  color="error"
                  size="small"
                  onClick={handleClear}
                  startIcon={
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 16 }}
                    >
                      close
                    </span>
                  }
                >
                  Clear
                </Button>
              )}
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                startIcon={
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 16 }}
                  >
                    refresh
                  </span>
                }
              >
                Refresh
              </Button>
            </Box>
          </Box>
        </Box>
      </PageHeader>
      <Box
        sx={{
          px: 2,
          pt: 2,
          pb: 8,
          minWidth: 0,
          minHeight: 0,
          flex: 1,
          maxWidth: "100%",
          overflow: "auto",
          color: (
            theme: Theme & {
              vars?: { palette?: { text?: { primary?: string } } };
            },
          ) => theme.vars?.palette?.text?.primary ?? theme.palette.text.primary,
        }}
      >
        <TabbedDataCard
          tabs={tabsConfig}
          activeTab={cardTab}
          onTabChange={(_, newValue) => setCardTab(newValue)}
        >
          <DataTable
            rows={visibleRows}
            columns={columns}
            loading={isFetching}
            noRowsOverlay={QueryLogsEmptyOverlay}
            showSearch={false}
            pinnedShadowFields={{ left: "time", right: "actions" }}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={setColumnVisibilityModel}
            onDefaultViewChange={handleDefaultViewChange}
            rowSelectionModel={rowSelection}
            onRowSelectionModelChange={setRowSelection}
            bulkActions={
              selectedRowCount > 0 && (
                <DataTableBulkActions
                  count={selectedRowCount}
                  noun="query log entry"
                  nounPlural="query log entries"
                  onClose={clearRowSelection}
                  actions={
                    <Button
                      variant="text"
                      color="primary"
                      startIcon={
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: 18 }}
                        >
                          edit
                        </span>
                      }
                    >
                      Edit
                    </Button>
                  }
                />
              )
            }
          />
        </TabbedDataCard>
      </Box>
    </Box>
  );
}
