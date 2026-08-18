// "Sample Reports" preview modal — extracted from the Report Manager design.
// A two-panel dialog: a left list of report types, and a right pane rendering a
// fake sample report (header, KPI boxes, and a chart / list / table body) using
// mock data. Shown from the "Preview Sample Reports" button.

import {
  alpha,
  Box,
  Button,
  Dialog,
  IconButton,
  Typography,
} from "@mui/material";
import { useState } from "react";

import { MaterialSymbol } from "@/components/material-symbol";

type Stat = { v: string; l: string };
type Bar = { h: number; label: string };
type ListItem = { label: string; pct: number; val: string };
type Row = { a: string; b: string; c: string; d: string; danger?: boolean };

type Preview = {
  key: string;
  icon: string;
  label: string;
  title: string;
  desc: string;
  range: string;
  stats: Stat[];
  bars?: { title: string; data: Bar[] };
  list?: { title: string; data: ListItem[] };
  table?: {
    title: string;
    heads: [string, string, string, string];
    rows: Row[];
  };
};

const BAR_LABELS = [
  "Jul 1",
  "Jul 8",
  "Jul 15",
  "Jul 22",
  "Jul 29",
  "Aug 5",
  "Aug 12",
];

const PREVIEWS: Preview[] = [
  {
    key: "activity",
    icon: "monitoring",
    label: "Activity Summary",
    title: "Activity Summary",
    desc: "Total DNS activity, allows, and blocks across all Sites for the reporting period.",
    range: "Jul 1 – Jul 31, 2026",
    stats: [
      { v: "1.66M", l: "Total Requests" },
      { v: "1.16M", l: "Allowed" },
      { v: "494k", l: "Blocked" },
      { v: "115k", l: "Threats" },
    ],
    bars: {
      title: "Requests over time",
      data: [72, 88, 64, 95, 80, 40, 30].map((h, i) => ({
        h,
        label: BAR_LABELS[i],
      })),
    },
  },
  {
    key: "protection",
    icon: "shield",
    label: "Protection Summary",
    title: "Filter Protection Summary",
    desc: "Threats and content categories blocked, with the most active protection policies.",
    range: "Jul 1 – Jul 31, 2026",
    stats: [
      { v: "115k", l: "Threats Blocked" },
      { v: "38", l: "Categories" },
      { v: "Phishing", l: "Top Threat" },
      { v: "1,540", l: "Protected Devices" },
    ],
    bars: {
      title: "Threats blocked over time",
      data: [40, 55, 48, 70, 62, 35, 28].map((h, i) => ({
        h,
        label: BAR_LABELS[i],
      })),
    },
  },
  {
    key: "traffic",
    icon: "table_chart",
    label: "Query Logs",
    title: "DNS Query Logs",
    desc: "Detailed DNS query activity sampled across endpoints.",
    range: "Jul 22, 2026 · last 24 hours",
    stats: [
      { v: "255", l: "Queries" },
      { v: "221", l: "Allowed" },
      { v: "34", l: "Blocked" },
      { v: "7", l: "Threats" },
    ],
    table: {
      title: "Recent queries",
      heads: ["Domain", "Category", "Site", "Result"],
      rows: [
        {
          a: "app.salesforce.com",
          b: "Business, CRM",
          c: "NYC Office",
          d: "Allowed",
        },
        {
          a: "drive.google.com",
          b: "Productivity",
          c: "Headquarters",
          d: "Allowed",
        },
        {
          a: "www.facebook.com",
          b: "Social Networking",
          c: "Miami Office",
          d: "Blocked",
          danger: true,
        },
        { a: "slack.com", b: "Collaboration", c: "Headquarters", d: "Allowed" },
        {
          a: "coin-hive.com",
          b: "Cryptomining",
          c: "SF Campus",
          d: "Threat",
          danger: true,
        },
      ],
    },
  },
  {
    key: "ai",
    icon: "auto_awesome",
    label: "AI Tool Usage",
    title: "AI Tool Usage",
    desc: "AI-driven detections and the categories CyberSight flagged this period.",
    range: "Jul 1 – Jul 31, 2026",
    stats: [
      { v: "2,914", l: "AI Detections" },
      { v: "18", l: "Zero-day Blocks" },
      { v: "99.2%", l: "Coverage" },
      { v: "42", l: "Sites" },
    ],
    list: {
      title: "Top AI detections",
      data: [
        { label: "Newly registered domains", pct: 90, val: "1,204" },
        { label: "Phishing lookalikes", pct: 68, val: "842" },
        { label: "Malware C2", pct: 44, val: "531" },
        { label: "DGA domains", pct: 24, val: "287" },
        { label: "Typosquats", pct: 8, val: "50" },
      ],
    },
  },
  {
    key: "timeline",
    icon: "show_chart",
    label: "Executive Summary",
    title: "Executive Summary",
    desc: "Usage trends and the most-requested domains at a glance.",
    range: "Jul 1 – Jul 31, 2026",
    stats: [
      { v: "1.66M", l: "Total Requests" },
      { v: "8,412", l: "Unique Domains" },
      { v: "google.com", l: "Top Domain" },
      { v: "6", l: "Organizations" },
    ],
    list: {
      title: "Top domains",
      data: [
        { label: "google.com", pct: 100, val: "4,197" },
        { label: "microsoft.com", pct: 81, val: "3,412" },
        { label: "youtube.com", pct: 68, val: "2,865" },
        { label: "apple.com", pct: 46, val: "1,930" },
        { label: "cloudflare.com", pct: 39, val: "1,644" },
      ],
    },
  },
];

// ---------------------------------------------------------------------------

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      sx={{
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.6px",
        textTransform: "uppercase",
        color: "text.secondary",
        mt: 3,
        mb: 1.5,
      }}
    >
      {children}
    </Typography>
  );
}

function ReportPreview({ p }: { p: Preview }) {
  return (
    <Box
      // Always render the report itself in light mode — the emailed PDF is a
      // light-mode document, so the preview should match regardless of the
      // app's current theme.
      data-mui-color-scheme="light"
      sx={{
        width: 660,
        maxWidth: "100%",
        mx: "auto",
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "2px",
        boxShadow: 1,
        p: "32px 36px",
        color: "text.primary",
      }}
    >
      {/* Report header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          pb: 1.75,
          borderBottom: "2px solid",
          borderColor: "text.primary",
        }}
      >
        <MaterialSymbol name="lan" size={22} sx={{ color: "primary.main" }} />
        <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
          Dunder Mifflin
        </Typography>
        <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
          Managed DNS Security
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
          {p.range}
        </Typography>
      </Box>

      <Typography sx={{ fontWeight: 600, fontSize: 20, mt: 2.25, mb: 0.5 }}>
        {p.title}
      </Typography>
      <Typography
        sx={{ fontSize: 12, color: "text.secondary", lineHeight: 1.5 }}
      >
        {p.desc}
      </Typography>

      {/* KPI boxes */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 1.5,
          mt: 2.5,
        }}
      >
        {p.stats.map((s) => (
          <Box
            key={s.l}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              p: 1.5,
            }}
          >
            <Typography
              sx={{
                fontSize: 18,
                fontWeight: 600,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {s.v}
            </Typography>
            <Typography
              sx={{ fontSize: 11, color: "text.secondary", mt: 0.25 }}
            >
              {s.l}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Chart */}
      {p.bars && (
        <>
          <SectionTitle>{p.bars.title}</SectionTitle>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-end",
              gap: 1,
              height: 120,
              borderBottom: "1px solid",
              borderColor: "divider",
              px: 0.5,
            }}
          >
            {p.bars.data.map((b, i) => (
              <Box
                key={i}
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  height: "100%",
                }}
              >
                <Box
                  sx={{
                    height: `${b.h}%`,
                    bgcolor: "primary.main",
                    borderRadius: "2px 2px 0 0",
                    opacity: 0.85,
                  }}
                />
              </Box>
            ))}
          </Box>
          <Box sx={{ display: "flex", gap: 1, px: 0.5, pt: 0.75 }}>
            {p.bars.data.map((b, i) => (
              <Typography
                key={i}
                sx={{
                  flex: 1,
                  textAlign: "center",
                  fontSize: 10,
                  color: "text.secondary",
                }}
              >
                {b.label}
              </Typography>
            ))}
          </Box>
        </>
      )}

      {/* List */}
      {p.list && (
        <>
          <SectionTitle>{p.list.title}</SectionTitle>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            {p.list.data.map((i) => (
              <Box
                key={i.label}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "170px 1fr 64px",
                  gap: 1.5,
                  alignItems: "center",
                }}
              >
                <Typography noWrap sx={{ fontSize: 12 }}>
                  {i.label}
                </Typography>
                <Box
                  sx={{
                    height: 8,
                    bgcolor: "background.default",
                    borderRadius: 999,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      height: "100%",
                      width: `${i.pct}%`,
                      bgcolor: "primary.main",
                      borderRadius: 999,
                    }}
                  />
                </Box>
                <Typography
                  sx={{
                    fontSize: 11,
                    textAlign: "right",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {i.val}
                </Typography>
              </Box>
            ))}
          </Box>
        </>
      )}

      {/* Table */}
      {p.table && (
        <>
          <SectionTitle>{p.table.title}</SectionTitle>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1.3fr 1.2fr 1fr 1.1fr",
              gap: "0 12px",
              py: 1,
              borderBottom: "1px solid",
              borderColor: "divider",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              color: "text.secondary",
            }}
          >
            {p.table.heads.map((h) => (
              <Box component="span" key={h}>
                {h}
              </Box>
            ))}
          </Box>
          {p.table.rows.map((r, i) => (
            <Box
              key={i}
              sx={{
                display: "grid",
                gridTemplateColumns: "1.3fr 1.2fr 1fr 1.1fr",
                gap: "0 12px",
                py: 1,
                borderBottom: "1px solid",
                borderColor: "divider",
                fontSize: 12,
              }}
            >
              <Typography noWrap sx={{ fontSize: 12 }}>
                {r.a}
              </Typography>
              <Typography noWrap sx={{ fontSize: 12 }}>
                {r.b}
              </Typography>
              <Typography sx={{ fontSize: 12 }}>{r.c}</Typography>
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: r.danger ? "error.main" : "success.main",
                }}
              >
                {r.d}
              </Typography>
            </Box>
          ))}
        </>
      )}

      {/* Report footer */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mt: 3.5,
          pt: 1.5,
          borderTop: "1px solid",
          borderColor: "divider",
          fontSize: 10,
          color: "text.secondary",
        }}
      >
        <Box component="span">Generated by DNSFilter for Dunder Mifflin</Box>
        <Box component="span">Sample data · Page 1 of 3</Box>
      </Box>
    </Box>
  );
}

export function SampleReportsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState(0);
  const active = PREVIEWS[selected];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      slotProps={{
        paper: {
          elevation: 1,
          sx: {
            width: 980,
            maxWidth: "95vw",
            height: "min(760px, 90vh)",
            borderRadius: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          },
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2.5,
          pt: 2,
          pb: 0.5,
        }}
      >
        <Typography sx={{ fontSize: 18, fontWeight: 600 }}>
          Sample Reports
        </Typography>
        <Box sx={{ flex: 1 }} />
        <IconButton size="small" aria-label="Close" onClick={onClose}>
          <MaterialSymbol name="close" size={20} />
        </IconButton>
      </Box>

      {/* Info note — directly under the title, no divider between */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2.5,
          pt: 0,
          pb: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          fontSize: 14,
          color: "text.secondary",
        }}
      >
        <MaterialSymbol name="info" size={16} sx={{ color: "primary.light" }} />
        Previews use sample data — scheduled reports include your
        customer&apos;s live data.
      </Box>

      {/* Body */}
      <Box sx={{ flex: 1, display: "flex", minHeight: 0 }}>
        {/* Tabs */}
        <Box
          sx={{
            width: 230,
            flexShrink: 0,
            borderRight: "1px solid",
            borderColor: "divider",
            p: 2,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {PREVIEWS.map((p, i) => {
            const on = i === selected;
            return (
              <Box
                key={p.key}
                onClick={() => setSelected(i)}
                sx={(theme) => ({
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1,
                  borderRadius: 1,
                  cursor: "pointer",
                  fontSize: 16,
                  fontWeight: 400,
                  color: on ? "text.primary" : "text.secondary",
                  // Match the data-grid selected-row tint.
                  bgcolor: on
                    ? alpha(theme.palette.primary.main, 0.08)
                    : "transparent",
                  "&:hover": {
                    bgcolor: on
                      ? alpha(theme.palette.primary.main, 0.12)
                      : theme.palette.action.hover,
                  },
                })}
              >
                <MaterialSymbol
                  name={p.icon}
                  size={20}
                  sx={{ flexShrink: 0 }}
                />
                {p.label}
              </Box>
            );
          })}
        </Box>

        {/* Preview */}
        <Box
          sx={{
            flex: 1,
            bgcolor: "background.default",
            overflowY: "auto",
            m: 2,
            borderRadius: 1,
            p: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <ReportPreview p={active} />
        </Box>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2.5,
          py: 1.75,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Button
          variant="outlined"
          color="secondary"
          size="small"
          onClick={onClose}
        >
          Close
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={onClose}
        >
          Schedule this report
        </Button>
      </Box>
    </Dialog>
  );
}
