// User Threat Activity report — converted from the "CyberSight Threat Overview" PDF
// template (1400px canvas). Same chrome/components as Customer Activity
// Overview; different series, labels, and accent colors. Screen-only design
// annex omitted. Rendered light mode (PDF-style document).

import { Box } from "@mui/material";
import type { Theme } from "@mui/material/styles";

const TEXT = "#031625";
const TEXT2 = "rgba(3,22,37,.62)";
const TEXT3 = "rgba(3,22,37,.45)";
const DIVIDER = "rgba(3,22,37,.12)";
// The page's own edge — lighter than the rules inside it.
const PAGE_BORDER = "#E5E5EC";
const TRACK = "#edf0f6";
const C = { threat: "#ce008e", cat: "#ef6c00", user: "#d32f2f" };

const montserrat = (theme: Theme) => theme.typography.fontSecondaryFamily;

type Row = { nm: string; val: string; pct: number; users?: string };

const TOP_THREATS: Row[] = [
  { nm: "Botnet", val: "90 events", pct: 100, users: "3 users" },
  {
    nm: "Malicious Domain Protection",
    val: "85 events",
    pct: 94.4,
    users: "3 users",
  },
  { nm: "Cryptomining", val: "80 events", pct: 88.9, users: "2 users" },
  { nm: "New Domains", val: "70 events", pct: 77.8, users: "2 users" },
  { nm: "Malware", val: "30 events", pct: 33.3, users: "2 users" },
  { nm: "Phishing", val: "20 events", pct: 22.2, users: "2 users" },
  { nm: "Very New Domains", val: "15 events", pct: 16.7, users: "1 user" },
];

const TOP_USERS: Row[] = [
  { nm: "z-ktrojanowski", val: "90 events", pct: 100 },
  { nm: "px-home", val: "80 events", pct: 88.9 },
  { nm: "d-smith", val: "70 events", pct: 77.8 },
  { nm: "b-chesky", val: "45 events", pct: 50 },
  { nm: "s-jobs", val: "39 events", pct: 43.3 },
  { nm: "e-musk", val: "25 events", pct: 27.8 },
  { nm: "p-thiel", val: "20 events", pct: 22.2 },
  { nm: "r-dalio", val: "12 events", pct: 13.3 },
  { nm: "b-franklin", val: "7 events", pct: 7.8 },
  { nm: "c-munger", val: "2 events", pct: 2.2 },
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
      {/* Count sits on its own line, directly above the bar. */}
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
        <BarRow key={r.nm} row={r} color={color} />
      ))}
    </Box>
  );
}

export default function ThreatTrendsReport() {
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
            Monthly report
          </Box>
          <Box sx={{ fontSize: 20, fontWeight: 600, mt: "4px" }}>
            Jul 1 – Jul 31, 2026
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
            m: "8px 0",
          }}
        >
          User Threat Activity
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
          { num: "390", cap: "Threat events" },
          { num: "360", cap: "Content blocks" },
          { num: "10", cap: "Users with threat events" },
          { num: "13", cap: "Avg threat events / day" },
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

      {/* Observed threat activity */}
      <Box sx={{ mb: "72px" }}>
        <SecHead
          color={C.threat}
          title="Observed threat activity"
          sub="Malicious events observed across all devices · Average 13 per day"
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
            <linearGradient id="threatfill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ce008e" stopOpacity=".15" />
              <stop offset="1" stopColor="#ce008e" stopOpacity="0" />
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
          <path
            fill="url(#threatfill)"
            d="M56,190.5 L97,165.5 L138,115.5 L179,178 L220,253 L261,290.5 L302,153 L343,115.5 L384,78 L425,53 L466,40.5 L507,240.5 L548,278 L589,103 L630,128 L671,140.5 L712,153 L753,140.5 L794,253 L835,290.5 L876,115.5 L917,103 L958,140.5 L999,140.5 L1040,153 L1081,265.5 L1122,290.5 L1163,128 L1204,103 L1245,165.5 L1245,328 L56,328 Z"
          />
          <line
            x1="56"
            y1="197"
            x2="1245"
            y2="140"
            stroke={C.user}
            strokeWidth="3"
            strokeDasharray="8 7"
          />
          <polyline
            fill="none"
            stroke={C.threat}
            strokeWidth="3.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            points="56,190.5 97,165.5 138,115.5 179,178 220,253 261,290.5 302,153 343,115.5 384,78 425,53 466,40.5 507,240.5 548,278 589,103 630,128 671,140.5 712,153 753,140.5 794,253 835,290.5 876,115.5 917,103 958,140.5 999,140.5 1040,153 1081,265.5 1122,290.5 1163,128 1204,103 1245,165.5"
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
              sx={{
                width: 28,
                height: 4,
                borderRadius: "2px",
                bgcolor: C.threat,
              }}
            />
            Threat events
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Box
              sx={{ width: 28, height: 0, borderTop: `3px dashed ${C.user}` }}
            />
            Monthly trend
          </Box>
        </Box>
      </Box>

      {/* Top-N grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "48px",
          mb: "72px",
        }}
      >
        <TopNColumn
          color={C.threat}
          title="Top observed threats"
          sub="7 detected"
          rows={TOP_THREATS}
        />
        <TopNColumn
          color={C.user}
          title="Top Risky Users"
          sub="10 flagged"
          rows={TOP_USERS}
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
          <Box sx={{ fontSize: 17, fontWeight: 600 }}>Brightwave IT</Box>
        </Box>
      </Box>
    </Box>
  );
}
