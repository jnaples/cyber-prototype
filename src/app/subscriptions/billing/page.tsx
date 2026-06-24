import { Box, Button, Chip, IconButton, Stack, Typography } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";

import { CollapsibleCard } from "@/components/collapsible-card";
import { DataTable } from "@/components/data-table";

type SummaryStat = {
  label: string;
  value: string;
  caption: React.ReactNode;
  /** Optional extra line rendered below the caption in the success color. */
  extra?: React.ReactNode;
};

type InvoiceRow = {
  id: string;
  invoice: string;
  invoiceDate: string;
  status: "Paid";
  total: string;
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const INVOICE_ROWS: InvoiceRow[] = Array.from({ length: 200 }, (_, i) => {
  const monthsAgo = i;
  const date = new Date(2050, 4 - monthsAgo, 1);
  const seq = String(200 - i).padStart(2, "0");
  return {
    id: `INV-${date.getFullYear()}-${seq}`,
    invoice: `INV-${date.getFullYear()}-${seq}`,
    invoiceDate: `${MONTHS[date.getMonth()]} ${date.getFullYear()}`,
    status: "Paid",
    total: "$1,500.50",
  };
});

const INVOICE_COLUMNS: GridColDef[] = [
  { field: "invoice", headerName: "Invoice", width: 240, minWidth: 200 },
  { field: "invoiceDate", headerName: "Invoice Date", flex: 1, minWidth: 160 },
  {
    field: "status",
    headerName: "Status",
    flex: 1,
    minWidth: 160,
    renderCell: (params) => (
      <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
        <Chip
          size="small"
          label={params.value}
          // Match the standard success Alert exactly: MUI generates these
          // scheme-aware CSS-variable tokens, so the chip flips between
          // light/dark automatically just like a standard <Alert severity="success">.
          sx={(theme) => ({
            bgcolor: theme.vars.palette.Alert.successStandardBg,
            color: theme.vars.palette.Alert.successColor,
            "& .MuiChip-label": { color: "inherit" },
          })}
        />
      </Box>
    ),
  },
  {
    field: "total",
    headerName: "Total",
    flex: 1,
    minWidth: 160,
    align: "right",
    headerAlign: "right",
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 80,
    sortable: false,
    filterable: false,
    resizable: false,
    align: "center",
    headerAlign: "center",
    renderCell: () => (
      <IconButton size="small">
        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
          more_horiz
        </span>
      </IconButton>
    ),
  },
];

const SUMMARY_STATS: SummaryStat[] = [
  {
    label: "Annual total",
    value: "$1,050.00",
    caption: (
      <>
        Renews <strong>July 1, 2026</strong>
      </>
    ),
    extra: "Annual savings $225 / yr",
  },
  {
    label: "Active plans",
    value: "2",
    caption: "Basic, Pro",
  },
  {
    label: "Total licenses",
    value: "250",
    caption: "across all plans",
  },
];

export default function BillingPage() {
  return (
    <Stack spacing={2}>
      <CollapsibleCard title="Summary">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
            gap: 2,
          }}
        >
          {SUMMARY_STATS.map((stat) => (
            <Box
              key={stat.label}
              sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
            >
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, color: "text.primary" }}
              >
                {stat.label}
              </Typography>
              <Typography variant="h4" sx={{ color: "text.primary" }}>
                {stat.value}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {stat.caption}
              </Typography>
              {stat.extra && (
                <Typography variant="body2" sx={{ color: "success.main" }}>
                  {stat.extra}
                </Typography>
              )}
            </Box>
          ))}
        </Box>

        <Box
          role="button"
          sx={{
            mt: 3,
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            cursor: "pointer",
            color: "text.primary",
            fontWeight: 500,
            fontSize: 14,
          }}
        >
          View details
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            expand_more
          </span>
        </Box>
      </CollapsibleCard>

      <CollapsibleCard title="Payment Method">
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <img src="/mastercard.svg" alt="Mastercard" width={56} height="auto" />
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, color: "text.primary" }}
            >
              **** **** **** 3875
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Exp. 12/2050
            </Typography>
          </Box>
        </Box>

        <Button variant="outlined" color="secondary" sx={{ mt: 3 }}>
          Update Payment Method
        </Button>
      </CollapsibleCard>

      <CollapsibleCard title="Billing Information">
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          {[
            "John Doe",
            "123 Highland Drive",
            "Tampa, FL 30545",
            "United States",
          ].map((line) => (
            <Typography
              key={line}
              variant="body2"
              sx={{ color: "text.primary" }}
            >
              {line}
            </Typography>
          ))}
        </Box>

        <Button variant="outlined" color="secondary" sx={{ mt: 3 }}>
          Update Information
        </Button>
      </CollapsibleCard>

      <CollapsibleCard title="Invoice History" disableContentPadding>
        <DataTable
          rows={INVOICE_ROWS}
          columns={INVOICE_COLUMNS}
          checkboxSelection={false}
          showFilters={false}
          showDefaultView={false}
        />
      </CollapsibleCard>
    </Stack>
  );
}
