// Report Manager → History. Every report run that has been generated, with
// its delivery status and a per-row download action.

import { Box, Chip, CircularProgress, IconButton } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { useCallback, useState } from "react";

import { ArrowTooltip } from "@/components/arrow-tooltip";
import { DataTable } from "@/components/data-table";
import { MaterialSymbol } from "@/components/material-symbol";
import type { StatusTabConfig } from "@/components/tabbed-data-card";
import { TabbedDataCard } from "@/components/tabbed-data-card";
import { useOrgScope } from "@/hooks/use-org-scope";

import { downloadQueryLogsCsv } from "./query-logs-csv";
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
  /** Email outcome — a double dash for manual exports, which aren't
   *  delivered. */
  delivery: string;
};

/** Processing answers "is this stuck?", so it reads relative — and never gets
 *  old: a run takes minutes, so "90 min ago" is the signal you want. A Ready
 *  or Failed run answers "which run was this?", so it keeps its timestamp;
 *  degrading that to "2 days ago" takes away what the column is for, and a
 *  column mixing both has no scannable order. The year is dropped inside the
 *  current one. */
function formatStarted(row: HistoryRow) {
  const when = new Date(row.runAt);

  if (row.status === "processing") {
    const minutes = Math.max(
      1,
      Math.round((Date.now() - when.getTime()) / 60_000),
    );
    if (minutes < 60) return `${minutes} min ago`;
    return `${Math.round(minutes / 60)} hr ago`;
  }

  const date = when.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const time = when.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return when.getFullYear() === new Date().getFullYear()
    ? `${date}, ${time}`
    : `${date}, ${when.getFullYear()} ${time}`;
}

const STATUS_LABEL: Record<RunStatus, string> = {
  available: "Download available",
  processing: "Processing",
  failed: "Failed",
};

// Runs are dated from now rather than pinned to fixed days, so the list stays
// inside the retention window however long the prototype sits.
const daysAgo = (days: number, hour: number, minute: number) => {
  const when = new Date();
  when.setDate(when.getDate() - days);
  when.setHours(hour, minute, 0, 0);
  return when.toISOString();
};

const minutesAgo = (minutes: number) =>
  new Date(Date.now() - minutes * 60_000).toISOString();

// Runs from the last few weeks — recurring scheduled deliveries plus a few
// one-off runs from other users.
const HISTORY: HistoryRow[] = [
  {
    id: 1,
    reportType: "Activity Overview",
    reportName: "Daily Activity Recap",
    customer: "Coastal Property Mgmt",
    period: "Sep 21",
    source: "Scheduled",
    runAt: daysAgo(0, 11, 0),
    status: "available",
    delivery: "Delivered",
  },
  {
    id: 2,
    reportType: "Filter Protection Overview",
    reportName: "Monthly Protection Summary",
    customer: "Acme Retail Group",
    period: "Aug 1–31",
    source: "Scheduled",
    runAt: daysAgo(1, 8, 0),
    status: "available",
    delivery: "Delivered",
  },
  {
    id: 3,
    reportType: "Activity Overview",
    reportName: "Coastal Weekly Digest",
    customer: "Coastal Property Mgmt",
    period: "Sep 14–20",
    source: "Scheduled",
    runAt: daysAgo(1, 11, 1),
    status: "available",
    delivery: "Delivered",
  },
  {
    id: 4,
    reportType: "AI Tool Usage",
    reportName: "CyberSight AI Monthly Review",
    customer: "Summit Financial Advisors",
    period: "Aug 1–31",
    source: "Scheduled",
    runAt: daysAgo(2, 9, 0),
    status: "failed",
    delivery: "Not sent",
  },
  {
    id: 5,
    reportType: "Activity Overview",
    reportName: "Daily Activity Recap",
    customer: "Coastal Property Mgmt",
    period: "Sep 19",
    source: "Scheduled",
    runAt: daysAgo(2, 11, 1),
    status: "available",
    delivery: "Delivered",
  },
  {
    id: 6,
    reportType: "Filter Protection Overview",
    reportName: "Weekly Protection Recap",
    customer: "Riverside Dental Group",
    period: "Sep 12–18",
    source: "Scheduled",
    runAt: daysAgo(3, 7, 30),
    status: "available",
    delivery: "Delivered",
  },
  {
    id: 7,
    reportType: "User Threat Activity",
    reportName: "Coastal Threat Recap",
    customer: "Coastal Property Mgmt",
    period: "Sep 12–18",
    source: "Scheduled",
    runAt: daysAgo(3, 11, 1),
    status: "available",
    delivery: "Bounced (2)",
  },
  {
    id: 8,
    reportType: "Filter Protection Overview",
    reportName: "Business Review Packet",
    customer: "Acme Retail Group",
    period: "Aug 1–31",
    source: "Manual",
    runAt: daysAgo(4, 6, 15),
    status: "available",
    delivery: "--",
  },
  {
    id: 9,
    reportType: "Activity Overview",
    reportName: "Daily Activity Recap",
    customer: "Coastal Property Mgmt",
    period: "Sep 17",
    source: "Scheduled",
    runAt: daysAgo(4, 11, 0),
    status: "available",
    delivery: "Delivered",
  },
  {
    id: 10,
    reportType: "Filter Protection Overview",
    reportName: "Coastal Protection Recap",
    customer: "Coastal Property Mgmt",
    period: "Sep 9–15",
    source: "Scheduled",
    runAt: daysAgo(5, 11, 1),
    status: "available",
    delivery: "Delivered",
  },
  {
    id: 11,
    reportType: "Filter Protection Overview",
    reportName: "Acme Weekly Protection Digest",
    customer: "Acme Retail Group",
    period: "Sep 9–15",
    source: "Scheduled",
    runAt: daysAgo(6, 7, 0),
    status: "available",
    delivery: "Delivered",
  },
  {
    id: 12,
    reportType: "Filter Protection Overview",
    reportName: "Weekly Protection Recap",
    customer: "Riverside Dental Group",
    period: "Sep 5–11",
    source: "Scheduled",
    runAt: daysAgo(10, 7, 30),
    status: "available",
    delivery: "Delivered",
  },
  {
    id: 13,
    reportType: "AI Tool Usage",
    reportName: "AI Adoption Snapshot",
    customer: "Northwind Traders",
    period: "Aug 1–31",
    source: "Manual",
    runAt: daysAgo(0, 6, 45),
    status: "available",
    delivery: "--",
  },
  {
    id: 14,
    reportType: "AI Tool Usage",
    reportName: "CyberSight AI Monthly Review",
    customer: "Riverside Dental Group",
    period: "Aug 1–31",
    source: "Scheduled",
    runAt: minutesAgo(4),
    status: "processing",
    delivery: "Not sent",
  },
  {
    id: 15,
    reportType: "AI Tool Usage",
    reportName: "AI Query Volume by Device",
    customer: "Coastal Property Mgmt",
    period: "Aug 1–29",
    source: "Manual",
    runAt: daysAgo(7, 14, 20),
    status: "available",
    delivery: "--",
  },
  {
    id: 16,
    reportType: "User Threat Activity",
    reportName: "Monthly Threat Briefing",
    customer: "Summit Financial Advisors",
    period: "Aug 1–31",
    source: "Scheduled",
    runAt: daysAgo(1, 5, 5),
    status: "available",
    delivery: "Delivered",
  },
  {
    id: 17,
    reportType: "User Threat Activity",
    reportName: "Quarterly Threat Review",
    customer: "Lakeside Law Group",
    period: "Apr 1–Jun 30",
    source: "Manual",
    runAt: daysAgo(8, 8, 40),
    status: "available",
    delivery: "--",
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
};

function ActionsCell({ row }: { row: HistoryRow }) {
  const available = row.status === "available";
  const [printing, setPrinting] = useState(false);
  const stopPrinting = useCallback(() => setPrinting(false), []);
  // The date alone — a time would put a colon in the file name.
  const runDate = new Date(row.runAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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
    field: "reportType",
    headerName: "Report Type",
    flex: 1.1,
    minWidth: 190,
  },
  {
    // A manual export came from nobody's schedule, so it has no name to show.
    field: "reportName",
    headerName: "Schedule Name",
    flex: 1.1,
    minWidth: 180,
    valueGetter: (_value, row) =>
      row.source === "Scheduled" ? row.reportName : "--",
  },
  { field: "source", headerName: "Source", flex: 0.7, minWidth: 110 },
  { field: "customer", headerName: "Organization", flex: 1, minWidth: 170 },
  {
    // Sorted on the raw ISO stamp; only the cell reads by state.
    field: "runAt",
    headerName: "Started",
    flex: 1,
    minWidth: 170,
    renderCell: (params) => formatStarted(params.row),
  },
  {
    field: "status",
    headerName: "Status",
    flex: 0.9,
    minWidth: 140,
    renderCell: (params) => <StatusCell status={params.row.status} />,
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
  // The header's scope chip narrows history to one organization.
  const { organization } = useOrgScope();

  const inScope = organization
    ? HISTORY.filter((r) => r.customer === organization)
    : HISTORY;
  const total = inScope.length;
  const counts = {
    available: inScope.filter((r) => r.status === "available").length,
    processing: inScope.filter((r) => r.status === "processing").length,
    failed: inScope.filter((r) => r.status === "failed").length,
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
      label: "Download available",
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
  // Scope first, then the status tab, so the tab counts and the rows agree.
  const scopedRows = organization
    ? HISTORY.filter((r) => r.customer === organization)
    : HISTORY;
  const visibleRows = activeStatus
    ? scopedRows.filter((r) => r.status === activeStatus)
    : scopedRows;

  return (
    <TabbedDataCard
      tabs={tabsConfig}
      activeTab={cardTab}
      onTabChange={(_, newValue) => setCardTab(newValue)}
    >
      <DataTable
        rows={visibleRows}
        columns={columns}
        showExport={false}
        showDefaultView={false}
        // A past run is a record, not something to act on in bulk.
        checkboxSelection={false}
        pinnedShadowFields={{ left: "reportType", right: "actions" }}
      />
    </TabbedDataCard>
  );
}
