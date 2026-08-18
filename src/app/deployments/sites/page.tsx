import { Box, Button, IconButton, InputAdornment, Link } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { GridColDef } from "@mui/x-data-grid";
import { useState } from "react";

import { ArrowTooltip } from "@/components/arrow-tooltip";
import { DataTable } from "@/components/data-table";
import { MaterialSymbol } from "@/components/material-symbol";
import { NoResultsOverlay } from "@/components/no-results-overlay";
import type { StatusTabConfig } from "@/components/tabbed-data-card";
import { TabbedDataCard } from "@/components/tabbed-data-card";
import { TextField } from "@/components/text-field";
import { MSP_ORGANIZATIONS } from "@/data/organizations";
import { useOrgScope } from "@/hooks/use-org-scope";

type Protection = "protected" | "unprotected" | "offline";

type SiteRow = {
  id: number;
  name: string;
  /** Which client organization owns the site — off-grid, read by the header's
   *  organization scope. */
  organization: string;
  protection: Protection;
  ipHostname: string;
  policy: string;
  /** Whether the applied policy is an MSP global policy (globe badge). */
  globalPolicy?: boolean;
  blockPage: string;
};

// Assigned by position so the organization scope has something to bite on;
// there is no Organization column on this grid.
const ORG_BY_INDEX = MSP_ORGANIZATIONS;

const ROWS: SiteRow[] = [
  {
    id: 1,
    organization: ORG_BY_INDEX[0 % ORG_BY_INDEX.length],
    name: "0",
    protection: "offline",
    ipHostname: "",
    policy: "z",
    blockPage: "Default Appearance",
  },
  {
    id: 2,
    organization: ORG_BY_INDEX[1 % ORG_BY_INDEX.length],
    name: "123",
    protection: "offline",
    ipHostname: "",
    policy: "",
    blockPage: "Default Appearance",
  },
  {
    id: 3,
    organization: ORG_BY_INDEX[2 % ORG_BY_INDEX.length],
    name: "ai",
    protection: "offline",
    ipHostname: "",
    policy: "z",
    blockPage: "Default Appearance",
  },
  {
    id: 4,
    organization: ORG_BY_INDEX[3 % ORG_BY_INDEX.length],
    name: "CleanUpTest1",
    protection: "offline",
    ipHostname: "",
    policy: "",
    blockPage: "Default Appearance",
  },
  {
    id: 5,
    organization: ORG_BY_INDEX[4 % ORG_BY_INDEX.length],
    name: "DNSF-4336 Site",
    protection: "offline",
    ipHostname: "",
    policy: "DNSF-4336 Pol",
    blockPage: "Default Appearance",
  },
  {
    id: 6,
    organization: ORG_BY_INDEX[5 % ORG_BY_INDEX.length],
    name: "MSP Scheduled Site",
    protection: "offline",
    ipHostname: "",
    policy: "MSP Scheduled Filter",
    blockPage: "Default Appearance",
  },
  {
    id: 7,
    organization: ORG_BY_INDEX[6 % ORG_BY_INDEX.length],
    name: "MSP Site",
    protection: "offline",
    ipHostname: "",
    policy: "msp global policy",
    globalPolicy: true,
    blockPage: "Default Appearance",
  },
  {
    id: 8,
    organization: ORG_BY_INDEX[7 % ORG_BY_INDEX.length],
    name: "MSP Site - No Policy",
    protection: "offline",
    ipHostname: "",
    policy: "",
    blockPage: "Default Appearance",
  },
  {
    id: 9,
    organization: ORG_BY_INDEX[8 % ORG_BY_INDEX.length],
    name: "z",
    protection: "offline",
    ipHostname: "",
    policy: "msp global policy",
    globalPolicy: true,
    blockPage: "Default Appearance",
  },
];

// Status icon per protection state (icon-only, like the screenshot).
const PROTECTION_ICON: Record<Protection, { icon: string; color: string }> = {
  protected: { icon: "verified_user", color: "success.main" },
  unprotected: { icon: "gpp_bad", color: "warning.main" },
  offline: { icon: "sensors_off", color: "text.secondary" },
};

// Column header with an inline edit pencil (Policy/Schedule, Block Page).
function EditableHeader({ label }: { label: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <span style={{ fontWeight: 600 }}>{label}</span>
      <MaterialSymbol name="edit" size={16} sx={{ color: "text.disabled" }} />
    </Box>
  );
}

function SiteActionsCell() {
  return (
    <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
      <ArrowTooltip title="Edit">
        <IconButton size="small" aria-label="Edit">
          <MaterialSymbol name="edit" size={20} />
        </IconButton>
      </ArrowTooltip>
      <IconButton size="small" aria-label="more options">
        <MaterialSymbol name="more_horiz" size={20} />
      </IconButton>
      <IconButton size="small" aria-label="expand row">
        <MaterialSymbol name="expand_more" size={20} />
      </IconButton>
    </Box>
  );
}

const columns: GridColDef<SiteRow>[] = [
  {
    field: "name",
    headerName: "Site Name",
    flex: 1,
    minWidth: 160,
    renderCell: (params) => (
      <Link href="#" underline="hover">
        {params.row.name}
      </Link>
    ),
  },
  {
    field: "protection",
    headerName: "Status",
    width: 110,
    sortable: false,
    renderCell: (params) => {
      const cfg = PROTECTION_ICON[params.row.protection];
      return (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <MaterialSymbol name={cfg.icon} size={20} sx={{ color: cfg.color }} />
        </Box>
      );
    },
  },
  {
    field: "ipHostname",
    headerName: "IP/Hostname",
    width: 170,
    renderCell: (params) => params.row.ipHostname || "-",
  },
  {
    field: "policy",
    headerName: "Policy/Schedule",
    flex: 1.3,
    minWidth: 220,
    renderHeader: () => <EditableHeader label="Policy/Schedule" />,
    cellClassName: (params) => (params.row.policy ? "" : "cell-no-policy"),
    renderCell: (params) => {
      if (!params.row.policy) return "-";
      return (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            height: "100%",
          }}
        >
          <span>{params.row.policy}</span>
          {params.row.globalPolicy && (
            <MaterialSymbol
              name="language"
              size={16}
              sx={{ color: "text.secondary" }}
            />
          )}
        </Box>
      );
    },
  },
  {
    field: "blockPage",
    headerName: "Block Page",
    flex: 1,
    minWidth: 180,
    renderHeader: () => <EditableHeader label="Block Page" />,
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 132,
    sortable: false,
    filterable: false,
    resizable: false,
    disableColumnMenu: true,
    hideable: false,
    renderCell: () => <SiteActionsCell />,
  },
];

function buildTabs(rows: SiteRow[]): StatusTabConfig[] {
  const total = rows.length;
  const count = (p: Protection) =>
    rows.filter((r) => r.protection === p).length;
  const protectedCount = count("protected");
  const unprotectedCount = count("unprotected");
  const offlineCount = count("offline");
  const pct = (n: number) => (total ? (n / total) * 100 : 0);
  return [
    {
      icon: "location_on",
      count: total,
      label: "All",
      color: "primary.main",
      iconColorVar: "var(--dnsf-palette-primary-main)",
      progressValue: 100,
    },
    {
      icon: "verified_user",
      count: protectedCount,
      label: "Protected",
      color: "success.main",
      iconColorVar: "var(--dnsf-palette-success-main)",
      progressValue: pct(protectedCount),
    },
    {
      icon: "gpp_bad",
      count: unprotectedCount,
      label: "Unprotected",
      color: "warning.main",
      iconColorVar: "var(--dnsf-palette-warning-main)",
      progressValue: pct(unprotectedCount),
    },
    {
      icon: "sensors_off",
      count: offlineCount,
      label: "Offline",
      color: "text.primary",
      iconColorVar: "var(--dnsf-palette-text-primary)",
      progressValue: pct(offlineCount),
    },
  ];
}

const TAB_PROTECTION: (Protection | null)[] = [
  null,
  "protected",
  "unprotected",
  "offline",
];

export default function SitesPage() {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  const [ipQuery, setIpQuery] = useState("");

  const { organization } = useOrgScope();
  const inScope = organization
    ? ROWS.filter((r) => r.organization === organization)
    : ROWS;
  const tabs = buildTabs(inScope);

  const visibleRows = inScope.filter((r) => {
    const protection = TAB_PROTECTION[tab];
    if (protection && r.protection !== protection) return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (
      ipQuery &&
      !r.ipHostname.toLowerCase().includes(ipQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={<MaterialSymbol name="add" size={20} />}
        >
          Add Site
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<MaterialSymbol name="download" size={20} />}
        >
          Import Sites
        </Button>
      </Box>

      <TabbedDataCard
        tabs={tabs}
        activeTab={tab}
        onTabChange={(_, value) => setTab(value)}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            px: 2,
            py: 1.5,
            borderTop: "1px solid",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <TextField
            size="small"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <MaterialSymbol name="search" size={20} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ width: 250 }}
          />
          <TextField
            size="small"
            placeholder="IP/Hostname"
            value={ipQuery}
            onChange={(e) => setIpQuery(e.target.value)}
            sx={{ width: 250 }}
          />
        </Box>

        <DataTable
          rows={visibleRows}
          columns={columns}
          showSearch={false}
          defaultViewOptions={[{ label: "Default", value: "default" }]}
          noRowsOverlay={NoResultsOverlay}
          pinnedShadowFields={{ left: "name", right: "actions" }}
          sx={{
            "& .MuiDataGrid-cell.cell-no-policy": {
              backgroundColor: (theme) => alpha(theme.palette.error.main, 0.08),
            },
          }}
        />
      </TabbedDataCard>
    </Box>
  );
}
