// AgentShield → Logs.
//
// Every attributed request, under the same quick-filter tabs Query Logs uses
// and with its own Result chip. The grid carries every column AgentShield
// records; the ones the default view doesn't need are hidden until someone
// turns them on from the columns menu.

import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import { Box, Chip, IconButton, Link } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { ArrowTooltip } from "@/components/arrow-tooltip";
import { DataTable } from "@/components/data-table";
import { MaterialSymbol } from "@/components/material-symbol";
import type { StatusTabConfig } from "@/components/tabbed-data-card";
import { TabbedDataCard } from "@/components/tabbed-data-card";

import { CATEGORY_COLORS, LOG_ROWS, type LogRow } from "./logs-data";
import { SessionDrawer } from "./session-drawer";

/** The quick filters over the same rows, in the order Query Logs shows them. */
const FILTERS = [
  { label: "All", icon: "format_list_bulleted", color: "primary" },
  { label: "Allowed", icon: "check", color: "success" },
  { label: "Blocked", icon: "block", color: "warning" },
  { label: "Threats", icon: "skull", color: "error" },
] as const;

const matches = (row: LogRow, index: number) => {
  if (index === 1) return row.result === "Allowed";
  if (index === 2) return row.result === "Blocked";
  if (index === 3) return row.threat;
  return true;
};

/** What the grid opens on; everything else is a column someone can add. */
const DEFAULT_COLUMNS = [
  "time",
  "app",
  "client",
  "process",
  "fqdn",
  "category",
  "result",
  "actions",
];

const stamp = (iso: string, utc = false) =>
  new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    ...(utc ? { timeZone: "UTC" } : {}),
  });

export function LogsTab() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  // The row whose session is open, which is also what keeps the drawer's
  // content while it animates shut.
  const [session, setSession] = useState<LogRow | null>(null);
  const [sessionOpen, setSessionOpen] = useState(false);

  const rows = useMemo(
    () => LOG_ROWS.filter((row) => matches(row, tab)),
    [tab],
  );

  const tabs: StatusTabConfig[] = FILTERS.map((filter, index) => {
    const count = LOG_ROWS.filter((row) => matches(row, index)).length;
    return {
      icon: filter.icon,
      count,
      label: filter.label,
      color: `${filter.color}.main`,
      iconColorVar: `var(--dnsf-palette-${filter.color}-main)`,
      progressValue: LOG_ROWS.length ? (count / LOG_ROWS.length) * 100 : 0,
    };
  });

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "time",
        headerName: "Time",
        width: 210,
        valueFormatter: (value: string) => stamp(value),
      },
      {
        field: "timeUtc",
        headerName: "Time (UTC)",
        width: 210,
        valueGetter: (_value, row) => (row as LogRow).time,
        valueFormatter: (value: string) => stamp(value, true),
      },
      {
        field: "app",
        headerName: "AI Application",
        width: 170,
        renderCell: (params) => {
          const row = params.row as LogRow;
          return (
            <Box sx={{ height: "100%", display: "flex", alignItems: "center" }}>
              <Link
                component="button"
                type="button"
                underline="hover"
                onClick={() =>
                  navigate(`/secureshield/applications/${row.appId}`)
                }
              >
                {row.app}
              </Link>
            </Box>
          );
        },
      },
      { field: "publisher", headerName: "Application Publisher", width: 200 },
      {
        field: "client",
        headerName: "Roaming Client",
        width: 160,
        renderCell: (params) => (
          <Box sx={{ height: "100%", display: "flex", alignItems: "center" }}>
            <Link component="button" type="button" underline="hover">
              {params.value as string}
            </Link>
          </Box>
        ),
      },
      { field: "friendlyName", headerName: "Friendly Name", width: 170 },
      { field: "user", headerName: "Logged on User", width: 160 },
      { field: "site", headerName: "Site", width: 150 },
      { field: "process", headerName: "Process Name", width: 180 },
      { field: "appPath", headerName: "Application Path", width: 340 },
      { field: "fqdn", headerName: "FQDN", flex: 1, minWidth: 240 },
      { field: "domain", headerName: "Domain", width: 180 },
      {
        field: "category",
        headerName: "Category",
        width: 220,
        // The dot is the category's own color; the label stays body text.
        renderCell: (params) => {
          const category = params.value as string;
          return (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  flexShrink: 0,
                  backgroundColor: CATEGORY_COLORS[category] ?? "text.disabled",
                }}
              />
              {category}
            </Box>
          );
        },
      },
      {
        field: "result",
        headerName: "Result",
        width: 140,
        renderCell: (params) => {
          const allowed = params.value === "Allowed";
          return (
            <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
              <Chip
                size="small"
                icon={
                  <MaterialSymbol
                    name={allowed ? "check" : "block"}
                    size={16}
                  />
                }
                label={params.value as string}
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
      { field: "remoteIp", headerName: "Remote IP", width: 150 },
      { field: "sessionId", headerName: "Session ID", width: 140 },
      { field: "collection", headerName: "Collection Name", width: 180 },
      { field: "version", headerName: "AgentShield Version", width: 180 },
      {
        field: "matchedSignature",
        headerName: "Matched Signature",
        width: 190,
      },
      { field: "signatureSource", headerName: "Signature Source", width: 180 },
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
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ArrowTooltip title="View session">
              <IconButton
                size="small"
                aria-label="View session"
                onClick={() => {
                  setSession(params.row as LogRow);
                  setSessionOpen(true);
                }}
              >
                <ManageSearchIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </ArrowTooltip>
          </Box>
        ),
      },
    ],
    [navigate],
  );

  // Everything the default view doesn't show starts hidden.
  const [columnVisibilityModel, setColumnVisibilityModel] = useState(() =>
    Object.fromEntries(
      columns.map((column) => [
        column.field,
        DEFAULT_COLUMNS.includes(column.field),
      ]),
    ),
  );

  return (
    <Box sx={{ p: 2 }}>
      <TabbedDataCard
        tabs={tabs}
        activeTab={tab}
        onTabChange={(_event, next) => setTab(next)}
      >
        <DataTable
          rows={rows}
          columns={columns}
          checkboxSelection={false}
          showDefaultView={false}
          showFilters={false}
          initialPageSize={25}
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={setColumnVisibilityModel}
        />
      </TabbedDataCard>

      <SessionDrawer
        open={sessionOpen}
        row={session}
        onClose={() => setSessionOpen(false)}
      />
    </Box>
  );
}
