// Chart primitives for the custom dashboard. Inline SVG so they read theme
// tokens directly. All non-component helpers / palette / formatters live in
// `./lib` to satisfy the file's "components only" lint rule.

import { Box, Typography, useTheme } from "@mui/material";
import { useEffect, useRef, useState } from "react";

import {
  fmt,
  PAL,
  type DonutSlice,
  type HBarRow,
  type HBarSegment,
  type Series,
  type StackedSeries,
} from "./lib";

const GRID = "rgba(127,127,127,.18)";

// In dark mode, very-dark series ("ink"/black) would vanish on the dark
// canvas — lift them to a light slate. Light mode keeps the brand black.
function useAdapt() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  return (c: string) => (isDark && /^#0[0-3]/i.test(c) ? "#9FB3C8" : c);
}

function useContainerWidth(initial = 640): [
  React.RefObject<HTMLDivElement | null>,
  number,
] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [w, setW] = useState(initial);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((es) => setW(es[0].contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

// ---- KPI stat card ---------------------------------------------------------

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
        gap: 2,
        p: 1,
        height: "100%",
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          width: 52,
          height: 52,
          borderRadius: 1,
          bgcolor: color + "14",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color,
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 26 }}>
          {icon}
        </span>
      </Box>
      <Typography
        sx={{
          fontFamily: (t) => t.typography.fontSecondaryFamily,
          fontWeight: 700,
          fontSize: 32,
          lineHeight: 1,
          letterSpacing: "-0.5px",
          color: "text.primary",
        }}
      >
        {typeof value === "number" ? fmt(value) : value}
      </Typography>
      <Typography
        sx={{
          fontSize: 14,
          color: "text.secondary",
          opacity: 0.75,
          fontWeight: 500,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

// ---- Fraction / status card ------------------------------------------------

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
        gap: 2,
        p: 1,
        height: "100%",
        textAlign: "center",
      }}
    >
      <Box sx={{ color }}>
        <span className="material-symbols-outlined" style={{ fontSize: 30 }}>
          {icon}
        </span>
      </Box>
      <Typography
        sx={{
          fontFamily: (t) => t.typography.fontSecondaryFamily,
          fontWeight: 700,
          fontSize: 28,
          lineHeight: 1,
          letterSpacing: "-0.5px",
          color: "text.primary",
        }}
      >
        {num}
        <Box component="span" sx={{ color: "text.disabled", fontWeight: 500 }}>
          {" "}
          / {denom}
        </Box>
      </Typography>
      <Typography
        sx={{
          fontSize: 14,
          color: "text.secondary",
          opacity: 0.75,
          fontWeight: 500,
        }}
      >
        {label}
      </Typography>
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
  const theme = useTheme();
  const axisColor = theme.palette.text.disabled;
  const [ref, w] = useContainerWidth();
  const adapt = useAdapt();
  const pad = { t: 14, r: 14, b: 26, l: 42 };
  const iw = Math.max(120, w - pad.l - pad.r);
  const ih = height - pad.t - pad.b;
  const all = series.flatMap((s) => s.data);
  const max = Math.max(...all, 1) * 1.12;
  const n = series[0]?.data.length ?? 0;
  const step = iw / Math.max(1, n - 1);
  const path = (data: number[]) =>
    data
      .map(
        (v, i) =>
          `${i ? "L" : "M"}${(pad.l + i * step).toFixed(1)},${(
            pad.t + ih - (v / max) * ih
          ).toFixed(1)}`,
      )
      .join(" ");
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <Box ref={ref} sx={{ width: "100%" }}>
      <svg width={w} height={height} style={{ display: "block" }}>
        {ticks.map((p) => (
          <line
            key={p}
            x1={pad.l}
            x2={pad.l + iw}
            y1={pad.t + ih - p * ih}
            y2={pad.t + ih - p * ih}
            stroke={GRID}
            strokeWidth={1}
            strokeDasharray={p ? "3 3" : ""}
          />
        ))}
        {ticks.map((p) => (
          <text
            key={"l" + p}
            x={pad.l - 8}
            y={pad.t + ih - p * ih + 4}
            textAnchor="end"
            fontFamily="Inter, sans-serif"
            fontSize="10"
            fill={axisColor}
          >
            {fmt(Math.round(max * p))}
          </text>
        ))}
        {labels.map(
          (d, i) =>
            (i % Math.ceil(n / 6) === 0 || i === n - 1) && (
              <text
                key={d + i}
                x={pad.l + i * step}
                y={height - 7}
                textAnchor="middle"
                fontFamily="Inter, sans-serif"
                fontSize="10.5"
                fill={axisColor}
              >
                {d}
              </text>
            ),
        )}
        {series.map((s) => (
          <path
            key={s.name}
            d={path(s.data)}
            fill="none"
            stroke={adapt(s.color)}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {series.flatMap((s) =>
          s.data.map((v, i) => (
            <circle
              key={s.name + i}
              cx={pad.l + i * step}
              cy={pad.t + ih - (v / max) * ih}
              r="2.4"
              fill={adapt(s.color)}
            />
          )),
        )}
      </svg>
    </Box>
  );
}

// ---- Vertical bar chart (optionally stacked) ------------------------------

export function BarChart({
  categories,
  stacks,
  height = 250,
}: {
  categories: string[];
  stacks: StackedSeries[];
  height?: number;
}) {
  const theme = useTheme();
  const axisColor = theme.palette.text.disabled;
  const textColor = theme.palette.text.primary;
  const [ref, w] = useContainerWidth();
  const pad = { t: 16, r: 12, b: 30, l: 38 };
  const iw = Math.max(120, w - pad.l - pad.r);
  const ih = height - pad.t - pad.b;
  const totals = categories.map((_, ci) =>
    stacks.reduce((s, st) => s + (st.data[ci] ?? 0), 0),
  );
  const max = Math.max(...totals, 1) * 1.15;
  const slot = iw / categories.length;
  const bw = Math.min(46, slot * 0.6);

  return (
    <Box ref={ref} sx={{ width: "100%" }}>
      <svg width={w} height={height} style={{ display: "block" }}>
        {[0, 0.25, 0.5, 0.75, 1].map((p) => (
          <line
            key={p}
            x1={pad.l}
            x2={pad.l + iw}
            y1={pad.t + ih - p * ih}
            y2={pad.t + ih - p * ih}
            stroke={GRID}
            strokeWidth={1}
            strokeDasharray={p ? "3 3" : ""}
          />
        ))}
        {[0, 0.5, 1].map((p) => (
          <text
            key={"y" + p}
            x={pad.l - 8}
            y={pad.t + ih - p * ih + 4}
            textAnchor="end"
            fontFamily="Inter, sans-serif"
            fontSize="10"
            fill={axisColor}
          >
            {fmt(Math.round(max * p))}
          </text>
        ))}
        {categories.map((c, ci) => {
          const cx = pad.l + slot * ci + slot / 2;
          // Build each stack segment's y position in a single reduce pass to
          // avoid mutating a closure variable inside the JSX expression.
          const segs = stacks.reduce<
            { name: string; y: number; bh: number; color: string }[]
          >((acc, st) => {
            const v = st.data[ci] ?? 0;
            const bh = (v / max) * ih;
            const prevTop = acc.length ? acc[acc.length - 1].y : pad.t + ih;
            const y = prevTop - bh;
            acc.push({ name: st.name, y, bh, color: st.color });
            return acc;
          }, []);
          const topY = segs.length ? segs[segs.length - 1].y : pad.t + ih;
          return (
            <g key={c}>
              {segs.map((s) => (
                <rect
                  key={s.name}
                  x={cx - bw / 2}
                  y={s.y}
                  width={bw}
                  height={Math.max(0, s.bh)}
                  fill={s.color}
                  rx="1.5"
                />
              ))}
              <text
                x={cx}
                y={topY - 6}
                textAnchor="middle"
                fontFamily="Inter, sans-serif"
                fontWeight="600"
                fontSize="11"
                fill={textColor}
              >
                {totals[ci]}
              </text>
              <text
                x={cx}
                y={pad.t + ih + 15}
                textAnchor="middle"
                fontFamily="Inter, sans-serif"
                fontSize="10.5"
                fill={axisColor}
              >
                {c}
              </text>
            </g>
          );
        })}
      </svg>
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
  const theme = useTheme();
  const textColor = theme.palette.text.primary;
  const [ref, w] = useContainerWidth();
  const pad = { t: 8, r: 56, b: 22, l: 96 };
  const h = height || rows.length * 56 + pad.t + pad.b;
  const iw = Math.max(120, w - pad.l - pad.r);
  const ih = h - pad.t - pad.b;
  const totals = rows.map((r) =>
    segments.reduce((s, sg) => s + (r.values[sg.key] || 0), 0),
  );
  const max = Math.max(...totals, 1) * 1.05;
  const slot = ih / rows.length;
  const bh = Math.min(30, slot * 0.62);

  return (
    <Box ref={ref} sx={{ width: "100%" }}>
      <svg width={w} height={h} style={{ display: "block" }}>
        {[0, 0.25, 0.5, 0.75, 1].map((p) => (
          <line
            key={p}
            x1={pad.l + p * iw}
            x2={pad.l + p * iw}
            y1={pad.t}
            y2={pad.t + ih}
            stroke={GRID}
            strokeWidth={1}
            strokeDasharray={p ? "3 3" : ""}
          />
        ))}
        {rows.map((r, ri) => {
          const cy = pad.t + slot * ri + slot / 2;
          // Same single-pass trick as BarChart so we don't mutate a closure
          // variable inside the map.
          const segs = segments.reduce<
            { key: string; x: number; bw: number; color: string }[]
          >((acc, sg) => {
            const v = r.values[sg.key] || 0;
            const bw = (v / max) * iw;
            const prevEnd = acc.length
              ? acc[acc.length - 1].x + acc[acc.length - 1].bw
              : pad.l;
            acc.push({ key: sg.key, x: prevEnd, bw, color: sg.color });
            return acc;
          }, []);
          const totalEnd = segs.length
            ? segs[segs.length - 1].x + segs[segs.length - 1].bw
            : pad.l;
          return (
            <g key={r.label}>
              <text
                x={pad.l - 10}
                y={cy + 4}
                textAnchor="end"
                fontFamily="Inter, sans-serif"
                fontSize="11.5"
                fill={textColor}
              >
                {r.label}
              </text>
              {segs.map((s) => (
                <rect
                  key={s.key}
                  x={s.x}
                  y={cy - bh / 2}
                  width={Math.max(0, s.bw)}
                  height={bh}
                  fill={s.color}
                />
              ))}
              <text
                x={totalEnd + 8}
                y={cy + 4}
                fontFamily="Inter, sans-serif"
                fontWeight="600"
                fontSize="11"
                fill={textColor}
              >
                {fmt(totals[ri])}
              </text>
            </g>
          );
        })}
      </svg>
    </Box>
  );
}

// ---- Donut / pie ----------------------------------------------------------

export function Donut({
  slices,
  donut = false,
  size = 200,
  label,
}: {
  slices: DonutSlice[];
  donut?: boolean;
  size?: number;
  label?: string;
}) {
  const theme = useTheme();
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const R = size / 2;
  const cx = R;
  const cy = R;
  const r = R - 4;
  const ir = donut ? r * 0.58 : 0;

  // Pre-compute each arc's start/end angle in a single reduce so we never
  // mutate a closure variable inside the JSX (which the lint rule rejects).
  const arcs = slices.reduce<
    { label: string; color: string; a0: number; a1: number; frac: number }[]
  >((acc, s) => {
    const frac = s.value / total;
    const a0 = acc.length ? acc[acc.length - 1].a1 : -Math.PI / 2;
    acc.push({ label: s.label, color: s.color, a0, a1: a0 + frac * Math.PI * 2, frac });
    return acc;
  }, []);

  const arcPath = (a0: number, a1: number, frac: number) => {
    const big = frac > 0.5 ? 1 : 0;
    const p = (ang: number, rad: number): [number, number] => [
      cx + rad * Math.cos(ang),
      cy + rad * Math.sin(ang),
    ];
    const [x0, y0] = p(a0, r);
    const [x1, y1] = p(a1, r);
    if (donut) {
      const [ix1, iy1] = p(a1, ir);
      const [ix0, iy0] = p(a0, ir);
      return `M${x0},${y0} A${r},${r} 0 ${big} 1 ${x1},${y1} L${ix1},${iy1} A${ir},${ir} 0 ${big} 0 ${ix0},${iy0} Z`;
    }
    return `M${cx},${cy} L${x0},${y0} A${r},${r} 0 ${big} 1 ${x1},${y1} Z`;
  };

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
      <Box sx={{ position: "relative" }}>
        <svg width={size} height={size}>
          {arcs.map((a) => (
            <path
              key={a.label}
              d={arcPath(a.a0, a.a1, a.frac)}
              fill={a.color}
              stroke={theme.palette.background.paper}
              strokeWidth="2"
            />
          ))}
        </svg>
        {donut && label && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
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
              sx={{ color: "text.disabled" }}
            >
              {Math.round((s.value / total) * 100)}%
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ---- Legend (used in widget header) ---------------------------------------

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
