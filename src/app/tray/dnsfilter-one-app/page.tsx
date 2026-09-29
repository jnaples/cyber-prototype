// DNSFilter One — the desktop client's main window.
//
// The rail picks the screen; a feature's own screen opens over whichever one
// is showing. The masthead changes with it, the brand hairline doesn't.

import {
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  Link,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useColorScheme } from "@mui/material/styles";
import { LineChart } from "@mui/x-charts/LineChart";
import { Fragment, useState, type ReactNode } from "react";

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
  ACCENT_DARK,
  HEADER_BG_LIGHT,
  PRIMARY_DARK,
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

/** What the window is showing: filtering as it should, a service it can't
 *  reach from this network, or the travel Wi-Fi started to get around it. */
type AppState = "active" | "unreachable" | "travel-wifi";

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

// Nothing resolved at all: the same hour, flat on the floor, so the card keeps
// its shape while it has nothing to show.
const EMPTY_SERIES = ALLOWED_SERIES.map(() => 0);

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
  empty = false,
}: {
  allowed: string;
  blocked: string;
  /** Draw the hour with nothing in it. */
  empty?: boolean;
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
            data: empty ? EMPTY_SERIES : ALLOWED_SERIES,
            color: allowed,
            label: "Allowed",
            curve: "linear",
            area: true,
            showMark: false,
          },
          {
            id: "blocked",
            data: empty ? EMPTY_SERIES : BLOCKED_SERIES,
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

/** The screen the Configuration card opens, kept out of FEATURES so the
 *  masthead can tell the two kinds of screen apart. */
const CONFIG_SCREEN = "Configuration";

/** The chevron a select drops, in place of MUI's filled triangle. */
function SelectChevron({ className }: { className?: string }) {
  return (
    <MaterialSymbol
      name="keyboard_arrow_down"
      size={18}
      className={className}
      sx={{ color: "text.secondary" }}
    />
  );
}

/** What a settings row can be: a value the organization fixed, a choice, a
 *  switch, or a set with a screen of its own behind it. */
type ConfigRow = {
  label: string;
  detail: string;
  value: string;
  /** How it's edited once the lock is off. Omitted means it isn't. */
  control?: "select" | "checkbox";
  options?: readonly string[];
  /** A link to what's behind the value. */
  action?: boolean;
};

/** Everything the organization has set, in the order the client shows it. */
const CONFIG_ROWS: readonly ConfigRow[] = [
  {
    label: "Connection mode",
    detail: "How DNS requests are routed on this device",
    value: "Transparent Proxy",
  },
  {
    label: "Filtering mode",
    detail: "How DNS requests are checked against the filtering policy",
    value: "Classic DNS Filtering",
    control: "select",
    options: ["Classic DNS Filtering", "Encrypted DNS (DoH)", "DNS over TLS"],
  },
  {
    label: "Failover mode",
    detail: "Whether traffic continues when the service cannot be reached",
    value: "Fail-Open",
    control: "select",
    options: ["Fail-Open", "Fail-Closed"],
  },
  {
    label: "Upstream protocol",
    detail: "How requests reach the service",
    value: "Standard",
    control: "select",
    options: ["Standard", "DNS over HTTPS", "DNS over TLS"],
  },
  {
    label: "IP version",
    detail: "Preferred addressing when connecting to the service",
    value: "Automatic",
    control: "select",
    options: ["Automatic", "IPv4 only", "IPv6 only"],
  },
  {
    label: "Local resolution",
    detail: "Domains that resolve on the local network instead of the service",
    value: "4 configured",
    action: true,
  },
  {
    label: "EDNS to local resolvers",
    detail: "Adds query details some internal resolvers require",
    value: "Off",
    control: "checkbox",
  },
  {
    label: "Travel Wi-Fi",
    detail:
      "Offers a manual sign in window when a page does not load on its own",
    value: "On, 30 seconds",
    control: "select",
    options: ["Off", "On, 30 seconds", "On, 60 seconds", "On, 5 minutes"],
  },
];

/** The last time the organization's settings reached this device — a few days
 *  back, so the line reads as a real sync rather than a fixed date. */
const LAST_SYNCED = (() => {
  const when = new Date();
  when.setDate(when.getDate() - 3);
  when.setHours(10, 17, 0, 0);
  const day = when.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const time = when.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${day} ${time}`;
})();

/** Configuration: what the organization has set, one row to a setting, ruled
 *  off from each other inside the card's own inset. */
function ConfigurationScreen({
  onBack,
  editable = false,
  onEdit,
}: {
  onBack: () => void;
  /** Whether the lock is off, which is what turns values into controls. */
  editable?: boolean;
  /** Called the first time anything here is changed. */
  onEdit?: () => void;
}) {
  const [values, setValues] = useState(() =>
    Object.fromEntries(CONFIG_ROWS.map((row) => [row.label, row.value])),
  );
  const change = (label: string, next: string) => {
    setValues((was) => ({ ...was, [label]: next }));
    onEdit?.();
  };

  return (
    <Box
      sx={{ p: "24px", display: "flex", flexDirection: "column", gap: "16px" }}
    >
      {/* The settings belong to Filtering, so the way back names it. */}
      <Box>
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 0 }}
        >
          <BannerButton icon onClick={onBack} label="Back to Filtering">
            <MaterialSymbol name="arrow_back" size={18} />
          </BannerButton>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{ fontSize: 18, fontWeight: 600, color: "text.primary" }}
            >
              Configuration
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Managed by the organization. Last synced {LAST_SYNCED}
            </Typography>
          </Box>
        </Box>
        {/* Past the screen's own inset, so the header reads as a band. */}
        <Divider sx={{ mt: "16px", mx: "-24px" }} />
      </Box>

      <ClientCard>
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {CONFIG_ROWS.map((row, index) => (
            <Fragment key={row.label}>
              {index > 0 && <Divider sx={{ my: "12px" }} />}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "text.primary",
                    }}
                  >
                    {row.label}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ mt: "2px", color: "text.secondary" }}
                  >
                    {row.detail}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  {editable && row.control === "select" ? (
                    <Select
                      size="small"
                      IconComponent={SelectChevron}
                      value={values[row.label]}
                      onChange={(event) =>
                        change(row.label, event.target.value)
                      }
                      sx={{
                        height: 32,
                        borderRadius: "10px",
                        fontSize: 14,
                        // The field's own padding would push past that height.
                        "& .MuiSelect-select": {
                          minHeight: "auto",
                          paddingTop: 0,
                          paddingBottom: 0,
                        },
                      }}
                    >
                      {row.options?.map((option) => (
                        <MenuItem
                          key={option}
                          value={option}
                          sx={{ fontSize: 14 }}
                        >
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  ) : editable && row.control === "checkbox" ? (
                    <Checkbox
                      checked={values[row.label] === "On"}
                      onChange={(event) =>
                        change(row.label, event.target.checked ? "On" : "Off")
                      }
                      slotProps={{ input: { "aria-label": row.label } }}
                      sx={{ p: 0 }}
                    />
                  ) : (
                    <Typography sx={{ fontSize: 14, color: "text.primary" }}>
                      {values[row.label]}
                    </Typography>
                  )}
                  {row.action && (
                    <Link
                      component="button"
                      type="button"
                      underline="hover"
                      sx={{ fontSize: 14, fontWeight: 600 }}
                    >
                      {editable ? "Edit" : "View"}
                    </Link>
                  )}
                </Box>
              </Box>
            </Fragment>
          ))}
        </Box>
      </ClientCard>
    </Box>
  );
}

/** The system's own ask, drawn inside the window: the lock doesn't come off
 *  until it's answered. */
function AuthPrompt({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  // Touch ID first; the password is the way round it.
  const [typing, setTyping] = useState(false);
  const [password, setPassword] = useState("");

  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        zIndex: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: "16px",
        backgroundColor: "rgba(4, 4, 6, 0.32)",
      }}
    >
      <Box
        sx={(theme) => ({
          width: 400,
          maxWidth: "100%",
          p: "16px",
          borderRadius: "16px",
          border: "1px solid",
          borderColor: APP_BORDER_LIGHT,
          // The same ground as the rail and the bar it came from.
          backgroundColor: HEADER_BG_LIGHT,
          textAlign: "center",
          boxShadow: "0 24px 48px rgba(4, 4, 6, 0.28)",
          ...theme.applyStyles("dark", {
            borderColor: APP_BORDER_DARK,
            backgroundColor: APP_SURFACE_DARK,
          }),
        })}
      >
        <Box
          sx={(theme) => ({
            width: 56,
            height: 56,
            mx: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "12px",
            color: theme.vars.palette.primary.main,
            backgroundColor: "rgba(53, 39, 253, 0.08)",
            ...theme.applyStyles("dark", {
              color: "#9AA8FF",
              backgroundColor: "rgba(154, 168, 255, 0.12)",
            }),
          })}
        >
          <MaterialSymbol name="lock" size={28} />
        </Box>
        <Typography
          sx={{
            mt: "16px",
            fontSize: 16,
            fontWeight: 600,
            color: "text.primary",
          }}
        >
          DNSFilter One is trying to change filtering settings.
        </Typography>
        <Typography variant="body2" sx={{ mt: "8px", color: "text.secondary" }}>
          {typing
            ? "Enter your password to allow this."
            : "Touch ID or enter your password to allow this."}
        </Typography>
        <Box
          component="form"
          onSubmit={(event: React.FormEvent) => {
            event.preventDefault();
            if (typing && password) onConfirm();
            else setTyping(true);
          }}
        >
          {typing && (
            <TextField
              autoFocus
              fullWidth
              size="small"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              sx={{
                mt: "16px",
                "& .MuiOutlinedInput-root": {
                  height: 32,
                  borderRadius: "10px",
                  fontSize: 14,
                },
                // The field's own padding would push past that height.
                "& .MuiOutlinedInput-input": { padding: "0 12px" },
              }}
            />
          )}
          <Box
            sx={{
              mt: "24px",
              display: "flex",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <BannerButton onClick={onCancel}>Cancel</BannerButton>
            <ClientButton
              type="submit"
              variant="contained"
              size="small"
              disableElevation
              disabled={typing && !password}
              sx={{
                height: 32,
                borderRadius: "10px",
                fontSize: 14,
                fontWeight: 600,
                textTransform: "none",
              }}
            >
              {typing ? "Submit" : "Use Password"}
            </ClientButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

/** What it would take to change any of it, held at the foot of the window on
 *  the same ground as the masthead and the rail. */
function LockBar({
  locked,
  onToggle,
  onRevert,
  dirty = false,
}: {
  locked: boolean;
  onToggle: () => void;
  /** Put every row back to what the organization set. */
  onRevert?: () => void;
  /** Whether anything has been changed since the lock came off. */
  dirty?: boolean;
}) {
  return (
    <Box
      sx={(theme) => ({
        flexShrink: 0,
        p: "12px 24px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        borderTop: "1px solid",
        borderColor: APP_BORDER_LIGHT,
        backgroundColor: HEADER_BG_LIGHT,
        ...theme.applyStyles("dark", {
          borderColor: APP_BORDER_DARK,
          backgroundColor: APP_SURFACE_DARK,
        }),
      })}
    >
      {/* The one control that unlocks the screen, carrying the weight of the
          primary button so it doesn't read as decoration. */}
      <ClientButton
        variant="contained"
        size="small"
        disableElevation
        onClick={onToggle}
        aria-label={locked ? "Unlock settings" : "Lock settings"}
        sx={{ minWidth: 0, height: 32, px: "8px", borderRadius: "10px" }}
      >
        <MaterialSymbol name={locked ? "lock" : "lock_open"} size={18} />
      </ClientButton>
      <Typography variant="body2" sx={{ flex: 1, color: "text.secondary" }}>
        {locked
          ? "Click the lock to make changes."
          : "Click the lock to prevent further changes."}
      </Typography>
      {/* Open, the bar becomes the place the edit is committed — and there's
          nothing to commit until something has changed. */}
      {!locked && (
        <Box sx={{ flexShrink: 0, display: "flex", gap: "8px" }}>
          <BannerButton onClick={onRevert}>Revert</BannerButton>
          <ClientButton
            variant="contained"
            size="small"
            disableElevation
            disabled={!dirty}
            sx={{
              height: 32,
              borderRadius: "10px",
              fontSize: 14,
              fontWeight: 600,
              textTransform: "none",
            }}
          >
            Save
          </ClientButton>
        </Box>
      )}
    </Box>
  );
}

/** What each warning state says, and the ways out of it. */
const WARNINGS = {
  unreachable: {
    title: "Can't reach service",
    body: "The service cannot be reached from this network.",
    actions: ["Start Travel Wi-Fi", "Report a Problem"],
  },
  "travel-wifi": {
    title: "Travel Wi-Fi on",
    body: "Sign in pages can load for 30 seconds. The service cannot be reached until sign in completes.",
    actions: ["Stop"],
  },
} as const;

/** An action inside a banner: outlined and secondary, so it reads as a way
 *  out of the state rather than the thing the screen is for. */
function BannerButton({
  children,
  onClick,
  label,
  icon = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  /** What it does, for a button whose face is an icon. */
  label?: string;
  /** Trim it to its glyph, for an icon on its own. */
  icon?: boolean;
}) {
  return (
    <Button
      variant="outlined"
      color="secondary"
      size="small"
      onClick={onClick}
      aria-label={label}
      // The theme's button type is 700 and uppercase; the client reads in
      // title case at 600 like everything around it.
      sx={(theme) => ({
        whiteSpace: "nowrap",
        ...(icon ? { minWidth: 0, px: "8px" } : {}),
        height: 32,
        borderRadius: "10px",
        fontSize: 14,
        fontWeight: 600,
        textTransform: "none",
        borderColor: "rgba(30, 41, 74, 0.2)",
        // The same hairline of light the selected nav item takes, so a
        // control in the banner reads as raised out of it.
        boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.65)",
        "&:hover": {
          backgroundColor: "#F3F5FA",
          borderColor: "rgba(30, 41, 74, 0.34)",
        },
        ...theme.applyStyles("dark", {
          borderColor: "rgba(120, 138, 190, 0.35)",
          boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.05)",
          "&:hover": {
            backgroundColor: "rgba(26, 28, 36, 0.72)",
            borderColor: "rgba(120, 138, 190, 0.49)",
          },
        }),
      })}
    >
      {children}
    </Button>
  );
}

/** Filtering: whether it's on, what it's been doing, and who controls it. */
function FilteringScreen({
  onViewConfig,
  state = "active",
}: {
  onViewConfig: () => void;
  state?: AppState;
}) {
  const { mode, systemMode } = useColorScheme();
  const dark = (mode === "system" ? systemMode : mode) !== "light";
  // A step apart per scheme, so the line sits the same against either ground.
  const allowed = dark ? "#4779ED" : "#487AEE";
  // threatMagenta, the same vivid pink in both schemes.
  const blocked = "#CE008E";
  const warning = state === "active" ? null : WARNINGS[state];
  // Only an unreachable service has nothing to plot; travel Wi-Fi is on its
  // way back to one, and the hour behind it still happened.
  const quiet = state === "unreachable";

  return (
    <Box
      sx={{ p: "24px", display: "flex", flexDirection: "column", gap: "16px" }}
    >
      {!warning ? (
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
            <Typography
              sx={{ fontSize: 16, fontWeight: 600, color: "inherit" }}
            >
              Filtering
            </Typography>
            <Typography variant="body2" sx={{ mt: "4px", color: "inherit" }}>
              Active on this device, on any network.
            </Typography>
          </Box>
        </ClientCard>
      ) : (
        <ClientCard tone="warning" padding="12px" radius="12px" gap="12px">
          {/* The mark a warning Alert leads with, on the title's line. */}
          <MaterialSymbol
            name="warning"
            size={22}
            sx={{ alignSelf: "flex-start", mt: "1px", color: "inherit" }}
          />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              sx={{ fontSize: 16, fontWeight: 600, color: "inherit" }}
            >
              {warning.title}
            </Typography>
            <Typography variant="body2" sx={{ mt: "4px", color: "inherit" }}>
              {warning.body}
            </Typography>
          </Box>
          {/* The ways out of it, side by side and equal in weight. */}
          <Box sx={{ flexShrink: 0, display: "flex", gap: "8px" }}>
            {warning.actions.map((action) => (
              <BannerButton key={action}>{action}</BannerButton>
            ))}
          </Box>
        </ClientCard>
      )}

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
              {quiet
                ? "No queries seen in the last hour"
                : `${BLOCKED_TOTAL} blocks · ${ALLOWED_TOTAL} allowed`}
            </Typography>
          </Box>

          <ActivityChart allowed={allowed} blocked={blocked} empty={quiet} />

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

/** One window under its own title. Each copy keeps its own navigation, so a
 *  second one can sit below the first showing a different state. */
function AppWindow({
  title,
  state = "active",
  initialScreen = null,
  unlocked = false,
}: {
  title: string;
  state?: AppState;
  /** Open the window on a screen rather than on Filtering itself. */
  initialScreen?: string | null;
  /** Start with the settings already unlocked, past the system's prompt. */
  unlocked?: boolean;
}) {
  // Which screen is open over the nav's own, if any.
  const [screen, setScreen] = useState<string | null>(initialScreen);
  const [nav, setNav] = useState<NavKey>("filtering");
  const feature = FEATURES.find((f) => f.name === screen);
  const config = screen === CONFIG_SCREEN;
  // The settings are locked until the system's prompt is answered.
  const [locked, setLocked] = useState(!unlocked);
  const [asking, setAsking] = useState(false);
  // Whether anything has been changed, and the key that throws those changes
  // away: remounting the screen is what puts every control back.
  const [dirty, setDirty] = useState(false);
  const [edits, setEdits] = useState(0);
  const revert = () => {
    setEdits((n) => n + 1);
    setDirty(false);
  };

  return (
    <Box>
      <Typography variant="cardTitle" sx={{ display: "block", mb: "8px" }}>
        {title}
      </Typography>
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
          // One blue for everything primary inside the window — the button's
          // own — so links and checkboxes match the controls beside them.
          "--dnsf-palette-primary-main": PRIMARY_DARK,
          "--dnsf-palette-primary-light": PRIMARY_DARK,
          // The fields' own states, one place for every input in the window.
          "& .MuiOutlinedInput-notchedOutline": {
            borderWidth: 1,
            borderColor: "rgba(30, 41, 74, 0.2)",
          },
          "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#13131B",
          },
          "& .MuiOutlinedInput-root.Mui-focused": {
            boxShadow: "0 0 0 3px rgba(62, 111, 224, 0.2)",
          },
          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
            { borderWidth: 2, borderColor: "#3E6FE0" },
          "& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline":
            { borderColor: "#C8352A" },
          "& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline":
            { borderColor: "rgba(30, 41, 74, 0.13)" },
          ...theme.applyStyles("dark", {
            // The window's own edge, a step brighter than the hairlines
            // inside it.
            borderColor: "#29292D",
            background: APP_WASH_DARK,
            "--dnsf-palette-text-primary": "#FFFFFF",
            "--dnsf-palette-text-secondary": "#929AB4",
            // Buttons keep their own blue; everything else primary — links,
            // checkboxes, switches — lifts off the dark ground.
            "--dnsf-palette-primary-main": ACCENT_DARK,
            "--dnsf-palette-primary-light": ACCENT_DARK,
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(120, 138, 190, 0.35)",
            },
            "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#FFFFFF",
            },
            "& .MuiOutlinedInput-root.Mui-focused": {
              boxShadow: "0 0 0 3px rgba(74, 124, 240, 0.32)",
            },
            "& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline":
              { borderColor: "#FF5A4D" },
            "& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline":
              { borderColor: "rgba(120, 138, 190, 0.14)" },
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
            {/* v3 carries the service's own state up here, so the screen
                below doesn't need a banner for it. */}
            {state === "unreachable" ? (
              <StatusChip on dot tone="warning" label="Can't reach service" />
            ) : (
              // Travel Wi-Fi is still a live connection, so the masthead reads
              // the same as it does when filtering is clean.
              <StatusChip on dot label="Online" />
            )}
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
          {/* The screen and anything pinned under it, beside the rail. The
              prompt covers this column rather than the whole window. */}
          <Box
            sx={{
              position: "relative",
              flex: 1,
              minWidth: 0,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* `scroll` rather than `auto`, plus an explicit width, so macOS
                shows a classic bar instead of the overlay one that fades
                out. */}
            <Box
              sx={(theme) => ({
                flex: 1,
                minHeight: 0,
                overflowY: "scroll",
                scrollbarGutter: "stable",
                scrollbarColor: `${theme.vars.palette.action.disabled} transparent`,
                "&::-webkit-scrollbar": { width: 12, WebkitAppearance: "none" },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: "transparent",
                },
                "&::-webkit-scrollbar-thumb": {
                  borderRadius: 8,
                  border: "3px solid transparent",
                  backgroundClip: "content-box",
                  backgroundColor: theme.vars.palette.action.disabled,
                },
              })}
            >
              {config ? (
                <ConfigurationScreen
                  key={edits}
                  onBack={() => setScreen(null)}
                  editable={!locked}
                  onEdit={() => setDirty(true)}
                />
              ) : feature ? (
                <RoamingClientScreen />
              ) : nav === "help" ? (
                <HelpScreen />
              ) : nav === "filtering" ? (
                <FilteringScreen
                  state={state}
                  onViewConfig={() => setScreen(CONFIG_SCREEN)}
                />
              ) : (
                <PlaceholderScreen
                  name={NAV.find((item) => item.key === nav)?.label ?? ""}
                />
              )}
            </Box>

            {config && (
              <LockBar
                locked={locked}
                dirty={dirty}
                onRevert={revert}
                onToggle={() => {
                  if (locked) setAsking(true);
                  else {
                    // Locking up leaves nothing half-changed behind it.
                    setLocked(true);
                    revert();
                  }
                }}
              />
            )}

            {config && asking && (
              <AuthPrompt
                onCancel={() => setAsking(false)}
                onConfirm={() => {
                  setAsking(false);
                  setLocked(false);
                }}
              />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default function DnsfilterOneAppPage() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ display: "flex", flexDirection: "column", gap: "40px" }}>
        <AppWindow title="Filtering - Active" />
        <AppWindow
          title="Filtering - Can't reach service"
          state="unreachable"
        />
        <AppWindow title="Filtering - Travel Wi-Fi on" state="travel-wifi" />
        <AppWindow
          title="Filtering - Configuration locked"
          initialScreen={CONFIG_SCREEN}
        />
        <AppWindow
          title="Filtering - Configuration unlocked"
          initialScreen={CONFIG_SCREEN}
          unlocked
        />
      </Box>
    </Container>
  );
}
