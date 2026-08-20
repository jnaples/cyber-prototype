// Widget body renderer. Exposed as a component (`<WidgetBody>`) so this file
// only exports components and stays within the react-refresh constraint.

import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { MaterialSymbol } from "@/components/material-symbol";
import { TextField } from "@/components/text-field";

import {
  BarChart,
  Donut,
  FractionCard,
  HBarChart,
  LineChart,
  StatCard,
} from "./charts";
import { useDashboardFactor, useDashboardOrgCount } from "./dashboard-filters";
import { GeoGlobe } from "./geo-globe";
import {
  catSlices,
  eventCats,
  eventStacks,
  fmt,
  ownerRows,
  ownerSegs,
  PAL,
  reqLabels,
  reqSeries,
  threatSeries,
  threatSlices,
  topDomains,
  topOrgs,
  type DonutSlice,
  type Series,
  type StackedSeries,
} from "./lib";

// ---- standalone body components ------------------------------------------

function GeoMap() {
  // The activity map is scoped to one organization at a time. When more than
  // one org is in the filter selection, prompt the user to narrow it down.
  const orgCount = useDashboardOrgCount();
  if (orgCount > 1) {
    return (
      <Box
        sx={{
          height: 230,
          borderRadius: 1.5,
          border: "1px dashed",
          borderColor: "divider",
          bgcolor: "background.default",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1.25,
          px: 2,
          color: "text.disabled",
        }}
      >
        <MaterialSymbol name="map" size={38} />
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 600,
            color: "text.secondary",
            textAlign: "center",
          }}
        >
          Available for a single organization
        </Typography>
        <Typography sx={{ fontSize: 14, textAlign: "center", maxWidth: 260 }}>
          Filter to one organization to view its activity map.
        </Typography>
      </Box>
    );
  }
  // Spinnable globe (globe.gl) with the top 100 site markers. The
  // "Showing top 100 Sites" caption lives in the card header (see V2Card).
  return (
    <Box sx={{ position: "relative", height: "100%", minHeight: 240 }}>
      <GeoGlobe />
    </Box>
  );
}

function DataTableWidget({
  cols,
  rows,
}: {
  cols: { key: string; label: string }[];
  rows: Record<string, string>[];
}) {
  return (
    <Box sx={{ width: "100%" }}>
      <TextField
        size="small"
        fullWidth
        placeholder="Search..."
        sx={{ mb: 1 }}
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
      <Table size="small">
        <TableHead>
          <TableRow>
            {cols.map((c, i) => (
              <TableCell
                key={c.key}
                align={i ? "right" : "left"}
                sx={{ fontSize: 14, fontWeight: 600 }}
              >
                {c.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r, ri) => (
            <TableRow key={ri}>
              {cols.map((c, ci) => (
                <TableCell
                  key={c.key}
                  align={ci ? "right" : "left"}
                  sx={(theme) => ({
                    ...theme.typography.body2,
                    color: ci ? "text.secondary" : "text.primary",
                  })}
                >
                  {ci === 0 ? (
                    <Box
                      component="span"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <MaterialSymbol
                        name={(r.icon as string) ?? "language"}
                        size={14}
                        sx={{
                          color: (r.iconColor as string) ?? "currentColor",
                        }}
                      />
                      {r[c.key]}
                    </Box>
                  ) : (
                    r[c.key]
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

// ---- entry point ---------------------------------------------------------

export function WidgetBody({ type }: { type: string }) {
  // Active Quick Filters scale every widget's numbers so the page responds.
  const factor = useDashboardFactor();
  const scale = (n: number) => Math.round(n * factor);
  const scaleSeries = <T extends Series | StackedSeries>(series: T[]): T[] =>
    series.map((s) => ({ ...s, data: s.data.map((d) => scale(d)) }));
  const scaleSlices = (slices: DonutSlice[]): DonutSlice[] =>
    slices.map((s) => ({ ...s, value: scale(s.value) }));

  switch (type) {
    case "kpi-total":
      return (
        <StatCard
          icon="radio_button_checked"
          color={PAL.primary}
          label="Total Requests"
          value={fmt(scale(1657222))}
        />
      );
    case "kpi-allowed":
      return (
        <StatCard
          icon="check"
          color={PAL.secure}
          label="Allowed Requests"
          value={fmt(scale(1162944))}
        />
      );
    case "kpi-blocked":
      return (
        <StatCard
          icon="block"
          color={PAL.ink}
          label="Blocked Requests"
          value={fmt(scale(494278))}
        />
      );
    case "kpi-threats":
      return (
        <StatCard
          icon="skull"
          color={PAL.magenta}
          label="Blocked Threats"
          value={fmt(scale(115056))}
        />
      );

    case "status-sites":
      return (
        <FractionCard
          icon="location_on"
          color={PAL.green}
          num={3}
          denom={3}
          label="Sites Protected"
        />
      );
    case "status-roaming":
      return (
        <FractionCard
          icon="devices"
          color={PAL.rose}
          num={38}
          denom={42}
          label="Roaming Clients Protected"
        />
      );
    case "status-users":
      return (
        <FractionCard
          icon="person"
          color={PAL.purple}
          num={74}
          denom={75}
          label="Users"
        />
      );
    case "status-relays":
      return (
        <FractionCard
          icon="device_hub"
          color={PAL.ink}
          num={2}
          denom={2}
          label="Relays"
        />
      );

    case "request-activity":
      return (
        <LineChart
          series={scaleSeries(reqSeries)}
          labels={reqLabels}
          height={250}
        />
      );
    case "threats-time":
      return (
        <LineChart
          series={scaleSeries(threatSeries)}
          labels={reqLabels}
          height={230}
        />
      );

    case "requests-bar":
      return (
        <BarChart
          categories={eventCats}
          stacks={scaleSeries(eventStacks)}
          height={250}
        />
      );

    case "activity-owner":
      return <HBarChart rows={ownerRows} segments={ownerSegs} />;

    case "cat-breakdown":
      return (
        <Donut
          slices={scaleSlices(catSlices)}
          donut
          size={170}
          label="domains"
          legendValue="count"
        />
      );
    case "threat-breakdown":
      return <Donut slices={scaleSlices(threatSlices)} size={170} />;

    case "top-domains":
      return (
        <DataTableWidget
          cols={[
            { key: "domain", label: "Domain" },
            { key: "requests", label: "# of Requests" },
          ]}
          rows={topDomains.slice(0, 5)}
        />
      );
    case "top-orgs":
      return (
        <DataTableWidget
          cols={[
            { key: "org", label: "Organization" },
            { key: "requests", label: "# of Requests" },
          ]}
          rows={topOrgs.slice(0, 5)}
        />
      );

    case "geo-activity":
      return <GeoMap />;

    default:
      return <Box sx={{ p: 2, color: "text.disabled" }}>Unknown widget</Box>;
  }
}
