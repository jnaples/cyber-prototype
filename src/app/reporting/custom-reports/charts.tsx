// Minimal SVG charts for the Custom Reports preview. Colors come in as
// CSS-var strings (e.g. var(--dnsf-palette-primary-main)) so they track the
// theme automatically.

import { Box, Typography } from "@mui/material";

const fmt = (n: number) => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

type Series = { name: string; color: string; values: number[] };

const W = 720;
const H = 280;
const PAD = { t: 16, r: 24, b: 32, l: 48 };

export function LineChart({
  data,
}: {
  data: { labels: string[]; series: Series[] };
}) {
  const { labels, series } = data;
  const max = Math.max(...series.flatMap((s) => s.values), 1);
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const x = (i: number) =>
    PAD.l + (i / Math.max(labels.length - 1, 1)) * innerW;
  const y = (v: number) => PAD.t + innerH - (v / max) * innerH;
  return (
    <Box component="svg" viewBox={`0 0 ${W} ${H}`} sx={{ width: "100%", height: "auto" }}>
      {/* gridlines */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <line
          key={t}
          x1={PAD.l}
          x2={W - PAD.r}
          y1={PAD.t + innerH - t * innerH}
          y2={PAD.t + innerH - t * innerH}
          stroke="var(--dnsf-palette-divider)"
        />
      ))}
      {/* y labels */}
      {[0, 0.5, 1].map((t) => (
        <text
          key={t}
          x={PAD.l - 8}
          y={PAD.t + innerH - t * innerH}
          textAnchor="end"
          dominantBaseline="middle"
          fontSize={11}
          fill="var(--dnsf-palette-text-secondary)"
        >
          {fmt(max * t)}
        </text>
      ))}
      {/* x labels */}
      {labels.map((l, i) => (
        <text
          key={l}
          x={x(i)}
          y={H - 10}
          textAnchor="middle"
          fontSize={11}
          fill="var(--dnsf-palette-text-secondary)"
        >
          {l}
        </text>
      ))}
      {/* lines */}
      {series.map((s) => (
        <polyline
          key={s.name}
          fill="none"
          stroke={s.color}
          strokeWidth={2}
          points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")}
        />
      ))}
      {/* points */}
      {series.flatMap((s) =>
        s.values.map((v, i) => (
          <circle
            key={`${s.name}-${i}`}
            cx={x(i)}
            cy={y(v)}
            r={3}
            fill={s.color}
          />
        )),
      )}
    </Box>
  );
}

export function BarChart({
  data,
}: {
  data: { labels: string[]; series: Series[] };
}) {
  const { labels, series } = data;
  const max = Math.max(...series.flatMap((s) => s.values), 1);
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const groupW = innerW / labels.length;
  const barW = (groupW * 0.7) / series.length;
  const y = (v: number) => PAD.t + innerH - (v / max) * innerH;
  return (
    <Box component="svg" viewBox={`0 0 ${W} ${H}`} sx={{ width: "100%", height: "auto" }}>
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <line
          key={t}
          x1={PAD.l}
          x2={W - PAD.r}
          y1={PAD.t + innerH - t * innerH}
          y2={PAD.t + innerH - t * innerH}
          stroke="var(--dnsf-palette-divider)"
        />
      ))}
      {[0, 0.5, 1].map((t) => (
        <text
          key={t}
          x={PAD.l - 8}
          y={PAD.t + innerH - t * innerH}
          textAnchor="end"
          dominantBaseline="middle"
          fontSize={11}
          fill="var(--dnsf-palette-text-secondary)"
        >
          {fmt(max * t)}
        </text>
      ))}
      {labels.map((label, gi) => {
        const gx = PAD.l + gi * groupW + (groupW - barW * series.length) / 2;
        return (
          <g key={label}>
            {series.map((s, si) => {
              const v = s.values[gi];
              const bx = gx + si * barW;
              const by = y(v);
              return (
                <rect
                  key={s.name}
                  x={bx}
                  y={by}
                  width={barW - 2}
                  height={PAD.t + innerH - by}
                  fill={s.color}
                  rx={2}
                />
              );
            })}
            <text
              x={gx + (barW * series.length) / 2}
              y={H - 10}
              textAnchor="middle"
              fontSize={11}
              fill="var(--dnsf-palette-text-secondary)"
            >
              {label}
            </text>
          </g>
        );
      })}
    </Box>
  );
}

export function PieChart({
  slices,
}: {
  slices: { name: string; value: number; color: string }[];
}) {
  const total = slices.reduce((s, sl) => s + sl.value, 0) || 1;
  const cx = 140;
  const cy = 140;
  const r = 100;
  let acc = 0;
  return (
    <Box
      sx={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}
    >
      <Box component="svg" viewBox="0 0 280 280" sx={{ width: 280, height: 280, flexShrink: 0 }}>
        {slices.map((s) => {
          const start = acc / total;
          acc += s.value;
          const end = acc / total;
          const a0 = start * 2 * Math.PI - Math.PI / 2;
          const a1 = end * 2 * Math.PI - Math.PI / 2;
          const x0 = cx + r * Math.cos(a0);
          const y0 = cy + r * Math.sin(a0);
          const x1 = cx + r * Math.cos(a1);
          const y1 = cy + r * Math.sin(a1);
          const large = end - start > 0.5 ? 1 : 0;
          return (
            <path
              key={s.name}
              d={`M${cx},${cy} L${x0},${y0} A${r},${r} 0 ${large} 1 ${x1},${y1} Z`}
              fill={s.color}
              stroke="var(--dnsf-palette-background-paper)"
              strokeWidth={2}
            />
          );
        })}
        {/* donut hole */}
        <circle cx={cx} cy={cy} r={50} fill="var(--dnsf-palette-background-paper)" />
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, flex: 1, minWidth: 0 }}>
        {slices.map((s) => (
          <Box
            key={s.name}
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "999px",
                bgcolor: s.color,
                flexShrink: 0,
              }}
            />
            <Typography variant="body2" sx={{ flex: 1 }}>
              {s.name}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {fmt(s.value)}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export function Legend({ series }: { series: Series[] }) {
  return (
    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
      {series.map((s) => (
        <Box
          key={s.name}
          sx={{ display: "flex", alignItems: "center", gap: 0.75, fontSize: 12.5 }}
        >
          <Box sx={{ width: 10, height: 10, borderRadius: "999px", bgcolor: s.color }} />
          <Box sx={{ color: "text.secondary" }}>{s.name}</Box>
        </Box>
      ))}
    </Box>
  );
}

export { fmt };
