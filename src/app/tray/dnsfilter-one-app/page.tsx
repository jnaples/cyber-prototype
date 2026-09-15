// DNSFilter One — the desktop client's main window.
//
// Two screens live in the same chrome: the home list, and a feature's own
// screen behind it. The masthead changes with the screen; the brand hairline
// and the resolver band don't.

import { Box, Button, Container, IconButton, Typography } from "@mui/material";
import { useState } from "react";

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
    <ClientCard onClick={onOpen}>
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
      <MaterialSymbol
        name="chevron_right"
        size={20}
        sx={{ color: "text.secondary" }}
      />
    </ClientCard>
  );
}

function HomeScreen({ onOpen }: { onOpen: (name: string) => void }) {
  return (
    <Box
      sx={{ p: "20px", display: "flex", flexDirection: "column", gap: "20px" }}
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
          Service status:{" "}
          <Box component="span" sx={{ fontWeight: 700 }}>
            {SERVICE_STATUS}
          </Box>
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

      {FEATURES.map((feature) => (
        <FeatureRow
          key={feature.name}
          name={feature.name}
          icon={feature.icon}
          tint={feature.tint}
          description={feature.description}
          defaultOn={feature.on}
          onOpen={feature.screen ? () => onOpen(feature.name) : undefined}
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
              Run the DNSFilter diagnostic checks — built in, runs right here.
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
  );
}

export default function DnsfilterOneAppPage() {
  // Which feature's screen is open, if any.
  const [screen, setScreen] = useState<string | null>(null);
  const feature = FEATURES.find((f) => f.name === screen);

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
        <Box sx={{ height: "1px", background: ACCENT_RULE }} />

        {feature ? <RoamingClientScreen /> : <HomeScreen onOpen={setScreen} />}

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
