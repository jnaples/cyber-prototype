// Subscriptions (Subscription Management) — the MSP-wide roster of client
// organizations and their license / feature allocations. Three plan-summary
// cards sit above an action row and a grouped-column data table.

import { Box, Button, Card, IconButton, Typography } from "@mui/material";
import type { GridColDef, GridColumnGroupingModel } from "@mui/x-data-grid";

import { ArrowTooltip } from "@/components/arrow-tooltip";
import { DataTable } from "@/components/data-table";
import { TabbedDataCard } from "@/components/tabbed-data-card";

// ---------------------------------------------------------------------------
// Plan summary cards
// ---------------------------------------------------------------------------

type PlanSummary = {
  title: string;
  subtitle?: string;
  icon?: string;
  available: number;
  purchased: number;
};

const PLAN_SUMMARIES: PlanSummary[] = [
  { title: "Basic", subtitle: "Network Traffic", available: 20, purchased: 720 },
  { title: "Pro", subtitle: "Roaming Clients", available: 50, purchased: 1850 },
  { title: "SecureTransit", available: 75, purchased: 1500 },
];

function PlanSummaryCard({ plan }: { plan: PlanSummary }) {
  return (
    <Card sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Title + plan type */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {plan.icon && (
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 20, color: "var(--dnsf-palette-text-primary)" }}
            >
              {plan.icon}
            </span>
          )}
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {plan.title}
          </Typography>
        </Box>
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", minHeight: 18 }}
        >
          {plan.subtitle ?? ""}
        </Typography>
      </Box>

      {/* Availability */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {plan.available.toLocaleString()} Available
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {plan.purchased.toLocaleString()} Purchased
        </Typography>
      </Box>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Table columns
// ---------------------------------------------------------------------------

type OrgRow = {
  id: number;
  organization: string;
  plan: "Basic" | "Pro";
  ntAllocated: number;
  ntInUse: number;
  rcAllocated: number | null;
  rcInUse: number | null;
  totalInUse: number;
  guardian: number | null;
  cybersight: boolean;
  dataExport: boolean;
};

const num = (value: number | null) =>
  value == null ? "-" : value.toLocaleString();

function FeatureCell({ on }: { on: boolean }) {
  if (!on) {
    return <Box component="span" sx={{ color: "text.disabled" }}>-</Box>;
  }
  return (
    <span
      className="material-symbols-outlined"
      style={{ fontSize: 20, color: "var(--dnsf-palette-success-main)" }}
    >
      check
    </span>
  );
}

const columns: GridColDef<OrgRow>[] = [
  { field: "organization", headerName: "Organization", flex: 1, minWidth: 180 },
  { field: "plan", headerName: "Plan", width: 90 },
  {
    field: "ntAllocated",
    headerName: "Allocated",
    width: 110,
    align: "center",
    headerAlign: "center",
    valueFormatter: (value) => num(value as number | null),
  },
  {
    field: "ntInUse",
    headerName: "In Use",
    width: 100,
    align: "center",
    headerAlign: "center",
    valueFormatter: (value) => num(value as number | null),
  },
  {
    field: "rcAllocated",
    headerName: "Allocated",
    width: 110,
    align: "center",
    headerAlign: "center",
    valueFormatter: (value) => num(value as number | null),
  },
  {
    field: "rcInUse",
    headerName: "In Use",
    width: 100,
    align: "center",
    headerAlign: "center",
    valueFormatter: (value) => num(value as number | null),
  },
  {
    field: "totalInUse",
    headerName: "In Use",
    width: 110,
    align: "center",
    headerAlign: "center",
    valueFormatter: (value) => num(value as number | null),
  },
  {
    field: "guardian",
    headerName: "Guardian",
    width: 110,
    align: "center",
    headerAlign: "center",
    valueFormatter: (value) => num(value as number | null),
  },
  {
    field: "cybersight",
    headerName: "CyberSight",
    width: 120,
    align: "center",
    headerAlign: "center",
    sortable: false,
    renderCell: (params) => <FeatureCell on={params.value as boolean} />,
  },
  {
    field: "dataExport",
    headerName: "Data Export",
    width: 120,
    align: "center",
    headerAlign: "center",
    sortable: false,
    renderCell: (params) => <FeatureCell on={params.value as boolean} />,
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 90,
    sortable: false,
    filterable: false,
    align: "center",
    headerAlign: "center",
    renderCell: () => (
      <ArrowTooltip title="Edit organization">
        <IconButton size="small" aria-label="Edit organization">
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            edit
          </span>
        </IconButton>
      </ArrowTooltip>
    ),
  },
];

const columnGroupingModel: GridColumnGroupingModel = [
  {
    groupId: "Network Traffic Licenses",
    headerAlign: "center",
    children: [{ field: "ntAllocated" }, { field: "ntInUse" }],
  },
  {
    groupId: "Roaming Clients Licenses",
    headerAlign: "center",
    children: [{ field: "rcAllocated" }, { field: "rcInUse" }],
  },
  {
    groupId: "Total Licenses",
    headerAlign: "center",
    children: [{ field: "totalInUse" }],
  },
  {
    groupId: "Features",
    headerAlign: "center",
    children: [
      { field: "guardian" },
      { field: "cybersight" },
      { field: "dataExport" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Mock data — client organizations
// ---------------------------------------------------------------------------

type Seed = [
  org: string,
  plan: "Basic" | "Pro",
  ntAlloc: number,
  ntUse: number,
  rcAlloc: number | null,
  rcUse: number | null,
  total: number,
  guardian: number | null,
  cybersight: boolean,
  dataExport: boolean,
];

const SEED: Seed[] = [
  ["Albany Branch", "Pro", 50, 50, 30, 75, 125, 20, true, true],
  ["New York Branch", "Pro", 20, 20, 75, 75, 95, 75, true, true],
  ["Houston Branch", "Pro", 50, 50, 100, 100, 20, 100, true, true],
  ["Dallas Branch", "Basic", 65, 65, null, null, 65, null, true, false],
  ["Dunder Mifflin", "Pro", 50, 50, 30, 75, 20, null, true, true],
  ["Tampa Branch", "Pro", 40, 40, 150, 150, 190, 100, true, true],
  ["Buffalo Branch", "Basic", 25, 25, null, null, 25, null, true, false],
  ["Ft. Lauderdale Branch", "Basic", 45, 45, null, null, 45, null, true, false],
  ["Philly Branch", "Pro", 50, 50, 30, 75, 20, 20, true, true],
  ["Westchester Branch", "Pro", 5, 5, 20, 20, 25, 20, true, true],
  ["Scranton Branch", "Pro", 10, 10, 400, 400, 410, 400, true, true],
  ["Brooklyn Branch", "Pro", 50, 50, 30, 75, 20, 20, true, false],
  ["Miami Branch", "Basic", 90, 90, null, null, 90, null, true, false],
  ["Bronx Branch", "Pro", 50, 50, 30, 75, 20, 20, true, true],
  ["Jersey City Branch", "Pro", 105, 105, 500, 500, 605, 495, true, false],
  ["San Diego Branch", "Pro", 45, 45, 30, 30, 75, 25, true, true],
  ["Shelton Branch", "Pro", 50, 50, 30, 75, 20, 20, true, true],
  ["Dublin Branch", "Pro", 10, 10, 90, 90, 100, 50, true, true],
  ["Scotland Branch", "Basic", 50, 50, null, null, 20, null, true, false],
  ["Rome Branch", "Pro", 60, 60, 225, 225, 285, 180, true, true],
  ["Phoenix Branch", "Basic", 30, 30, null, null, 30, null, true, false],
  ["Seattle Branch", "Pro", 80, 80, 60, 60, 140, 60, true, true],
  ["Denver Branch", "Pro", 35, 35, 45, 45, 80, 30, false, true],
  ["Atlanta Branch", "Basic", 70, 70, null, null, 70, null, true, false],
  ["Boston Branch", "Pro", 55, 55, 120, 120, 175, 90, true, true],
  ["Chicago Branch", "Pro", 90, 90, 200, 200, 290, 150, true, false],
];

const rows: OrgRow[] = SEED.map(
  (
    [org, plan, ntAlloc, ntUse, rcAlloc, rcUse, total, guardian, cs, de],
    i,
  ) => ({
    id: i + 1,
    organization: org,
    plan,
    ntAllocated: ntAlloc,
    ntInUse: ntUse,
    rcAllocated: rcAlloc,
    rcInUse: rcUse,
    totalInUse: total,
    guardian,
    cybersight: cs,
    dataExport: de,
  }),
);

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SubscriptionsManagePage() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Plan summary cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(6, 1fr)" },
          gap: 2,
        }}
      >
        {PLAN_SUMMARIES.map((plan) => (
          <PlanSummaryCard key={plan.title} plan={plan} />
        ))}
      </Box>

      {/* Action buttons */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              add
            </span>
          }
        >
          Add Organization
        </Button>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 20 }}
              >
                file_download
              </span>
            }
          >
            Import Organizations
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 20 }}
              >
                query_stats
              </span>
            }
          >
            View Usage Summary
          </Button>
        </Box>
      </Box>

      {/* Organizations table */}
      <TabbedDataCard>
        <DataTable
          rows={rows}
          columns={columns}
          columnGroupingModel={columnGroupingModel}
          pinnedShadowFields={{ left: "organization", right: "actions" }}
        />
      </TabbedDataCard>
    </Box>
  );
}
