import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { Fragment, useState } from "react";

import { QuantityStepper } from "@/components/quantity-stepper";

type Plan = {
  name: string;
  /** Price per license, per year, in dollars. */
  price: number;
  /** Contracted minimum number of licenses, if any. */
  minimum?: number;
  /** Licenses already owned at the start of this session. */
  initialQuantity: number;
};

const PLANS: Plan[] = [
  { name: "Basic", price: 1.5, minimum: 50, initialQuantity: 50 },
  { name: "Pro", price: 5.25, minimum: 200, initialQuantity: 200 },
  { name: "Enterprise", price: 4.5, initialQuantity: 0 },
];

// Billing period the additions are prorated against.
const RENEWAL_DATE = new Date(2026, 6, 1); // July 1, 2026
const DAYS_IN_YEAR = 365;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
// Computed once at load (not during render — Date.now() is impure).
const DAYS_REMAINING = Math.max(
  0,
  Math.ceil((RENEWAL_DATE.getTime() - Date.now()) / MS_PER_DAY),
);

const usd =(value: number, options?: Intl.NumberFormatOptions) =>
  value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    ...options,
  });

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

/** "$X.XX unit" — bold primary price followed by secondary unit text. Used by
 * both plan rows and feature rows. */
function PriceText({ price, unit }: { price: string; unit: string }) {
  return (
    <Typography variant="body2" sx={{ color: "text.secondary" }}>
      <Box
        component="span"
        sx={{ fontWeight: 600, fontSize: 16, color: "text.primary" }}
      >
        {price}
      </Box>{" "}
      {unit}
    </Typography>
  );
}

/** Renders items in a vertical list with dividers between them and 24px
 * vertical padding per row (no bottom padding on the last row). */
function DividedList<T>({
  items,
  keyFor,
  renderItem,
}: {
  items: T[];
  keyFor: (item: T, index: number) => string;
  renderItem: (item: T, index: number) => React.ReactNode;
}) {
  return (
    <>
      {items.map((item, index) => (
        <Fragment key={keyFor(item, index)}>
          {index > 0 && <Divider />}
          <Box sx={{ pt: 3, pb: index === items.length - 1 ? 0 : 3 }}>
            {renderItem(item, index)}
          </Box>
        </Fragment>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Plan row
// ---------------------------------------------------------------------------

type PlanRowProps = {
  plan: Plan;
  /** Currently owned/committed licenses (shown on the left). */
  owned: number;
  /** Proposed total in the stepper. */
  quantity: number;
  onQuantityChange: (value: number) => void;
};

function PlanRow({ plan, owned, quantity, onQuantityChange }: PlanRowProps) {
  const added = quantity - owned;
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="body1">
          <Box component="span" sx={{ fontWeight: 600 }}>
            {plan.name}
          </Box>{" "}
          <Box component="span" sx={{ color: "text.secondary" }}>
            {owned.toLocaleString()} licenses
          </Box>
          {added !== 0 && (
            <>
              {" "}
              <Box
                component="span"
                sx={{
                  fontWeight: 600,
                  color: added > 0 ? "success.main" : "error.main",
                }}
              >
                {added > 0 ? "+" : "−"}
                {Math.abs(added).toLocaleString()}
              </Box>
            </>
          )}
        </Typography>
        <PriceText price={usd(plan.price)} unit="per license / year" />
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 1,
        }}
      >
        <QuantityStepper
          value={quantity}
          min={plan.minimum ?? 0}
          onChange={onQuantityChange}
          ariaLabel={`${plan.name} license quantity`}
        />
        {plan.minimum != null && (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Contracted minimum: {plan.minimum}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Order summary
// ---------------------------------------------------------------------------

/** A label/value line, with an optional secondary caption under the label. */
function SummaryLine({
  label,
  caption,
  value,
  emphasized = false,
}: {
  label: string;
  caption?: string;
  value: React.ReactNode;
  emphasized?: boolean;
}) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: emphasized ? 600 : 400, wordBreak: "break-word" }}
        >
          {label}
        </Typography>
        {caption && (
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {caption}
          </Typography>
        )}
      </Box>
      {typeof value === "string" ? (
        <Typography
          variant="body2"
          sx={{
            textAlign: "right",
            fontWeight: emphasized ? 600 : 400,
            flexShrink: 0,
          }}
        >
          {value}
        </Typography>
      ) : (
        value
      )}
    </Box>
  );
}

/** "New annual recurring" row with the renewal-date caption beneath. Shared by
 * the live summary and the post-payment success view. */
function RecurringLine({ amount }: { amount: number }) {
  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
        <Typography variant="body2" sx={{ minWidth: 0, wordBreak: "break-word" }}>
          New annual recurring
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            textAlign: "right",
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}
        >
          {usd(amount, { maximumFractionDigits: 0 })} / yr
        </Typography>
      </Box>
      <Typography
        variant="caption"
        sx={{ display: "block", mt: 0.25, color: "text.secondary" }}
      >
        Renews every year starting{" "}
        {RENEWAL_DATE.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </Typography>
    </Box>
  );
}

function OrderSummary({
  quantities,
  owned,
  onCommit,
}: {
  quantities: Record<string, number>;
  owned: Record<string, number>;
  /** Commit the purchase: the page sets owned = quantities. */
  onCommit: () => void;
}) {
  const [showPromo, setShowPromo] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    rate: number;
  } | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "paid">("idle");
  // Snapshot of the charged/recurring figures at purchase time, so the success
  // view stays correct after the purchase commits (owned = quantities).
  const [paidSummary, setPaidSummary] = useState<{
    charged: number;
    recurring: number;
  } | null>(null);

  const applyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;
    // Derive the discount rate from any trailing digits in the code
    // (e.g. PARTNER20 → 20%); fall back to 10% otherwise.
    const match = code.match(/(\d+)\s*$/);
    const rate = match ? Math.min(100, Number(match[1])) / 100 : 0.1;
    setAppliedPromo({ code, rate });
    setPromoCode("");
  };

  // Plans and stepper add-ons are both billable. Additions are measured from
  // the currently owned count, not a static baseline.
  const billables = [
    ...PLANS.map((plan) => ({ name: plan.name, price: plan.price })),
    ...STEPPER_FEATURES.map((feature) => ({
      name: feature.name,
      price: feature.unitPrice,
    })),
  ];

  const lineItems = billables
    .map((item) => {
      const added = (quantities[item.name] ?? 0) - (owned[item.name] ?? 0);
      return { ...item, added, amount: added * item.price };
    })
    .filter((item) => item.added > 0);

  const hasChanges = lineItems.length > 0;

  const annualAmountAdded = lineItems.reduce((sum, i) => sum + i.amount, 0);
  const discountAnnual = annualAmountAdded * (appliedPromo?.rate ?? 0);
  const netAnnualAdded = annualAmountAdded - discountAnnual;
  const daysRemaining = DAYS_REMAINING;
  const proratedToday = (netAnnualAdded * daysRemaining) / DAYS_IN_YEAR;
  const newAnnualRecurring =
    billables.reduce(
      (sum, item) => sum + (quantities[item.name] ?? 0) * item.price,
      0,
    ) - discountAnnual;

  const handleBuyNow = () => {
    setPaidSummary({ charged: proratedToday, recurring: newAnnualRecurring });
    setStatus("processing");
    // Simulate a real charge, then commit the purchase and show success.
    window.setTimeout(() => {
      onCommit();
      setStatus("paid");
    }, 3000);
  };

  // Neutral surface in light mode; the darker default surface in dark mode so
  // the box recedes against the card.
  const surfaceSx = (theme: Theme) => ({
    bgcolor: "background.neutral",
    ...theme.applyStyles("dark", { bgcolor: "background.default" }),
  });

  const emptyState = (
    <Box sx={[{ borderRadius: 1.5, p: 2 }, surfaceSx]}>
      <Typography
        variant="body2"
        sx={{ fontStyle: "italic", color: "text.secondary" }}
      >
        No changes pending
      </Typography>
    </Box>
  );

  if (status === "paid" && paidSummary) {
    return (
      <Box
        sx={[
          {
            borderRadius: 1.5,
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          },
          surfaceSx,
        ]}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
            pb: 2,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Box
            sx={(theme) => ({
              width: 40,
              height: 40,
              borderRadius: "999px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: theme.vars.palette.Alert.successStandardBg,
              color: theme.vars.palette.Alert.successColor,
            })}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
              check
            </span>
          </Box>
          <Typography sx={{ fontWeight: 600, fontSize: 16 }}>
            Payment successful
          </Typography>
          <Typography variant="body2" sx={{ textAlign: "center" }}>
            {usd(paidSummary.charged)} charged to Visa **** 4242
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography sx={{ fontWeight: 600, fontSize: 16 }}>
            Plan updated
          </Typography>
          <RecurringLine amount={paidSummary.recurring} />
        </Box>

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button variant="outlined" color="secondary" size="small">
            View Invoice
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            onClick={() => {
              setStatus("idle");
              setPaidSummary(null);
            }}
          >
            Done
          </Button>
        </Box>
      </Box>
    );
  }

  if (!hasChanges) return emptyState;

  return (
    <Box
      sx={[
        {
          borderRadius: 1.5,
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        },
        surfaceSx,
      ]}
    >
      {showPromo ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Promo Code
          </Typography>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(event) => setPromoCode(event.target.value)}
            />
            <Button variant="contained" color="secondary" onClick={applyPromo}>
              Apply
            </Button>
          </Box>
        </Box>
      ) : (
        <Link
          component="button"
          type="button"
          underline="none"
          onClick={() => setShowPromo(true)}
          sx={{ alignSelf: "flex-start", fontWeight: 600, fontSize: 14 }}
        >
          + Add Promo Code
        </Link>
      )}

      {/* Added line items */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {lineItems.map(({ name, price, added, amount }) => (
          <SummaryLine
            key={name}
            label={`${name} +${added.toLocaleString()} licenses`}
            caption={`${usd(price)} per license / year`}
            value={`${usd(amount)} / year`}
          />
        ))}
        {appliedPromo && (
          <Box
            sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "success.main",
                minWidth: 0,
                wordBreak: "break-word",
              }}
            >
              Promo discount ({appliedPromo.code})
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "success.main", textAlign: "right", flexShrink: 0 }}
            >
              −{usd(discountAnnual)} / year
            </Typography>
          </Box>
        )}
      </Box>

      <Divider />

      {/* Subtotal */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography sx={{ fontWeight: 600, fontSize: 16 }}>Subtotal</Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <SummaryLine
            label="Annual amount added"
            value={`${usd(annualAmountAdded)} / year`}
          />
          <SummaryLine
            label={`Prorated for ${daysRemaining} ${
              daysRemaining === 1 ? "day" : "days"
            }`}
            value={usd(proratedToday)}
          />
        </Box>
      </Box>

      <Divider />

      {/* Total */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
          <Typography sx={{ fontWeight: 600, fontSize: 16 }}>
            Total due today
          </Typography>
          <Typography variant="h5">{usd(proratedToday)}</Typography>
        </Box>
        <RecurringLine amount={newAnnualRecurring} />
      </Box>

      <Button
        variant="contained"
        onClick={handleBuyNow}
        disabled={status === "processing"}
        startIcon={
          status === "processing" ? (
            <CircularProgress size={16} color="inherit" />
          ) : undefined
        }
        sx={{ alignSelf: "flex-start" }}
      >
        {status === "processing" ? "Processing" : "Buy Now"}
      </Button>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Features
// ---------------------------------------------------------------------------

type Feature = {
  name: string;
  category?: string;
  description: string;
  price: string;
  unit: string;
  seats?: string;
  status?: "active" | "enterprise";
  action: "stepper" | "add" | "contact";
  /** Numeric per-unit price and current count — required for stepper add-ons
   * so they can feed the order summary. */
  unitPrice?: number;
  baseline?: number;
};

const FEATURES: Feature[] = [
  {
    name: "SecureTransit",
    category: "VPN add-on",
    status: "active",
    description:
      "Always-on encrypted tunneling for Roaming Clients. Routes all device traffic through DNSFilter's secure network with split-tunnel and kill-switch support.",
    price: "$9.00",
    unit: "per license / year",
    seats: "120 of 250 seats",
    action: "stepper",
    unitPrice: 9,
    baseline: 120,
  },
  {
    name: "Data Export",
    category: "Data feature",
    description:
      "Stream DNS query logs, audit events, and policy changes to S3, Datadog, Splunk, or any S3-compatible bucket. Includes scheduled CSV exports and webhooks.",
    price: "$0.25",
    unit: "per license / year",
    action: "stepper",
    unitPrice: 0.25,
    baseline: 0,
  },
  {
    name: "Guest Wi-Fi Access Points",
    category: "Network feature",
    description:
      "Extend DNS filtering to guest Wi-Fi networks via dedicated access point profiles. Each access point counts as a billable unit.",
    price: "$24.00",
    unit: "per access point / yr",
    action: "add",
  },
  {
    name: "Advanced Reporting",
    category: "Reporting feature",
    description:
      "Executive-level dashboards, scheduled PDF reports, anomaly alerting, and 2-year log retention. Integrates with SIEM tools.",
    price: "$588.00",
    unit: " / yr",
    action: "add",
  },
  {
    name: "MSP Portal",
    status: "enterprise",
    description:
      "Multi-tenant management console for managed service providers. Provision, configure, and report across all customer accounts from a single pane of glass.",
    price: "$1,788.00",
    unit: " / yr",
    action: "contact",
  },
];

// Stepper add-ons (e.g. SecureTransit) are billable like plans — they feed the
// order summary's line items and recurring total.
type BillableFeature = Feature & { unitPrice: number; baseline: number };
const STEPPER_FEATURES = FEATURES.filter(
  (f): f is BillableFeature =>
    f.action === "stepper" && f.unitPrice != null && f.baseline != null,
);

/** Status chip using the matching alert (success/warning) color tokens. */
function StatusChip({ status }: { status: "active" | "enterprise" }) {
  const config =
    status === "active"
      ? { label: "Active", icon: "check", severity: "success" as const }
      : {
          label: "Requires Enterprise",
          icon: "lock",
          severity: "warning" as const,
        };

  return (
    <Chip
      size="small"
      icon={
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
          {config.icon}
        </span>
      }
      label={config.label}
      sx={(theme) => ({
        bgcolor: theme.vars.palette.Alert[`${config.severity}StandardBg`],
        color: theme.vars.palette.Alert[`${config.severity}Color`],
        "& .MuiChip-icon": { color: "inherit", ml: 0.5 },
        "& .MuiChip-label": { color: "inherit" },
      })}
    />
  );
}

function PriceLine({ feature }: { feature: Feature }) {
  return (
    <Box>
      <PriceText price={feature.price} unit={feature.unit} />
      {feature.seats && (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {feature.seats}
        </Typography>
      )}
    </Box>
  );
}

function FeatureRow({
  feature,
  quantity,
  onQuantityChange,
}: {
  feature: Feature;
  quantity?: number;
  onQuantityChange?: (value: number) => void;
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box sx={{ display: "flex", gap: 5, alignItems: "flex-start" }}>
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Typography sx={{ fontWeight: 600, fontSize: 16 }}>
              {feature.name}
            </Typography>
            {feature.category && (
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {feature.category}
              </Typography>
            )}
            {feature.status && <StatusChip status={feature.status} />}
          </Box>
          <Typography variant="body2">{feature.description}</Typography>
          <PriceLine feature={feature} />
        </Box>

        {feature.action === "stepper" && (
          <QuantityStepper
            value={quantity ?? feature.baseline ?? 0}
            min={0}
            onChange={onQuantityChange ?? (() => {})}
            ariaLabel={`${feature.name} quantity`}
            sx={{ flexShrink: 0 }}
          />
        )}
      </Box>

      {feature.action === "add" && (
        <Button
          variant="outlined"
          color="secondary"
          size="small"
          sx={{ alignSelf: "flex-start" }}
        >
          Add to Plan
        </Button>
      )}
      {feature.action === "contact" && (
        <Link href="#" underline="none" variant="body2">
          Contact sales to upgrade.
        </Link>
      )}
    </Box>
  );
}

function FeaturesCard({
  quantities,
  onQuantityChange,
}: {
  quantities: Record<string, number>;
  onQuantityChange: (name: string, value: number) => void;
}) {
  return (
    <Card>
      <CardHeader title="Features" />
      <CardContent sx={{ pt: 0 }}>
        <DividedList
          items={FEATURES}
          keyFor={(feature) => feature.name}
          renderItem={(feature) => (
            <FeatureRow
              feature={feature}
              quantity={quantities[feature.name]}
              onQuantityChange={(value) => onQuantityChange(feature.name, value)}
            />
          )}
        />
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PlansLicensesPage() {
  const defaultQuantities = (): Record<string, number> => ({
    ...Object.fromEntries(
      PLANS.map((plan) => [plan.name, plan.initialQuantity]),
    ),
    ...Object.fromEntries(STEPPER_FEATURES.map((f) => [f.name, f.baseline])),
  });
  // `owned` is the committed license count; `quantities` is the proposed total
  // edited in the steppers. A purchase commits owned = quantities.
  const [owned, setOwned] = useState<Record<string, number>>(defaultQuantities);
  const [quantities, setQuantities] =
    useState<Record<string, number>>(defaultQuantities);

  const setQuantity = (name: string, value: number) =>
    setQuantities((prev) => ({ ...prev, [name]: value }));

  return (
    <Box
      sx={{
        display: "grid",
        // Stacked single column on iPad portrait / phones; 3-up side-by-side
        // (Plans+Features span 2, Order Summary in the third) on wider screens.
        gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
        gap: 2,
        alignItems: "start",
      }}
    >
      <Box
        sx={{
          gridColumn: { md: "span 2" },
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Card>
          <CardHeader title="Plans" />
          <CardContent>
            <Typography variant="body1">
              Add licenses to active plans or activate a new plan. Charges are
              prorated for the current billing period. Need to reduce your
              license count?{" "}
              <Link href="#" underline="none">
                Contact sales.
              </Link>
            </Typography>

            <Box sx={{ mt: 1 }}>
              <DividedList
                items={PLANS}
                keyFor={(plan) => plan.name}
                renderItem={(plan) => (
                  <PlanRow
                    plan={plan}
                    owned={owned[plan.name]}
                    quantity={quantities[plan.name]}
                    onQuantityChange={(value) => setQuantity(plan.name, value)}
                  />
                )}
              />
            </Box>
          </CardContent>
        </Card>

        <FeaturesCard quantities={quantities} onQuantityChange={setQuantity} />
      </Box>

      <Card sx={{ position: { md: "sticky" }, top: { md: 0 } }}>
        <CardHeader title="Order Summary" />
        <CardContent>
          <OrderSummary
            quantities={quantities}
            owned={owned}
            onCommit={() => setOwned({ ...quantities })}
          />
        </CardContent>
      </Card>
    </Box>
  );
}
