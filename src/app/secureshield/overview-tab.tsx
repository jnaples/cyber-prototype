// AgentShield → Overview.
//
// Four counts across the top, the month behind them as one chart, then the
// applications and the destinations those requests went to. Everything here
// is scoped by the page's filter bar.

import {
  Box,
  Card,
  CardContent,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { GridColDef } from "@mui/x-data-grid";
import { useState } from "react";

import { LineChart } from "@/app/dashboards/charts";
import { PAL } from "@/app/dashboards/lib";
import { DataTable } from "@/components/data-table";
import { MaterialSymbol } from "@/components/material-symbol";

import {
  ACTIVITY_LABELS,
  REQUESTS_SERIES,
  THREATS_SERIES,
  STATS,
  TOP_APPS,
  TOP_DOMAINS,
  type Stat,
} from "./overview-data";

/** One count: what it counts, the number, and how it moved. The accent names
 *  it down the left edge rather than in a second color of type. */
function StatTile({ stat }: { stat: Stat }) {
  const up = stat.delta.direction === "up";
  return (
    <Card sx={{ height: "100%", borderLeft: `3px solid ${stat.accent}` }}>
      <CardContent
        sx={{ p: 2, "&:last-child": { pb: 2 }, display: "grid", gap: 1 }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <MaterialSymbol
            name={stat.icon}
            size={20}
            sx={{ color: stat.accent }}
          />
          <Typography
            variant="overline"
            sx={{ lineHeight: 1.4, color: "text.secondary" }}
          >
            {stat.label}
          </Typography>
        </Box>
        <Typography
          sx={{
            fontFamily: (theme: Theme) => theme.typography.fontSecondaryFamily,
            fontWeight: 700,
            fontSize: 32,
            lineHeight: 1.1,
            color: "text.primary",
          }}
        >
          {stat.value.toLocaleString()}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <MaterialSymbol
            name={up ? "trending_up" : "trending_down"}
            size={16}
            sx={{ color: up ? "success.main" : "error.main" }}
          />
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: up ? "success.main" : "error.main" }}
          >
            {stat.delta.value}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            vs prior 30 days
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {stat.detail}
        </Typography>
      </CardContent>
    </Card>
  );
}

/** A card that names itself, for the chart and the two tables. */
function Panel({
  title,
  caption,
  action,
  children,
}: {
  title: string;
  /** A count or qualifier beside the title. */
  caption?: string;
  /** One control on the right of the title row. */
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Box
          sx={{
            mb: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography variant="cardTitle">{title}</Typography>
            {caption && (
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {caption}
              </Typography>
            )}
          </Box>
          {action}
        </Box>
        {children}
      </CardContent>
    </Card>
  );
}

/** Right-aligned numbers, since every count in these tables is read down the
 *  column rather than across the row. */
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

const APP_COLUMNS: GridColDef[] = [
  { field: "app", headerName: "AI Application", flex: 1, minWidth: 180 },
  number("clients", "Roaming Clients", 150),
  number("requests", "Attributed DNS Requests", 200),
  number("blocked", "Blocked", 120),
  number("threats", "Threats", 110),
];

const DOMAIN_COLUMNS: GridColDef[] = [
  { field: "domain", headerName: "Domain", flex: 1, minWidth: 220 },
  { field: "app", headerName: "AI Application", width: 170 },
  { field: "category", headerName: "Category", width: 160 },
  number("requests", "Requests", 140),
  number("blocked", "Blocked", 120),
];

export function OverviewTab() {
  // Top Domains shows everything, or only what policy stopped.
  const [domainFilter, setDomainFilter] = useState<"all" | "blocked">("all");
  const domains =
    domainFilter === "all"
      ? TOP_DOMAINS
      : TOP_DOMAINS.filter((row) => row.blocked > 0);

  return (
    <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: 2,
        }}
      >
        {STATS.map((stat) => (
          <StatTile key={stat.label} stat={stat} />
        ))}
      </Box>

      <Panel title="AI Application Activity">
        <LineChart
          height={280}
          labels={ACTIVITY_LABELS}
          series={[
            {
              name: "Attributed DNS Requests",
              color: PAL.primary,
              data: REQUESTS_SERIES,
            },
            { name: "Threats", color: PAL.magenta, data: THREATS_SERIES },
          ]}
        />
      </Panel>

      <Panel title="Top AI Applications">
        <DataTable
          rows={TOP_APPS}
          columns={APP_COLUMNS}
          checkboxSelection={false}
          showSearch={false}
          showFilters={false}
          showDefaultView={false}
          showPreferences={false}
          showExport={false}
          showRefresh={false}
          initialPageSize={10}
        />
      </Panel>

      <Panel
        title="Top Domains"
        caption={`${domains.length} destinations`}
        action={
          <ToggleButtonGroup
            exclusive
            size="small"
            value={domainFilter}
            onChange={(_event, next: "all" | "blocked" | null) => {
              if (next) setDomainFilter(next);
            }}
            sx={{ "& .MuiToggleButton-root": { py: "4px", px: "12px" } }}
          >
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="blocked">Blocked only</ToggleButton>
          </ToggleButtonGroup>
        }
      >
        <DataTable
          rows={domains}
          columns={DOMAIN_COLUMNS}
          checkboxSelection={false}
          showSearch={false}
          showFilters={false}
          showDefaultView={false}
          showPreferences={false}
          showExport={false}
          showRefresh={false}
          initialPageSize={10}
        />
      </Panel>
    </Box>
  );
}
