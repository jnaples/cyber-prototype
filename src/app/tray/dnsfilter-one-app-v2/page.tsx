// DNSFilter One v2 — a fork of the client window to try a second
// direction. It carries its own ui/tokens, so it can diverge freely.
//
// Two screens live in the same chrome: the home list, and a feature's own
// screen behind it. The masthead changes with the screen; the brand hairline
// and the resolver band don't.

import {
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  Link,
  Typography,
} from "@mui/material";
import { Fragment, useState } from "react";

import { Logo } from "@/components/logo/logo";
import { MaterialSymbol } from "@/components/material-symbol";

import {
  APP_BG_DARK,
  APP_BG_LIGHT,
  APP_BORDER_DARK,
  APP_BORDER_LIGHT,
  APP_SURFACE_DARK,
} from "../client-surface";
import { IosSwitch } from "../ios-switch";
import { RoamingClientScreen } from "./roaming-client";
import {
  ACCENT_RING,
  ACCENT_RULE,
  ACTIVE_DARK,
  ACTIVE_LIGHT,
  BADGE_FILL_DARK,
  BADGE_FILL_LIGHT,
  HEADER_BG_LIGHT,
} from "./tokens";
import { ClientButton } from "./client-button";
import { ClientCard, IconTile, StatusChip } from "./ui";

const FEATURES = [
  {
    name: "Roaming Client",
    icon: "language",
    tint: "linear-gradient(160deg, #534FFF 0%, #1C1AD5 100%)",
    description: "Encrypted DNS with your DNSFilter policy, on any network.",
    on: true,
    // The only feature with a screen of its own so far.
    screen: true,
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

// What the service itself is reporting, as the banner states it.
const SERVICE_STATUS = "Operational";

// The two ways to get help, side by side under the products. They share the
// support tint, so they read as a pair.
const SUPPORT_TINT = "linear-gradient(160deg, #9B7BFF 0%, #432C96 100%)";

const SUPPORT = [
  {
    name: "DNSFilter Diagnostic Tool (DDT)",
    icon: "stethoscope",
    description:
      "Run the DNSFilter diagnostic checks — built in, runs right here.",
    action: "Run Diagnostics",
  },
  {
    name: "Report a problem",
    icon: "support",
    description:
      "Send this device's diagnostics and a note to DNSFilter support.",
    action: "Send report",
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

function FeatureRow({
  name,
  icon,
  tint,
  description,
  defaultOn,
  onOpen,
}: {
  name: string;
  icon: string;
  tint: string;
  description: string;
  defaultOn: boolean;
  onOpen?: () => void;
}) {
  const [on, setOn] = useState(defaultOn);

  return (
    <Box
      sx={{
        padding: "16px 0",
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      <IconTile icon={icon} tint={tint} />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            sx={{ fontSize: 16, fontWeight: 700, color: "text.primary" }}
          >
            {name}
          </Typography>
          <StatusChip on={on} />
        </Box>
        <Typography variant="body2" sx={{ mt: "4px", color: "text.secondary" }}>
          {description}
        </Typography>
        {/* v2 asks for the feature's screen by name instead of a chevron. */}
        <Link
          component="button"
          type="button"
          underline="hover"
          onClick={onOpen}
          sx={{ fontSize: 14, fontWeight: 600 }}
        >
          Configure
        </Link>
      </Box>
      {/* The switch acts on the feature, not on the row it sits in. */}
      <Box
        component="span"
        sx={{ display: "inline-flex" }}
        onClick={(event) => event.stopPropagation()}
      >
        <IosSwitch
          checked={on}
          onChange={(event) => setOn(event.target.checked)}
          disableRipple
        />
      </Box>
    </Box>
  );
}

function HomeScreen({ onOpen }: { onOpen: (name: string) => void }) {
  return (
    <Box
      sx={{ p: "24px", display: "flex", flexDirection: "column", gap: "24px" }}
    >
      {/* Everything the client knows about its own health, in one line. */}
      <ClientCard tone="success" padding="16px">
        <Box
          sx={{
            width: 10,
            height: 10,
            flexShrink: 0,
            borderRadius: "50%",
            backgroundColor: "success.main",
          }}
        />
        {/* The banner's own green carries the line. */}
        <Typography
          sx={(theme) => ({
            minWidth: 0,
            flex: 1,
            fontSize: 14,
            color: ACTIVE_LIGHT.fg,
            ...theme.applyStyles("dark", { color: ACTIVE_DARK.fg }),
          })}
        >
          <Box component="span" sx={{ fontWeight: 700 }}>
            Service status:
          </Box>{" "}
          {SERVICE_STATUS}
        </Typography>
        <ClientButton
          variant="contained"
          disableElevation
          href="https://status.dnsfilter.com/"
          target="_blank"
          rel="noopener"
          endIcon={<MaterialSymbol name="launch" size={16} />}
          sx={{ flexShrink: 0 }}
        >
          Status page
        </ClientButton>
      </ClientCard>

      {/* v2: the three products share one card, divided by rules rather than
          sitting in cards of their own. */}
      <ClientCard padding="0 16px">
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {FEATURES.map((feature, i) => (
            <Fragment key={feature.name}>
              {i > 0 && <Divider />}
              <FeatureRow
                name={feature.name}
                icon={feature.icon}
                tint={feature.tint}
                description={feature.description}
                defaultOn={feature.on}
                onOpen={feature.screen ? () => onOpen(feature.name) : undefined}
              />
            </Fragment>
          ))}
        </Box>
      </ClientCard>

      {/* v2: the two support cards share a row. */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
          gap: "24px",
          alignItems: "stretch",
        }}
      >
        {SUPPORT.map((card) => (
          <ClientCard key={card.name}>
            <IconTile icon={card.icon} tint={SUPPORT_TINT} />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                sx={{ fontSize: 14, fontWeight: 700, color: "text.primary" }}
              >
                {card.name}
              </Typography>
              <Typography
                variant="body2"
                sx={{ mt: "4px", color: "text.secondary" }}
              >
                {card.description}
              </Typography>
              <ClientButton
                variant="contained"
                disableElevation
                sx={{ mt: 1.5 }}
              >
                {card.action}
              </ClientButton>
            </Box>
          </ClientCard>
        ))}
      </Box>
    </Box>
  );
}

export default function DnsfilterOneAppV2Page() {
  // Which feature's screen is open, if any.
  const [screen, setScreen] = useState<string | null>(null);
  const feature = FEATURES.find((f) => f.name === screen);

  return (
    <Container maxWidth="lg">
      <Box
        sx={(theme) => ({
          // The client window's own size, not the page's. It's a fixed pane:
          // the masthead and the bands at its foot stay put, and the screen
          // between them scrolls.
          width: 1000,
          maxWidth: "100%",
          maxHeight: 600,
          display: "flex",
          flexDirection: "column",
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
            flexShrink: 0,
            p: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            color: "text.primary",
            backgroundColor: HEADER_BG_LIGHT,
            ...theme.applyStyles("dark", { backgroundColor: APP_SURFACE_DARK }),
          })}
        >
          {feature ? (
            // A feature's screen names itself, and keeps the way back.
            <Box
              sx={{
                minWidth: 0,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              {/* Leaving a screen is a lesser action than anything on it. */}
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setScreen(null)}
                startIcon={<MaterialSymbol name="chevron_left" size={18} />}
                sx={{ flexShrink: 0 }}
              >
                Back
              </Button>
              <IconTile icon={feature.icon} tint={feature.tint} />
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{ fontSize: 18, fontWeight: 700, color: "text.primary" }}
                >
                  {feature.name}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {feature.description}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Logo />
                {/* The 1px of padding is the ring: the wrapper's gradient shows
                    around the pill, which paints its own fill. */}
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
                        background: BADGE_FILL_DARK,
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
          )}

          {/* Its own control, so it answers to the pointer. */}
          <IconButton
            aria-label="Refresh"
            size="small"
            sx={{
              flexShrink: 0,
              color: "text.secondary",
              "&:hover": { color: "text.primary" },
            }}
          >
            <MaterialSymbol name="refresh" size={20} />
          </IconButton>
        </Box>

        {/* The brand colors, as a hairline under the masthead. */}
        <Box sx={{ flexShrink: 0, height: "1px", background: ACCENT_RULE }} />

        {/* `scroll` rather than `auto`, plus an explicit width, so macOS shows
            a classic bar instead of the overlay one that fades out. */}
        <Box
          sx={(theme) => ({
            flex: 1,
            minHeight: 0,
            overflowY: "scroll",
            scrollbarGutter: "stable",
            scrollbarColor: `${theme.vars.palette.action.disabled} transparent`,
            "&::-webkit-scrollbar": {
              width: 12,
              WebkitAppearance: "none",
            },
            "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
            "&::-webkit-scrollbar-thumb": {
              borderRadius: 8,
              border: "3px solid transparent",
              backgroundClip: "content-box",
              backgroundColor: theme.vars.palette.action.disabled,
            },
          })}
        >
          {feature ? (
            <RoamingClientScreen />
          ) : (
            <HomeScreen onOpen={setScreen} />
          )}
        </Box>

        {/* The resolvers in use, on a band of their own at the foot. */}
        <Box
          sx={(theme) => ({
            flexShrink: 0,
            padding: "16px 24px",
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
