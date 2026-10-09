// AgentShield → AI Applications.
//
// Every AI application seen in the window, with where it stands: sanctioned,
// unsanctioned, or still unreviewed. The status tabs above the grid are quick
// filters over the same rows, the way Query Logs filters its results.

import { Badge, Box, Chip, IconButton, Link } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { GridColDef } from "@mui/x-data-grid";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { ArrowTooltip } from "@/components/arrow-tooltip";
import { DataTable } from "@/components/data-table";
import { MaterialSymbol } from "@/components/material-symbol";
import type { StatusTabConfig } from "@/components/tabbed-data-card";
import { TabbedDataCard } from "@/components/tabbed-data-card";

import {
  AI_APPLICATIONS,
  isNew,
  type AiApplicationRow,
  type AppStatus,
} from "./ai-applications-data";

/** The tabs, in the order they filter: everything, then each standing. */
const FILTERS: { label: string; status: AppStatus | null; icon: string }[] = [
  { label: "All", status: null, icon: "apps" },
  { label: "Unreviewed", status: "Unreviewed", icon: "help" },
  { label: "Approved", status: "Approved", icon: "verified" },
  { label: "Unapproved", status: "Unapproved", icon: "do_not_disturb_on" },
  { label: "Blocked", status: "Blocked", icon: "block" },
];

/** The chip each standing wears — the muted Alert tints Query Logs uses for
 *  Allowed and Blocked, and the neutral fill for one nobody has ruled on. */
type ChipTint = { bgcolor: string; color: string };

const STATUS_CHIP: Record<AppStatus, (theme: Theme) => ChipTint> = {
  Approved: (theme) => ({
    bgcolor: theme.vars.palette.Alert.successStandardBg,
    color: theme.vars.palette.Alert.successColor,
  }),
  // Not approved but still resolving — a caution rather than a stop.
  Unapproved: (theme) => ({
    bgcolor: theme.vars.palette.Alert.warningStandardBg,
    color: theme.vars.palette.Alert.warningColor,
  }),
  Blocked: (theme) => ({
    bgcolor: theme.vars.palette.Alert.errorStandardBg,
    color: theme.vars.palette.Alert.errorColor,
  }),
  Unreviewed: (theme) => ({
    bgcolor: theme.vars.palette.action.selected,
    color: theme.vars.palette.text.secondary,
  }),
};

const TAB_COLORS = [
  { color: "primary.main", iconColorVar: "var(--dnsf-palette-primary-main)" },
  {
    color: "text.secondary",
    iconColorVar: "var(--dnsf-palette-text-secondary)",
  },
  { color: "success.main", iconColorVar: "var(--dnsf-palette-success-main)" },
  { color: "warning.main", iconColorVar: "var(--dnsf-palette-warning-main)" },
  { color: "error.main", iconColorVar: "var(--dnsf-palette-error-main)" },
];

const stamp = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/** Right-aligned, since every count here is read down its column. */
const number = (field: string, headerName: string, width: number) =>
  ({
    field,
    headerName,
    width,
    type: "number",
    align: "right",
    headerAlign: "right",
    valueFormatter: (value: number) => value.toLocaleString(),
  }) satisfies GridColDef;

const columnsWithOpen = (open: (id: string) => void): GridColDef[] => [
  {
    field: "app",
    headerName: "AI Application",
    flex: 1,
    minWidth: 200,
    renderCell: (params) => {
      const row = params.row as AiApplicationRow;
      return (
        <Box
          sx={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            gap: 1,
            minWidth: 0,
          }}
        >
          <Link
            component="button"
            type="button"
            underline="hover"
            onClick={() => open(row.id)}
          >
            {row.app}
          </Link>
          {/* An application nobody has seen before this week — the same badge
              the side nav wears beside AgentShield. */}
          {isNew(row) && (
            <Badge
              badgeContent="NEW"
              sx={{
                "& .MuiBadge-badge": {
                  position: "static",
                  transform: "none",
                  bgcolor: "tertiary.main",
                  color: "tertiary.contrastText",
                },
              }}
            />
          )}
        </Box>
      );
    },
  },
  {
    field: "status",
    headerName: "Status",
    width: 150,
    renderCell: (params) => {
      const status = params.value as AppStatus;
      return (
        <Box sx={{ height: "100%", display: "flex", alignItems: "center" }}>
          <Chip
            size="small"
            label={status}
            sx={(theme) => ({
              borderRadius: "6px",
              ...STATUS_CHIP[status](theme),
              "& .MuiChip-label": { color: "inherit" },
            })}
          />
        </Box>
      );
    },
  },
  number("clients", "Roaming Clients", 160),
  number("users", "Logged on Users", 160),
  number("allowed", "Allowed", 130),
  number("blocked", "Blocked", 130),
  number("threats", "Threats", 120),
  {
    field: "firstSeen",
    headerName: "First Seen",
    width: 190,
    valueFormatter: (value: string) => stamp(value),
  },
  {
    field: "lastActivity",
    headerName: "Last Activity",
    width: 190,
    valueFormatter: (value: string) => stamp(value),
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 100,
    sortable: false,
    filterable: false,
    resizable: false,
    align: "center",
    headerAlign: "center",
    // The one thing to do from a row: read what the application actually
    // asked for, under the same glyph the DNS Query Log carries in the rail.
    renderCell: () => (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ArrowTooltip title="Logs">
          <IconButton size="small" aria-label="Logs">
            <MaterialSymbol name="format_list_bulleted" size={20} />
          </IconButton>
        </ArrowTooltip>
      </Box>
    ),
  },
];

export function AiApplicationsTab() {
  const [tab, setTab] = useState(0);
  const navigate = useNavigate();
  const columns = useMemo(
    () => columnsWithOpen((id) => navigate(`/secureshield/applications/${id}`)),
    [navigate],
  );

  const rows = useMemo(() => {
    const status = FILTERS[tab].status;
    return status
      ? AI_APPLICATIONS.filter((row) => row.status === status)
      : AI_APPLICATIONS;
  }, [tab]);

  const tabs: StatusTabConfig[] = FILTERS.map((filter, index) => {
    const count = filter.status
      ? AI_APPLICATIONS.filter((row) => row.status === filter.status).length
      : AI_APPLICATIONS.length;
    return {
      icon: filter.icon,
      count,
      label: filter.label,
      ...TAB_COLORS[index],
      progressValue: AI_APPLICATIONS.length
        ? (count / AI_APPLICATIONS.length) * 100
        : 0,
    };
  });

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
          searchPlaceholder="Search AI applications..."
          initialPageSize={25}
        />
      </TabbedDataCard>
    </Box>
  );
}
