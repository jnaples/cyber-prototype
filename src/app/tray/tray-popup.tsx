// The DNSFilter One tray popup, from the Windows Tray Icon Status design.
// Sizes are the design's own (a 360px popup, a 328px rule); the colors are
// theme tokens apart from the popup's own ground.
//
// Shared by the tray pages, and the place the state props will land as the
// variations are built out.

import { Box, Button, Divider, Link, Typography } from "@mui/material";
import { useState, type ReactNode } from "react";

import { CLIENT_BG_DARK, CLIENT_BG_LIGHT } from "./client-surface";
import {
  ACCENT_RULE,
  ACTIVE_DARK,
  ACTIVE_LIGHT,
  BANNER_DARK,
  BANNER_LIGHT,
  ERROR_BANNER_DARK,
  ERROR_BANNER_LIGHT,
  outlinedFace,
  WARN_BANNER_DARK,
  WARN_BANNER_LIGHT,
} from "./dnsfilter-one-app/tokens";
import { StatusChip } from "./dnsfilter-one-app/ui";
import { IosSwitch } from "./ios-switch";

/** The tints the desktop window uses for the same three states, so a banner
 *  or a dot in the popup reads as the same thing it does there. */
const TONES = {
  success: { light: BANNER_LIGHT, dark: BANNER_DARK },
  warning: { light: WARN_BANNER_LIGHT, dark: WARN_BANNER_DARK },
  error: { light: ERROR_BANNER_LIGHT, dark: ERROR_BANNER_DARK },
} as const;

/** Green when healthy, amber when degraded, otherwise the gray a default Chip
 *  gives its icon. */
type DotTone = "success" | "warning" | "error" | "idle";

/** "default" is the neutral gray one; the rest are MUI's own Alert tones. */
type BannerSeverity = "default" | "warning" | "error";

/** The states the popup can show, and the words and dots each one uses. */
export type TrayState =
  | "online"
  | "no-connection"
  | "unreachable"
  | "not-filtering"
  | "turned-off"
  | "incident"
  | "sign-in"
  | "travel-wifi";

const STATES: Record<
  TrayState,
  {
    status: string;
    statusTone: DotTone;
    filtering: string;
    filteringTone: DotTone;
    /** Banner above the filtering row, when the state needs one. */
    banner?: { text: ReactNode; severity: BannerSeverity };
    /** The permissions switch starts off — filtering isn't running because
     *  the user turned it off. */
    switchOff?: boolean;
  }
> = {
  online: {
    status: "Online",
    statusTone: "success",
    filtering: "Active",
    filteringTone: "success",
  },
  "no-connection": {
    status: "No connection",
    statusTone: "idle",
    filtering: "Waiting",
    filteringTone: "idle",
    banner: {
      text: "No network connection. Filtering resumes when the connection returns.",
      severity: "default",
    },
  },
  unreachable: {
    status: "Can't reach service",
    statusTone: "warning",
    filtering: "Not filtering",
    filteringTone: "warning",
    banner: {
      text: "The service cannot be reached from this network.",
      severity: "warning",
    },
  },
  incident: {
    status: "Not filtering",
    statusTone: "warning",
    filtering: "Not filtering",
    filteringTone: "warning",
    banner: {
      severity: "warning",
      text: (
        <>
          The service is reporting an incident. Filtering may be interrupted
          until it&apos;s resolved.
          <br />
          <Link
            href="https://status.dnsfilter.com/"
            target="_blank"
            rel="noopener"
            sx={{
              color: "inherit",
              fontWeight: 600,
              textDecoration: "underline",
            }}
          >
            Status page
          </Link>
        </>
      ),
    },
  },
  "turned-off": {
    status: "Turned off",
    statusTone: "idle",
    filtering: "Off",
    filteringTone: "idle",
    switchOff: true,
  },
  "not-filtering": {
    status: "Not filtering",
    statusTone: "error",
    filtering: "Not filtering",
    filteringTone: "error",
    banner: {
      text: "This device is not filtering. A restart often clears it.",
      severity: "error",
    },
  },
  "travel-wifi": {
    status: "Travel Wi-Fi on",
    statusTone: "warning",
    filtering: "Waiting",
    filteringTone: "warning",
    banner: {
      severity: "warning",
      text: (
        <>
          Sign in pages can load for 30 seconds. The service cannot be reached
          until sign in completes.
          <br />
          <Box
            component="span"
            sx={{ display: "inline-block", mt: "4px", fontWeight: 600 }}
          >
            Stop, 0:24 remaining
          </Box>
        </>
      ),
    },
  },
  "sign-in": {
    status: "Sign-in required",
    statusTone: "warning",
    filtering: "Waiting",
    filteringTone: "warning",
    banner: {
      severity: "warning",
      text: (
        <>
          This network requires a sign in. The service cannot be reached until
          it completes.
          <br />
          <Link
            href="https://status.dnsfilter.com/"
            target="_blank"
            rel="noopener"
            sx={{
              color: "inherit",
              fontWeight: 600,
              textDecoration: "underline",
            }}
          >
            Status page
          </Link>
        </>
      ),
    },
  },
};

function Banner({
  text,
  severity,
}: {
  text: ReactNode;
  severity: BannerSeverity;
}) {
  if (severity === "default") {
    return (
      <Box
        sx={{
          px: 2,
          py: "4px",
          borderRadius: 1,
          fontSize: 14,
          backgroundColor: "action.selected",
          color: "text.primary",
        }}
      >
        {text}
      </Box>
    );
  }
  const tone = TONES[severity];
  return (
    <Box
      sx={(theme) => ({
        px: "12px",
        py: "6px",
        borderRadius: "10px",
        border: "1px solid",
        fontSize: 14,
        borderColor: tone.light.border,
        backgroundColor: tone.light.bg,
        color: tone.light.fg,
        ...theme.applyStyles("dark", {
          borderColor: tone.dark.border,
          backgroundColor: tone.dark.bg,
          color: tone.dark.fg,
        }),
      })}
    >
      {text}
    </Box>
  );
}

// The rest of the client's features, for the popup that lists them all, in
// the order they're shown under DNS Filtering.
const FEATURES = ["CyberSight", "SecureTransit", "AgentShield"];

/** One row of the popup's status list: dot, name, what it's doing, switch. */
function FeatureRow({
  label,
  status,
  tone,
  on,
  showSwitch,
  onChange,
}: {
  label: string;
  status: string;
  tone?: DotTone;
  on: boolean;
  showSwitch: boolean;
  /** Makes the switch controlled; without it the row just shows its state. */
  onChange?: (on: boolean) => void;
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
      {tone ? <StatusDot tone={tone} /> : <Box sx={{ width: 7 }} />}
      <Typography sx={{ fontSize: 14, fontWeight: 600, color: "text.primary" }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
        {status}
      </Typography>
      {showSwitch &&
        (onChange ? (
          <IosSwitch
            checked={on}
            onChange={(event) => onChange(event.target.checked)}
            disableRipple
            sx={{ ml: "auto" }}
          />
        ) : (
          // Uncontrolled: the row only has to show the affordance, and it
          // still flips when clicked.
          <IosSwitch defaultChecked={on} disableRipple sx={{ ml: "auto" }} />
        ))}
    </Box>
  );
}

// A feature the user can actually turn off here: the dot and the word follow
// the switch.
function ToggleFeature({
  label,
  showSwitch,
}: {
  label: string;
  showSwitch: boolean;
}) {
  const [on, setOn] = useState(true);
  return (
    <FeatureRow
      label={label}
      status={on ? "Active" : "Off"}
      tone={on ? "success" : "idle"}
      on={on}
      showSwitch={showSwitch}
      onChange={setOn}
    />
  );
}

function StatusDot({ tone }: { tone: DotTone }) {
  return (
    <Box
      sx={(theme) => ({
        width: 7,
        height: 7,
        flexShrink: 0,
        borderRadius: "50%",
        ...(tone === "idle"
          ? { backgroundColor: theme.vars.palette.Chip.defaultIconColor }
          : {
              backgroundColor:
                tone === "success" ? ACTIVE_LIGHT.fg : TONES[tone].light.fg,
              ...theme.applyStyles("dark", {
                backgroundColor:
                  tone === "success" ? ACTIVE_DARK.fg : TONES[tone].dark.fg,
              }),
            }),
      })}
    />
  );
}

// The two footer actions are the same pill, each hugging its own label rather
// than taking a width measured off the design.
function TrayAction({ children }: { children: ReactNode }) {
  return (
    <Button
      variant="outlined"
      color="secondary"
      size="small"
      sx={(theme) => ({
        ...outlinedFace(theme),
        py: "6px",
        px: "12px",
        borderRadius: "10px",
        fontSize: 13,
        fontWeight: 600,
      })}
    >
      {children}
    </Button>
  );
}

export function TrayPopup({
  state = "online",
  permissions = false,
  features = false,
  toggles,
}: {
  /** Which state the popup is showing. */
  state?: TrayState;
  /** Whether the user is allowed to turn filtering off — adds the switch at
   *  the end of the filtering row. */
  permissions?: boolean;
  /** List the client's other features under DNS Filtering. */
  features?: boolean;
  /** Which rows get a switch, by name. Defaults to every row when
   *  `permissions` is set — pass it to let the user toggle only some. */
  toggles?: string[];
}) {
  const { status, statusTone, filtering, filteringTone, banner, switchOff } =
    STATES[state];
  const toggleable =
    toggles ?? (permissions ? ["DNS Filtering", ...FEATURES] : []);

  return (
    <Box
      sx={(theme) => ({
        width: 360,
        // 16px around the whole popup rather than on each section, so the
        // banner and the rule are inset with everything else.
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        overflow: "hidden",
        borderRadius: "14px",
        border: 1,
        borderColor: "divider",
        backgroundColor: CLIENT_BG_LIGHT,
        boxShadow: "0px 8px 24px 0px rgba(0, 0, 0, 0.1)",
        ...theme.applyStyles("dark", { backgroundColor: CLIENT_BG_DARK }),
      })}
    >
      <Box
        sx={{
          pb: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* The app's own tile icon, exported from the design. */}
          <Box
            sx={{
              width: 21.694,
              height: 22,
              flexShrink: 0,
              overflow: "hidden",
              borderRadius: "4.889px",
              border: "0.306px solid",
              borderColor: "divider",
            }}
          >
            <Box
              component="img"
              src="/dnsfilter-one-app-icon.png"
              alt=""
              sx={{
                display: "block",
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </Box>
          <Typography
            sx={{ fontSize: 16, fontWeight: 600, color: "text.primary" }}
          >
            DNSFilter One
          </Typography>
        </Box>

        {/* The same chip the desktop window carries in its masthead. */}
        <StatusChip
          on={statusTone !== "idle"}
          tone={statusTone === "idle" ? "success" : statusTone}
          label={status}
          dot
        />
      </Box>

      {/* The brand colors, as a hairline under the header — the same rule the
          desktop window carries under its masthead. Bled past the popup's own
          inset, so it spans the whole width. */}
      <Box sx={{ mx: -2, mt: -2, height: "2px", background: ACCENT_RULE }} />

      {banner && <Banner text={banner.text} severity={banner.severity} />}

      <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* `filtering` is what filtering is actually doing — it changes with
            the connection, not just with the switch. */}
        <FeatureRow
          label="DNS Filtering"
          status={filtering}
          tone={filteringTone}
          on={!switchOff}
          showSwitch={toggleable.includes("DNS Filtering")}
        />
        {features &&
          FEATURES.map((feature) => (
            <ToggleFeature
              key={feature}
              label={feature}
              showSwitch={toggleable.includes(feature)}
            />
          ))}
      </Box>

      <Divider />

      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <TrayAction>Report a Problem</TrayAction>
        <TrayAction>Open DNSFilter One</TrayAction>
      </Box>
    </Box>
  );
}
