// Dashboard chart primitives. Charts now use @mui/x-charts; the small KPI /
// fraction cards and the per-card Legend stay as plain JSX since they're not
// "charts" in the data-viz sense.
//
// All non-component helpers / palette / formatters live in `./lib`.

import { Box, Typography, useTheme } from "@mui/material";
import { BarChart as MuiBarChart } from "@mui/x-charts/BarChart";
import { LineChart as MuiLineChart } from "@mui/x-charts/LineChart";
import { PieChart } from "@mui/x-charts/PieChart";

import { ArrowTooltip } from "@/components/arrow-tooltip";
import { MaterialSymbol } from "@/components/material-symbol";

import {
  fmt,
  PAL,
  type DonutSlice,
  type HBarRow,
  type HBarSegment,
  type Series,
  type StackedSeries,
} from "./lib";

// In dark mode, very-dark series ("ink"/black) would vanish on the dark
// canvas — lift them to a light slate. Light mode keeps the brand black.
function useAdapt() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  return (c: string) => (isDark && /^#0[0-3]/i.test(c) ? "#9FB3C8" : c);
}

// ---- KPI stat card --------------------------------------------------------

export function StatCard({
  icon,
  color = PAL.primary,
  label,
  value,
}: {
  icon: string;
  color?: string;
  label: string;
  value: string | number;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 1,
        height: "100%",
        textAlign: "center",
      }}
    >
      <Box sx={{ display: "flex", color }}>
        <MaterialSymbol name={icon} size={40} />
      </Box>
      <Typography
        sx={{
          fontFamily: (t) => t.typography.fontSecondaryFamily,
          fontWeight: 700,
          fontSize: 24,
          lineHeight: 1,
          letterSpacing: "0.9px",
          color: "text.primary",
          mt: 2,
          mb: 1,
        }}
      >
        {typeof value === "number" ? fmt(value) : value}
      </Typography>
      <Typography
        sx={{
          fontSize: (t) => t.typography.body1.fontSize,
          color: "text.primary",
          fontWeight: 500,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

// ---- Fraction / status card -----------------------------------------------

export function FractionCard({
  icon,
  color,
  num,
  denom,
  label,
}: {
  icon: string;
  color: string;
  num: number;
  denom: number;
  label: string;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 1,
        height: "100%",
        textAlign: "center",
      }}
    >
      <Box sx={{ display: "flex", color }}>
        <MaterialSymbol name={icon} size={40} />
      </Box>
      <Typography
        sx={{
          fontFamily: (t) => t.typography.fontSecondaryFamily,
          fontWeight: 700,
          fontSize: 24,
          lineHeight: 1,
          letterSpacing: "0.9px",
          color: "text.primary",
          mt: 2,
          mb: 1,
        }}
      >
        {num}
        {/* Matches the numerator — same primary color and weight. */}
        <Box component="span"> / {denom}</Box>
      </Typography>
      <Typography
        sx={{
          fontSize: (t) => t.typography.body1.fontSize,
          color: "text.primary",
          fontWeight: 500,
        }}
      >
        {label}
      </Typography>
      {/* Fractions are a point-in-time count, so flag that the time range
          doesn't apply to them. */}
      <Box
        sx={{
          mt: 0.25,
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          color: "text.secondary",
        }}
      >
        <Typography variant="body2" sx={{ color: "inherit" }}>
          Current
        </Typography>
        <ArrowTooltip
          title={
            <>
              Shows current deployment status.
              <br />
              Not affected by the time range.
            </>
          }
        >
          <Box component="span" sx={{ display: "inline-flex" }}>
            <MaterialSymbol name="info" size={16} />
          </Box>
        </ArrowTooltip>
      </Box>
    </Box>
  );
}

// ---- Multi-series line chart ----------------------------------------------

export function LineChart({
  series,
  labels,
  height = 230,
}: {
  series: Series[];
  labels: string[];
  height?: number;
}) {
  const adapt = useAdapt();
  return (
    <Box sx={{ width: "100%" }}>
      <MuiLineChart
        height={height}
        hideLegend
        series={series.map((s) => ({
          data: s.data,
          color: adapt(s.color),
          label: s.name,
          curve: "monotoneX",
          showMark: true,
        }))}
        xAxis={[{ scaleType: "point", data: labels }]}
        yAxis={[{ valueFormatter: (v: number | null) => (v == null ? "" : fmt(v)) }]}
        margin={{ top: 14, right: 14, bottom: 0, left: 0 }}
        grid={{ horizontal: true }}
      />
    </Box>
  );
}

// ---- Vertical bar chart (stacked) -----------------------------------------

export function BarChart({
  categories,
  stacks,
  height = 250,
}: {
  categories: string[];
  stacks: StackedSeries[];
  height?: number;
}) {
  return (
    <Box sx={{ width: "100%" }}>
      <MuiBarChart
        height={height}
        hideLegend
        series={stacks.map((s) => ({
          data: s.data,
          color: s.color,
          label: s.name,
          stack: "total",
        }))}
        xAxis={[{ scaleType: "band", data: categories }]}
        yAxis={[{ valueFormatter: (v: number | null) => (v == null ? "" : fmt(v)) }]}
        margin={{ top: 16, right: 12, bottom: 0, left: 0 }}
        grid={{ horizontal: true }}
        borderRadius={3}
      />
    </Box>
  );
}

// ---- Horizontal stacked bars (activity by owner) --------------------------

export function HBarChart({
  rows,
  segments,
  height,
}: {
  rows: HBarRow[];
  segments: HBarSegment[];
  height?: number;
}) {
  const h = height ?? rows.length * 56 + 30;
  return (
    <Box sx={{ width: "100%" }}>
      <MuiBarChart
        layout="horizontal"
        height={h}
        hideLegend
        series={segments.map((seg) => ({
          data: rows.map((r) => r.values[seg.key] ?? 0),
          color: seg.color,
          label: seg.label,
          stack: "total",
        }))}
        yAxis={[{ scaleType: "band", data: rows.map((r) => r.label) }]}
        xAxis={[{ valueFormatter: (v: number | null) => (v == null ? "" : fmt(v)) }]}
        margin={{ top: 8, right: 32, bottom: 0, left: 0 }}
        grid={{ vertical: true }}
        borderRadius={3}
      />
    </Box>
  );
}

// ---- Donut / pie ----------------------------------------------------------

export function Donut({
  slices,
  donut = false,
  size = 200,
  label,
  legendValue = "percent",
}: {
  slices: DonutSlice[];
  donut?: boolean;
  size?: number;
  label?: string;
  /** Whether the legend shows each slice's share (%) or raw count. */
  legendValue?: "percent" | "count";
}) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const r = size / 2;
  const ir = donut ? r * 0.58 : 0;
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        flexWrap: "wrap",
      }}
    >
      <Box sx={{ position: "relative", width: size, height: size }}>
        <PieChart
          width={size}
          height={size}
          hideLegend
          series={[
            {
              data: slices.map((s, i) => ({
                id: i,
                value: s.value,
                label: s.label,
                color: s.color,
              })),
              innerRadius: ir,
              outerRadius: r - 4,
              paddingAngle: 1,
              cornerRadius: 0,
            },
          ]}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        />
        {donut && label && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontSize: 22, fontWeight: 500, color: "text.primary" }}
            >
              {fmt(total)}
            </Typography>
            <Typography sx={{ fontSize: 14, color: "text.disabled" }}>
              {label}
            </Typography>
          </Box>
        )}
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          minWidth: 120,
        }}
      >
        {slices.map((s) => (
          <Box
            key={s.label}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              fontSize: 14,
              color: "text.primary",
            }}
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: 0.5,
                bgcolor: s.color,
                flexShrink: 0,
              }}
            />
            <Box sx={{ flex: 1 }}>{s.label}</Box>
            <Typography
              variant="body2"
              component="span"
              sx={{ color: "text.secondary" }}
            >
              {legendValue === "count"
                ? fmt(s.value)
                : `${Math.round((s.value / total) * 100)}%`}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ---- Legend (per-card header) ---------------------------------------------

export function Legend({
  items,
}: {
  items: { label: string; color: string }[];
}) {
  const adapt = useAdapt();
  return (
    <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
      {items.map((it) => (
        <Box
          key={it.label}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            fontSize: 14,
            color: "text.secondary",
          }}
        >
          <Box
            sx={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              bgcolor: adapt(it.color),
            }}
          />
          {it.label}
        </Box>
      ))}
    </Box>
  );
}
