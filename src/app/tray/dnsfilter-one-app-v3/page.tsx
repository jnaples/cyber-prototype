// DNSFilter One v3 — a fork of v2 to try a third direction. It carries its
// own ui/tokens, so it can diverge freely.
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
  BADGE_FILL_DARK,
  BADGE_FILL_LIGHT,
  HEADER_BG_LIGHT,
} from "./tokens";
import { ClientButton } from "./client-button";
import {
  ClientCard,
  CopyValue,
  IconTile,
  SectionLabel,
  StatusChip,
} from "./ui";

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

// The resolvers the client is actually using. Two pairs — one per protocol —
// so each row says which, rather than leaving two "Primary" rows to explain
// themselves.
const RESOLVERS = [
  { label: "Primary IPv4", value: "103.247.36.36" },
  { label: "Secondary IPv4", value: "103.247.37.37" },
  { label: "Primary IPv6", value: "2402:5c40:5c40::3636" },
  { label: "Secondary IPv6", value: "2402:5c40:5c41::3737" },
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
        p: "16px",
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

// v3 puts the window's sections in a rail of their own. The selected one sits
// on its own ground, a step off the rail's.
const NAV_SELECTED_LIGHT = "#E2E5E9";
const NAV_SELECTED_DARK = "#171B1E";
// v3 puts the window's sections in a rail of their own.
const NAV = [
  { key: "dashboard", label: "Dashboard", icon: "dashboard" },
  { key: "help", label: "Help", icon: "support" },
] as const;

type NavKey = (typeof NAV)[number]["key"];

function NavRail({
  active,
  onChange,
}: {
  active: NavKey;
  onChange: (key: NavKey) => void;
}) {
  return (
    <Box
      component="nav"
      sx={(theme) => ({
        width: 180,
        flexShrink: 0,
        p: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        borderRight: "1px solid",
        borderColor: APP_BORDER_LIGHT,
        // The rail bookends the masthead, so it takes the same ground.
        backgroundColor: HEADER_BG_LIGHT,
        ...theme.applyStyles("dark", {
          borderColor: APP_BORDER_DARK,
          backgroundColor: APP_SURFACE_DARK,
        }),
      })}
    >
      {NAV.map((item) => {
        const selected = item.key === active;
        return (
          <Box
            key={item.key}
            role="button"
            onClick={() => onChange(item.key)}
            sx={(theme) => ({
              px: "12px",
              py: "8px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              color: selected ? "text.primary" : "text.secondary",
              backgroundColor: selected ? NAV_SELECTED_LIGHT : "transparent",
              "&:hover": {
                backgroundColor: selected
                  ? NAV_SELECTED_LIGHT
                  : theme.vars.palette.action.hover,
              },
              ...theme.applyStyles("dark", {
                backgroundColor: selected ? NAV_SELECTED_DARK : "transparent",
                "&:hover": {
                  backgroundColor: selected
                    ? NAV_SELECTED_DARK
                    : theme.vars.palette.action.hover,
                },
              }),
            })}
          >
            <MaterialSymbol name={item.icon} size={20} />
            {item.label}
          </Box>
        );
      })}
    </Box>
  );
}

// The ways to get a problem looked at. They share the support tint, so the
// list reads as one group.
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
  {
    name: "Status page",
    icon: "monitor_heart",
    description: "Check whether DNSFilter itself is having trouble.",
    action: "View status page",
    href: "https://status.dnsfilter.com/",
  },
];

/** Everything under Help, as one list. */
function HelpScreen() {
  return (
    <Box
      sx={{ p: "24px", display: "flex", flexDirection: "column", gap: "24px" }}
    >
      <ClientCard padding={0}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {SUPPORT.map((item, i) => (
            <Fragment key={item.name}>
              {i > 0 && <Divider />}
              <Box
                sx={{
                  p: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <IconTile icon={item.icon} tint={SUPPORT_TINT} />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    sx={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "text.primary",
                    }}
                  >
                    {item.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ mt: "4px", color: "text.secondary" }}
                  >
                    {item.description}
                  </Typography>
                </Box>
                <ClientButton
                  variant="contained"
                  disableElevation
                  {...(item.href
                    ? { href: item.href, target: "_blank", rel: "noopener" }
                    : {})}
                  sx={{ flexShrink: 0 }}
                >
                  {item.action}
                </ClientButton>
              </Box>
            </Fragment>
          ))}
        </Box>
      </ClientCard>

      {/* The resolvers themselves, apart from the things you can act on. */}
      <Box>
        <SectionLabel>DNS resolvers</SectionLabel>
        <ClientCard padding={0}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {RESOLVERS.map((resolver, i) => (
              <Fragment key={resolver.value}>
                {i > 0 && <Divider />}
                <Box
                  sx={{
                    px: "16px",
                    py: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                  }}
                >
                  <Typography sx={{ fontSize: 14, color: "text.primary" }}>
                    {resolver.label}
                  </Typography>
                  <Box
                    sx={{ display: "flex", alignItems: "center", gap: "4px" }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "monospace",
                        fontSize: 14,
                        color: "text.secondary",
                      }}
                    >
                      {resolver.value}
                    </Typography>
                    <CopyValue value={resolver.value} />
                  </Box>
                </Box>
              </Fragment>
            ))}
          </Box>
        </ClientCard>
      </Box>
    </Box>
  );
}

function HomeScreen({ onOpen }: { onOpen: (name: string) => void }) {
  return (
    <Box
      sx={{ p: "24px", display: "flex", flexDirection: "column", gap: "24px" }}
    >
      {/* v2: the three products share one card, divided by rules rather than
          sitting in cards of their own. */}
      <ClientCard padding={0}>
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
    </Box>
  );
}

export default function DnsfilterOneAppV3Page() {
  // Which feature's screen is open, if any.
  const [screen, setScreen] = useState<string | null>(null);
  const [nav, setNav] = useState<NavKey>("dashboard");
  const feature = FEATURES.find((f) => f.name === screen);

  return (
    <Container maxWidth="lg">
      <Box
        sx={(theme) => ({
          // The client window's own size, not the page's. It's a fixed pane:
          // the masthead and the band at its foot stay put, and the screen
          // between them scrolls beside the nav.
          width: 1000,
          maxWidth: "100%",
          // A fixed pane, not a hugging one: the window is always this tall.
          height: 600,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          borderRadius: "16px",
          border: `1px solid ${APP_BORDER_LIGHT}`,
          backgroundColor: APP_BG_LIGHT,
          ...theme.applyStyles("dark", {
            // The window's own edge, a step brighter than the hairlines
            // inside it.
            borderColor: "#29292D",
            backgroundColor: APP_BG_DARK,
          }),
        })}
      >
        <Box
          sx={(theme) => ({
            flexShrink: 0,
            p: "16px",
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

          <Box
            sx={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            {/* Its own control, so it answers to the pointer. */}
            <IconButton
              aria-label="Refresh"
              size="small"
              sx={{
                color: "text.secondary",
                "&:hover": { color: "text.primary" },
              }}
            >
              <MaterialSymbol name="refresh" size={20} />
            </IconButton>
            {/* v3 carries the service's own state up here, so the screen
                below doesn't need a banner for it. */}
            <StatusChip on dot label="Online" />
          </Box>
        </Box>

        {/* The brand colors, as a hairline under the masthead. */}
        <Box sx={{ flexShrink: 0, height: "1px", background: ACCENT_RULE }} />

        <Box sx={{ flex: 1, minHeight: 0, display: "flex" }}>
          <NavRail
            active={nav}
            onChange={(next) => {
              setNav(next);
              setScreen(null);
            }}
          />
          {/* `scroll` rather than `auto`, plus an explicit width, so macOS
              shows a classic bar instead of the overlay one that fades out. */}
          <Box
            sx={(theme) => ({
              flex: 1,
              minWidth: 0,
              overflowY: "scroll",
              scrollbarGutter: "stable",
              scrollbarColor: `${theme.vars.palette.action.disabled} transparent`,
              "&::-webkit-scrollbar": { width: 12, WebkitAppearance: "none" },
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
            ) : nav === "help" ? (
              <HelpScreen />
            ) : (
              <HomeScreen onOpen={setScreen} />
            )}
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
