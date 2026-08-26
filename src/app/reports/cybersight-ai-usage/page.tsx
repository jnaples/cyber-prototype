// AI Tool Usage report — converted from the "AI Usage" PDF
// template (1400px canvas). Same chrome/components as the other CyberSight
// reports; AI-specific series, a rescaled 0–6h trend chart, and AI accent
// colors. Screen-only design annex omitted. Rendered light mode (PDF-style).

import { Box } from "@mui/material";
import type { Theme } from "@mui/material/styles";

import { ReportLogo } from "../report-logo";

const TEXT = "#031625";
const TEXT2 = "rgba(3,22,37,.62)";
const TEXT3 = "rgba(3,22,37,.45)";
const DIVIDER = "rgba(3,22,37,.12)";
// The page's own edge — lighter than the rules inside it.
const PAGE_BORDER = "#E5E5EC";
const TRACK = "#edf0f6";
const C = {
  site: "#238cd2",
  app: "#7b3ff2",
  client: "#1e7d4f",
  trend: "#0f8a80",
};

const montserrat = (theme: Theme) => theme.typography.fontSecondaryFamily;

type Row = {
  nm: string;
  val: string;
  sub?: string;
  pct: number;
  users?: string;
};

const TOP_AI_WEBSITES: Row[] = [
  {
    nm: "claude.ai",
    val: "20h 33m",
    sub: "(26.0%)",
    pct: 100,
    users: "3 users",
  },
  {
    nm: "chatgpt.com",
    val: "18h 25m",
    sub: "(23.3%)",
    pct: 89.6,
    users: "3 users",
  },
  {
    nm: "perplexity.ai",
    val: "3h 55m",
    sub: "(5.0%)",
    pct: 19.1,
    users: "1 user",
  },
  {
    nm: "gemini.google.com",
    val: "3h 12m",
    sub: "(4.1%)",
    pct: 15.6,
    users: "2 users",
  },
  {
    nm: "copilot.microsoft.com",
    val: "1h 41m",
    sub: "(2.1%)",
    pct: 8.2,
    users: "2 users",
  },
  {
    nm: "midjourney.com",
    val: "1h 24m",
    sub: "(1.8%)",
    pct: 6.8,
    users: "1 user",
  },
  {
    nm: "huggingface.co",
    val: "1h 9m",
    sub: "(1.5%)",
    pct: 5.6,
    users: "1 user",
  },
  { nm: "copy.ai", val: "46m", sub: "(1.0%)", pct: 3.7, users: "3 users" },
  {
    nm: "higgsfield.ai",
    val: "13m",
    sub: "(0.3%)",
    pct: 1.1,
    users: "3 users",
  },
  { nm: "grok.x.ai", val: "8m", sub: "(0.2%)", pct: 0.6, users: "1 user" },
];

const TOP_AI_APPS: Row[] = [
  { nm: "GitHub Copilot", val: "13h 33m", pct: 100, users: "2 users" },
  { nm: "Cursor", val: "8h 38m", pct: 63.7, users: "2 users" },
  { nm: "Microsoft Copilot", val: "2h 45m", pct: 20.3, users: "3 users" },
  { nm: "Notion AI", val: "32m", pct: 3.9, users: "3 users" },
  { nm: "Grammarly", val: "27m", pct: 3.3, users: "3 users" },
  { nm: "Adobe Firefly", val: "24m", pct: 3, users: "1 user" },
  { nm: "Otter.ai", val: "17m", pct: 2.1, users: "1 user" },
  { nm: "Jasper", val: "10m", pct: 1.2, users: "1 user" },
  { nm: "Writesonic", val: "9m", pct: 1.1, users: "1 user" },
  { nm: "Runway ML", val: "8m", pct: 1, users: "1 user" },
];

const TOP_AI_CLIENTS: Row[] = [
  { nm: "z-ktrojanowski", val: "26h 12m", pct: 100, users: "3 users" },
  { nm: "YOGA-BSMITH", val: "17h 46m", pct: 67.8, users: "2 users" },
  { nm: "px-home", val: "11h 3m", pct: 42.2, users: "1 user" },
  { nm: "LOWES-LAPTOP-04", val: "7h 21m", pct: 28.1, users: "1 user" },
  { nm: "HD-LAPTOP-24", val: "5h 48m", pct: 22.1, users: "1 user" },
  { nm: "smith-j", val: "4h 30m", pct: 17.2, users: "1 user" },
  { nm: "CC-LAPTOP-3", val: "3h 9m", pct: 12, users: "1 user" },
  { nm: "LOWES-DESKTOP-11", val: "1h 54m", pct: 7.3, users: "1 user" },
  { nm: "LOWES-SURFACE-09", val: "58m", pct: 3.7, users: "1 user" },
  { nm: "LOWES-MACBOOK-07", val: "19m", pct: 1.2, users: "1 user" },
];

function UserIcon() {
  return (
    <Box
      component="svg"
      viewBox="0 0 16 16"
      sx={{ width: 15, height: 15, fill: TEXT3, flexShrink: 0 }}
    >
      <path d="M8 7.4a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 1.5c-3 0-5.5 1.8-5.5 4 0 .6.5 1.1 1.1 1.1h8.8c.6 0 1.1-.5 1.1-1.1 0-2.2-2.5-4-5.5-4Z" />
    </Box>
  );
}

function SecHead({
  title,
  sub,
}: {
  color?: string;
  title: string;
  sub: string;
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
      <Box component="p" sx={{ m: 0, fontSize: 16, color: TEXT2, mt: "4px" }}>
        {sub}
      </Box>
    </Box>
  );
}

// Rows carry a duration string, not a number, so a row's share of its list is
// derived from the parsed minutes. Lists that already ship a `sub` keep it.
function minutesOf(value: string) {
  const h = /(\d+)\s*h/.exec(value);
  const m = /(\d+)\s*m/.exec(value);
  return (h ? Number(h[1]) * 60 : 0) + (m ? Number(m[1]) : 0);
}

function shareOf(row: Row, rows: Row[]) {
  const total = rows.reduce((sum, r) => sum + minutesOf(r.val), 0);
  if (!total) return undefined;
  return `(${((minutesOf(row.val) / total) * 100).toFixed(1)}%)`;
}

function BarRow({
  row,
  color,
  share,
}: {
  row: Row;
  color: string;
  /** e.g. "(26.0%)" — the row's share of its list. */
  share?: string;
}) {
  return (
    <Box sx={{ mb: "20px" }}>
      <Box
        component="span"
        sx={{
          display: "block",
          fontSize: 20,
          fontWeight: 500,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          minWidth: 0,
        }}
      >
        {row.nm}
      </Box>
      {/* Value and share sit on their own line, directly above the bar. */}
      <Box
        component="span"
        sx={{
          display: "block",
          fontSize: 16,
          fontWeight: 400,
          whiteSpace: "nowrap",
          fontVariantNumeric: "tabular-nums",
          color: TEXT2,
          my: "4px",
        }}
      >
        {row.val}
        {share && ` ${share}`}
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <Box
          sx={{
            flex: 1,
            height: 12,
            borderRadius: "6px",
            bgcolor: TRACK,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "block",
              height: "100%",
              borderRadius: "6px",
              minWidth: 4,
              width: `${row.pct}%`,
              bgcolor: color,
            }}
          />
        </Box>
        {row.users && (
          <Box
            sx={{
              flex: "none",
              width: 96,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "6px",
              fontSize: 16,
              color: TEXT2,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <UserIcon />
            {row.users}
          </Box>
        )}
      </Box>
    </Box>
  );
}

function TopNColumn({
  color,
  title,
  sub,
  rows,
}: {
  color: string;
  title: string;
  sub: string;
  rows: Row[];
}) {
  return (
    <Box>
      <SecHead color={color} title={title} sub={sub} />
      {rows.map((r) => (
        <BarRow
          key={r.nm}
          row={r}
          color={color}
          share={r.sub ?? shareOf(r, rows)}
        />
      ))}
    </Box>
  );
}

export default function CyberSightAiUsageReport() {
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
          <Box sx={{ fontFamily: montserrat, fontWeight: 600, fontSize: 30 }}>
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
            fontSize: 48,
            lineHeight: 1.2,
            m: "8px 0",
          }}
        >
          AI Tool Usage
        </Box>
        <Box sx={{ fontSize: 24, color: TEXT2 }}>Acme Manufacturing</Box>
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
          { num: "15m", cap: "Avg AI tool time per device per day" },
          { num: "31%", cap: "Of all active time" },
          { num: "23", cap: "AI tools detected" },
          { num: "10", cap: "Devices using AI" },
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

      {/* AI usage over time */}
      <Box sx={{ mb: "72px" }}>
        <SecHead
          color={C.app}
          title="AI usage over time"
          sub="Combined AI tool time across all devices · Average 2.6 hours per day"
        />
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
          <defs>
            <linearGradient id="aifill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#7b3ff2" stopOpacity=".15" />
              <stop offset="1" stopColor="#7b3ff2" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g stroke="rgba(3,22,37,.10)" strokeWidth="1">
            <line x1="56" y1="28" x2="1245" y2="28" />
            <line x1="56" y1="128" x2="1245" y2="128" />
            <line x1="56" y1="228" x2="1245" y2="228" />
            <line x1="56" y1="328" x2="1245" y2="328" />
          </g>
          <g textAnchor="end">
            <text x="42" y="333">
              0
            </text>
            <text x="42" y="233">
              2
            </text>
            <text x="42" y="133">
              4
            </text>
            <text x="42" y="33">
              6
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
            HOURS
          </text>
          <text
            x="650"
            y="394"
            style={{ fontSize: "14px", letterSpacing: "1.5px" }}
            textAnchor="middle"
          >
            DATE
          </text>
          <path
            fill="url(#aifill)"
            d="M56,268 L97,253 L138,238 L179,248 L220,308 L261,318 L302,228 L343,213 L384,198 L425,178 L466,158 L507,283 L548,303 L589,188 L630,153 L671,178 L712,168 L753,133 L794,273 L835,293 L876,138 L917,118 L958,103 L999,113 L1040,88 L1081,263 L1122,293 L1163,78 L1204,68 L1245,48 L1245,328 L56,328 Z"
          />
          <line
            x1="56"
            y1="278"
            x2="1245"
            y2="98"
            stroke={C.trend}
            strokeWidth="3"
            strokeDasharray="8 7"
          />
          <polyline
            fill="none"
            stroke={C.app}
            strokeWidth="3.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            points="56,268 97,253 138,238 179,248 220,308 261,318 302,228 343,213 384,198 425,178 466,158 507,283 548,303 589,188 630,153 671,178 712,168 753,133 794,273 835,293 876,138 917,118 958,103 999,113 1040,88 1081,263 1122,293 1163,78 1204,68 1245,48"
          />
          <g textAnchor="middle">
            <text x="56" y="356">
              Jul 1
            </text>
            <text x="302" y="356">
              Jul 7
            </text>
            <text x="589" y="356">
              Jul 14
            </text>
            <text x="876" y="356">
              Jul 21
            </text>
            <text x="1163" y="356">
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
          <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Box
              sx={{ width: 28, height: 4, borderRadius: "2px", bgcolor: C.app }}
            />
            AI tool time
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Box
              sx={{ width: 28, height: 0, borderTop: `3px dashed ${C.trend}` }}
            />
            Monthly trend
          </Box>
        </Box>
      </Box>

      {/* Top-N grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "48px",
          mb: "72px",
        }}
      >
        <TopNColumn
          color={C.site}
          title="Top AI websites"
          sub="12 accessed"
          rows={TOP_AI_WEBSITES}
        />
        <TopNColumn
          color={C.app}
          title="Top AI applications"
          sub="11 detected"
          rows={TOP_AI_APPS}
        />
        <TopNColumn
          color={C.client}
          title="Top AI clients"
          sub="10 total"
          rows={TOP_AI_CLIENTS}
        />
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
          <Box sx={{ fontSize: 16, fontWeight: 600 }}>Brightwave IT</Box>
        </Box>
      </Box>
    </Box>
  );
}
