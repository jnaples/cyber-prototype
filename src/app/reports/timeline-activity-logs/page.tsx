// Activity Logs report — converted from the landscape PDF mockup.
// Rendered as one continuous light-mode (PDF-style) document: masthead, KPI
// band, and per-device "top events by duration" tables. Screen-only design
// annex omitted.

import { Box } from "@mui/material";
import type { Theme } from "@mui/material/styles";

const TEXT = "#031625";
const TEXT2 = "rgba(3,22,37,.62)";
const TEXT3 = "rgba(3,22,37,.45)";
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

type Device = {
  name: string;
  meta: string;
  rows: EventRow[];
};

const DEVICES: Device[] = [
  {
    name: "z-ktrojanowski",
    meta: "4,812 events · 130h 30m tracked · top 25 by duration",
    rows: [
      {
        type: "Website",
        dot: C.web,
        activity: "portal.zorustech.com/dashboards/noc-live",
        user: "k.trojanowski",
        cat: "Computing & Internet",
        dur: "2h 41m",
        started: "Jul 8 · 9:12 AM",
      },
      {
        type: "Application",
        dot: C.app,
        activity: "Slack",
        user: "k.trojanowski",
        cat: "—",
        catDim: true,
        dur: "2h 5m",
        started: "Jul 2 · 1:30 PM",
      },
      {
        type: "Website",
        dot: C.web,
        activity: "meet.google.com/wkq-standup-video",
        user: "k.trojanowski",
        cat: "Web Conferencing",
        dur: "1h 58m",
        started: "Jul 15 · 10:00 AM",
      },
      {
        type: "Website",
        dot: C.web,
        activity: "docs.google.com/presentation/d/q3-board-deck",
        user: "b.smith",
        cat: "Computing & Internet",
        dur: "1h 44m",
        started: "Jul 20 · 2:15 PM",
      },
      {
        type: "Machine Lock",
        dot: C.lock,
        activity: "—",
        activityDim: true,
        user: "k.trojanowski",
        cat: "—",
        catDim: true,
        dur: "1h 37m",
        started: "Jul 9 · 12:02 PM",
      },
      {
        type: "Website",
        dot: C.web,
        activity: "claude.ai/chat",
        user: "k.trojanowski",
        cat: "Artificial Intelligence",
        dur: "1h 29m",
        started: "Jul 16 · 3:40 PM",
      },
      {
        type: "Application",
        dot: C.app,
        activity: "Microsoft Excel",
        user: "k.trojanowski",
        cat: "—",
        catDim: true,
        dur: "1h 12m",
        started: "Jul 8 · 9:45 AM",
      },
      {
        type: "Website",
        dot: C.web,
        activity: "dnsfilter.atlassian.net/jira/browse/OPS-231",
        user: "k.trojanowski",
        cat: "Computing & Internet",
        dur: "1h 8m",
        started: "Jul 13 · 11:20 AM",
      },
      {
        type: "Idle",
        dot: C.idle,
        activity: "—",
        activityDim: true,
        user: "k.trojanowski",
        cat: "—",
        catDim: true,
        dur: "58m",
        started: "Jul 6 · 12:31 PM",
      },
      {
        type: "Website",
        dot: C.web,
        activity: "portal-staging.zorustech.com/qa",
        user: "k.trojanowski",
        cat: "Computing & Internet",
        dur: "52m",
        started: "Jul 4 · 4:05 PM",
      },
    ],
  },
  {
    name: "YOGA-BSMITH",
    meta: "3,304 events · 96h 0m tracked · top 25 by duration",
    rows: [
      {
        type: "Website",
        dot: C.web,
        activity: "portal.zorustech.com/reports",
        user: "b.smith",
        cat: "Computing & Internet",
        dur: "2h 12m",
        started: "Jul 7 · 10:05 AM",
      },
      {
        type: "Application",
        dot: C.app,
        activity: "Slack",
        user: "b.smith",
        cat: "—",
        catDim: true,
        dur: "1h 48m",
        started: "Jul 14 · 9:02 AM",
      },
      {
        type: "Application",
        dot: C.app,
        activity: "Zoom",
        user: "b.smith",
        cat: "Web Conferencing",
        dur: "1h 33m",
        started: "Jul 21 · 1:00 PM",
      },
      {
        type: "Website",
        dot: C.web,
        activity: "docs.google.com/document/d/roadmap-h2",
        user: "b.smith",
        cat: "Computing & Internet",
        dur: "1h 21m",
        started: "Jul 7 · 2:30 PM",
      },
      {
        type: "Machine Lock",
        dot: C.lock,
        activity: "—",
        activityDim: true,
        user: "b.smith",
        cat: "—",
        catDim: true,
        dur: "1h 15m",
        started: "Jul 10 · 12:00 PM",
      },
      {
        type: "Website",
        dot: C.web,
        activity: "gemini.google.com/app",
        user: "b.smith",
        cat: "Artificial Intelligence",
        dur: "1h 2m",
        started: "Jul 17 · 4:12 PM",
      },
      {
        type: "Website",
        dot: C.web,
        activity: "calendar.google.com",
        user: "b.smith",
        cat: "Computing & Internet",
        dur: "47m",
        started: "Jul 1 · 8:55 AM",
      },
      {
        type: "Idle",
        dot: C.idle,
        activity: "—",
        activityDim: true,
        user: "b.smith",
        cat: "—",
        catDim: true,
        dur: "41m",
        started: "Jul 22 · 12:18 PM",
      },
      {
        type: "Website",
        dot: C.web,
        activity: "www.lowes.com/order-tracking",
        user: "b.smith",
        cat: "Shopping/Retail",
        dur: "38m",
        started: "Jul 3 · 5:10 PM",
      },
      {
        type: "Application",
        dot: C.app,
        activity: "Snipping Tool",
        user: "b.smith",
        cat: "—",
        catDim: true,
        dur: "22m",
        started: "Jul 3 · 3:33 PM",
      },
    ],
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

function DeviceTable({ device }: { device: Device }) {
  return (
    <Box sx={{ mb: "48px" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          mb: "12px",
        }}
      >
        <Box sx={{ fontFamily: montserrat, fontSize: 21, fontWeight: 600 }}>
          {device.name}
        </Box>
        <Box
          sx={{
            fontSize: 16,
            color: TEXT2,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {device.meta}
        </Box>
      </Box>

      <Box
        component="table"
        sx={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}
      >
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
        <Box component="tbody">
          {device.rows.map((r, i) => (
            <Box component="tr" key={i}>
              <Box
                component="td"
                sx={{ ...cellSx, whiteSpace: "nowrap", fontWeight: 500 }}
              >
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
              <Box
                component="td"
                sx={{ ...cellSx, color: r.catDim ? TEXT3 : TEXT2 }}
              >
                {r.cat}
              </Box>
              <Box
                component="td"
                sx={{
                  ...cellSx,
                  whiteSpace: "nowrap",
                  fontWeight: 600,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {r.dur}
              </Box>
              <Box
                component="td"
                sx={{
                  ...cellSx,
                  whiteSpace: "nowrap",
                  fontVariantNumeric: "tabular-nums",
                }}
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

export default function TimelineActivityLogsReport() {
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
          <Box sx={{ fontFamily: montserrat, fontWeight: 600, fontSize: 26 }}>
            Brightwave IT
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
          Activity Logs
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

      {/* Device sections */}
      {DEVICES.map((d) => (
        <DeviceTable key={d.name} device={d} />
      ))}
    </Box>
  );
}
