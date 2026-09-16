// Roaming Client — the screen behind the feature row of the same name.
//
// Where the home screen summarises, this one shows the connection itself: the
// switch that owns it, where the query enters and leaves the network, and the
// identity the device carries with it.

import { Box, Divider, Typography } from "@mui/material";
import { useMemo, useState } from "react";

import { MaterialSymbol } from "@/components/material-symbol";

import { DottedMap } from "../dotted-map";
import { viewProject, type MapPoint, type MapView } from "../map-projection";
import { IosSwitch } from "../ios-switch";
import { useIpLocation } from "../use-ip-location";
import { ACTIVE_DARK, ACTIVE_LIGHT } from "./tokens";
import { ClientButton } from "./client-button";
import { ClientCard, SectionLabel } from "./ui";

// The resolver answering for this device. Where the device itself is comes
// from the browser's own IP, so it moves with whoever opens the window.
const EXIT = { lat: 40.7128, lon: -74.006 };

const DEVICE_ID = "b62fb7810f4b4c98a5ccbd05874815e5";

/** A label pinned to a coordinate on the map. */
function MapPin({
  title,
  place,
  accent,
  point,
  view,
  side = "top",
}: {
  title: string;
  place: string;
  accent: string;
  point: MapPoint;
  view: MapView;
  /** Which side of the dot the label hangs off. */
  side?: "top" | "bottom";
}) {
  const { x, y } = viewProject(point, view);
  return (
    <Box
      sx={{
        position: "absolute",
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        transform:
          side === "top" ? "translate(-50%, -100%)" : "translate(-50%, 0)",
        pointerEvents: "none",
        display: "flex",
        flexDirection: side === "top" ? "column-reverse" : "column",
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
          sx={{ fontSize: 12, fontWeight: 700, color: "text.primary" }}
        >
          {place}
        </Typography>
      </Box>
    </Box>
  );
}

/** One of the map's corner readouts. Same greens as the status chips, so a
 *  readout on the map reads as the same kind of "good" as one in a card. */
function MapTag({
  children,
  dot = false,
}: {
  children: string;
  /** Lead with a dot in the tag's own color. */
  dot?: boolean;
}) {
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
        borderColor: "color-mix(in srgb, currentColor 25%, transparent)",
        fontFamily: "monospace",
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.06em",
        whiteSpace: "nowrap",
        color: ACTIVE_LIGHT.fg,
        backgroundColor: ACTIVE_LIGHT.bg,
        ...theme.applyStyles("dark", {
          color: ACTIVE_DARK.fg,
          backgroundColor: ACTIVE_DARK.bg,
        }),
      })}
    >
      {dot && (
        <Box
          sx={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            backgroundColor: "currentColor",
          }}
        />
      )}
      {children}
    </Box>
  );
}

export function RoamingClientScreen() {
  const [on, setOn] = useState(true);
  const here = useIpLocation();
  // Close enough that the states around this browser read as separate
  // shapes rather than a coastline.
  const view = useMemo(
    () => ({ zoom: 10, center: { lat: here.lat, lon: here.lon } }),
    [here.lat, here.lon],
  );

  return (
    <Box
      sx={{ p: "20px", display: "flex", flexDirection: "column", gap: "20px" }}
    >
      {/* The switch that owns the whole screen. */}
      <ClientCard tone={on ? "success" : "default"}>
        <Box
          sx={(theme) => ({
            width: 40,
            height: 40,
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
          sx={{
            overflow: "hidden",
            borderRadius: "16px",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <DottedMap view={view}>
            {/* The link's own tint, so the pins read against the dots. */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(135deg, rgba(40, 212, 145, 0.10) 0%, rgba(4, 4, 6, 0.28) 62%)",
                pointerEvents: "none",
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
              <MapTag dot>ENCRYPTED DNS (DoH)</MapTag>
              <MapTag>CHACHA20-POLY1305 : 1A7C2F8A13</MapTag>
            </Box>

            {/* Where the browser's own IP puts it, and where the query leaves
                the network. */}
            <MapPin
              title="YOU ARE HERE"
              place={here.place}
              accent="#6FD0FF"
              point={here}
              view={view}
            />
            <MapPin
              title="EXIT"
              place="DNSFilter · New York, NY"
              accent={ACTIVE_DARK.fg}
              point={EXIT}
              view={view}
              side="bottom"
            />
          </DottedMap>
        </Box>
      </Box>

      <Box>
        <SectionLabel>Device identity (EDNS0)</SectionLabel>
        <ClientCard>
          {/* One rhythm down the card rather than a margin per element. */}
          <Box
            sx={{
              minWidth: 0,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
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
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Queries carry this machine&apos;s eDNS0 identity (option 65012),
              so your DNSFilter policy follows the device on any network.
            </Typography>

            <Divider />

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
              sx={{ alignSelf: "flex-start" }}
            >
              Enroll your mobile device…
            </ClientButton>
          </Box>
        </ClientCard>
      </Box>
    </Box>
  );
}
