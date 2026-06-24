import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
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

/** Baseline licenses for a plan (the floor that additions are measured from). */
const baselineFor = (plan: Plan) => plan.minimum ?? plan.initialQuantity;

const usd = (value: number, options?: Intl.NumberFormatOptions) =>
  value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    ...options,
  });

// ---------------------------------------------------------------------------
// Plan row
// ---------------------------------------------------------------------------

type PlanRowProps = {
  plan: Plan;
  quantity: number;
  onQuantityChange: (value: number) => void;
  isLast?: boolean;
};

function PlanRow({ plan, quantity, onQuantityChange, isLast }: PlanRowProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 2,
        pt: 3,
        pb: isLast ? 0 : 3,
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="body1">
          <Box component="span" sx={{ fontWeight: 600 }}>
            {plan.name}
          </Box>{" "}
          <Box component="span" sx={{ color: "text.secondary" }}>
            {quantity.toLocaleString()} licenses
          </Box>
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          <Box
            component="span"
            sx={{ fontWeight: 600, fontSize: 16, color: "text.primary" }}
          >
            {usd(plan.price)}
          </Box>{" "}
          per license / year
        </Typography>
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

function OrderSummary({ quantities }: { quantities: Record<string, number> }) {
  const [showPromo, setShowPromo] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    rate: number;
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

  // Plans and stepper add-ons are both billable: a line item per item whose
  // quantity has been raised above its baseline.
  const billables = [
    ...PLANS.map((plan) => ({
      name: plan.name,
      price: plan.price,
      baseline: baselineFor(plan),
    })),
    ...STEPPER_FEATURES.map((feature) => ({
      name: feature.name,
      price: feature.unitPrice,
      baseline: feature.baseline,
    })),
  ];

  const lineItems = billables
    .map((item) => {
      const added = (quantities[item.name] ?? item.baseline) - item.baseline;
      return { ...item, added, amount: added * item.price };
    })
    .filter((item) => item.added > 0);

  const hasChanges = lineItems.length > 0;

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

  if (!hasChanges) return emptyState;

  const annualAmountAdded = lineItems.reduce((sum, i) => sum + i.amount, 0);
  const discountAnnual = annualAmountAdded * (appliedPromo?.rate ?? 0);
  const netAnnualAdded = annualAmountAdded - discountAnnual;
  const daysRemaining = Math.max(
    0,
    Math.ceil((RENEWAL_DATE.getTime() - Date.now()) / MS_PER_DAY),
  );
  const proratedToday = (netAnnualAdded * daysRemaining) / DAYS_IN_YEAR;
  const newAnnualRecurring =
    billables.reduce(
      (sum, item) =>
        sum + (quantities[item.name] ?? item.baseline) * item.price,
      0,
    ) - discountAnnual;

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
        <Box>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}
          >
            <Typography
              variant="body2"
              sx={{ minWidth: 0, wordBreak: "break-word" }}
            >
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
              {usd(newAnnualRecurring, { maximumFractionDigits: 0 })} / yr
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
      </Box>

      <Button variant="contained" sx={{ alignSelf: "flex-start" }}>
        Buy Now
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
    baseline: 50,
  },
  {
    name: "Data Export",
    category: "Data feature",
    description:
      "Stream DNS query logs, audit events, and policy changes to S3, Datadog, Splunk, or any S3-compatible bucket. Includes scheduled CSV exports and webhooks.",
    price: "$1,188.00",
    unit: " / year",
    action: "add",
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
    name: "CyberSight™",
    category: "AI threat feature",
    description:
      "AI-powered threat intelligence layer that identifies zero-day domains, phishing campaigns, and malware infrastructure in real time.",
    price: "$9.00",
    unit: "per license / yr",
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
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        <Box
          component="span"
          sx={{ fontWeight: 600, fontSize: 16, color: "text.primary" }}
        >
          {feature.price}
        </Box>{" "}
        {feature.unit}
      </Typography>
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
            min={feature.baseline ?? 0}
            onChange={onQuantityChange ?? (() => {})}
            ariaLabel={`${feature.name} quantity`}
            sx={{ width: 126, flexShrink: 0 }}
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
        {FEATURES.map((feature, index) => (
          <Fragment key={feature.name}>
            {index > 0 && <Divider />}
            <Box sx={{ pt: 3, pb: index === FEATURES.length - 1 ? 0 : 3 }}>
              <FeatureRow
                feature={feature}
                quantity={quantities[feature.name]}
                onQuantityChange={(value) =>
                  onQuantityChange(feature.name, value)
                }
              />
            </Box>
          </Fragment>
        ))}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PlansLicensesPage() {
  const [quantities, setQuantities] = useState<Record<string, number>>(() => ({
    ...Object.fromEntries(
      PLANS.map((plan) => [plan.name, plan.initialQuantity]),
    ),
    ...Object.fromEntries(STEPPER_FEATURES.map((f) => [f.name, f.baseline])),
  }));

  const setQuantity = (name: string, value: number) =>
    setQuantities((prev) => ({ ...prev, [name]: value }));

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 2,
        alignItems: "start",
      }}
    >
      <Box
        sx={{
          gridColumn: "span 2",
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
              {PLANS.map((plan, index) => (
                <Fragment key={plan.name}>
                  {index > 0 && <Divider />}
                  <PlanRow
                    plan={plan}
                    quantity={quantities[plan.name]}
                    onQuantityChange={(value) => setQuantity(plan.name, value)}
                    isLast={index === PLANS.length - 1}
                  />
                </Fragment>
              ))}
            </Box>
          </CardContent>
        </Card>

        <FeaturesCard quantities={quantities} onQuantityChange={setQuantity} />
      </Box>

      <Card sx={{ position: "sticky", top: 0 }}>
        <CardHeader title="Order Summary" />
        <CardContent>
          <OrderSummary quantities={quantities} />
        </CardContent>
      </Card>
    </Box>
  );
}
