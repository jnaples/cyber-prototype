// Timeline Overview report — converted from the "Timeline Overview" PDF
// template (1400px canvas). Adds a stacked daily-events bar chart, a Top
// Activities donut, a Notable panel, and per-device Active/Idle/Locked
// composition bars. Screen-only annex omitted. Light-mode (PDF-style) document.

import { Box } from "@mui/material";
import type { Theme } from "@mui/material/styles";

const TEXT = "#031625";
const TEXT2 = "rgba(3,22,37,.62)";
const TEXT3 = "rgba(3,22,37,.45)";
const PRIMARY = "#3527fd";
const DIVIDER = "rgba(3,22,37,.12)";
const TRACK = "#edf0f6";
const C = {
  web: "#238cd2",
  app: "#7b3ff2",
  stream: "#0f8a80",
  active: "#3527fd",
  idle: "#ce008e",
  lock: "#c3cad8",
};

const montserrat = (theme: Theme) => theme.typography.fontSecondaryFamily;

// Stacked daily events: [x, [webY, webH], [appY, appH], [streamY, streamH]].
const EVENTS: [number, [number, number], [number, number], [number, number]][] = [
  [63.0, [292.4, 35.6], [270.7, 21.7], [250.5, 20.2]],
  [102.6, [285.4, 42.6], [259.5, 25.9], [235.5, 24.0]],
  [142.2, [275.7, 52.3], [243.8, 31.9], [214.2, 29.6]],
  [181.8, [288.9, 39.1], [265.1, 23.8], [243.0, 22.1]],
  [221.4, [319.6, 8.4], [315.1, 4.5], [313.0, 2.1]],
  [261.0, [325.2, 2.8], [323.7, 1.5], [323.0, 0.7]],
  [300.6, [272.8, 55.2], [239.2, 33.6], [208.0, 31.2]],
  [340.2, [268.2, 59.8], [231.8, 36.4], [198.0, 33.8]],
  [379.8, [260.1, 67.9], [218.8, 41.3], [180.5, 38.3]],
  [419.4, [242.2, 85.8], [191.5, 50.7], [133.0, 58.5]],
  [459.0, [208.1, 119.9], [137.2, 70.9], [55.5, 81.7]],
  [498.6, [309.8, 18.2], [300.0, 9.8], [295.5, 4.5]],
  [538.2, [322.4, 5.6], [319.4, 3.0], [318.0, 1.4]],
  [577.8, [251.0, 77.0], [204.1, 46.9], [160.5, 43.6]],
  [617.4, [263.6, 64.4], [224.4, 39.2], [188.0, 36.4]],
  [657.0, [261.3, 66.7], [220.7, 40.6], [183.0, 37.7]],
  [696.6, [271.6, 56.4], [237.3, 34.3], [205.5, 31.8]],
  [736.2, [265.3, 62.7], [227.1, 38.2], [191.8, 35.3]],
  [775.8, [306.3, 21.7], [294.7, 11.6], [289.2, 5.5]],
  [815.4, [318.2, 9.8], [313.0, 5.2], [310.5, 2.5]],
  [855.0, [260.1, 67.9], [218.8, 41.3], [180.5, 38.3]],
  [894.6, [255.5, 72.5], [211.4, 44.1], [170.5, 40.9]],
  [934.2, [273.9, 54.1], [241.0, 32.9], [210.5, 30.5]],
  [973.8, [263.6, 64.4], [224.4, 39.2], [188.0, 36.4]],
  [1013.4, [275.7, 52.3], [243.8, 31.9], [214.2, 29.6]],
  [1053.0, [312.6, 15.4], [304.4, 8.2], [300.5, 3.9]],
  [1092.6, [323.8, 4.2], [321.6, 2.2], [320.5, 1.1]],
  [1132.2, [262.5, 65.5], [222.6, 39.9], [185.5, 37.1]],
  [1171.8, [263.6, 64.4], [224.4, 39.2], [188.0, 36.4]],
  [1211.4, [271.1, 56.9], [236.4, 34.7], [204.3, 32.1]],
];

const DONUT_ARCS = [
  { stroke: "#3527fd", dash: "162.29 565.49", offset: -0.0 },
  { stroke: "#7b3ff2", dash: "118.75 565.49", offset: -162.29 },
  { stroke: "#0f8a80", dash: "109.14 565.49", offset: -281.04 },
  { stroke: "#238cd2", dash: "59.38 565.49", offset: -390.18 },
  { stroke: "#ce008e", dash: "48.07 565.49", offset: -449.56 },
  { stroke: "#c3cad8", dash: "67.86 565.49", offset: -497.63 },
];

const DONUT_LEGEND = [
  { c: "#3527fd", nm: "portal.zorustech.com", typ: "Website", val: "72h 59m", sub: "(28.7%)" },
  { c: "#7b3ff2", nm: "Slack", typ: "Application", val: "53h 30m", sub: "(21.0%)" },
  { c: "#0f8a80", nm: "Google Chrome", typ: "Streaming", val: "49h 10m", sub: "(19.3%)" },
  { c: "#238cd2", nm: "Google Chrome", typ: "Application", val: "26h 45m", sub: "(10.5%)" },
  { c: "#ce008e", nm: "dnsfilter.atlassian.net", typ: "Website", val: "21h 33m", sub: "(8.5%)" },
  { c: "#c3cad8", nm: "Other", typ: "163 activities", val: "30h 33m", sub: "(12.0%)" },
];

const NOTABLE = [
  { k: "Busiest hour of day", v: "10 AM · 55 min avg active" },
  { k: "Midday dip", v: "12 PM · 30 min avg active" },
  { k: "Most active device", v: "z-ktrojanowski · 79h 4m" },
  { k: "Streaming share of active time", v: "26% · 65h 46m" },
  { k: "Locked share of tracked time", v: "33% · 145h 14m" },
];

type Device = {
  nm: string;
  tracked: string;
  aw: number;
  iw: number;
  lw: number;
  active: string;
  activeP: string;
  idle: string;
  idleP: string;
  lock: string;
  lockP: string;
  streaming: string;
};

const DEVICES: Device[] = [
  { nm: "z-ktrojanowski", tracked: "130h 30m tracked", aw: 60.6, iw: 8.7, lw: 30.7, active: "79h 4m", activeP: "60%", idle: "11h 20m", idleP: "9%", lock: "40h 6m", lockP: "31%", streaming: "22h 30m" },
  { nm: "YOGA-BSMITH", tracked: "96h 0m tracked", aw: 57.9, iw: 10.2, lw: 31.9, active: "55h 34m", activeP: "58%", idle: "9h 50m", idleP: "10%", lock: "30h 36m", lockP: "32%", streaming: "18h 40m" },
  { nm: "px-home", tracked: "62h 30m tracked", aw: 56.4, iw: 9.7, lw: 33.9, active: "35h 16m", activeP: "56%", idle: "6h 4m", idleP: "10%", lock: "21h 10m", lockP: "34%", streaming: "9h 12m" },
  { nm: "LOWES-LAPTOP-04", tracked: "41h 30m tracked", aw: 54.6, iw: 10.7, lw: 34.7, active: "22h 40m", activeP: "54%", idle: "4h 26m", idleP: "11%", lock: "14h 24m", lockP: "35%", streaming: "6h 30m" },
  { nm: "HD-LAPTOP-24", tracked: "33h 0m tracked", aw: 55.2, iw: 10.8, lw: 34, active: "18h 12m", activeP: "55%", idle: "3h 34m", idleP: "11%", lock: "11h 14m", lockP: "34%", streaming: "4h 5m" },
  { nm: "smith-j", tracked: "27h 0m tracked", aw: 55.2, iw: 11, lw: 33.8, active: "14h 55m", activeP: "55%", idle: "2h 58m", idleP: "11%", lock: "9h 7m", lockP: "34%", streaming: "2h 49m" },
  { nm: "CC-LAPTOP-3", tracked: "20h 0m tracked", aw: 55.7, iw: 10.9, lw: 33.4, active: "11h 8m", activeP: "56%", idle: "2h 11m", idleP: "11%", lock: "6h 41m", lockP: "33%", streaming: "1h 20m" },
  { nm: "LOWES-DESKTOP-11", tracked: "16h 0m tracked", aw: 53.4, iw: 10.3, lw: 36.3, active: "8h 33m", activeP: "54%", idle: "1h 39m", idleP: "10%", lock: "5h 48m", lockP: "36%", streaming: "28m" },
  { nm: "LOWES-SURFACE-09", tracked: "10h 30m tracked", aw: 55.1, iw: 10.2, lw: 34.8, active: "5h 47m", activeP: "55%", idle: "1h 4m", idleP: "10%", lock: "3h 39m", lockP: "35%", streaming: "9m" },
  { nm: "LOWES-MACBOOK-07", tracked: "6h 30m tracked", aw: 51.5, iw: 10.3, lw: 38.2, active: "3h 21m", activeP: "52%", idle: "40m", idleP: "10%", lock: "2h 29m", lockP: "38%", streaming: "3m" },
];

function SecHead({ color, title, sub }: { color: string; title: string; sub: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: "12px", mb: "24px" }}>
      <Box sx={{ width: 14, height: 14, borderRadius: "4px", mt: "5px", flex: "none", bgcolor: color }} />
      <Box>
        <Box component="h2" sx={{ m: 0, fontSize: 19, fontWeight: 700, letterSpacing: "1.8px", textTransform: "uppercase" }}>
          {title}
        </Box>
        <Box component="p" sx={{ m: 0, fontSize: 16, color: TEXT2, mt: "4px" }}>
          {sub}
        </Box>
      </Box>
    </Box>
  );
}

function LegendSquare({ color, label }: { color: string; label: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <Box sx={{ width: 16, height: 16, borderRadius: "4px", bgcolor: color }} />
      {label}
    </Box>
  );
}

function Dot({ color }: { color: string }) {
  return (
    <Box component="i" sx={{ display: "inline-block", width: 10, height: 10, borderRadius: "3px", mr: "7px", verticalAlign: "1px", bgcolor: color }} />
  );
}

export default function TimelineOverviewReport() {
  return (
    <Box
      data-mui-color-scheme="light"
      sx={{
        width: "100%",
        maxWidth: 1400,
        mx: "auto",
        bgcolor: "#ffffff",
        color: TEXT,
        border: `1px solid ${DIVIDER}`,
        borderRadius: 1,
        p: "64px 64px 48px",
        fontFamily: "'Inter Variable', sans-serif",
      }}
    >
      {/* Masthead */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", pb: "24px" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "6px",
              border: `2px dashed ${TEXT3}`,
              color: TEXT3,
              fontFamily: montserrat,
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: "1px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            LOGO
          </Box>
          <Box>
            <Box sx={{ fontFamily: montserrat, fontWeight: 600, fontSize: 26 }}>Brightwave IT</Box>
            <Box sx={{ fontSize: 16, color: TEXT2, mt: "2px" }}>Managed security reporting</Box>
          </Box>
        </Box>
        <Box sx={{ textAlign: "right" }}>
          <Box sx={{ fontSize: 16, letterSpacing: "1.5px", textTransform: "uppercase", color: TEXT2, fontWeight: 600 }}>
            Reporting period
          </Box>
          <Box sx={{ fontSize: 20, fontWeight: 600, mt: "4px" }}>Jun 23 – Jul 22, 2026</Box>
        </Box>
      </Box>
      <Box sx={{ height: "3px", bgcolor: TEXT, mb: "40px" }} />

      {/* Title block */}
      <Box sx={{ mb: "48px" }}>
        <Box sx={{ fontSize: 17, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: PRIMARY }}>
          CyberSight · Monthly report
        </Box>
        <Box component="h1" sx={{ fontFamily: montserrat, fontWeight: 600, fontSize: 44, lineHeight: 1.2, m: "10px 0 12px" }}>
          Timeline Overview
        </Box>
        <Box sx={{ fontSize: 21, color: TEXT2 }}>
          Prepared for Acme Manufacturing · 30-day device activity composition
        </Box>
      </Box>

      {/* KPI band */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px", mb: "64px" }}>
        {[
          { num: "254h 30m", cap: "Active time" },
          { num: "65h 46m", cap: "Streaming time" },
          { num: "43h 46m", cap: "Idle time" },
          { num: "145h 14m", cap: "Machine locked" },
        ].map((k) => (
          <Box key={k.cap} sx={{ border: `1px solid ${DIVIDER}`, borderRadius: "6px", p: "28px 32px 24px", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <Box sx={{ fontFamily: montserrat, fontWeight: 600, fontSize: 52, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
              {k.num}
            </Box>
            <Box sx={{ fontSize: 16, fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", color: TEXT2, mt: "12px" }}>
              {k.cap}
            </Box>
          </Box>
        ))}
      </Box>

      {/* Events — stacked daily bars */}
      <Box sx={{ mb: "72px" }}>
        <SecHead
          color={C.active}
          title="Events"
          sub="Daily active time by activity type · totals match the Activity Overview trend"
        />
        <Box
          component="svg"
          viewBox="0 0 1272 372"
          sx={{
            width: "100%",
            height: "auto",
            display: "block",
            "& text": { fontFamily: "'Inter Variable', sans-serif", fill: TEXT2, fontSize: "16px" },
            "& .peak": { fill: TEXT, fontWeight: 600 },
          }}
        >
          <g stroke="rgba(3,22,37,.10)" strokeWidth="1">
            <line x1="56" y1="28" x2="1245" y2="28" />
            <line x1="56" y1="103" x2="1245" y2="103" />
            <line x1="56" y1="178" x2="1245" y2="178" />
            <line x1="56" y1="253" x2="1245" y2="253" />
            <line x1="56" y1="328" x2="1245" y2="328" />
          </g>
          <g textAnchor="end">
            <text x="42" y="333">0</text>
            <text x="42" y="258">6</text>
            <text x="42" y="183">12</text>
            <text x="42" y="108">18</text>
            <text x="42" y="33">24</text>
          </g>
          <text x="56" y="12" style={{ fontSize: "14px", letterSpacing: "1.5px" }} textAnchor="start">
            HOURS
          </text>
          {EVENTS.map(([x, w, a, s], i) => (
            <g key={i}>
              <rect x={x} y={w[0]} width="26" height={w[1]} fill={C.web} />
              <rect x={x} y={a[0]} width="26" height={a[1]} fill={C.app} />
              <rect x={x} y={s[0]} width="26" height={s[1]} fill={C.stream} />
            </g>
          ))}
          <text className="peak" x="472" y="44" textAnchor="middle">
            Peak 21.8h · Fri Jul 3
          </text>
          <g textAnchor="middle">
            <text x="76" y="356">Jun 23</text>
            <text x="314" y="356">Jun 29</text>
            <text x="591" y="356">Jul 6</text>
            <text x="868" y="356">Jul 13</text>
            <text x="1145" y="356">Jul 20</text>
          </g>
        </Box>
        <Box sx={{ display: "flex", gap: "32px", mt: "16px", fontSize: 16, color: TEXT2 }}>
          <LegendSquare color={C.web} label="Websites" />
          <LegendSquare color={C.app} label="Applications" />
          <LegendSquare color={C.stream} label="Streaming" />
        </Box>
      </Box>

      {/* Top activities + Notable */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", mb: "72px" }}>
        <Box>
          <SecHead
            color={C.app}
            title="Top activities"
            sub="Top 5 of 168 activities · share of 254h 30m active time"
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: "32px" }}>
            <Box component="svg" viewBox="0 0 260 260" sx={{ flex: "none", width: 260, height: 260 }}>
              {DONUT_ARCS.map((arc, i) => (
                <circle
                  key={i}
                  r="90"
                  cx="130"
                  cy="130"
                  fill="none"
                  stroke={arc.stroke}
                  strokeWidth="44"
                  strokeDasharray={arc.dash}
                  strokeDashoffset={arc.offset}
                  transform="rotate(-90 130 130)"
                />
              ))}
              <text x="130" y="126" textAnchor="middle" style={{ font: "600 30px 'Montserrat Variable',sans-serif" }} fill={TEXT}>
                254h 30m
              </text>
              <text x="130" y="152" textAnchor="middle" style={{ font: "600 13px 'Inter Variable',sans-serif", letterSpacing: "1.5px" }} fill={TEXT2}>
                ACTIVE TIME
              </text>
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {DONUT_LEGEND.map((d, i) => (
                <Box
                  key={i}
                  sx={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "8px",
                    py: "9px",
                    borderBottom: i < DONUT_LEGEND.length - 1 ? `1px solid ${DIVIDER}` : "none",
                  }}
                >
                  <Dot color={d.c} />
                  <Box sx={{ flex: 1, fontSize: 18, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>
                    {d.nm} <Box component="span" sx={{ fontSize: 16, color: TEXT2, fontWeight: 400 }}>· {d.typ}</Box>
                  </Box>
                  <Box sx={{ fontSize: 17, fontWeight: 600, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                    {d.val} <Box component="em" sx={{ fontStyle: "normal", fontWeight: 400, color: TEXT2, fontSize: 16 }}>{d.sub}</Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        <Box>
          <SecHead color={PRIMARY} title="Notable this period" sub="Called out from the timeline data" />
          <Box sx={{ border: `1px solid ${DIVIDER}`, borderRadius: "6px", px: "28px", py: "8px" }}>
            {NOTABLE.map((n, i) => (
              <Box
                key={n.k}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: "16px",
                  py: "18px",
                  borderBottom: i < NOTABLE.length - 1 ? `1px solid ${DIVIDER}` : "none",
                }}
              >
                <Box sx={{ fontSize: 17, color: TEXT2 }}>{n.k}</Box>
                <Box sx={{ fontSize: 19, fontWeight: 600, textAlign: "right", whiteSpace: "nowrap" }}>{n.v}</Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Device time composition */}
      <Box sx={{ mb: "8px" }}>
        <SecHead
          color={C.idle}
          title="Device time composition"
          sub="All 10 monitored devices · share of tracked time, Jun 23 – Jul 22"
        />
        <Box sx={{ display: "flex", gap: "32px", mb: "28px", fontSize: 16, color: TEXT2 }}>
          <LegendSquare color={C.active} label="Active" />
          <LegendSquare color={C.idle} label="Idle" />
          <LegendSquare color={C.lock} label="Machine locked" />
        </Box>

        {DEVICES.map((d) => (
          <Box key={d.nm} sx={{ mb: "32px" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: "8px" }}>
              <Box sx={{ fontSize: 20, fontWeight: 600 }}>{d.nm}</Box>
              <Box sx={{ fontSize: 17, color: TEXT2, fontVariantNumeric: "tabular-nums" }}>{d.tracked}</Box>
            </Box>
            <Box sx={{ display: "flex", height: 18, borderRadius: "6px", overflow: "hidden", bgcolor: TRACK }}>
              <Box sx={{ width: `${d.aw}%`, bgcolor: C.active }} />
              <Box sx={{ width: `${d.iw}%`, bgcolor: C.idle }} />
              <Box sx={{ width: `${d.lw}%`, bgcolor: C.lock }} />
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: "6px 28px", mt: "9px", fontSize: 16, color: TEXT2, fontVariantNumeric: "tabular-nums" }}>
              <Box component="span">
                <Dot color={C.active} />Active <Box component="b" sx={{ color: TEXT, fontWeight: 600 }}>{d.active}</Box> ({d.activeP})
              </Box>
              <Box component="span">
                <Dot color={C.idle} />Idle <Box component="b" sx={{ color: TEXT, fontWeight: 600 }}>{d.idle}</Box> ({d.idleP})
              </Box>
              <Box component="span">
                <Dot color={C.lock} />Locked <Box component="b" sx={{ color: TEXT, fontWeight: 600 }}>{d.lock}</Box> ({d.lockP})
              </Box>
              <Box component="span">
                incl. <Box component="b" sx={{ color: TEXT, fontWeight: 600 }}>{d.streaming}</Box> streaming
              </Box>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          borderTop: `1px solid ${DIVIDER}`,
          mt: "8px",
          pt: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <Box>
          <Box sx={{ fontSize: 17, fontWeight: 600 }}>Prepared by Brightwave IT</Box>
        </Box>
        <Box sx={{ fontSize: 16, color: TEXT2, textAlign: "right" }}>
          Generated Jul 23, 2026 · Data period Jun 23 – Jul 22, 2026
        </Box>
      </Box>
    </Box>
  );
}
