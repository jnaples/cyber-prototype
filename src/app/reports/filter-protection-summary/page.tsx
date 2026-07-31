// Filter Protection Summary report — converted from the "Filter Protection
// Summary" PDF template (1400px canvas). Requests-over-time line chart, threat
// and content summaries, top blocked domains, and per-site activity bars.
// Screen-only design annex omitted. Light-mode (PDF-style) document.

import { Box } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { SvgIconComponent } from "@mui/icons-material";
import PodcastsOutlinedIcon from "@mui/icons-material/PodcastsOutlined";
import GppBadOutlinedIcon from "@mui/icons-material/GppBadOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";

const TEXT = "#031625";
const TEXT2 = "rgba(3,22,37,.62)";
const TEXT3 = "rgba(3,22,37,.45)";
const PRIMARY = "#3527fd";
const DIVIDER = "rgba(3,22,37,.12)";
const TRACK = "#edf0f6";
const C_THREAT = "#D32F2F"; // red[700]
const C_THREAT_SUMMARY = "#CE008E"; // threatMagenta[700]
const C_CONTENT_DOMAINS = "#EF6C00"; // orange[800]
const C_CONTENT = PRIMARY;
const C_SITE = "#0AB36F"; // green[700]
const C_TREND = "#0f8a80";
const C_OTHER = "#8b93a7";

const montserrat = (theme: Theme) => theme.typography.fontSecondaryFamily;

type Row = {
  nm: string;
  cat?: string;
  val: string;
  em: string;
  w: number;
  color?: string;
  meta?: string;
};

const KPIS: { num: string; cap: string; Icon: SvgIconComponent; iconColor: string }[] = [
  { num: "306.2K", cap: "Total requests", Icon: PodcastsOutlinedIcon, iconColor: PRIMARY },
  { num: "214", cap: "Blocked threats", Icon: GppBadOutlinedIcon, iconColor: C_THREAT },
  { num: "12.2K", cap: "Blocked content", Icon: BlockOutlinedIcon, iconColor: TEXT },
  { num: "4", cap: "Total sites", Icon: LocationOnOutlinedIcon, iconColor: C_SITE },
];

const THREATS: Row[] = [
  { nm: "Botnet", val: "62", em: "(29.0%)", w: 100 },
  { nm: "Malicious Domain Protection", val: "48", em: "(22.4%)", w: 77.4 },
  { nm: "Cryptomining", val: "35", em: "(16.4%)", w: 56.5 },
  { nm: "New Domains", val: "28", em: "(13.1%)", w: 45.2 },
  { nm: "Malware", val: "19", em: "(8.9%)", w: 30.6 },
  { nm: "Phishing", val: "14", em: "(6.5%)", w: 22.6 },
  { nm: "Very New Domains", val: "8", em: "(3.7%)", w: 12.9 },
];

const CONTENT: Row[] = [
  { nm: "Adult Content", val: "4,120", em: "(33.8%)", w: 100 },
  { nm: "Gambling", val: "2,847", em: "(23.4%)", w: 69.1 },
  { nm: "Streaming Media", val: "2,214", em: "(18.2%)", w: 53.7 },
  { nm: "Social Media", val: "1,633", em: "(13.4%)", w: 39.6 },
  { nm: "Games", val: "892", em: "(7.3%)", w: 21.7 },
  { nm: "Weapons", val: "311", em: "(2.6%)", w: 7.5 },
  { nm: "Other", val: "169", em: "(1.3%)", w: 4.1, color: C_OTHER },
];

const THREAT_DOMAINS: Row[] = [
  { nm: "xj-metrics-sync.ru", cat: "Botnet", val: "41", em: "(19.2%)", w: 100 },
  { nm: "crypto-pool-eu.net", cat: "Cryptomining", val: "29", em: "(13.6%)", w: 70.7 },
  { nm: "cdn-newdrop.xyz", cat: "New Domains", val: "17", em: "(7.9%)", w: 41.5 },
  { nm: "login-micros0ft-verify.com", cat: "Phishing", val: "12", em: "(5.6%)", w: 29.3 },
  { nm: "update-flashplayer.top", cat: "Malware", val: "11", em: "(5.1%)", w: 26.8 },
];

const CONTENT_DOMAINS: Row[] = [
  { nm: "tiktok.com", cat: "Social Media", val: "1,204", em: "(9.9%)", w: 100 },
  { nm: "bet365.com", cat: "Gambling", val: "987", em: "(8.1%)", w: 82 },
  { nm: "twitch.tv", cat: "Streaming Media", val: "864", em: "(7.1%)", w: 71.8 },
  { nm: "roblox.com", cat: "Games", val: "512", em: "(4.2%)", w: 42.5 },
  { nm: "onlyfans.com", cat: "Adult Content", val: "498", em: "(4.1%)", w: 41.4 },
];

const SITES: Row[] = [
  { nm: "HQ — Fairfield", val: "182.4K", em: "requests", w: 100, meta: "7,214 blocked" },
  { nm: "Warehouse — Bridgeport", val: "64.1K", em: "requests", w: 35.1, meta: "2,833 blocked" },
  { nm: "Guest Wi-Fi", val: "38.5K", em: "requests", w: 21.1, meta: "1,987 blocked" },
  { nm: "Roaming clients", val: "21.2K", em: "requests", w: 11.6, meta: "366 blocked" },
];

function SecHead({ title, sub }: { color?: string; title: string; sub: string }) {
  return (
    <Box sx={{ mb: "24px" }}>
      <Box
        component="h2"
        sx={{ m: 0, fontFamily: montserrat, fontSize: 24, fontWeight: 600, textTransform: "capitalize" }}
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
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "12px", mb: "7px" }}>
        <Box sx={{ fontSize: 20, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>
          {row.nm}
          {row.cat && (
            <Box component="span" sx={{ fontSize: 17, fontWeight: 400, color: TEXT2 }}>
              {" "}
              · {row.cat}
            </Box>
          )}
        </Box>
        <Box sx={{ fontSize: 19, fontWeight: 600, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
          {row.val}{" "}
          <Box component="em" sx={{ fontStyle: "normal", fontWeight: 400, color: TEXT2, fontSize: 17 }}>
            {row.em}
          </Box>
        </Box>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <Box sx={{ flex: 1, height: 12, borderRadius: "6px", bgcolor: TRACK, overflow: "hidden" }}>
          <Box sx={{ display: "block", height: "100%", borderRadius: "6px", minWidth: "4px", width: `${row.w}%`, bgcolor: row.color ?? color }} />
        </Box>
        {row.meta && (
          <Box sx={{ flex: "none", width: 150, textAlign: "right", fontSize: 16, color: TEXT2, fontVariantNumeric: "tabular-nums" }}>
            {row.meta}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default function FilterProtectionSummaryReport() {
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
          Network protection · Monthly report
        </Box>
        <Box component="h1" sx={{ fontFamily: montserrat, fontWeight: 600, fontSize: 44, lineHeight: 1.2, m: "10px 0 12px" }}>
          Filter Protection Summary
        </Box>
        <Box sx={{ fontSize: 21, color: TEXT2 }}>Prepared for Acme Manufacturing · 30-day filtering summary</Box>
      </Box>

      {/* KPI band */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px", mb: "64px" }}>
        {KPIS.map((k) => (
          <Box key={k.cap} sx={{ border: `1px solid ${DIVIDER}`, borderRadius: "6px", p: "28px 32px 24px", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <Box
              component={k.Icon}
              sx={{ fontSize: 36, color: k.iconColor, mb: "20px", display: "block" }}
            />
            <Box sx={{ fontFamily: montserrat, fontWeight: 600, fontSize: 52, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
              {k.num}
            </Box>
            <Box sx={{ fontSize: 16, fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", color: TEXT2, mt: "12px" }}>
              {k.cap}
            </Box>
          </Box>
        ))}
      </Box>

      {/* Requests over time */}
      <Box sx={{ mb: "72px" }}>
        <SecHead color={PRIMARY} title="Requests over time" sub="DNS requests resolved per day · average 10.2K per day" />
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
            <text x="42" y="258">4K</text>
            <text x="42" y="183">8K</text>
            <text x="42" y="108">12K</text>
            <text x="42" y="33">16K</text>
          </g>
          <text x="56" y="12" style={{ fontSize: "14px", letterSpacing: "1.5px" }} textAnchor="start">
            REQUESTS
          </text>
          <path
            fill="rgba(53,39,253,.12)"
            d="M56,95.5 L97,82.4 L138,73 L179,99.3 L220,283 L261,288.6 L302,80.5 L343,88 L384,76.8 L425,63.6 L466,31.8 L507,279.3 L548,284.9 L589,84.3 L630,91.8 L671,86.1 L712,101.1 L753,78.6 L794,277.4 L835,286.8 L876,89.9 L917,71.1 L958,97.4 L999,86.1 L1040,93.6 L1081,275.5 L1122,283 L1163,82.4 L1204,91.8 L1245,95.5 L1245,328 L56,328 Z"
          />
          <line x1="56" y1="105" x2="1245" y2="95" stroke={C_TREND} strokeWidth="3" strokeDasharray="8 7" />
          <polyline
            fill="none"
            stroke={PRIMARY}
            strokeWidth="3.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            points="56,95.5 97,82.4 138,73 179,99.3 220,283 261,288.6 302,80.5 343,88 384,76.8 425,63.6 466,31.8 507,279.3 548,284.9 589,84.3 630,91.8 671,86.1 712,101.1 753,78.6 794,277.4 835,286.8 876,89.9 917,71.1 958,97.4 999,86.1 1040,93.6 1081,275.5 1122,283 1163,82.4 1204,91.8 1245,95.5"
          />
          <circle cx="466" cy="31.8" r="5" fill={PRIMARY} />
          <text className="peak" x="480" y="30">
            Peak 15.8K · Fri Jul 3
          </text>
          <g textAnchor="middle">
            <text x="56" y="356">Jun 23</text>
            <text x="302" y="356">Jun 29</text>
            <text x="589" y="356">Jul 6</text>
            <text x="876" y="356">Jul 13</text>
            <text x="1163" y="356">Jul 20</text>
          </g>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "center", gap: "32px", mt: "16px", fontSize: 16, color: TEXT2 }}>
          <Box component="span" sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Box sx={{ width: 28, height: 4, borderRadius: "2px", bgcolor: PRIMARY }} />
            Resolved requests
          </Box>
          <Box component="span" sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Box sx={{ width: 28, height: 0, borderTop: `3px dashed ${C_TREND}` }} />
            30-day trend
          </Box>
        </Box>
      </Box>

      {/* Threat + content summaries */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", mb: "72px" }}>
        <Box>
          <SecHead color={C_THREAT_SUMMARY} title="Threat summary" sub="214 threat requests blocked · 7 threat types" />
          {THREATS.map((r) => (
            <BarRow key={r.nm} row={r} color={C_THREAT_SUMMARY} />
          ))}
        </Box>
        <Box>
          <SecHead color={C_CONTENT} title="Content summary" sub="12,186 content requests blocked · 6 categories + other" />
          {CONTENT.map((r) => (
            <BarRow key={r.nm} row={r} color={C_CONTENT} />
          ))}
        </Box>
      </Box>

      {/* Top blocked domains */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", mb: "72px" }}>
        <Box>
          <SecHead color={C_THREAT} title="Top blocked threat domains" sub="Share of 214 blocked threat requests" />
          {THREAT_DOMAINS.map((r) => (
            <BarRow key={r.nm} row={r} color={C_THREAT} />
          ))}
        </Box>
        <Box>
          <SecHead color={C_CONTENT_DOMAINS} title="Top blocked content domains" sub="Share of 12,186 blocked content requests" />
          {CONTENT_DOMAINS.map((r) => (
            <BarRow key={r.nm} row={r} color={C_CONTENT_DOMAINS} />
          ))}
        </Box>
      </Box>

      {/* Top active sites */}
      <Box sx={{ mb: "8px" }}>
        <SecHead color={C_SITE} title="Top active sites" sub="All 4 sites · requests resolved and blocked per site" />
        {SITES.map((r) => (
          <BarRow key={r.nm} row={r} color={C_SITE} />
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
