// Roaming Client — the screen behind the feature row of the same name.
//
// Where the home screen summarises, this one shows the connection itself: the
// switch that owns it, where the query enters and leaves the network, and the
// identity the device carries with it.

import { Box, Divider, Typography } from "@mui/material";
import { useState } from "react";

import { MaterialSymbol } from "@/components/material-symbol";

import { IosSwitch } from "../ios-switch";
import { ACTIVE_DARK, ACTIVE_LIGHT } from "./tokens";
import { ClientButton } from "./client-button";
import { ClientCard, SectionLabel } from "./ui";

// The endpoints the map plots, as percentages of the card so they stay put at
// any width. `you` is the device; `exit` is the resolver answering for it.
const YOU = { left: "52%", top: "48%" };
const EXIT = { left: "56%", top: "56%" };

const DEVICE_ID = "b62fb7810f4b4c98a5ccbd05874815e5";

/** A label pinned to a point on the map. */
function MapPin({
  title,
  place,
  accent,
  left,
  top,
}: {
  title: string;
  place: string;
  accent: string;
  left: string;
  top: string;
}) {
  return (
    <Box
      sx={{
        position: "absolute",
        left,
        top,
        transform: "translate(-50%, -50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "6px",
      }}
    >
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          backgroundColor: accent,
          boxShadow: `0 0 0 4px color-mix(in srgb, ${accent} 24%, transparent)`,
        }}
      />
      <Box
        sx={(theme) => ({
          px: 1,
          py: 0.5,
          borderRadius: "8px",
          border: "1px solid",
          borderColor: `color-mix(in srgb, ${accent} 40%, transparent)`,
          backgroundColor: theme.vars.palette.background.paper,
          whiteSpace: "nowrap",
          textAlign: "left",
        })}
      >
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: accent,
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{ fontSize: 14, fontWeight: 700, color: "text.primary" }}
        >
          {place}
        </Typography>
      </Box>
    </Box>
  );
}

/** One of the map's corner readouts. */
function MapTag({ children, accent }: { children: string; accent?: string }) {
  return (
    <Box
      sx={(theme) => ({
        px: 1,
        py: 0.5,
        display: "flex",
        alignItems: "center",
        gap: "6px",
        borderRadius: "999px",
        border: "1px solid",
        borderColor: "color-mix(in srgb, currentColor 30%, transparent)",
        backgroundColor: theme.vars.palette.background.paper,
        fontFamily: "monospace",
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.06em",
        whiteSpace: "nowrap",
        color: accent ?? theme.vars.palette.text.secondary,
      })}
    >
      {accent && (
        <Box
          sx={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            backgroundColor: accent,
          }}
        />
      )}
      {children}
    </Box>
  );
}

export function RoamingClientScreen() {
  const [on, setOn] = useState(true);

  return (
    <Box
      sx={{ p: "20px", display: "flex", flexDirection: "column", gap: "20px" }}
    >
      {/* The switch that owns the whole screen. */}
      <ClientCard tone={on ? "success" : "default"}>
        <Box
          sx={(theme) => ({
            width: 44,
            height: 44,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            backgroundColor: on ? ACTIVE_LIGHT.bg : "action.selected",
            color: on ? ACTIVE_LIGHT.fg : "text.secondary",
            ...theme.applyStyles("dark", {
              backgroundColor: on
                ? ACTIVE_DARK.bg
                : theme.vars.palette.action.selected,
              color: on ? ACTIVE_DARK.fg : theme.vars.palette.text.secondary,
            }),
          })}
        >
          <MaterialSymbol name={on ? "verified_user" : "gpp_maybe"} size={22} />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            sx={{ fontSize: 18, fontWeight: 700, color: "text.primary" }}
          >
            {on ? "On" : "Off"}
          </Typography>
          <Typography
            variant="body2"
            sx={{ mt: "4px", color: "text.secondary" }}
          >
            {on
              ? "Protected — DNS is encrypted and filtered by DNSFilter"
              : "Unprotected — queries leave this device in the clear"}
          </Typography>
        </Box>
        <IosSwitch
          checked={on}
          onChange={(event) => setOn(event.target.checked)}
          disableRipple
        />
      </ClientCard>

      <Box>
        <SectionLabel>Resolver location</SectionLabel>
        <Box
          sx={(theme) => ({
            position: "relative",
            height: 320,
            overflow: "hidden",
            borderRadius: "16px",
            border: "1px solid",
            borderColor: "divider",
            // The app's own map art, zoomed onto the eastern seaboard.
            backgroundImage: "url(/map_bg_light.svg)",
            backgroundSize: "420%",
            backgroundPosition: "22% 34%",
            ...theme.applyStyles("dark", {
              backgroundImage: "url(/map_bg_dark.svg)",
            }),
          })}
        >
          {/* The link's own tint, laid over the map so the pins read. */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(135deg, rgba(40, 212, 145, 0.16) 0%, rgba(4, 4, 6, 0.55) 62%)",
            }}
          />

          <Box
            sx={{
              position: "absolute",
              inset: 0,
              p: "12px",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            <MapTag accent={ACTIVE_DARK.fg}>ENCRYPTED DNS (DoH)</MapTag>
            <MapTag accent={ACTIVE_DARK.fg}>
              CHACHA20-POLY1305 : 1A7C2F8A13
            </MapTag>
          </Box>

          <MapPin
            title="YOU ARE HERE"
            place="Bridgeport, Connecticut"
            accent="#6FD0FF"
            left={YOU.left}
            top={YOU.top}
          />
          <MapPin
            title="EXIT"
            place="DNSFilter · New York, NY"
            accent={ACTIVE_DARK.fg}
            left={EXIT.left}
            top={EXIT.top}
          />

          {/* How far the query actually travels. */}
          <Box
            sx={(theme) => ({
              position: "absolute",
              left: "12px",
              bottom: "12px",
              px: 1.5,
              py: 1,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              borderRadius: "999px",
              border: "1px solid",
              borderColor: "divider",
              backgroundColor: theme.vars.palette.background.paper,
            })}
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: "#6FD0FF",
              }}
            />
            <Typography
              sx={{
                fontFamily: "monospace",
                fontSize: 12,
                fontWeight: 700,
                color: "text.primary",
              }}
            >
              86 km
            </Typography>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: ACTIVE_DARK.fg,
              }}
            />
          </Box>
        </Box>
      </Box>

      <Box>
        <SectionLabel>Device identity (EDNS0)</SectionLabel>
        <ClientCard>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Box
                sx={(theme) => ({
                  display: "inline-flex",
                  color: ACTIVE_LIGHT.fg,
                  ...theme.applyStyles("dark", { color: ACTIVE_DARK.fg }),
                })}
              >
                <MaterialSymbol name="verified_user" size={18} />
              </Box>
              <Typography
                sx={{ fontSize: 14, fontWeight: 700, color: "text.primary" }}
              >
                Active — per-device
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{ mt: "4px", color: "text.secondary" }}
            >
              Queries carry this machine&apos;s eDNS0 identity (option 65012),
              so your DNSFilter policy follows the device on any network.
            </Typography>

            <Divider sx={{ my: 1.5 }} />

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="body2" sx={{ color: "text.primary" }}>
                Device id
              </Typography>
              <Typography
                sx={{
                  fontFamily: "monospace",
                  fontSize: 14,
                  // teal 200, the anchor the client marks identity with.
                  color: "#6FD0FF",
                  wordBreak: "break-all",
                }}
              >
                {DEVICE_ID}
              </Typography>
            </Box>

            <ClientButton
              variant="contained"
              disableElevation
              startIcon={<MaterialSymbol name="qr_code_2" size={18} />}
              sx={{ mt: 2 }}
            >
              Enroll your mobile device…
            </ClientButton>
          </Box>
        </ClientCard>
      </Box>
    </Box>
  );
}
