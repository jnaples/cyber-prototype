import {
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { useState } from "react";

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

function InvoiceActionsCell() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  return (
    <>
      <IconButton
        size="small"
        aria-label="more options"
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
          more_horiz
        </span>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={() => setAnchorEl(null)}>View invoice</MenuItem>
      </Menu>
    </>
  );
}

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
    renderCell: () => <InvoiceActionsCell />,
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

// ---------------------------------------------------------------------------
// "View details" breakdown
// ---------------------------------------------------------------------------

type BreakdownItem = {
  name: string;
  licenses: string;
  price: string;
  /** Pre-discount price, struck through. */
  original: string;
  /** Discounted price the user pays. */
  final: string;
};

const ACTIVE_PLANS: BreakdownItem[] = [
  {
    name: "Basic",
    licenses: "50 licenses",
    price: "$1.50",
    original: "$75.00",
    final: "$60.00 / yr",
  },
  {
    name: "Pro",
    licenses: "200 licenses",
    price: "$5.25",
    original: "$1,055.00",
    final: "$840.00 / yr",
  },
];

const ACTIVE_FEATURES: BreakdownItem[] = [
  {
    name: "SecureTransit",
    licenses: "120 licenses",
    price: "$9.00",
    original: "$1,728.00",
    final: "$1,382.40 / yr",
  },
];

type Discount = { icon: string; label: string; chip?: string };

const DISCOUNTS: Discount[] = [
  { icon: "percent", label: "Volume discount (20%)", chip: "Recurring" },
  { icon: "sell", label: "Promo SUMMER25", chip: "1st year only" },
  { icon: "paid", label: "Account credit" },
];

function BreakdownRow({ item }: { item: BreakdownItem }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      <Box>
        <Typography variant="body1">
          <Box component="span" sx={{ fontWeight: 600 }}>
            {item.name}
          </Box>{" "}
          <Box component="span" sx={{ color: "text.secondary" }}>
            {item.licenses}
          </Box>
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          <Box
            component="span"
            sx={{ fontWeight: 600, fontSize: 16, color: "text.primary" }}
          >
            {item.price}
          </Box>{" "}
          per license / year
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          flexShrink: 0,
          whiteSpace: "nowrap",
        }}
      >
        <Typography
          variant="body2"
          sx={{ color: "text.disabled", textDecoration: "line-through" }}
        >
          {item.original}
        </Typography>
        <Typography sx={{ fontWeight: 600, fontSize: 16, color: "text.primary" }}>
          {item.final}
        </Typography>
      </Box>
    </Box>
  );
}

function DiscountRow({ discount }: { discount: Discount }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, py: 0.25 }}>
      <Box
        component="span"
        className="material-symbols-outlined"
        sx={{ fontSize: 16, color: "text.secondary" }}
      >
        {discount.icon}
      </Box>
      <Typography variant="body2" sx={{ color: "text.primary" }}>
        {discount.label}
      </Typography>
      {discount.chip && (
        <Chip
          size="small"
          label={discount.chip}
          sx={(theme) => ({
            bgcolor: theme.vars.palette.Alert.successStandardBg,
            color: theme.vars.palette.Alert.successColor,
            "& .MuiChip-label": { color: "inherit" },
          })}
        />
      )}
    </Box>
  );
}

function SummaryDetails() {
  return (
    <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="overline" sx={{ color: "text.secondary" }}>
          Active plans
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {ACTIVE_PLANS.map((item) => (
            <BreakdownRow key={item.name} item={item} />
          ))}
        </Box>
      </Box>

      <Divider />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="overline" sx={{ color: "text.secondary" }}>
          Active features
        </Typography>
        {ACTIVE_FEATURES.map((item) => (
          <BreakdownRow key={item.name} item={item} />
        ))}
      </Box>

      <Divider />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Typography variant="overline" sx={{ color: "text.secondary" }}>
            Discounts
          </Typography>
          <Typography sx={{ fontWeight: 600, fontSize: 16, color: "success.main" }}>
            Saving $225.00 / yr
          </Typography>
        </Box>
        <Box
          sx={(theme) => ({
            bgcolor: "background.neutral",
            borderRadius: 1,
            px: 2,
            py: 1,
            display: "flex",
            flexDirection: "column",
            gap: 1,
            // Match the Order Summary surface: darker default in dark mode.
            ...theme.applyStyles("dark", {
              bgcolor: theme.vars.palette.background.default,
            }),
          })}
        >
          {DISCOUNTS.map((discount) => (
            <DiscountRow key={discount.label} discount={discount} />
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default function BillingPage() {
  const [detailsOpen, setDetailsOpen] = useState(false);

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
                <Typography
                  variant="body2"
                  sx={{ color: "success.main", fontWeight: 600 }}
                >
                  {stat.extra}
                </Typography>
              )}
            </Box>
          ))}
        </Box>

        <Box
          role="button"
          onClick={() => setDetailsOpen((prev) => !prev)}
          sx={{
            mt: 3,
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            cursor: "pointer",
            color: "text.primary",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          {detailsOpen ? "Hide details" : "View details"}
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: 18,
              color: "var(--dnsf-palette-text-secondary)",
            }}
          >
            {detailsOpen ? "expand_less" : "expand_more"}
          </span>
        </Box>

        <Collapse in={detailsOpen}>
          <SummaryDetails />
        </Collapse>
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
