// Report Manager → History. Every report run that has been generated, with
// its delivery status and per-row download / overflow actions.

import { Box, Chip, IconButton, Typography } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { useState } from "react";

import { DataTable } from "@/components/data-table";
import { MaterialSymbol } from "@/components/material-symbol";
import type { StatusTabConfig } from "@/components/tabbed-data-card";
import { TabbedDataCard } from "@/components/tabbed-data-card";

type RunStatus = "available" | "processing" | "failed";

type HistoryRow = {
  id: number;
  reportType: string;
  reportName: string;
  customer: string;
  user: string;
  runAt: string;
  status: RunStatus;
};

const STATUS_LABEL: Record<RunStatus, string> = {
  available: "Download Available",
  processing: "Processing",
  failed: "Failed",
};

// Runs from the last two weeks — the recurring Timeline / Traffic pairs plus a
// few one-off runs from other users.
const HISTORY: HistoryRow[] = [
  {
    id: 1,
    reportType: "Timeline Activity Logs",
    reportName: "Daily Timeline Digest",
    customer: "Hamel Services LLC",
    user: "Peter Linden",
    runAt: "8/6/2026, 4:00:57 PM",
    status: "processing",
  },
  {
    id: 2,
    reportType: "DNS Query Logs",
    reportName: "DNS Query Logs",
    customer: "Hamel Services LLC",
    user: "Peter Linden",
    runAt: "8/6/2026, 11:00:59 AM",
    status: "available",
  },
  {
    id: 3,
    reportType: "Customer Activity Overview",
    reportName: "Monthly Executive Summary",
    customer: "Acme Manufacturing",
    user: "Dana Mori",
    runAt: "8/5/2026, 8:00:12 AM",
    status: "available",
  },
  {
    id: 4,
    reportType: "Timeline Activity Logs",
    reportName: "Daily Timeline Digest",
    customer: "Hamel Services LLC",
    user: "Peter Linden",
    runAt: "8/5/2026, 4:00:57 PM",
    status: "available",
  },
  {
    id: 5,
    reportType: "DNS Query Logs",
    reportName: "DNS Query Logs",
    customer: "Hamel Services LLC",
    user: "Peter Linden",
    runAt: "8/5/2026, 11:01:00 AM",
    status: "available",
  },
  {
    id: 6,
    reportType: "CyberSight AI Usage",
    reportName: "CyberSight AI Monthly Review",
    customer: "Globex Financial",
    user: "Tom Villanueva",
    runAt: "8/4/2026, 9:00:03 AM",
    status: "failed",
  },
  {
    id: 7,
    reportType: "Timeline Activity Logs",
    reportName: "Daily Timeline Digest",
    customer: "Hamel Services LLC",
    user: "Peter Linden",
    runAt: "8/4/2026, 4:00:57 PM",
    status: "available",
  },
  {
    id: 8,
    reportType: "DNS Query Logs",
    reportName: "DNS Query Logs",
    customer: "Hamel Services LLC",
    user: "Peter Linden",
    runAt: "8/4/2026, 11:01:02 AM",
    status: "available",
  },
  {
    id: 9,
    reportType: "Filter Protection Summary",
    reportName: "Weekly Protection Recap",
    customer: "Umbrella Health",
    user: "Priya Natarajan",
    runAt: "8/3/2026, 7:30:44 AM",
    status: "available",
  },
  {
    id: 10,
    reportType: "Timeline Activity Logs",
    reportName: "Daily Timeline Digest",
    customer: "Hamel Services LLC",
    user: "Peter Linden",
    runAt: "8/3/2026, 4:00:56 PM",
    status: "available",
  },
  {
    id: 11,
    reportType: "DNS Query Logs",
    reportName: "DNS Query Logs",
    customer: "Hamel Services LLC",
    user: "Peter Linden",
    runAt: "8/3/2026, 11:01:07 AM",
    status: "available",
  },
  {
    id: 12,
    reportType: "Timeline Overview",
    reportName: "Business Review Packet",
    customer: "Acme Manufacturing",
    user: "Dana Mori",
    runAt: "8/2/2026, 6:15:21 AM",
    status: "available",
  },
  {
    id: 13,
    reportType: "Timeline Activity Logs",
    reportName: "Daily Timeline Digest",
    customer: "Hamel Services LLC",
    user: "Peter Linden",
    runAt: "8/2/2026, 4:00:54 PM",
    status: "available",
  },
  {
    id: 14,
    reportType: "DNS Query Logs",
    reportName: "DNS Query Logs",
    customer: "Hamel Services LLC",
    user: "Peter Linden",
    runAt: "8/2/2026, 11:00:59 AM",
    status: "available",
  },
  {
    id: 15,
    reportType: "Timeline Activity Logs",
    reportName: "Daily Timeline Digest",
    customer: "Hamel Services LLC",
    user: "Peter Linden",
    runAt: "8/1/2026, 4:00:58 PM",
    status: "available",
  },
  {
    id: 16,
    reportType: "DNS Query Logs",
    reportName: "DNS Query Logs",
    customer: "Hamel Services LLC",
    user: "Peter Linden",
    runAt: "8/1/2026, 11:01:01 AM",
    status: "available",
  },
  {
    id: 17,
    reportType: "Customer Activity Overview",
    reportName: "Acme Weekly Traffic Digest",
    customer: "Acme Manufacturing",
    user: "Dana Mori",
    runAt: "7/31/2026, 7:00:18 AM",
    status: "available",
  },
  {
    id: 18,
    reportType: "Filter Protection Summary",
    reportName: "Weekly Protection Recap",
    customer: "Umbrella Health",
    user: "Priya Natarajan",
    runAt: "7/27/2026, 7:30:52 AM",
    status: "available",
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

function ActionsCell({ status }: { status: RunStatus }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
      <IconButton
        size="small"
        aria-label="Download"
        disabled={status !== "available"}
      >
        <MaterialSymbol name="download" size={20} />
      </IconButton>
      <IconButton size="small" aria-label="More options">
        <MaterialSymbol name="more_horiz" size={20} />
      </IconButton>
    </Box>
  );
}

const columns: GridColDef<HistoryRow>[] = [
  { field: "reportType", headerName: "Report Type", flex: 1, minWidth: 190 },
  {
    field: "reportName",
    headerName: "Report Name",
    flex: 1,
    minWidth: 200,
    renderCell: (params) => (
      <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
          {params.row.reportName}
        </Typography>
      </Box>
    ),
  },
  { field: "customer", headerName: "Customer", flex: 1, minWidth: 180 },
  { field: "user", headerName: "Originating User", flex: 1, minWidth: 160 },
  { field: "runAt", headerName: "Date/Time", flex: 1, minWidth: 180 },
  {
    field: "status",
    headerName: "Status",
    flex: 1,
    minWidth: 180,
    renderCell: (params) => <StatusCell status={params.row.status} />,
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 104,
    sortable: false,
    filterable: false,
    resizable: false,
    hideable: false,
    renderCell: (params) => <ActionsCell status={params.row.status} />,
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
