// Timeline Activity Logs report — converted from the paginated landscape PDF
// mockup. Rendered as stacked fixed-size "sheet" cards (1400×1082) with a
// running header on continuation sheets, repeated table headers across breaks,
// continuation notes, and page numbering — faithful to the print geometry.
// Screen-only design annex omitted.

import { Box } from "@mui/material";
import type { Theme } from "@mui/material/styles";

const TEXT = "#031625";
const TEXT2 = "rgba(3,22,37,.62)";
const TEXT3 = "rgba(3,22,37,.45)";
const PRIMARY = "#3527fd";
const DIVIDER = "rgba(3,22,37,.12)";
const C = {
  web: "#238cd2",
  app: "#7b3ff2",
  lock: "#9aa3b5",
  idle: "#ce008e",
};

const montserrat = (theme: Theme) => theme.typography.fontSecondaryFamily;

type EventRow = {
  type: string;
  dot: string;
  activity: string;
  activityDim?: boolean;
  user: string;
  cat: string;
  catDim?: boolean;
  dur: string;
  started: string;
};

// A table block on a sheet: an optional device header, then rows. A continuation
// table (device split across a page break) omits the header but repeats <thead>.
type TableBlock = {
  header?: { name: string; meta: string };
  rows: EventRow[];
};

type Sheet = {
  blocks: TableBlock[];
  contnote: string;
  page: number;
};

const KT_HEAD = { name: "z-ktrojanowski", meta: "4,812 events · 130h 30m tracked · top 25 by duration" };

const KT_ROWS_1: EventRow[] = [
  { type: "Website", dot: C.web, activity: "portal.zorustech.com/dashboards/noc-live", user: "k.trojanowski", cat: "Computing & Internet", dur: "2h 41m", started: "Jul 8 · 9:12 AM" },
  { type: "Application", dot: C.app, activity: "Slack", user: "k.trojanowski", cat: "—", catDim: true, dur: "2h 5m", started: "Jul 2 · 1:30 PM" },
  { type: "Website", dot: C.web, activity: "meet.google.com/wkq-standup-video", user: "k.trojanowski", cat: "Web Conferencing", dur: "1h 58m", started: "Jul 15 · 10:00 AM" },
  { type: "Website", dot: C.web, activity: "docs.google.com/presentation/d/q3-board-deck", user: "b.smith", cat: "Computing & Internet", dur: "1h 44m", started: "Jul 20 · 2:15 PM" },
  { type: "Machine Lock", dot: C.lock, activity: "—", activityDim: true, user: "k.trojanowski", cat: "—", catDim: true, dur: "1h 37m", started: "Jul 9 · 12:02 PM" },
  { type: "Website", dot: C.web, activity: "claude.ai/chat", user: "k.trojanowski", cat: "Artificial Intelligence", dur: "1h 29m", started: "Jul 16 · 3:40 PM" },
  { type: "Application", dot: C.app, activity: "Microsoft Excel", user: "k.trojanowski", cat: "—", catDim: true, dur: "1h 12m", started: "Jun 30 · 9:45 AM" },
  { type: "Website", dot: C.web, activity: "dnsfilter.atlassian.net/jira/browse/OPS-231", user: "k.trojanowski", cat: "Computing & Internet", dur: "1h 8m", started: "Jul 13 · 11:20 AM" },
];

const KT_ROWS_2: EventRow[] = [
  { type: "Idle", dot: C.idle, activity: "—", activityDim: true, user: "k.trojanowski", cat: "—", catDim: true, dur: "58m", started: "Jul 6 · 12:31 PM" },
  { type: "Website", dot: C.web, activity: "portal-staging.zorustech.com/qa", user: "k.trojanowski", cat: "Computing & Internet", dur: "52m", started: "Jun 26 · 4:05 PM" },
];

const BSMITH_HEAD = { name: "YOGA-BSMITH", meta: "3,304 events · 96h 0m tracked · top 25 by duration" };

const BSMITH_ROWS: EventRow[] = [
  { type: "Website", dot: C.web, activity: "portal.zorustech.com/reports", user: "b.smith", cat: "Computing & Internet", dur: "2h 12m", started: "Jul 7 · 10:05 AM" },
  { type: "Application", dot: C.app, activity: "Slack", user: "b.smith", cat: "—", catDim: true, dur: "1h 48m", started: "Jul 14 · 9:02 AM" },
  { type: "Application", dot: C.app, activity: "Zoom", user: "b.smith", cat: "Web Conferencing", dur: "1h 33m", started: "Jul 21 · 1:00 PM" },
  { type: "Website", dot: C.web, activity: "docs.google.com/document/d/roadmap-h2", user: "b.smith", cat: "Computing & Internet", dur: "1h 21m", started: "Jun 29 · 2:30 PM" },
  { type: "Machine Lock", dot: C.lock, activity: "—", activityDim: true, user: "b.smith", cat: "—", catDim: true, dur: "1h 15m", started: "Jul 10 · 12:00 PM" },
  { type: "Website", dot: C.web, activity: "gemini.google.com/app", user: "b.smith", cat: "Artificial Intelligence", dur: "1h 2m", started: "Jul 17 · 4:12 PM" },
  { type: "Website", dot: C.web, activity: "calendar.google.com", user: "b.smith", cat: "Computing & Internet", dur: "47m", started: "Jul 1 · 8:55 AM" },
  { type: "Idle", dot: C.idle, activity: "—", activityDim: true, user: "b.smith", cat: "—", catDim: true, dur: "41m", started: "Jul 22 · 12:18 PM" },
  { type: "Website", dot: C.web, activity: "www.lowes.com/order-tracking", user: "b.smith", cat: "Shopping/Retail", dur: "38m", started: "Jul 3 · 5:10 PM" },
  { type: "Application", dot: C.app, activity: "Snipping Tool", user: "b.smith", cat: "—", catDim: true, dur: "22m", started: "Jun 25 · 3:33 PM" },
];

const SHEETS: Sheet[] = [
  {
    page: 1,
    blocks: [{ header: KT_HEAD, rows: KT_ROWS_1 }],
    contnote: "",
  },
  {
    page: 2,
    blocks: [
      { rows: KT_ROWS_2 },
      { header: BSMITH_HEAD, rows: BSMITH_ROWS },
    ],
    contnote: "",
  },
];

const KPIS = [
  { num: "18,432", cap: "Events captured" },
  { num: "443h 30m", cap: "Logged time" },
  { num: "10", cap: "Devices" },
  { num: "10", cap: "Users" },
];

const COLS: { label: string; width?: number }[] = [
  { label: "Type", width: 150 },
  { label: "Activity" },
  { label: "User", width: 150 },
  { label: "Category", width: 195 },
  { label: "Duration", width: 100 },
  { label: "Started", width: 165 },
];

const cellSx = {
  fontSize: 18,
  p: "12px 16px 12px 0",
  borderBottom: `1px solid ${DIVIDER}`,
  verticalAlign: "baseline",
} as const;

function TableHeadRow() {
  return (
    <Box component="thead">
      <Box component="tr">
        {COLS.map((c) => (
          <Box
            key={c.label}
            component="th"
            sx={{
              width: c.width,
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: "1.2px",
              textTransform: "uppercase",
              color: TEXT2,
              textAlign: "left",
              p: "0 16px 9px 0",
              borderBottom: `2px solid ${TEXT}`,
            }}
          >
            {c.label}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function TableBlockView({ block }: { block: TableBlock }) {
  return (
    <Box sx={{ mb: "26px" }}>
      {block.header && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            mb: "12px",
          }}
        >
          <Box sx={{ fontFamily: montserrat, fontSize: 21, fontWeight: 600 }}>
            {block.header.name}
          </Box>
          <Box sx={{ fontSize: 16, color: TEXT2, fontVariantNumeric: "tabular-nums" }}>
            {block.header.meta}
          </Box>
        </Box>
      )}
      <Box
        component="table"
        sx={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}
      >
        <TableHeadRow />
        <Box component="tbody">
          {block.rows.map((r, i) => (
            <Box component="tr" key={i}>
              <Box component="td" sx={{ ...cellSx, whiteSpace: "nowrap", fontWeight: 500 }}>
                <Box
                  component="i"
                  sx={{
                    display: "inline-block",
                    width: 10,
                    height: 10,
                    borderRadius: "3px",
                    mr: "9px",
                    verticalAlign: "1px",
                    bgcolor: r.dot,
                  }}
                />
                {r.type}
              </Box>
              <Box component="td" sx={cellSx}>
                <Box
                  component="span"
                  sx={{
                    display: "block",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    color: r.activityDim ? TEXT3 : undefined,
                  }}
                >
                  {r.activity}
                </Box>
              </Box>
              <Box component="td" sx={cellSx}>
                {r.user}
              </Box>
              <Box component="td" sx={{ ...cellSx, color: r.catDim ? TEXT3 : TEXT2 }}>
                {r.cat}
              </Box>
              <Box
                component="td"
                sx={{ ...cellSx, whiteSpace: "nowrap", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}
              >
                {r.dur}
              </Box>
              <Box
                component="td"
                sx={{ ...cellSx, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}
              >
                {r.started}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

// Fixed page shell — 1400 × 1082, padded, with absolutely-positioned footer.
function SheetShell({ children, page }: { children: React.ReactNode; page: number }) {
  return (
    <Box
      data-mui-color-scheme="light"
      sx={{
        width: 1400,
        height: 1082,
        flex: "none",
        position: "relative",
        overflow: "hidden",
        bgcolor: "#ffffff",
        color: TEXT,
        boxShadow: "0 2px 14px rgba(3,22,37,.14)",
        borderRadius: 1,
        mb: "48px",
        p: "64px 64px 96px",
        fontFamily: "'Inter Variable', sans-serif",
      }}
    >
      {children}
      <Box sx={{ position: "absolute", left: 64, bottom: 32, fontSize: 15, color: TEXT3 }}>
        Prepared by Brightwave IT
      </Box>
      <Box
        sx={{
          position: "absolute",
          right: 64,
          bottom: 32,
          fontSize: 15,
          color: TEXT3,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        Page {page} of {SHEETS.length}
      </Box>
    </Box>
  );
}

// Small dashed logo placeholder used in the running header on continuation sheets.
function RunHead() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        pb: "12px",
        borderBottom: `2px solid ${TEXT}`,
        mb: "24px",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: "12px", fontSize: 17, fontWeight: 600 }}>
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: "6px",
            border: `1.5px dashed ${TEXT3}`,
          }}
        />
        Timeline Activity Logs · Acme Manufacturing
      </Box>
      <Box sx={{ fontSize: 15, color: TEXT2 }}>Jun 23 – Jul 22, 2026</Box>
    </Box>
  );
}

export default function TimelineActivityLogsReport() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        overflowX: "auto",
      }}
    >
      {SHEETS.map((sheet) => (
        <SheetShell key={sheet.page} page={sheet.page}>
          {sheet.page === 1 ? (
            <>
              {/* Masthead */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  pb: "18px",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: "6px",
                      border: `2px dashed ${TEXT3}`,
                      color: TEXT3,
                      fontFamily: montserrat,
                      fontWeight: 700,
                      fontSize: 11,
                      letterSpacing: "1px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    LOGO
                  </Box>
                  <Box sx={{ fontFamily: montserrat, fontWeight: 600, fontSize: 22 }}>
                    Brightwave IT
                  </Box>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Box
                    sx={{
                      fontSize: 15,
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      color: TEXT2,
                      fontWeight: 600,
                    }}
                  >
                    Reporting period
                  </Box>
                  <Box sx={{ fontSize: 18, fontWeight: 600, mt: "2px" }}>
                    Jun 23 – Jul 22, 2026
                  </Box>
                </Box>
              </Box>
              <Box sx={{ height: "3px", bgcolor: TEXT, mb: "26px" }} />

              {/* Title block */}
              <Box
                sx={{
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: "2.5px",
                  textTransform: "uppercase",
                  color: PRIMARY,
                }}
              >
                Endpoint monitoring · Monthly report
              </Box>
              <Box
                component="h1"
                sx={{ fontFamily: montserrat, fontWeight: 600, fontSize: 34, lineHeight: 1.2, m: "8px 0 8px" }}
              >
                Timeline Activity Logs
              </Box>
              <Box sx={{ fontSize: 18, color: TEXT2, mb: "28px" }}>
                Prepared for Acme Manufacturing · Top events by duration, per device
              </Box>

              {/* KPI band */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "20px",
                  mb: "32px",
                }}
              >
                {KPIS.map((k) => (
                  <Box
                    key={k.cap}
                    sx={{ border: `1px solid ${DIVIDER}`, borderRadius: "6px", p: "20px 24px 18px" }}
                  >
                    <Box
                      sx={{ fontFamily: montserrat, fontWeight: 600, fontSize: 40, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}
                    >
                      {k.num}
                    </Box>
                    <Box
                      sx={{
                        fontSize: 15,
                        fontWeight: 600,
                        letterSpacing: "1.3px",
                        textTransform: "uppercase",
                        color: TEXT2,
                        mt: "9px",
                      }}
                    >
                      {k.cap}
                    </Box>
                  </Box>
                ))}
              </Box>
            </>
          ) : (
            <RunHead />
          )}

          {sheet.blocks.map((block, i) => (
            <TableBlockView key={i} block={block} />
          ))}

          {sheet.contnote && (
            <Box
              sx={{ fontSize: 15, color: TEXT3, fontStyle: "italic", mt: "-14px", mb: "20px" }}
            >
              {sheet.contnote}
            </Box>
          )}
        </SheetShell>
      ))}
    </Box>
  );
}
