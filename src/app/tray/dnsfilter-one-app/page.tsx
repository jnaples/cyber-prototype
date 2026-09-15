// DNSFilter One — the desktop client's main window.
//
// Colors follow the tray popup's rule: theme tokens throughout, so the window
// works in light and dark, with the client's own ground (client-surface.ts)
// as the single exception. The product tints on the feature icons are brand
// art rather than UI color, so they stay fixed too.

import { Box, Button, Container, Typography } from "@mui/material";
import { useState } from "react";

import { Logo } from "@/components/logo/logo";
import { MaterialSymbol } from "@/components/material-symbol";

import {
  APP_BG_DARK,
  APP_BORDER,
  APP_SURFACE_DARK,
  CLIENT_BG_LIGHT,
} from "../client-surface";
import { IosSwitch } from "../ios-switch";

// The brand wash: a hairline under the masthead, and the ring around ONE.
const accentGradient = (angle: string) =>
  `linear-gradient(${angle}, #F306AE 0%, #00C8FD 50%, #3427FD 100%)`;

const ACCENT_RULE = accentGradient("90deg");
const ACCENT_RING = accentGradient("-45deg");

const FEATURES = [
  {
    name: "Roaming Client",
    icon: "language",
    tint: "linear-gradient(160deg, #22D3EE 0%, #0EA5E9 100%)",
    description: "Encrypted DNS with your DNSFilter policy, on any network.",
    on: true,
  },
  {
    name: "AgentShield",
    icon: "verified_user",
    tint: "linear-gradient(160deg, #6366F1 0%, #4338CA 100%)",
    description: "Agentic process detection, filtering, and identification.",
    on: true,
  },
  {
    name: "SecureTransit",
    icon: "lock",
    tint: "linear-gradient(160deg, #F472B6 0%, #EC4899 100%)",
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

/** A card on the client's ground: one surface, one hairline, 12px radius. */
function ClientCard({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={(theme) => ({
        p: 2,
        display: "flex",
        alignItems: "center",
        gap: 2,
        borderRadius: "16px",
        border: `1px solid ${APP_BORDER}`,
        backgroundColor: "background.paper",
        // The window paints its own surfaces — no elevation overlay.
        backgroundImage: "none",
        ...theme.applyStyles("dark", {
          backgroundColor: APP_SURFACE_DARK,
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

/** "Active" / "Not connected" — the status chip beside a feature's name. */
function StatusChip({ on }: { on: boolean }) {
  return (
    <Box
      sx={(theme) => ({
        px: 0.75,
        py: "1px",
        borderRadius: "6px",
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
        ...(on
          ? {
              backgroundColor: theme.vars.palette.Alert.successStandardBg,
              color: theme.vars.palette.Alert.successColor,
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
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
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
          border: 1,
          borderColor: "divider",
          backgroundColor: CLIENT_BG_LIGHT,
          ...theme.applyStyles("dark", { backgroundColor: APP_BG_DARK }),
        })}
      >
        <Box
          sx={{
            px: 3,
            py: 2,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            color: "text.primary",
          }}
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
                    backgroundColor: CLIENT_BG_LIGHT,
                    ...theme.applyStyles("dark", {
                      backgroundColor: APP_BG_DARK,
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
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {/* Everything the client knows about its own health, in one line. */}
          <ClientCard>
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
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                DNS is filtering through DNSFilter over encrypted DNS.
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="small"
              href="https://status.dnsfilter.com/"
              target="_blank"
              rel="noopener"
              endIcon={<MaterialSymbol name="north_east" size={16} />}
              sx={{ borderRadius: "999px", flexShrink: 0 }}
            >
              Status page
            </Button>
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
                tint="linear-gradient(160deg, #818CF8 0%, #4F46E5 100%)"
              />
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  sx={{ fontSize: 14, fontWeight: 700, color: "text.primary" }}
                >
                  DNSFilter Diagnostic Tool (DDT)
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Run the DNSFilter diagnostic checks — built in, runs right
                  here.
                </Typography>
              </Box>
              <Button variant="contained" size="small" sx={{ flexShrink: 0 }}>
                Run Diagnostics
              </Button>
            </ClientCard>
          </Box>
        </Box>

        {/* The resolvers in use, on a band of their own at the foot. */}
        <Box
          sx={(theme) => ({
            px: 3,
            py: 1.5,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 3,
            borderTop: `1px solid ${APP_BORDER}`,
            backgroundColor: "action.hover",
            ...theme.applyStyles("dark", {
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
                  fontSize: 14,
                  fontWeight: 600,
                  color: "text.primary",
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
