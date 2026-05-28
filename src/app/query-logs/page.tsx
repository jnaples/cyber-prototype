import {
  Autocomplete,
  Button,
  Chip,
  IconButton,
  TextField,
} from "@mui/material";
import Box from "@mui/material/Box";
import type { Theme } from "@mui/material/styles";
import type { GridColDef } from "@mui/x-data-grid";
import {
  endOfDay,
  format as fnsFormat,
  startOfDay,
  subDays,
  subHours,
  subMilliseconds,
  subMinutes,
} from "date-fns";
import { useState } from "react";

import { ArrowTooltip } from "@/components/arrow-tooltip";
import { DataTable } from "@/components/data-table";
import { DateTimeRangePicker } from "@/components/date-time-range-picker";
import type { DateTimeRangePickerShortcut } from "@/components/date-time-range-picker";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import type { StatusTabConfig } from "@/components/tabbed-data-card";
import { TabbedDataCard } from "@/components/tabbed-data-card";

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

const columns: GridColDef[] = [
  { field: "time", headerName: "Time", width: 145, minWidth: 145 },
  { field: "fqdn", headerName: "FQDN", width: 172, minWidth: 150 },
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
  { field: "categories", headerName: "Categories", flex: 1, minWidth: 140 },
  { field: "application", headerName: "Application", flex: 1, minWidth: 140 },
  { field: "site", headerName: "Site", flex: 1, minWidth: 120 },
  { field: "deployment", headerName: "Deployment", flex: 1, minWidth: 140 },
  {
    field: "localUserName",
    headerName: "Local User Name",
    flex: 1,
    minWidth: 150,
  },
  { field: "resolver", headerName: "Resolver", flex: 1, minWidth: 120 },
  { field: "policy", headerName: "Policy", flex: 1, minWidth: 120 },
  {
    field: "actions",
    headerName: "Actions",
    width: 80,
    sortable: false,
    filterable: false,
    resizable: false,
    renderCell: () => (
      <Box sx={{ display: "flex", gap: 1 }}>
        <IconButton
          size="small"
          aria-label="more options"
          sx={{ color: "text.primary" }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            more_horiz
          </span>
        </IconButton>
      </Box>
    ),
  },
];

// ---------------------------------------------------------------------------
// Row data
// ---------------------------------------------------------------------------

const SHARED_ROW_VALUES = {
  site: "Case Study Site",
  resolver: "android Agent 30",
  policy: "Sales Policy",
};

const USERS = {
  analyst: { localUserName: "analyst-laptop", deployment: "Windows Agent 15" },
  sales: { localUserName: "sales-laptop", deployment: "Windows Agent 15" },
  dev: { localUserName: "dev-mbp", deployment: "macOS Agent 14.2" },
  design: { localUserName: "design-mbp", deployment: "macOS Agent 14.2" },
};

type RowSeed = {
  fqdn: string;
  result: "Allowed" | "Blocked";
  categories: string;
  application: string;
  user: keyof typeof USERS;
  isThreat?: boolean;
};

const ROW_SEEDS: RowSeed[] = [
  { fqdn: "github.com", result: "Allowed", categories: "Information Technology, Code Repositories", application: "Google Chrome", user: "analyst" },
  { fqdn: "slack.com", result: "Allowed", categories: "Business, Collaboration", application: "Slack", user: "sales" },
  { fqdn: "figma.com", result: "Allowed", categories: "Business, Design", application: "Figma", user: "design" },
  { fqdn: "atlassian.net", result: "Allowed", categories: "Business, Productivity", application: "Google Chrome", user: "analyst" },
  { fqdn: "malware-update-cdn.cf", result: "Blocked", isThreat: true, categories: "Malware", application: "Google Chrome", user: "sales" },
  { fqdn: "calendar.google.com", result: "Allowed", categories: "Productivity, Business", application: "Google Chrome", user: "sales" },
  { fqdn: "zoom.us", result: "Allowed", categories: "Business, Communication", application: "Zoom", user: "analyst" },
  { fqdn: "teams.microsoft.com", result: "Allowed", categories: "Business, Collaboration", application: "Microsoft Teams", user: "sales" },
  { fqdn: "chatgpt.com", result: "Allowed", categories: "Computing & Internet, Artificial Intelligence", application: "Google Chrome", user: "dev" },
  { fqdn: "stackoverflow.com", result: "Allowed", categories: "Computing & Internet, Reference", application: "Google Chrome", user: "dev" },
  { fqdn: "notion.so", result: "Allowed", categories: "Business, Productivity", application: "Google Chrome", user: "design" },
  { fqdn: "googlle-account-verify.xyz", result: "Blocked", isThreat: true, categories: "Phishing", application: "Google Chrome", user: "design" },
  { fqdn: "steamcommunity.com", result: "Blocked", categories: "Gaming", application: "Google Chrome", user: "dev" },
  { fqdn: "www.facebook.com", result: "Blocked", categories: "Social Networking", application: "Google Chrome", user: "sales" },
  { fqdn: "www.tiktok.com", result: "Blocked", categories: "Social Networking", application: "Google Chrome", user: "analyst" },
  { fqdn: "www.netflix.com", result: "Blocked", categories: "Streaming Media", application: "Google Chrome", user: "sales" },
  { fqdn: "docs.google.com", result: "Allowed", categories: "Productivity, Business", application: "Google Chrome", user: "analyst" },
  { fqdn: "www.draftkings.com", result: "Blocked", categories: "Gambling", application: "Google Chrome", user: "dev" },
  { fqdn: "www.linkedin.com", result: "Allowed", categories: "Business, Social Networking", application: "Google Chrome", user: "sales" },
  { fqdn: "vercel.com", result: "Allowed", categories: "Computing & Internet, Web Hosting", application: "Google Chrome", user: "dev" },
  { fqdn: "copilot.microsoft.com", result: "Allowed", categories: "Computing & Internet, Artificial Intelligence", application: "Microsoft Edge", user: "dev" },
  { fqdn: "www.salesforce.com", result: "Allowed", categories: "Business, CRM", application: "Google Chrome", user: "sales" },
  { fqdn: "secure-microsoft-login.tk", result: "Blocked", isThreat: true, categories: "Phishing", application: "Microsoft Edge", user: "sales" },
  { fqdn: "mail.google.com", result: "Allowed", categories: "Webmail, Communication", application: "Google Chrome", user: "analyst" },
  { fqdn: "outlook.office.com", result: "Allowed", categories: "Webmail, Business", application: "Microsoft Edge", user: "sales" },
];

const TIME_FORMAT = "MMM d, yyyy h:mm:ss a";
const TOTAL_ROWS = 125;
const TIME_SPAN_MS = 7 * 24 * 60 * 60 * 1000;

const rows = (() => {
  const now = new Date();
  const stepMs = TIME_SPAN_MS / TOTAL_ROWS;
  return Array.from({ length: TOTAL_ROWS }, (_, i) => {
    const seed = ROW_SEEDS[i % ROW_SEEDS.length];
    const jitter = (Math.random() - 0.5) * stepMs * 0.6;
    const offsetMs = Math.max(0, i * stepMs + jitter);
    const time = subMilliseconds(now, offsetMs);
    const { user, ...rest } = seed;
    return {
      id: i + 1,
      time: fnsFormat(time, TIME_FORMAT),
      ...rest,
      ...USERS[user],
      ...SHARED_ROW_VALUES,
    };
  });
})();

// ---------------------------------------------------------------------------
// Status tab configuration
// ---------------------------------------------------------------------------

const ALL_ROWS_ALLOWED_COUNT = rows.filter(
  (r) => r.result === "Allowed",
).length;
const ALL_ROWS_BLOCKED_COUNT = rows.filter(
  (r) => r.result === "Blocked",
).length;
const ALL_ROWS_THREAT_COUNT = rows.filter((r) => r.isThreat).length;

function buildTabsConfig(hasData: boolean): StatusTabConfig[] {
  const total = hasData ? rows.length : 0;
  const allowed = hasData ? ALL_ROWS_ALLOWED_COUNT : 0;
  const blocked = hasData ? ALL_ROWS_BLOCKED_COUNT : 0;
  const threats = hasData ? ALL_ROWS_THREAT_COUNT : 0;

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
  sites: ["All Sites", "HQ", "Remote", "Branch Office"],
  roamingClients: ["All Roaming Clients", "Sales Team", "Engineering"],
  users: ["All Users", "Admins", "Standard"],
};

const DATE_RANGE_SHORTCUTS: DateTimeRangePickerShortcut[] = [
  {
    label: "Today",
    getValue: () => {
      const now = new Date();
      return [startOfDay(now), endOfDay(now)];
    },
  },
  {
    label: "Yesterday",
    getValue: () => {
      const yesterday = subDays(new Date(), 1);
      return [startOfDay(yesterday), endOfDay(yesterday)];
    },
  },
  {
    label: "Last 5 minutes",
    getValue: () => {
      const now = new Date();
      return [subMinutes(now, 5), now];
    },
  },
  {
    label: "Last 15 minutes",
    getValue: () => {
      const now = new Date();
      return [subMinutes(now, 15), now];
    },
  },
  {
    label: "Last hour",
    getValue: () => {
      const now = new Date();
      return [subHours(now, 1), now];
    },
  },
  {
    label: "Last 4 hours",
    getValue: () => {
      const now = new Date();
      return [subHours(now, 4), now];
    },
  },
  {
    label: "Last 24 hours",
    getValue: () => {
      const now = new Date();
      return [subHours(now, 24), now];
    },
  },
  {
    label: "Last 3 days",
    getValue: () => {
      const now = new Date();
      return [subDays(now, 3), now];
    },
  },
  {
    label: "Last 7 days",
    getValue: () => {
      const now = new Date();
      return [subDays(now, 7), now];
    },
  },
];

const FETCH_DELAY_MS = 700;

function QueryLogsEmptyOverlay() {
  return (
    <EmptyState
      title="Select an Organization"
      description="Choose an Organization to view its DNS Query Logs."
    />
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function QueryLogsPage() {
  const [cardTab, setCardTab] = useState(0);
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [appliedOrg, setAppliedOrg] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const filtersDisabled = !selectedOrg;
  const filtersDisabledTooltip = filtersDisabled
    ? "Select an Organization to enable this filter"
    : "";

  const hasData = appliedOrg !== null && !isFetching;
  const visibleRows = hasData
    ? cardTab === 1
      ? rows.filter((r) => r.result === "Allowed")
      : cardTab === 2
        ? rows.filter((r) => r.result === "Blocked")
        : cardTab === 3
          ? rows.filter((r) => r.isThreat)
          : rows
    : [];
  const tabsConfig = buildTabsConfig(hasData);

  const handleApply = () => {
    if (!selectedOrg) return;
    setIsFetching(true);
    setCardTab(0);
    window.setTimeout(() => {
      setAppliedOrg(selectedOrg);
      setIsFetching(false);
    }, FETCH_DELAY_MS);
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
                <Autocomplete
                  size="small"
                  options={FILTER_OPTIONS.sites}
                  defaultValue="All Sites"
                  disabled={filtersDisabled}
                  renderInput={(params) => <TextField {...params} />}
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
                <Autocomplete
                  size="small"
                  options={FILTER_OPTIONS.roamingClients}
                  defaultValue="All Roaming Clients"
                  disabled={filtersDisabled}
                  renderInput={(params) => <TextField {...params} />}
                />
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
                <Autocomplete
                  size="small"
                  options={FILTER_OPTIONS.users}
                  defaultValue="All Users"
                  disabled={filtersDisabled}
                  renderInput={(params) => <TextField {...params} />}
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
                <DateTimeRangePicker
                  disabled={filtersDisabled}
                  defaultValue={[startOfDay(new Date()), endOfDay(new Date())]}
                  shortcuts={DATE_RANGE_SHORTCUTS}
                  minDate={startOfDay(subDays(new Date(), 8))}
                  maxDate={endOfDay(new Date())}
                />
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
      </PageHeader>
      <Box
        sx={{
          p: 2,
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
          />
        </TabbedDataCard>
      </Box>
    </Box>
  );
}
