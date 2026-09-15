// DNSFilter One — the desktop client's main window.
//
// Colors follow the tray popup's rule: theme tokens throughout, so the window
// works in light and dark, with the client's own ground (client-surface.ts)
// as the single exception. The product tints on the feature icons are brand
// art rather than UI color, so they stay fixed too.

import { Box, Button, Container, Typography } from "@mui/material";
import type { ButtonProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useState } from "react";

import { Logo } from "@/components/logo/logo";
import { MaterialSymbol } from "@/components/material-symbol";

import {
  APP_BG_DARK,
  APP_BG_LIGHT,
  APP_BORDER_DARK,
  APP_BORDER_LIGHT,
  APP_SURFACE_DARK,
  CLIENT_PRIMARY_DARK,
  CLIENT_PRIMARY_DARK_EDGE,
} from "../client-surface";
import { IosSwitch } from "../ios-switch";

// The brand wash: a hairline under the masthead, and the ring around ONE.
const accentGradient = (angle: string) =>
  `linear-gradient(${angle}, #F306AE 0%, #00C8FD 50%, #3427FD 100%)`;

const ACCENT_RULE = accentGradient("90deg");
const ACCENT_RING = accentGradient("-45deg");

// The client's buttons, scoped to this mockup rather than the app theme.
//
// The face reads as a slightly domed, lit surface: a fixed white sheen
// lightening toward the top, a dark inset line along the bottom edge and a
// white inset highlight along the top. The sheen is fixed rather than a
// colour-to-colour gradient, because two gradients cannot transition between
// each other — only the background-color underneath moves per state, which is
// what lets hover animate.
const CONTROL_RADIUS = 8;
const DUR_FAST = 150;

const sheen = (bottom: string, top: string) =>
  `linear-gradient(2deg, ${bottom} 0.97%, ${top} 96.96%)`;

// Light mode gets the stronger dome; the same white over a darker fill reads
// much hotter, so dark keeps a gentler lift.
const SHEEN_LIGHT = sheen("rgba(0, 0, 0, 0.06)", "rgba(255, 255, 255, 0.16)");
const SHEEN_DARK = sheen("rgba(0, 0, 0, 0)", "rgba(255, 255, 255, 0.1)");

// Top highlight and bottom edge — the crisp lip above the sheen. `wash` tints
// the whole face by flooding it with a huge inset spread, and is listed last
// so the 1px edges paint over it. Hover and press tint rather than swapping
// backgroundColor, so the fill never has to borrow another palette role.
const face = (edge: string, highlight: number, wash?: string) =>
  [
    `inset 0 -1px 0 ${edge}`,
    `inset 0 1px 0 rgba(255, 255, 255, ${highlight})`,
    wash && `inset 0 0 0 999px ${wash}`,
  ]
    .filter(Boolean)
    .join(", ");

// styled() drops Button's polymorphism, so the anchor props the Status page
// link needs are declared back onto it.
type ClientButtonProps = ButtonProps &
  Pick<React.AnchorHTMLAttributes<HTMLAnchorElement>, "target" | "rel">;

const ClientButton = styled(Button)<ClientButtonProps>(({ theme }) => {
  const { main, dark, contrastText } = theme.vars.palette.primary;

  // Everything hangs off `&&`: MUI's own contained-primary variant and the
  // app theme's `.MuiButton-containedPrimary` shadow are two-class rules, so a
  // single-class wrapper would lose to both — face, sheen, and the dark-mode
  // swap included.
  return {
    "&&": {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "6px",
      minHeight: 32,
      padding: "0 10px",
      border: "none",
      borderRadius: `${CONTROL_RADIUS}px`,
      fontSize: "14px",
      fontWeight: 600,
      lineHeight: "22px",
      // The theme uppercases button labels; the client reads in title case.
      textTransform: "none",
      whiteSpace: "nowrap",
      color: contrastText,
      backgroundColor: main,
      backgroundImage: SHEEN_LIGHT,
      boxShadow: face(dark, 0.2),
      transition: theme.transitions.create(
        ["background-color", "border-color", "box-shadow", "color"],
        { duration: DUR_FAST, easing: theme.transitions.easing.easeOut },
      ),
      // `gap` handles icon spacing now, so drop MUI's own icon margins, and
      // the zero-width baseline hack it injects alongside them.
      "& .MuiButton-startIcon, & .MuiButton-endIcon": {
        marginLeft: 0,
        marginRight: 0,
      },
      "&::before": { content: "none" },
      "&:hover": {
        backgroundColor: main,
        boxShadow: face(dark, 0.26, "rgba(255, 255, 255, 0.1)"),
      },
      "&:active": { boxShadow: face(dark, 0.14, "rgba(0, 0, 0, 0.12)") },
      "&.Mui-focusVisible": { boxShadow: face(dark, 0.2) },
      ...theme.applyStyles("dark", {
        backgroundImage: SHEEN_DARK,
        backgroundColor: CLIENT_PRIMARY_DARK,
        boxShadow: face(CLIENT_PRIMARY_DARK_EDGE, 0.2),
        "&:hover": {
          backgroundColor: CLIENT_PRIMARY_DARK,
          boxShadow: face(
            CLIENT_PRIMARY_DARK_EDGE,
            0.26,
            "rgba(255, 255, 255, 0.1)",
          ),
        },
        "&:active": {
          boxShadow: face(
            CLIENT_PRIMARY_DARK_EDGE,
            0.14,
            "rgba(0, 0, 0, 0.12)",
          ),
        },
        "&.Mui-focusVisible": {
          boxShadow: face(CLIENT_PRIMARY_DARK_EDGE, 0.2),
        },
      }),
    },
  };
});

// The badge's own fill, a shade off the window's ground.
const BADGE_FILL_LIGHT = "linear-gradient(45deg, #ECEEF3 0%, #FFFFFF 100%)";
const BADGE_CLIENT_PRIMARY_DARK =
  "linear-gradient(0deg, #040406 0%, #1C1E2A 100%)";

const FEATURES = [
  {
    name: "Roaming Client",
    icon: "language",
    tint: "linear-gradient(160deg, #534FFF 0%, #1C1AD5 100%)",
    description: "Encrypted DNS with your DNSFilter policy, on any network.",
    on: true,
  },
  {
    name: "AgentShield",
    icon: "verified_user",
    tint: "linear-gradient(160deg, #6FD0FF 0%, #037DB4 100%)",
    description: "Agentic process detection, filtering, and identification.",
    on: true,
  },
  {
    name: "SecureTransit",
    icon: "lock",
    tint: "linear-gradient(160deg, #F08AD5 0%, #CE008E 100%)",
    description:
      "Lightweight secure VPN powered by DNSFilter's Guardian infrastructure.",
    on: false,
  },
];

// The resolvers the client is actually using, as the window reports them.
const RESOLVERS = [
  { label: "Primary", value: "103.247.36.36" },
  { label: "Secondary", value: "103.247.37.37" },
  { label: "Primary", value: "2402:5c40:5c40::3636" },
  { label: "Secondary", value: "2402:5c40:5c41::3737" },
  { label: "ASN", value: "AS64089" },
];

/** A card on the client's ground: one surface, one hairline, 16px radius.
 *  `success` tints it green, for the all-clear banner. */
function ClientCard({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "success";
}) {
  const success = tone === "success";
  return (
    <Box
      sx={(theme) => ({
        p: 2,
        display: "flex",
        alignItems: "center",
        gap: 2,
        borderRadius: "16px",
        border: "1px solid",
        borderColor: success ? BANNER_LIGHT.border : APP_BORDER_LIGHT,
        backgroundColor: success ? BANNER_LIGHT.bg : CARD_BG_LIGHT,
        // The window paints its own surfaces — no elevation overlay.
        backgroundImage: "none",
        ...theme.applyStyles("dark", {
          borderColor: success ? BANNER_DARK.border : APP_BORDER_DARK,
          backgroundColor: success ? BANNER_DARK.bg : APP_SURFACE_DARK,
        }),
      })}
    >
      {children}
    </Box>
  );
}

/** The rounded product tile that leads each row. */
function IconTile({ icon, tint }: { icon: string; tint: string }) {
  return (
    <Box
      sx={{
        width: 36,
        height: 36,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "10px",
        background: tint,
        color: "#ffffff",
      }}
    >
      <MaterialSymbol name={icon} size={20} />
    </Box>
  );
}

// The masthead's own ground — background.default from the palette these
// screens were specced against.
const HEADER_BG_LIGHT = "#F8F9FB";

// Success greens from the palette these screens were specced against. Each
// scheme takes its own anchor for the text — 700 on light, 500 on dark — over
// the palest step of the ramp, thinned to a tint on dark so it sits on the
// window's ground rather than lighting it up.
const ACTIVE_LIGHT = { bg: "#ECFCF5", fg: "#0F9C67" };
const ACTIVE_DARK = { bg: "rgba(40, 212, 145, 0.16)", fg: "#28D491" };

// The all-clear banner: the same green, thinner, since it carries a whole
// card rather than a chip.
const CARD_BG_LIGHT = "#FCFCFD";

const BANNER_LIGHT = { bg: "#ECFCF5", border: "#A3F0D2" };
const BANNER_DARK = {
  bg: "rgba(40, 212, 145, 0.08)",
  border: "rgba(40, 212, 145, 0.24)",
};

/** "Active" / "Not connected" — the status chip beside a feature's name. */
function StatusChip({ on }: { on: boolean }) {
  return (
    <Box
      sx={(theme) => ({
        padding: "4px 8px",
        borderRadius: "999px",
        // The outline takes the label's own color at a quarter strength,
        // whatever the state — color-mix keeps it tied to `color` rather than
        // restating each state's hex.
        border: "1px solid",
        borderColor: "color-mix(in srgb, currentColor 25%, transparent)",
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 1,
        whiteSpace: "nowrap",
        ...(on
          ? {
              backgroundColor: ACTIVE_LIGHT.bg,
              color: ACTIVE_LIGHT.fg,
              ...theme.applyStyles("dark", {
                backgroundColor: ACTIVE_DARK.bg,
                color: ACTIVE_DARK.fg,
              }),
            }
          : {
              backgroundColor: theme.vars.palette.action.selected,
              color: theme.vars.palette.text.secondary,
            }),
      })}
    >
      {on ? "Active" : "Not connected"}
    </Box>
  );
}

function FeatureRow({
  name,
  icon,
  tint,
  description,
  defaultOn,
}: {
  name: string;
  icon: string;
  tint: string;
  description: string;
  defaultOn: boolean;
}) {
  const [on, setOn] = useState(defaultOn);

  return (
    <ClientCard>
      <IconTile icon={icon} tint={tint} />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            sx={{ fontSize: 15, fontWeight: 700, color: "text.primary" }}
          >
            {name}
          </Typography>
          <StatusChip on={on} />
        </Box>
        <Typography variant="body2" sx={{ mt: "4px", color: "text.secondary" }}>
          {description}
        </Typography>
      </Box>
      <IosSwitch
        checked={on}
        onChange={(event) => setOn(event.target.checked)}
        disableRipple
      />
      <MaterialSymbol
        name="chevron_right"
        size={20}
        sx={{ color: "text.secondary" }}
      />
    </ClientCard>
  );
}

export default function DnsfilterOneAppPage() {
  return (
    <Container maxWidth="lg">
      <Box
        sx={(theme) => ({
          // The client window's own size, not the page's.
          width: 1000,
          maxWidth: "100%",
          overflow: "hidden",
          borderRadius: "16px",
          border: `1px solid ${APP_BORDER_LIGHT}`,
          backgroundColor: APP_BG_LIGHT,
          ...theme.applyStyles("dark", {
            borderColor: APP_BORDER_DARK,
            backgroundColor: APP_BG_DARK,
          }),
        })}
      >
        <Box
          sx={(theme) => ({
            p: "20px",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            color: "text.primary",
            backgroundColor: HEADER_BG_LIGHT,
            ...theme.applyStyles("dark", { backgroundColor: APP_SURFACE_DARK }),
          })}
        >
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Logo />
              {/* The 1px of padding is the ring: the wrapper's gradient shows
                  around the pill, which paints the window's own ground. */}
              <Box
                sx={{
                  p: "1px",
                  borderRadius: "999px",
                  background: ACCENT_RING,
                }}
              >
                <Box
                  sx={(theme) => ({
                    px: 1,
                    borderRadius: "999px",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    background: BADGE_FILL_LIGHT,
                    color: "text.primary",
                    ...theme.applyStyles("dark", {
                      background: BADGE_CLIENT_PRIMARY_DARK,
                      color: theme.vars.palette.common.white,
                    }),
                  })}
                >
                  ONE
                </Box>
              </Box>
            </Box>
            <Typography
              variant="body2"
              sx={{ mt: 0.5, color: "text.secondary" }}
            >
              Protect every click.
            </Typography>
          </Box>
          <MaterialSymbol name="refresh" size={20} />
        </Box>

        {/* The brand colors, as a hairline under the masthead. */}
        <Box sx={{ height: "1px", background: ACCENT_RULE }} />

        <Box
          sx={{
            p: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {/* Everything the client knows about its own health, in one line. */}
          <ClientCard tone="success">
            <Box
              sx={{
                width: 10,
                height: 10,
                flexShrink: 0,
                borderRadius: "50%",
                backgroundColor: "success.main",
              }}
            />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                sx={{ fontSize: 14, fontWeight: 700, color: "text.primary" }}
              >
                All systems operational
              </Typography>
              <Typography
                variant="body2"
                sx={{ mt: "4px", color: "text.secondary" }}
              >
                DNS is filtering through DNSFilter over encrypted DNS.
              </Typography>
            </Box>
            <ClientButton
              variant="contained"
              disableElevation
              href="https://status.dnsfilter.com/"
              target="_blank"
              rel="noopener"
              endIcon={<MaterialSymbol name="north_east" size={16} />}
              sx={{ flexShrink: 0 }}
            >
              Status page
            </ClientButton>
          </ClientCard>

          {FEATURES.map((feature) => (
            <FeatureRow
              key={feature.name}
              name={feature.name}
              icon={feature.icon}
              tint={feature.tint}
              description={feature.description}
              defaultOn={feature.on}
            />
          ))}

          <Box>
            <Typography
              variant="body2"
              sx={{ mb: 1, color: "text.secondary", fontWeight: 600 }}
            >
              Support
            </Typography>
            <ClientCard>
              <IconTile
                icon="stethoscope"
                tint="linear-gradient(160deg, #9B7BFF 0%, #432C96 100%)"
              />
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  sx={{ fontSize: 14, fontWeight: 700, color: "text.primary" }}
                >
                  DNSFilter Diagnostic Tool (DDT)
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ mt: "4px", color: "text.secondary" }}
                >
                  Run the DNSFilter diagnostic checks — built in, runs right
                  here.
                </Typography>
              </Box>
              <ClientButton
                variant="contained"
                disableElevation
                sx={{ flexShrink: 0 }}
              >
                Run Diagnostics
              </ClientButton>
            </ClientCard>
          </Box>
        </Box>

        {/* The resolvers in use, on a band of their own at the foot. */}
        <Box
          sx={(theme) => ({
            padding: "12px 20px",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 3,
            borderTop: `1px solid ${APP_BORDER_LIGHT}`,
            // The band bookends the masthead, so it takes the same ground.
            backgroundColor: HEADER_BG_LIGHT,
            ...theme.applyStyles("dark", {
              borderTopColor: APP_BORDER_DARK,
              backgroundColor: APP_SURFACE_DARK,
            }),
          })}
        >
          {RESOLVERS.map((resolver) => (
            <Box key={resolver.value} sx={{ textAlign: "center" }}>
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                {resolver.label}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "monospace",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "text.secondary",
                }}
              >
                {resolver.value}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Container>
  );
}
