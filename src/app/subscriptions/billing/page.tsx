import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";

import { CollapsibleCard } from "@/components/collapsible-card";
import { MaterialSymbol } from "@/components/material-symbol";

type SummaryStat = {
  label: string;
  value: string;
  caption: React.ReactNode;
  /** Optional extra line rendered below the caption in the success color. */
  extra?: React.ReactNode;
};

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
      <MaterialSymbol
        name={discount.icon}
        size={16}
        sx={{ color: "text.secondary" }}
      />
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
  const [optedOut, setOptedOut] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleUpgradeToggle = () => {
    const next = !optedOut;
    setOptedOut(next);
    setToast(
      next
        ? "You've opted to keep your current plan."
        : "You've re-enabled the automatic Plus upgrade.",
    );
  };

  return (
    <Stack spacing={2}>
      <Alert
        severity="info"
        variant="standard"
        icon={<MaterialSymbol name="info" size={22} />}
      >
        <AlertTitle sx={{ fontWeight: 600 }}>
          Pro plan automatically upgrades to Plus on July 1, 2027
        </AlertTitle>
        <Typography variant="body2" sx={{ maxWidth: 700 }}>
          The new price is $X.XX per license per year, up from the current
          $Y.YY. To stay on Pro at the current pricing, select Keep Current
          Plan before July 1, 2027.
        </Typography>
        <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            onClick={handleUpgradeToggle}
          >
            {optedOut ? "Allow Upgrade" : "Keep Current Plan"}
          </Button>
          <Button variant="outlined" color="secondary" size="small">
            Compare Plans
          </Button>
        </Stack>
      </Alert>

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
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          {detailsOpen ? "Hide details" : "View details"}
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

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 3 }}>
          <Button variant="outlined" color="secondary" sx={{ minWidth: 0 }}>
            Edit
          </Button>
          <Button variant="outlined" color="secondary">
            Add / Manage Cards
          </Button>
        </Box>
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

      <CollapsibleCard title="Invoice History">
        <Typography variant="body1" sx={{ color: "text.primary" }}>
          View, download, and search all past invoices loaded directly from our
          billing provider.
        </Typography>
        <Button variant="outlined" color="secondary" sx={{ mt: 2 }}>
          View Invoices
        </Button>
      </CollapsibleCard>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={2000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity="success"
          variant="standard"
          elevation={8}
          onClose={() => setToast(null)}
          sx={{
            alignItems: "center",
            "& .MuiAlert-icon": { alignSelf: "center", py: 0 },
            "& .MuiAlert-message": { py: 0 },
            "& .MuiAlert-action": { alignSelf: "center", py: 0, pt: 0 },
          }}
        >
          {toast}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
