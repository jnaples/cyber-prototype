// DNSFilter One — the desktop client's main window.
//
// The rail picks the screen; a feature's own screen opens over whichever one
// is showing. The masthead changes with it, the brand hairline doesn't.

import {
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  Link,
  Typography,
} from "@mui/material";
import { useColorScheme } from "@mui/material/styles";
import { LineChart } from "@mui/x-charts/LineChart";
import { Fragment, useState } from "react";

import { Logo } from "@/components/logo/logo";
import { MaterialSymbol } from "@/components/material-symbol";

import {
  APP_BORDER_DARK,
  APP_BORDER_LIGHT,
  APP_SURFACE_DARK,
} from "../client-surface";
import { RoamingClientScreen } from "./roaming-client";
import {
  ACCENT_RING,
  ACCENT_RULE,
  APP_WASH_DARK,
  APP_WASH_LIGHT,
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

// The rail's sections. The selected one sits on its own ground, a step off
// the rail's.
const NAV_SELECTED_LIGHT = "#E2E5E9";
const NAV_SELECTED_DARK = "#171B1E";

/** The products, then — pinned to the foot of the rail — the two that aren't
 *  products. Settings hands off to the OS rather than opening a screen of its
 *  own: macOS registers this scheme, so the browser offers to open System
 *  Settings; elsewhere the link simply does nothing. */
const NAV = [
  { key: "filtering", label: "Filtering" },
  { key: "securetransit", label: "SecureTransit" },
  { key: "cybersight", label: "CyberSight" },
  { key: "agentshield", label: "AgentShield" },
] as const;

const NAV_FOOT = [
  {
    key: "settings",
    label: "Settings",
    href: "x-apple.systempreferences:com.apple.preference.network",
  },
  { key: "help", label: "Help" },
] as const;

type NavKey = (typeof NAV)[number]["key"] | "help";

type NavItem = { key: string; label: string; href?: string };

function NavLink({
  item,
  selected,
  onSelect,
}: {
  item: NavItem;
  selected: boolean;
  onSelect?: () => void;
}) {
  return (
    <Box
      {...(item.href
        ? { component: "a" as const, href: item.href }
        : { role: "button", onClick: onSelect })}
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
        textDecoration: "none",
        color: selected ? "text.primary" : "text.secondary",
        backgroundColor: selected ? NAV_SELECTED_LIGHT : "transparent",
        // A hairline of light along the top edge, so the selected item reads
        // as raised out of the rail rather than painted onto it.
        boxShadow: selected
          ? "inset 0 1px 0 rgba(255, 255, 255, 0.65)"
          : "none",
        "&:hover": {
          backgroundColor: selected
            ? NAV_SELECTED_LIGHT
            : theme.vars.palette.action.hover,
        },
        ...theme.applyStyles("dark", {
          backgroundColor: selected ? NAV_SELECTED_DARK : "transparent",
          boxShadow: selected
            ? "inset 0 1px 0 rgba(255, 255, 255, 0.05)"
            : "none",
          "&:hover": {
            backgroundColor: selected
              ? NAV_SELECTED_DARK
              : theme.vars.palette.action.hover,
          },
        }),
      })}
    >
      {item.label}
    </Box>
  );
}

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
        p: "8px",
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
      {NAV.map((item) => (
        <NavLink
          key={item.key}
          item={item}
          selected={item.key === active}
          onSelect={() => onChange(item.key)}
        />
      ))}

      {/* Everything that isn't a product sits at the foot, behind a rule. */}
      <Box sx={{ flex: 1 }} />
      {/* Bled past the rail's own inset, so the rule spans it edge to edge. */}
      <Divider sx={{ my: "8px", mx: "-8px" }} />
      {NAV_FOOT.map((item) => (
        <NavLink
          key={item.key}
          item={item}
          selected={item.key === active}
          onSelect={() => onChange(item.key as NavKey)}
        />
      ))}
    </Box>
  );
}

/** A product with no screen designed yet says so rather than inventing one. */
function PlaceholderScreen({ name }: { name: string }) {
  return (
    <Box sx={{ p: "24px" }}>
      <SectionLabel>{name}</SectionLabel>
      <ClientCard>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {name} settings go here.
        </Typography>
      </ClientCard>
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
      sx={{ p: "24px", display: "flex", flexDirection: "column", gap: "16px" }}
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
                      fontWeight: 600,
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

const ALLOWED_GRADIENT = "filtering-allowed";
const BLOCKED_GRADIENT = "filtering-blocked";

// Twelve five-minute buckets — an hour at a desk, not a synthetic wave. Mail
// and chat keep a floor under it, two reading stretches push it up, and the
// dip in the middle is a meeting with nothing but background telemetry
// running. The totals match the counts above: 234 allowed, 31 blocked — an
// hour of a person's browsing, kept on a scale where the blocks still read
// against it.
//
// Blocked tracks the browsing, not the clock: the ad and tracker lookups
// arrive with the pages that carry them, and it's zero while nobody is
// reading anything. It shares the scale, so it sits along the floor.
const ALLOWED_SERIES = [18, 24, 16, 12, 31, 38, 21, 9, 6, 17, 28, 14];
const BLOCKED_SERIES = [1, 3, 0, 0, 6, 9, 2, 0, 0, 1, 7, 2];

const ALLOWED_TOTAL = ALLOWED_SERIES.reduce((sum, n) => sum + n, 0);
const BLOCKED_TOTAL = BLOCKED_SERIES.reduce((sum, n) => sum + n, 0);

/** The hour behind us, one label per bucket, ending at the current five. */
const BUCKET_LABELS = ALLOWED_SERIES.map((_, i) => {
  const when = new Date();
  when.setMinutes(
    when.getMinutes() - (ALLOWED_SERIES.length - 1 - i) * 5,
    0,
    0,
  );
  return when.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
});

/** The hour's two series, drawn once for whichever card shows them.
 *
 *  Two filled series on one scale: each line over a wash of its own color,
 *  fading out before the floor. The gradients live in their own defs and the
 *  area paths point at them by series — and MUI brightens a flat fill, which
 *  would wash them out. */
function ActivityChart({
  allowed,
  blocked,
}: {
  allowed: string;
  blocked: string;
}) {
  return (
    <Box sx={{ position: "relative" }}>
      <Box
        component="svg"
        aria-hidden
        sx={{ position: "absolute", width: 0, height: 0 }}
      >
        <defs>
          {[
            { id: ALLOWED_GRADIENT, color: allowed },
            { id: BLOCKED_GRADIENT, color: blocked },
          ].map((wash) => (
            <linearGradient
              key={wash.id}
              id={wash.id}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={wash.color} stopOpacity={0.32} />
              <stop offset="100%" stopColor={wash.color} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
      </Box>
      <LineChart
        height={120}
        hideLegend
        margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
        grid={{ horizontal: true }}
        series={[
          {
            id: "allowed",
            data: ALLOWED_SERIES,
            color: allowed,
            label: "Allowed",
            curve: "linear",
            area: true,
            showMark: false,
          },
          {
            id: "blocked",
            data: BLOCKED_SERIES,
            color: blocked,
            label: "Blocked",
            curve: "linear",
            area: true,
            showMark: false,
          },
        ]}
        xAxis={[
          {
            scaleType: "point",
            data: BUCKET_LABELS,
            // A label every quarter hour; twelve would collide.
            tickInterval: (_value, index) => index % 3 === 0,
          },
        ]}
        yAxis={[{ width: 36 }]}
        sx={(theme) => ({
          // The frame reads as the window's own hairlines, not as chart
          // furniture.
          "& .MuiChartsAxis-line, & .MuiChartsAxis-tick": {
            stroke: APP_BORDER_LIGHT,
          },
          "& .MuiChartsGrid-line": { stroke: APP_BORDER_LIGHT },
          "& .MuiChartsAxis-tickLabel": {
            fill: theme.vars.palette.text.secondary,
            fontSize: 12,
          },
          ...theme.applyStyles("dark", {
            "& .MuiChartsAxis-line, & .MuiChartsAxis-tick": {
              stroke: APP_BORDER_DARK,
            },
            "& .MuiChartsGrid-line": { stroke: APP_BORDER_DARK },
          }),
          "& .MuiLineChart-area": { filter: "none", opacity: 1 },
          '& .MuiLineChart-area[data-series="allowed"]': {
            fill: `url(#${ALLOWED_GRADIENT})`,
          },
          '& .MuiLineChart-area[data-series="blocked"]': {
            fill: `url(#${BLOCKED_GRADIENT})`,
          },
          "& .MuiLineElement-root": { strokeWidth: 2 },
        })}
      />
    </Box>
  );
}

/** The key: which color is which series. */
function LegendChip({ label, color }: { label: string; color: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: "2px",
          backgroundColor: color,
        }}
      />
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {label}
      </Typography>
    </Box>
  );
}

/** Filtering: whether it's on, what it's been doing, and who controls it. */
function FilteringScreen({ onViewConfig }: { onViewConfig: () => void }) {
  const { mode, systemMode } = useColorScheme();
  const dark = (mode === "system" ? systemMode : mode) !== "light";
  // The deep button blue disappears into the window on dark, as on the map.
  const allowed = dark ? "#6FD0FF" : "#3527FD";
  // threatMagenta, light enough to read on the dark window.
  const blocked = dark ? "#F08AD5" : "#CE008E";

  return (
    <Box
      sx={{ p: "24px", display: "flex", flexDirection: "column", gap: "16px" }}
    >
      <ClientCard tone="success" padding="12px" radius="12px" gap="12px">
        {/* The same mark a success Alert leads with, sat on the title's line
            rather than centred against both. */}
        <MaterialSymbol
          name="check_circle"
          size={22}
          sx={{ alignSelf: "flex-start", mt: "1px", color: "inherit" }}
        />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          {/* The banner sets the color; both lines take it. */}
          <Typography sx={{ fontSize: 16, fontWeight: 600, color: "inherit" }}>
            Filtering
          </Typography>
          <Typography variant="body2" sx={{ mt: "4px", color: "inherit" }}>
            Active on this device, on any network.
          </Typography>
        </Box>
      </ClientCard>

      <ClientCard>
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <Box>
            <Typography
              sx={{ fontSize: 16, fontWeight: 600, color: "text.primary" }}
            >
              Activity
            </Typography>
            <Typography
              variant="body2"
              sx={{ mt: "4px", color: "text.secondary" }}
            >
              {BLOCKED_TOTAL} blocks · {ALLOWED_TOTAL} allowed
            </Typography>
          </Box>

          <ActivityChart allowed={allowed} blocked={blocked} />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <LegendChip label="Allowed" color={allowed} />
            <LegendChip label="Blocked" color={blocked} />
          </Box>
        </Box>
      </ClientCard>

      <ClientCard>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            sx={{ fontSize: 16, fontWeight: 600, color: "text.primary" }}
          >
            Configuration is managed by the organization
          </Typography>
          <Typography
            variant="body2"
            sx={{ mt: "4px", color: "text.secondary" }}
          >
            Controls how DNS requests reach the service and where internal names
            resolve
          </Typography>
        </Box>
        <Link
          component="button"
          type="button"
          underline="hover"
          onClick={onViewConfig}
          sx={{ flexShrink: 0, fontSize: 14, fontWeight: 600 }}
        >
          View
        </Link>
      </ClientCard>
    </Box>
  );
}

export default function DnsfilterOneAppPage() {
  // Which feature's screen is open, if any.
  const [screen, setScreen] = useState<string | null>(null);
  const [nav, setNav] = useState<NavKey>("filtering");
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
          background: APP_WASH_LIGHT,
          // The client's own text, redefined at the window so every
          // `text.primary` / `text.secondary` inside it resolves through
          // these two tokens.
          "--dnsf-palette-text-primary": "#0A0F1C",
          "--dnsf-palette-text-secondary": "#4B5569",
          ...theme.applyStyles("dark", {
            // The window's own edge, a step brighter than the hairlines
            // inside it.
            borderColor: "#29292D",
            background: APP_WASH_DARK,
            "--dnsf-palette-text-primary": "#FFFFFF",
            "--dnsf-palette-text-secondary": "#929AB4",
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
                // The theme's button type is 700 and uppercase; the client
                // reads in title case at 600 like everything around it.
                sx={{ flexShrink: 0, fontWeight: 600, textTransform: "none" }}
              >
                Back
              </Button>
              <IconTile icon={feature.icon} tint={feature.tint} />
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{ fontSize: 18, fontWeight: 600, color: "text.primary" }}
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
                      fontWeight: 600,
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
            <StatusChip on dot outlined label="Online" />
          </Box>
        </Box>

        {/* The brand colors, as a hairline under the masthead. */}
        <Box sx={{ flexShrink: 0, height: "2px", background: ACCENT_RULE }} />

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
            ) : nav === "filtering" ? (
              <FilteringScreen
                onViewConfig={() => setScreen("Roaming Client")}
              />
            ) : (
              <PlaceholderScreen
                name={NAV.find((item) => item.key === nav)?.label ?? ""}
              />
            )}
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
