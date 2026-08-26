// Activity Timeline report — converted from the "Timeline" PDF
// template (1400px canvas). Adds a stacked daily-events bar chart, a Top
// Activities donut, a Notable panel, and per-device Active/Idle/Locked
// composition bars. Screen-only annex omitted. Light-mode (PDF-style) document.

import ComputerOutlinedIcon from "@mui/icons-material/ComputerOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlined";
import { Box } from "@mui/material";
import type { Theme } from "@mui/material/styles";

import { ReportLogo } from "../report-logo";

const TEXT = "#031625";
const TEXT2 = "rgba(3,22,37,.62)";
const DIVIDER = "rgba(3,22,37,.12)";
// The page's own edge — lighter than the rules inside it.
const PAGE_BORDER = "#E5E5EC";
const C = {
  web: "#238cd2",
  app: "#7b3ff2",
  stream: "#0f8a80",
  active: "#3527fd",
  idle: "#ce008e",
  lock: "#c3cad8",
};

const montserrat = (theme: Theme) => theme.typography.fontSecondaryFamily;

// Timeline (device time composition) — shared hour axis + segment colors.
const STREAM = "#05C6C6"; // teal[500] — streaming segment
const AXIS_MAX_MIN = 8100; // 135h — largest device rounded up
const AXIS_TICKS = [0, 900, 1800, 2700, 3600, 4500, 5400, 6300, 7200, 8100];
// Format whole minutes as "Xh Ym" (pure — no Date).
const fmtMin = (m: number) => {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return h > 0 ? `${h}h ${mm}m` : `${mm}m`;
};

// Stacked daily events: [x, [webY, webH], [appY, appH], [streamY, streamH]].
const EVENTS: [number, [number, number], [number, number], [number, number]][] =
  [
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

// Arc lengths for a radius-112 donut (circumference 703.72).
const DONUT_ARCS = [
  { stroke: "#3527fd", dash: "201.96 703.72", offset: -0.0 },
  { stroke: "#7b3ff2", dash: "147.78 703.72", offset: -201.96 },
  { stroke: "#0f8a80", dash: "135.82 703.72", offset: -349.74 },
  { stroke: "#238cd2", dash: "73.90 703.72", offset: -485.56 },
  { stroke: "#ce008e", dash: "59.82 703.72", offset: -559.46 },
  { stroke: "#c3cad8", dash: "84.45 703.72", offset: -619.28 },
];

const DONUT_LEGEND = [
  {
    c: "#3527fd",
    nm: "portal.zorustech.com",
    typ: "Website",
    val: "72h 59m",
    sub: "(28.7%)",
  },
  {
    c: "#7b3ff2",
    nm: "Slack",
    typ: "Application",
    val: "53h 30m",
    sub: "(21.0%)",
  },
  {
    c: "#0f8a80",
    nm: "Google Chrome",
    typ: "Streaming",
    val: "49h 10m",
    sub: "(19.3%)",
  },
  {
    c: "#238cd2",
    nm: "Google Chrome",
    typ: "Application",
    val: "26h 45m",
    sub: "(10.5%)",
  },
  {
    c: "#ce008e",
    nm: "dnsfilter.atlassian.net",
    typ: "Website",
    val: "21h 33m",
    sub: "(8.5%)",
  },
  {
    c: "#c3cad8",
    nm: "Other",
    typ: "163 activities",
    val: "30h 33m",
    sub: "(12.0%)",
  },
];

// Per-device timeline. Segment values are whole minutes; the bar fills against
// AXIS_MAX_MIN so devices are comparable on a shared hour axis. Active is the
// non-streaming portion (streaming is its own segment).
type Device = {
  nm: string;
  user: string;
  activeMin: number;
  streamingMin: number;
  idleMin: number;
  lockMin: number;
};

const DEVICES: Device[] = [
  {
    nm: "z-ktrojanowski",
    user: "Kaya Trojanowski",
    activeMin: 3394,
    streamingMin: 1350,
    idleMin: 680,
    lockMin: 2406,
  },
  {
    nm: "YOGA-BSMITH",
    user: "Bob Smith",
    activeMin: 2214,
    streamingMin: 1120,
    idleMin: 590,
    lockMin: 1836,
  },
  {
    nm: "px-home",
    user: "Priya Xu",
    activeMin: 1564,
    streamingMin: 552,
    idleMin: 364,
    lockMin: 1270,
  },
  {
    nm: "LOWES-LAPTOP-04",
    user: "Dana Lowe",
    activeMin: 970,
    streamingMin: 390,
    idleMin: 266,
    lockMin: 864,
  },
  {
    nm: "HD-LAPTOP-24",
    user: "Hiro Davis",
    activeMin: 847,
    streamingMin: 245,
    idleMin: 214,
    lockMin: 674,
  },
  {
    nm: "smith-j",
    user: "Jamie Smith",
    activeMin: 726,
    streamingMin: 169,
    idleMin: 178,
    lockMin: 547,
  },
  {
    nm: "CC-LAPTOP-3",
    user: "Chris Cole",
    activeMin: 588,
    streamingMin: 80,
    idleMin: 131,
    lockMin: 401,
  },
  {
    nm: "LOWES-DESKTOP-11",
    user: "Morgan Reed",
    activeMin: 485,
    streamingMin: 28,
    idleMin: 99,
    lockMin: 348,
  },
  {
    nm: "LOWES-SURFACE-09",
    user: "Sam Ortiz",
    activeMin: 338,
    streamingMin: 9,
    idleMin: 64,
    lockMin: 219,
  },
  {
    nm: "LOWES-MACBOOK-07",
    user: "Alex Kim",
    activeMin: 198,
    streamingMin: 3,
    idleMin: 40,
    lockMin: 149,
  },
  {
    nm: "HD-LAPTOP-31",
    user: "Priya Natarajan",
    activeMin: 176,
    streamingMin: 21,
    idleMin: 52,
    lockMin: 174,
  },
  {
    nm: "CC-LAPTOP-8",
    user: "Devon Brooks",
    activeMin: 154,
    streamingMin: 6,
    idleMin: 38,
    lockMin: 131,
  },
  {
    nm: "px-desk",
    user: "Rowan Patel",
    activeMin: 121,
    streamingMin: 14,
    idleMin: 29,
    lockMin: 108,
  },
  {
    nm: "LOWES-LAPTOP-17",
    user: "Casey Nguyen",
    activeMin: 98,
    streamingMin: 2,
    idleMin: 24,
    lockMin: 96,
  },
  {
    nm: "YOGA-TWALSH",
    user: "Taylor Walsh",
    activeMin: 63,
    streamingMin: 8,
    idleMin: 17,
    lockMin: 71,
  },
];

function SecHead({
  title,
  sub,
}: {
  color?: string;
  title: string;
  sub?: string;
}) {
  return (
    <Box sx={{ mb: "24px" }}>
      <Box
        component="h2"
        sx={{
          m: 0,
          fontFamily: montserrat,
          fontSize: 24,
          fontWeight: 600,
          textTransform: "capitalize",
        }}
      >
        {title}
      </Box>
      {sub && (
        <Box component="p" sx={{ m: 0, fontSize: 16, color: TEXT2, mt: "4px" }}>
          {sub}
        </Box>
      )}
    </Box>
  );
}

function LegendSquare({ color, label }: { color: string; label: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <Box
        sx={{ width: 16, height: 16, borderRadius: "999px", bgcolor: color }}
      />
      {label}
    </Box>
  );
}

function Dot({ color }: { color: string }) {
  return (
    <Box
      component="i"
      sx={{
        display: "inline-block",
        width: 10,
        height: 10,
        borderRadius: "999px",
        mr: "7px",
        verticalAlign: "1px",
        bgcolor: color,
      }}
    />
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
        border: `1px solid ${PAGE_BORDER}`,
        boxShadow: (theme) => theme.shadows[3],
        p: "64px 64px 48px",
        fontFamily: "'Inter Variable', sans-serif",
      }}
    >
      {/* Masthead */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          pb: "24px",
        }}
      >
        <Box>
          <Box sx={{ fontFamily: montserrat, fontWeight: 600, fontSize: 26 }}>
            Brightwave IT
          </Box>
          <Box sx={{ mt: "16px" }}>
            <Box
              sx={{
                fontSize: 16,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                color: TEXT2,
                fontWeight: 600,
              }}
            >
              Monthly report
            </Box>
            <Box sx={{ fontSize: 20, fontWeight: 600, mt: "4px" }}>
              Jul 1 – Jul 31, 2026
            </Box>
          </Box>
        </Box>
        <ReportLogo />
      </Box>
      <Box sx={{ height: "2px", bgcolor: TEXT, mb: "40px" }} />

      {/* Title block */}
      <Box sx={{ mb: "48px" }}>
        <Box
          component="h1"
          sx={{
            fontFamily: montserrat,
            fontWeight: 600,
            fontSize: 44,
            lineHeight: 1.2,
            m: "8px 0",
          }}
        >
          Activity Timeline
        </Box>
        <Box sx={{ fontSize: 21, color: TEXT2 }}>Acme Manufacturing</Box>
      </Box>

      {/* KPI band */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "24px",
          mb: "64px",
        }}
      >
        {[
          { num: "254h 30m", cap: "Active time" },
          { num: "65h 46m", cap: "Streaming time" },
          { num: "43h 46m", cap: "Idle time" },
          { num: "145h 14m", cap: "Machine locked" },
        ].map((k) => (
          <Box
            key={k.cap}
            sx={{
              border: `1px solid ${DIVIDER}`,
              borderRadius: "6px",
              p: "28px 32px 24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
            }}
          >
            <Box
              sx={{
                fontFamily: montserrat,
                fontWeight: 600,
                fontSize: 40,
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
                whiteSpace: "nowrap",
              }}
            >
              {k.num}
            </Box>
            <Box
              sx={{
                fontSize: 16,
                fontWeight: 600,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                color: TEXT2,
                mt: "12px",
              }}
            >
              {k.cap}
            </Box>
          </Box>
        ))}
      </Box>

      {/* Events — stacked daily bars */}
      <Box sx={{ mb: "72px" }}>
        <SecHead color={C.active} title="Events" />
        <Box
          component="svg"
          viewBox="-34 0 1306 402"
          sx={{
            width: "100%",
            height: "auto",
            display: "block",
            "& text": {
              fontFamily: "'Inter Variable', sans-serif",
              fill: TEXT2,
              fontSize: "16px",
            },
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
            <text x="42" y="333">
              0
            </text>
            <text x="42" y="258">
              150
            </text>
            <text x="42" y="183">
              300
            </text>
            <text x="42" y="108">
              450
            </text>
            <text x="42" y="33">
              600
            </text>
          </g>
          {/* Axis titles: the unit reads up the left edge, the dimension
              sits under the tick labels. */}
          <text
            transform="rotate(-90 -12 178)"
            x="-12"
            y="178"
            style={{ fontSize: "14px", letterSpacing: "1.5px" }}
            textAnchor="middle"
          >
            EVENTS
          </text>
          <text
            x="650"
            y="394"
            style={{ fontSize: "14px", letterSpacing: "1.5px" }}
            textAnchor="middle"
          >
            DATE
          </text>
          {EVENTS.map(([x, w, a, s], i) => (
            <g key={i}>
              <rect x={x} y={w[0]} width="26" height={w[1]} fill={C.web} />
              <rect x={x} y={a[0]} width="26" height={a[1]} fill={C.app} />
              <rect x={x} y={s[0]} width="26" height={s[1]} fill={C.stream} />
            </g>
          ))}
          <g textAnchor="middle">
            <text x="76" y="356">
              Jul 1
            </text>
            <text x="314" y="356">
              Jul 7
            </text>
            <text x="591" y="356">
              Jul 14
            </text>
            <text x="868" y="356">
              Jul 21
            </text>
            <text x="1145" y="356">
              Jul 28
            </text>
          </g>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: "32px",
            mt: "16px",
            fontSize: 16,
            color: TEXT2,
          }}
        >
          <LegendSquare color={C.web} label="Websites" />
          <LegendSquare color={C.app} label="Applications" />
          <LegendSquare color={C.stream} label="Streaming" />
        </Box>
      </Box>

      {/* Activity breakdown */}
      <Box sx={{ mb: "72px" }}>
        <Box>
          <SecHead color={C.app} title="Activity Breakdown" />
          <Box sx={{ display: "flex", alignItems: "center", gap: "48px" }}>
            <Box
              component="svg"
              viewBox="0 0 300 300"
              sx={{ flex: "none", width: 300, height: 300 }}
            >
              {DONUT_ARCS.map((arc, i) => (
                <circle
                  key={i}
                  r="112"
                  cx="150"
                  cy="150"
                  fill="none"
                  stroke={arc.stroke}
                  strokeWidth="44"
                  strokeDasharray={arc.dash}
                  strokeDashoffset={arc.offset}
                  transform="rotate(-90 150 150)"
                />
              ))}
              <text
                x="150"
                y="146"
                textAnchor="middle"
                style={{ font: "600 24px 'Montserrat Variable',sans-serif" }}
                fill={TEXT}
              >
                254h 30m
              </text>
              <text
                x="150"
                y="174"
                textAnchor="middle"
                style={{
                  font: "600 13px 'Inter Variable',sans-serif",
                  letterSpacing: "1.5px",
                }}
                fill={TEXT2}
              >
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
                    borderBottom:
                      i < DONUT_LEGEND.length - 1
                        ? `1px solid ${DIVIDER}`
                        : "none",
                  }}
                >
                  <Dot color={d.c} />
                  <Box
                    sx={{
                      flex: 1,
                      fontSize: 18,
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      minWidth: 0,
                    }}
                  >
                    {d.nm}{" "}
                    <Box
                      component="span"
                      sx={{ fontSize: 16, color: TEXT2, fontWeight: 400 }}
                    >
                      · {d.typ}
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      fontSize: 17,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {d.val}{" "}
                    <Box
                      component="em"
                      sx={{
                        fontStyle: "normal",
                        fontWeight: 400,
                        color: TEXT2,
                        fontSize: 16,
                      }}
                    >
                      {d.sub}
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Device time composition */}
      <Box sx={{ mb: "8px" }}>
        <SecHead color={C.idle} title="Timeline" sub="15 devices" />

        {DEVICES.map((d) => {
          const total = d.activeMin + d.streamingMin + d.idleMin + d.lockMin;
          const w = (m: number) => `${(m / AXIS_MAX_MIN) * 100}%`;
          const pct = (m: number) => `${Math.round((m / total) * 100)}%`;
          const legend = [
            { label: "Active Time", c: C.active, m: d.activeMin },
            { label: "Idle Time", c: C.idle, m: d.idleMin },
            { label: "Streaming", c: STREAM, m: d.streamingMin },
            { label: "Machine Locks", c: C.lock, m: d.lockMin },
          ];
          return (
            <Box key={d.nm} sx={{ mb: "36px" }}>
              {/* Device · user */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  mb: "10px",
                  fontSize: 16,
                }}
              >
                <ComputerOutlinedIcon sx={{ fontSize: 20, color: TEXT2 }} />
                <Box component="span" sx={{ fontWeight: 400, color: TEXT }}>
                  {d.nm}
                </Box>
                <Box component="span" sx={{ color: DIVIDER, px: "2px" }}>
                  |
                </Box>
                <PersonOutlineIcon sx={{ fontSize: 20, color: TEXT2 }} />
                <Box component="span" sx={{ color: TEXT }}>
                  {d.user}
                </Box>
              </Box>

              {/* Bar on the shared hour axis */}
              <Box
                sx={{
                  position: "relative",
                  height: 24,
                  border: `1px solid ${DIVIDER}`,
                  borderRadius: "6px",
                  bgcolor: "#fff",
                  overflow: "hidden",
                }}
              >
                {/* gridlines */}
                {AXIS_TICKS.slice(1, -1).map((t) => (
                  <Box
                    key={t}
                    sx={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      left: `${(t / AXIS_MAX_MIN) * 100}%`,
                      width: "1px",
                      bgcolor: DIVIDER,
                    }}
                  />
                ))}
                {/* colored fill */}
                <Box sx={{ position: "absolute", inset: 0, display: "flex" }}>
                  <Box sx={{ width: w(d.activeMin), bgcolor: C.active }} />
                  <Box sx={{ width: w(d.streamingMin), bgcolor: STREAM }} />
                  <Box sx={{ width: w(d.idleMin), bgcolor: C.idle }} />
                  <Box sx={{ width: w(d.lockMin), bgcolor: C.lock }} />
                </Box>
              </Box>

              {/* Hour axis labels */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mt: "6px",
                  fontSize: 13,
                  color: TEXT2,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {AXIS_TICKS.map((t) => (
                  <Box component="span" key={t}>
                    {t / 60}h
                  </Box>
                ))}
              </Box>

              {/* Centered legend */}
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: "6px 28px",
                  mt: "10px",
                  fontSize: 14,
                  color: TEXT2,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {legend.map((it) => (
                  <Box component="span" key={it.label}>
                    <Dot color={it.c} />
                    {it.label}:{" "}
                    <Box component="b" sx={{ color: TEXT2, fontWeight: 400 }}>
                      {fmtMin(it.m)}
                    </Box>{" "}
                    ({pct(it.m)})
                  </Box>
                ))}
              </Box>
            </Box>
          );
        })}
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
          <Box sx={{ fontSize: 17, fontWeight: 600 }}>Brightwave IT</Box>
        </Box>
      </Box>
    </Box>
  );
}
