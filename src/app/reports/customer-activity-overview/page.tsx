// Customer Activity Overview report — converted from the "CyberSight Activity
// Overview" PDF template (1400px canvas). Screen-only design annex is omitted.
// Rendered in light mode (the emailed PDF is a light-mode document); type sizes
// match the template (product ramp × ~1.5 to compensate the print scale).

import { Box } from "@mui/material";
import type { Theme } from "@mui/material/styles";

// Token / dataviz palette (from the template).
const TEXT = "#031625";
const TEXT2 = "rgba(3,22,37,.62)";
const TEXT3 = "rgba(3,22,37,.45)";
const PRIMARY = "#3527fd";
const DIVIDER = "rgba(3,22,37,.12)";
const TRACK = "#edf0f6";
const C = {
  web: "#207BBE", // secureBlue[800]
  app: "#9435EC", // pairingPurple.main (purple[400])
  cat: "#EF6C00", // orange[800]
  stream: "#05C6C6", // teal[500]
  ai: "#CE008E", // threatMagenta[700]
  client: "#05864A", // green[800]
};

const montserrat = (theme: Theme) => theme.typography.fontSecondaryFamily;

type Row = {
  nm: string;
  val: string;
  sub?: string;
  pct: number;
  users: string;
};

const TOP_WEBSITES: Row[] = [
  {
    nm: "portal.zorustech.com",
    val: "72h 59m",
    sub: "(57.4%)",
    pct: 100,
    users: "3 users",
  },
  {
    nm: "dnsfilter.atlassian.net",
    val: "21h 33m",
    sub: "(16.9%)",
    pct: 29.5,
    users: "1 user",
  },
  {
    nm: "docs.google.com",
    val: "8h 6m",
    sub: "(6.4%)",
    pct: 11.1,
    users: "2 users",
  },
  {
    nm: "mail.google.com",
    val: "4h 39m",
    sub: "(3.7%)",
    pct: 6.4,
    users: "2 users",
  },
  {
    nm: "meet.google.com",
    val: "3h 55m",
    sub: "(3.1%)",
    pct: 5.4,
    users: "1 user",
  },
  {
    nm: "zorustech.atlassian.net",
    val: "3h 19m",
    sub: "(2.6%)",
    pct: 4.5,
    users: "1 user",
  },
  {
    nm: "calendar.google.com",
    val: "3h 14m",
    sub: "(2.5%)",
    pct: 4.4,
    users: "1 user",
  },
  {
    nm: "portal-staging.zorustech.com",
    val: "2h 53m",
    sub: "(2.3%)",
    pct: 3.9,
    users: "1 user",
  },
  {
    nm: "www.lowes.com",
    val: "1h 49m",
    sub: "(1.4%)",
    pct: 2.5,
    users: "1 user",
  },
  {
    nm: "chatgpt.com",
    val: "1h 35m",
    sub: "(1.2%)",
    pct: 2.2,
    users: "1 user",
  },
];

const TOP_APPS: Row[] = [
  { nm: "Slack", val: "53h 30m", pct: 100, users: "3 users" },
  { nm: "Google Chrome", val: "26h 45m", pct: 50, users: "3 users" },
  { nm: "Discord", val: "1h 37m", pct: 3, users: "1 user" },
  { nm: "Zoom", val: "1h 32m", pct: 2.9, users: "3 users" },
  {
    nm: "Microsoft® Windows® Operating System",
    val: "1h 27m",
    pct: 2.7,
    users: "3 users",
  },
  { nm: "Microsoft Excel", val: "1h 13m", pct: 2.3, users: "1 user" },
  { nm: "HPSystemEventUtilityHost.OSD", val: "24m", pct: 0.8, users: "1 user" },
  { nm: "Snipping Tool", val: "16m", pct: 0.5, users: "1 user" },
  { nm: "Microsoft Word", val: "9m", pct: 0.3, users: "1 user" },
  { nm: "ScreenConnect", val: "8m", pct: 0.3, users: "1 user" },
];

const TOP_CATEGORIES: Row[] = [
  { nm: "Computing & Internet", val: "96h 8m", pct: 100, users: "3 users" },
  { nm: "Web based Mail", val: "4h 41m", pct: 4.9, users: "2 users" },
  { nm: "Web Conferencing", val: "3h 59m", pct: 4.1, users: "2 users" },
  { nm: "Business & Commercial", val: "3h 58m", pct: 4.1, users: "3 users" },
  { nm: "Reference", val: "3h 19m", pct: 3.5, users: "1 user" },
  { nm: "Shopping/Retail", val: "3h 12m", pct: 3.3, users: "3 users" },
  { nm: "Artificial Intelligence", val: "2h 13m", pct: 2.3, users: "1 user" },
  { nm: "LinkedIn", val: "1h 15m", pct: 1.3, users: "1 user" },
  { nm: "Search Engines & Portals", val: "59m", pct: 1, users: "1 user" },
  { nm: "Education", val: "58m", pct: 1, users: "1 user" },
];

const TOP_STREAMING: Row[] = [
  {
    nm: "Google Chrome",
    val: "49h 10m",
    sub: "(74.8%)",
    pct: 100,
    users: "2 users",
  },
  { nm: "Zoom", val: "13h 46m", sub: "(20.9%)", pct: 28, users: "2 users" },
  { nm: "Slack", val: "2h 45m", sub: "(4.2%)", pct: 5.6, users: "1 user" },
  { nm: "Discord", val: "5m", sub: "(0.1%)", pct: 0.4, users: "1 user" },
  {
    nm: "Snipping Tool",
    val: "<1m",
    sub: "(<0.1%)",
    pct: 0.3,
    users: "1 user",
  },
];

const TOP_AI: Row[] = [
  { nm: "Claude", val: "72h 59m", sub: "(31.0%)", pct: 100, users: "3 users" },
  {
    nm: "chatgpt.com",
    val: "65h 25m",
    sub: "(27.8%)",
    pct: 89.6,
    users: "3 users",
  },
  {
    nm: "GitHub Copilot",
    val: "48h 6m",
    sub: "(20.5%)",
    pct: 65.9,
    users: "2 users",
  },
  { nm: "Cursor", val: "30h 39m", sub: "(13.0%)", pct: 42, users: "2 users" },
  {
    nm: "perplexity.ai",
    val: "13h 55m",
    sub: "(5.9%)",
    pct: 19.1,
    users: "1 user",
  },
  { nm: "copy.ai", val: "2h 45m", sub: "(1.2%)", pct: 3.8, users: "3 users" },
  { nm: "higgsfield.ai", val: "45m", sub: "(0.3%)", pct: 1, users: "3 users" },
  { nm: "grok.x.ai", val: "29m", sub: "(0.2%)", pct: 0.7, users: "1 user" },
];

const TOP_CLIENTS: Row[] = [
  { nm: "z-ktrojanowski", val: "79h 4m", pct: 100, users: "3 users" },
  { nm: "YOGA-BSMITH", val: "55h 34m", pct: 70.3, users: "2 users" },
  { nm: "px-home", val: "35h 16m", pct: 44.6, users: "1 user" },
  { nm: "LOWES-LAPTOP-04", val: "22h 40m", pct: 28.7, users: "1 user" },
  { nm: "HD-LAPTOP-24", val: "18h 12m", pct: 23, users: "1 user" },
  { nm: "smith-j", val: "14h 55m", pct: 18.9, users: "1 user" },
  { nm: "CC-LAPTOP-3", val: "11h 8m", pct: 14.1, users: "1 user" },
  { nm: "LOWES-DESKTOP-11", val: "8h 33m", pct: 10.8, users: "1 user" },
  { nm: "LOWES-SURFACE-09", val: "5h 47m", pct: 7.3, users: "1 user" },
  { nm: "LOWES-MACBOOK-07", val: "3h 21m", pct: 4.2, users: "1 user" },
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

function BarRow({ row, color }: { row: Row; color: string }) {
  return (
    <Box sx={{ mb: "20px" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: "12px",
          mb: "7px",
        }}
      >
        <Box
          component="span"
          sx={{
            fontSize: 20,
            fontWeight: 500,
            minWidth: 0,
            overflowWrap: "anywhere",
            wordBreak: "break-word",
          }}
        >
          {row.nm}
        </Box>
        <Box
          component="span"
          sx={{
            fontSize: 19,
            fontWeight: 600,
            whiteSpace: "nowrap",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {row.val}
          {row.sub && (
            <Box
              component="em"
              sx={{
                fontStyle: "normal",
                fontWeight: 400,
                color: TEXT2,
                fontSize: 17,
                ml: "6px",
              }}
            >
              {row.sub}
            </Box>
          )}
        </Box>
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
        <BarRow key={r.nm} row={r} color={color} />
      ))}
    </Box>
  );
}

export default function CustomerActivityOverviewReport() {
  return (
    <Box
      // Fixed light-mode PDF-style document, 1400px canvas.
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          pb: "24px",
        }}
      >
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
            <Box sx={{ fontFamily: montserrat, fontWeight: 600, fontSize: 26 }}>
              Brightwave IT
            </Box>
          </Box>
        </Box>
        <Box sx={{ textAlign: "right" }}>
          <Box
            sx={{
              fontSize: 16,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: TEXT2,
              fontWeight: 600,
            }}
          >
            Reporting period
          </Box>
          <Box sx={{ fontSize: 20, fontWeight: 600, mt: "4px" }}>
            Jun 23 – Jul 22, 2026
          </Box>
        </Box>
      </Box>
      <Box sx={{ height: "3px", bgcolor: TEXT, mb: "40px" }} />

      {/* Title block */}
      <Box sx={{ mb: "48px" }}>
        <Box
          component="h1"
          sx={{
            fontFamily: montserrat,
            fontWeight: 600,
            fontSize: 44,
            lineHeight: 1.2,
            m: "10px 0 12px",
          }}
        >
          Customer Activity Overview
        </Box>
        <Box sx={{ fontSize: 21, color: TEXT2 }}>
          Prepared for Acme Manufacturing
        </Box>
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
          { num: "8.5h", cap: "Avg active time per device per day" },
          { num: "10", cap: "Active devices" },
          { num: "3", cap: "Active users" },
          { num: "254h 30m", cap: "Total active time" },
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

      {/* Active time trend */}
      <Box sx={{ mb: "72px" }}>
        <SecHead
          color={PRIMARY}
          title="Active time trend"
          sub="Combined active time across all devices · Average 8.5 hours per day"
        />
        <Box
          component="svg"
          viewBox="0 0 1272 372"
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
            <linearGradient id="areafill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#3527fd" stopOpacity=".16" />
              <stop offset="1" stopColor="#3527fd" stopOpacity="0" />
            </linearGradient>
          </defs>
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
              6
            </text>
            <text x="42" y="183">
              12
            </text>
            <text x="42" y="108">
              18
            </text>
            <text x="42" y="33">
              24
            </text>
          </g>
          <text
            x="56"
            y="12"
            style={{ fontSize: "14px", letterSpacing: "1.5px" }}
            textAnchor="start"
          >
            HOURS
          </text>
          <path
            fill="url(#areafill)"
            d="M56,250.5 L97,235.5 L138,214 L179,243 L220,313 L261,323 L302,208 L343,198 L384,180.5 L425,133 L466,55.5 L507,295.5 L548,318 L589,160.5 L630,188 L671,183 L712,205.5 L753,192 L794,289 L835,310.5 L876,180.5 L917,170.5 L958,210.5 L999,188 L1040,214 L1081,300.5 L1122,320.5 L1163,185.5 L1204,188 L1245,204 L1245,328 L56,328 Z"
          />
          <line
            x1="56"
            y1="238"
            x2="1245"
            y2="208"
            stroke={C.stream}
            strokeWidth="3"
            strokeDasharray="8 7"
          />
          <polyline
            fill="none"
            stroke={PRIMARY}
            strokeWidth="3.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            points="56,250.5 97,235.5 138,214 179,243 220,313 261,323 302,208 343,198 384,180.5 425,133 466,55.5 507,295.5 548,318 589,160.5 630,188 671,183 712,205.5 753,192 794,289 835,310.5 876,180.5 917,170.5 958,210.5 999,188 1040,214 1081,300.5 1122,320.5 1163,185.5 1204,188 1245,204"
          />
          <g textAnchor="middle">
            <text x="56" y="356">
              Jun 23
            </text>
            <text x="302" y="356">
              Jun 29
            </text>
            <text x="589" y="356">
              Jul 6
            </text>
            <text x="876" y="356">
              Jul 13
            </text>
            <text x="1163" y="356">
              Jul 20
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
              sx={{
                width: 28,
                height: 4,
                borderRadius: "2px",
                bgcolor: PRIMARY,
              }}
            />
            Active time
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Box
              sx={{ width: 28, height: 0, borderTop: `3px dashed ${C.stream}` }}
            />
            30-day trend
          </Box>
        </Box>
      </Box>

      {/* Top-N grid 1 */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "48px",
          mb: "72px",
        }}
      >
        <TopNColumn
          color={C.web}
          title="Top websites"
          sub="Top 10 of 40,000+ visits recorded"
          rows={TOP_WEBSITES}
        />
        <TopNColumn
          color={C.app}
          title="Top applications"
          sub="Top 10 of 142 applications detected"
          rows={TOP_APPS}
        />
        <TopNColumn
          color={C.cat}
          title="Top categories"
          sub="Top 10 of 38 categories triggered"
          rows={TOP_CATEGORIES}
        />
      </Box>

      {/* Top-N grid 2 */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "48px",
          mb: "72px",
        }}
      >
        <TopNColumn
          color={C.stream}
          title="Top streaming activities"
          sub="5 streaming sources detected"
          rows={TOP_STREAMING}
        />
        <TopNColumn
          color={C.ai}
          title="Top AI tools"
          sub="8 AI tools detected"
          rows={TOP_AI}
        />
        <TopNColumn
          color={C.client}
          title="Top active clients"
          sub="All 10 monitored devices"
          rows={TOP_CLIENTS}
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
          <Box sx={{ fontSize: 17, fontWeight: 600 }}>
            Prepared by Brightwave IT
          </Box>
        </Box>
        <Box sx={{ fontSize: 16, color: TEXT2, textAlign: "right" }}>
          Data period Jun 23 – Jul 22, 2026
        </Box>
      </Box>
    </Box>
  );
}
