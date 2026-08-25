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
import { getGridStringOperators, useGridApiRef } from "@mui/x-data-grid";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import { endOfDay, startOfDay, subDays, subHours, subMinutes } from "date-fns";
import { createContext, useContext, useState } from "react";

import { ArrowTooltip } from "@/components/arrow-tooltip";
import { DataTable } from "@/components/data-table";
import { DataTableBulkActions } from "@/components/data-table-bulk-actions";
import { CustomDateTimeRangePicker } from "@/components/custom-date-time-range-picker";
import type { CustomDateTimeRangePickerValue } from "@/components/custom-date-time-range-picker";
import { EmptyState } from "@/components/empty-state";
import { InfoChip } from "@/components/info-chip";
import { MaterialSymbol } from "@/components/material-symbol";
import { ReportMiscategorizationDrawer } from "@/app/unblock-requests/report-miscategorization-drawer";
import { NoResultsOverlay } from "@/components/no-results-overlay";
import { PageHeader } from "@/components/page-header";
import { PageShell } from "@/components/page-shell";
import type { StatusTabConfig } from "@/components/tabbed-data-card";
import { TabbedDataCard } from "@/components/tabbed-data-card";
import { Select } from "@/components/select";
import { DropdownSearch } from "@/components/dropdown-search";
import { TextField } from "@/components/text-field";
import { AdvancedFilters } from "@/app/dashboards/advanced-filters";
import type {
  AppliedAdvancedFilter,
  FilterColumn,
} from "@/app/dashboards/advanced-filters";
import { InvestigateBanner } from "@/app/query-logs/investigate-banner";
import {
  queryLogRows,
  relays,
  roamingClients,
  sites,
  users,
} from "@/data/query-logs";
import type { QueryLogRow } from "@/data/query-logs";

// Advanced-filter columns offered in the "More Filters" drawer. Columns with a
// fixed value set get a dropdown; the rest use a free-text "contains" input.
const QUERY_LOG_FILTER_COLUMNS: FilterColumn[] = [
  { field: "fqdn", label: "FQDN" },
  { field: "result", label: "Result", options: ["Allowed", "Blocked"] },
  {
    field: "categories",
    label: "Categories",
    options: [
      "Advertising",
      "Analytics",
      "Artificial Intelligence",
      "Business",
      "CRM",
      "Cloud",
      "Code Repositories",
      "Collaboration",
      "Communication",
      "Computing & Internet",
      "Cryptocurrency",
      "Customer Support",
      "Design",
      "DevOps",
      "Email Marketing",
      "Finance",
      "Gambling",
      "Gaming",
      "HR",
      "Information Technology",
      "Malware",
      "News",
      "Package Registry",
      "Phishing",
      "Productivity",
      "Reference",
      "SEO",
      "Sales Enablement",
      "Scam",
      "Scheduling",
      "Security",
      "Social Media",
      "Social Networking",
      "Streaming Media",
      "Surveys",
      "Web Hosting",
      "Webmail",
    ],
  },
  { field: "application", label: "Application" },
  { field: "deploymentType", label: "Deployment Type" },
  { field: "deploymentOs", label: "Deployment OS" },
  {
    field: "queryType",
    label: "Query Type",
    options: ["A", "AAAA", "CNAME", "MX", "TXT", "PTR", "NS"],
  },
  { field: "threat", label: "Threat" },
  { field: "collectionName", label: "Collection Name" },
];

// Does a row satisfy every applied advanced filter? (AND across rows; each is a
// case-insensitive contains / does-not-contain on the mapped column.)
function rowMatchesAdvancedFilters(
  row: QueryLogRow,
  filters: AppliedAdvancedFilter[],
): boolean {
  return filters.every((f) => {
    const field = QUERY_LOG_FILTER_COLUMNS.find(
      (c) => c.label === f.fieldLabel,
    )?.field;
    if (!field) return true;
    const cell = String(
      (row as Record<string, unknown>)[field] ?? "",
    ).toLowerCase();
    const contains = cell.includes(f.value.toLowerCase());
    return f.operatorLabel === "does not contain" ? !contains : contains;
  });
}

// ---------------------------------------------------------------------------
// Row actions menu (placeholder items — wire up later)
// ---------------------------------------------------------------------------

const ROW_ACTION_ITEMS = [
  "Add / Remove to Allow List",
  "Add / Remove to Block List",
  "Add / Remove to AppAware",
];

const TIME_WINDOW_OPTIONS = ["±5s", "±10s", "±15s"] as const;
type TimeWindowOption = (typeof TIME_WINDOW_OPTIONS)[number];

// Window selection → seconds on either side of the row's timestamp.
const TIME_WINDOW_SECONDS: Record<TimeWindowOption, number> = {
  "±5s": 5,
  "±10s": 10,
  "±15s": 15,
};

const INVESTIGATE_FILTER_ID = "investigate-query";

// Exposes a setter so cell-renderers (rendered outside the page's React
// subtree relative to setState closures) can switch the page-level
// "Default View" selection. Provided by QueryLogsPage, consumed by
// RowActionsCell when the user runs Investigate Query.
const InvestigateContext = createContext<{
  setDefaultView: (value: string) => void;
  setInvestigatedRow: (id: string | number) => void;
  startInvestigation: (row: QueryLogRow) => void;
  investigatedRowId: string | number | null;
} | null>(null);

// FQDN cell — appends an "Investigating" chip on the anchored row so the user
// can see which query the Investigate Mode window is centered on.
function FqdnCell({ row }: { row: QueryLogRow }) {
  const investigateCtx = useContext(InvestigateContext);
  const anchored = investigateCtx?.investigatedRowId === row.id;
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        height: "100%",
        minWidth: 0,
      }}
    >
      <Box
        component="span"
        sx={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {row.fqdn}
      </Box>
      {anchored && <InfoChip label="Investigating" />}
    </Box>
  );
}

function RowActionsCell({ row }: { row: QueryLogRow }) {
  const investigateCtx = useContext(InvestigateContext);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  // Only one investigation at a time — lock the icon on every row while active.
  const investigating = investigateCtx?.investigatedRowId != null;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        height: "100%",
      }}
    >
      <ArrowTooltip
        title={
          investigating ? (
            "Investigate Mode is already active. Exit it to investigate this query."
          ) : (
            <>
              <Box component="span" sx={{ fontWeight: 700 }}>
                Investigate Mode
              </Box>
              <br />
              Filters the query log to the deployment associated with this row,
              displaying all DNS activity within an adjustable time window.
            </>
          )
        }
      >
        <Box
          component="span"
          sx={{
            display: "inline-flex",
            cursor: investigating ? "not-allowed" : undefined,
          }}
        >
          <IconButton
            size="small"
            aria-label="Investigate Mode"
            disabled={investigating}
            onClick={() => investigateCtx?.startInvestigation(row)}
          >
            <MaterialSymbol
              name="manage_search"
              size={20}
              sx={{ color: investigating ? "action.disabled" : undefined }}
            />
          </IconButton>
        </Box>
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
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {ROW_ACTION_ITEMS.map((label) => (
          <MenuItem key={label} onClick={() => setAnchorEl(null)}>
            {label}
          </MenuItem>
        ))}
        {/* Reporting a bad verdict is a different kind of action from editing
            the allow / block lists, so it sits below a rule. */}
        <Divider />
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            setReportOpen(true);
          }}
        >
          Report Miscategorization
        </MenuItem>
      </Menu>

      <ReportMiscategorizationDrawer
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        domain={row.fqdn}
        currentCategory={row.categories}
        isThreat={row.result === "Blocked"}
      />
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

  // `accent-color` retints the native datetime overlay so it matches our
  // brand; `step={1}` switches the input to hh:mm:ss precision. We also hide
  // the webkit calendar-picker indicator.
  const fieldSx = {
    width: 75,
    accentColor: (theme: Theme) => theme.palette.primary.main,
    "& input::-webkit-calendar-picker-indicator": { display: "none" },
  } as const;
  const sharedSlotProps = {
    htmlInput: { step: 1 },
  } as const;

  return (
    <Box sx={{ display: "flex", gap: 1 }}>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <FormLabel>Start</FormLabel>
        <TextField
          type="datetime-local"
          size="small"
          variant="outlined"
          value={start}
          onChange={(e) =>
            applyValue({ ...item, value: [e.target.value, end] })
          }
          sx={fieldSx}
          slotProps={sharedSlotProps}
        />
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <FormLabel>End</FormLabel>
        <TextField
          type="datetime-local"
          size="small"
          variant="outlined"
          value={end}
          onChange={(e) =>
            applyValue({ ...item, value: [start, e.target.value] })
          }
          sx={fieldSx}
          slotProps={sharedSlotProps}
        />
      </Box>
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
  {
    field: "fqdn",
    headerName: "FQDN",
    width: 300,
    minWidth: 150,
    renderCell: (params) => <FqdnCell row={params.row as QueryLogRow} />,
  },
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
            icon={
              <MaterialSymbol name={allowed ? "check" : "block"} size={16} />
            }
            label={params.value}
            sx={(theme) => ({
              borderRadius: "6px",
              bgcolor: allowed
                ? theme.vars.palette.Alert.successStandardBg
                : theme.vars.palette.Alert.errorStandardBg,
              color: allowed
                ? theme.vars.palette.Alert.successColor
                : theme.vars.palette.Alert.errorColor,
              "& .MuiChip-icon, & .MuiChip-label": { color: "inherit" },
            })}
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
  { field: "policy", headerName: "Policy", flex: 1, minWidth: 120 },
  {
    field: "scheduledPolicyName",
    headerName: "Scheduled Policy Name",
    flex: 1,
    minWidth: 180,
  },
  {
    field: "collectionName",
    headerName: "Collection Name",
    flex: 1,
    minWidth: 160,
  },
  { field: "deployment", headerName: "Deployment", flex: 1, minWidth: 140 },
  {
    field: "deploymentType",
    headerName: "Deployment Type",
    flex: 1,
    minWidth: 150,
  },
  {
    field: "deploymentOs",
    headerName: "Deployment OS",
    flex: 1,
    minWidth: 140,
  },
  { field: "agentName", headerName: "Agent Name", flex: 1, minWidth: 140 },
  { field: "resolver", headerName: "Resolver", flex: 1, minWidth: 120 },
  {
    field: "localUserName",
    headerName: "Local User Name",
    flex: 1,
    minWidth: 150,
  },
  {
    field: "lanDeviceName",
    headerName: "LAN Device Name",
    flex: 1,
    minWidth: 160,
  },
  {
    field: "requestAddress",
    headerName: "Request Address",
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
    field: "localIpv6",
    headerName: "Local IPv6 Address",
    flex: 1,
    minWidth: 180,
  },
  { field: "macAddress", headerName: "MAC Address", flex: 1, minWidth: 150 },
  { field: "resolvedIp", headerName: "Resolved IPs", flex: 1, minWidth: 140 },
  { field: "queryType", headerName: "Query Type", flex: 1, minWidth: 130 },
  { field: "protocol", headerName: "Protocol", flex: 1, minWidth: 110 },
  {
    field: "responseTime",
    headerName: "Response Time",
    flex: 1,
    minWidth: 130,
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 104,
    sortable: false,
    filterable: false,
    resizable: false,
    hideable: false,
    renderCell: (params) => <RowActionsCell row={params.row as QueryLogRow} />,
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
  (typeof TIME_RANGE_GROUPS)[number][number] | typeof CUSTOM_TIME_RANGE;

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
      illustration="/searching.svg"
      title="Select an Organization"
      description="Choose an Organization to view its DNS Query Logs."
    />
  );
}

// Shown when an Organization is applied but filters/search return no rows.
// Uses the shared NoResultsOverlay component.

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
    "policy",
    "scheduledPolicyName",
    "collectionName",
    "deployment",
    "deploymentType",
    "deploymentOs",
    "agentName",
    "resolver",
    "localUserName",
    "lanDeviceName",
    "requestAddress",
    "localIpv4",
    "localIpv6",
    "macAddress",
    "resolvedIp",
    "queryType",
    "protocol",
    "responseTime",
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
    "site",
    "policy",
    "scheduledPolicyName",
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
    "threat",
    "site",
    "policy",
    "deployment",
    "deploymentType",
    "agentName",
    "localUserName",
    "requestAddress",
    "localIpv4",
    "resolvedIp",
    "queryType",
    "actions",
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
  // "More Filters" opens the shared advanced-filters drawer (scoped to the
  // Query Logs columns); the applied rows drive the button's count.
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [appliedAdvancedFilters, setAppliedAdvancedFilters] = useState<
    AppliedAdvancedFilter[]
  >([]);
  const [cardTab, setCardTab] = useState(0);
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [appliedOrg, setAppliedOrg] = useState<string | null>(null);
  // The date range the grid actually filters by — only updated on Apply, so
  // changing the time window doesn't refilter the grid until re-applied.
  const [appliedDateRange, setAppliedDateRange] =
    useState<CustomDateTimeRangePickerValue>([null, null]);
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
  >(() =>
    buildVisibilityModel(
      columns.map((c) => c.field),
      COLUMN_VIEW_PRESETS.default ?? null,
    ),
  );
  const [selectedView, setSelectedView] = useState<string>("default");
  // Row most recently acted on via "Investigate Query" — highlighted like a
  // selected row until the time-window filter is cleared.
  const [investigatedRowId, setInvestigatedRowId] = useState<
    string | number | null
  >(null);
  // Active investigation (drives the banner above the grid). Null when not
  // investigating.
  const [investigation, setInvestigation] = useState<{
    domain: string;
    anchorMs: number;
  } | null>(null);
  const [investigateWindow, setInvestigateWindow] = useState<TimeWindowOption>(
    TIME_WINDOW_OPTIONS[0],
  );
  const gridApiRef = useGridApiRef();

  // Filter the grid to a ±window range around the anchored query's timestamp.
  const applyInvestigateFilter = (
    anchorMs: number,
    window: TimeWindowOption,
  ) => {
    const windowMs = TIME_WINDOW_SECONDS[window] * 1000;
    gridApiRef.current?.setFilterModel({
      items: [
        {
          id: INVESTIGATE_FILTER_ID,
          field: "time",
          operator: "range",
          value: [
            new Date(anchorMs - windowMs).toISOString(),
            new Date(anchorMs + windowMs).toISOString(),
          ],
        },
      ],
    });
  };

  const startInvestigation = (row: QueryLogRow) => {
    const window = TIME_WINDOW_OPTIONS[0];
    setInvestigation({ domain: row.domain, anchorMs: row.timestampMs });
    setInvestigateWindow(window);
    setInvestigatedRowId(row.id);
    // Match the old flow: swap to the Investigative column preset and filter
    // to the time window around this query.
    handleDefaultViewChange("investigative");
    applyInvestigateFilter(row.timestampMs, window);
  };

  const changeInvestigateWindow = (window: TimeWindowOption) => {
    setInvestigateWindow(window);
    if (investigation) applyInvestigateFilter(investigation.anchorMs, window);
  };

  const exitInvestigation = () => {
    gridApiRef.current?.setFilterModel({ items: [] });
    setInvestigation(null);
    setInvestigatedRowId(null);
  };
  const handleDefaultViewChange = (value: string) => {
    setSelectedView(value);
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

  const investigating = Boolean(investigation);
  const investigateLockTooltip =
    "Filters locked during query investigation. Exit the investigation to modify filters.";
  const filtersDisabled = !selectedOrg || investigating;
  const filtersDisabledTooltip = investigating
    ? investigateLockTooltip
    : !selectedOrg
      ? "Select an Organization to enable this filter."
      : "";

  const hasData = appliedOrg !== null && !isFetching;
  const [startDate, endDate] = appliedDateRange;
  const startMs = startDate?.getTime() ?? 0;
  const endMs = endDate?.getTime() ?? Number.POSITIVE_INFINITY;
  const rowsInRange = hasData
    ? queryLogRows
        .filter((r) => r.timestampMs >= startMs && r.timestampMs <= endMs)
        .filter((r) => rowMatchesAdvancedFilters(r, appliedAdvancedFilters))
    : [];
  // While investigating, the grid is filtered to a ±window around the anchor;
  // narrow the rows the tab counts + result tabs are computed from so they
  // reflect what's actually shown.
  const investigateWindowMs = investigation
    ? TIME_WINDOW_SECONDS[investigateWindow] * 1000
    : 0;
  const scopedRows =
    hasData && investigation
      ? rowsInRange.filter(
          (r) =>
            r.timestampMs >= investigation.anchorMs - investigateWindowMs &&
            r.timestampMs <= investigation.anchorMs + investigateWindowMs,
        )
      : rowsInRange;
  const visibleRows =
    cardTab === 1
      ? scopedRows.filter((r) => r.result === "Allowed")
      : cardTab === 2
        ? scopedRows.filter((r) => r.result === "Blocked")
        : cardTab === 3
          ? scopedRows.filter((r) => r.isThreat)
          : scopedRows;
  const tabsConfig = buildTabsConfig(hasData, scopedRows);
  // v8 selection model: "include" lists selected ids; "exclude" lists deselected
  // (header "Select all" uses exclude so it doesn't materialize every id).
  const selectedRowCount =
    rowSelection.type === "exclude"
      ? visibleRows.length - rowSelection.ids.size
      : rowSelection.ids.size;

  // Snapshot of the filter selection the user most recently applied. When the
  // current inputs match this snapshot by reference, Apply is disabled — the
  // user must change something for the button to re-enable.
  type FilterSnapshot = {
    selectedOrg: string | null;
    selectedSites: string[];
    selectedClients: string[];
    selectedUsers: string[];
    timeRange: TimeRangeValue;
    dateRange: CustomDateTimeRangePickerValue;
  };
  const [appliedSnapshot, setAppliedSnapshot] = useState<FilterSnapshot | null>(
    null,
  );
  const isCurrentApplied =
    appliedSnapshot !== null &&
    appliedSnapshot.selectedOrg === selectedOrg &&
    appliedSnapshot.selectedSites === selectedSites &&
    appliedSnapshot.selectedClients === selectedClients &&
    appliedSnapshot.selectedUsers === selectedUsers &&
    appliedSnapshot.timeRange === timeRange &&
    appliedSnapshot.dateRange === dateRange;

  const handleApply = () => {
    if (!selectedOrg) return;
    setIsFetching(true);
    setCardTab(0);
    window.setTimeout(() => {
      setAppliedOrg(selectedOrg);
      setAppliedDateRange(dateRange);
      setIsFetching(false);
      setAppliedSnapshot({
        selectedOrg,
        selectedSites,
        selectedClients,
        selectedUsers,
        timeRange,
        dateRange,
      });
    }, FETCH_DELAY_MS);
  };

  const handleClear = () => {
    exitInvestigation();
    setSelectedOrg(null);
    setAppliedOrg(null);
    setAppliedDateRange([null, null]);
    setIsFetching(false);
    setCardTab(0);
    setTimeRange("Last 15 minutes");
    setDateRange(getRangeForPreset("Last 15 minutes") ?? [null, null]);
    setRevertState(null);
    setAppliedSnapshot(null);
    setAppliedAdvancedFilters([]);
  };

  return (
    <InvestigateContext.Provider
      value={{
        setDefaultView: handleDefaultViewChange,
        setInvestigatedRow: setInvestigatedRowId,
        startInvestigation,
        investigatedRowId,
      }}
    >
      <PageShell
        // The grid fills the page and scrolls its own rows.
        fill
        header={
          <PageHeader title="DNS Query Logs">
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                px: 3,
                // In Investigate Mode the whole filter bar is disabled; show a
                // not-allowed cursor on the disabled controls.
                ...(investigating && {
                  "& .Mui-disabled": { cursor: "not-allowed !important" },
                }),
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                  gap: 2,
                }}
              >
                <ArrowTooltip
                  title={investigating ? investigateLockTooltip : ""}
                >
                  <Box sx={{ display: "flex", "& > *": { width: "100%" } }}>
                    <Autocomplete
                      size="small"
                      fullWidth
                      disabled={investigating}
                      options={FILTER_OPTIONS.organization}
                      value={selectedOrg}
                      onChange={(_event, newValue) => setSelectedOrg(newValue)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select Organization"
                        />
                      )}
                    />
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
                    >
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
                        <DropdownSearch
                          value={sitesSearch}
                          onChange={setSitesSearch}
                        />
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
                    >
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
                        <DropdownSearch
                          value={clientsSearch}
                          onChange={setClientsSearch}
                        />
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
                              position: "static",
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
                        {filteredRelays.length > 0 && (
                          <ListSubheader
                            sx={{
                              typography: "overline",
                              lineHeight: 1.5,
                              color: "text.secondary",
                              pt: 1,
                              position: "static",
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
                  gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
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
                    >
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
                        <DropdownSearch
                          value={usersSearch}
                          onChange={setUsersSearch}
                        />
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
                          handleTimeRangeChange(
                            e.target.value as TimeRangeValue,
                          )
                        }
                        disabled={filtersDisabled}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <MaterialSymbol name="date_range" size={20} />
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
                <ArrowTooltip title={filtersDisabledTooltip}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Button
                      variant="text"
                      color="secondary"
                      disabled={filtersDisabled}
                      onClick={() => setAdvancedOpen(true)}
                      startIcon={
                        <FilterAltOutlinedIcon sx={{ fontSize: 20 }} />
                      }
                    >
                      {appliedAdvancedFilters.length > 0
                        ? `More Filters (${appliedAdvancedFilters.length})`
                        : "More Filters"}
                    </Button>
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
                <ArrowTooltip
                  title={
                    investigating
                      ? investigateLockTooltip
                      : isCurrentApplied
                        ? "Change your selection to apply a new filter."
                        : ""
                  }
                >
                  <span>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      disabled={
                        !selectedOrg ||
                        isFetching ||
                        isCurrentApplied ||
                        investigating
                      }
                      onClick={handleApply}
                    >
                      Apply
                    </Button>
                  </span>
                </ArrowTooltip>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {appliedOrg && (
                    <ArrowTooltip
                      title={investigating ? investigateLockTooltip : ""}
                    >
                      <span>
                        <Button
                          variant="text"
                          color="error"
                          size="small"
                          disabled={investigating}
                          onClick={handleClear}
                          startIcon={<MaterialSymbol name="close" size={18} />}
                        >
                          Clear
                        </Button>
                      </span>
                    </ArrowTooltip>
                  )}
                  <ArrowTooltip
                    title={investigating ? investigateLockTooltip : ""}
                  >
                    <span>
                      <Button
                        variant="outlined"
                        color="secondary"
                        size="small"
                        disabled={investigating}
                        startIcon={<MaterialSymbol name="refresh" size={16} />}
                      >
                        Refresh
                      </Button>
                    </span>
                  </ArrowTooltip>
                </Box>
              </Box>
            </Box>
          </PageHeader>
        }
      >
        {investigation && (
          <InvestigateBanner
            domain={investigation.domain}
            anchorMs={investigation.anchorMs}
            windowSeconds={TIME_WINDOW_SECONDS[investigateWindow]}
            windowOptions={TIME_WINDOW_OPTIONS}
            activeWindow={investigateWindow}
            onWindowChange={(value) =>
              changeInvestigateWindow(value as TimeWindowOption)
            }
            onExit={exitInvestigation}
          />
        )}
        <TabbedDataCard
          fill
          tabs={tabsConfig}
          activeTab={cardTab}
          onTabChange={(_, newValue) => setCardTab(newValue)}
        >
          <DataTable
            apiRef={gridApiRef}
            // Rows scroll under the column headers; the pager stays put.
            fillHeight
            hiddenFilterIds={
              investigation ? [INVESTIGATE_FILTER_ID] : undefined
            }
            rows={visibleRows}
            columns={columns}
            loading={isFetching}
            noRowsOverlay={
              appliedOrg === null ? QueryLogsEmptyOverlay : NoResultsOverlay
            }
            showSearch={false}
            showFilters={false}
            timeRangeField="time"
            pinnedShadowFields={{ left: "time", right: "actions" }}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={setColumnVisibilityModel}
            defaultView={selectedView}
            onDefaultViewChange={handleDefaultViewChange}
            rowSelectionModel={rowSelection}
            onRowSelectionModelChange={setRowSelection}
            getRowClassName={(params) =>
              params.id === investigatedRowId ? "Mui-selected" : ""
            }
            onFilterModelChange={(model) => {
              // Clearing the (time-window) filter removes the investigate
              // highlight too.
              if (!model.items.some((it) => it.id === INVESTIGATE_FILTER_ID)) {
                setInvestigatedRowId(null);
              }
            }}
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
                      startIcon={<MaterialSymbol name="edit" size={18} />}
                    >
                      Edit
                    </Button>
                  }
                />
              )
            }
          />
        </TabbedDataCard>

        <AdvancedFilters
          open={advancedOpen}
          onClose={() => setAdvancedOpen(false)}
          columns={QUERY_LOG_FILTER_COLUMNS}
          onApply={(applied) => {
            // Applying "More Filters" behaves exactly like the header Apply
            // button: set the advanced filters and re-run the fetch.
            setAppliedAdvancedFilters(applied);
            handleApply();
          }}
          seedFilters={appliedAdvancedFilters}
          applyLabel="Apply"
          title="More Filters"
          lockConjunction
          uniqueColumns
        />
      </PageShell>
    </InvestigateContext.Provider>
  );
}
