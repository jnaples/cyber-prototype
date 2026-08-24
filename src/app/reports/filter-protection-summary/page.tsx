// Filter Protection Overview report — converted from the revised "Filter
// Protection Summary" PDF template (1400px canvas): KPI band, top active sites
// (per-site request/threat/content trios), threat summary, content summary.
// Screen-only design annex omitted. Light-mode (PDF-style) document.

import { Box } from "@mui/material";
import type { Theme } from "@mui/material/styles";

const TEXT = "#031625";
const TEXT2 = "rgba(3,22,37,.62)";
const TEXT3 = "rgba(3,22,37,.45)";
const PRIMARY = "#3527fd";
const DIVIDER = "rgba(3,22,37,.12)";
// The page's own edge — lighter than the rules inside it.
const PAGE_BORDER = "#E5E5EC";
const TRACK = "#edf0f6";
const C_THREAT = "#ce008e"; // threatMagenta[700]
const C_CONTENT = "#ef6c00"; // orange[800]
const C_SITE = "#238cd2";

const montserrat = (theme: Theme) => theme.typography.fontSecondaryFamily;

type BarRow = { nm: string; val: string; w: number };
type DomainRow = { domain: string; cat: string; requests: string; pct: string };
type Site = {
  name: string;
  requests: string;
  threats: string;
  content: string;
};

const SITES: Site[] = [
  {
    name: "Acme HQ — Cleveland",
    requests: "182.4K",
    threats: "126",
    content: "7,088",
  },
  {
    name: "Acme Distribution — Toledo",
    requests: "64.1K",
    threats: "51",
    content: "2,782",
  },
  {
    name: "Acme Plant 2 — Akron",
    requests: "38.5K",
    threats: "9",
    content: "1,955",
  },
  {
    name: "Acme Guest Wi-Fi",
    requests: "21.2K",
    threats: "28",
    content: "361",
  },
];

const THREAT_CATEGORIES: BarRow[] = [
  { nm: "Malware", val: "89", w: 100 },
  { nm: "Botnet", val: "62", w: 69.7 },
  { nm: "Cryptomining", val: "51", w: 57.3 },
  { nm: "Phishing", val: "44", w: 49.4 },
];

const THREAT_DOMAINS: DomainRow[] = [
  {
    domain: "xj-metrics-sync.ru",
    cat: "Botnet +1",
    requests: "41",
    pct: "0.01%",
  },
  {
    domain: "crypto-pool-eu.net",
    cat: "Cryptomining",
    requests: "29",
    pct: "0.01%",
  },
  {
    domain: "cdn-newdrop.xyz",
    cat: "Malware +1",
    requests: "17",
    pct: "0.01%",
  },
  {
    domain: "login-micros0ft-verify.com",
    cat: "Phishing",
    requests: "12",
    pct: "<0.01%",
  },
  {
    domain: "update-flashplayer.top",
    cat: "Malware",
    requests: "11",
    pct: "<0.01%",
  },
  {
    domain: "tracker-relay-cdn.net",
    cat: "Botnet",
    requests: "9",
    pct: "<0.01%",
  },
  {
    domain: "free-vbucks-gen.top",
    cat: "Phishing +1",
    requests: "8",
    pct: "<0.01%",
  },
  {
    domain: "miner-gate-pool.io",
    cat: "Cryptomining",
    requests: "7",
    pct: "<0.01%",
  },
  { domain: "dl-cheatengine.ru", cat: "Malware", requests: "6", pct: "<0.01%" },
  {
    domain: "win-prize-now.club",
    cat: "Phishing",
    requests: "5",
    pct: "<0.01%",
  },
];

const CONTENT_CATEGORIES: BarRow[] = [
  { nm: "Social Networking", val: "3,847", w: 100 },
  { nm: "Streaming Media", val: "2,912", w: 75.7 },
  { nm: "Gambling", val: "1,988", w: 51.7 },
  { nm: "Adult Content", val: "1,214", w: 31.6 },
  { nm: "Games", val: "897", w: 23.3 },
  { nm: "Advertising Lite", val: "743", w: 19.3 },
  { nm: "Entertainment", val: "512", w: 13.3 },
  { nm: "Alcohol & Tobacco", val: "396", w: 10.3 },
  { nm: "P2P & Illegal", val: "288", w: 7.5 },
  { nm: "Trackers Lite", val: "246", w: 6.4 },
];

const CONTENT_DOMAINS: DomainRow[] = [
  {
    domain: "tiktok.com",
    cat: "Social Networking +2",
    requests: "1,204",
    pct: "0.39%",
  },
  { domain: "bet365.com", cat: "Gambling", requests: "987", pct: "0.32%" },
  {
    domain: "twitch.tv",
    cat: "Streaming Media +1",
    requests: "864",
    pct: "0.28%",
  },
  { domain: "roblox.com", cat: "Games", requests: "512", pct: "0.17%" },
  {
    domain: "onlyfans.com",
    cat: "Adult Content",
    requests: "498",
    pct: "0.16%",
  },
  {
    domain: "whatculture.com",
    cat: "Entertainment",
    requests: "371",
    pct: "0.12%",
  },
  {
    domain: "camel.com",
    cat: "Alcohol & Tobacco",
    requests: "342",
    pct: "0.11%",
  },
  {
    domain: "doubleclick.net",
    cat: "Advertising Lite",
    requests: "318",
    pct: "0.10%",
  },
  { domain: "2k.com", cat: "Games +1", requests: "311", pct: "0.10%" },
  {
    domain: "pinterest.com",
    cat: "Social Networking",
    requests: "297",
    pct: "0.10%",
  },
];

// ---- KPI icons (inline so they match the template's line weights) ---------

function RadarIcon() {
  return (
    <Box component="svg" viewBox="0 0 24 24" sx={iconSx(PRIMARY)}>
      <circle cx="12" cy="12" r="3" fill="currentColor" />
      <circle
        cx="12"
        cy="12"
        r="6.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </Box>
  );
}

function SkullIcon() {
  return (
    <Box component="svg" viewBox="0 0 24 24" sx={iconSx(C_THREAT)}>
      <path
        d="M12 2C7 2 3 5.9 3 10.7c0 2.9 1.5 5.1 3.5 6.4V19c0 1.1.9 2 2 2h.7v-2h1.6v2h2.4v-2h1.6v2h.7c1.1 0 2-.9 2-2v-1.9c2-1.3 3.5-3.5 3.5-6.4C21 5.9 17 2 12 2z"
        fill="currentColor"
      />
      <circle cx="8.8" cy="10.5" r="2" fill="#fff" />
      <circle cx="15.2" cy="10.5" r="2" fill="#fff" />
      <path d="M12 12.6l-1.1 2.2h2.2L12 12.6z" fill="#fff" />
    </Box>
  );
}

function BlockIcon() {
  return (
    // Same orange as the blocked-content bars further down.
    <Box component="svg" viewBox="0 0 24 24" sx={iconSx(C_CONTENT)}>
      <circle
        cx="12"
        cy="12"
        r="9.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
      />
      <line
        x1="5.4"
        y1="5.4"
        x2="18.6"
        y2="18.6"
        stroke="currentColor"
        strokeWidth="2.6"
      />
    </Box>
  );
}

function PinIcon() {
  return (
    <Box component="svg" viewBox="0 0 24 24" sx={iconSx(C_SITE)}>
      <path
        d="M12 2C8.1 2 5 5.1 5 9c0 5.3 7 13 7 13s7-7.7 7-13c0-3.9-3.1-7-7-7z"
        fill="currentColor"
      />
      <circle cx="12" cy="9.2" r="2.6" fill="#fff" />
    </Box>
  );
}

const iconSx = (color: string) => ({
  width: 34,
  height: 34,
  display: "block",
  mb: "16px",
  color,
});

const KPIS = [
  { num: "306.2K", cap: "Total requests", color: PRIMARY, Icon: RadarIcon },
  { num: "214", cap: "Blocked threats", color: C_THREAT, Icon: SkullIcon },
  { num: "12.2K", cap: "Blocked content", color: C_CONTENT, Icon: BlockIcon },
  { num: "4", cap: "Total Sites", color: C_SITE, Icon: PinIcon },
];

// ---- Shared blocks --------------------------------------------------------

function SectionHead({
  title,
  sub,
  mb = "24px",
}: {
  title: string;
  sub?: string;
  /** Gap to the section's content. */
  mb?: string;
}) {
  return (
    <Box sx={{ mb }}>
      <Box
        component="h2"
        sx={{
          // An h2's UA margin is 0.83em — an odd 19px at this size.
          my: "16px",
          fontFamily: montserrat,
          fontWeight: 600,
          fontSize: 23,
        }}
      >
        {title}
      </Box>
      {sub && <Box sx={{ fontSize: 16, color: TEXT2, mt: "4px" }}>{sub}</Box>}
    </Box>
  );
}

function ColHead({ children, first }: { children: string; first?: boolean }) {
  return (
    <Box
      sx={{
        fontSize: 20,
        fontWeight: 600,
        color: TEXT,
        mt: first ? 0 : "36px",
        mb: "16px",
      }}
    >
      {children}
    </Box>
  );
}

// Values are display strings ("182.4K", "7,088", "89"), so shares are derived
// from the parsed number rather than carried alongside each row.
function numOf(value: string) {
  const n = parseFloat(value.replace(/,/g, ""));
  if (Number.isNaN(n)) return 0;
  return /k$/i.test(value.trim()) ? n * 1000 : n;
}

function pctOf(value: string, values: string[]) {
  const total = values.reduce((sum, v) => sum + numOf(v), 0);
  if (!total) return undefined;
  return `(${((numOf(value) / total) * 100).toFixed(1)}%)`;
}

function BarRows({ rows, color }: { rows: BarRow[]; color: string }) {
  return (
    <>
      {rows.map((r) => (
        <Box key={r.nm} sx={{ mb: "18px" }}>
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
            {r.nm}
          </Box>
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
            {r.val}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
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
                  width: `${r.w}%`,
                  bgcolor: color,
                }}
              />
            </Box>
          </Box>
        </Box>
      ))}
    </>
  );
}

function DomainTable({ rows }: { rows: DomainRow[] }) {
  const th = {
    fontSize: 17,
    fontWeight: 600,
    color: TEXT2,
    textAlign: "left" as const,
    p: "0 12px 9px 0",
    borderBottom: `2px solid ${TEXT}`,
  };
  const td = {
    fontSize: 18,
    p: "12px 12px 12px 0",
    borderBottom: `1px solid ${DIVIDER}`,
    verticalAlign: "baseline",
  };
  const num = {
    textAlign: "right" as const,
    pr: 0,
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
  };

  return (
    <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
      <Box component="thead">
        <Box component="tr">
          <Box component="th" sx={th}>
            Domain
          </Box>
          <Box component="th" sx={{ ...th, width: 280 }}>
            Categories
          </Box>
          <Box component="th" sx={{ ...th, ...num, width: 160 }}>
            # of requests
          </Box>
          <Box component="th" sx={{ ...th, ...num, width: 190 }}>
            % of total requests
          </Box>
        </Box>
      </Box>
      <Box component="tbody">
        {rows.map((r) => (
          <Box component="tr" key={r.domain}>
            <Box component="td" sx={td}>
              <Box
                component="span"
                sx={{
                  display: "block",
                  maxWidth: 560,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {r.domain}
              </Box>
            </Box>
            <Box component="td" sx={{ ...td, color: TEXT2, fontSize: 17 }}>
              {r.cat}
            </Box>
            <Box component="td" sx={{ ...td, ...num }}>
              {r.requests}
            </Box>
            <Box component="td" sx={{ ...td, ...num }}>
              {r.pct}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------

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
          Filter Protection Overview
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
        {KPIS.map((k) => (
          <Box
            key={k.cap}
            sx={{
              border: `1px solid ${DIVIDER}`,
              borderRadius: "6px",
              p: "28px 32px 24px",
              // Cards stretch to the tallest in the row; keep the number and
              // caption pinned to the bottom so they line up across the band.
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <k.Icon />
            <Box sx={{ flex: 1 }} />
            <Box
              sx={{
                fontFamily: montserrat,
                fontWeight: 600,
                fontSize: 40,
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
                whiteSpace: "nowrap",
                color: k.color,
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

      {/* Top active sites */}
      <Box sx={{ mb: "72px" }}>
        <SectionHead title="Top active Sites" mb="16px" />
        <Box
          sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}
        >
          {SITES.map((s) => (
            <Box
              key={s.name}
              sx={{
                border: `1px solid ${DIVIDER}`,
                borderRadius: "6px",
                p: "24px 28px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box
                component="h3"
                sx={{
                  fontFamily: montserrat,
                  fontWeight: 600,
                  fontSize: 20,
                  mt: 0,
                  mb: "16px",
                }}
              >
                {s.name}
              </Box>
              <Box
                sx={{
                  mt: "auto",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "16px",
                  alignItems: "end",
                }}
              >
                {[
                  {
                    num: s.requests,
                    cap: "Total requests",
                    color: PRIMARY,
                    all: SITES.map((x) => x.requests),
                  },
                  {
                    num: s.threats,
                    cap: "Blocked threats",
                    color: C_THREAT,
                    all: SITES.map((x) => x.threats),
                  },
                  {
                    num: s.content,
                    cap: "Blocked content",
                    color: C_CONTENT,
                    all: SITES.map((x) => x.content),
                  },
                ].map((t) => (
                  <Box key={t.cap}>
                    <Box
                      sx={{
                        fontFamily: montserrat,
                        fontWeight: 600,
                        fontSize: 28,
                        lineHeight: 1,
                        fontVariantNumeric: "tabular-nums",
                        color: t.color,
                      }}
                    >
                      {t.num}
                    </Box>
                    <Box
                      component="span"
                      sx={{
                        display: "block",
                        fontSize: 16,
                        color: TEXT2,
                        fontVariantNumeric: "tabular-nums",
                        mt: "4px",
                      }}
                    >
                      {pctOf(t.num, t.all)}
                    </Box>
                    <Box
                      sx={{
                        // Same treatment as the KPI band captions above.
                        fontSize: 16,
                        fontWeight: 600,
                        letterSpacing: "1.5px",
                        textTransform: "uppercase",
                        color: TEXT2,
                        mt: "6px",
                      }}
                    >
                      {/* Each caption is two words; breaking every one onto two
                          lines keeps the three columns the same height, so the
                          cards read flush. */}
                      {t.cap.split(" ").map((word) => (
                        <Box
                          key={word}
                          component="span"
                          sx={{ display: "block" }}
                        >
                          {word}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Threat summary */}
      <Box sx={{ mb: "72px" }}>
        <SectionHead
          title="Threat summary"
          sub="All Sites · 214 blocked threat requests"
          mb="4px"
        />
        <ColHead first>Blocked requests by threat category</ColHead>
        <BarRows rows={THREAT_CATEGORIES} color={C_THREAT} />
        <ColHead>Top 10 blocked threat domains</ColHead>
        <DomainTable rows={THREAT_DOMAINS} />
      </Box>

      {/* Content summary */}
      <Box sx={{ mb: "72px" }}>
        <SectionHead
          title="Content summary"
          sub="All Sites · 12,186 blocked content requests"
        />
        <ColHead first>Blocked requests by content category</ColHead>
        <BarRows rows={CONTENT_CATEGORIES} color={C_CONTENT} />
        <ColHead>Top 10 blocked content domains</ColHead>
        <DomainTable rows={CONTENT_DOMAINS} />
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
