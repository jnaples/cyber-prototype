// The DNSFilter One tray popup, from the Windows Tray Icon Status design.
// Sizes are the design's own (a 360px popup, a 328px rule); the colors are
// theme tokens apart from the popup's own ground.
//
// Shared by the tray pages, and the place the state props will land as the
// variations are built out.

import {
  Alert,
  Box,
  ButtonBase,
  Divider,
  Link,
  Switch,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useState, type ReactNode } from "react";

// The only values that aren't theme tokens: the tray popup's own ground,
// which is OS chrome rather than an app surface.
const POPUP_BG_LIGHT = "#dadae1";
const POPUP_BG_DARK = "#121212";

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
  | "incident";

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
    status: "Not protected",
    statusTone: "warning",
    filtering: "Not filtering",
    filteringTone: "warning",
    banner: {
      severity: "warning",
      text: (
        <>
          DNSFilter is reporting an incident. Filtering may be interrupted until
          it&apos;s resolved.
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
};

const IosSwitch = styled(Switch)(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
  "&& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(16px)",
      color: theme.vars.palette.common.white,
      "& + .MuiSwitch-track": {
        opacity: 1,
        border: 0,
        backgroundColor: theme.vars.palette.primary.main,
      },
    },
  },
  "&& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 22,
    height: 22,
  },
  "&& .MuiSwitch-track": {
    opacity: 1,
    borderRadius: 13,
    backgroundColor: theme.vars.palette.action.disabled,
  },
  ...theme.applyStyles("dark", {
    "&& .MuiSwitch-switchBase.Mui-checked": {
      color: theme.vars.palette.common.white,
      "& + .MuiSwitch-track": {
        backgroundColor: theme.vars.palette.primary.light,
      },
    },
  }),
}));

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
  return (
    <Alert severity={severity} icon={false} sx={{ py: 0.5, fontSize: 14 }}>
      {text}
    </Alert>
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
        backgroundColor:
          tone === "idle"
            ? theme.vars.palette.Chip.defaultIconColor
            : theme.vars.palette[tone].main,
      })}
    />
  );
}

// The two footer actions are the same pill, each hugging its own label rather
// than taking a width measured off the design.
function TrayAction({ children }: { children: ReactNode }) {
  return (
    <ButtonBase
      sx={{
        py: "6px",
        px: "12px",
        borderRadius: "8px",
        backgroundColor: "action.selected",
        color: "text.primary",
        fontSize: 13,
        fontWeight: 600,
        "&:hover": { backgroundColor: "action.focus" },
      }}
    >
      {children}
    </ButtonBase>
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
        backgroundColor: POPUP_BG_LIGHT,
        boxShadow: "0px 8px 24px 0px rgba(0, 0, 0, 0.1)",
        ...theme.applyStyles("dark", { backgroundColor: POPUP_BG_DARK }),
      })}
    >
      <Box
        sx={{
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

        <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <StatusDot tone={statusTone} />
          <Typography
            sx={{ fontSize: 12, fontWeight: 600, color: "text.secondary" }}
          >
            {status}
          </Typography>
        </Box>
      </Box>

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
