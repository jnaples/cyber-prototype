// Legacy "Old Billing" mockup — intentionally NOT built on the design system.
// Recreates the previous subscription/plans screen with hardcoded legacy
// styling for reference.

import { Box, Button, Link, Typography } from "@mui/material";

const HEADER_BLUE = "#2680C2";
const LINK_BLUE = "#1976D2";
const BORDER = "#E0E0E0";
const TEXT = "#212B36";
const MUTED = "#637381";
const TABLE_TEXT = "#76838F";

type Price = { price?: string; unit?: string; retail?: string; na?: boolean };
type Plan = {
  name: string;
  monthly: Price;
  annual: Price;
  ideal: string;
};

const PLANS: Plan[] = [
  {
    name: "Core",
    monthly: { price: "$0.92", unit: "/User", retail: "$1.15" },
    annual: { price: "$0.80", unit: "/User", retail: "$1.00" },
    ideal: "Core Filtering",
  },
  {
    name: "Pro",
    monthly: { price: "$1.84", unit: "/User", retail: "$2.30" },
    annual: { price: "$1.68", unit: "/User", retail: "$2.10" },
    ideal: "Detailed Reporting & Policies",
  },
  {
    name: "Enterprise",
    monthly: { price: "$2.40", unit: "/User", retail: "$3.00" },
    annual: { price: "$2.16", unit: "/User", retail: "$2.70" },
    ideal: "Data Retention, iOS/Android",
  },
  {
    name: "Education",
    monthly: { na: true },
    annual: { price: "$3.20", unit: "/User" },
    ideal: "Schools",
  },
  {
    name: "Guest Wi-Fi",
    monthly: { price: "$4.80", unit: "/AP", retail: "$6.00" },
    annual: { price: "$4.00", unit: "/AP", retail: "$5.00" },
    ideal: "Securing Your Guest Network",
  },
];

const TABS = ["Subscription", "Invoices", "Manage"];

function PriceCell({ p }: { p: Price }) {
  if (p.na) {
    return <Typography sx={{ fontSize: 16, color: TABLE_TEXT }}>N/A</Typography>;
  }
  return (
    <Box>
      <Typography component="span" sx={{ fontSize: 16, color: TABLE_TEXT }}>
        {p.price}
      </Typography>
      <Typography component="span" sx={{ fontSize: 13, color: TABLE_TEXT }}>
        {p.unit}
      </Typography>
      {p.retail && (
        <Typography sx={{ fontSize: 13, color: TABLE_TEXT, mt: 0.5 }}>
          (Retail: {p.retail})
        </Typography>
      )}
    </Box>
  );
}

export default function OldBillingPage() {
  const cellSx = {
    borderRight: `1px solid ${BORDER}`,
    borderBottom: `1px solid ${BORDER}`,
    padding: "5px",
    verticalAlign: "middle",
    textAlign: "center" as const,
  };
  const rowLabelSx = {
    ...cellSx,
    borderTop: `1px solid ${BORDER}`,
    borderLeft: `1px solid ${BORDER}`,
    textAlign: "left" as const,
    color: TABLE_TEXT,
    fontSize: 15,
    width: 200,
  };

  return (
    <Box
      sx={{
        bgcolor: "#fff",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Legacy tab bar */}
      <Box
        sx={{
          bgcolor: "#EEF1F8",
          px: 2,
          display: "flex",
          gap: 4,
          flexShrink: 0,
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        {TABS.map((t, i) => (
          <Box
            key={t}
            sx={{
              py: 2,
              fontSize: 16,
              cursor: "pointer",
              color: i === 0 ? LINK_BLUE : MUTED,
            }}
          >
            {t}
          </Box>
        ))}
      </Box>

      <Box sx={{ px: 2, pt: 2, pb: 8, flex: 1, minHeight: 0, overflow: "auto" }}>
        {/* Plus-upgrade notice — styled like the legacy Select a Plan banner */}
        <Box
          sx={{
            bgcolor: "#E9F3FB",
            borderRadius: "2px",
            p: 2,
            mb: 4,
            display: "flex",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              border: "1.5px solid #2680C2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontStyle: "italic",
              fontWeight: 700,
              color: "#2680C2",
              flexShrink: 0,
              mt: 0.25,
            }}
          >
            i
          </Box>
          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#173A5E" }}>
              Pro plan automatically upgrades to Plus on July 1, 2027
            </Typography>
            <Typography sx={{ fontSize: 16, color: "#46586B", mt: 1, maxWidth: 700 }}>
              The new price is $X.XX per license per year, up from the current
              $Y.YY. To stay on Pro at the current pricing, select{" "}
              <Box component="strong" sx={{ fontWeight: 700 }}>
                Keep Current Plan
              </Box>{" "}
              before July 1, 2027.
            </Typography>
            <Box sx={{ display: "flex", gap: 1.5, mt: 2 }}>
              {["Keep Current Plan", "Compare Plans"].map((l) => (
                <Button
                  key={l}
                  variant="outlined"
                  sx={{
                    color: "#2096F3",
                    borderColor: "#2096F3",
                    fontSize: 14,
                    borderRadius: "2px",
                    padding: "6px 15px",
                    textTransform: "none",
                    fontWeight: 400,
                    "&:hover": {
                      borderColor: "#2096F3",
                      bgcolor: "rgba(32, 150, 243, 0.04)",
                    },
                  }}
                >
                  {l}
                </Button>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Usage metrics banner */}
        <Box
          sx={{
            bgcolor: "#ECECEC",
            p: 2,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            mb: 4,
          }}
        >
          <Box
            sx={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              border: `1.5px solid ${TEXT}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontStyle: "italic",
              fontWeight: 700,
              color: TEXT,
              flexShrink: 0,
            }}
          >
            i
          </Box>
          <Typography sx={{ fontSize: 16, color: TEXT }}>
            View your usage metrics{" "}
            <Link href="#" underline="hover" sx={{ color: LINK_BLUE }}>
              here.
            </Link>
          </Typography>
        </Box>

        <Typography sx={{ fontSize: 24, color: TEXT, mb: 3 }}>
          Our Plans
        </Typography>

        {/* Plans table */}
        <Box
          component="table"
          sx={{
            width: "100%",
            borderCollapse: "collapse",
            border: `1px solid ${BORDER}`,
            borderTop: "none",
            borderLeft: "none",
          }}
        >
          <Box component="thead">
            <Box component="tr">
              <Box component="th" sx={{ ...cellSx, border: "none" }} />
              {PLANS.map((plan) => (
                <Box
                  component="th"
                  key={plan.name}
                  sx={{
                    bgcolor: HEADER_BLUE,
                    color: "#fff",
                    fontSize: 18,
                    fontWeight: 700,
                    px: 3,
                    py: 2,
                    textAlign: "center",
                    borderRight: `1px solid ${HEADER_BLUE}`,
                  }}
                >
                  {plan.name}
                </Box>
              ))}
            </Box>
          </Box>
          <Box component="tbody">
            <Box component="tr">
              <Box component="td" sx={rowLabelSx}>
                Your Monthly Price
              </Box>
              {PLANS.map((plan) => (
                <Box component="td" key={plan.name} sx={cellSx}>
                  <PriceCell p={plan.monthly} />
                </Box>
              ))}
            </Box>
            <Box component="tr">
              <Box component="td" sx={rowLabelSx}>
                Your Annual Price
              </Box>
              {PLANS.map((plan) => (
                <Box component="td" key={plan.name} sx={cellSx}>
                  <PriceCell p={plan.annual} />
                </Box>
              ))}
            </Box>
            <Box component="tr">
              <Box component="td" sx={rowLabelSx}>
                Ideal for
              </Box>
              {PLANS.map((plan) => (
                <Box
                  component="td"
                  key={plan.name}
                  sx={{ ...cellSx, color: TABLE_TEXT, fontSize: 16 }}
                >
                  {plan.ideal}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        <Typography sx={{ fontSize: 16, color: TEXT, mt: 3 }}>
          See our{" "}
          <Link href="#" underline="hover" sx={{ color: "#3527FD" }}>
            pricing page
          </Link>{" "}
          for a full comparison chart.
        </Typography>

        {/* Select a Plan banner */}
        <Box
          sx={{
            mt: 4,
            bgcolor: "#FBEEDE",
            borderRadius: "2px",
            p: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Box
              sx={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                bgcolor: "#B26A00",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontStyle: "italic",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              i
            </Box>
            <Typography sx={{ fontSize: 16, fontWeight: 700, color: TEXT }}>
              Select a Plan
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 14, color: "#9A6A00", pl: 3.5 }}>
            Plan changes are managed by your Account Owner. Email{" "}
            <Link
              href="mailto:sales@dnsfilter.com"
              underline="hover"
              sx={{ color: "#9A6A00", fontWeight: 600 }}
            >
              sales@dnsfilter.com
            </Link>{" "}
            to request updates.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
