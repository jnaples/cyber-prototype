import {
  Button,
  FormControl,
  FormLabel,
  IconButton,
  Menu,
  MenuItem,
  OutlinedInput,
  Typography,
} from "@mui/material";
import Box from "@mui/material/Box";
import type { DataGridProps, GridColDef } from "@mui/x-data-grid";
import React, { useState } from "react";

import { ArrowTooltip } from "@/components/arrow-tooltip";
import { DataTable } from "@/components/data-table";
import { Drawer } from "@/components/drawer";
import { AndroidIcon } from "@/components/icons/os-icons";
import { MaterialSymbol } from "@/components/material-symbol";
import type { StatusTabConfig } from "@/components/tabbed-data-card";
import { TabbedDataCard } from "@/components/tabbed-data-card";
import type { RoamingClientRow } from "@/data/roaming-clients";
import { roamingClientRows } from "@/data/roaming-clients";
import { useOrgScope } from "@/hooks/use-org-scope";

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

/**
 * Per-client feature state, grouped under one "Features" header. A client that
 * has never checked in reports nothing, so its cells read as a dash rather
 * than claiming the feature is off.
 */
const FEATURE_FIELDS = [
  { field: "secureTransit", headerName: "SecureTransit" },
  { field: "cyberSight", headerName: "CyberSight" },
  { field: "browserExt", headerName: "Browser Ext." },
] as const;

const FEATURE_STATES = {
  on: { icon: "check", color: "success.main", label: "Enabled" },
  error: { icon: "warning", color: "warning.main", label: "Error" },
  off: { icon: "block", color: "text.disabled", label: "Disabled" },
} as const;

/** The icon alone doesn't say which feature it is, so the tooltip names it. */
function FeatureCell({
  feature,
  value,
}: {
  feature: string;
  value?: keyof typeof FEATURE_STATES;
}) {
  const state = value ? FEATURE_STATES[value] : undefined;
  if (!state) return <Box sx={{ color: "text.secondary" }}>–</Box>;
  return (
    <ArrowTooltip title={`${feature}: ${state.label}`}>
      <MaterialSymbol
        name={state.icon}
        size={20}
        sx={{ color: state.color, verticalAlign: "middle" }}
      />
    </ArrowTooltip>
  );
}

const FEATURE_COLUMNS: GridColDef[] = FEATURE_FIELDS.map(
  ({ field, headerName }) => ({
    field,
    headerName,
    width: 130,
    minWidth: 110,
    headerAlign: "center",
    align: "center",
    sortable: false,
    renderCell: (params) => (
      <FeatureCell feature={headerName} value={params.value} />
    ),
  }),
);

/**
 * Saved filter shortcuts offered beside the Filters button. Each one is a
 * predicate over the rows already in scope, so a preset composes with the
 * header's organization scope rather than replacing it.
 */
const FILTER_PRESETS = [
  {
    id: "cleanup",
    label: "Devices recommended for clean up",
    // Stale or not running: the fleet the Clean Up Tool exists for.
    rows: (rows: RoamingClientRow[]) =>
      rows.filter(
        (row) => row.status !== "Active" || row.lastSeen === "> 90 days",
      ),
  },
  {
    id: "duplicates",
    label: "Duplicate Roaming Clients",
    // Every row whose hostname is enrolled more than once, both sides of the
    // pair, so they can be compared before one is removed.
    rows: (rows: RoamingClientRow[]) => {
      const seen = new Map<string, number>();
      for (const row of rows) {
        seen.set(row.hostname, (seen.get(row.hostname) ?? 0) + 1);
      }
      return rows.filter((row) => (seen.get(row.hostname) ?? 0) > 1);
    },
  },
] as const;

type PresetId = (typeof FILTER_PRESETS)[number]["id"];

const FEATURE_GROUP: DataGridProps["columnGroupingModel"] = [
  {
    groupId: "features",
    headerName: "Features",
    headerAlign: "center",
    children: FEATURE_FIELDS.map(({ field }) => ({ field })),
  },
];

const columns: GridColDef[] = [
  { field: "hostname", headerName: "Hostname", flex: 1, minWidth: 150 },
  {
    field: "status",
    headerName: "Status",
    flex: 1,
    minWidth: 120,
    headerAlign: "center",
    renderCell: () => (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
        }}
      >
        <ArrowTooltip title="Protected" direction="top">
          <MaterialSymbol
            name="verified_user"
            size={22}
            sx={{ color: "var(--dnsf-palette-success-main)" }}
          />
        </ArrowTooltip>
      </Box>
    ),
  },
  {
    field: "agentOS",
    headerName: "Agent OS",
    flex: 0.7,
    minWidth: 90,
    renderCell: (params) => {
      const val: string = params.value ?? "";
      const lower = val.toLowerCase();
      let icon: React.ReactNode = null;
      if (lower === "windows")
        icon = <img src="/windows.svg" alt="Windows" width={20} height={20} />;
      else if (lower === "macos")
        icon = <img src="/mac.svg" alt="macOS" width={20} height={20} />;
      else if (lower === "ios")
        icon = <img src="/ios.svg" alt="iOS" width={20} height={20} />;
      else if (lower === "android") icon = <AndroidIcon size={20} />;
      if (!icon) return null;
      return (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <ArrowTooltip title={val} direction="top">
            <span style={{ display: "flex", alignItems: "center" }}>
              {icon}
            </span>
          </ArrowTooltip>
        </Box>
      );
    },
  },
  { field: "version", headerName: "Version", flex: 0.7, minWidth: 90 },
  ...FEATURE_COLUMNS,
  { field: "lastSeen", headerName: "Last Seen", flex: 1, minWidth: 120 },
  {
    field: "policySchedule",
    headerName: "Policy/Schedule",
    flex: 1,
    minWidth: 120,
    renderCell: (params) => {
      const showMerge = params.value !== "Staging";
      const showGlobe =
        params.value !== "Development" && params.value !== "Staging";
      const hasBothIcons = showMerge && showGlobe;
      const hasNoIcons = !showMerge && !showGlobe;

      return (
        <Box sx={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {hasNoIcons ? (
              <>
                <Box sx={{ width: 20, height: 20 }} />
                <Box sx={{ width: 20, height: 20 }} />
              </>
            ) : hasBothIcons ? (
              <>
                <ArrowTooltip title="Inherited from Site" direction="top">
                  <MaterialSymbol
                    name="location_on"
                    size={20}
                    sx={{ color: "text.secondary" }}
                  />
                </ArrowTooltip>
                <ArrowTooltip title="Global Policy" direction="top">
                  <MaterialSymbol
                    name="globe"
                    size={20}
                    sx={{ color: "text.secondary" }}
                  />
                </ArrowTooltip>
              </>
            ) : (
              <>
                <Box sx={{ width: 20, height: 20 }} />
                {showMerge && (
                  <ArrowTooltip title="Inherited from Site" direction="top">
                    <MaterialSymbol
                      name="location_on"
                      size={20}
                      sx={{ color: "text.secondary" }}
                    />
                  </ArrowTooltip>
                )}
                {showGlobe && (
                  <ArrowTooltip title="Global Policy" direction="top">
                    <MaterialSymbol
                      name="globe"
                      size={20}
                      sx={{ color: "text.secondary" }}
                    />
                  </ArrowTooltip>
                )}
              </>
            )}
          </Box>
          {params.value}
        </Box>
      );
    },
  },
  {
    field: "lastDeployed",
    headerName: "Last Deployed",
    flex: 1.2,
    minWidth: 150,
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 100,
    sortable: false,
    filterable: false,
    resizable: false,
    renderCell: () => <RowActionsCell />,
  },
];

function RowActionsCell() {
  const [editOpen, setEditOpen] = useState(false);
  const [hostname, setHostname] = useState("");
  const [notes, setNotes] = useState("");
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
        aria-label="edit"
        onClick={() => setEditOpen(true)}
      >
        <MaterialSymbol name="edit" size={20} />
      </IconButton>
      <IconButton size="small" aria-label="more options">
        <MaterialSymbol name="more_horiz" size={20} />
      </IconButton>
      <Drawer
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Roaming Client"
        secondaryAction={{
          label: "Cancel",
          onClick: () => setEditOpen(false),
        }}
        primaryAction={{
          label: "Save",
          onClick: () => setEditOpen(false),
        }}
      >
        <FormControl fullWidth>
          <FormLabel>Hostname</FormLabel>
          <OutlinedInput
            placeholder="Enter hostname"
            value={hostname}
            onChange={(e) => setHostname(e.target.value)}
          />
        </FormControl>
        <FormControl fullWidth>
          <FormLabel>Notes</FormLabel>
          <OutlinedInput
            placeholder="Optional notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </FormControl>
      </Drawer>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Status tab configuration
// ---------------------------------------------------------------------------

const buildTabsConfig = (total: number): StatusTabConfig[] => [
  {
    icon: "devices",
    count: total,
    label: "All",
    color: "primary.main",
    iconColorVar: "var(--dnsf-palette-primary-main)",
    progressValue: 100,
  },
  {
    icon: "verified_user",
    count: 5,
    label: "Protected",
    color: "success.main",
    iconColorVar: "var(--dnsf-palette-success-main)",
    progressValue: 100,
    showInfoIcon: true,
    infoTooltip: (
      <>
        Roaming Clients are synced with DNSFilter and have a policy assigned.{" "}
        <strong>Environment configurations</strong> can prevent the agent from
        filtering. Monitor Last Sync for conflict indicators.
      </>
    ),
  },
  {
    icon: "remove_moderator",
    count: 0,
    label: "Unprotected",
    color: "primary.main",
    iconColorVar: "var(--dnsf-palette-warning-main)",
    progressValue: 0,
    showInfoIcon: true,
    infoTooltip:
      "Roaming Clients are synced with DNSFilter but do not have a policy assigned. The agent cannot enforce filtering and the device is not protected.",
  },
  {
    icon: "wifi_tethering_off",
    count: 0,
    label: "Offline",
    color: "primary.main",
    iconColorVar: "var(--dnsf-palette-text-primary)",
    progressValue: 0,
    showInfoIcon: true,
    infoTooltip: (
      <>
        Roaming Clients are not synced with DNSFilter. This can occur if the
        device is powered off, the agent is uninstalled or cannot sync. Use the{" "}
        <strong>Clean Up Tool</strong> to delete offline agents.
      </>
    ),
  },
];

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function RoamingClientsPage() {
  const [cardTab, setCardTab] = useState(0);
  // Filter Presets menu, anchored to its button beside Filters.
  const [presetAnchor, setPresetAnchor] = useState<null | HTMLElement>(null);
  const [preset, setPreset] = useState<PresetId | null>(null);
  // The header's scope chip narrows the fleet to one organization.
  const { organization } = useOrgScope();
  const scopedRows = organization
    ? roamingClientRows.filter((row) => row.organization === organization)
    : roamingClientRows;
  const activePreset = FILTER_PRESETS.find((p) => p.id === preset);
  const visibleRows = activePreset ? activePreset.rows(scopedRows) : scopedRows;

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<MaterialSymbol name="install_desktop" size={20} />}
        >
          Install Roaming Client
        </Button>
      </Box>
      <TabbedDataCard
        fill
        tabs={buildTabsConfig(visibleRows.length)}
        activeTab={cardTab}
        onTabChange={(_, newValue) => setCardTab(newValue)}
      >
        {cardTab === 0 && (
          <DataTable
            rows={visibleRows}
            columns={columns}
            afterFilters={
              <>
                <Button
                  variant="text"
                  color="secondary"
                  size="small"
                  onClick={(event) => setPresetAnchor(event.currentTarget)}
                  startIcon={<MaterialSymbol name="tune" size={20} />}
                  sx={{ color: "text.primary" }}
                >
                  {activePreset ? activePreset.label : "Filter Presets"}
                </Button>
                <Menu
                  anchorEl={presetAnchor}
                  open={Boolean(presetAnchor)}
                  onClose={() => setPresetAnchor(null)}
                  anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                  transformOrigin={{ vertical: "top", horizontal: "left" }}
                >
                  {FILTER_PRESETS.map((option) => (
                    <MenuItem
                      key={option.id}
                      selected={option.id === preset}
                      onClick={() => {
                        // Picking the active preset again clears it.
                        setPreset(option.id === preset ? null : option.id);
                        setPresetAnchor(null);
                      }}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                  {activePreset && (
                    <MenuItem
                      onClick={() => {
                        setPreset(null);
                        setPresetAnchor(null);
                      }}
                    >
                      Show all Roaming Clients
                    </MenuItem>
                  )}
                </Menu>
              </>
            }
            columnGroupingModel={FEATURE_GROUP}
            // The group header takes the default surface so it reads as its
            // own band above the column headers. MUI X marks it with
            // `columnHeader--filledGroup` (there is no columnGroupHeader
            // class), and the shared grid-header rule it overrides is
            // !important.
            sx={{
              "& .MuiDataGrid-columnHeader--filledGroup": {
                backgroundColor:
                  "var(--dnsf-palette-background-default) !important",
              },
            }}
            // Rows scroll under the column headers; the pager stays put.
            fillHeight
            pinnedShadowFields={{ left: "hostname", right: "actions" }}
          />
        )}
        {cardTab === 1 && (
          <Box sx={{ p: 2 }}>
            <Typography>Tab 2 Content</Typography>
          </Box>
        )}
        {cardTab === 2 && (
          <Box sx={{ p: 2 }}>
            <Typography>Tab 3 Content</Typography>
          </Box>
        )}
      </TabbedDataCard>
    </>
  );
}
