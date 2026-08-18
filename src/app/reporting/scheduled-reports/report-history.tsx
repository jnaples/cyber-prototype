// Report Manager → History. Every report run that has been generated, with
// its delivery status and a per-row download action.

import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Typography,
} from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { useCallback, useState } from "react";

import { ArrowTooltip } from "@/components/arrow-tooltip";
import { DataTable } from "@/components/data-table";
import { MaterialSymbol } from "@/components/material-symbol";
import type { StatusTabConfig } from "@/components/tabbed-data-card";
import { TabbedDataCard } from "@/components/tabbed-data-card";

import { downloadQueryLogsCsv } from "./query-logs-csv";
import { downloadTimelineLogsCsv } from "./timeline-logs-csv";
import { ReportPrintDocument } from "./report-print";
import { REPORTS } from "./reports";

type RunStatus = "available" | "processing" | "failed";

type HistoryRow = {
  id: number;
  reportType: string;
  reportName: string;
  customer: string;
  /** Date range the report covers, e.g. "Jul 1–31". */
  period: string;
  /** Whether a schedule produced this run or someone exported it by hand. */
  source: "Manual" | "Scheduled";
  runAt: string;
  status: RunStatus;
  /** Email outcome — a dash for manual exports, which aren't delivered. */
  delivery: string;
};

const STATUS_LABEL: Record<RunStatus, string> = {
  available: "Available",
  processing: "Processing",
  failed: "Failed",
};

// Runs from the last two weeks — the recurring daily query-log export plus a
// few one-off runs from other users.
const HISTORY: HistoryRow[] = [
  {
    id: 1,
    reportType: "DNS Query Logs",
    reportName: "DNS Query Logs",
    customer: "Hamel Services LLC",
    period: "Aug 5",
    source: "Scheduled",
    runAt: "Aug 6, 2026 11:00 AM",
    status: "available",
    delivery: "Delivered",
  },
  {
    id: 2,
    reportType: "Activity Summary",
    reportName: "Monthly Executive Summary",
    customer: "Acme Manufacturing",
    period: "Jul 1–31",
    source: "Scheduled",
    runAt: "Aug 5, 2026 8:00 AM",
    status: "available",
    delivery: "Delivered",
  },
  {
    id: 3,
    reportType: "DNS Query Logs",
    reportName: "DNS Query Logs",
    customer: "Hamel Services LLC",
    period: "Aug 4",
    source: "Scheduled",
    runAt: "Aug 5, 2026 11:01 AM",
    status: "available",
    delivery: "Delivered",
  },
  {
    id: 4,
    reportType: "AI Tool Usage",
    reportName: "CyberSight AI Monthly Review",
    customer: "Globex Financial",
    period: "Jul 1–31",
    source: "Scheduled",
    runAt: "Aug 4, 2026 9:00 AM",
    status: "failed",
    delivery: "Not sent",
  },
  {
    id: 5,
    reportType: "DNS Query Logs",
    reportName: "DNS Query Logs",
    customer: "Hamel Services LLC",
    period: "Aug 3",
    source: "Scheduled",
    runAt: "Aug 4, 2026 11:01 AM",
    status: "available",
    delivery: "Delivered",
  },
  {
    id: 6,
    reportType: "Filter Protection Summary",
    reportName: "Weekly Protection Recap",
    customer: "Umbrella Health",
    period: "Jul 27–Aug 2",
    source: "Scheduled",
    runAt: "Aug 3, 2026 7:30 AM",
    status: "available",
    delivery: "Delivered",
  },
  {
    id: 7,
    reportType: "DNS Query Logs",
    reportName: "DNS Query Logs",
    customer: "Hamel Services LLC",
    period: "Aug 2",
    source: "Scheduled",
    runAt: "Aug 3, 2026 11:01 AM",
    status: "available",
    delivery: "Bounced (2)",
  },
  {
    id: 8,
    reportType: "Executive Summary",
    reportName: "Business Review Packet",
    customer: "Acme Manufacturing",
    period: "Jul 1–31",
    source: "Manual",
    runAt: "Aug 2, 2026 6:15 AM",
    status: "available",
    delivery: "-",
  },
  {
    id: 9,
    reportType: "DNS Query Logs",
    reportName: "DNS Query Logs",
    customer: "Hamel Services LLC",
    period: "Aug 1",
    source: "Scheduled",
    runAt: "Aug 2, 2026 11:00 AM",
    status: "available",
    delivery: "Delivered",
  },
  {
    id: 10,
    reportType: "DNS Query Logs",
    reportName: "DNS Query Logs",
    customer: "Hamel Services LLC",
    period: "Jul 31",
    source: "Scheduled",
    runAt: "Aug 1, 2026 11:01 AM",
    status: "available",
    delivery: "Delivered",
  },
  {
    id: 11,
    reportType: "Activity Summary",
    reportName: "Acme Weekly Traffic Digest",
    customer: "Acme Manufacturing",
    period: "Jul 24–30",
    source: "Scheduled",
    runAt: "Jul 31, 2026 7:00 AM",
    status: "available",
    delivery: "Delivered",
  },
  {
    id: 12,
    reportType: "Filter Protection Summary",
    reportName: "Weekly Protection Recap",
    customer: "Umbrella Health",
    period: "Jul 20–26",
    source: "Scheduled",
    runAt: "Jul 27, 2026 7:30 AM",
    status: "available",
    delivery: "Delivered",
  },
  {
    id: 13,
    reportType: "AI Tool Usage",
    reportName: "AI Adoption Snapshot",
    customer: "Acme Manufacturing",
    period: "Jul 1–31",
    source: "Manual",
    runAt: "Aug 6, 2026 6:45 AM",
    status: "available",
    delivery: "-",
  },
  {
    id: 14,
    reportType: "AI Tool Usage",
    reportName: "CyberSight AI Monthly Review",
    customer: "Umbrella Health",
    period: "Jul 1–31",
    source: "Scheduled",
    runAt: "Aug 3, 2026 9:12 AM",
    status: "processing",
    delivery: "Not sent",
  },
  {
    id: 15,
    reportType: "AI Tool Usage",
    reportName: "AI Query Volume by Device",
    customer: "Hamel Services LLC",
    period: "Jul 1–29",
    source: "Manual",
    runAt: "Jul 30, 2026 2:20 PM",
    status: "available",
    delivery: "-",
  },
  {
    id: 16,
    reportType: "Threat Trends",
    reportName: "Monthly Threat Briefing",
    customer: "Globex Financial",
    period: "Jul 1–31",
    source: "Scheduled",
    runAt: "Aug 5, 2026 5:05 AM",
    status: "available",
    delivery: "Delivered",
  },
  {
    id: 17,
    reportType: "Threat Trends",
    reportName: "Quarterly Threat Review",
    customer: "Acme Manufacturing",
    period: "Apr 1–Jun 30",
    source: "Manual",
    runAt: "Jul 29, 2026 8:40 AM",
    status: "available",
    delivery: "-",
  },
];

function StatusCell({ status }: { status: RunStatus }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
      <Chip
        size="small"
        label={STATUS_LABEL[status]}
        sx={(theme) => {
          const tone =
            status === "failed"
              ? {
                  bgcolor: theme.vars.palette.Alert.errorStandardBg,
                  color: theme.vars.palette.Alert.errorColor,
                }
              : status === "processing"
                ? {
                    bgcolor: theme.vars.palette.Alert.warningStandardBg,
                    color: theme.vars.palette.Alert.warningColor,
                  }
                : {
                    bgcolor: theme.vars.palette.Alert.successStandardBg,
                    color: theme.vars.palette.Alert.successColor,
                  };
          return { ...tone, fontWeight: 600 };
        }}
      />
    </Box>
  );
}

// Report Type matches a catalog title, which is how a row finds its document.
const REPORT_KEY_BY_TYPE: Record<string, string> = Object.fromEntries(
  REPORTS.map((r) => [r.title, r.key]),
);

// Reports the catalog ships as a spreadsheet export rather than a document —
// those download as a real CSV instead of going through the PDF capture.
const CSV_DOWNLOADS: Record<string, (fileName: string) => void> = {
  traffic: downloadQueryLogsCsv,
  "timeline-logs": downloadTimelineLogsCsv,
};

function ActionsCell({ row }: { row: HistoryRow }) {
  const available = row.status === "available";
  const [printing, setPrinting] = useState(false);
  const stopPrinting = useCallback(() => setPrinting(false), []);
  // "Aug 6, 2026 4:00 PM" -> "Aug 6, 2026"; the time would put a colon in the
  // file name.
  const runDate = row.runAt.replace(/ \d{1,2}:\d{2} [AP]M$/, "");
  const fileName = `${row.reportName} - ${runDate}`;
  const reportKey = REPORT_KEY_BY_TYPE[row.reportType] ?? "";
  const downloadCsvFile = CSV_DOWNLOADS[reportKey];

  const download = () => {
    // A CSV is written straight out; only the document reports need the
    // offscreen render the spinner covers.
    if (downloadCsvFile) {
      downloadCsvFile(fileName);
      return;
    }
    setPrinting(true);
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
      }}
    >
      {/* Nothing to download until the run finishes, so the tip is dropped
          rather than promising an action the button won't take. */}
      <ArrowTooltip
        title={
          !available || printing
            ? ""
            : downloadCsvFile !== undefined
              ? "Download CSV"
              : "Download report"
        }
      >
        <IconButton
          size="small"
          aria-label="Download"
          // Building the PDF takes a beat; the spinner stands in for the icon
          // so the row shows the click landed.
          disabled={!available || printing}
          onClick={download}
          sx={{ "&.Mui-disabled": { color: "text.disabled" } }}
        >
          {printing ? (
            <CircularProgress
              size={20}
              // Primary blue is too dark to read against the dark grid.
              sx={(theme) => ({
                color: "primary.main",
                ...theme.applyStyles("dark", {
                  color: theme.vars.palette.primary.light,
                }),
              })}
            />
          ) : (
            <MaterialSymbol name="download" size={20} />
          )}
        </IconButton>
      </ArrowTooltip>
      {printing && (
        <ReportPrintDocument
          reportKey={reportKey}
          fileName={fileName}
          onDone={stopPrinting}
        />
      )}
    </Box>
  );
}

const columns: GridColDef<HistoryRow>[] = [
  {
    field: "reportName",
    headerName: "Report Name",
    flex: 1.2,
    minWidth: 200,
  },
  {
    field: "reportType",
    headerName: "Report Type",
    flex: 1.1,
    minWidth: 190,
  },
  { field: "customer", headerName: "Organization", flex: 1, minWidth: 170 },
  { field: "period", headerName: "Period", flex: 0.8, minWidth: 130 },
  { field: "source", headerName: "Source", flex: 0.7, minWidth: 110 },
  { field: "runAt", headerName: "Generated", flex: 1, minWidth: 170 },
  {
    field: "status",
    headerName: "Status",
    flex: 0.9,
    minWidth: 140,
    renderCell: (params) => <StatusCell status={params.row.status} />,
  },
  {
    field: "delivery",
    headerName: "Delivery",
    flex: 0.9,
    minWidth: 140,
    renderCell: (params) => (
      <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
        <Typography
          variant="body2"
          sx={{
            // A bounce is the one delivery state worth catching the eye.
            color: params.row.delivery.startsWith("Bounced")
              ? "error.main"
              : "text.primary",
          }}
        >
          {params.row.delivery}
        </Typography>
      </Box>
    ),
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 104,
    headerAlign: "center",
    sortable: false,
    filterable: false,
    resizable: false,
    hideable: false,
    renderCell: (params) => <ActionsCell row={params.row} />,
  },
];

export function ReportHistory() {
  const [cardTab, setCardTab] = useState(0);

  const total = HISTORY.length;
  const counts = {
    available: HISTORY.filter((r) => r.status === "available").length,
    processing: HISTORY.filter((r) => r.status === "processing").length,
    failed: HISTORY.filter((r) => r.status === "failed").length,
  };

  const tabsConfig: StatusTabConfig[] = [
    {
      icon: "format_list_bulleted",
      count: total,
      label: "All",
      color: "primary.main",
      iconColorVar: "var(--dnsf-palette-primary-main)",
      progressValue: 100,
    },
    {
      icon: "check_circle",
      count: counts.available,
      label: "Available",
      color: "success.main",
      iconColorVar: "var(--dnsf-palette-success-main)",
      progressValue: total ? (counts.available / total) * 100 : 0,
    },
    {
      icon: "hourglass_empty",
      count: counts.processing,
      label: "Processing",
      color: "warning.main",
      iconColorVar: "var(--dnsf-palette-warning-main)",
      progressValue: total ? (counts.processing / total) * 100 : 0,
    },
    {
      icon: "error",
      count: counts.failed,
      label: "Failed",
      color: "error.main",
      iconColorVar: "var(--dnsf-palette-error-main)",
      progressValue: total ? (counts.failed / total) * 100 : 0,
    },
  ];

  const statusForTab: (RunStatus | null)[] = [
    null,
    "available",
    "processing",
    "failed",
  ];
  const activeStatus = statusForTab[cardTab];
  const visibleRows = activeStatus
    ? HISTORY.filter((r) => r.status === activeStatus)
    : HISTORY;

  return (
    <TabbedDataCard
      tabs={tabsConfig}
      activeTab={cardTab}
      onTabChange={(_, newValue) => setCardTab(newValue)}
    >
      <DataTable
        rows={visibleRows}
        columns={columns}
        pinnedShadowFields={{ left: "reportType", right: "actions" }}
      />
    </TabbedDataCard>
  );
}
